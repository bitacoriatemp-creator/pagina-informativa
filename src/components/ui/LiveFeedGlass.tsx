"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Simulated bitácora activity entries ──────── */
const FEED_ENTRIES = [
    { time: "10:42 AM", text: "Ingreso de material: Acero 3/4\" — Lote #8492", type: "material" },
    { time: "10:43 AM", text: "IA Detectada: Anomalía en cronograma (Zona B)", type: "alert" },
    { time: "10:44 AM", text: "Arq. Mendoza actualizó plano A-04", type: "user" },
    { time: "10:45 AM", text: "Clima: Lluvia ligera detectada — Alerta enviada", type: "weather" },
    { time: "10:45 AM", text: "Bitácora: Entrada #204 encriptada ✓", type: "system" },
    { time: "10:46 AM", text: "Validación BIM: Nivel 3 sin colisiones", type: "bim" },
    { time: "10:47 AM", text: "Presupuesto: Partida 12 — desviación −2.3%", type: "budget" },
    { time: "10:48 AM", text: "Sensor IoT: Humedad 62% en Sector C", type: "sensor" },
    { time: "10:49 AM", text: "Arq. Ríos firmó acta de verificación #87", type: "user" },
    { time: "10:50 AM", text: "IA: Predicción de entrega — 3 días antes", type: "ai" },
    { time: "10:51 AM", text: "Ingreso: Concreto premezclado — 12m³", type: "material" },
    { time: "10:52 AM", text: "Bitácora: Entrada #205 encriptada ✓", type: "system" },
    { time: "10:53 AM", text: "Cimbra Nivel 4 — avance reportado 78%", type: "progress" },
    { time: "10:54 AM", text: "Alerta sísmica: Protocolo de revisión activo", type: "alert" },
    { time: "10:55 AM", text: "IA: 2 oportunidades de ahorro detectadas", type: "ai" },
];

/* Color accent by entry type */
function getTypeColor(type: string): string {
    switch (type) {
        case "alert": return "text-amber-400/70";
        case "weather": return "text-sky-400/50";
        case "ai": return "text-emerald-400/60";
        case "system": return "text-primary/40";
        case "bim": return "text-violet-400/50";
        default: return "text-primary/50";
    }
}

function getTypePrefix(type: string): string {
    switch (type) {
        case "material": return "▸ MAT";
        case "alert": return "⚠ ALE";
        case "user": return "▸ USR";
        case "weather": return "◉ CLI";
        case "system": return "▸ SYS";
        case "bim": return "▸ BIM";
        case "budget": return "▸ PRE";
        case "sensor": return "◉ IOT";
        case "ai": return "◆ IA ";
        case "progress": return "▸ AVA";
        default: return "▸ LOG";
    }
}

export default function LiveFeedGlass() {
    const [visibleEntries, setVisibleEntries] = useState<typeof FEED_ENTRIES>([]);
    const feedRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef(0);

    useEffect(() => {
        // Start with first 4 entries
        setVisibleEntries(FEED_ENTRIES.slice(0, 4));
        indexRef.current = 4;

        const interval = setInterval(() => {
            const nextIndex = indexRef.current % FEED_ENTRIES.length;
            const entry = FEED_ENTRIES[nextIndex];

            setVisibleEntries((prev) => {
                const next = [...prev, entry];
                // Keep max 8 visible at a time
                if (next.length > 8) return next.slice(-8);
                return next;
            });

            indexRef.current++;
        }, 2800);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [visibleEntries]);

    return (
        <div
            className="chocolate-glass led-glow-gold-subtle relative w-full max-w-sm overflow-hidden rounded-2xl"
            style={{
                transform: "perspective(900px) rotateY(-4deg) rotateX(1deg)",
                height: "480px",
            }}
        >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-primary/15 px-5 py-3">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
                        Live Feed
                    </span>
                </div>
                <span className="font-mono text-[10px] text-text/15">
                    stream://bitacoria.log
                </span>
            </div>

            {/* Scrolling feed */}
            <div
                ref={feedRef}
                className="h-[calc(100%-48px)] overflow-hidden px-4 py-3"
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)",
                }}
            >
                <AnimatePresence initial={false}>
                    {visibleEntries.map((entry, i) => (
                        <motion.div
                            key={`${entry.time}-${entry.text}-${i}`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                            className="mb-3"
                        >
                            <div className="flex items-start gap-2 font-mono text-[11px] leading-[1.6]">
                                {/* Timestamp */}
                                <span className="shrink-0 text-text/15">
                                    {entry.time}
                                </span>
                                {/* Type prefix */}
                                <span className={`shrink-0 ${getTypeColor(entry.type)}`}>
                                    {getTypePrefix(entry.type)}
                                </span>
                                {/* Message */}
                                <span className="text-text/35">
                                    {entry.text}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Cursor / typing indicator at bottom */}
                <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="font-mono text-[10px] text-primary/30"
                >
                    ▌ awaiting next entry...
                </motion.div>
            </div>

            {/* Bottom ambient reflection */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/[0.03] to-transparent" />
        </div>
    );
}
