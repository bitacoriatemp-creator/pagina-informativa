"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRegistroModal } from "./RegistroModal";
import HeroLiquidGlass from "./HeroLiquidGlass";

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

/* ── Showcase de producto: los 3 demos reales (antes secciones aparte) ── */
const HeroDemoShowcase = dynamic(() => import("./HeroDemoShowcase"), { ssr: false });


/* ══════════════════════════════════════════════════════════════
   HeroHybrid — Self-contained Hero Section
   ──────────────────────────────────────────────────────────────
   Background: HeroLiquidGlass — blobs líquidos + lámina de vidrio +
   luz que sigue al cursor y cambia de tinte según la zona.
   Foreground (layout estilo Claude — copy a la izquierda, producto
   contenido a la derecha):
     Content (tagline, headline, CTAs)
     HeroDemoShowcase (Smart Concepts / Bitácora / Smart Calendar)
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

    const handleHeroSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        openModal({ email: heroEmail.trim() });
    };

    /* Todo acceso pasa por la encuesta y de ahí a WhatsApp: es el canal donde
       atendemos al lead, hablando con la persona en vez de dar de alta cuentas
       sin contexto. Nada de OAuth aquí: sin proveedor configurado, intentarlo
       solo añadía una petición muerta y un parpadeo de "Conectando…" antes de
       abrir la misma encuesta. socialAuth.ts sigue disponible si se retoma. */
    const handleGoogle = () => openModal({});

    /* minh-100dvh en vez de min-h-screen: en iOS Safari la barra de
       direcciones hace que 100vh sea mayor que la pantalla visible. */
    return (
        <section id="hero-or-chaos" className="relative minh-100dvh overflow-hidden">
            {/* ══════════════════════════════════════════════
                BACKGROUND — liquid glass + luz que sigue al cursor
                ══════════════════════════════════════════════ */}
            <HeroLiquidGlass />

            {/* NAVBAR: movida a GlobalNavbar (fixed, persiste en todo el scroll) */}

            {/* ══════════════════════════════════════════════
                HERO CONTENT — Text + Liquid Glass Buttons
                ══════════════════════════════════════════════ */}
            {/* Contenido anclado arriba (no centrado): la columna izquierda
                arranca justo bajo la isla y crece hacia abajo, así no se hunde
                —ni se corta— en pantallas de poca altura. */}
            <div className="relative z-20 flex minh-100dvh items-start pointer-events-none pt-28 pb-16 md:pt-24 md:pb-10">
                <div className="hero-grid mx-auto w-full max-w-[1600px] gap-y-6 px-6 md:px-10 lg:gap-x-8 lg:gap-y-0 lg:px-16">
                    {/* Cada área orquesta su propia entrada. Antes el stagger vivía
                       en un único padre; al partir el contenido en áreas de grid la
                       propagación de variantes dejaba a los hijos en el estado
                       "hidden" (opacidad 0) y el hero se veía en blanco. */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="hero-area-copy relative z-10 w-full max-w-xl pointer-events-auto"
                    >
                        {/* Tag line */}
                        <motion.p
                            custom={0}
                            variants={fadeUp}
                            className="mb-3 font-ui text-xs uppercase tracking-[0.3em] text-[#c39767]/70"
                        >
                            Gestión de obra con IA
                        </motion.p>

                        {/* Headline */}
                        <motion.h1
                            custom={1}
                            variants={fadeUp}
                            /* Hasta lg el hero es de una columna y cabe un titular
                               grande. Desde lg la columna es fluida (~43%), así que el
                               tamaño también: clamp escala con el ancho en vez de dar
                               saltos, y topa en 72px — el tamaño actual de escritorio.
                               Medido: "INTELIGENTE." ocupa ~7.4x el tamaño de fuente. */
                            className="mb-4 font-display text-4xl font-extrabold uppercase leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-[clamp(2.75rem,4.6vw,4.5rem)]"
                        >
                            Tu obra
                            <br />
                            <span className="text-gradient">inteligente.</span>
                        </motion.h1>

                        {/* Sub-headline */}
                        <motion.p
                            custom={2}
                            variants={fadeUp}
                            className="mb-6 max-w-md text-sm leading-relaxed text-text/40 lg:text-base"
                        >
                            Gestiona, valida y cotiza en un solo lugar. La IA aprende de
                            tus propios datos para prevenir errores antes de construir.
                        </motion.p>
                    </motion.div>

                    {/* Showcase de producto — Smart Concepts / Bitácora / Smart Calendar.
                        En una columna va justo tras el subtítulo (enseñar antes de pedir);
                        en lg+ pasa a la derecha con su descuelgue propio. */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: [0.25, 0.4, 0.25, 1] as const, delay: 0.35 }}
                        className="hero-area-demo relative z-10 flex w-full max-w-4xl pointer-events-auto lg:mt-24 lg:justify-center"
                    >
                        <HeroDemoShowcase />
                    </motion.div>

                    {/* Bloque de registro — liquid glass, sobrio (estilo Claude) */}
                    <motion.div
                        custom={3}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="hero-area-cta pointer-events-auto"
                    >
                            {/* Mismo radio que la tarjeta del video: los dos recuadros
                                del hero leen como una familia y no como dos piezas sueltas. */}
                            <div className="cream-glass w-full max-w-[400px] rounded-[28px] p-5">
                                <div className="relative z-10">
                                    {/* Google */}
                                    <button
                                        type="button"
                                        onClick={handleGoogle}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl py-3 font-ui text-[14px] font-medium text-white/90 transition-colors duration-150 hover:bg-white/[0.09] active:bg-white/[0.12]"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.05)",
                                            border: "1px solid rgba(255, 255, 255, 0.14)",
                                        }}
                                    >
                                        <GoogleG />
                                        Continuar con Google
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
                                    <div className="my-2.5 text-center font-ui text-[13px] text-white/40">o</div>

                                    {/* Correo */}
                                    <form onSubmit={handleHeroSubmit} className="flex flex-col gap-2.5">
                                        <input
                                            type="email"
                                            required
                                            value={heroEmail}
                                            onChange={(e) => setHeroEmail(e.target.value)}
                                            placeholder="Ingresa tu correo electrónico"
                                            aria-label="Ingresa tu correo electrónico"
                                            className="w-full rounded-xl px-4 py-3 font-ui text-[16px] text-white/90 placeholder-white/40 outline-none transition-colors duration-150 focus:border-white/30 sm:text-[14px]"
                                            style={{
                                                background: "rgba(255, 255, 255, 0.06)",
                                                border: "1px solid rgba(255, 255, 255, 0.10)",
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            className="flex w-full items-center justify-center rounded-xl py-3 font-ui text-[14px] font-semibold text-[#1c1208] transition-all duration-150 hover:brightness-95 active:brightness-90"
                                            style={{ background: "#f5f0e8" }}
                                        >
                                            Continuar con correo electrónico
                                        </button>
                                    </form>

                                    <p className="mt-3 text-center font-ui text-[10px] leading-snug text-white/30">
                                        Al continuar, aceptas nuestro{" "}
                                        <a href="#contacto" className="underline underline-offset-2 decoration-white/30 hover:text-white/50">
                                            Aviso de Privacidad
                                        </a>.
                                    </p>
                                </div>
                            </div>
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

