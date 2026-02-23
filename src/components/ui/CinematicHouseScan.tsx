"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   CinematicHouseScan — Modern Residential Architecture
   Ultra-slow warm LED path-trace over a massive minimalist house
   ══════════════════════════════════════════════════════════════ */

/*
  DESIGN NOTES
  ────────────
  A two-story modern minimalist house drawn as a line illustration:
  - Flat roofs with cantilevered overhangs
  - Large panoramic floor-to-ceiling windows
  - Mixed volumes (recessed garage, projecting upper floor)
  - Clean geometric lines, no ornamentation
  - The house is MASSIVE — bleeds off the right and bottom edges
  - Base lines are nearly invisible (#2a1a12, 20% opacity)
  - Only the LED scanner brings light into the darkness

  The SVG viewBox is designed so the house extends beyond
  the visible area on the right and bottom, creating the
  "bleeding edge" immersive effect.
*/

// ── HOUSE GEOMETRY ────────────────────────────────────────
// All coordinates hand-crafted for a modern minimalist house
// viewBox: "0 0 900 700" — house extends to ~1050 x and ~750 y

const HOUSE_BASE = `
  M 150,520 L 150,320
  L 150,320 L 350,320
  L 350,320 L 350,200
  L 350,200 L 900,200
  L 900,200 L 900,520
  L 900,520 L 150,520
`;

const ROOF_MAIN = `
  M 120,320 L 380,320
  M 320,200 L 950,200
  M 320,195 L 950,195
`;

const ROOF_OVERHANG_UPPER = `
  M 320,200 L 320,195 L 950,195 L 950,200
`;

const GROUND_LINE = `
  M 0,520 L 1050,520
`;

// Vertical structural divisions
const VERTICALS = `
  M 350,200 L 350,520
  M 550,200 L 550,520
  M 700,200 L 700,520
  M 150,320 L 150,520
`;

// Upper floor (left volume — set back)
const UPPER_LEFT = `
  M 150,320 L 350,320
  M 150,320 L 150,200
  M 150,200 L 350,200
`;

// Wait — the left volume is the taller box
// Let me redefine:  the house has a main lower volume 
// and a taller left section

const UPPER_VOLUME = `
  M 150,195 L 150,320
  M 150,195 L 370,195
  M 370,195 L 370,320
  M 120,195 L 400,195
`;

// ── WINDOWS ──────────────────────────────
// Ground floor — large panoramic windows
const WINDOWS_GF = `
  M 380,340 L 380,490 L 520,490 L 520,340 Z
  M 580,340 L 580,490 L 670,490 L 670,340 Z
  M 730,340 L 730,490 L 870,490 L 870,340 Z
`;

// Upper floor — tall narrow windows on left volume  
const WINDOWS_UF = `
  M 170,220 L 170,300 L 230,300 L 230,220 Z
  M 260,220 L 260,300 L 340,300 L 340,220 Z
`;

// Window mullions (vertical dividers inside large windows)
const MULLIONS = `
  M 450,340 L 450,490
  M 625,340 L 625,490
  M 800,340 L 800,490
  M 200,220 L 200,300
  M 300,220 L 300,300
`;

// ── STRUCTURAL DETAILS ────────────────────
// Balcony / terrace on upper right
const TERRACE = `
  M 370,320 L 550,320
  M 370,310 L 550,310
`;

// Garage door (recessed left of main house)
const GARAGE = `
  M 50,390 L 50,520
  M 50,390 L 140,390
  M 140,390 L 140,520
  M 55,395 L 55,515 L 135,515 L 135,395 Z
`;

// Entrance door
const DOOR = `
  M 555,400 L 555,520
  M 555,400 L 595,400
  M 595,400 L 595,520
`;

// Horizontal floor line (separating upper/lower at the right section)
const FLOOR_LINE = `
  M 350,320 L 900,320
`;

// Railing on terrace
const RAILING = `
  M 375,315 L 375,320
  M 400,315 L 400,320
  M 425,315 L 425,320
  M 450,315 L 450,320
  M 475,315 L 475,320
  M 500,315 L 500,320
  M 525,315 L 525,320
  M 545,315 L 545,320
`;

// Steps at entrance
const STEPS = `
  M 545,520 L 545,530 L 605,530 L 605,520
  M 540,530 L 540,540 L 610,540 L 610,530
`;

// Landscaping hints — minimal ground lines
const LANDSCAPE = `
  M 0,540 L 180,540
  M 620,535 L 800,535
  M 810,538 L 1050,538
`;

// ── COMBINED SCAN PATH ──────────────────────
// The LED enters from far right, traces the house outline,
// then moves through windows and interior details
const SCAN_PATH = [
    // ── ENTRY: from off-screen right
    "M 1100,320",
    // Approach along the main roof line
    "L 950,200",
    // Roof overhang right→left
    "L 320,200",
    // Down left edge of upper volume
    "L 150,200",
    "L 150,195",
    "L 120,195",
    // Back across upper roof
    "L 400,195",
    "L 370,195",
    // Down right side of upper volume
    "L 370,320",
    // Along floor line right
    "L 900,320",
    // Down right wall
    "L 900,520",
    // Ground line left
    "L 150,520",
    // Up left wall to upper volume
    "L 150,320",
    // Back up to upper left
    "L 150,200",

    // ── INTERIOR SCAN: Windows ground floor
    // Window 1
    "L 350,320",
    "L 380,340", "L 520,340", "L 520,490", "L 380,490", "L 380,340",
    // Window 2
    "L 580,340", "L 670,340", "L 670,490", "L 580,490", "L 580,340",
    // Window 3
    "L 730,340", "L 870,340", "L 870,490", "L 730,490", "L 730,340",

    // ── INTERIOR SCAN: Windows upper floor
    "L 350,300",
    "L 340,300", "L 340,220", "L 260,220", "L 260,300",
    "L 230,300", "L 230,220", "L 170,220", "L 170,300",

    // ── DETAILS: Door, verticals
    "L 150,320",
    "L 350,320", "L 350,520",
    "L 550,520", "L 550,200",
    "L 700,200", "L 700,520",

    // ── EXIT: fade going up-right toward roof
    "L 900,320",
    "L 950,200",
    "L 1100,150",
].join(" ");

// Approximate total path length for stroke-dash animation
function calcLen(d: string): number {
    const n = d.match(/[-\d.]+/g);
    if (!n) return 3000;
    let l = 0;
    for (let i = 2; i < n.length; i += 2) {
        const dx = parseFloat(n[i]) - parseFloat(n[i - 2]);
        const dy = parseFloat(n[i + 1]) - parseFloat(n[i - 1]);
        l += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.ceil(l);
}

const PATH_LEN = calcLen(SCAN_PATH);

// ── ANIMATION TIMINGS ──────────────────────
const CYCLE = 28;         // seconds — ultra slow, hypnotic
const PAUSE = 3;          // seconds pause between cycles
const ENTRY_T = 0.03;     // fraction — fast entry from off-screen

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */
export default function CinematicHouseScan() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-[600px] w-full" />;

    // Base line opacity and color
    const BASE = "#2a1a12";
    const BASE_OP = 0.2;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Position the SVG to bleed off right and bottom */}
            <div
                className="absolute"
                style={{
                    top: "5%",
                    left: "28%",
                    width: "80%",
                    height: "110%",
                }}
            >
                <svg
                    viewBox="0 0 1050 600"
                    className="h-full w-full"
                    preserveAspectRatio="xMinYMin slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* Warm LED gradient */}
                        <linearGradient id="warmLED" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#c39767" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#fffce0" stopOpacity="1" />
                            <stop offset="100%" stopColor="#c39767" stopOpacity="0.4" />
                        </linearGradient>

                        {/* Heavy glow filter for the LED scanner */}
                        <filter id="ledGlow" x="-200%" y="-200%" width="500%" height="500%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                            <feMerge>
                                <feMergeNode in="blur2" />
                                <feMergeNode in="blur1" />
                            </feMerge>
                        </filter>

                        {/* Tight glow for main line */}
                        <filter id="tightGlow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Scanner dot */}
                        <radialGradient id="scanDot" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fffce0" stopOpacity="1" />
                            <stop offset="30%" stopColor="#ffbf00" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#c39767" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* ═══════════════════════════════════════════════
              STATIC HOUSE STRUCTURE (near-invisible in shadow)
              ═══════════════════════════════════════════════ */}
                    <g stroke={BASE} fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {/* Main walls */}
                        <path d={HOUSE_BASE} strokeWidth="1.2" opacity={BASE_OP} />

                        {/* Upper volume */}
                        <path d={UPPER_VOLUME} strokeWidth="1.2" opacity={BASE_OP} />

                        {/* Roof lines */}
                        <path d={ROOF_MAIN} strokeWidth="1.5" opacity={BASE_OP * 1.2} />
                        <path d={ROOF_OVERHANG_UPPER} strokeWidth="0.8" opacity={BASE_OP * 0.8} />

                        {/* Floor separation */}
                        <path d={FLOOR_LINE} strokeWidth="1" opacity={BASE_OP} />

                        {/* Structural verticals */}
                        <path d={VERTICALS} strokeWidth="0.8" opacity={BASE_OP * 0.7} />

                        {/* Ground */}
                        <path d={GROUND_LINE} strokeWidth="0.5" opacity={BASE_OP * 0.5} />

                        {/* Windows — ground floor */}
                        <path d={WINDOWS_GF} strokeWidth="0.7" opacity={BASE_OP * 0.6} />

                        {/* Windows — upper floor */}
                        <path d={WINDOWS_UF} strokeWidth="0.7" opacity={BASE_OP * 0.6} />

                        {/* Window mullions */}
                        <path d={MULLIONS} strokeWidth="0.4" opacity={BASE_OP * 0.4} />

                        {/* Terrace */}
                        <path d={TERRACE} strokeWidth="0.8" opacity={BASE_OP * 0.7} />

                        {/* Railing */}
                        <path d={RAILING} strokeWidth="0.3" opacity={BASE_OP * 0.3} />

                        {/* Garage */}
                        <path d={GARAGE} strokeWidth="0.7" opacity={BASE_OP * 0.5} />

                        {/* Door */}
                        <path d={DOOR} strokeWidth="0.7" opacity={BASE_OP * 0.6} />

                        {/* Steps */}
                        <path d={STEPS} strokeWidth="0.5" opacity={BASE_OP * 0.4} />

                        {/* Landscape hints */}
                        <path d={LANDSCAPE} strokeWidth="0.3" opacity={BASE_OP * 0.3} strokeDasharray="8 12" />
                    </g>

                    {/* ═══════════════════════════════════════════════
              ANIMATED LED SCAN — 3 Layers
              ═══════════════════════════════════════════════ */}

                    {/* LAYER 1: Wide atmospheric halo */}
                    <motion.path
                        d={SCAN_PATH}
                        fill="none"
                        stroke="#c39767"
                        strokeWidth={16}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={PATH_LEN}
                        filter="url(#ledGlow)"
                        initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                        animate={{
                            strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                            opacity: [0, 0.2, 0.15, 0],
                        }}
                        transition={{
                            duration: CYCLE,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: PAUSE,
                            times: [0, ENTRY_T, 0.94, 1],
                        }}
                    />

                    {/* LAYER 2: Main LED trace (warm gradient) */}
                    <motion.path
                        d={SCAN_PATH}
                        fill="none"
                        stroke="url(#warmLED)"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={PATH_LEN}
                        filter="url(#tightGlow)"
                        initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                        animate={{
                            strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                            opacity: [0, 1, 0.85, 0],
                        }}
                        transition={{
                            duration: CYCLE,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: PAUSE,
                            times: [0, ENTRY_T, 0.94, 1],
                        }}
                    />

                    {/* LAYER 3: White-hot core */}
                    <motion.path
                        d={SCAN_PATH}
                        fill="none"
                        stroke="#fffce0"
                        strokeWidth={0.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={PATH_LEN}
                        initial={{ strokeDashoffset: PATH_LEN, opacity: 0 }}
                        animate={{
                            strokeDashoffset: [PATH_LEN, 0, 0, PATH_LEN],
                            opacity: [0, 0.95, 0.75, 0],
                        }}
                        transition={{
                            duration: CYCLE,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: PAUSE,
                            times: [0, ENTRY_T, 0.94, 1],
                        }}
                    />

                    {/* ── SCANNER DOT ── */}
                    <motion.circle
                        r={12}
                        fill="url(#scanDot)"
                        filter="url(#ledGlow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.9, 0] }}
                        transition={{
                            duration: CYCLE,
                            repeat: Infinity,
                            repeatDelay: PAUSE,
                            times: [0, ENTRY_T, 0.94, 1],
                        }}
                    >
                        <animateMotion
                            dur={`${CYCLE}s`}
                            repeatCount="indefinite"
                            path={SCAN_PATH}
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.1 0.3 0.7 1"
                        />
                    </motion.circle>

                    {/* ── FAINT DATA ANNOTATIONS ── */}
                    {[
                        { x: 380, y: 310, text: "N+3.60  Terraza", delay: 8 },
                        { x: 560, y: 185, text: "Cubierta  A = 280 m²", delay: 3 },
                        { x: 730, y: 475, text: "Ventanal  3.20 × 2.80m", delay: 16 },
                        { x: 165, y: 210, text: "N+7.20  Planta Alta", delay: 20 },
                    ].map((ann, i) => (
                        <motion.g
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0.5, 0] }}
                            transition={{
                                duration: 4,
                                delay: ann.delay,
                                repeat: Infinity,
                                repeatDelay: CYCLE + PAUSE - 4,
                            }}
                        >
                            <rect
                                x={ann.x - 5}
                                y={ann.y - 11}
                                width={ann.text.length * 5.4 + 14}
                                height={16}
                                rx={2}
                                fill="rgba(10, 5, 3, 0.95)"
                                stroke="rgba(195, 151, 103, 0.15)"
                                strokeWidth={0.5}
                            />
                            <text
                                x={ann.x}
                                y={ann.y + 1}
                                fill="#c39767"
                                fontSize="7.5"
                                fontFamily="var(--font-roboto-mono), monospace"
                                opacity={0.6}
                            >
                                {ann.text}
                            </text>
                        </motion.g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
