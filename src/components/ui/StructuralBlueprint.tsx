"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   StructuralBlueprint — Client-Defined Isometric Building
   with Warm LED 2700K Path-Tracing Animation
   ══════════════════════════════════════════════════════════════ */

/* ── SCAN PATH ─────────────────────────────────────────────
   The warm LED light enters from off-screen right,
   then methodically traces through every structural member.
   It follows: entry → base slab → columns up → level 1 beams
   → columns up → level 2 beams → crosses → crane exit.
   ─────────────────────────────────────────────────────────── */
const SCAN_PATH = [
    // ── ENTRY: from far off-screen right
    "M 750,300",
    // Fast horizontal approach to the building's front-right corner
    "L 500,300",
    // ── BASE SLAB: Trace the foundation diamond
    "L 300,200", "L 100,300", "L 300,400", "L 500,300",
    // ── COLUMNS N1: Up each column to Level 1
    // Right column
    "L 500,150",
    // Across beam N2 top to left
    "L 300,50",
    // Down left column
    "L 300,200",
    // Left column up
    "L 100,300", "L 100,150",
    // ── LEVEL 2 BEAM: Trace the upper perimeter
    "L 300,250", "L 500,150",
    // Cross beams
    "L 300,50", "L 100,150",
    // Horizontal cross
    "L 500,150",
    // Back down to center
    "L 300,250",
    // ── LEVEL 1 BEAM: Trace back down
    "L 300,400",
    // Cross beams N1
    "L 300,200",
    // Horizontal cross
    "L 100,300", "L 500,300",
    // ── FINAL: Up right column to top, then exit right
    "L 500,150",
    "L 500,50",
    // Exit off-screen upper-right
    "L 700,0",
].join(" ");

// Approximate path length for dash animation
function calcPathLength(d: string): number {
    const nums = d.match(/[-\d.]+/g);
    if (!nums) return 2000;
    let len = 0;
    for (let i = 2; i < nums.length; i += 2) {
        const dx = parseFloat(nums[i]) - parseFloat(nums[i - 2]);
        const dy = parseFloat(nums[i + 1]) - parseFloat(nums[i - 1]);
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
}

const PATH_LEN = calcPathLength(SCAN_PATH);

// ── ANIMATION TIMINGS ──────────────────────
const CYCLE = 12;          // seconds per full scan cycle
const PAUSE = 2;           // seconds pause between cycles
const ENTRY_T = 0.06;      // fraction for the fast entry portion

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function StructuralBlueprint() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-[500px] w-full" />;

    return (
        <div className="relative w-full max-w-[600px]">
            <svg
                viewBox="-20 -20 780 540"
                className="h-auto w-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* ── DEFINITIONS ── */}
                <defs>
                    {/* Warm LED gradient stroke */}
                    <linearGradient id="ledWarmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c39767" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#fff4e0" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c39767" stopOpacity="0.5" />
                    </linearGradient>

                    {/* Outer glow: wide diffuse halo */}
                    <filter id="outerGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                    </filter>

                    {/* Inner glow: tight LED tube feel */}
                    <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Scanner dot radial gradient */}
                    <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff4e0" stopOpacity="1" />
                        <stop offset="35%" stopColor="#ffbf00" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#c39767" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* ═══════════════════════════════════════════
            STATIC STRUCTURE (Client-provided geometry)
            ═══════════════════════════════════════════ */}
                <g stroke="#593a25" strokeWidth="1" fill="none" opacity="0.3">
                    {/* Cimientos y Planta Baja */}
                    <path d="M100 400 L300 500 L500 400 L300 300 Z" /> {/* Base Losa */}
                    <path d="M100 400 L100 300 M300 500 L300 400 M500 400 L500 300 M300 300 L300 200" /> {/* Columnas N1 */}

                    {/* Nivel 1 (Vigas Principales) */}
                    <path d="M100 300 L300 400 L500 300 L300 200 Z" strokeWidth="2" /> {/* Viga Perimetral N1 */}
                    <path d="M300 400 L300 200 M100 300 L500 300" /> {/* Vigas Cruce N1 */}

                    {/* Columnas N2 */}
                    <path d="M100 300 L100 150 M300 400 L300 250 M500 300 L500 150 M300 200 L300 50" />

                    {/* Nivel 2 (Vigas Superiores) */}
                    <path d="M100 150 L300 250 L500 150 L300 50 Z" strokeWidth="2" /> {/* Viga Perimetral N2 */}
                    <path d="M300 250 L300 50 M100 150 L500 150" /> {/* Vigas Cruce N2 */}

                    {/* Detalles Estructurales (Uniones / Joints) */}
                    <circle cx="100" cy="300" r="3" fill="#593a25" />
                    <circle cx="300" cy="400" r="3" fill="#593a25" />
                    <circle cx="500" cy="300" r="3" fill="#593a25" />
                    <circle cx="300" cy="200" r="3" fill="#593a25" />
                </g>

                {/* Additional structural detail — faint interior bracing */}
                <g stroke="#593a25" strokeWidth="0.5" fill="none" opacity="0.15">
                    {/* Cross bracing floor 1 */}
                    <path d="M100 400 L300 200 M300 400 L100 300" />
                    <path d="M500 400 L300 200 M300 400 L500 300" />
                    {/* Cross bracing floor 2 */}
                    <path d="M100 300 L300 50 M300 250 L100 150" />
                    <path d="M500 300 L300 50 M300 250 L500 150" />
                    {/* Horizontal ties at mid-column heights */}
                    <path d="M100 350 L300 450 L500 350" strokeDasharray="3 5" />
                    <path d="M100 225 L300 325 L500 225" strokeDasharray="3 5" />
                </g>

                {/* Faint dimension / annotation lines (architectural feel) */}
                <g stroke="#593a25" strokeWidth="0.3" fill="none" opacity="0.12">
                    {/* Vertical dimension lines */}
                    <path d="M60 400 L60 300" />
                    <path d="M55 400 L65 400 M55 300 L65 300" />
                    <path d="M60 300 L60 150" />
                    <path d="M55 300 L65 300 M55 150 L65 150" />
                    {/* Horizontal dimension line */}
                    <path d="M100 470 L500 470" />
                    <path d="M100 465 L100 475 M500 465 L500 475" />
                </g>

                {/* Dimension text annotations */}
                <g fill="#593a25" opacity="0.18" fontSize="8" fontFamily="var(--font-roboto-mono), monospace">
                    <text x="35" y="355" textAnchor="middle">3.60m</text>
                    <text x="35" y="230" textAnchor="middle">4.50m</text>
                    <text x="300" y="488" textAnchor="middle">15.70m</text>
                </g>

                {/* ═══════════════════════════════════════════
            ANIMATED LED TRACE — 3 Layers
            ═══════════════════════════════════════════ */}

                {/* LAYER 1: Wide diffuse outer glow (background halo) */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="#c39767"
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={PATH_LEN}
                    filter="url(#outerGlow)"
                    initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                        opacity: [0, 0.25, 0.2, 0],
                    }}
                    transition={{
                        duration: CYCLE,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: PAUSE,
                        times: [0, ENTRY_T, 0.92, 1],
                    }}
                />

                {/* LAYER 2: Main LED trace (sharp warm gradient) */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="url(#ledWarmGrad)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={PATH_LEN}
                    filter="url(#innerGlow)"
                    initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                        opacity: [0, 1, 0.8, 0],
                    }}
                    transition={{
                        duration: CYCLE,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: PAUSE,
                        times: [0, ENTRY_T, 0.92, 1],
                    }}
                />

                {/* LAYER 3: White-hot inner core */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="#fff4e0"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={PATH_LEN}
                    initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                        opacity: [0, 0.95, 0.7, 0],
                    }}
                    transition={{
                        duration: CYCLE,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: PAUSE,
                        times: [0, ENTRY_T, 0.92, 1],
                    }}
                />

                {/* ── SCANNER DOT (follows the path tip) ── */}
                <motion.circle
                    r={8}
                    fill="url(#dotGrad)"
                    filter="url(#outerGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.9, 0] }}
                    transition={{
                        duration: CYCLE,
                        repeat: Infinity,
                        repeatDelay: PAUSE,
                        times: [0, ENTRY_T, 0.92, 1],
                    }}
                >
                    <animateMotion
                        dur={`${CYCLE}s`}
                        repeatCount="indefinite"
                        path={SCAN_PATH}
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="spline"
                        keySplines="0.15 0.4 0.6 1"
                    />
                </motion.circle>

                {/* ── DATA ANNOTATIONS (appear at structural nodes) ── */}
                {[
                    { x: 510, y: 290, text: "▸ Col-D4  σ = 12.8 MPa", delay: 1.5 },
                    { x: 310, y: 185, text: "▸ Viga-N1  L = 15.70m", delay: 4.0 },
                    { x: 80, y: 140, text: "▸ Nodo-A2  ✓ Verificado", delay: 7.0 },
                    { x: 310, y: 40, text: "▸ N+14.40  Cubierta", delay: 10.0 },
                ].map((ann, i) => (
                    <motion.g
                        key={`ann-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.7, 0.7, 0] }}
                        transition={{
                            duration: 3,
                            delay: ann.delay,
                            repeat: Infinity,
                            repeatDelay: CYCLE + PAUSE - 3,
                        }}
                    >
                        <rect
                            x={ann.x - 5}
                            y={ann.y - 11}
                            width={ann.text.length * 5.5 + 14}
                            height={16}
                            rx={2}
                            fill="rgba(15, 8, 5, 0.92)"
                            stroke="rgba(195, 151, 103, 0.25)"
                            strokeWidth={0.5}
                        />
                        <text
                            x={ann.x}
                            y={ann.y + 1}
                            fill="#c39767"
                            fontSize="8"
                            fontFamily="var(--font-roboto-mono), monospace"
                            opacity={0.75}
                        >
                            {ann.text}
                        </text>
                    </motion.g>
                ))}

                {/* ── AMBIENT GROUND GLOW ── */}
                <motion.ellipse
                    cx={300}
                    cy={510}
                    rx={160}
                    ry={10}
                    fill="#c39767"
                    filter="url(#outerGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.01, 0.04, 0.01] }}
                    transition={{ duration: CYCLE, repeat: Infinity, repeatDelay: PAUSE }}
                />
            </svg>

            {/* Corner tech label */}
            <div className="absolute bottom-1 right-3 font-mono text-[8px] tracking-widest text-primary/15">
                STRUCT_SCAN // v2.1
            </div>
        </div>
    );
}
