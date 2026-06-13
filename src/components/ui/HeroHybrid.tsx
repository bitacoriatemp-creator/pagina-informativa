"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRegistroModal } from "./RegistroModal";
import { signInWithGoogle } from "@/lib/socialAuth";

/* Apple Sign-In requiere cuenta Apple Developer ($99/año).
   El botón ya está construido abajo — cambia a `true` cuando el
   proveedor esté configurado en Supabase. */
const APPLE_ENABLED = false;

/* Logo "G" oficial multicolor de Google */
const GoogleG = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
);

/* Logo Apple (monocromo) */
const AppleLogo = () => (
    <svg width="17" height="17" viewBox="0 0 384 512" aria-hidden="true" fill="currentColor">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
);

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
    /* ── Registro inline: Google OAuth o correo → modal pre-llenado ── */
    const { openModal } = useRegistroModal();
    const [heroEmail, setHeroEmail] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleHeroSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        openModal({ email: heroEmail.trim() });
    };

    const handleGoogle = async () => {
        if (googleLoading) return;
        setGoogleLoading(true);
        const started = await signInWithGoogle();
        if (!started) {
            // Proveedor aún no configurado → fallback al formulario normal.
            openModal({});
            setGoogleLoading(false);
        }
        // Si started=true, el navegador ya está redirigiendo a Google.
    };

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

                        {/* Bloque de registro — liquid glass, sobrio (estilo Claude) */}
                        <motion.div custom={3} variants={fadeUp}>
                            <div className="cream-glass w-full max-w-[400px] rounded-2xl p-6 sm:p-7">
                                <div className="relative z-10">
                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={handleGoogle}
                                        disabled={googleLoading}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl py-3.5 font-ui text-[15px] font-medium text-white/90 transition-colors duration-150 hover:bg-white/[0.09] active:bg-white/[0.12] disabled:opacity-60"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.05)",
                                            border: "1px solid rgba(255, 255, 255, 0.14)",
                                        }}
                                    >
                                        <GoogleG />
                                        {googleLoading ? "Conectando…" : "Continuar con Google"}
                                    </button>

                                    {/* Apple — oculto hasta tener Apple Developer (ver APPLE_ENABLED) */}
                                    {APPLE_ENABLED && (
                                        <button
                                            type="button"
                                            className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl py-3.5 font-ui text-[15px] font-medium text-white/90 transition-colors duration-150 hover:bg-white/[0.09] active:bg-white/[0.12]"
                                            style={{
                                                background: "rgba(255, 255, 255, 0.05)",
                                                border: "1px solid rgba(255, 255, 255, 0.14)",
                                            }}
                                        >
                                            <AppleLogo />
                                            Continuar con Apple
                                        </button>
                                    )}

                                    {/* Divisor */}
                                    <div className="my-4 text-center font-ui text-sm text-white/40">o</div>

                                    {/* Correo */}
                                    <form onSubmit={handleHeroSubmit} className="flex flex-col gap-3">
                                        <input
                                            type="email"
                                            required
                                            value={heroEmail}
                                            onChange={(e) => setHeroEmail(e.target.value)}
                                            placeholder="Ingresa tu correo electrónico"
                                            aria-label="Ingresa tu correo electrónico"
                                            className="w-full rounded-xl px-4 py-3.5 font-ui text-[16px] text-white/90 placeholder-white/40 outline-none transition-colors duration-150 focus:border-white/30 sm:text-[15px]"
                                            style={{
                                                background: "rgba(255, 255, 255, 0.06)",
                                                border: "1px solid rgba(255, 255, 255, 0.10)",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="flex w-full items-center justify-center rounded-xl py-3.5 font-ui text-[15px] font-semibold text-[#1c1208] transition-all duration-150 hover:brightness-95 active:brightness-90"
                                            style={{ background: "#f5f0e8" }}
                                        >
                                            Continuar con correo electrónico
                                        </button>
                                    </form>

                                    <p className="mt-4 text-center font-ui text-[11px] leading-relaxed text-white/30">
                                        Al continuar, aceptas nuestro Aviso de Privacidad.
                                    </p>
                                </div>
                            </div>
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

