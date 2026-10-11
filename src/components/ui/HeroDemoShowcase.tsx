"use client";

import { EVENTO_DEMO } from "@/lib/eventos";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ── Los 3 demos reales que antes vivían en secciones aparte
   (Smart Concepts, Bitácora, Smart Calendar) — ahora viven en el Hero.
   JC 2026-09-24: fuera el campo `focus` (object-position del recorte vertical
   en móvil): la tarjeta ya es 16:9 como las grabaciones y no recorta nada. ── */
type Demo = {
    src: string;
    poster: string;
    label: string;
    accent: string;
};

const DEMOS: Demo[] = [
    {
        src: assetPath("/videos/demo-concepts.mp4"),
        poster: assetPath("/videos/demo-concepts-poster.jpg"),
        label: "Smart Concepts",
        accent: "#00D26A",
    },
    {
        src: assetPath("/videos/demo-bitacora.mp4"),
        poster: assetPath("/videos/demo-bitacora-poster.jpg"),
        label: "Smart Log",
        accent: "#C39767",
    },
    {
        src: assetPath("/videos/demo-calendar.mp4"),
        poster: assetPath("/videos/demo-calendar-poster.jpg"),
        label: "Smart Calendar",
        accent: "#3B82F6",
    },
];

/* En mudo los demos corren acelerados (se ven como un vistazo rápido); al
   activar el sonido volvemos a 1x para que la voz suene natural. */
const RATE_MUTED = 1.2;
const RATE_SOUND = 1;

/* Aparición del control de sonido: fundido puro de 0 a 100 en 1s, igual de
   lento al entrar que al salir. Icono y barra van a la vez —sin desfase y sin
   desplazamiento— para que se sienta como una sola pieza que se revela. */
const SOUND_REVEAL = "opacity 1000ms cubic-bezier(0.33,0,0.2,1)";

/* El Safari del iPhone no tiene requestFullscreen sobre elementos: su única
   pantalla completa es la del reproductor nativo del <video>, y el tipo del DOM
   no la declara. */
type VideoConPantallaCompletaIOS = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * HeroDemoShowcase — tarjeta de producto del Hero (estilo Claude: imagen
 * contenida a la derecha del copy, no fondo cinematográfico a sangre).
 * Reproduce los 3 demos reales en loop secuencial con crossfade.
 */
export default function HeroDemoShowcase() {
    const [active, setActive] = useState(0);
    /* Arranca SIEMPRE en mudo: es requisito del autoplay y además evita
       sonido no pedido al entrar a la landing. */
    const [muted, setMuted] = useState(true);
    const [hovering, setHovering] = useState(false);
    /* Punto bajo el cursor: muestra un adelanto del módulo antes de hacer clic. */
    const [preselected, setPreselected] = useState<number | null>(null);
    /* En touch no hay controles propios: la tarjeta entera abre el reproductor
       nativo del navegador (ver abrirReproductorNativo). */
    const [coarsePointer, setCoarsePointer] = useState(false);

    const videoRef0 = useRef<HTMLVideoElement>(null);
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const videoRefs = [videoRef0, videoRef1, videoRef2];

    /* Nivel de volumen (0–1) del control vertical. */
    const [volume, setVolume] = useState(1);

    const cardRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef(0);
    const mutedRef = useRef(true);
    const volumeRef = useRef(1);
    /* Índice del video abierto en el reproductor nativo (con controles y
       sonido), o null si el hero está en su loop mudo. */
    const reproductorRef = useRef<number | null>(null);
    /* Ese reproductor está (o está entrando) en pantalla completa. Se marca al
       pedirla, no al confirmarse: entre la petición y el fullscreenchange el
       observer ya puede dar la tarjeta por fuera de vista. */
    const pantallaCompletaRef = useRef(false);
    /* Turno del encadenado en curso. JC 2026-09-24: playNext deja pendiente el
       play() del siguiente clip y, si mientras tanto se abre el reproductor, su
       reveal no debe mutear ni ocultar el video que se está viendo. Abrir el
       reproductor avanza el turno y ese reveal atrasado ya no hace nada. */
    const encadenadoRef = useRef(0);

    /* Suscrito al media query, no leído una sola vez: una tablet que rota o un
       equipo híbrido (táctil + ratón) cambian de modo en caliente, y con una
       lectura única los controles se quedaban en el modo del primer render. */
    useEffect(() => {
        const mq = window.matchMedia("(hover: none), (pointer: coarse)");
        const sync = () => setCoarsePointer(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        const videos = videoRefs.map((r) => r.current);
        const card = cardRef.current;
        if (videos.some((v) => !v) || !card) return;

        // React no siempre refleja el atributo `muted` a tiempo para el
        // autoplay; lo forzamos como propiedad del DOM (mismo fix que DemoPlayer).
        videos.forEach((v) => {
            v!.muted = true;
            v!.playbackRate = RATE_MUTED;
            v!.volume = volumeRef.current;
        });

        // El showcase se pausa fuera de vista y con la pestaña en segundo
        // plano: ahorra CPU y, sobre todo, evita que siga sonando un demo
        // que nadie está viendo.
        let inView = true;

        const canPlay = () => inView && document.visibilityState === "visible";
        const pauseAll = () => videos.forEach((v) => v!.pause());

        /* JC 2026-09-24: con el reproductor nativo abierto el video es del
           usuario. Si lo pausó con los controles, el loop no se lo reanuda al
           volver a la vista. */
        const tryPlay = () => {
            if (reproductorRef.current !== null) return;
            if (canPlay()) videos[activeRef.current]!.play().catch(() => {});
        };

        /* JC 2026-09-24: en pantalla completa la tarjeta queda tapada y el
           observer (o la visibilidad) puede darla por no vista: pausar ahí
           cortaría el video que el usuario está mirando. Con el reproductor
           dentro de la tarjeta sí se pausa, como siempre. */
        const pausarSiNadieMira = () => {
            if (!pantallaCompletaRef.current) pauseAll();
        };

        /* Al terminar un demo encadena el siguiente (y del último vuelve al
           primero). El crossfade —y con él el punto de abajo— se dispara solo
           cuando el siguiente YA está reproduciendo: si arrancáramos el fundido
           antes, un clip aún sin buffer dejaría un hueco en negro a mitad de
           transición. */
        const playNext = (currentIdx: number) => {
            const nextIdx = (currentIdx + 1) % videos.length;
            const next = videos[nextIdx]!;

            next.currentTime = 0;
            // El sonido —y con él la velocidad— viajan con el usuario.
            next.muted = mutedRef.current;
            next.playbackRate = mutedRef.current ? RATE_MUTED : RATE_SOUND;

            const turno = ++encadenadoRef.current;
            const reveal = () => {
                /* JC 2026-09-24: un toque mientras el siguiente clip aún carga
                   abre el reproductor con el clip visible; el encadenado
                   pendiente se anula para no mutearlo ni ocultarlo por debajo. */
                if (turno !== encadenadoRef.current || reproductorRef.current !== null) return;
                videos[currentIdx]!.muted = true;
                activeRef.current = nextIdx;
                setActive(nextIdx);
                // Pre-calienta SOLO el que sigue: evita bajar los 3 clips de golpe.
                videos[(nextIdx + 1) % videos.length]!.preload = "auto";
            };

            // Si nadie está mirando no arrancamos nada: avanzamos el índice y
            // `tryPlay` reanudará este mismo clip al volver.
            if (!canPlay()) {
                reveal();
                return;
            }
            next.play().then(reveal, reveal);
        };

        /* JC 2026-09-24: si el demo termina en pantalla completa no se cambia
           de video: el reproductor nativo se queda en el último cuadro (con su
           botón de repetir) y el siguiente entra al salir. Si terminó con el
           reproductor dentro de la tarjeta, se cierra y el loop sigue. */
        videos.forEach((v, i) => {
            v!.onended = () => {
                if (reproductorRef.current === i) {
                    if (pantallaCompletaRef.current) return;
                    soltarReproductor();
                }
                playNext(i);
            };
        });

        const io = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                if (inView) tryPlay();
                else pausarSiNadieMira();
            },
            { threshold: 0.25 }
        );
        io.observe(card);

        // Con la pestaña oculta el navegador no entrega rAF ni callbacks del
        // IntersectionObserver, pero el video SÍ sigue sonando: por eso aquí
        // pausamos explícitamente en vez de solo reanudar.
        const handleVisibility = () => {
            if (document.visibilityState === "visible") tryPlay();
            else pausarSiNadieMira();
        };

        /* ── Salida del reproductor nativo ──
           Vuelve el hero: sin controles, mudo y a 1.2x. Si el demo terminó
           estando en pantalla completa pasa al siguiente; si no, sigue donde el
           usuario lo dejó. */
        const alSalirDelReproductor = () => {
            const i = soltarReproductor();
            if (i === null) return;
            if (videos[i]!.ended) playNext(i);
            else tryPlay();
        };

        /* Android/Chrome (y iPad): fullscreenchange. Al entrar solo se confirma
           la marca, que también cubre que el usuario abra la pantalla completa
           desde los controles del video en la tarjeta. */
        const alCambiarPantallaCompleta = () => {
            const enPantalla = document.fullscreenElement;
            const i = reproductorRef.current;
            if (enPantalla) {
                if (i !== null && enPantalla === videos[i]) pantallaCompletaRef.current = true;
                return;
            }
            if (pantallaCompletaRef.current) alSalirDelReproductor();
        };

        /* iPhone: el reproductor nativo avisa en el propio <video>. JC 2026-09-24:
           antes solo se escuchaba en el video 0, así que al cerrar Smart Log o
           Smart Calendar el hero se quedaba con sonido y a 1x. */
        const alEntrarIOS = (e: Event) => {
            const i = reproductorRef.current;
            if (i !== null && e.target === videos[i]) pantallaCompletaRef.current = true;
        };

        tryPlay();
        document.addEventListener("visibilitychange", handleVisibility);
        document.addEventListener("fullscreenchange", alCambiarPantallaCompleta);
        videos.forEach((v) => {
            v!.addEventListener("webkitbeginfullscreen", alEntrarIOS);
            v!.addEventListener("webkitendfullscreen", alSalirDelReproductor);
        });

        return () => {
            videos.forEach((v) => {
                if (!v) return;
                v.onended = null;
                v.removeEventListener("webkitbeginfullscreen", alEntrarIOS);
                v.removeEventListener("webkitendfullscreen", alSalirDelReproductor);
            });
            io.disconnect();
            document.removeEventListener("visibilitychange", handleVisibility);
            document.removeEventListener("fullscreenchange", alCambiarPantallaCompleta);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Fuente única de verdad del audio: mute + velocidad van siempre juntos. */
    const setSoundEnabled = (enabled: boolean) => {
        const nextMuted = !enabled;
        mutedRef.current = nextMuted;
        setMuted(nextMuted);

        videoRefs.forEach((r, i) => {
            const v = r.current;
            if (!v) return;
            // Solo el visible puede sonar; los demás siempre en mudo.
            v.muted = nextMuted || i !== activeRef.current;
            v.playbackRate = nextMuted ? RATE_MUTED : RATE_SOUND;
        });

        // Desmutear cuenta como gesto del usuario: aprovechamos para asegurar
        // la reproducción por si el navegador la había pausado.
        if (enabled) videoRefs[activeRef.current].current?.play().catch(() => {});
    };

    const toggleSound = () => setSoundEnabled(mutedRef.current);

    /** Aplica un nivel de volumen (0–1) a los tres clips. */
    const applyVolume = (raw: number) => {
        const v = Math.min(1, Math.max(0, raw));
        volumeRef.current = v;
        setVolume(v);
        videoRefs.forEach((r) => {
            if (r.current) r.current.volume = v;
        });
        // Mover la barra es una petición explícita de oír: si estaba en mudo,
        // lo activamos (y al bajar a cero, silenciamos).
        if (v === 0 && !mutedRef.current) setSoundEnabled(false);
        else if (v > 0 && mutedRef.current) setSoundEnabled(true);
    };

    /** Traduce la posición del puntero sobre la barra a volumen (arriba = 100%). */
    const volumeFromPointer = (clientY: number) => {
        const track = trackRef.current;
        if (!track) return;
        const r = track.getBoundingClientRect();
        applyVolume(1 - (clientY - r.top) / r.height);
    };

    const goTo = (i: number) => {
        if (i === active) return;
        // En pantalla completa el demo no cambia por debajo del que se está viendo.
        if (pantallaCompletaRef.current) return;
        // Con el reproductor abierto dentro de la tarjeta, cambiar de demo lo
        // cierra: el siguiente entra en el loop mudo de siempre.
        soltarReproductor();
        const prev = videoRefs[active].current;
        if (prev) {
            prev.pause();
            prev.muted = true;
        }
        activeRef.current = i;
        setActive(i);
        const v = videoRefs[i].current;
        if (v) {
            v.currentTime = 0;
            v.muted = mutedRef.current;
            v.playbackRate = mutedRef.current ? RATE_MUTED : RATE_SOUND;
            v.play().catch(() => {});
        }
    };

    /* La isla flotante pide un demo concreto ("Smart Log" → índice 1). goTo
       cambia en cada render, así que el listener lee la versión vigente por ref
       y se suscribe una sola vez. */
    const goToRef = useRef(goTo);
    goToRef.current = goTo;
    useEffect(() => {
        const alPedir = (e: Event) => {
            const i = (e as CustomEvent<number>).detail;
            if (Number.isInteger(i) && i >= 0 && i < DEMOS.length) goToRef.current(i);
        };
        window.addEventListener(EVENTO_DEMO, alPedir);
        return () => window.removeEventListener(EVENTO_DEMO, alPedir);
    }, []);

    /* ── Touch: reproductor nativo ──
       JC 2026-09-24: en el móvil no hay nada encima de la tarjeta (el botón de
       sonido y la pastilla "Toca para ampliar" tapaban el demo). Tocarla abre
       el reproductor del propio navegador con el demo activo: desde el
       principio, a 1x, con sonido y con sus controles para pausar, adelantar y
       retroceder. Es una vista que la gente ya conoce y no hay UI que diseñar. */
    const abrirReproductorNativo = () => {
        // Con el reproductor abierto, los toques son de sus controles: en
        // pantalla completa el <video> sigue siendo hijo de la tarjeta y el
        // click sube hasta aquí. Reabrirlo reiniciaría el video a cada toque.
        if (reproductorRef.current !== null) return;
        const i = activeRef.current;
        const v = videoRefs[i].current as VideoConPantallaCompletaIOS | null;
        if (!v) return;

        reproductorRef.current = i;
        // Anula un encadenado a medio arrancar (ver encadenadoRef) y detiene el
        // clip que estaba cargando: al salir, el loop sigue desde este video y
        // no quedan dos sonando a la vez.
        encadenadoRef.current++;
        videoRefs.forEach((r, k) => {
            if (k !== i) r.current?.pause();
        });
        // controls ANTES de la pantalla completa: Chrome no añade controles a
        // un <video> que entra en fullscreen sin ellos.
        v.controls = true;
        v.volume = 1;
        v.currentTime = 0;
        // Desmuta, pasa a 1x y reproduce: el toque es el gesto que lo permite.
        setSoundEnabled(true);

        // Síncrono, dentro del gesto: después de un await el navegador ya no
        // concede la pantalla completa. Si no hay API o falla, el video se
        // queda en la tarjeta con sus controles y sonando.
        try {
            if (typeof v.requestFullscreen === "function") {
                pantallaCompletaRef.current = true;
                Promise.resolve(v.requestFullscreen()).catch(() => {
                    pantallaCompletaRef.current = false;
                });
            } else if (typeof v.webkitEnterFullscreen === "function") {
                pantallaCompletaRef.current = true;
                v.webkitEnterFullscreen();
            }
        } catch {
            pantallaCompletaRef.current = false;
        }
    };

    /** Cierra el reproductor nativo: fuera controles y de vuelta al vistazo
        mudo a 1.2x. Devuelve el índice del video que lo tenía (null si no había). */
    const soltarReproductor = (): number | null => {
        const i = reproductorRef.current;
        if (i === null) return null;
        reproductorRef.current = null;
        pantallaCompletaRef.current = false;
        const v = videoRefs[i].current;
        if (v) {
            v.controls = false;
            v.volume = volumeRef.current;
        }
        setSoundEnabled(false);
        return i;
    };

    /* ── Touch: deslizar entre demos ──
       Mantiene la arquitectura de 3 videos con crossfade; solo traduce el gesto
       a goTo(). Solo cuenta si el movimiento es más horizontal que vertical,
       para no robarle el scroll a la página. */
    const swipe = useRef<{ x: number; y: number } | null>(null);
    /* JC 2026-09-24: el navegador puede disparar el click de la tarjeta después
       del pointerup de un deslizamiento, y stopPropagation no lo evita (el
       click es otro evento sobre el mismo elemento). Esta marca hace que ese
       click no abra el reproductor. */
    const acabaDeDeslizar = useRef(false);

    const onSwipeStart = (e: React.PointerEvent) => {
        swipe.current = { x: e.clientX, y: e.clientY };
        acabaDeDeslizar.current = false;
    };

    const onSwipeEnd = (e: React.PointerEvent) => {
        const ini = swipe.current;
        swipe.current = null;
        if (!ini) return;
        // Con el reproductor abierto, arrastrar es de sus controles (la barra de
        // tiempo), no un cambio de demo.
        if (reproductorRef.current !== null) return;
        const dx = e.clientX - ini.x;
        const dy = e.clientY - ini.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;  // fue scroll o un toque
        acabaDeDeslizar.current = true;
        const n = DEMOS.length;
        goTo((activeRef.current + (dx < 0 ? 1 : n - 1)) % n);
    };

    const onSwipeCancel = () => {
        swipe.current = null;
    };

    const alTocarTarjeta = () => {
        if (acabaDeDeslizar.current) {
            acabaDeDeslizar.current = false;
            return;
        }
        abrirReproductorNativo();
    };

    /* La tarjeta hace de botón en touch: Enter y Espacio abren el reproductor.
       Solo si la tecla es de la tarjeta; con el foco en los controles nativos,
       el Espacio es suyo (pausar). */
    const alTeclearTarjeta = (e: React.KeyboardEvent) => {
        if (e.target !== e.currentTarget) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();  // el Espacio no desplaza la página
        abrirReproductorNativo();
    };

    /* El botón se revela al pasar el mouse; si el sonido está activo se queda
       visible para poder silenciar sin tener que buscarlo. */
    const soundVisible = hovering || !muted;

    return (
        <div
            className="relative mx-auto w-full max-w-4xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* Video + columna de sonido a su derecha. Desde lg la columna ocupa
                sitio siempre (aunque esté oculta) para que revelarla no reacomode
                nada; por debajo de lg no existe (hidden lg:flex). */}
            <div className="flex items-center gap-3">
                <div
                    ref={cardRef}
                    onClick={coarsePointer ? alTocarTarjeta : undefined}
                    onKeyDown={coarsePointer ? alTeclearTarjeta : undefined}
                    onPointerDown={coarsePointer ? onSwipeStart : undefined}
                    onPointerUp={coarsePointer ? onSwipeEnd : undefined}
                    onPointerCancel={coarsePointer ? onSwipeCancel : undefined}
                    role={coarsePointer ? "button" : undefined}
                    tabIndex={coarsePointer ? 0 : undefined}
                    aria-label={
                        coarsePointer
                            ? `Ver el demo de ${DEMOS[active].label} en pantalla completa, con sonido`
                            : undefined
                    }
                    /* JC 2026-09-24: 16:9 en todos los tamaños, como las grabaciones.
                       En el teléfono el demo se ve entero aunque quede pequeño; el
                       detalle se ve tocándolo, en el reproductor nativo. Con tarjeta
                       y video en la misma proporción object-cover ya no recorta.
                       Radio y sombra van con el tamaño: 28px y 120px de difuminado
                       son de la tarjeta de escritorio y en una de ~343x193 la
                       volvían una píldora con halo; desde lg, lo de siempre.
                       touch-pan-y deja pasar el scroll vertical; el swipe es horizontal. */
                    className={
                        "relative aspect-video min-w-0 flex-1 touch-pan-y overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.5)] sm:rounded-[22px] lg:rounded-[28px] lg:shadow-[0_40px_120px_rgba(0,0,0,0.55)]" +
                        (coarsePointer
                            ? " cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                            : "")
                    }
                >
                    {DEMOS.map((demo, i) => (
                        <video
                            key={demo.label}
                            ref={videoRefs[i]}
                            src={demo.src}
                            poster={demo.poster}
                            muted
                            playsInline
                            /* En datos móviles no bajamos un MP4 1080p entero de salida:
                               solo la cabecera, suficiente para pintar el primer cuadro. */
                            preload={i === 0 ? (coarsePointer ? "metadata" : "auto") : "none"}
                            /* object-cover y no contain: con el borde de 1px la caja no es
                               16:9 exacto y contain dejaría filetes negros. En pantalla
                               completa sí va contain: el CSS de autor pisa el contain que
                               pone el navegador y, con el teléfono en vertical, cover
                               cortaría medio demo. */
                            className="absolute inset-0 h-full w-full object-cover [&:fullscreen]:object-contain"
                            style={{
                                opacity: active === i ? 1 : 0,
                                /* JC 2026-09-24: los 3 videos están apilados y el último
                                   se pinta encima aunque tenga opacity 0; sin esto, si la
                                   pantalla completa falla, los controles nativos del activo
                                   quedan tapados por un video invisible. */
                                pointerEvents: active === i ? "auto" : "none",
                                transition: "opacity 900ms cubic-bezier(0.4,0,0.2,1)",
                            }}
                        />
                    ))}
                </div>

                {/* Sonido — al costado derecho del video, centrado en vertical */}
                {/* Columna de sonido solo con ratón: en un móvil el slider vertical
                    de 6px es inservible (el teléfono ya tiene botones de volumen) y
                    robaba 28px de un ancho de 375. En touch el sonido llega al tocar
                    la tarjeta, en el reproductor nativo. */}
                <div
                    className="hidden w-7 shrink-0 flex-col items-center gap-2 lg:flex"
                    style={{ pointerEvents: soundVisible ? "auto" : "none" }}
                >
                    {/* Barra vertical de volumen.
                        El div exterior solo añade área de clic a los lados
                        (px, sin py): así atinarle es fácil sin engordar la barra
                        ni descuadrar el cálculo de altura → volumen. */}
                    <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Volumen"
                        aria-orientation="vertical"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(volume * 100)}
                        onFocus={() => setHovering(true)}
                        onBlur={() => setHovering(false)}
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            volumeFromPointer(e.clientY);
                        }}
                        onPointerMove={(e) => {
                            if (e.currentTarget.hasPointerCapture(e.pointerId)) volumeFromPointer(e.clientY);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                                e.preventDefault();
                                applyVolume(volumeRef.current + 0.05);
                            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                                e.preventDefault();
                                applyVolume(volumeRef.current - 0.05);
                            }
                        }}
                        className="group flex cursor-pointer touch-none items-center px-2 focus-visible:outline-none"
                        style={{
                            opacity: soundVisible ? 1 : 0,
                            transition: SOUND_REVEAL,
                        }}
                    >
                        <div
                            ref={trackRef}
                            className="relative h-12 w-[6px] rounded-full bg-white/25 transition-colors duration-200 group-hover:bg-white/35 group-focus-visible:ring-2 group-focus-visible:ring-white/50"
                        >
                            {/* Relleno: crece desde abajo */}
                            <div
                                className="absolute bottom-0 left-0 w-full rounded-full bg-white"
                                style={{
                                    height: `${(muted ? 0 : volume) * 100}%`,
                                    transition: "height 180ms cubic-bezier(0.22,1,0.36,1)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Icono suelto, sin círculo */}
                    <button
                        type="button"
                        onClick={toggleSound}
                        aria-label={muted ? "Activar sonido del demo" : "Silenciar demo"}
                        aria-pressed={!muted}
                        onFocus={() => setHovering(true)}
                        onBlur={() => setHovering(false)}
                        className="flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        style={{
                            opacity: soundVisible ? 1 : 0,
                            transition: `${SOUND_REVEAL}, color 200ms ease`,
                        }}
                    >
                        {muted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
                    </button>
                </div>
            </div>

            {/* Selector de módulo. El ancho del video (flex-1) ya descuenta la
                columna de sonido, así que compensamos para centrar respecto al
                video y no respecto al bloque completo. JC 2026-09-24: la columna
                solo existe desde lg (hidden lg:flex), y la compensación también;
                en el móvil los puntos quedaban 16px corridos a la izquierda. */}
            <div className="mt-5 flex items-center justify-center lg:pr-8">
                <div className="flex items-center gap-1">
                    {DEMOS.map((demo, i) => {
                        const isActive = active === i;
                        // Preselección: el punto bajo el cursor adelanta cómo se
                        // vería seleccionado (mismo color del módulo, a media tinta).
                        const isPreselected = preselected === i && !isActive;
                        return (
                            <button
                                key={demo.label}
                                type="button"
                                aria-label={`Ver demo de ${demo.label}`}
                                aria-current={isActive}
                                onClick={() => goTo(i)}
                                onMouseEnter={() => setPreselected(i)}
                                onMouseLeave={() => setPreselected(null)}
                                onFocus={() => {
                                    setHovering(true);
                                    setPreselected(i);
                                }}
                                onBlur={() => {
                                    setHovering(false);
                                    setPreselected(null);
                                }}
                                /* Área táctil de 44px (el mínimo recomendado) sin que
                                   el indicador visual crezca: el alto y el padding
                                   son mayores en touch, la píldora sigue igual. */
                                className="group flex h-11 items-center px-3 focus-visible:outline-none lg:h-5 lg:px-1.5"
                            >
                                <motion.span
                                    className="block h-1.5 rounded-full"
                                    animate={{
                                        width: isActive ? 30 : isPreselected ? 18 : 8,
                                        backgroundColor: isActive
                                            ? demo.accent
                                            : isPreselected
                                                ? `${demo.accent}99`
                                                : "rgba(255,255,255,0.18)",
                                    }}
                                    /* Muelle: el punto que sale se encoge mientras el
                                       que entra se estira, y los vecinos se reacomodan
                                       con la misma física. */
                                    transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
