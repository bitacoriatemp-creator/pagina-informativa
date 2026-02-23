"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   SkylineCircuit — "Tech Structural Skeleton"
   ──────────────────────────────────────────────────────────────
   A bold, modern multi-volume building viewed from a dramatic
   low angle (contrapicado). Fewer lines than a dense wireframe,
   but each line is THICK, DEFINED, and represents a real
   structural member: slab edges, columns, beams, cantilevers.

   Base: visible at 0.4–0.5 opacity in dark brown.
   Light: gold comet traces race through main members.
   ══════════════════════════════════════════════════════════════ */

// ── LOW-ANGLE 3-POINT PERSPECTIVE BUILDING ────────────────
//
// The building is composed of stacked, offset volumes:
//
//   ┌──────────┐           ← Volume D: Crown (narrow, top)
//   │          │
//   │    ┌─────┴────────┐  ← Volume C: Upper tower (offset right)
//   │    │              │
//   ├────┤              │
//   │    └───┬──────────┘
//   │        │
//   ├────────┤              ← Volume B: Main tower
//   │        │
//   ├────────┼──────────┐  ← Volume A: Wide podium (cantilever right)
//   │        │          │
//   └────────┴──────────┘
//
// Low-angle means vanishing point is ABOVE, so horizontal
// edges converge upward and vertical edges splay outward at base.

// ── STRUCTURAL PATHS (hand-crafted for bold architecture) ──

function buildSkeleton(): { main: string[]; secondary: string[]; detail: string[] } {
    const main: string[] = [];     // Primary structure: slab edges, main columns (thick)
    const secondary: string[] = []; // Beams, cantilevers (medium)
    const detail: string[] = [];    // Floor marks, window bays (thin)

    // ══════════════════════════════════════════════
    // VOLUME A — Wide Podium / Base (3 floors)
    // Viewed from below-left, strong perspective
    // ══════════════════════════════════════════════

    // Front face
    main.push("M 90 620 L 90 460");           // Left column
    main.push("M 560 620 L 560 460");          // Right column
    main.push("M 90 460 L 560 460");           // Top slab edge
    main.push("M 90 620 L 560 620");           // Ground slab

    // Intermediate slabs
    secondary.push("M 90 513 L 560 513");      // Floor 2
    secondary.push("M 90 567 L 560 567");      // Floor 1

    // Interior columns
    secondary.push("M 200 460 L 200 620");
    secondary.push("M 330 460 L 330 620");
    secondary.push("M 460 460 L 460 620");

    // Right side face (perspective receding)
    main.push("M 560 460 L 650 430");          // Top slab — side
    main.push("M 560 620 L 650 595");          // Ground — side
    main.push("M 650 430 L 650 595");          // Far-right edge

    secondary.push("M 560 513 L 650 486");     // Floor 2 — side
    secondary.push("M 560 567 L 650 543");     // Floor 1 — side

    // Side columns
    secondary.push("M 605 430 L 605 595");

    // Cantilever overhang extending right from podium top
    main.push("M 560 460 L 690 445");
    main.push("M 560 472 L 690 458");
    secondary.push("M 690 445 L 690 458");

    // Window bays on podium front
    for (let i = 0; i < 8; i++) {
        const wx = 100 + i * 57;
        detail.push(`M ${wx} 465 L ${wx} 615`);
    }

    // ══════════════════════════════════════════════
    // VOLUME B — Main Tower (10 floors)
    // Rises from the left portion of the podium
    // ══════════════════════════════════════════════

    // Front face
    main.push("M 90 460 L 90 170");            // Left column (continuing up)
    main.push("M 370 460 L 370 170");           // Right column
    main.push("M 90 170 L 370 170");            // Top slab

    // Floor slabs (every ~29px for 10 floors)
    const bFloors = 10;
    for (let f = 1; f < bFloors; f++) {
        const fy = 170 + f * 29;
        secondary.push(`M 90 ${fy} L 370 ${fy}`);
    }

    // Main structural columns
    main.push("M 185 170 L 185 460");           // Center-left column
    main.push("M 280 170 L 280 460");           // Center-right column

    // Right side face
    main.push("M 370 170 L 440 148");           // Top slab — side
    main.push("M 370 460 L 440 435");           // Bot slab — side
    main.push("M 440 148 L 440 435");           // Far edge

    // Side floor slabs
    for (let f = 1; f < bFloors; f++) {
        const fyL = 170 + f * 29;
        const fyR = 148 + f * 28.7;
        secondary.push(`M 370 ${fyL} L 440 ${fyR}`);
    }

    // Side column
    secondary.push("M 405 148 L 405 435");

    // Window bays — front (vertical mullions every bay)
    for (let i = 0; i < 5; i++) {
        const wx = 100 + i * 55;
        detail.push(`M ${wx} 175 L ${wx} 455`);
    }

    // ══════════════════════════════════════════════
    // VOLUME C — Upper Tower (offset right, 8 floors)
    // Cantilevered from main tower, extends right
    // ══════════════════════════════════════════════

    // Front face
    main.push("M 220 310 L 220 95");            // Left column
    main.push("M 520 310 L 520 95");            // Right column
    main.push("M 220 95 L 520 95");             // Top slab
    main.push("M 220 310 L 520 310");           // Bottom slab

    // The left part overlaps Volume B — this is the cantilever connection
    // Cantilever beam connecting C to B
    main.push("M 280 310 L 280 95");            // Shared column with B

    // Floor slabs
    const cFloors = 8;
    for (let f = 1; f < cFloors; f++) {
        const fy = 95 + f * (215 / cFloors);
        secondary.push(`M 220 ${fy} L 520 ${fy}`);
    }

    // Interior columns
    secondary.push("M 370 95 L 370 310");
    secondary.push("M 445 95 L 445 310");

    // Right side face
    main.push("M 520 95 L 600 72");
    main.push("M 520 310 L 600 290");
    main.push("M 600 72 L 600 290");

    // Side floor slabs
    for (let f = 1; f < cFloors; f++) {
        const fyL = 95 + f * (215 / cFloors);
        const fyR = 72 + f * (218 / cFloors);
        secondary.push(`M 520 ${fyL} L 600 ${fyR}`);
    }

    secondary.push("M 560 72 L 560 290");

    // Window bays
    for (let i = 0; i < 5; i++) {
        const wx = 240 + i * 57;
        detail.push(`M ${wx} 100 L ${wx} 305`);
    }

    // ══════════════════════════════════════════════
    // VOLUME D — Crown / Penthouse (narrow, top)
    // Sits centered on top of the main arrangement
    // ══════════════════════════════════════════════

    // Front face
    main.push("M 160 170 L 160 40");
    main.push("M 320 170 L 320 40");
    main.push("M 160 40 L 320 40");

    // Floor slabs
    secondary.push("M 160 83 L 320 83");
    secondary.push("M 160 126 L 320 126");

    // Columns
    secondary.push("M 240 40 L 240 170");

    // Right side face
    main.push("M 320 40 L 370 28");
    main.push("M 320 170 L 370 155");
    main.push("M 370 28 L 370 155");

    secondary.push("M 320 83 L 370 72");
    secondary.push("M 320 126 L 370 114");
    secondary.push("M 345 28 L 345 155");

    // Window bays
    detail.push("M 195 45 L 195 165");
    detail.push("M 280 45 L 280 165");

    // ══════════════════════════════════════════════
    // ANTENNA / SPIRE from crown
    // ══════════════════════════════════════════════
    main.push("M 240 40 L 240 -15");
    secondary.push("M 232 15 L 248 15");
    secondary.push("M 235 0 L 245 0");

    // ══════════════════════════════════════════════
    // STRUCTURAL CROSS-BRACING (X patterns)
    // Applied to key bays for that "engineering" look
    // ══════════════════════════════════════════════

    // Volume B — exposed bracing left bay, floors 1-3
    detail.push("M 90 373 L 185 460");
    detail.push("M 185 373 L 90 460");

    // Volume C — exposed bracing right bay
    detail.push("M 445 95 L 520 149");
    detail.push("M 520 95 L 445 149");

    // Podium A — bracing in end bays
    detail.push("M 90 460 L 200 513");
    detail.push("M 200 460 L 90 513");
    detail.push("M 460 460 L 560 513");
    detail.push("M 560 460 L 460 513");

    // ══════════════════════════════════════════════
    // GROUND PLANE — perspective grid
    // ══════════════════════════════════════════════
    main.push("M 20 620 L 720 620");
    detail.push("M 30 635 L 710 635");
    detail.push("M 40 648 L 700 648");
    // Vertical ground marks (column bases)
    detail.push("M 90 620 L 85 648");
    detail.push("M 330 620 L 330 648");
    detail.push("M 560 620 L 565 648");

    return { main, secondary, detail };
}

const SKELETON = buildSkeleton();

// ── CIRCUIT TRACE PATHS ──────────────────────────────────
// Three circuits that follow MAIN structural members.
// These trace the "arteries" of the building.

// Circuit 1: Ground → up left main column → across podium slab →
//            up tower B center → across to tower C → up to crown → antenna
const CIRCUIT_1 = [
    "M 90 670",
    "L 90 620",           // Ground to base
    "L 90 460",           // Up podium left column
    "L 560 460",          // Across podium top slab
    "L 560 310",          // Up to volume C base (via shared column position)
    "L 520 310",          // Across to C right column
    "L 520 95",           // Up C right column
    "L 220 95",           // Across C top slab
    "L 220 170",          // Down to connection
    "L 160 170",          // Across to crown D
    "L 160 40",           // Up crown left column
    "L 240 40",           // Across crown top
    "L 240 -15",          // Up antenna
].join(" ");

// Circuit 2: Right side → up podium side → across → up tower B → branch left
const CIRCUIT_2 = [
    "M 690 458",
    "L 650 430",           // Enter via cantilever
    "L 560 460",           // Corner to front
    "L 370 460",           // Along podium to tower B right
    "L 370 170",           // Up tower B right column
    "L 440 148",           // Side face top
    "L 440 435",           // Down side face (tracing the edge)
    "L 370 460",           // Back to corner
    "L 280 460",           // Along to center column
    "L 280 95",            // Up shared column B/C
    "L 370 95",            // Across to C interior column
    "L 370 310",           // Down C column
].join(" ");

// Circuit 3: Podium loop + C side face
const CIRCUIT_3 = [
    "M 330 670",
    "L 330 620",           // Ground to base
    "L 330 460",           // Up center podium column
    "L 90 460",            // Left along slab
    "L 90 170",            // Up tower B left column
    "L 185 170",           // Right across top
    "L 185 460",           // Down center-left column
    "L 330 460",           // Right along slab
    "L 520 310",           // Up to C (following right edge)
    "L 600 290",           // Side face C
    "L 600 72",            // Up side face
    "L 520 95",            // Back to front
].join(" ");

// Path length calculator
function calcLen(d: string): number {
    const n = d.match(/[-\d.]+/g);
    if (!n) return 2000;
    let l = 0;
    for (let i = 2; i < n.length; i += 2) {
        const dx = parseFloat(n[i]) - parseFloat(n[i - 2]);
        const dy = parseFloat(n[i + 1]) - parseFloat(n[i - 1]);
        l += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.ceil(l);
}

// ── COMET CONFIGS ────────────────────────────────
interface CometCfg {
    path: string;
    len: number;
    tail: number;
    dur: number;
    delay: number;
    pause: number;
}

const COMETS: CometCfg[] = [
    { path: CIRCUIT_1, len: calcLen(CIRCUIT_1), tail: 180, dur: 7, delay: 0, pause: 5 },
    { path: CIRCUIT_2, len: calcLen(CIRCUIT_2), tail: 150, dur: 6.5, delay: 3, pause: 5.5 },
    { path: CIRCUIT_3, len: calcLen(CIRCUIT_3), tail: 140, dur: 6, delay: 6, pause: 4.5 },
];

/* Comet renderer — 3-layer gold light with fading tail */
function CometTrace({ c }: { c: CometCfg }) {
    const { path, len, tail, dur, delay, pause } = c;
    const dash = `${tail} ${len}`;
    const from = len + tail;
    const to = -tail;

    return (
        <g>
            {/* Layer 1: Wide atmospheric halo */}
            <motion.path
                d={path} fill="none" stroke="#c39767"
                strokeWidth={18} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={dash} filter="url(#haloGlow)"
                initial={{ strokeDashoffset: from, opacity: 0 }}
                animate={{
                    strokeDashoffset: [from, to],
                    opacity: [0, 0.2, 0.2, 0],
                }}
                transition={{ duration: dur, delay, ease: "linear", repeat: Infinity, repeatDelay: pause, times: [0, 0.05, 0.88, 1] }}
            />
            {/* Layer 2: Main gold trace */}
            <motion.path
                d={path} fill="none" stroke="#c39767"
                strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={dash} filter="url(#coreGlow)"
                initial={{ strokeDashoffset: from, opacity: 0 }}
                animate={{
                    strokeDashoffset: [from, to],
                    opacity: [0, 1, 0.9, 0],
                }}
                transition={{ duration: dur, delay, ease: "linear", repeat: Infinity, repeatDelay: pause, times: [0, 0.05, 0.88, 1] }}
            />
            {/* Layer 3: White-hot center (short tail for leading edge) */}
            <motion.path
                d={path} fill="none" stroke="#fffce0"
                strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={`${tail * 0.35} ${len}`}
                initial={{ strokeDashoffset: from, opacity: 0 }}
                animate={{
                    strokeDashoffset: [from, to],
                    opacity: [0, 0.85, 0.75, 0],
                }}
                transition={{ duration: dur, delay, ease: "linear", repeat: Infinity, repeatDelay: pause, times: [0, 0.05, 0.88, 1] }}
            />
        </g>
    );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
export default function SkylineCircuit() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-[600px] w-full" />;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute"
                style={{
                    top: "-5%",
                    left: "20%",
                    width: "88%",
                    height: "115%",
                }}
            >
                <svg
                    viewBox="-20 -30 760 710"
                    className="h-full w-full"
                    preserveAspectRatio="xMidYEnd slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* Wide atmospheric halo for comets */}
                        <filter id="haloGlow" x="-150%" y="-150%" width="400%" height="400%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b1" />
                            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="b2" />
                            <feMerge>
                                <feMergeNode in="b2" />
                                <feMergeNode in="b1" />
                            </feMerge>
                        </filter>

                        {/* Tight core glow for comets */}
                        <filter id="coreGlow" x="-80%" y="-80%" width="260%" height="260%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="g" />
                            <feMerge>
                                <feMergeNode in="g" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* ═══════════════════════════════════════
              STATIC SKELETON — "Apagado" but VISIBLE
              Three layers of structural importance
              ═══════════════════════════════════════ */}

                    {/* MAIN: Slab edges, primary columns (boldest) */}
                    <g stroke="#3d2216" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {SKELETON.main.map((d, i) => (
                            <path key={`m${i}`} d={d} strokeWidth="1.8" opacity="0.5" />
                        ))}
                    </g>

                    {/* SECONDARY: Beams, cantilevers, interior columns */}
                    <g stroke="#3d2216" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {SKELETON.secondary.map((d, i) => (
                            <path key={`s${i}`} d={d} strokeWidth="1.0" opacity="0.35" />
                        ))}
                    </g>

                    {/* DETAIL: Window bays, cross-bracing, ground grid */}
                    <g stroke="#3d2216" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {SKELETON.detail.map((d, i) => (
                            <path key={`d${i}`} d={d} strokeWidth="0.5" opacity="0.2" />
                        ))}
                    </g>

                    {/* ═══════════════════════════════════════
              GOLD COMET CIRCUIT TRACES
              ═══════════════════════════════════════ */}
                    {COMETS.map((c, i) => (
                        <CometTrace key={i} c={c} />
                    ))}

                    {/* ── Engineering annotations ── */}
                    {[
                        { x: 60, y: 38, text: "N+87.60  Corona", d: 1 },
                        { x: 530, y: 88, text: "N+68.40  Upper Tower", d: 4 },
                        { x: 380, y: 168, text: "N+46.20  Main Tower", d: 2.5 },
                        { x: 570, y: 455, text: "Podio — Cantilever 12.0m", d: 7 },
                        { x: 50, y: 635, text: "N±0.00  Nivel de Piso", d: 5 },
                    ].map((a, i) => (
                        <motion.text
                            key={i}
                            x={a.x} y={a.y}
                            fill="#c39767"
                            fontSize="7"
                            fontFamily="var(--font-roboto-mono), monospace"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.35, 0.35, 0] }}
                            transition={{ duration: 3.5, delay: a.d, repeat: Infinity, repeatDelay: 10 }}
                        >
                            {a.text}
                        </motion.text>
                    ))}
                </svg>
            </div>
        </div>
    );
}
