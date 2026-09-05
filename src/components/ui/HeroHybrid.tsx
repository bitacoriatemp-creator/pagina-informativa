"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import HeroLiquidGlass from "./HeroLiquidGlass";
import { irALegal } from "@/lib/eventos";
import { HANDOFF_EMAIL } from "@/lib/registro";

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
    /* ── Registro: el hero solo recoge el correo y lleva a /registro ──
       El alta completa vive en su propia página. Lo que se teclee aquí viaja
       por sessionStorage y no por la URL: no queremos correos en el historial
       del navegador ni en los referrers. */
    const router = useRouter();
    const [heroEmail, setHeroEmail] = useState("");

    const irARegistro = (email?: string) => {
        try {
            if (email) sessionStorage.setItem(HANDOFF_EMAIL, email);
        } catch { /* modo privado: se pedirá el correo en la página */ }
        router.push("/registro");
    };

    const handleHeroSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        irARegistro(heroEmail.trim());
    };

    /* Todo acceso pasa por la encuesta y de ahí a WhatsApp: es el canal donde
       atendemos al lead, hablando con la persona en vez de dar de alta cuentas
       sin contexto. Nada de OAuth aquí: sin proveedor configurado, intentarlo
       solo añadía una petición muerta y un parpadeo de "Conectando…" antes de
       abrir la misma encuesta. socialAuth.ts sigue disponible si se retoma. */
    const handleGoogle = () => irARegistro();

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
            {/* Sin padding extra: con la marca a la derecha ya no pisa el
                antetítulo, así que el hero recupera su altura original. */}
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

                    {/* Bloque de registro — bloques sueltos, sin contenedor.
                        Referencia: el login de Claude. El aire entre piezas hace
                        el trabajo que antes hacía la caja, y un único botón
                        relleno (Continuar) fija la jerarquía.
                        Todo en font-sans (Kumbh): Teko es condensada y a este
                        tamaño apretaba los botones y volvía ilegible el aviso.
                        La lógica no cambia — Google y correo abren la encuesta. */}
                    <motion.div
                        custom={3}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="hero-area-cta pointer-events-auto w-full max-w-[400px] font-sans"
                    >
                        {/* Social */}
                        <div className="flex flex-col gap-3">
                            {/* Icono absoluto + texto centrado: el texto queda
                                ópticamente centrado en el bloque, como la referencia. */}
                            <button
                                type="button"
                                onClick={handleGoogle}
                                className="auth-field relative flex w-full items-center justify-center px-12 text-[15px] font-medium"
                            >
                                <span className="absolute left-4 flex items-center" aria-hidden>
                                    <GoogleG />
                                </span>
                                Continuar con Google
                            </button>

                            {/* Apple — oculto hasta tener Apple Developer (ver APPLE_ENABLED) */}
                            {APPLE_ENABLED && (
                                <button
                                    type="button"
                                    className="auth-field relative flex w-full items-center justify-center px-12 text-[15px] font-medium"
                                >
                                    <span className="absolute left-4 flex items-center" aria-hidden>
                                        <AppleLogo />
                                    </span>
                                    Continuar con Apple
                                </button>
                            )}
                        </div>

                        {/* Divisor: solo la línea. La "o" suelta era un carácter
                            huérfano entre dos bloques. */}
                        <div className="my-6 h-px w-full bg-white/10" aria-hidden />

                        {/* Correo — etiqueta encima del campo, no placeholder dentro:
                            así el campo no se queda "vacío de sentido" al escribir. */}
                        <form onSubmit={handleHeroSubmit}>
                            <label htmlFor="hero-email" className="mb-2 block text-[14px] text-[#f5f0e8]/85">
                                Correo electrónico
                            </label>
                            {/* 16px en móvil evita el zoom automático de iOS al enfocar. */}
                            <input
                                id="hero-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={heroEmail}
                                onChange={(e) => setHeroEmail(e.target.value)}
                                className="auth-field w-full px-4 text-[16px] outline-none sm:text-[15px]"
                            />
                            <button
                                type="submit"
                                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#f5f0e8] text-[15px] font-semibold text-[#1a120c] transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060302]"
                            >
                                Continuar
                            </button>
                        </form>

                        <p className="mt-5 text-center text-[13px] leading-snug text-white/45">
                            Al continuar, aceptas nuestro{" "}
                            {/* Baja al aviso real, en el pie junto a Términos y FAQ, y lo
                                resalta al llegar. Antes era un ancla a #contacto: dejaba
                                al usuario en el pie sin señalar cuál de los tres era. */}
                            <button
                                type="button"
                                onClick={() => irALegal("privacy")}
                                className="underline underline-offset-4 decoration-white/30 transition-colors hover:text-white/70"
                            >
                                Aviso de Privacidad
                            </button>.
                        </p>
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

