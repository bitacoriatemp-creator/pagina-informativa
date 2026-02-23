"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════
   LivingBlueprint — Premium Isometric Steel-Frame Building
   with Warm LED 2700K Path-Tracing Animation
   ══════════════════════════════════════════════════════════ */

/*
  ISOMETRIC BUILDING GEOMETRY
  ─────────────────────────────
  A multi-story steel-frame structure under construction.
  Openly exposed columns, I-beams, floor slabs, and a crane.
  Drawn in true isometric projection (30° angles).

  Iso helpers:
    Right direction: dx = cos(30°) ≈ 0.866,  dy = sin(30°) = 0.5
    Left  direction: dx = -cos(30°) ≈ -0.866, dy = sin(30°) = 0.5
    Up    direction: dx = 0, dy = -1

  Origin at bottom center of building: (400, 420)
*/

// Isometric unit scale
const S = 42; // pixels per iso unit
const OX = 390; // origin x
const OY = 430; // origin y

// Iso projection helpers
function isoRight(x: number, y: number): [number, number] {
    return [OX + x * 0.866 * S - y * 0.866 * S, OY + x * 0.5 * S + y * 0.5 * S];
}
function iso(gx: number, gy: number, gz: number): [number, number] {
    return [
        OX + (gx - gy) * 0.866 * S,
        OY + (gx + gy) * 0.5 * S - gz * S,
    ];
}

// ── BUILDING DEFINITION ───────────────────────

// Grid: 5 wide (x) × 3 deep (y) × 4 floors (z)
const FLOORS = 4;
const GX = 5; // bays in x
const GY = 3; // bays in y
const FLOOR_H = 1.8; // height per floor in iso units

// Generate column positions (grid intersections on front face + some depth)
function generateColumns(): [number, number, number, number][] {
    const cols: [number, number, number, number][] = [];
    // Front columns (y=0) at x = 0..GX
    for (let x = 0; x <= GX; x++) {
        for (let f = 0; f < FLOORS; f++) {
            const [x1, y1] = iso(x, 0, f * FLOOR_H);
            const [x2, y2] = iso(x, 0, (f + 1) * FLOOR_H);
            cols.push([x1, y1, x2, y2]);
        }
    }
    // Right side columns (x=GX) at y = 1..GY
    for (let y = 1; y <= GY; y++) {
        for (let f = 0; f < FLOORS; f++) {
            const [x1, y1] = iso(GX, y, f * FLOOR_H);
            const [x2, y2] = iso(GX, y, (f + 1) * FLOOR_H);
            cols.push([x1, y1, x2, y2]);
        }
    }
    // Back-left column at (0, GY) for each floor
    for (let f = 0; f < FLOORS; f++) {
        const [x1, y1] = iso(0, GY, f * FLOOR_H);
        const [x2, y2] = iso(0, GY, (f + 1) * FLOOR_H);
        cols.push([x1, y1, x2, y2]);
    }
    return cols;
}

// Generate floor beams (horizontal lines at each floor level)
function generateBeams(): [number, number, number, number][] {
    const beams: [number, number, number, number][] = [];
    for (let f = 0; f <= FLOORS; f++) {
        const z = f * FLOOR_H;
        // Front edge: x=0→GX at y=0
        for (let x = 0; x < GX; x++) {
            const [x1, y1] = iso(x, 0, z);
            const [x2, y2] = iso(x + 1, 0, z);
            beams.push([x1, y1, x2, y2]);
        }
        // Right edge: y=0→GY at x=GX
        for (let y = 0; y < GY; y++) {
            const [x1, y1] = iso(GX, y, z);
            const [x2, y2] = iso(GX, y + 1, z);
            beams.push([x1, y1, x2, y2]);
        }
        // Back edge (top): x=0→GX at y=GY (only if top floors for depth)
        if (f >= 1) {
            const [x1, y1] = iso(0, GY, z);
            const [x2, y2] = iso(GX, GY, z);
            beams.push([x1, y1, x2, y2]);
        }
        // Left edge: y=0→GY at x=0
        if (f >= 1) {
            const [x1, y1] = iso(0, 0, z);
            const [x2, y2] = iso(0, GY, z);
            beams.push([x1, y1, x2, y2]);
        }
    }
    return beams;
}

// Floor slab lines (interior horizontal grid for each floor)
function generateSlabLines(): [number, number, number, number][] {
    const lines: [number, number, number, number][] = [];
    for (let f = 1; f <= FLOORS; f++) {
        const z = f * FLOOR_H;
        // Cross beams going in x-direction at interior y positions
        for (let y = 1; y < GY; y++) {
            const [x1, y1] = iso(0, y, z);
            const [x2, y2] = iso(GX, y, z);
            lines.push([x1, y1, x2, y2]);
        }
        // Cross beams going in y-direction at interior x positions
        for (let x = 1; x < GX; x++) {
            const [x1, y1] = iso(x, 0, z);
            const [x2, y2] = iso(x, GY, z);
            lines.push([x1, y1, x2, y2]);
        }
    }
    return lines;
}

// Cross-bracing on front face (X patterns in some bays)
function generateBracing(): [number, number, number, number][] {
    const braces: [number, number, number, number][] = [];
    const bracedBays = [
        { x: 0, f: 0 }, { x: 4, f: 0 }, // ground floor end bays
        { x: 2, f: 1 }, // second floor center
        { x: 1, f: 2 }, { x: 3, f: 2 }, // third floor
    ];
    for (const { x, f } of bracedBays) {
        const [ax, ay] = iso(x, 0, f * FLOOR_H);
        const [bx, by] = iso(x + 1, 0, (f + 1) * FLOOR_H);
        const [cx, cy] = iso(x + 1, 0, f * FLOOR_H);
        const [dx, dy] = iso(x, 0, (f + 1) * FLOOR_H);
        braces.push([ax, ay, bx, by]);
        braces.push([cx, cy, dx, dy]);
    }
    return braces;
}

// Crane on top
function generateCrane(): [number, number, number, number][] {
    const crane: [number, number, number, number][] = [];
    const topZ = FLOORS * FLOOR_H;
    // Crane mast (vertical, at x=4, y=0)
    const [m1x, m1y] = iso(4, 0, topZ);
    const [m2x, m2y] = iso(4, 0, topZ + 2.5);
    crane.push([m1x, m1y, m2x, m2y]);
    // Crane jib (horizontal arm going right)
    const [j1x, j1y] = iso(4, 0, topZ + 2.5);
    const [j2x, j2y] = iso(7.5, 0, topZ + 2.5);
    crane.push([j1x, j1y, j2x, j2y]);
    // Counter-jib (going left, shorter)
    const [c1x, c1y] = iso(4, 0, topZ + 2.5);
    const [c2x, c2y] = iso(2.5, 0, topZ + 2.5);
    crane.push([c1x, c1y, c2x, c2y]);
    // Jib support cables
    const [s1x, s1y] = iso(4, 0, topZ + 3.2);
    crane.push([s1x, s1y, j2x, j2y]); // to jib end
    crane.push([s1x, s1y, c2x, c2y]); // to counter-jib end
    crane.push([s1x, s1y, m2x, m2y]); // mast top to peak
    // Pendulum cable hanging from jib
    const [p1x, p1y] = iso(6, 0, topZ + 2.5);
    const [p2x, p2y] = iso(6, 0, topZ + 1.0);
    crane.push([p1x, p1y, p2x, p2y]);
    return crane;
}

// Generate all geometry
const COLUMNS = generateColumns();
const BEAMS = generateBeams();
const SLAB_LINES = generateSlabLines();
const BRACING = generateBracing();
const CRANE = generateCrane();

// ── LED SCAN PATH ─────────────────────────────
// The light enters from far right, then traces through the building
// methodically: up columns, across beams, through each floor.
function buildScanPath(): string {
    const pts: string[] = [];

    // Entry from off-screen right
    pts.push(`M 900,350`);
    // Rapidly approach building's front-right corner at ground level
    const [entryX, entryY] = iso(GX, 0, 0);
    pts.push(`L ${entryX},${entryY}`);

    // Trace up front-right column to floor 1
    const [f1x, f1y] = iso(GX, 0, FLOOR_H);
    pts.push(`L ${f1x},${f1y}`);

    // Across floor 1 front beam right→left
    const [f1lx, f1ly] = iso(0, 0, FLOOR_H);
    pts.push(`L ${f1lx},${f1ly}`);

    // Down to ground at left
    const [g0x, g0y] = iso(0, 0, 0);
    pts.push(`L ${g0x},${g0y}`);

    // Across ground level left→right
    pts.push(`L ${entryX},${entryY}`);

    // Up right column to floor 2
    const [f2x, f2y] = iso(GX, 0, FLOOR_H * 2);
    pts.push(`L ${f2x},${f2y}`);

    // Across floor 2 front beam right→left
    const [f2lx, f2ly] = iso(0, 0, FLOOR_H * 2);
    pts.push(`L ${f2lx},${f2ly}`);

    // Up left column to floor 3
    const [f3lx, f3ly] = iso(0, 0, FLOOR_H * 3);
    pts.push(`L ${f3lx},${f3ly}`);

    // Across floor 3 front beam left→right
    const [f3rx, f3ry] = iso(GX, 0, FLOOR_H * 3);
    pts.push(`L ${f3rx},${f3ry}`);

    // Go along right side depth at floor 3
    const [f3dx, f3dy] = iso(GX, GY, FLOOR_H * 3);
    pts.push(`L ${f3dx},${f3dy}`);

    // Up to floor 4 (roof)
    const [f4dx, f4dy] = iso(GX, GY, FLOOR_H * 4);
    pts.push(`L ${f4dx},${f4dy}`);

    // Across roof back→front
    const [f4rx, f4ry] = iso(GX, 0, FLOOR_H * 4);
    pts.push(`L ${f4rx},${f4ry}`);

    // Across roof front right→left
    const [f4lx, f4ly] = iso(0, 0, FLOOR_H * 4);
    pts.push(`L ${f4lx},${f4ly}`);

    // Up the crane mast
    const [cmx, cmy] = iso(4, 0, FLOOR_H * 4 + 2.5);
    pts.push(`L ${f4rx},${f4ry}`); // back to mast base
    const [mbx, mby] = iso(4, 0, FLOOR_H * 4);
    pts.push(`L ${mbx},${mby}`);
    pts.push(`L ${cmx},${cmy}`);

    // Along crane jib
    const [jex, jey] = iso(7.5, 0, FLOOR_H * 4 + 2.5);
    pts.push(`L ${jex},${jey}`);

    return pts.join(" ");
}

const SCAN_PATH = buildScanPath();

// Compute approximate path length for animation
function approxPathLength(path: string): number {
    const coords = path.match(/[-\d.]+/g);
    if (!coords) return 1000;
    let len = 0;
    for (let i = 2; i < coords.length; i += 2) {
        const dx = parseFloat(coords[i]) - parseFloat(coords[i - 2]);
        const dy = parseFloat(coords[i + 1]) - parseFloat(coords[i - 1]);
        len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
}

const PATH_LENGTH = approxPathLength(SCAN_PATH);

// ── ANIMATION TIMINGS ──────────────────────────
const CYCLE_DURATION = 14; // full cycle seconds
const ENTRY_FRACTION = 0.07; // 7% of path is the entry dash (fast)

/* ══════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════ */
export default function LivingBlueprint() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-[520px] w-full" />;

    // Render line helper
    const renderLine = (
        coords: [number, number, number, number],
        key: string,
        strokeColor: string,
        width: number,
        opacity: number,
        dash?: string,
    ) => (
        <line
            key={key}
            x1={coords[0]} y1={coords[1]}
            x2={coords[2]} y2={coords[3]}
            stroke={strokeColor}
            strokeWidth={width}
            strokeLinecap="round"
            opacity={opacity}
            strokeDasharray={dash}
        />
    );

    return (
        <div className="relative w-full max-w-[640px]">
            <svg
                viewBox="20 -40 880 530"
                className="h-auto w-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* ── DEFINITIONS ── */}
                <defs>
                    {/* Warm LED gradient for the trace stroke */}
                    <linearGradient id="ledWarm" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c39767" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#fff4e0" stopOpacity="1" />
                        <stop offset="100%" stopColor="#c39767" stopOpacity="0.6" />
                    </linearGradient>

                    {/* Outer glow filter — wide diffuse halo */}
                    <filter id="outerGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="wideBlur" />
                        <feMerge>
                            <feMergeNode in="wideBlur" />
                        </feMerge>
                    </filter>

                    {/* Inner glow filter — tight LED tube */}
                    <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="tightBlur" />
                        <feMerge>
                            <feMergeNode in="tightBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Scanner dot gradient */}
                    <radialGradient id="scannerDot" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff4e0" stopOpacity="1" />
                        <stop offset="30%" stopColor="#ffbf00" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#c39767" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* ── STATIC STRUCTURE ── */}
                <g>
                    {/* Columns */}
                    {COLUMNS.map((c, i) => renderLine(c, `col-${i}`, "#593a25", 1, 0.6))}

                    {/* Main beams */}
                    {BEAMS.map((b, i) => renderLine(b, `beam-${i}`, "#593a25", 1, 0.7))}

                    {/* Interior slab grid */}
                    {SLAB_LINES.map((s, i) => renderLine(s, `slab-${i}`, "#593a25", 0.5, 0.3, "4 6"))}

                    {/* Cross bracing */}
                    {BRACING.map((b, i) => renderLine(b, `brace-${i}`, "#593a25", 0.6, 0.4))}

                    {/* Crane */}
                    {CRANE.map((c, i) => renderLine(c, `crane-${i}`, "#593a25", 0.8, 0.5))}
                </g>

                {/* ── LAYER 1: WIDE DIFFUSE GLOW (background halo) ── */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="#c39767"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={PATH_LENGTH}
                    filter="url(#outerGlow)"
                    initial={{ strokeDashoffset: PATH_LENGTH, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LENGTH, 0, 0, PATH_LENGTH],
                        opacity: [0, 0.3, 0.25, 0],
                    }}
                    transition={{
                        duration: CYCLE_DURATION,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        times: [0, ENTRY_FRACTION, 0.95, 1],
                    }}
                />

                {/* ── LAYER 2: MAIN LED TRACE (sharp warm light) ── */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="url(#ledWarm)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={PATH_LENGTH}
                    filter="url(#innerGlow)"
                    initial={{ strokeDashoffset: PATH_LENGTH, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LENGTH, 0, 0, PATH_LENGTH],
                        opacity: [0, 1, 0.8, 0],
                    }}
                    transition={{
                        duration: CYCLE_DURATION,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        times: [0, ENTRY_FRACTION, 0.95, 1],
                    }}
                />

                {/* ── LAYER 3: BRIGHT CORE (white-hot center line) ── */}
                <motion.path
                    d={SCAN_PATH}
                    fill="none"
                    stroke="#fff4e0"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    strokeDasharray={PATH_LENGTH}
                    initial={{ strokeDashoffset: PATH_LENGTH, opacity: 0 }}
                    animate={{
                        strokeDashoffset: [PATH_LENGTH, 0, 0, PATH_LENGTH],
                        opacity: [0, 0.9, 0.7, 0],
                    }}
                    transition={{
                        duration: CYCLE_DURATION,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        times: [0, ENTRY_FRACTION, 0.95, 1],
                    }}
                />

                {/* ── SCANNER DOT (follows the path tip) ── */}
                <motion.circle
                    r={10}
                    fill="url(#scannerDot)"
                    filter="url(#outerGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.8, 0] }}
                    transition={{
                        duration: CYCLE_DURATION,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        times: [0, ENTRY_FRACTION, 0.95, 1],
                    }}
                >
                    <animateMotion
                        dur={`${CYCLE_DURATION}s`}
                        repeatCount="indefinite"
                        path={SCAN_PATH}
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="spline"
                        keySplines="0.2 0.4 0.6 1"
                    />
                </motion.circle>

                {/* ── AMBIENT GROUND REFLECTION ── */}
                <motion.ellipse
                    cx={OX}
                    cy={OY + 30}
                    rx={180}
                    ry={12}
                    fill="#c39767"
                    filter="url(#outerGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.01, 0.04, 0.01] }}
                    transition={{
                        duration: CYCLE_DURATION,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                    }}
                />

                {/* ── DATA ANNOTATIONS ── */}
                {[
                    { x: 50, y: 380, text: "▸ N+0.00  Cimentación", delay: 2 },
                    { x: 50, y: 260, text: "▸ N+7.20  Nivel 2", delay: 5 },
                    { x: 50, y: 140, text: "▸ N+14.40  Nivel 4", delay: 9 },
                    { x: 580, y: 90, text: "▸ Grúa-torre activa", delay: 12 },
                ].map((ann, i) => (
                    <motion.g
                        key={`ann-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0.6, 0] }}
                        transition={{
                            duration: 3.5,
                            delay: ann.delay,
                            repeat: Infinity,
                            repeatDelay: CYCLE_DURATION - 3.5 + 1.5,
                        }}
                    >
                        <rect
                            x={ann.x - 4}
                            y={ann.y - 10}
                            width={ann.text.length * 5.8 + 12}
                            height={15}
                            rx={2}
                            fill="rgba(15, 8, 5, 0.9)"
                            stroke="rgba(195, 151, 103, 0.2)"
                            strokeWidth={0.5}
                        />
                        <text
                            x={ann.x}
                            y={ann.y + 1}
                            fill="#c39767"
                            fontSize="8"
                            fontFamily="var(--font-roboto-mono), monospace"
                            opacity={0.7}
                        >
                            {ann.text}
                        </text>
                    </motion.g>
                ))}
            </svg>

            {/* Corner tech label */}
            <div className="absolute bottom-0 right-2 font-mono text-[9px] tracking-wider text-primary/15">
                SCAN_v2.0 // struct_analysis
            </div>
        </div>
    );
}
