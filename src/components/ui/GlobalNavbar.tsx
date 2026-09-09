"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, FolderPlus, Upload, MessageSquareText, type LucideIcon } from "lucide-react";
import LogoMenu from "./LogoMenu";
import { useAccount, clearStoredAccount } from "@/lib/account";
import { AccountRowMobile } from "./AccountMenu";
import { loginUrl, registerUrl } from "@/lib/appUrl";

/* ══════════════════════════════════════════════════════════════
   GlobalNavbar — two-state morphing navbar
   ──────────────────────────────────────────────────────────────
   • scrollY < SCROLL_THRESHOLD: navbar grande pill estilo Hero
     (frosted glass, centrado, top-6). Logo: la webp existente.
   • scrollY >= SCROLL_THRESHOLD: navbar slim full-width bar al top.
     Más delgada para no interferir con el contenido. Logo: SVG
     sparkle + "BITACORIA" en Orbitron (recreación del design nuevo).

   Ambas navbars se renderizan simultáneamente, controladas vía
   opacity/y + pointer-events. Transición suave por framer-motion.
   ══════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
    { label: "Quiénes Somos", href: "/nosotros" },
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Planes de Pago", href: "/#soluciones" },
    { label: "Contacto", href: "/#contacto" },
];

/* Los tres pasos del modal "Cómo funciona", como datos: repetir el mismo
   bloque tres veces escondía las diferencias entre ellos. */
const PASOS: {
    n: string;
    Icon: LucideIcon;
    titulo: string;
    nota?: string;
    texto: string;
}[] = [
    {
        n: "01",
        Icon: FolderPlus,
        titulo: "Nuevo proyecto",
        texto: "Crea tu proyecto. Solo necesitas el nombre de la obra.",
    },
    {
        n: "02",
        Icon: Upload,
        titulo: "Contextualiza",
        nota: "(opcional)",
        texto: "Carga tu catálogo de conceptos o tu calendario de obra. Si no tienes, inicia una bitácora en blanco.",
    },
    {
        n: "03",
        Icon: MessageSquareText,
        titulo: "Habla con tu obra",
        texto: "Empieza a interactuar. La IA audita la información, cruza los datos y te da todo masticado.",
    },
];

const SCROLL_THRESHOLD = 100; // px — después de esto cambia a slim
const BRONCE = "#C39767";

/* ── Acceso a la app: "Iniciar sesión" y "Empezar gratis" ──
   El sitio ya no da de alta a nadie: cuenta, pago y primera obra viven en
   la app (ver src/lib/appUrl.ts). Antes aquí había un único "Acceder" que
   abría la encuesta de /registro. Son <a> y no <Link> porque cruzan de
   origen: misma pestaña, sin prefetch. En escritorio van sueltos en la
   barra, a la derecha del logo; por debajo de lg viven al pie del menú
   hamburguesa, en ambos estados (pill y slim). */
function AccesoDesktop({ variant = "pill" }: { variant?: "pill" | "slim" }) {
    const tam = variant === "pill" ? "h-9 px-4" : "h-8 px-3.5";
    return (
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <a
                href={loginUrl()}
                rel="noopener"
                className={`flex items-center rounded-full font-ui text-xs uppercase tracking-widest transition-colors duration-200 ${tam}`}
                style={{ color: BRONCE, border: `1px solid ${BRONCE}40` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${BRONCE}1a`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
                Iniciar sesión
            </a>
            <a
                href={registerUrl("draft")}
                rel="noopener"
                className={`flex items-center rounded-full font-ui text-xs font-semibold uppercase tracking-widest transition-[filter] duration-200 hover:brightness-110 ${tam}`}
                style={{ background: BRONCE, color: "#1a120c" }}
            >
                Empezar gratis
            </a>
        </div>
    );
}

/* Mismas dos acciones para el menú hamburguesa. `compacto` sigue el padding
   de la barra delgada (px-5 / py-3) frente al del pill (px-6 / py-3.5). */
function AccesoMobile({ compacto = false, onClick }: { compacto?: boolean; onClick: () => void }) {
    const px = compacto ? "px-5" : "px-6";
    return (
        <>
            <a
                href={loginUrl()}
                rel="noopener"
                className={`flex items-center justify-between font-ui text-xs uppercase tracking-widest ${px} ${compacto ? "py-3" : "py-3.5"} transition-colors duration-200`}
                style={{ color: BRONCE, background: "rgba(195, 151, 103, 0.08)" }}
                onClick={onClick}
            >
                <span className="leading-none">Iniciar sesión</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
            </a>
            <div className={`${px} ${compacto ? "pb-2 pt-3" : "pb-2 pt-4"}`}>
                <a
                    href={registerUrl("draft")}
                    rel="noopener"
                    className="flex h-11 w-full items-center justify-center rounded-full font-ui text-xs font-semibold uppercase tracking-widest transition-[filter] duration-200 hover:brightness-110"
                    style={{ background: BRONCE, color: "#1a120c" }}
                    onClick={onClick}
                >
                    Empezar gratis
                </a>
            </div>
        </>
    );
}

export default function GlobalNavbar() {
    /* La marca va a la derecha SOLO en la home: allí el hero deja libre ese
       lado. En las demás páginas la foto ocupa la derecha, así que pasa a la
       izquierda —y con ella la flecha y el lado por el que abre el panel. */
    const enHome = usePathname() === "/";
    const lado = enHome ? "derecha" : "izquierda";

    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const account = useAccount();

    /* "Cerrar sesión" solo olvida el registro local del lead: www no tiene
       sesión propia (la de la app vive en app.bitacoria.com). */
    const handleSignOut = () => {
        clearStoredAccount();
        setIsMenuOpen(false);
    };

    /* Las dos barras están siempre montadas y la apagada solo se atenúa con
       opacity 0 + pointer-events none. Eso frena el ratón pero NO el teclado: al
       tabular, el foco caía en una barra invisible y Enter navegaba a ciegas.
       `inert` la saca del orden de tabulación y del árbol de accesibilidad; se
       aplica por atributo porque React 18 no admite la prop. */
    const pillRef = useRef<HTMLElement>(null);
    const slimRef = useRef<HTMLElement>(null);
    useEffect(() => {
        const marcar = (el: HTMLElement | null, inerte: boolean) => {
            if (!el) return;
            if (inerte) el.setAttribute("inert", "");
            else el.removeAttribute("inert");
        };
        marcar(pillRef.current, isScrolled);
        marcar(slimRef.current, !isScrolled);
    }, [isScrolled]);

    /* Escape cierra "Cómo Funciona", como en los demás modales del sitio. */
    useEffect(() => {
        if (!isHowItWorksOpen) return;
        const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") setIsHowItWorksOpen(false); };
        window.addEventListener("keydown", alTeclear);
        return () => window.removeEventListener("keydown", alTeclear);
    }, [isHowItWorksOpen]);

    /* ── Scroll listener — toggle entre hero-pill y slim-bar ── */
    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };
        onScroll(); // initial check (in case loaded mid-scroll)
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── Handlers compartidos ── */
    const handleComoFunciona = () => {
        setIsHowItWorksOpen(true);
        setIsMenuOpen(false);
    };

    /* ── Render de un nav link (decide entre button/anchor según href) ── */
    const renderNavLink = (
        link: (typeof NAV_LINKS)[number],
        className: string,
        style: React.CSSProperties,
        onItemClick?: () => void,
    ) => {
        const baseProps = {
            key: link.href,
            className,
            style,
            onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.color = "#c39767";
            },
            onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.color = style.color as string;
            },
        };
        if (link.href === "#como-funciona") {
            return (
                <button {...baseProps} onClick={() => { handleComoFunciona(); onItemClick?.(); }}>
                    {link.label}
                </button>
            );
        }
        return (
            <a {...baseProps} href={link.href} onClick={() => onItemClick?.()}>
                {link.label}
            </a>
        );
    };

    return (
        <>
            {/* ══════════════════════════════════════════════
                STATE 1: HERO PILL NAVBAR (scrollY < threshold)
                ══════════════════════════════════════════════ */}
            <motion.nav
                /* Sin pastilla: la marca va suelta sobre el hero, alineada con el
                   titular. Toda la navegación vive dentro del menú del logo. */
                /* Mismo padding que .hero-grid (px-6 / md:px-10 / lg:px-16) para
                   que la marca quede a plomo con el titular. */
                className={`fixed top-4 left-0 right-0 z-50 px-6 md:px-10 lg:top-6 ${enHome ? "lg:px-16" : "lg:px-10"}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: isScrolled ? 0 : 1,
                    y: isScrolled ? -16 : 0,
                }}
                transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as const }}
                ref={pillRef}
                style={{ pointerEvents: isScrolled ? "none" : "auto" }}
                aria-hidden={isScrolled}
            >
                <div className={`flex w-full items-center gap-3 ${enHome ? "justify-end" : "justify-between"}`}>
                    {/* El logo ES la navegación: enlaces, cuenta y todo lo demás
                        viven dentro de su menú (ver LogoMenu). */}
                    <LogoMenu
                        onComoFunciona={handleComoFunciona}
                        account={account}
                        onSignOut={handleSignOut}
                        lado={lado}
                    />

                    {/* Acceso a la app (solo lg+; en móvil va en el desplegable). En la
                        home, con justify-end, queda a la derecha del logo; en las demás,
                        con justify-between, en el borde derecho. */}
                    <AccesoDesktop />

                    {/* HAMBURGER mobile (hero state) */}
                    <button
                        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors"
                        style={{
                            background: "rgba(195,151,103,0.1)",
                            border: "1px solid rgba(195,151,103,0.25)",
                        }}
                        onClick={() => setIsMenuOpen((o) => !o)}
                        /* El icono ya cambia a X, pero el nombre accesible estaba fijo:
                           el lector anunciaba "Abrir menú" mientras el botón cerraba. */
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M1 1l12 12M13 1L1 13" stroke="#c39767" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                <path d="M0 1h16M0 6h16M0 11h16" stroke="#c39767" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* MOBILE DROPDOWN (hero state) */}
                {isMenuOpen && !isScrolled && (
                    <div
                        /* lg, no md: la hamburguesa del pill se muestra hasta 1024px
                           (los links entran en lg). Con md:hidden, en tablet el botón
                           abría un menú que este contenedor ocultaba. */
                        className="absolute top-full left-0 right-0 mt-3 lg:hidden rounded-2xl overflow-hidden"
                        style={{
                            background: "rgba(8, 4, 2, 0.94)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(195,151,103,0.15)",
                            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                        }}
                    >
                        <nav className="flex flex-col py-4">
                            {NAV_LINKS.map((link) =>
                                renderNavLink(
                                    link,
                                    "w-full text-left font-ui text-xs uppercase tracking-widest px-6 py-3.5 transition-colors duration-200 border-b border-white/[0.04]",
                                    { color: "rgba(255,255,255,0.55)" },
                                    () => setIsMenuOpen(false),
                                )
                            )}
                            {/* La cuenta local (lead de /registro o Google del sitio) no es
                                sesión de la app: el acceso se ofrece siempre, con o sin ella. */}
                            {account && <AccountRowMobile account={account} onSignOut={handleSignOut} />}
                            <AccesoMobile onClick={() => setIsMenuOpen(false)} />
                        </nav>
                    </div>
                )}
            </motion.nav>

            {/* ══════════════════════════════════════════════
                STATE 2: SLIM NAVBAR (scrollY >= threshold)
                ══════════════════════════════════════════════ */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50"
                initial={{ opacity: 0, y: -16 }}
                animate={{
                    opacity: isScrolled ? 1 : 0,
                    y: isScrolled ? 0 : -16,
                }}
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const }}
                ref={slimRef}
                style={{ pointerEvents: isScrolled ? "auto" : "none" }}
                aria-hidden={!isScrolled}
            >
                <div
                    className={`flex items-center gap-3 h-12 md:h-14 px-6 md:px-10 ${enHome ? "lg:px-16 justify-end" : "lg:px-10 justify-between"}`}
                    style={{
                        background: "rgba(8, 4, 2, 0.88)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(195, 151, 103, 0.12)",
                    }}
                >
                    {/* Mismo menú del logo, en tamaño reducido: al bajar no reaparece
                        una barra de enlaces distinta de la del hero. */}
                    <LogoMenu
                        onComoFunciona={handleComoFunciona}
                        account={account}
                        onSignOut={handleSignOut}
                        variant="slim"
                        lado={lado}
                    />

                    <AccesoDesktop variant="slim" />

                    {/* HAMBURGER mobile (slim state) */}
                    <button
                        className="flex lg:hidden items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors"
                        style={{
                            background: "rgba(195,151,103,0.08)",
                            border: "1px solid rgba(195,151,103,0.2)",
                        }}
                        onClick={() => setIsMenuOpen((o) => !o)}
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? (
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M1 1l12 12M13 1L1 13" stroke="#c39767" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
                                <path d="M0 1h16M0 6h16M0 11h16" stroke="#c39767" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* MOBILE DROPDOWN (slim state) */}
                {isMenuOpen && isScrolled && (
                    <div
                        className="lg:hidden border-t"
                        style={{
                            background: "rgba(8, 4, 2, 0.95)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            borderColor: "rgba(195,151,103,0.12)",
                        }}
                    >
                        <nav className="flex flex-col py-2">
                            {NAV_LINKS.map((link) =>
                                renderNavLink(
                                    link,
                                    "w-full text-left font-ui text-xs uppercase tracking-widest px-5 py-3 transition-colors duration-200 border-b border-white/[0.04]",
                                    { color: "rgba(255,255,255,0.55)" },
                                    () => setIsMenuOpen(false),
                                )
                            )}
                            {account && <AccountRowMobile account={account} onSignOut={handleSignOut} />}
                            <AccesoMobile compacto onClick={() => setIsMenuOpen(false)} />
                        </nav>
                    </div>
                )}
            </motion.nav>

            {/* ══════════════════════════════════════════════
                CÓMO FUNCIONA MODAL (shared, ambos estados)
                ══════════════════════════════════════════════ */}
            {isHowItWorksOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setIsHowItWorksOpen(false)}
                >
                    {/* max-h + scroll interno: sin ellos, los 3 pasos apilados en móvil
                        desbordan y el centrado recorta ARRIBA, dejando la × fuera de la
                        pantalla sin más salida que acertar en el borde del fondo. */}
                    <div
                        className="cream-glass relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl p-8"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cómo funciona BitacorIA"
                    >
                        <button
                            onClick={() => setIsHowItWorksOpen(false)}
                            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5f0e8]/[0.2] text-[#e8ddc9]/[0.7] transition-colors hover:border-[#e8ddc9]/[0.5] hover:text-[#f5f0e8]"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-fino pr-3" data-lenis-prevent>
                        <p className="mb-1 text-center font-ui text-[10px] uppercase tracking-[0.3em] text-[#d8c4a8]">
                            El Flujo de
                        </p>
                        <h2 className="mb-10 text-center font-display text-2xl font-extrabold uppercase tracking-tight text-[#f5f0e8] sm:text-3xl">
                            BitacorIA
                        </h2>

                        {/* Tres pasos como entradas de bitácora: número en
                            monoespaciada, icono desnudo y una regla que separa.
                            Antes eran tres tarjetas con borde, relleno y flechas
                            entre ellas — cajas dentro de una caja, y el mismo
                            aspecto genérico que quitamos de la encuesta. */}
                        <div className="divide-y divide-[#f5f0e8]/[0.08]">
                            {PASOS.map(({ n, Icon, titulo, nota, texto }) => (
                                <div key={n} className="flex gap-5 py-6 first:pt-0 last:pb-0">
                                    <div className="flex shrink-0 flex-col items-center gap-3 pt-0.5">
                                        <span className="font-mono text-[12px] tracking-[0.18em] text-[#c39767]/70">
                                            {n}
                                        </span>
                                        <Icon size={19} strokeWidth={1.5} className="text-[#c39767]/55" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="mb-2 font-display text-[15px] font-bold uppercase tracking-wide text-[#f5f0e8]">
                                            {titulo}
                                            {nota && (
                                                <span className="ml-2 font-sans text-[12px] font-normal normal-case tracking-normal text-[#f5f0e8]/35">
                                                    {nota}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-[15px] leading-relaxed text-[#f5f0e8]/55">
                                            {texto}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-8 text-center text-[11px] text-[#f5f0e8]/[0.35]">
                            Sin curva de aprendizaje. Sin configuraciones innecesarias.
                        </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
