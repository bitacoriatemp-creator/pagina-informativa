"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
    TableProperties,
    Book,
    CalendarDays,
    Box,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SmartIsland — 3-State Scroll Machine
   ──────────────────────────────────────────────────────────────
   HOVER FLICKER FIX:
   The onMouseEnter/Leave events are placed on a STABLE outer
   <div> that does NOT change size. The inner motion.button that
   actually grows during layout animation is purely visual.
   This prevents the "grow → cursor leaves → shrink → re-enter"
   infinite loop.

   POP FIX:
   The pop overlay `<motion.div>` carries `key={lastPop}` so
   React unmounts and remounts it fresh on every new pop, even
   for the same module. Without this key, React reused the same
   DOM node and the animation never re-played.
   ══════════════════════════════════════════════════════════════ */

export const modules = [
    {
        id: "concepts",
        label: "Smart Concepts",
        Icon: TableProperties,
        color: "#00D26A",
        activeColor: "#000000",
        targetId: "smart-concepts",
    },
    {
        id: "bitacora",
        label: "Bitácora",
        Icon: Book,
        color: "#C39767",
        activeColor: "#1a0e08",
        targetId: "bitacora",
    },
    {
        id: "calendar",
        label: "Smart Calendar",
        Icon: CalendarDays,
        color: "#3B82F6",
        activeColor: "#000000",
        targetId: "smart-calendar",
    },
    {
        id: "bim",
        label: "Smart BIM",
        Icon: Box,
        color: "#A855F7",
        activeColor: "#ffffff",
        targetId: "bim-sync",
    },
];

export type IslandState = "hidden" | "center" | "top";

interface SmartIslandProps {
    islandState: IslandState;
    triggerPop?: string | null;
    isBimSectionActive?: boolean;
}

export default function SmartIsland({ islandState, triggerPop, isBimSectionActive = false }: SmartIslandProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [popKey, setPopKey] = useState<Record<string, number>>({});

    // Sync external trigger → update key to a fresh timestamp
    useEffect(() => {
        if (triggerPop) {
            setPopKey((prev) => ({ ...prev, [triggerPop]: Date.now() }));
        }
    }, [triggerPop]);

    // Single source of truth: the IntersectionObserver state machine in page.tsx
    // controls all visibility transitions. No secondary scroll guard needed.
    const effectiveState = islandState;

    const handleScroll = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    // ── ANIMATION VARIANTS ──
    // x: "-50%" is owned by Framer, NOT Tailwind, to prevent transform clobbering.
    const variants = {
        hidden: {
            opacity: 0,
            left: "50%",
            x: "-50%",
            y: 50,
            scale: 0.8,
            top: "auto",
            bottom: "2rem",
            pointerEvents: "none" as const,
        },
        center: {
            opacity: 1,
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1.25,
            top: "35%",
            bottom: "auto",
            pointerEvents: "auto" as const,
            zIndex: 60,
        },
        top: {
            opacity: 1,
            left: "50%",
            x: "-50%",
            y: "0%",
            scale: 1,
            top: "1.5rem",
            bottom: "auto",
            pointerEvents: "auto" as const,
            zIndex: 50,
        },
    };

    return (
        <motion.div
            className="fixed font-sans will-change-transform"
            initial="hidden"
            animate={effectiveState}
            variants={variants}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
        >
            <LayoutGroup>
                {/*
                 * Racing-car LED border:
                 * SVG rect with rx=9999 traces the pill outline exactly.
                 * stroke-dasharray="40 1050" → 40px visible dot, rest gap.
                 * animate-dash shifts dashoffset 1050→0 so the dot laps the pill.
                 * SVG is 4px larger (inset -2px each side) so stroke sits on border.
                 */}
                <div className="relative inline-flex">
                    {isBimSectionActive && (
                        <svg
                            className="pointer-events-none absolute inset-0 w-full h-full"
                            style={{ borderRadius: "999px" }}
                        >
                            <motion.rect
                                x="1.5" y="1.5"
                                width="calc(100% - 3px)"
                                height="calc(100% - 3px)"
                                rx="999"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeDasharray="60 1500"
                                strokeLinecap="round"
                                animate={{ strokeDashoffset: [1560, 0] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            />
                        </svg>
                    )}

                    <motion.nav
                        layout
                        layoutRoot
                        className="relative inline-flex items-center gap-1.5 rounded-full px-2 py-2"
                        style={{
                            background: "#0a0a0a",
                            border: isBimSectionActive ? "none" : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: isBimSectionActive
                                ? "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.12)"
                                : "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                    >
                        {modules.map((mod) => {
                            const isHovered = hoveredId === mod.id;
                            const lastPop = popKey[mod.id] ?? 0;

                            return (
                                /*
                                 * ── STABLE HOVER WRAPPER ──────────────────────────────────
                                 * This outer div has FIXED padding so its hit-box never
                                 * changes. Mouse events live here exclusively so the
                                 * expanding inner button can't push the cursor out.
                                 * p-1 gives ~4px of invisible guard zone around each slot.
                                 * ──────────────────────────────────────────────────────── */
                                <div
                                    key={mod.id}
                                    className="relative p-1 cursor-pointer"
                                    onMouseEnter={() => setHoveredId(mod.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={() => handleScroll(mod.targetId)}
                                >
                                    {/* Inner animated button — purely visual, no pointer events */}
                                    <motion.div
                                        layout
                                        className="relative flex items-center gap-2 rounded-full overflow-hidden pointer-events-none"
                                        style={{
                                            background: isHovered ? mod.color : "transparent",
                                            padding: isHovered ? "8px 16px 8px 10px" : "10px",
                                            WebkitFontSmoothing: "antialiased",
                                        }}
                                        // Pop animation: scale + brightness flash
                                        // NOTE: keyframe arrays (>2 values) require type:"tween".
                                        // We scope the transition inside the animate object so
                                        // layout can still use its own spring via LayoutGroup.
                                        animate={
                                            lastPop > 0
                                                ? {
                                                    scale: [1, 1.18, 0.95, 1],
                                                    filter: [
                                                        "brightness(1)",
                                                        "brightness(1.8)",
                                                        "brightness(1.1)",
                                                        "brightness(1)",
                                                    ],
                                                    transition: {
                                                        type: "tween",
                                                        duration: 0.35,
                                                        ease: "easeInOut",
                                                    },
                                                }
                                                : {
                                                    scale: 1,
                                                    filter: "brightness(1)",
                                                    transition: { type: "spring", stiffness: 400, damping: 30 },
                                                }
                                        }
                                        // KEY: fresh key per pop so React re-mounts & replays animation
                                        key={`${mod.id}-${lastPop}`}
                                    >
                                        <mod.Icon
                                            className="h-5 w-5 shrink-0 relative z-10"
                                            strokeWidth={isHovered ? 2.5 : 2}
                                            style={{
                                                color: isHovered ? mod.activeColor : "rgba(255,255,255,0.65)",
                                                transition: "color 0.15s",
                                            }}
                                        />

                                        {/* Label — overflow-hidden + whitespace-nowrap prevents
                                        text from wrapping during the layout width expansion */}
                                        <AnimatePresence mode="popLayout">
                                            {isHovered && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="overflow-hidden whitespace-nowrap text-[13px] font-semibold tracking-wide leading-none relative z-10"
                                                    style={{
                                                        color: mod.activeColor,
                                                        fontFamily: "Inter, system-ui, sans-serif",
                                                    }}
                                                >
                                                    {mod.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Pop ring overlay — key={lastPop} forces re-mount on every pop */}
                                        {lastPop > 0 && (
                                            <motion.div
                                                key={lastPop}
                                                className="absolute inset-0 rounded-full pointer-events-none"
                                                initial={{ opacity: 0.9, scale: 0.7 }}
                                                animate={{ opacity: 0, scale: 1.6 }}
                                                transition={{ duration: 0.45, ease: "easeOut" }}
                                                style={{
                                                    border: `2px solid ${mod.color}`,
                                                    backgroundColor: `${mod.color}25`,
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </motion.nav>
                </div>
            </LayoutGroup>
        </motion.div>
    );
}
