"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { MessageSquare, Paperclip, FileText } from "lucide-react";
import dynamic from "next/dynamic";

/* ══════════════════════════════════════════════════════════════
   BitacoraSection — SPLIT LAYOUT (Sprint 4.3: Chat extracted)
   ──────────────────────────────────────────────────────────────
   Layout:   Text top + 3-zone grid (Features | Chat | Features)
   Chat:     Lazy-loaded MockChatWidget
   ══════════════════════════════════════════════════════════════ */

const MockChatWidget = dynamic(() => import("./MockChatWidget"), { ssr: false });

const ACCENT = "#C4A484";

// ── ANIMATION VARIANTS ──
const slideLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const slideRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const featureStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const featureItem: Variants = {
    hidden: { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.3 } },
};

const FEATURES = [
    { Icon: MessageSquare, title: "Habla con tu obra", body: "Escribe o dicta desde campo. La IA redacta el registro técnico por ti al instante." },
    { Icon: Paperclip, title: "Análisis multimodal", body: "Sube fotos o PDFs. El sistema entiende estimaciones y planos automáticamente." },
    { Icon: FileText, title: "Reportes en un clic", body: "Exporta resúmenes diarios estructurados y listos para firma electrónica." },
];

/** Memoized atmosphere layer to avoid re-renders from chat state changes */
const BitacoraAtmosphere = React.memo(function BitacoraAtmosphere() {
    return (
        <>
            {/* ── ATMOSPHERIC LAYER 1: Multi-zone warm focal glow ── */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 45% 50% at 50% 45%, rgba(196,164,132,0.055) 0%, transparent 65%),
                        radial-gradient(ellipse 30% 35% at 50% 45%, rgba(196,164,132,0.035) 0%, transparent 45%),
                        radial-gradient(ellipse 70% 35% at 20% 50%, rgba(180,130,80,0.018) 0%, transparent 55%),
                        radial-gradient(ellipse 70% 35% at 80% 50%, rgba(180,130,80,0.018) 0%, transparent 55%),
                        radial-gradient(ellipse 100% 40% at 50% 100%, rgba(196,164,132,0.015) 0%, transparent 40%)
                    `,
                }}
            />

            {/* ── ATMOSPHERIC LAYER 2: Ledger dot-grid + hash fragments (SVG) ── */}
            <svg
                className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {Array.from({ length: 20 }, (_, row) =>
                    Array.from({ length: 25 }, (_, col) => (
                        <circle key={`dot-${row}-${col}`} cx={40 + col * 38} cy={40 + row * 48} r={0.6} fill="#C4A484" opacity={0.08} />
                    ))
                )}
                {Array.from({ length: 4 }, (_, i) => (
                    <line key={`rule-${i}`} x1={30} y1={280 + i * 192} x2={970} y2={280 + i * 192} stroke="#C4A484" strokeOpacity={0.04} strokeWidth={0.4} />
                ))}
                <line x1={85} y1={20} x2={85} y2={980} stroke="#C4A484" strokeOpacity={0.05} strokeWidth={0.5} strokeDasharray="4 8" />
                {[
                    { x: 30, y: 80, text: "a7f3e2b1" }, { x: 890, y: 120, text: "d4c8f901" },
                    { x: 40, y: 320, text: "b2e5a7c3" }, { x: 910, y: 380, text: "f8d1e6b4" },
                    { x: 25, y: 560, text: "c9a3f2d7" }, { x: 880, y: 620, text: "e1b4c8a5" },
                    { x: 35, y: 780, text: "d6f2b1e8" }, { x: 900, y: 840, text: "a3c7d4f9" },
                    { x: 30, y: 940, text: "f5e8b2c1" }, { x: 895, y: 950, text: "b1d3a6f7" },
                ].map((h, i) => (
                    <text key={`hash-${i}`} x={h.x} y={h.y} fill="#C4A484" opacity={0.04} fontSize={8} fontFamily="monospace">{h.text}</text>
                ))}
                {[
                    { x: 60, y: 150, w: 120, h: 60 }, { x: 820, y: 250, w: 130, h: 55 },
                    { x: 50, y: 450, w: 110, h: 50 }, { x: 840, y: 520, w: 115, h: 65 },
                    { x: 55, y: 700, w: 125, h: 55 }, { x: 830, y: 750, w: 120, h: 60 },
                ].map((b, i) => (
                    <rect key={`block-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="none" stroke="#C4A484" strokeOpacity={0.03} strokeWidth={0.5} />
                ))}
                {[
                    { x1: 180, y1: 180, x2: 820, y2: 277 },
                    { x1: 160, y1: 475, x2: 840, y2: 552 },
                    { x1: 180, y1: 727, x2: 830, y2: 780 },
                ].map((l, i) => (
                    <line key={`bconn-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#C4A484" strokeOpacity={0.025} strokeWidth={0.4} strokeDasharray="3 6" />
                ))}
            </svg>

            {/* ── Floating warm micro-particles ── */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {[
                    { x: "12%", y: "18%", size: 2, color: "#C4A484", dur: 24, dx: 30, dy: -18 },
                    { x: "82%", y: "22%", size: 1.8, color: "#B48050", dur: 28, dx: -25, dy: 15 },
                    { x: "88%", y: "68%", size: 2.2, color: "#C4A484", dur: 22, dx: -20, dy: -22 },
                    { x: "15%", y: "75%", size: 1.5, color: "#B48050", dur: 30, dx: 35, dy: -12 },
                    { x: "50%", y: "6%", size: 1.6, color: "#C4A484", dur: 26, dx: -12, dy: 28 },
                    { x: "45%", y: "92%", size: 1.5, color: "#B48050", dur: 25, dx: 22, dy: -25 },
                    { x: "30%", y: "40%", size: 1.4, color: "#C4A484", dur: 32, dx: -18, dy: 20 },
                    { x: "72%", y: "45%", size: 1.8, color: "#B48050", dur: 27, dx: 15, dy: -18 },
                ].map((p, i) => (
                    <motion.div
                        key={`lp${i}`}
                        className="absolute rounded-full"
                        style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                        animate={{ x: [0, p.dx, 0], y: [0, p.dy, 0], opacity: [0.08, 0.28, 0.08] }}
                        transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>
        </>
    );
});

export default function BitacoraSection() {
    return (
        <section
            id="bitacora"
            className="relative w-full border-t border-white/5 bg-[#080504]"
            style={{ minHeight: "140dvh", height: "auto" }}
        >
            <div className="sticky top-0 min-h-[100dvh] h-auto md:h-screen w-full flex flex-col items-center justify-center pt-32 md:pt-20 pb-16 md:pb-0">

                <BitacoraAtmosphere />

                {/* ── SANDWICH LAYOUT ── */}
                <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-6 px-4 md:px-6 max-w-7xl xl:px-12 -translate-y-12">

                    {/* ═══ BLOCK 1: TEXT (top) ═══ */}
                    <motion.div
                        variants={slideLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 text-center"
                    >
                        <div className="inline-flex items-center justify-center gap-2.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${ACCENT}88` }}>
                                Bitácora
                            </span>
                        </div>

                        <h2
                            className="font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/92 sm:text-4xl md:text-5xl"
                            style={{ textShadow: `0 0 60px rgba(196,164,132,0.09), 0 4px 40px rgba(0,0,0,0.95)` }}
                        >
                            La bitácora<br />que <span style={{ color: ACCENT }}>se escribe sola.</span>
                        </h2>

                        <p className="max-w-xl mx-auto text-sm leading-relaxed text-white/40 sm:text-base">
                            Tu asistente de obra disponible 24/7. Olvídate de llenar formatos a mano al final del día; chatea, adjunta fotos y deja que la IA organice tu bitácora.
                        </p>
                    </motion.div>

                    {/* ═══ BLOCK 2: 3-ZONE GRID (Features | Chat | Features) ═══ */}
                    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center px-0">

                        {/* ── LEFT: Feature 1 ── */}
                        <motion.div
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="hidden lg:flex lg:col-span-3 flex-col items-end text-right gap-4"
                        >
                            {(() => {
                                const f = FEATURES[0];
                                return (
                                    <motion.div variants={featureItem} className="flex flex-col items-end gap-3 max-w-[280px]">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                            <f.Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                        </span>
                                        <div>
                                            <p className="text-[14px] font-semibold text-white/90">{f.title}</p>
                                            <p className="mt-1 text-[12px] leading-relaxed text-white/40">{f.body}</p>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </motion.div>

                        {/* ── CENTER: Chat (Sprint 4.3: lazy-loaded) ── */}
                        <motion.div
                            variants={slideRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            className="w-full lg:col-span-6 max-w-xl mx-auto"
                        >
                            <MockChatWidget />
                        </motion.div>

                        {/* ── RIGHT: Features 2 & 3 ── */}
                        <motion.div
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="hidden lg:flex lg:col-span-3 flex-col items-start text-left gap-10"
                        >
                            {FEATURES.slice(1).map((f) => (
                                <motion.div key={f.title} variants={featureItem} className="flex flex-col items-start gap-3 max-w-[280px]">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                        <f.Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <p className="text-[14px] font-semibold text-white/90">{f.title}</p>
                                        <p className="mt-1 text-[12px] leading-relaxed text-white/40">{f.body}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ── MOBILE FALLBACK: all 3 features stacked ── */}
                        <motion.ul
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="lg:hidden col-span-1 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-2"
                        >
                            {FEATURES.map(({ Icon, title, body }) => (
                                <motion.li key={title} variants={featureItem} className="flex flex-col items-start gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full mt-1" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                        <Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <p className="text-[15px] font-semibold text-white/90">{title}</p>
                                        <p className="mt-1 text-[13px] leading-relaxed text-white/40">{body}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>

                    </div>

                </div>
            </div>
        </section>
    );
}
