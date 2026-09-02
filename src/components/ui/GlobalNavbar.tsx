"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, FolderPlus, Upload, MessageSquareText, ChevronRight, ChevronDown, User } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { useAccount, clearStoredAccount } from "@/lib/account";
import { signOut } from "@/lib/socialAuth";
import AccountMenu, { AccountRowMobile } from "./AccountMenu";

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
    { label: "Quiénes Somos", href: "#quienes" },
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Planes de Pago", href: "#soluciones" },
    { label: "Contacto", href: "#contacto" },
];

const REGISTER_URL = "/registro";
const SCROLL_THRESHOLD = 100; // px — después de esto cambia a slim

interface Props {
    onOpenQuienesSomos: () => void;
}

export default function GlobalNavbar({ onOpenQuienesSomos }: Props) {
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const account = useAccount();

    const handleSignOut = async () => {
        await signOut();
        clearStoredAccount();
        setIsMenuOpen(false);
    };

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
    const handleQuienes = () => {
        onOpenQuienesSomos();
        setIsMenuOpen(false);
    };
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
        if (link.href === "#quienes") {
            return (
                <button {...baseProps} onClick={() => { handleQuienes(); onItemClick?.(); }}>
                    {link.label}
                </button>
            );
        }
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
                /* El contenedor cambia de modo en el mismo punto que su contenido:
                   si la pill pasa a ancho completo en tablet pero el nav sigue
                   centrado y sin ancho, el hijo w-full se queda sin referencia. */
                className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 lg:left-1/2 lg:right-auto lg:top-6 lg:px-0 lg:-translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity: isScrolled ? 0 : 1,
                    y: isScrolled ? -16 : 0,
                }}
                transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as const }}
                style={{ pointerEvents: isScrolled ? "none" : "auto" }}
            >
                <div
                    /* El menú completo entra a partir de lg, no de md: en tablet
                       (768–1023) la pill se salía de la pantalla por la derecha. */
                    className="flex items-center justify-between lg:justify-start gap-3 lg:gap-5 rounded-full px-4 py-2 lg:px-5 lg:py-2 w-full lg:w-auto"
                    style={{
                        background: "rgba(12, 6, 4, 0.55)",
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                        border: "1px solid rgba(195, 151, 103, 0.15)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                >
                    {/* Logo image (existente) */}
                    {/* width/height 1:1 = ratio intrínseco real del asset (1182x1182):
                        evita el salto de altura (CLS) del pill navbar al decodificar. */}
                    <Image
                        src={assetPath("/images/logo-bitacoria.webp")}
                        alt="BitacorIA"
                        width={64}
                        height={64}
                        priority
                        className="shrink-0 w-12 lg:w-[54px] h-auto"
                        style={{
                            filter:
                                "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)",
                        }}
                    />

                    <div
                        className="hidden xl:block h-5 w-px shrink-0"
                        style={{ background: "rgba(195, 151, 103, 0.2)" }}
                    />

                    <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                        {NAV_LINKS.map((link) =>
                            renderNavLink(
                                link,
                                "whitespace-nowrap font-ui text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer bg-transparent border-none",
                                { color: "rgba(255,255,255,0.5)" },
                            )
                        )}
                    </div>

                    <div
                        className="hidden xl:block h-5 w-px shrink-0"
                        style={{ background: "rgba(195, 151, 103, 0.2)" }}
                    />

                    {/* ACCEDER button desktop */}
                    {account ? (
                        <AccountMenu account={account} onSignOut={handleSignOut} variant="pill" />
                    ) : (
                        <a
                            href={REGISTER_URL}
                            aria-label="Acceder o registrarte"
                            title="Acceder"
                            className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300"
                            style={{
                                background: "rgba(195, 151, 103, 0.12)",
                                border: "1px solid rgba(195, 151, 103, 0.4)",
                                color: "#c39767",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.22)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.65)";
                                e.currentTarget.style.color = "#f0d9b5";
                                e.currentTarget.style.boxShadow = "0 0 14px rgba(195, 151, 103, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.4)";
                                e.currentTarget.style.color = "#c39767";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <User size={16} strokeWidth={2} />
                        </a>
                    )}

                    {/* HAMBURGER mobile (hero state) */}
                    <button
                        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors"
                        style={{
                            background: "rgba(195,151,103,0.1)",
                            border: "1px solid rgba(195,151,103,0.25)",
                        }}
                        onClick={() => setIsMenuOpen((o) => !o)}
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
                        className="absolute top-full left-0 right-0 mt-3 md:hidden rounded-2xl overflow-hidden"
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
                            {account ? (
                                <AccountRowMobile account={account} onSignOut={handleSignOut} />
                            ) : (
                                <a
                                    href={REGISTER_URL}
                                    className="flex items-center justify-between font-ui text-xs uppercase tracking-widest px-6 py-3.5 transition-colors duration-200"
                                    style={{ color: "#c39767", background: "rgba(195, 151, 103, 0.08)" }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="leading-none">Acceder</span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                                </a>
                            )}
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
                style={{ pointerEvents: isScrolled ? "auto" : "none" }}
            >
                <div
                    className="flex items-center justify-between h-12 md:h-14 px-4 md:px-8 lg:px-12"
                    style={{
                        background: "rgba(8, 4, 2, 0.88)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(195, 151, 103, 0.12)",
                    }}
                >
                    {/* Logo: imagen horizontal BitacorIA filtrada a blanco puro */}
                    <a
                        href="#hero-or-chaos"
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center shrink-0 transition-opacity hover:opacity-80"
                        aria-label="BitacorIA — ir arriba"
                    >
                        <Image
                            src={assetPath("/images/logo-bitacoria-horizontal.png")}
                            alt="BitacorIA"
                            width={40}
                            height={40}
                            className="h-8 md:h-10 w-auto"
                            style={{
                                // Filtro a blanco puro — el PNG tiene alpha, así que invert(1)
                                // sobre el dark logo lo convierte en blanco translúcido.
                                filter: "brightness(0) invert(1)",
                            }}
                        />
                    </a>

                    {/* Nav links — slim center desktop */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-8">
                        {NAV_LINKS.map((link) =>
                            renderNavLink(
                                link,
                                "whitespace-nowrap font-ui text-[11px] uppercase tracking-widest transition-colors duration-300 cursor-pointer bg-transparent border-none",
                                { color: "rgba(255,255,255,0.55)" },
                            )
                        )}
                    </div>

                    {/* Acceder slim — desktop */}
                    {account ? (
                        <AccountMenu account={account} onSignOut={handleSignOut} variant="slim" />
                    ) : (
                        <a
                            href={REGISTER_URL}
                            aria-label="Acceder o registrarte"
                            title="Acceder"
                            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300"
                            style={{
                                background: "rgba(195, 151, 103, 0.12)",
                                border: "1px solid rgba(195, 151, 103, 0.4)",
                                color: "#c39767",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.22)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.65)";
                                e.currentTarget.style.color = "#f0d9b5";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.12)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.4)";
                                e.currentTarget.style.color = "#c39767";
                            }}
                        >
                            <User size={15} strokeWidth={2} />
                        </a>
                    )}

                    {/* HAMBURGER mobile (slim state) */}
                    <button
                        className="flex md:hidden items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors"
                        style={{
                            background: "rgba(195,151,103,0.08)",
                            border: "1px solid rgba(195,151,103,0.2)",
                        }}
                        onClick={() => setIsMenuOpen((o) => !o)}
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? (
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
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
                        className="md:hidden border-t"
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
                            {account ? (
                                <AccountRowMobile account={account} onSignOut={handleSignOut} />
                            ) : (
                                <a
                                    href={REGISTER_URL}
                                    className="flex items-center justify-between font-ui text-xs uppercase tracking-widest px-5 py-3 transition-colors duration-200"
                                    style={{ color: "#c39767", background: "rgba(195, 151, 103, 0.08)" }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="leading-none">Acceder</span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                                </a>
                            )}
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
                    <div
                        className="cream-glass relative w-full max-w-4xl rounded-2xl p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsHowItWorksOpen(false)}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5f0e8]/[0.2] text-[#e8ddc9]/[0.7] transition-colors hover:border-[#e8ddc9]/[0.5] hover:text-[#f5f0e8]"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        <p className="mb-1 text-center font-ui text-[10px] uppercase tracking-[0.3em] text-[#d8c4a8]">
                            El Flujo de
                        </p>
                        <h2 className="mb-10 text-center font-display text-2xl font-extrabold uppercase tracking-tight text-[#f5f0e8] sm:text-3xl">
                            BitacorIA
                        </h2>

                        {/* Flujo: 3 pasos con iconos + flechas (→ en desktop, ↓ en móvil) */}
                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            {/* Paso 1 */}
                            <div className="group relative flex flex-1 flex-col rounded-xl border border-[#f5f0e8]/[0.12] bg-[#f5f0e8]/[0.04] p-6 transition-colors hover:border-[#d8c4a8]/[0.4]">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-[#f5f0e8]/[0.06] select-none">
                                    01
                                </span>
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#d8c4a8]/[0.25] bg-[#d8c4a8]/[0.1] text-[#e8ddc9]">
                                    <FolderPlus size={20} strokeWidth={1.6} />
                                </div>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-[#d8c4a8]/[0.8]">
                                    Paso 1
                                </p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-[#f5f0e8]/[0.9]">
                                    Nuevo Proyecto
                                </h3>
                                <p className="text-[12px] leading-relaxed text-[#f5f0e8]/[0.55]">
                                    Crea tu proyecto. Solo necesitas el nombre de la obra.
                                </p>
                            </div>

                            {/* Flecha 1 → 2 */}
                            <div className="flex shrink-0 items-center justify-center text-[#d8c4a8]/[0.5]">
                                <ChevronRight className="hidden h-6 w-6 sm:block" strokeWidth={2} />
                                <ChevronDown className="h-5 w-5 sm:hidden" strokeWidth={2} />
                            </div>

                            {/* Paso 2 */}
                            <div className="group relative flex flex-1 flex-col rounded-xl border border-[#f5f0e8]/[0.12] bg-[#f5f0e8]/[0.04] p-6 transition-colors hover:border-[#d8c4a8]/[0.4]">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-[#f5f0e8]/[0.06] select-none">
                                    02
                                </span>
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#d8c4a8]/[0.25] bg-[#d8c4a8]/[0.1] text-[#e8ddc9]">
                                    <Upload size={20} strokeWidth={1.6} />
                                </div>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-[#d8c4a8]/[0.8]">
                                    Paso 2
                                </p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-[#f5f0e8]/[0.9]">
                                    Contextualiza{" "}
                                    <span className="text-[#f5f0e8]/[0.35] text-[10px] normal-case tracking-normal">
                                        (opcional)
                                    </span>
                                </h3>
                                <p className="text-[12px] leading-relaxed text-[#f5f0e8]/[0.55]">
                                    Carga tu catálogo de conceptos o tu calendario de obra. Si no tienes,
                                    inicia una bitácora en blanco.
                                </p>
                            </div>

                            {/* Flecha 2 → 3 */}
                            <div className="flex shrink-0 items-center justify-center text-[#d8c4a8]/[0.5]">
                                <ChevronRight className="hidden h-6 w-6 sm:block" strokeWidth={2} />
                                <ChevronDown className="h-5 w-5 sm:hidden" strokeWidth={2} />
                            </div>

                            {/* Paso 3 */}
                            <div className="group relative flex flex-1 flex-col rounded-xl border border-[#f5f0e8]/[0.12] bg-[#f5f0e8]/[0.04] p-6 transition-colors hover:border-[#d8c4a8]/[0.4]">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-[#f5f0e8]/[0.06] select-none">
                                    03
                                </span>
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#d8c4a8]/[0.25] bg-[#d8c4a8]/[0.1] text-[#e8ddc9]">
                                    <MessageSquareText size={20} strokeWidth={1.6} />
                                </div>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-[#d8c4a8]/[0.8]">
                                    Paso 3
                                </p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-[#f5f0e8]/[0.9]">
                                    Habla con tu Obra
                                </h3>
                                <p className="text-[12px] leading-relaxed text-[#f5f0e8]/[0.55]">
                                    Empieza a interactuar. La IA audita la información, cruza los datos
                                    y te da todo masticado.
                                </p>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-[11px] text-[#f5f0e8]/[0.35]">
                            Sin curva de aprendizaje. Sin configuraciones innecesarias.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
