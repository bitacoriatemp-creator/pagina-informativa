"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   ContextGrid — Narrative Bento Grid with per-card flashlight
   ──────────────────────────────────────────────────────────────
   Layout (desktop):
     ┌──────────────────┬─────────┐
     │   A (wide)       │  B      │
     ├──────────────────┤ (tall)  │
     │   C (compact)    │         │
     └──────────────────┴─────────┘
   Each card has independent mouse-tracking spotlight (150px).
   ══════════════════════════════════════════════════════════════ */

interface CardData {
    id: string;
    tag: string;
    title: string;
    body: string;
    className: string; // grid placement classes
}

const cards: CardData[] = [
    {
        id: "origin",
        tag: "Filosofía",
        title: "El fin de la caja negra.",
        body: "La construcción tradicional pierde el 30\u00a0% de sus datos en papel y chats informales. Nosotros digitalizamos la verdad, eliminando los \u201cpuntos ciegos\u201d donde se esconde la ineficiencia.",
        className: "",
    },
    {
        id: "team",
        tag: "Quiénes somos",
        title: "Arquitectos de datos.",
        body: "No somos solo software. Somos un equipo híbrido de ingenieros y desarrolladores obsesionados con la transparencia total y la precisión algorítmica.",
        className: "",
    },
    {
        id: "audience",
        tag: "Para quién",
        title: "Para líderes visionarios.",
        body: "Diseñado para Desarrolladoras y Project Managers que entienden que la información es el activo más valioso de la obra.",
        className: "",
    },
];

/* ── Animation variants ─────────────────────────────────── */
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const },
    },
};

/* ── Grid background (matches Hero) ─────────────────────── */
const gridBg = [
    "repeating-linear-gradient(to right, rgba(195,151,103,0.045) 0px, rgba(195,151,103,0.045) 1px, transparent 1px, transparent 80px)",
    "repeating-linear-gradient(to bottom, rgba(195,151,103,0.045) 0px, rgba(195,151,103,0.045) 1px, transparent 1px, transparent 80px)",
].join(", ");

/* ════════════════════════════════════════════════════════════
   GlassCard — individual card with its own flashlight
   ════════════════════════════════════════════════════════════ */
function GlassCard({ card, index }: { card: CardData; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hovering, setHovering] = useState(false);

    const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    return (
        <motion.div
            ref={cardRef}
            variants={cardVariants}
            className={`group relative overflow-hidden rounded-2xl p-6 ${card.className}`}
            style={{
                background: "rgba(195, 151, 103, 0.05)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(195, 151, 103, 0.25)",
                boxShadow: "inset 0 0 20px rgba(195, 151, 103, 0.05)",
            }}
            onMouseMove={handleMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            whileHover={{
                y: -5,
                borderColor: "rgba(195, 151, 103, 0.5)",
                transition: { duration: 0.3 },
            }}
        >
            {/* Flashlight overlay — 150px radius spotlight */}
            <div
                className="pointer-events-none absolute inset-0 z-[1] rounded-2xl"
                style={{
                    background: `radial-gradient(circle 150px at ${pos.x}px ${pos.y}px, rgba(195, 151, 103, 0.08) 0%, transparent 70%)`,
                    opacity: hovering ? 1 : 0,
                    transition: "opacity 0.3s ease",
                }}
            />

            {/* Giant watermark number — architectural index */}
            <span
                className="pointer-events-none absolute bottom-2 right-4 z-[0] select-none font-display text-8xl font-black leading-none text-white/[0.04]"
                aria-hidden="true"
            >
                {String(index + 1).padStart(2, "0")}
            </span>

            {/* Content (above flashlight + watermark) */}
            <div className="relative z-[2]">
                <span className="mb-4 inline-block rounded-full bg-[#c39767]/10 px-3.5 py-1 font-ui text-[10px] uppercase tracking-widest text-[#c39767]/70">
                    {card.tag}
                </span>
                <h3 className="mb-3 font-display text-xl font-bold uppercase tracking-tight text-white/90 sm:text-2xl">
                    {card.title}
                </h3>
                <p className="max-w-xl text-sm leading-relaxed text-gray-400 lg:text-base">
                    {card.body}
                </p>
            </div>
        </motion.div>
    );
}

/* ════════════════════════════════════════════════════════════
   ContextGrid — Section wrapper
   ════════════════════════════════════════════════════════════ */
export default function ContextGrid() {
    return (
        <section
            id="quienes"
            className="relative flex min-h-screen items-center px-8 md:px-16"
            style={{ backgroundColor: "#0c0604" }}
        >
            {/* Grid background continuation from Hero */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `${gridBg}, radial-gradient(ellipse 80% 60% at 50% 50%, rgba(26,14,8,0.6) 0%, transparent 70%)` }}
            />

            <motion.div
                className="relative z-10 mx-auto w-full max-w-[1400px] py-20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
            >
                {/* Section header */}
                <motion.p
                    variants={cardVariants}
                    className="mb-3 text-center font-ui text-xs uppercase tracking-[0.3em] text-[#c39767]/60"
                >
                    Contexto
                </motion.p>
                <motion.h2
                    variants={cardVariants}
                    className="mb-14 text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
                >
                    Por qué{" "}
                    <span className="text-gradient">existimos.</span>
                </motion.h2>

                {/* Bento Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map((card, i) => (
                        <GlassCard key={card.id} card={card} index={i} />
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
