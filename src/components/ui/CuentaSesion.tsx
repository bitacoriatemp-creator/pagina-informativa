"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { dashboardUrl, salirUrl } from "@/lib/appUrl";
import type { Cuenta } from "@/lib/cuenta";

/* ══════════════════════════════════════════════════════════════
   CuentaSesion — la cuenta de la app, en la barra de www
   ──────────────────────────────────────────────────────────────
   Solo aparece si el navegador trae la cookie de aviso `bitacoria_cuenta`
   (hay sesión abierta en la app; ver src/lib/cuenta.ts). Dos acciones y
   nada más: "Acceder" (al tablero) y "Cerrar sesión" (la cierra la app en
   /auth/salir y vuelve aquí). Nada de "Iniciar sesión" ni "Empezar gratis":
   quien ve esto ya tiene cuenta. No muestra correo ni ids: la cookie no los
   lleva.

   · CuentaBarra: el par de la barra, botón "Acceder" + círculo de cuenta,
     en ese orden en las dos barras, en todas las páginas y en todos los
     anchos (en teléfonos, en su tamaño compacto).
   · BotonAcceder: el botón primario de la barra (café de marca). A la
     vista, fuera de cualquier menú.
   · CuentaCirculo: la foto (o las iniciales) en un círculo; al pulsarlo
     abre un menú pequeño con "Sesión abierta como <nombre>" y "Cerrar
     sesión". El nombre ya no va en la barra: va aquí dentro.
   · CuentaFilaMovil: el bloque del menú hamburguesa (círculo + nombre y
     Cerrar sesión). "Acceder" no se repite ahí: ya está en la barra.
   · Avatar: foto si la cookie trae una URL válida y carga; si no, o si
     falla al cargar, las iniciales.
   ══════════════════════════════════════════════════════════════ */

/* La misma curva con la que abre el panel del logo (LogoMenu). */
const CURVA = "cubic-bezier(0.22,1,0.36,1)";

/* Café de marca de la barra: el relleno del botón primario. Con tinta
   #1a120c da 7:1. */
const CAFE = "#c39767";
const TINTA_SOBRE_CAFE = "#1a120c";

/* Café oscuro de marca para el círculo de iniciales: blanco sobre #8B6D3F da
   4.8:1 (AA para texto normal). Con el café claro (#c39767) el blanco se
   quedaba en 2.6:1 y las iniciales se leían mal. */
const CAFE_OSCURO = "#8b6d3f";

/* useLayoutEffect avisa en el render de servidor; allí no hay nada que medir. */
const useLayoutEffectSeguro = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Variante = "pill" | "slim";

/* Mismo alto que la hamburguesa de cada barra (36 / 32 px): el círculo y el
   botón quedan a plomo con ella. En teléfonos (< sm) el del hero baja a
   32 px, el alto de "Acceder" compacto, para que logo, Acceder, círculo y
   hamburguesa quepan en 320 px. `lado` es el width/height de la foto (evita
   saltos al cargar); el tamaño a la vista lo pone `clase`. */
const TAM_CIRCULO: Record<Variante, { lado: number; clase: string; texto: string }> = {
    pill: { lado: 36, clase: "h-8 w-8 sm:h-9 sm:w-9", texto: "text-[11px] sm:text-[12px]" },
    slim: { lado: 32, clase: "h-8 w-8", texto: "text-[11px]" },
};

/* El círculo del menú hamburguesa: el del hero, sin versión compacta (el
   menú ocupa todo el ancho y ahí sobra sitio). */
const CIRCULO_MENU = { lado: 36, clase: "h-9 w-9", texto: "text-[12px]" };

/* ── Avatar ─────────────────────────────────────────────────── */

type PropsAvatarVista = {
    cuenta: Cuenta;
    /** Lado en px: width/height fijos de la foto (sin saltos al cargar). */
    lado: number;
    /** Cuerpo de las iniciales. */
    texto: string;
    /** URL que ya falló al cargar: esa no se vuelve a pedir. */
    fotoFallida: string | null;
    onFallo: (foto: string) => void;
};

/**
 * El círculo sin estado: la foto si la hay y no ha fallado; si no, las
 * iniciales. Va aparte de `Avatar` para poder probar el cambio de foto a
 * iniciales sin navegador.
 */
export function AvatarVista({ cuenta, lado, texto, fotoFallida, onFallo }: PropsAvatarVista) {
    const foto = cuenta.foto && cuenta.foto !== fotoFallida ? cuenta.foto : null;
    if (foto) {
        return (
            /* <img> y no next/image: es una foto externa, las imágenes del sitio
               van sin optimizar (next.config.mjs) y hace falta el onError. alt
               vacío porque es decorativa: el nombre lo dice el botón y el menú.
               no-referrer: no se le cuenta a Google desde qué página se pide. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={foto}
                alt=""
                width={lado}
                height={lado}
                referrerPolicy="no-referrer"
                decoding="async"
                draggable={false}
                onError={() => onFallo(foto)}
                className="h-full w-full select-none rounded-full object-cover"
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className={`flex h-full w-full select-none items-center justify-center rounded-full font-semibold leading-none tracking-wide text-white ${texto}`}
            style={{ background: CAFE_OSCURO }}
        >
            {cuenta.iniciales}
        </span>
    );
}

/** Círculo de la cuenta: recuerda si la foto falló y entonces pinta las iniciales. */
export function Avatar({
    cuenta,
    lado,
    clase,
    texto,
}: {
    cuenta: Cuenta;
    lado: number;
    clase: string;
    texto: string;
}) {
    /* Se guarda la URL que falló, no un sí/no: si la cookie trae otra foto,
       se intenta con esa sin arrastrar el fallo de la anterior. */
    const [fotoFallida, setFotoFallida] = useState<string | null>(null);
    return (
        <span
            className={`${clase} block shrink-0 overflow-hidden rounded-full`}
            /* El mismo café oscuro de fondo: mientras la foto carga se ve el
               círculo lleno, no un hueco. */
            style={{ background: CAFE_OSCURO }}
        >
            <AvatarVista cuenta={cuenta} lado={lado} texto={texto} fotoFallida={fotoFallida} onFallo={setFotoFallida} />
        </span>
    );
}

/* ── Acceder ────────────────────────────────────────────────── */

/* En teléfonos (< sm) "Acceder" va compacto en las dos barras: 32 px de alto
   (el del círculo), menos relleno lateral y la letra un punto menor (11 px).
   Así cabe junto al logo, el círculo y la hamburguesa hasta en 320 px. De sm
   en adelante, el tamaño de siempre. */
const TAM_ACCEDER: Record<Variante, string> = {
    pill: "h-8 px-3 text-[11px] sm:h-9 sm:px-4 sm:text-xs",
    slim: "h-8 px-3 text-[11px] sm:px-3.5 sm:text-xs",
};

/**
 * "Acceder" al tablero: el botón primario de la barra, café de marca con
 * tinta oscura, en Teko mayúscula como los enlaces del menú. `<a>` y no
 * `<Link>`: cruza a la app, misma pestaña y sin prefetch. Se ve en todos los
 * anchos: en teléfonos no se esconde, se compacta (TAM_ACCEDER).
 */
export function BotonAcceder({
    variant = "pill",
    className = "inline-flex",
}: {
    variant?: Variante;
    /** Cómo se muestra (inline-flex, flex…). */
    className?: string;
}) {
    return (
        <a
            href={dashboardUrl()}
            className={`shrink-0 items-center justify-center whitespace-nowrap rounded-full font-ui font-semibold uppercase tracking-widest transition-[filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060302] ${TAM_ACCEDER[variant]} ${className}`}
            style={{ background: CAFE, color: TINTA_SOBRE_CAFE }}
        >
            Acceder
        </a>
    );
}

/* ── Círculo con su menú ────────────────────────────────────── */

type PropsCirculo = {
    cuenta: Cuenta;
    /** Origen de www al que vuelve "Cerrar sesión" (window.location.origin). */
    volver?: string;
    /** El hero lo lleva un punto más grande que la barra delgada. */
    variant?: Variante;
    /** Barra apagada (la otra está a la vista): el menú se cierra. */
    inactiva?: boolean;
    /** Al abrir el menú: la barra cierra la hamburguesa para no tener dos. */
    onAbrir?: () => void;
    /** Cada vez que cambia, el menú se cierra (la barra abrió el panel del logo). */
    senalCierre?: number;
};

export function CuentaCirculo({ cuenta, volver, variant = "pill", inactiva = false, onAbrir, senalCierre }: PropsCirculo) {
    const [abierto, setAbierto] = useState(false);
    const [ajusteX, setAjusteX] = useState(0);
    const contenedor = useRef<HTMLDivElement>(null);
    const boton = useRef<HTMLButtonElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const menu = useRef<HTMLDivElement>(null);
    const enfocarAlAbrir = useRef<"primero" | "ultimo">("primero");
    const idBoton = useId();
    const idMenu = useId();

    const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

    const abrir = (foco: "primero" | "ultimo") => {
        enfocarAlAbrir.current = foco;
        setAbierto(true);
        onAbrir?.();
    };

    /* Al abrir, el foco entra al menú (patrón "menu button" de WAI-ARIA). */
    useEffect(() => {
        if (!abierto) return;
        const lista = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
        (enfocarAlAbrir.current === "ultimo" ? lista[lista.length - 1] : lista[0])?.focus();
    }, [abierto]);

    /* Clic o toque fuera, y Escape desde cualquier sitio, cierran. Con
       Escape el foco vuelve al círculo si estaba dentro del menú. */
    useEffect(() => {
        if (!abierto) return;
        const alPulsar = (e: PointerEvent) => {
            if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
        };
        const alTeclear = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            const dentro = contenedor.current?.contains(document.activeElement) ?? false;
            setAbierto(false);
            if (dentro) boton.current?.focus();
        };
        document.addEventListener("pointerdown", alPulsar);
        window.addEventListener("keydown", alTeclear);
        return () => {
            document.removeEventListener("pointerdown", alPulsar);
            window.removeEventListener("keydown", alTeclear);
        };
    }, [abierto]);

    useEffect(() => {
        if (inactiva) setAbierto(false);
    }, [inactiva]);

    /* El panel del logo y este menú no conviven: al abrirse aquel, este se cierra. */
    useEffect(() => {
        setAbierto(false);
    }, [senalCierre]);

    /* El panel cuelga del borde derecho del círculo; en móvil, en la home
       (círculo a la izquierda del logo), se saldría por la izquierda. Se mide
       al abrir y se corrige, como el panel del logo. La cuenta sale del
       círculo y no del panel (que puede venir corrido de la vez anterior), y
       al cerrar el ajuste NO se reinicia: el panel se desvanece donde estaba,
       sin saltar a su posición sin corregir durante el fundido. */
    useLayoutEffectSeguro(() => {
        if (!abierto) return;
        const c = contenedor.current?.getBoundingClientRect();
        if (!c) return;
        const ancho = panel.current?.offsetWidth ?? 224;
        const izquierda = c.right - ancho;
        const limite = window.innerWidth - 16;
        setAjusteX(izquierda < 16 ? -(16 - izquierda) : c.right > limite ? c.right - limite : 0);
    }, [abierto]);

    const alTeclearBoton = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "ArrowDown") { e.preventDefault(); abrir("primero"); }
        else if (e.key === "ArrowUp") { e.preventDefault(); abrir("ultimo"); }
    };

    const alTeclearMenu = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const lista = items();
        const i = lista.indexOf(document.activeElement as HTMLElement);
        const ir = (k: number) => lista[(k + lista.length) % lista.length]?.focus();
        if (e.key === "ArrowDown") { e.preventDefault(); ir(i + 1); }
        else if (e.key === "ArrowUp") { e.preventDefault(); ir(i - 1); }
        else if (e.key === "Home") { e.preventDefault(); ir(0); }
        else if (e.key === "End") { e.preventDefault(); ir(lista.length - 1); }
        else if (e.key === "Tab") setAbierto(false);
    };

    const tam = TAM_CIRCULO[variant];
    const claseItem =
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-white/85 outline-none transition-colors duration-200 hover:bg-white/[0.04] hover:text-[#c39767] focus-visible:bg-white/[0.04] focus-visible:text-[#c39767]";

    return (
        <div ref={contenedor} className="relative shrink-0">
            {/* El botón ES el círculo. El aro café fino lo ata a la barra (el
                mismo borde que la hamburguesa) y sube de tinta al pasar el
                ratón o con el menú abierto. */}
            <button
                ref={boton}
                id={idBoton}
                type="button"
                onClick={() => (abierto ? setAbierto(false) : abrir("primero"))}
                onKeyDown={alTeclearBoton}
                aria-haspopup="menu"
                aria-expanded={abierto}
                aria-controls={idMenu}
                aria-label={`Cuenta de ${cuenta.nombre}`}
                className={`flex ${tam.clase} shrink-0 items-center justify-center rounded-full ring-1 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060302] ${abierto ? "ring-[#c39767]/80" : "ring-[#c39767]/30 hover:ring-[#c39767]/60"}`}
            >
                <Avatar cuenta={cuenta} lado={tam.lado} clase="h-full w-full" texto={tam.texto} />
            </button>

            {/* Siempre montado y apagado con `invisible` (visibility: hidden): así,
                cerrado, no se enfoca ni se lee, y abrir y cerrar se animan igual
                que el panel del logo. `visibility` solo transiciona al CERRAR
                (se apaga cuando termina el fundido); al abrir cambia en el acto,
                para que el foco pueda entrar al primer elemento. */}
            <div
                ref={panel}
                className={`absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-2xl duration-200 motion-reduce:transition-none ${abierto ? "visible translate-y-0 opacity-100 transition-[opacity,transform]" : "pointer-events-none invisible -translate-y-1.5 opacity-0 transition-[opacity,transform,visibility]"}`}
                style={{
                    marginRight: ajusteX,
                    transitionTimingFunction: CURVA,
                    background: "rgba(8, 4, 2, 0.96)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(195, 151, 103, 0.15)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                }}
            >
                {/* Fuera del role="menu": un menú solo contiene opciones. El nombre
                    ya lo anuncia el botón ("Cuenta de …"), que etiqueta al menú. */}
                <p className="border-b border-white/[0.06] px-4 py-3.5 text-[12px] leading-snug text-white/55">
                    Sesión abierta como
                    {/* line-clamp ya es de bloque (-webkit-box); con `block` al lado
                        dejaría de recortar. Dos líneas: los nombres largos se leen. */}
                    <span className="mt-0.5 line-clamp-2 break-words text-[14px] font-medium text-white/90">
                        {cuenta.nombre}
                    </span>
                </p>
                <div
                    ref={menu}
                    id={idMenu}
                    role="menu"
                    aria-labelledby={idBoton}
                    onKeyDown={alTeclearMenu}
                    className="py-1.5"
                >
                    <a role="menuitem" tabIndex={-1} href={salirUrl(volver)} className={claseItem}>
                        <LogOut aria-hidden="true" size={15} strokeWidth={1.8} />
                        Cerrar sesión
                    </a>
                </div>
            </div>
        </div>
    );
}

/* ── El par de la barra ─────────────────────────────────────── */

/**
 * "Acceder" + círculo, en ese orden: el círculo queda por fuera, como la
 * cuenta en casi cualquier sitio, y el botón por dentro, junto al contenido.
 * En todos los anchos (24-09, pedido de JC): por debajo de sm (teléfonos) los
 * dos van compactos, a 32 px y más juntos (gap-2), para caber junto al logo y
 * la hamburguesa hasta en 320 px. Hasta ese día, en teléfonos "Acceder" se
 * escondía y vivía en el menú hamburguesa.
 */
export function CuentaBarra({
    className = "",
    ...circulo
}: PropsCirculo & { className?: string }) {
    return (
        <div className={`flex shrink-0 items-center gap-2 sm:gap-2.5 ${className}`}>
            <BotonAcceder variant={circulo.variant ?? "pill"} />
            <CuentaCirculo {...circulo} />
        </div>
    );
}

/* ── Menú hamburguesa ───────────────────────────────────────── */

/** Bloque de cuenta del menú hamburguesa: círculo y nombre ("Sesión abierta
    como …") y "Cerrar sesión" como fila. "Acceder" ya no se repite aquí: está
    en la barra en todos los anchos, justo al lado de la hamburguesa, y un
    segundo botón igual a un toque de distancia solo alargaba el menú. El
    margen lateral (`px`, el mismo de los enlaces del menú) va en cada fila y
    no en el contenedor: así la línea de "Cerrar sesión" cruza el panel de lado
    a lado, como las de los enlaces de arriba. */
export function CuentaFilaMovil({
    cuenta,
    volver,
    px = "px-6",
    className = "",
}: {
    cuenta: Cuenta;
    volver?: string;
    px?: "px-6" | "px-5";
    className?: string;
}) {
    const claseAccion = `flex items-center gap-2.5 border-t border-white/[0.04] py-3 ${px} font-ui text-xs uppercase tracking-widest text-white/75 transition-colors duration-200 hover:text-[#c39767] focus-visible:text-[#c39767] focus-visible:outline-none`;
    return (
        <div className={`flex flex-col ${className}`} style={{ background: "rgba(195,151,103,0.06)" }}>
            <div className={`flex items-center gap-3 py-4 ${px}`}>
                <Avatar cuenta={cuenta} lado={CIRCULO_MENU.lado} clase={CIRCULO_MENU.clase} texto={CIRCULO_MENU.texto} />
                <p className="min-w-0 text-[13px] leading-snug text-white/55">
                    Sesión abierta como
                    <span className="block truncate font-medium text-white/90">{cuenta.nombre}</span>
                </p>
            </div>
            <a href={salirUrl(volver)} className={claseAccion}>
                <LogOut aria-hidden="true" size={14} strokeWidth={1.8} />
                Cerrar sesión
            </a>
        </div>
    );
}
