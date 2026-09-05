"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LogOut } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
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
    accion?: "comoFunciona";
};

/* Anclas con "/" delante: desde una página que no es la home, un href
   "#soluciones" no lleva a ninguna parte porque esa sección no existe ahí.
   Con "/#soluciones" el navegador vuelve a la home y salta; estando ya en
   la home no recarga, solo desplaza. */
const COLUMNAS: { titulo: string; elementos: Elemento[] }[] = [
    {
        titulo: "Producto",
        elementos: [
            { label: "Smart Concepts", href: "/smart-concepts" },
            { label: "Smart Log", href: "/smart-log" },
            { label: "Smart Calendar", href: "/smart-calendar" },
            { label: "Smart BIM", href: "/smart-bim" },
            { label: "Smart Island", href: "/smart-island" },
        ],
    },
    {
        titulo: "Descubre",
        elementos: [
            { label: "Cómo funciona", accion: "comoFunciona" },
            { label: "El problema", href: "/el-problema" },
            { label: "Alcance global", href: "/alcance-global" },
            { label: "Planes y precios", href: "/#soluciones" },
        ],
    },
    {
        titulo: "Compañía",
        elementos: [
            { label: "Quiénes somos", href: "/nosotros" },
            { label: "Contacto", href: "/#contacto" },
        ],
    },
];

interface Props {
    onComoFunciona: () => void;
    account: Account | null;
    onSignOut: () => void;
    /* El hero lo lleva más grande que la barra delgada del scroll. */
    variant?: "pill" | "slim";
    /* En qué borde se apoya la marca. Manda todo lo demás: de qué lado abre
       el panel, dónde va la flecha y hacia dónde apunta en reposo. */
    lado?: "izquierda" | "derecha";
}

export default function LogoMenu({
    onComoFunciona,
    account,
    onSignOut,
    variant = "pill",
    lado = "izquierda",
}: Props) {
    const aLaDerecha = lado === "derecha";
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

    /* El panel cuelga del logo, así que el borde que se puede salir es el
       contrario al que abre. Se mide al abrir y se corrige; con JS y no con un
       ancho fijo, para que siga valiendo cuando el menú crezca. */
    useLayoutEffect(() => {
        if (!abierto) { setAjusteX(0); return; }
        const el = panel.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const exceso = aLaDerecha ? 16 - r.left : r.right - (window.innerWidth - 16);
        if (exceso > 0) setAjusteX(-exceso);
    }, [abierto, aLaDerecha]);

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
            contenedor.current?.querySelector("a")?.focus();
        };
        window.addEventListener("keydown", alTeclear);
        return () => window.removeEventListener("keydown", alTeclear);
    }, [abierto]);

    const alElegir = (el: Elemento) => {
        if (el.accion === "comoFunciona") onComoFunciona();
        cerrarYa();
    };

    /* Lockup horizontal (500x191): se mide por ancho y el alto sale solo.
       En slim debe caber en una barra de 48/56px de alto. */
    const tamLogo = variant === "pill" ? "w-36 lg:w-44" : "w-20 lg:w-24";
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
            {/* Enlace, no botón: pulsar la marca lleva al inicio, que es lo que
                todo el mundo espera de un logo. El menú no depende del clic —se
                abre al acercar el ratón y, con teclado, al recibir el foco—, así
                que ambas cosas conviven sin pisarse. */}
            <Link
                href="/"
                aria-haspopup={habilitado ? "true" : undefined}
                aria-expanded={habilitado ? abierto : undefined}
                aria-controls={habilitado ? idPanel : undefined}
                aria-label={habilitado ? "BitacorIA — ir al inicio y abrir menú" : "BitacorIA — ir al inicio"}
                onClick={cerrarYa}
                className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60"
            >
                <Image
                    src={assetPath("/images/logo_horizontal-removebg-preview.png")}
                    alt="BitacorIA"
                    width={500}
                    height={191}
                    priority
                    className={`shrink-0 h-auto ${tamLogo}`}
                    style={{
                        filter:
                            "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)",
                    }}
                />
                {/* Va DESPUÉS del logo: con la marca pegada al borde izquierdo, la
                    flecha queda por dentro y apunta hacia el contenido.
                    El trazo dibuja un galón hacia ABAJO; en reposo se gira -90°
                    (apunta a la derecha) y al acercar el ratón vuelve a 0°.
                    El giro dura lo mismo que el fundido para que aparecer y
                    girar se lean como un solo gesto, no como dos. */}
                <svg
                    aria-hidden
                    viewBox="0 0 10 6"
                    className={`hidden lg:block h-[6px] w-[10px] shrink-0 ${aLaDerecha ? "order-first" : ""}`}
                    style={{
                        opacity: visible ? 1 : 0,
                        /* Siempre queda por dentro y apunta hacia el contenido:
                           a la izquierda si la marca está pegada al borde
                           derecho, a la derecha si está pegada al izquierdo. */
                        transform: visible ? "rotate(0deg)" : `rotate(${aLaDerecha ? 90 : -90}deg)`,
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
            </Link>

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
                        className={`absolute top-full z-50 hidden pt-3 lg:block ${aLaDerecha ? "right-0" : "left-0"}`}
                        style={
                            aLaDerecha
                                ? { transformOrigin: "top right", marginRight: ajusteX }
                                : { transformOrigin: "top left", marginLeft: ajusteX }
                        }
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
