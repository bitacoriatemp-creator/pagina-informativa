"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   SmartIslandShowcase — Sección presentacional de la Smart Island
   ──────────────────────────────────────────────────────────────
   Utiliza un "Scroll Retention Track" (height: 150vh + sticky) 
   para el efecto de imán natural.
   ══════════════════════════════════════════════════════════════ */

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

export default function SmartIslandShowcase() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.3 });

    return (
        <section
            ref={sectionRef}
            className="relative w-full"
            style={{
                backgroundColor: "#0c0604",
                height: "150vh", // Scroll retention track (150% del viewport)
            }}
        >
            {/* ── STICKY WRAPPER ── */}
            <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                
                {/* Viñeta gigante de fondo: ilumina el centro sin chocar con letras */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(195,151,103,0.15) 0%, rgba(195,151,103,0.05) 30%, transparent 60%)",
                        zIndex: 0
                    }}
                />

                <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                    {/* ── TAG ── */}
                    <motion.p
                        custom={0}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-4 font-ui text-[10px] uppercase tracking-[0.35em]"
                        style={{ color: "rgba(195,151,103,0.6)" }}
                    >
                        Navegación Inteligente
                    </motion.p>

                    {/* ── HEADLINE ── */}
                    <motion.h2
                        custom={1}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-8 font-display text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white/90 sm:text-4xl lg:text-5xl"
                    >
                        Te presentamos la{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: "linear-gradient(135deg, #C39767 0%, #E8D5B7 50%, #C39767 100%)",
                            }}
                        >
                            Smart Island.
                        </span>
                    </motion.h2>

                    {/* ── Espacio reservado para la isla (se revela centrada aquí) ── */}
                    <div id="island-anchor" className="h-28 md:h-32" />

                    {/* ── BODY COPY ── */}
                    <motion.p
                        custom={2}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mx-auto mb-14 max-w-lg text-sm leading-relaxed md:text-base"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                        Un menú de navegación diseñado para que te sientas en casa desde el
                        primer clic. Sin curvas de aprendizaje, sin menús complejos —&nbsp;solo
                        los módulos que necesitas, siempre al alcance.
                    </motion.p>

                    {/* ── SUB-FEATURES ── */}
                    <motion.div
                        custom={3}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mx-auto grid max-w-md grid-cols-2 gap-x-8 gap-y-4 text-left"
                    >
                        {[
                            { text: "Intuitivo desde el primer uso", icon: "✦" },
                            { text: "Acceso rápido a cada módulo", icon: "✦" },
                            { text: "Se adapta a tu scroll", icon: "✦" },
                            { text: "Cero menús complejos", icon: "✦" },
                        ].map((feat) => (
                            <div key={feat.text} className="flex items-start gap-2">
                                <span className="mt-0.5 text-[10px]" style={{ color: "#C39767" }}>
                                    {feat.icon}
                                </span>
                                <span
                                    className="text-[12px] leading-snug"
                                    style={{ color: "rgba(255,255,255,0.35)" }}
                                >
                                    {feat.text}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

            </div> {/* End Sticky Wrapper */}
        </section>
    );
}
