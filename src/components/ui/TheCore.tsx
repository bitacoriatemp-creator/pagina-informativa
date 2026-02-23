"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/* ─── Tooltip messages per phase ──────────────── */
const tooltips: Record<CorePhase, string[]> = {
    intro: ["Inicializando motor IA...", "Cargando modelos predictivos..."],
    budget: ["Escaneando partidas...", "Optimizando acero: -12% costo", "Ahorro detectado: $847,000 MXN"],
    calendar: ["Riesgo climático detectado", "Reprogramando actividades...", "Ruta crítica recalculada"],
    bim: ["Sincronizando modelo BIM...", "Mapeando instalaciones MEP", "Colisiones: 0 detectadas"],
    output: ["Generando reporte ejecutivo...", "Compilando métricas KPI..."],
    facts: ["Sistema operativo", "Latencia: 12ms", "Uptime: 99.97%"],
};

export type CorePhase = "intro" | "budget" | "calendar" | "bim" | "output" | "facts";

/* ─── Phase-specific cube transforms ──────────── */
const cubeVariants = {
    intro: {
        rotateX: -20,
        rotateY: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        opacity: 1,
        transition: { duration: 1.2, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    budget: {
        rotateX: 0,
        rotateY: 0,
        scaleX: 1.6,
        scaleY: 0.2,
        scaleZ: 1,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    calendar: {
        rotateX: 0,
        rotateY: 0,
        scaleX: 2.5,
        scaleY: 0.3,
        scaleZ: 0.4,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    bim: {
        rotateX: -25,
        rotateY: 45,
        scaleX: 1.4,
        scaleY: 1.8,
        scaleZ: 1.4,
        opacity: 1,
        transition: { duration: 1, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    output: {
        rotateX: 5,
        rotateY: -5,
        scaleX: 0.8,
        scaleY: 1.2,
        scaleZ: 0.05,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
    },
    facts: {
        rotateX: -15,
        rotateY: 30,
        scaleX: 0.7,
        scaleY: 0.7,
        scaleZ: 0.7,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
    },
};

/* ─── Face colors per phase ───────────────────── */
const faceColors: Record<CorePhase, string> = {
    intro: "rgba(195, 151, 103, 0.08)",
    budget: "rgba(80, 200, 120, 0.10)",
    calendar: "rgba(70, 130, 220, 0.10)",
    bim: "rgba(195, 151, 103, 0.12)",
    output: "rgba(195, 151, 103, 0.06)",
    facts: "rgba(195, 151, 103, 0.10)",
};

const faceBorders: Record<CorePhase, string> = {
    intro: "rgba(195, 151, 103, 0.2)",
    budget: "rgba(80, 200, 120, 0.25)",
    calendar: "rgba(70, 130, 220, 0.25)",
    bim: "rgba(195, 151, 103, 0.3)",
    output: "rgba(195, 151, 103, 0.15)",
    facts: "rgba(195, 151, 103, 0.25)",
};

/* ═══════════════════════════════════════════════ */
/*                   THE CORE                      */
/* ═══════════════════════════════════════════════ */
interface TheCoreProps {
    phase: CorePhase;
}

export default function TheCore({ phase }: TheCoreProps) {
    const [tooltipIdx, setTooltipIdx] = useState(0);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const msgs = tooltips[phase];

    /* Cycle through tooltips */
    useEffect(() => {
        setTooltipIdx(0);
        setTooltipVisible(false);

        const showTimer = setTimeout(() => setTooltipVisible(true), 600);

        const interval = setInterval(() => {
            setTooltipIdx((prev) => (prev + 1) % msgs.length);
        }, 2400);

        return () => {
            clearTimeout(showTimer);
            clearInterval(interval);
        };
    }, [phase, msgs.length]);

    const size = 90; // cube face size in px
    const half = size / 2;

    const bg = faceColors[phase];
    const border = faceBorders[phase];

    const faceStyle = (transform: string): React.CSSProperties => ({
        position: "absolute",
        width: size,
        height: size,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        backdropFilter: "blur(8px)",
        transform,
    });

    return (
        <div className="relative flex items-center justify-center">
            {/* 3D Cube */}
            <div className="perspective-800" style={{ width: size, height: size }}>
                <motion.div
                    className="preserve-3d relative"
                    style={{ width: size, height: size }}
                    animate={cubeVariants[phase]}
                >
                    {/* Front */}
                    <div style={faceStyle(`translateZ(${half}px)`)}>
                        <div className="flex h-full items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-primary/40 animate-glow-pulse" />
                        </div>
                    </div>
                    {/* Back */}
                    <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`)} />
                    {/* Right */}
                    <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`)} />
                    {/* Left */}
                    <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`)} />
                    {/* Top */}
                    <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`)} />
                    {/* Bottom */}
                    <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`)} />
                </motion.div>
            </div>

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                {tooltipVisible && (
                    <motion.div
                        key={`${phase}-${tooltipIdx}`}
                        initial={{ opacity: 0, x: 10, y: 4 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.3 }}
                        className="core-tooltip absolute -right-4 top-0 translate-x-full"
                    >
                        {msgs[tooltipIdx]}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute rounded-full blur-[40px]"
                style={{
                    width: size * 1.5,
                    height: size * 1.5,
                    background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`,
                }}
            />
        </div>
    );
}
