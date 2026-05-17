"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

/* ── Lazy-loaded video carousel (Sprint 4.1) ── */
const HeroVideoCarousel = dynamic(() => import("./HeroVideoCarousel"), { ssr: false });

/* ══════════════════════════════════════════════════════════════
   HeroHybrid — Self-contained Hero Section
   ──────────────────────────────────────────────────────────────
   Background layers:
     0  Solid dark base (#0c0604)
     1  Subtle golden grid (CSS repeating gradients)
     2  Video area (5 videos in sequential loop with crossfade)
     4  Bottom fade
     5  Vignette
     5.5 Mobile text contrast overlay
   Foreground:
     Content (tagline, headline, CTAs)
     Scroll indicator
   NOTA: la navbar fue movida a GlobalNavbar.tsx (fixed, persiste
   en todo el scroll de la landing). El "Cómo Funciona" modal
   también vive ahí ahora.
   ══════════════════════════════════════════════════════════════ */

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

export default function HeroHybrid() {
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

                {/* ── VIDEO AREA — lazy-loaded carousel (Sprint 4.1) ── */}
                <HeroVideoCarousel />

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

                {/* ── LAYER 5.5: Mobile Text Contrast ── */}
                <div 
                    className="absolute inset-0 z-[6] pointer-events-none md:hidden bg-gradient-to-r from-[#0c0604]/90 via-[#0c0604]/70 to-transparent" 
                />
            </div>

            {/* NAVBAR: movida a GlobalNavbar (fixed, persiste en todo el scroll) */}

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

    </section>
    );
}

