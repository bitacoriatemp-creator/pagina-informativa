"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent as MouseEventReact,
    type PointerEvent as PointerEventReact,
} from "react";
import { motion } from "framer-motion";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
    MINIMO_RESENAS,
    fechaRelativa,
    formatearPromedio,
    iniciales,
    lineaDeObra,
    type Resena,
    type Resenas,
} from "@/lib/resenasFormato";

/* ══════════════════════════════════════════════════════════════
   ResenasSection — "cinta de obra" (JC 2026-09-25)
   ──────────────────────────────────────────────────────────────
   Reseñas reales de usuarios de la app, en una cinta horizontal entre
   el hero y los planes. Se pinta solo cuando page.tsx trae datos
   (obtenerResenas() devolvió al menos una publicada; JC 2026-10-02:
   antes pedía 5, ahora la caja aparece desde la primera reseña).

   Lo que la hace creíble, y por eso no se toca a la ligera:
     - foto de Google o iniciales, nombre abreviado, rol y tipo de obra;
     - estrellas tal cual (también las de 3 y 4) y la respuesta del equipo;
     - el conteo honesto en la cabecera ("4.7 · 12 reseñas");
     - la fecha relativa ("hace 3 semanas").

   Sin ningún enlace a la app ni "Deja tu reseña": el sitio no autentica
   (docs/DECISIONES.md, 2026-09-12) y la reseña se pide dentro de la app,
   después de la prueba gratis. Sin autoplay: el dedo o las flechas.
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";

/* Píxeles de movimiento del ratón a partir de los cuales es arrastre y
   no clic: por debajo, nada cambia y el clic llega a donde iba. */
const UMBRAL_ARRASTRE = 4;

/* Fundido de los extremos de la cinta (JC 2026-09-25): el scrollport termina
   en el borde del contenedor de 1280px, no de la ventana, y sin esto la
   tarjeta asomada se corta en seco en medio del mismo fondo. */
const MASCARA_CINTA = "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)";

/* ── Animador horizontal (JC 2026-09-25) ──
   JC: "se clava de golpe, como si hubiera un límite por cada scroll". Eran dos
   cosas: snap-x snap-mandatory imantaba cada gesto a una tarjeta, y la rueda y
   las flechas iban con el scroll nativo, que en Windows con ratón avanza a
   saltos. Ahora no hay imán y la rueda, el trackpad, las flechas y la inercia
   del arrastre pasan por un solo animador al estilo de Lenis: una posición
   flotante en memoria, un destino y un bucle de requestAnimationFrame que
   acerca la una al otro. La posición no se relee de scrollLeft en cada cuadro
   porque el navegador lo redondea: con pasos de menos de un píxel la cinta se
   quedaba a unos píxeles del destino sin llegar nunca. */

/* Un cuadro a 60 Hz: la unidad en la que están pensados los factores. */
const CUADRO_MS = 1000 / 60;
/* Rueda y flechas recorren en cada cuadro de 60 Hz este tanto de lo que falta:
   el lerp de Lenis (0.1) un pelo más vivo, para que la cinta no se sienta más
   lenta que la página. */
const LERP_RUEDA = 0.12;
/* La inercia del arrastre recorre velocidad × INERCIA_MS. Su lerp sale de esa
   misma constante de tiempo para que el primer cuadro después de soltar vaya a
   la velocidad del ratón: con 0.12 la cinta arrancaba al doble y se notaba un
   empujón al soltar. Después frena sola, como el momentum de un teléfono. */
const INERCIA_MS = 300;
const LERP_INERCIA = 1 - Math.exp(-CUADRO_MS / INERCIA_MS);
/* La velocidad al soltar se mide con los movimientos de los últimos 100 ms: un
   arrastre que se detuvo antes de soltar no sale disparado. */
const VENTANA_VELOCIDAD_MS = 100;
/* A menos de medio píxel del destino la diferencia ya no se ve: se para. */
const PARADA_PX = 0.5;
/* Rueda que cuenta por líneas (deltaMode 1, Firefox con ratón). */
const PX_POR_LINEA = 16;

const ahora = () => window.performance.now();

function crearAnimador(cintaDe: () => HTMLElement | null, alTerminar: () => void) {
    let posicion = 0;
    let destino = 0;
    let inercia = false;
    /* Factor de la animación en curso: LERP_RUEDA para rueda y flechas; en la
       inercia, el que conserve la velocidad al soltar (ver lanzar). JC 2026-09-25 */
    let lerpActual = LERP_RUEDA;
    let rafId: number | null = null;
    let ultimoCuadro: number | null = null;
    /* Último intervalo real entre cuadros (JC 2026-09-25): el primer cuadro de
       cada animación no tiene con qué medirse y usa este. Contarlo siempre como
       uno de 60 Hz daba un empujón a 120/144 Hz (2.3 veces la velocidad del
       ratón en el primer cuadro de la inercia). */
    let intervalo = CUADRO_MS;
    let consultaReducida: MediaQueryList | null | undefined;

    /* Con "Reducir movimiento" no hay animación: la persona pidió no verla.
       La consulta se guarda (matches es vivo) para no crearla en cada rueda. */
    const reducido = () => {
        if (consultaReducida === undefined) {
            consultaReducida = typeof window.matchMedia === "function"
                ? window.matchMedia("(prefers-reduced-motion: reduce)")
                : null;
        }
        return consultaReducida?.matches ?? false;
    };

    const acotar = (valor: number, cinta: HTMLElement) =>
        Math.min(Math.max(valor, 0), Math.max(0, cinta.scrollWidth - cinta.clientWidth));

    const cancelar = () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = null;
        ultimoCuadro = null;
    };

    const sincronizar = () => {
        const cinta = cintaDe();
        if (cinta) posicion = destino = cinta.scrollLeft;
    };

    const cuadro = (t: number) => {
        rafId = null;
        const cinta = cintaDe();
        if (!cinta) return;
        /* El factor depende del tiempo real entre cuadros y no del número de
           cuadros: a 60, 120 o 144 Hz la cinta tarda lo mismo en llegar. El
           primer cuadro usa el último intervalo medido (el reloj del rAF puede
           ir por detrás del evento que arrancó la animación, así que t no
           sirve). Un intervalo de 50 ms o más es una pausa o un cambio de
           pestaña, no la tasa de la pantalla: no se guarda. JC 2026-09-25 */
        const medido = ultimoCuadro === null ? null : t - ultimoCuadro;
        if (medido !== null && medido > 0 && medido < 50) intervalo = medido;
        const dt = medido === null ? intervalo : Math.max(0, medido);
        ultimoCuadro = t;
        /* Se vuelve a acotar por si la ventana cambió de ancho a media animación. */
        destino = acotar(destino, cinta);
        posicion += (destino - posicion) * (1 - Math.pow(1 - lerpActual, dt / CUADRO_MS));
        if (Math.abs(destino - posicion) < PARADA_PX) {
            posicion = destino;
            ultimoCuadro = null;
        } else {
            rafId = window.requestAnimationFrame(cuadro);
        }
        cinta.scrollLeft = posicion;
        if (rafId === null) alTerminar();
    };

    const animarHacia = (nuevo: number, conInercia: boolean, factor: number) => {
        const cinta = cintaDe();
        if (!cinta) return;
        destino = acotar(nuevo, cinta);
        inercia = conInercia;
        lerpActual = factor;
        if (reducido()) {
            cancelar();
            posicion = destino;
            cinta.scrollLeft = posicion;
            alTerminar();
            return;
        }
        if (rafId === null) rafId = window.requestAnimationFrame(cuadro);
    };

    return {
        animando: () => rafId !== null,
        posicion: () => posicion,
        cancelar,
        sincronizar,
        /** De dónde parte un gesto nuevo. Quieta: de scrollLeft (pudo moverla el
         *  teclado o el dedo). Con rueda o flechas en curso: del destino, así dos
         *  ruedas seguidas se suman como en Lenis. Con inercia: de donde va, porque
         *  el destino de la inercia es imaginario y sumarle rueda la mandaría lejos. */
        partida(): number {
            if (rafId === null) sincronizar();
            else if (!inercia) return destino;
            return posicion;
        },
        /** Frena en seco donde va y devuelve esa posición, sin brincos. */
        detener(): number {
            if (rafId === null) sincronizar();
            cancelar();
            destino = posicion;
            return posicion;
        },
        /** Mueve la cinta ya, sin animar (el arrastre va pegado al ratón). */
        fijar(valor: number) {
            const cinta = cintaDe();
            if (!cinta) return;
            cancelar();
            posicion = destino = acotar(valor, cinta);
            cinta.scrollLeft = posicion;
        },
        ir: (nuevo: number) => animarHacia(nuevo, false, LERP_RUEDA),
        /** Inercia al soltar un arrastre. Con "Reducir movimiento" no hay: saltar
         *  de golpe al destino de la inercia sería peor que quedarse quieta. */
        lanzar(velocidad: number) {
            const cinta = cintaDe();
            if (!cinta || reducido() || Math.abs(velocidad * INERCIA_MS) < PARADA_PX) return;
            /* Soltar cerca del extremo (JC 2026-09-25): el destino queda acotado y,
               con LERP_INERCIA, el primer cuadro recorría una fracción de un camino
               más corto; la cinta pasaba de golpe de la velocidad del ratón a un
               tercio, justo el "se clava" de la queja. Con el destino acotado el
               factor se calcula para que el primer cuadro vaya a la velocidad del
               ratón, y de ahí frena hasta el borde. */
            const libre = velocidad * INERCIA_MS;
            const acotado = acotar(posicion + libre, cinta);
            const falta = Math.abs(acotado - posicion);
            const factor = falta > 0 && falta < Math.abs(libre)
                ? Math.min(1, (Math.abs(velocidad) * CUADRO_MS) / falta)
                : LERP_INERCIA;
            animarHacia(acotado, true, factor);
        },
    };
}

type Muestra = { t: number; pos: number };

/* Velocidad de la cinta (px/ms) entre la muestra más vieja de la ventana y el
   momento de soltar. Si no hay muestras recientes, el ratón ya estaba quieto. */
function velocidadAlSoltar(muestras: Muestra[], pos: number, t: number) {
    const primera = muestras.find((m) => t - m.t <= VENTANA_VELOCIDAD_MS);
    if (!primera || t <= primera.t) return 0;
    return (pos - primera.pos) / (t - primera.t);
}

/* ── Estrellas ──
   `valor` puede ser fraccionario (el promedio): la fila rellena se recorta
   al porcentaje encima de la fila vacía, así 4.7 se ve como 4.7 y no como
   5 redondeado, que es justo lo que no queremos aparentar. */
function Estrellas({ valor, tamano, etiqueta }: { valor: number; tamano: number; etiqueta: string }) {
    /* Redondeado a una décima: 4.7/5 en coma flotante no da un 94 limpio. */
    const porcentaje = Math.round(Math.max(0, Math.min(100, (valor / 5) * 100)) * 10) / 10;
    const cinco = [0, 1, 2, 3, 4];
    return (
        <span role="img" aria-label={etiqueta} className="relative inline-flex leading-none">
            <span className="flex gap-0.5 text-white/20" aria-hidden="true">
                {cinco.map((i) => <Star key={i} size={tamano} strokeWidth={1.5} className="shrink-0" />)}
            </span>
            <span
                className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden"
                style={{ width: `${porcentaje}%`, color: BRONZE }}
                aria-hidden="true"
            >
                {cinco.map((i) => <Star key={i} size={tamano} strokeWidth={1.5} fill="currentColor" className="shrink-0" />)}
            </span>
        </span>
    );
}

/* ── Foto o iniciales ── */
function Avatar({ resena }: { resena: Resena }) {
    /* Si la foto de Google no carga (URL caducada, cuenta cerrada) se pasa a
       iniciales en vez de dejar el icono roto del navegador. */
    const [fotoRota, setFotoRota] = useState(false);

    if (resena.foto_url && !fotoRota) {
        return (
            /* eslint-disable-next-line @next/next/no-img-element -- foto externa de Google: <img> a secas
               para no dar de alta el host en next.config (images.unoptimized ya está) y para poder
               mandar referrerPolicy, que evita que Google reciba la URL de la portada. */
            <img
                src={resena.foto_url}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                draggable={false}
                onError={() => setFotoRota(true)}
                className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-ui text-[15px] font-semibold tracking-wider"
            style={{ background: `${BRONZE}26`, border: `1px solid ${BRONZE}66`, color: BRONZE }}
        >
            {iniciales(resena.nombre)}
        </span>
    );
}

/* ── Tarjeta ── */
function TarjetaResena({ resena }: { resena: Resena }) {
    const obra = lineaDeObra(resena);
    const fecha = fechaRelativa(resena.publicada_at);

    return (
        <article
            className="flex w-[280px] shrink-0 flex-col gap-3 rounded-[20px] p-5 sm:w-[300px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
            <header className="flex items-center gap-3">
                <Avatar resena={resena} />
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-white/90">{resena.nombre}</p>
                    {/* Sin truncate: con "Director de obra · Infraestructura, Guadalajara" la ciudad
                        no cabía en 188 px y era justo lo que hace creíble la reseña; a dos
                        renglones cabe todo (la más larga mide ~276 px). JC 2026-09-25 */}
                    {obra && <p className="text-[12px] leading-snug text-white/55">{obra}</p>}
                </div>
            </header>

            <Estrellas valor={resena.estrellas} tamano={14} etiqueta={`${resena.estrellas} de 5 estrellas`} />

            {/* Tal cual lo escribió, sin recortar: la altura de la tarjeta varía. */}
            <p className="text-[14px] leading-relaxed text-white/80">{resena.texto}</p>

            {resena.respuesta_equipo && (
                <div className="pl-3 text-[13px] leading-relaxed text-white/60" style={{ borderLeft: `2px solid ${BRONZE}99` }}>
                    <span className="font-semibold" style={{ color: BRONZE }}>Equipo BitacorIA:</span>{" "}
                    {resena.respuesta_equipo}
                </div>
            )}

            {/* Sin mt-auto: la cinta va con items-start y la tarjeta mide su contenido;
                empujar el pie al fondo solo abriría hueco. JC 2026-09-25 */}
            <footer className="flex items-center justify-between gap-2 pt-1 text-[11px] text-white/55">
                <span className="inline-flex items-center gap-1">
                    <BadgeCheck size={13} strokeWidth={2} style={{ color: BRONZE }} aria-hidden="true" />
                    Cuenta verificada
                </span>
                {/* suppressHydrationWarning: el HTML se genera con caché (5 min desde
                    JC 2026-10-02; antes una hora) y
                    "hace 6 días" puede volverse "hace 1 semana" al hidratar. Es texto
                    grueso a propósito; no vale la pena un aviso en consola por eso. */}
                {fecha && (
                    <time dateTime={resena.publicada_at} suppressHydrationWarning>
                        {fecha}
                    </time>
                )}
            </footer>
        </article>
    );
}

/* ── Sección ── */
export default function ResenasSection({ resenas }: { resenas: Resenas }) {
    const cintaRef = useRef<HTMLDivElement>(null);
    /* Envoltura de la cinta y las flechas: la rueda se escucha aquí (ver abajo). */
    const envolturaRef = useRef<HTMLDivElement>(null);
    /* Arrastre con el ratón en escritorio. En touch no se toca nada: el dedo
       ya desplaza la cinta solo (por eso se filtra por pointerType). `muestras`
       guarda por dónde iba la cinta y cuándo, para la inercia al soltar. */
    const arrastre = useRef<{ x: number; base: number; movido: boolean; muestras: Muestra[] } | null>(null);
    const ignorarClic = useRef(false);
    const [arrastrando, setArrastrando] = useState(false);
    /* Flechas: arrancan ocultas y se miden al montar. Así no aparece una
       flecha que luego se esconde cuando todo cabe en pantalla. */
    const [flechas, setFlechas] = useState({ izquierda: false, derecha: false });

    const medir = useCallback(() => {
        const cinta = cintaRef.current;
        if (!cinta) return;
        const maximo = cinta.scrollWidth - cinta.clientWidth;
        const izquierda = cinta.scrollLeft > 2;
        const derecha = cinta.scrollLeft < maximo - 2;
        setFlechas((previo) =>
            previo.izquierda === izquierda && previo.derecha === derecha ? previo : { izquierda, derecha }
        );
    }, []);

    /* Un animador por cinta; al terminar vuelve a medir las flechas (el scroll
       del navegador también las mide, pero llega un cuadro después). */
    const [animador] = useState(() => crearAnimador(() => cintaRef.current, medir));

    useEffect(() => {
        medir();
        window.addEventListener("resize", medir);
        return () => window.removeEventListener("resize", medir);
    }, [medir]);

    /* Al desmontar no puede quedar un cuadro pendiente escribiendo en una cinta
       que ya no existe. */
    useEffect(() => () => animador.cancelar(), [animador]);

    /* Rueda y trackpad en escritorio (JC 2026-09-25). Lenis suaviza la rueda de
       toda la página. Antes la cinta llevaba data-lenis-prevent-wheel, que le
       quitaba a Lenis TAMBIÉN la rueda vertical: al pasar el cursor por la cinta
       a media página el scroll se volvía nativo de golpe y, al salir, Lenis
       retomaba desde donde se había quedado y la página brincaba. Por eso solo
       se toma el gesto horizontal (trackpad de lado o Shift + rueda) y solo si la
       cinta puede avanzar hacia ese lado; la rueda vertical, y la horizontal en
       el extremo, siguen siendo de Lenis y del navegador como en el resto de la
       landing. El gesto que sí se toma se cancela (preventDefault: el scroll
       nativo iba a saltos) y se marca con lenisStopPropagation para que Lenis lo
       descarte sin tocar la página; lo mueve el animador. El oyente no puede ser
       pasivo porque llama a preventDefault (por eso addEventListener y no el
       onWheel de React, que es pasivo).
       El oyente va en la envoltura y no en la cinta (JC 2026-09-25): las flechas
       son hermanas de la cinta, encima de ella, y con el cursor sobre una la
       rueda no llegaba a la cinta; quedaba un punto muerto de 40x40 donde el
       gesto no hacía nada. Lo de la cinta llega igual, por burbuja. */
    useEffect(() => {
        const envoltura = envolturaRef.current;
        if (!envoltura) return;
        const alRodar = (e: WheelEvent) => {
            const cinta = cintaRef.current;
            if (!cinta) return;
            /* Ctrl + rueda es zoom (y el pellizco del trackpad llega así); mientras
               se arrastra, manda el ratón. */
            if (e.ctrlKey || arrastre.current) return;
            const soloShift = e.shiftKey && e.deltaX === 0;
            const horizontal = soloShift ? e.deltaY : e.deltaX;
            const vertical = soloShift ? 0 : e.deltaY;
            if (horizontal === 0 || Math.abs(horizontal) < Math.abs(vertical)) return;
            const px = horizontal * (e.deltaMode === 1 ? PX_POR_LINEA : e.deltaMode === 2 ? cinta.clientWidth : 1);
            /* A media animación el gesto siempre es de la cinta: si se soltara al
               navegador, su scroll nativo pelearía con el cuadro siguiente. */
            if (!animador.animando()) {
                const desde = animador.partida();
                const maximo = cinta.scrollWidth - cinta.clientWidth;
                if (px > 0 ? desde >= maximo - 1 : desde <= 1) return;
            }
            e.preventDefault();
            (e as WheelEvent & { lenisStopPropagation?: boolean }).lenisStopPropagation = true;
            animador.ir(animador.partida() + px);
        };
        envoltura.addEventListener("wheel", alRodar, { passive: false });
        return () => envoltura.removeEventListener("wheel", alRodar);
    }, [animador]);

    /* Flechas: el mismo animador que la rueda (antes scrollBy smooth, que el
       navegador anima a su manera y a saltos con ratón en Windows). Dos clics
       seguidos se suman porque el segundo parte del destino. */
    const desplazar = (direccion: -1 | 1) => {
        const cinta = cintaRef.current;
        if (!cinta) return;
        animador.ir(animador.partida() + direccion * Math.max(cinta.clientWidth * 0.8, 300));
    };

    /* Scroll nativo (teclado, dedo) o de la animación: si nada anima ni arrastra,
       la posición del animador se pone al día para que el próximo gesto parta de
       donde quedó la cinta y no de donde la dejó él. */
    const alDesplazarse = () => {
        if (!animador.animando() && !arrastre.current) animador.sincronizar();
        medir();
    };

    const alBajarPuntero = (e: PointerEventReact<HTMLDivElement>) => {
        /* Cualquier clic o toque frena en seco la animación donde va (como tocar
           una lista que corre en el teléfono); el dedo sigue con el scroll nativo. */
        const desde = animador.detener();
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        arrastre.current = { x: e.clientX, base: desde, movido: false, muestras: [{ t: ahora(), pos: desde }] };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const alMoverPuntero = (e: PointerEventReact<HTMLDivElement>) => {
        const actual = arrastre.current;
        if (!actual) return;
        const dx = e.clientX - actual.x;
        if (!actual.movido) {
            if (Math.abs(dx) < UMBRAL_ARRASTRE) return;
            actual.movido = true;
            /* Mientras se arrastra, fuera la selección de texto y el cursor pasa
               a mano cerrada. */
            setArrastrando(true);
        }
        /* Pegado al ratón, 1:1 y sin animar: animar aquí se sentiría chicloso. */
        animador.fijar(actual.base - dx);
        const t = ahora();
        actual.muestras.push({ t, pos: animador.posicion() });
        while (actual.muestras.length > 1 && t - actual.muestras[0].t > VENTANA_VELOCIDAD_MS) actual.muestras.shift();
    };

    const alSoltarPuntero = (e: PointerEventReact<HTMLDivElement>) => {
        const actual = arrastre.current;
        if (!actual) return;
        arrastre.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        if (!actual.movido) return;
        /* Al soltar, el navegador dispara un click en lo que quedó bajo el
           ratón. Se traga solo ese: un clic sin arrastre pasa intacto. */
        ignorarClic.current = true;
        setArrastrando(false);
        if (e.type === "pointercancel") return;
        /* Inercia: la cinta sigue a la velocidad con que se soltó y frena sola,
           en vez de pararse en seco en cuanto se suelta el botón. */
        animador.fijar(actual.base - (e.clientX - actual.x));
        animador.lanzar(velocidadAlSoltar(actual.muestras, animador.posicion(), ahora()));
    };

    const alClicCaptura = (e: MouseEventReact<HTMLDivElement>) => {
        if (!ignorarClic.current) return;
        ignorarClic.current = false;
        e.preventDefault();
        e.stopPropagation();
    };

    /* Red de seguridad además de obtenerResenas(): sin reseñas publicadas no hay
       sección (JC 2026-10-02: el mínimo bajó de 5 a 1, MINIMO_RESENAS). */
    if (resenas.resumen.total < MINIMO_RESENAS || resenas.resenas.length === 0) return null;

    const { promedio, total } = resenas.resumen;

    return (
        <section
            id="resenas"
            aria-labelledby="resenas-titulo"
            className="relative w-full overflow-x-clip scroll-mt-24"
            style={{ backgroundColor: "#0c0604", borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
            {/* Mismo contenedor que los planes: la cabecera y el borde de la
                cinta caen en el mismo margen que el resto de la página. */}
            <div className="relative mx-auto w-full max-w-7xl py-16 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="mb-8 px-6 text-center lg:px-12"
                >
                    <div className="mb-4 inline-flex items-center gap-2.5">
                        <span className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${BRONZE}50)` }} />
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: `${BRONZE}D9` }}>
                            Lo que dicen en obra
                        </span>
                        <span className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${BRONZE}50)` }} />
                    </div>
                    <h2
                        id="resenas-titulo"
                        className="font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-white/92 sm:text-4xl"
                    >
                        Reseñas de quienes ya la usan
                    </h2>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                        <span className="font-display text-4xl font-extrabold leading-none text-white/92">
                            {formatearPromedio(promedio)}
                        </span>
                        <Estrellas valor={promedio} tamano={18} etiqueta={`Promedio de ${formatearPromedio(promedio)} de 5 estrellas`} />
                        <span className="text-[13px] text-white/55">
                            {/* JC 2026-10-02: con la caja desde la primera reseña, "1 reseña" en singular. */}
                            {total === 1 ? "1 reseña" : `${total} reseñas`} · solo usuarios con cuenta en BitacorIA
                        </span>
                    </div>
                </motion.div>

                <div ref={envolturaRef} className="relative">
                    {/* role="region" + tabIndex: la cinta se anuncia y se recorre con
                        el teclado también donde el navegador no enfoca los scrolls solo.
                        Sin snap ni scroll-px (JC 2026-09-25): el imán clavaba cada gesto
                        en una tarjeta; ahora la cinta se queda donde la deja el gesto. */}
                    <div
                        ref={cintaRef}
                        role="region"
                        aria-label="Reseñas de usuarios"
                        tabIndex={0}
                        onScroll={alDesplazarse}
                        onPointerDown={alBajarPuntero}
                        onPointerMove={alMoverPuntero}
                        onPointerUp={alSoltarPuntero}
                        onPointerCancel={alSoltarPuntero}
                        onClickCapture={alClicCaptura}
                        /* items-start para que cada tarjeta mida lo suyo; sin él flex estira
                           todas a la más alta y las cortas quedan con hueco. JC 2026-09-25 */
                        className={`scrollbar-hide flex items-start gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 lg:px-12 lg:cursor-grab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C39767]/50${
                            arrastrando ? " select-none lg:cursor-grabbing" : ""
                        }`}
                        /* El recorte de la tarjeta asomada cae en el borde del contenedor
                           (1280px), no de la ventana; el fundido evita el corte seco. 24px no
                           pasa del padding (px-6): en los extremos de la cinta ninguna
                           tarjeta queda fundida. JC 2026-09-25 */
                        style={{
                            WebkitMaskImage: MASCARA_CINTA,
                            maskImage: MASCARA_CINTA,
                        }}
                    >
                        {resenas.resenas.map((resena) => (
                            <TarjetaResena key={resena.id} resena={resena} />
                        ))}
                    </div>

                    {/* Flechas solo en escritorio (lg: ahí el margen de 48px las
                        aloja sin pisar la tarjeta); en móvil manda el dedo. Cada una
                        desaparece cuando ya no hay nada hacia su lado. */}
                    {flechas.izquierda && (
                        <button
                            type="button"
                            onClick={() => desplazar(-1)}
                            aria-label="Ver reseñas anteriores"
                            className="absolute left-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#C39767]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C39767]/60 lg:flex"
                            style={{ background: "#0c0604", border: `1px solid ${BRONZE}80`, color: BRONZE }}
                        >
                            <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
                        </button>
                    )}
                    {flechas.derecha && (
                        <button
                            type="button"
                            onClick={() => desplazar(1)}
                            aria-label="Ver más reseñas"
                            className="absolute right-1 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#C39767]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C39767]/60 lg:flex"
                            style={{ background: "#0c0604", border: `1px solid ${BRONZE}80`, color: BRONZE }}
                        >
                            <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
                        </button>
                    )}
                </div>

                <p className="mt-6 px-6 text-center text-[11px] leading-relaxed text-white/50 lg:px-12">
                    Las reseñas se escriben desde la app, con cuenta de Google verificada. Publicamos todas salvo spam o abuso.
                </p>
            </div>
        </section>
    );
}
