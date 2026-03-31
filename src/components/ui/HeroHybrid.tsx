"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { assetPath } from "@/lib/assetPath";
import { ArrowRight } from "lucide-react";


/* ══════════════════════════════════════════════════════════════
   HeroHybrid — Self-contained Hero Section
   ──────────────────────────────────────────────────────────────
   Background layers:
     0  Solid dark base (#0c0604)
     1  Subtle golden grid (CSS repeating gradients)
     2  Building image area (with cursor flashlight)
     4  Bottom fade
     5  Vignette
   Foreground:
     Content (tagline, headline, CTAs)
     Scroll indicator
     Frosted-glass navbar
   ══════════════════════════════════════════════════════════════ */

const FILTER_BASE =
    "invert(1) sepia(1) hue-rotate(-15deg) brightness(0.7) saturate(2)";
const FILTER_LIT =
    "invert(1) sepia(1) hue-rotate(-15deg) brightness(1.5) saturate(4) contrast(1.2)";

const NAV_LINKS = [
    { label: "Quiénes Somos", href: "#quienes" },
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Planes de Pago", href: "#soluciones" },
    { label: "Contacto", href: "#contacto" },
];

/* ── Animation helpers ── */
const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
};

export default function HeroHybrid({ onOpenQuienesSomos }: { onOpenQuienesSomos: () => void }) {
    const buildingRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- Video Carousel State ---
    const VIDEOS = [
        "/plataforma/videos/hero_video_1.mp4",
        "/plataforma/videos/hero_video_2.mp4",
        "/plataforma/videos/hero_video_3.mp4"
    ];
    const [activeVideo, setActiveVideo] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveVideo((v) => (v + 1) % VIDEOS.length);
        }, 8000); // 8 seconds per video loop
        return () => clearInterval(interval);
    }, []);
    // ── Glow effect state (whole section) ──
    const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const el = buildingRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        },
        [],
    );

    /* ── Grid CSS ── */
    const gridBg = [
        "repeating-linear-gradient(to right, rgba(195,151,103,0.045) 0px, rgba(195,151,103,0.045) 1px, transparent 1px, transparent 80px)",
        "repeating-linear-gradient(to bottom, rgba(195,151,103,0.045) 0px, rgba(195,151,103,0.045) 1px, transparent 1px, transparent 80px)",
    ].join(", ");

    return (
        <section
            className="relative min-h-screen overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setPointer(p => ({ ...p, active: false }))}
        >
            {/* ── SECCIÓN GLOW — sigue al puntero / dedo en toda la sección ── */}
            <div
                className="absolute inset-0 pointer-events-none z-[3] transition-opacity duration-500"
                style={{
                    opacity: pointer.active ? 1 : 0,
                    background: `radial-gradient(circle 280px at ${pointer.x}px ${pointer.y}px, rgba(196,167,125,0.13), transparent 80%)`,
                }}
            />

            {/* ══════════════════════════════════════════════
                BACKGROUND LAYERS
                ══════════════════════════════════════════════ */}
            <div className="absolute inset-0 overflow-hidden">

                {/* ── LAYER 0: Solid dark base ── */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#0c0604" }}
                />

                {/* ── LAYER 1: Golden Grid ── */}
                <motion.div
                    className="absolute inset-0 z-[1]"
                    style={{ background: gridBg }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                />

                {/* ── BUILDING AREA — mouse tracking lives here ── */}
                <div
                    ref={buildingRef}
                    className="absolute top-0 right-0 z-[2] h-full w-full md:w-2/3"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Base image — bronze ghost */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            WebkitMaskImage:
                                "linear-gradient(to left, black 60%, transparent 100%)",
                            maskImage:
                                "linear-gradient(to left, black 60%, transparent 100%)",
                        }}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 1.6,
                            ease: [0.25, 0.4, 0.25, 1] as const,
                            delay: 0.3,
                        }}
                    >
                        {VIDEOS.map((src, i) => (
                            <video
                                key={`base-${src}`}
                                src={assetPath(src.replace('/plataforma', ''))}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 object-cover object-center w-full h-full transition-opacity duration-1000"
                                style={{
                                    filter: FILTER_BASE,
                                    mixBlendMode: "screen",
                                    opacity: i === activeVideo ? 0.5 : 0,
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Lit image — cursor flashlight (building only) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            WebkitMaskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, black 20%, transparent 80%)`,
                            maskImage: `radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, black 20%, transparent 80%)`,
                            opacity: isHovering ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                    >
                        {VIDEOS.map((src, i) => (
                            <video
                                key={`lit-${src}`}
                                src={assetPath(src.replace('/plataforma', ''))}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 object-cover object-center w-full h-full transition-opacity duration-1000"
                                style={{
                                    filter: FILTER_LIT,
                                    mixBlendMode: "screen",
                                    opacity: i === activeVideo ? 1 : 0,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* ── LAYER 4: Bottom fade ── */}
                <div
                    className="absolute bottom-0 left-0 z-[4] w-full pointer-events-none"
                    style={{
                        height: "20%",
                        background:
                            "linear-gradient(to top, #0c0604 5%, transparent 100%)",
                    }}
                />

                {/* ── LAYER 5: Vignette ── */}
                <div
                    className="absolute inset-0 z-[5] pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 60% at 30% 50%, transparent 0%, rgba(12,6,4,0.4) 100%)",
                    }}
                />
            </div>

            {/* ══════════════════════════════════════════════
                FROSTED-GLASS NAVBAR
                ══════════════════════════════════════════════ */}
            <motion.nav
                className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4 md:left-1/2 md:right-auto md:top-6 md:px-0 md:-translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] as const }}
            >
                <div
                    className="flex items-center justify-between md:justify-start gap-3 md:gap-8 rounded-full px-4 py-2.5 md:px-8 md:py-3 w-full md:w-auto"
                    style={{
                        background: "rgba(12, 6, 4, 0.5)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(195, 151, 103, 0.15)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                >
                    <Image
                        src={assetPath("/images/logo-bitacoria.webp")}
                        alt="BitacorIA"
                        width={100}
                        height={32}
                        className="shrink-0 w-16 md:w-[100px] h-auto"
                        style={{
                            filter:
                                "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)",
                        }}
                    />
                    <div
                        className="hidden md:block h-5 w-px shrink-0"
                        style={{ background: "rgba(195, 151, 103, 0.2)" }}
                    />
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => {
                            // "Quiénes Somos" opens the modal instead of scrolling
                            if (link.href === "#quienes") {
                                return (
                                    <button
                                        key={link.href}
                                        onClick={onOpenQuienesSomos}
                                        className="whitespace-nowrap font-ui text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer bg-transparent border-none"
                                        style={{ color: "rgba(255,255,255,0.5)" }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.color = "#c39767")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                                        }
                                    >
                                        {link.label}
                                    </button>
                                );
                            }
                            if (link.href === "#como-funciona") {
                                return (
                                    <button
                                        key={link.href}
                                        onClick={() => setIsHowItWorksOpen(true)}
                                        className="whitespace-nowrap font-ui text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer bg-transparent border-none"
                                        style={{ color: "rgba(255,255,255,0.5)" }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.color = "#c39767")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                                        }
                                    >
                                        {link.label}
                                    </button>
                                );
                            }
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="whitespace-nowrap font-ui text-xs uppercase tracking-widest transition-colors duration-300"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "#c39767")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                        "rgba(255,255,255,0.5)")
                                    }
                                >
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                    {/* ── HAMBURGER BUTTON (solo móvil) ── */}
                    <button
                        className="flex md:hidden items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors"
                        style={{ background: "rgba(195,151,103,0.1)", border: "1px solid rgba(195,151,103,0.25)" }}
                        onClick={() => setIsMenuOpen(o => !o)}
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? (
                            /* ── X icon ── */
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M1 1l12 12M13 1L1 13" stroke="#c39767" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        ) : (
                            /* ── Hamburger icon ── */
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                <path d="M0 1h16M0 6h16M0 11h16" stroke="#c39767" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* ── MOBILE DROPDOWN MENU ── */}
                {isMenuOpen && (
                    <div
                        className="absolute top-full left-0 right-0 mt-3 md:hidden rounded-2xl overflow-hidden"
                        style={{
                            background: "rgba(8, 4, 2, 0.92)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(195,151,103,0.15)",
                            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                        }}
                    >
                        <nav className="flex flex-col py-4">
                            {NAV_LINKS.map((link) => {
                                const baseClass = "w-full text-left font-ui text-xs uppercase tracking-widest px-6 py-3.5 transition-colors duration-200 border-b border-white/[0.04] last:border-0";
                                const style = { color: "rgba(255,255,255,0.55)" };

                                if (link.href === "#quienes") {
                                    return (
                                        <button key={link.href}
                                            className={baseClass} style={style}
                                            onClick={() => { onOpenQuienesSomos(); setIsMenuOpen(false); }}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                }
                                if (link.href === "#como-funciona") {
                                    return (
                                        <button key={link.href}
                                            className={baseClass} style={style}
                                            onClick={() => { setIsHowItWorksOpen(true); setIsMenuOpen(false); }}
                                        >
                                            {link.label}
                                        </button>
                                    );
                                }
                                return (
                                    <a key={link.href} href={link.href}
                                        className={baseClass} style={style}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </motion.nav>

            {/* ══════════════════════════════════════════════
                HERO CONTENT — Text + Liquid Glass Buttons
                ══════════════════════════════════════════════ */}
            <div className="relative z-20 flex min-h-screen items-center pointer-events-none">
                <div className="mx-auto w-full max-w-[1600px] px-6 md:px-16 lg:px-24">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="relative z-10 max-w-xl pointer-events-auto"
                    >
                        {/* Tag line */}
                        <motion.p
                            custom={0}
                            variants={fadeUp}
                            className="mb-4 font-ui text-xs uppercase tracking-[0.3em] text-[#c39767]/70"
                        >
                            Plataforma de Gestión Inteligente
                        </motion.p>

                        {/* Headline */}
                        <motion.h1
                            custom={1}
                            variants={fadeUp}
                            className="mb-5 font-display text-3xl font-extrabold uppercase leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl"
                        >
                            Auditoría
                            <br />
                            inteligente
                            <br />
                            <span className="text-gradient">para tu obra.</span>
                        </motion.h1>

                        {/* Sub-headline */}
                        <motion.p
                            custom={2}
                            variants={fadeUp}
                            className="mb-12 max-w-md text-sm leading-relaxed text-text/40 lg:text-base"
                        >
                            Administra usuarios, valida documentos y permite que la IA
                            aprenda de tus propios datos para prevenir errores antes de
                            construir.
                        </motion.p>

                        {/* CTAs — Liquid Glass Bronze */}
                        <motion.div custom={3} variants={fadeUp} className="flex flex-wrap gap-4">
                            <a
                                href="#contacto"
                                className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3 font-ui text-xs font-medium uppercase tracking-widest text-white/90 transition-all duration-300"
                                style={{
                                    background: "rgba(195, 151, 103, 0.08)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    border: "1px solid rgba(195, 151, 103, 0.3)",
                                    boxShadow:
                                        "inset 0 0 15px rgba(195, 151, 103, 0.1), 0 4px 10px rgba(0,0,0,0.5)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(195, 151, 103, 0.18)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(195, 151, 103, 0.5)";
                                    e.currentTarget.style.boxShadow =
                                        "inset 0 0 20px rgba(195, 151, 103, 0.15), 0 4px 15px rgba(0,0,0,0.6)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "rgba(195, 151, 103, 0.08)";
                                    e.currentTarget.style.borderColor =
                                        "rgba(195, 151, 103, 0.3)";
                                    e.currentTarget.style.boxShadow =
                                        "inset 0 0 15px rgba(195, 151, 103, 0.1), 0 4px 10px rgba(0,0,0,0.5)";
                                }}
                            >
                                Solicitar Demo
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </a>

                        </motion.div>


                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="font-mono text-xs text-text/10"
                >
                    ↓ scroll
                </motion.div>
            </div>

            {/* ── CÓMO FUNCIONA MODAL ── */}
            {isHowItWorksOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setIsHowItWorksOpen(false)}
                >
                    <div
                        className="relative w-full max-w-4xl rounded-2xl border border-amber-900/50 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(120,53,15,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsHowItWorksOpen(false)}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 transition-colors hover:border-amber-700/50 hover:text-amber-500"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        {/* Title */}
                        <p className="mb-1 text-center font-ui text-[10px] uppercase tracking-[0.3em] text-amber-700/60">El Flujo de</p>
                        <h2 className="mb-10 text-center font-display text-2xl font-extrabold uppercase tracking-tight text-white/90 sm:text-3xl">
                            BitacorIA
                        </h2>

                        {/* 3-step diagram */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                            {/* Connector line (desktop only) */}
                            {/* Step 1 */}
                            <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-amber-900/60">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-amber-500/[0.07] select-none">01</span>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-amber-600/60">Paso 1</p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-white/80">Nuevo Proyecto</h3>
                                <p className="text-[12px] leading-relaxed text-zinc-400">
                                    Crea tu proyecto. Solo necesitas el nombre de la obra.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-amber-900/60">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-amber-500/[0.07] select-none">02</span>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-amber-600/60">Paso 2</p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-white/80">Contextualiza <span className="text-zinc-600 text-[10px] normal-case tracking-normal">(opcional)</span></h3>
                                <p className="text-[12px] leading-relaxed text-zinc-400">
                                    Carga tu catálogo de conceptos o tu calendario de obra. Si no tienes, inicia una bitácora en blanco.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-amber-900/60">
                                <span className="pointer-events-none absolute right-4 top-3 font-display text-6xl font-extrabold leading-none text-amber-500/[0.07] select-none">03</span>
                                <p className="mb-2 font-ui text-[9px] uppercase tracking-[0.25em] text-amber-600/60">Paso 3</p>
                                <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-white/80">Habla con tu Obra</h3>
                                <p className="text-[12px] leading-relaxed text-zinc-400">
                                    Empieza a interactuar. La IA audita la información, cruza los datos y te da todo masticado.
                                </p>
                            </div>

                        </div>

                        {/* Bottom hint */}
                        <p className="mt-8 text-center text-[11px] text-zinc-600">
                            Sin curva de aprendizaje. Sin configuraciones innecesarias.
                        </p>
                    </div>
                </div>
            )}

        </section>
    );
}
