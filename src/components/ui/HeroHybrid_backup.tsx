"use client";

import { useRef, useCallback, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
        <section className="relative min-h-screen overflow-hidden">

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
                    className="absolute top-0 right-0 z-[2] h-full w-2/3"
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
                        <Image
                            src="/images/render3d.webp"
                            alt="Estructura arquitectónica — base"
                            fill
                            priority
                            className="object-cover object-center"
                            style={{
                                filter: FILTER_BASE,
                                mixBlendMode: "screen",
                                opacity: 0.5,
                            }}
                        />
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
                        <Image
                            src="/images/render3d.webp"
                            alt="Estructura arquitectónica — iluminada"
                            fill
                            priority={false}
                            className="object-cover object-center"
                            style={{
                                filter: FILTER_LIT,
                                mixBlendMode: "screen",
                            }}
                        />
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
                className="absolute top-8 left-1/2 z-50 -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] as const }}
            >
                <div
                    className="flex items-center gap-8 rounded-full px-8 py-3"
                    style={{
                        background: "rgba(12, 6, 4, 0.5)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(195, 151, 103, 0.15)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                >
                    <Image
                        src="/images/LOGO-BITACORIA-IMPI-TRANSPARENTE-PNG-01.png"
                        alt="BitacorIA"
                        width={100}
                        height={32}
                        className="shrink-0"
                        style={{
                            filter:
                                "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)",
                        }}
                    />
                    <div
                        className="h-5 w-px shrink-0"
                        style={{ background: "rgba(195, 151, 103, 0.2)" }}
                    />
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
            </motion.nav>

            {/* ══════════════════════════════════════════════
                HERO CONTENT — Text + Liquid Glass Buttons
                ══════════════════════════════════════════════ */}
            <div className="relative z-20 flex min-h-screen items-center pointer-events-none">
                <div className="mx-auto w-full max-w-[1600px] px-8 md:px-16 lg:px-24">
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
        </section>
    );
}
