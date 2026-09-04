"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LogOut } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { mostrarDemo } from "@/lib/eventos";
import type { Account } from "@/lib/account";

/* ══════════════════════════════════════════════════════════════
   LogoMenu — el logo ES la navegación
   ──────────────────────────────────────────────────────────────
   Ya no hay pastilla ni enlaces sueltos: solo la marca. La flecha
   está oculta y se revela al acercar el ratón con el mismo fundido
   de 1s que el control de volumen del hero, para que el gesto de
   "aquí hay más" se sienta igual en toda la página.
   Solo escritorio con ratón: por debajo de lg manda la hamburguesa,
   que lista lo mismo. Un menú de hover en táctil no se puede cerrar
   sin un segundo toque a ciegas.
   ══════════════════════════════════════════════════════════════ */

/* Misma curva y duración que el icono de sonido (HeroDemoShowcase). */
const REVELADO = "opacity 1000ms cubic-bezier(0.33,0,0.2,1)";

type Elemento = {
    label: string;
    /* Destinos reales, todos existentes hoy. */
    href?: string;
    /* Los tres demos comparten el ancla del hero: además de subir,
       hay que decirle al showcase cuál mostrar. */
    demo?: number;
    accion?: "quienes" | "comoFunciona";
};

const COLUMNAS: { titulo: string; elementos: Elemento[] }[] = [
    {
        titulo: "Producto",
        elementos: [
            { label: "Smart Concepts", href: "#hero-or-chaos", demo: 0 },
            { label: "Bitácora", href: "#hero-or-chaos", demo: 1 },
            { label: "Smart Calendar", href: "#hero-or-chaos", demo: 2 },
            { label: "Smart BIM", href: "#bim-sync" },
        ],
    },
    {
        titulo: "Descubre",
        elementos: [
            { label: "Cómo funciona", accion: "comoFunciona" },
            { label: "Alcance global", href: "#alcance-global" },
            { label: "Planes y precios", href: "#soluciones" },
        ],
    },
    {
        titulo: "Compañía",
        elementos: [
            { label: "Quiénes somos", accion: "quienes" },
            { label: "Contacto", href: "#contacto" },
        ],
    },
];

interface Props {
    onQuienesSomos: () => void;
    onComoFunciona: () => void;
    account: Account | null;
    onSignOut: () => void;
    /* El hero lo lleva más grande que la barra delgada del scroll. */
    variant?: "pill" | "slim";
}

export default function LogoMenu({
    onQuienesSomos,
    onComoFunciona,
    account,
    onSignOut,
    variant = "pill",
}: Props) {
    const [abierto, setAbierto] = useState(false);
    const [encima, setEncima] = useState(false);
    const [habilitado, setHabilitado] = useState(false);
    const [ajusteX, setAjusteX] = useState(0);
    const cierre = useRef<ReturnType<typeof setTimeout> | null>(null);
    const contenedor = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const idPanel = useId();

    /* Se consulta EN VIVO además de por estado: si un listener de matchMedia
       se pierde, el estado se queda obsoleto y el panel podría abrirse en un
       móvil, donde no cabe. */
    const puedeAbrir = () =>
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 1024px) and (hover: hover)").matches;

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px) and (hover: hover)");
        const sync = () => setHabilitado(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        window.addEventListener("resize", sync);
        return () => {
            mq.removeEventListener("change", sync);
            window.removeEventListener("resize", sync);
        };
    }, []);

    useEffect(() => () => { if (cierre.current) clearTimeout(cierre.current); }, []);

    /* El panel cuelga del logo y ahora abre hacia la izquierda, así que el
       borde que se puede salir es el IZQUIERDO. Se mide al abrir y se corrige;
       con JS y no con un ancho fijo, para que siga valiendo cuando el menú
       crezca con más secciones. */
    useLayoutEffect(() => {
        if (!abierto) { setAjusteX(0); return; }
        const el = panel.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const exceso = 16 - r.left;
        if (exceso > 0) setAjusteX(-exceso);
    }, [abierto]);

    const abrir = () => {
        setEncima(true);
        if (!puedeAbrir()) return;
        if (cierre.current) clearTimeout(cierre.current);
        setAbierto(true);
    };
    /* La gracia evita el parpadeo al cruzar el hueco entre el logo y el panel. */
    const cerrarConGracia = () => {
        if (cierre.current) clearTimeout(cierre.current);
        cierre.current = setTimeout(() => { setAbierto(false); setEncima(false); }, 140);
    };
    const cerrarYa = () => {
        if (cierre.current) clearTimeout(cierre.current);
        setAbierto(false);
        setEncima(false);
    };

    useEffect(() => {
        if (!abierto) return;
        const alTeclear = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            cerrarYa();
            contenedor.current?.querySelector("button")?.focus();
        };
        window.addEventListener("keydown", alTeclear);
        return () => window.removeEventListener("keydown", alTeclear);
    }, [abierto]);

    const alElegir = (el: Elemento) => {
        if (el.accion === "quienes") onQuienesSomos();
        if (el.accion === "comoFunciona") onComoFunciona();
        if (el.demo !== undefined) mostrarDemo(el.demo);
        cerrarYa();
    };

    /* "En grande": la marca es ahora lo único que hay arriba. */
    /* En slim el logo debe caber en una barra de 48/56px de alto. */
    const tamLogo = variant === "pill" ? "w-16 lg:w-24" : "w-9 lg:w-10";
    const visible = encima || abierto;

    return (
        <div
            ref={contenedor}
            className="relative shrink-0"
            onMouseEnter={abrir}
            onMouseLeave={cerrarConGracia}
            onFocus={abrir}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) cerrarConGracia(); }}
        >
            <button
                type="button"
                onClick={() => puedeAbrir() && setAbierto((o) => !o)}
                aria-haspopup={habilitado ? "true" : undefined}
                aria-expanded={habilitado ? abierto : undefined}
                aria-controls={habilitado ? idPanel : undefined}
                aria-label={habilitado ? "BitacorIA — abrir menú" : "BitacorIA"}
                className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60"
            >
                {/* Va antes del logo: con la marca pegada al borde derecho, la
                    flecha queda por dentro y apunta hacia el contenido.
                    El trazo dibuja un galón hacia ABAJO; en reposo se gira 90°
                    (apunta a la izquierda) y al acercar el ratón vuelve a 0°.
                    El giro dura lo mismo que el fundido para que aparecer y
                    girar se lean como un solo gesto, no como dos. */}
                <svg
                    aria-hidden
                    viewBox="0 0 10 6"
                    className="hidden lg:block h-[6px] w-[10px] shrink-0"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "rotate(0deg)" : "rotate(90deg)",
                        transition: `${REVELADO}, transform 1000ms cubic-bezier(0.33,0,0.2,1)`,
                    }}
                >
                    <path
                        d="M1 1L5 5L9 1"
                        fill="none"
                        stroke="#c39767"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <Image
                    src={assetPath("/images/logo-bitacoria.webp")}
                    alt="BitacorIA"
                    width={128}
                    height={128}
                    priority
                    className={`shrink-0 h-auto ${tamLogo}`}
                    style={{
                        filter:
                            "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)",
                    }}
                />
            </button>

            <AnimatePresence>
                {abierto && habilitado && (
                    <motion.div
                        ref={panel}
                        initial={{ opacity: 0, y: -6, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.985 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        id={idPanel}
                        /* pt-3 en el envoltorio, no margen: deja un puente sin hueco
                           entre el logo y el panel para que el ratón no se salga. */
                        className="absolute right-0 top-full z-50 hidden pt-3 lg:block"
                        style={{ transformOrigin: "top right", marginRight: ajusteX }}
                    >
                        <div
                            className="rounded-2xl px-7 py-6"
                            style={{
                                background: "rgba(8, 4, 2, 0.96)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(195, 151, 103, 0.15)",
                                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                            }}
                        >
                            {/* flex, no grid-cols-3: las columnas 1fr de un grid colapsan
                                a cero dentro de un panel de ancho automático. */}
                            <div className="flex items-start gap-8">
                                {COLUMNAS.map((col, i) => (
                                    <div
                                        key={col.titulo}
                                        className={i > 0 ? "border-l border-white/[0.06] pl-8" : ""}
                                    >
                                        <p className="mb-4 whitespace-nowrap font-ui text-[12px] uppercase tracking-[0.22em] text-white/30">
                                            {col.titulo}
                                        </p>
                                        <ul className="flex flex-col gap-3">
                                            {col.elementos.map((el) => {
                                                const clases =
                                                    "flex items-center whitespace-nowrap text-left text-[15px] text-white/85 transition-colors duration-200 hover:text-[#c39767] focus-visible:text-[#c39767] focus-visible:outline-none";
                                                return (
                                                    <li key={el.label}>
                                                        {el.href ? (
                                                            <a href={el.href} onClick={() => alElegir(el)} className={clases}>
                                                                {el.label}
                                                            </a>
                                                        ) : (
                                                            <button type="button" onClick={() => alElegir(el)} className={clases}>
                                                                {el.label}
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* La cuenta vivía en la pastilla; al desaparecer, baja aquí. */}
                            <div className="mt-6 border-t border-white/[0.06] pt-5">
                                {account ? (
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] text-white/85">
                                                {account.nombre || account.email}
                                            </p>
                                            {account.nombre && (
                                                <p className="truncate text-[12px] text-white/40">{account.email}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { cerrarYa(); onSignOut(); }}
                                            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[13px] text-white/55 transition-colors hover:text-white"
                                        >
                                            <LogOut size={14} strokeWidth={1.8} />
                                            Cerrar sesión
                                        </button>
                                    </div>
                                ) : (
                                    <a
                                        href="/registro"
                                        onClick={cerrarYa}
                                        className="group flex items-center justify-between gap-6 text-[15px] font-medium text-[#c39767] transition-colors hover:text-[#e8c9a0]"
                                    >
                                        Acceder
                                        <ArrowRight
                                            size={15}
                                            strokeWidth={2}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
