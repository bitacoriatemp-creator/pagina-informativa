"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Network, Users, Box } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SmartBimSyncSection — Section 7 "Smart BIM Sync"
   ──────────────────────────────────────────────────────────────
   Theme:  Purple (#A855F7)
   Layout: 2-column split, min-h-[calc(100vh-80px)]
   Right:  Animated Data Hub — 3 satellite nodes + data packets
           streaming toward a central Box icon
   ══════════════════════════════════════════════════════════════ */

const PURPLE = "#A855F7";
const PURPLE_DIM = "rgba(168,85,247,0.75)";

// ── NODE DEFINITIONS ─────────────────────────────────────────────
// Fixed corner positions — top-left, top-right, bottom-center.
// packetFrom = px offset from hub center (container ≈480×390 canvas).
const NODES = [
    {
        id: "costos",
        label: "Control de Costos",
        sublabel: "Presupuesto en tiempo real",
        color: "#22C55E",
        // top-left corner
        style: { top: 40, left: 24 } as React.CSSProperties,
        packetFrom: { x: -155, y: -130 }, // from hub center
    },
    {
        id: "calendario",
        label: "Cronograma",
        sublabel: "Gantt & dependencias",
        color: "#3B82F6",
        // top-right corner
        style: { top: 40, right: 24 } as React.CSSProperties,
        packetFrom: { x: 155, y: -130 },
    },
    {
        id: "bitacora",
        label: "Bitácora",
        sublabel: "Registros de obra",
        color: "#C4A484",
        // bottom-center — bottom-12 = 48px
        style: { bottom: 48, left: "50%", transform: "translateX(-50%)" } as React.CSSProperties,
        packetFrom: { x: 0, y: 145 },
    },
] as const;

// ── ANIMATION VARIANTS ───────────────────────────────────────────
const slideLeft: Variants = {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const slideRight: Variants = {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const featureStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13, delayChildren: 0.4 } },
};
const featureItem: Variants = {
    hidden: { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.38 } },
};

// ── MARKETING COPY ────────────────────────────────────────────────
const FEATURES = [
    {
        Icon: Network,
        title: "Sincronización Total",
        body: "Si cargas un registro fotográfico, la IA sabe exactamente a qué actividad pertenece y calcula su porcentaje de avance y costo de forma automática. Todo está entrelazado.",
    },
    {
        Icon: Users,
        title: "Fuente Única de Verdad",
        body: "Acceso multiusuario en tiempo real. Todo tu equipo (residentes, supervisores, directivos) ve los mismos avances, los mismos registros y los mismos costos.",
    },
    {
        Icon: Box,
        title: "De la Obra al Modelo",
        body: "Conectamos la gestión diaria (dinero, tiempo y bitácora) directamente con la realidad física de tu proyecto.",
    },
] as const;


// ── SATELLITE NODE (corner-fixed) ────────────────────────────────
// Outer plain div handles absolute positioning (so transform:translateX
// is not clobbered by Framer Motion's internal transform manager).
// Inner motion.div handles only opacity/scale entrance animation.
function SatelliteNode({
    node,
    inView,
    entryDelay,
}: {
    node: typeof NODES[number];
    inView: boolean;
    entryDelay: number;
}) {
    return (
        // Plain div — positioning + translateX(-50%) applied here, safely
        <div className="absolute" style={node.style}>
            <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: entryDelay, type: "spring", stiffness: 60, damping: 14 }}
            >
                <div
                    className="rounded-xl px-3 py-2 text-center"
                    style={{
                        background: "rgba(13,13,13,0.96)",
                        border: `1px solid ${node.color}40`,
                        boxShadow: `0 0 20px ${node.color}14`,
                        minWidth: 96,
                    }}
                >
                    <p className="text-[9.5px] font-semibold leading-tight" style={{ color: node.color }}>
                        {node.label}
                    </p>
                    <p className="mt-0.5 text-[7.5px] leading-tight text-white/30">{node.sublabel}</p>
                </div>
            </motion.div>
        </div>
    );
}

// ── SVG CONNECTORS + DATA PACKETS (animateMotion on exact paths) ──────
// Uses viewBox 0 0 1000 1000 so all coords are proportional.
// Node centers (mapped to 1000×1000):
//   Costos      → (150, 100)
//   Cronograma  → (850, 100)
//   Bitácora    → (500, 880)
// Hub center    → (500, 500)
const CONN_PATHS = [
    { id: "costos", path: "M150,100 L500,500", pathBack: "M500,500 L150,100", color: "#22C55E", delay: 0 },
    { id: "calendario", path: "M850,100 L500,500", pathBack: "M500,500 L850,100", color: "#3B82F6", delay: 0.7 },
    { id: "bitacora", path: "M500,880 L500,500", pathBack: "M500,500 L500,880", color: "#C4A484", delay: 1.4 },
] as const;

function ConnectorSVG({ inView }: { inView: boolean }) {
    return (
        <svg
            className="pointer-events-none absolute inset-0 w-full h-full"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
        >
            {/* Dashed connector lines */}
            {CONN_PATHS.map((c) => (
                <motion.path
                    key={c.id}
                    d={c.path}
                    stroke={c.color}
                    strokeOpacity={0.22}
                    strokeWidth={1.5}
                    strokeDasharray="6 6"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                />
            ))}

            {/* Data packets — travel along the EXACT path using animateMotion */}
            {inView && CONN_PATHS.map((c) => (
                <g key={`packet-${c.id}`}>
                    {/* Packet: node → hub */}
                    <circle r="4" fill={c.color} opacity="0">
                        <animateMotion
                            dur="1.8s"
                            begin={`${c.delay + 1}s`}
                            repeatCount="indefinite"
                            path={c.path}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.9;0.9;0"
                            dur="1.8s"
                            begin={`${c.delay + 1}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                    {/* Glow trail */}
                    <circle r="8" fill={c.color} opacity="0" style={{ filter: `blur(4px)` }}>
                        <animateMotion
                            dur="1.8s"
                            begin={`${c.delay + 1}s`}
                            repeatCount="indefinite"
                            path={c.path}
                        />
                        <animate
                            attributeName="opacity"
                            values="0;0.3;0.3;0"
                            dur="1.8s"
                            begin={`${c.delay + 1}s`}
                            repeatCount="indefinite"
                        />
                    </circle>
                </g>
            ))}
        </svg>
    );
}

// ── DATA HUB MOCKUP (transparent canvas) ─────────────────────────
function DataHubMockup() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.4 });

    return (
        <div
            ref={ref}
            className="relative h-[600px] w-full flex items-center justify-center"
        >
            {/* ConnectorSVG — spans full canvas + animated data packets */}
            <ConnectorSVG inView={inView} />

            {/* Satellite nodes — fixed corners */}
            {NODES.map((node, i) => (
                <SatelliteNode key={node.id} node={node} inView={inView} entryDelay={0.3 + i * 0.18} />
            ))}

            {/* CENTER HUB — pulsing Box icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.15, type: "spring", stiffness: 55, damping: 12 }}
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                    background: `radial-gradient(circle at 40% 35%, ${PURPLE}30, #050505 70%)`,
                    border: `1.5px solid ${PURPLE}50`,
                    boxShadow: `0 0 30px ${PURPLE}25, 0 0 60px ${PURPLE}10`,
                }}
            >
                {/* Slow outer ring */}
                <motion.div
                    className="absolute rounded-2xl"
                    style={{ inset: -6, border: `1px solid ${PURPLE}22`, borderRadius: 20 }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.15, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <Box
                    size={34}
                    style={{ color: PURPLE, filter: `drop-shadow(0 0 10px ${PURPLE}88)` }}
                    strokeWidth={1.5}
                />
                {/* Sync badge */}
                <motion.div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[7.5px] font-semibold"
                    style={{ background: `${PURPLE}12`, border: `1px solid ${PURPLE}30`, color: PURPLE_DIM }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                    ⧳ Sincronizando en tiempo real
                </motion.div>
            </motion.div>
        </div>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function SmartBimSyncSection() {
    return (
        <section
            id="bim-sync"
            className="relative w-full border-t border-white/5"
            style={{ backgroundColor: "#050505", height: "150vh" }}
        >
            {/* ── STICKY WRAPPER ── */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* ── ATMOSPHERIC LAYER 1: Deep purple glow ── */}
                <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        backgroundImage: `
                        radial-gradient(ellipse 50% 55% at 72% 50%, rgba(168,85,247,0.08) 0%, transparent 70%),
                        radial-gradient(ellipse 25% 30% at 72% 50%, rgba(168,85,247,0.05) 0%, transparent 45%),
                        radial-gradient(ellipse 70% 40% at 50% 50%, rgba(59,130,246,0.025) 0%, transparent 65%)
                    `,
                    }}
                />

                {/* ── ATMOSPHERIC LAYER 2: Dense circuit-board matrix ── */}
                <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    {/* ── Dense grid nodes ── */}
                    {[
                        // Row 1 (top)
                        { cx: 80, cy: 60, r: 1.4, c: "#A855F7" },
                        { cx: 200, cy: 40, r: 1.0, c: "#3B82F6" },
                        { cx: 340, cy: 80, r: 1.2, c: "#22C55E" },
                        { cx: 500, cy: 50, r: 0.9, c: "#A855F7" },
                        { cx: 650, cy: 70, r: 1.1, c: "#3B82F6" },
                        { cx: 800, cy: 45, r: 1.3, c: "#A855F7" },
                        { cx: 920, cy: 75, r: 0.8, c: "#22C55E" },
                        // Row 2
                        { cx: 50, cy: 180, r: 1.1, c: "#3B82F6" },
                        { cx: 160, cy: 200, r: 0.9, c: "#A855F7" },
                        { cx: 300, cy: 170, r: 1.3, c: "#C4A484" },
                        { cx: 440, cy: 190, r: 1.0, c: "#22C55E" },
                        { cx: 580, cy: 160, r: 0.8, c: "#A855F7" },
                        { cx: 720, cy: 185, r: 1.2, c: "#3B82F6" },
                        { cx: 860, cy: 195, r: 1.0, c: "#A855F7" },
                        { cx: 960, cy: 170, r: 0.7, c: "#22C55E" },
                        // Row 3
                        { cx: 100, cy: 340, r: 1.0, c: "#22C55E" },
                        { cx: 240, cy: 320, r: 1.4, c: "#A855F7" },
                        { cx: 380, cy: 350, r: 0.8, c: "#3B82F6" },
                        { cx: 620, cy: 330, r: 1.1, c: "#C4A484" },
                        { cx: 760, cy: 345, r: 0.9, c: "#A855F7" },
                        { cx: 900, cy: 320, r: 1.2, c: "#3B82F6" },
                        // Row 4 (mid)
                        { cx: 60, cy: 500, r: 1.3, c: "#A855F7" },
                        { cx: 180, cy: 480, r: 0.9, c: "#3B82F6" },
                        { cx: 320, cy: 510, r: 1.1, c: "#22C55E" },
                        { cx: 680, cy: 490, r: 1.0, c: "#A855F7" },
                        { cx: 820, cy: 505, r: 1.4, c: "#C4A484" },
                        { cx: 950, cy: 480, r: 0.8, c: "#3B82F6" },
                        // Row 5
                        { cx: 90, cy: 650, r: 1.0, c: "#C4A484" },
                        { cx: 220, cy: 670, r: 1.2, c: "#A855F7" },
                        { cx: 360, cy: 640, r: 0.9, c: "#3B82F6" },
                        { cx: 500, cy: 660, r: 1.1, c: "#22C55E" },
                        { cx: 640, cy: 680, r: 0.8, c: "#A855F7" },
                        { cx: 780, cy: 650, r: 1.3, c: "#3B82F6" },
                        { cx: 910, cy: 670, r: 1.0, c: "#A855F7" },
                        // Row 6 (bottom)
                        { cx: 70, cy: 820, r: 1.1, c: "#3B82F6" },
                        { cx: 200, cy: 840, r: 0.9, c: "#A855F7" },
                        { cx: 350, cy: 810, r: 1.3, c: "#22C55E" },
                        { cx: 500, cy: 850, r: 1.0, c: "#C4A484" },
                        { cx: 650, cy: 830, r: 0.8, c: "#A855F7" },
                        { cx: 800, cy: 845, r: 1.2, c: "#3B82F6" },
                        { cx: 930, cy: 815, r: 1.0, c: "#22C55E" },
                        // Scattered extra
                        { cx: 140, cy: 120, r: 0.6, c: "#A855F7" },
                        { cx: 860, cy: 130, r: 0.7, c: "#22C55E" },
                        { cx: 450, cy: 420, r: 0.8, c: "#3B82F6" },
                        { cx: 550, cy: 560, r: 0.7, c: "#A855F7" },
                        { cx: 150, cy: 920, r: 0.9, c: "#C4A484" },
                        { cx: 850, cy: 940, r: 0.6, c: "#A855F7" },
                        { cx: 400, cy: 950, r: 0.8, c: "#3B82F6" },
                        { cx: 700, cy: 920, r: 1.0, c: "#22C55E" },
                    ].map((n, i) => (
                        <circle key={`n${i}`} cx={n.cx} cy={n.cy} r={n.r} fill={n.c} opacity={0.15} />
                    ))}

                    {/* ── Dense circuit lines ── */}
                    {[
                        // Horizontal runs
                        { x1: 80, y1: 60, x2: 200, y2: 40, c: "#A855F7" },
                        { x1: 200, y1: 40, x2: 340, y2: 80, c: "#3B82F6" },
                        { x1: 340, y1: 80, x2: 500, y2: 50, c: "#A855F7" },
                        { x1: 500, y1: 50, x2: 650, y2: 70, c: "#3B82F6" },
                        { x1: 650, y1: 70, x2: 800, y2: 45, c: "#A855F7" },
                        { x1: 800, y1: 45, x2: 920, y2: 75, c: "#22C55E" },
                        { x1: 50, y1: 180, x2: 160, y2: 200, c: "#3B82F6" },
                        { x1: 160, y1: 200, x2: 300, y2: 170, c: "#A855F7" },
                        { x1: 300, y1: 170, x2: 440, y2: 190, c: "#C4A484" },
                        { x1: 440, y1: 190, x2: 580, y2: 160, c: "#22C55E" },
                        { x1: 580, y1: 160, x2: 720, y2: 185, c: "#3B82F6" },
                        { x1: 720, y1: 185, x2: 860, y2: 195, c: "#A855F7" },
                        { x1: 860, y1: 195, x2: 960, y2: 170, c: "#22C55E" },
                        // Vertical drops
                        { x1: 80, y1: 60, x2: 50, y2: 180, c: "#A855F7" },
                        { x1: 200, y1: 40, x2: 160, y2: 200, c: "#3B82F6" },
                        { x1: 340, y1: 80, x2: 300, y2: 170, c: "#22C55E" },
                        { x1: 500, y1: 50, x2: 440, y2: 190, c: "#A855F7" },
                        { x1: 650, y1: 70, x2: 720, y2: 185, c: "#3B82F6" },
                        { x1: 920, y1: 75, x2: 960, y2: 170, c: "#A855F7" },
                        { x1: 100, y1: 340, x2: 60, y2: 500, c: "#22C55E" },
                        { x1: 240, y1: 320, x2: 180, y2: 480, c: "#A855F7" },
                        { x1: 760, y1: 345, x2: 820, y2: 505, c: "#A855F7" },
                        { x1: 900, y1: 320, x2: 950, y2: 480, c: "#3B82F6" },
                        // Mid-section diagonals
                        { x1: 160, y1: 200, x2: 240, y2: 320, c: "#A855F7" },
                        { x1: 440, y1: 190, x2: 380, y2: 350, c: "#3B82F6" },
                        { x1: 580, y1: 160, x2: 620, y2: 330, c: "#C4A484" },
                        { x1: 720, y1: 185, x2: 760, y2: 345, c: "#A855F7" },
                        // Lower grid
                        { x1: 60, y1: 500, x2: 90, y2: 650, c: "#A855F7" },
                        { x1: 180, y1: 480, x2: 220, y2: 670, c: "#3B82F6" },
                        { x1: 320, y1: 510, x2: 360, y2: 640, c: "#22C55E" },
                        { x1: 680, y1: 490, x2: 640, y2: 680, c: "#A855F7" },
                        { x1: 820, y1: 505, x2: 780, y2: 650, c: "#C4A484" },
                        { x1: 950, y1: 480, x2: 910, y2: 670, c: "#3B82F6" },
                        { x1: 90, y1: 650, x2: 70, y2: 820, c: "#C4A484" },
                        { x1: 220, y1: 670, x2: 200, y2: 840, c: "#A855F7" },
                        { x1: 500, y1: 660, x2: 500, y2: 850, c: "#22C55E" },
                        { x1: 780, y1: 650, x2: 800, y2: 845, c: "#3B82F6" },
                        // Bottom horizontal
                        { x1: 70, y1: 820, x2: 200, y2: 840, c: "#3B82F6" },
                        { x1: 200, y1: 840, x2: 350, y2: 810, c: "#A855F7" },
                        { x1: 350, y1: 810, x2: 500, y2: 850, c: "#22C55E" },
                        { x1: 500, y1: 850, x2: 650, y2: 830, c: "#C4A484" },
                        { x1: 650, y1: 830, x2: 800, y2: 845, c: "#A855F7" },
                        { x1: 800, y1: 845, x2: 930, y2: 815, c: "#3B82F6" },
                        // Cross-links
                        { x1: 300, y1: 170, x2: 240, y2: 320, c: "#22C55E" },
                        { x1: 620, y1: 330, x2: 680, y2: 490, c: "#A855F7" },
                        { x1: 380, y1: 350, x2: 320, y2: 510, c: "#3B82F6" },
                        { x1: 360, y1: 640, x2: 500, y2: 660, c: "#A855F7" },
                        { x1: 500, y1: 660, x2: 640, y2: 680, c: "#3B82F6" },
                        { x1: 640, y1: 680, x2: 780, y2: 650, c: "#22C55E" },
                    ].map((l, i) => (
                        <line
                            key={`l${i}`}
                            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                            stroke={l.c}
                            strokeOpacity={0.055}
                            strokeWidth={0.6}
                        />
                    ))}

                    {/* ── Hexagonal micro-patterns (subtle geo texture) ── */}
                    {[
                        { cx: 150, cy: 300, r: 25 },
                        { cx: 850, cy: 280, r: 20 },
                        { cx: 100, cy: 700, r: 22 },
                        { cx: 900, cy: 720, r: 18 },
                        { cx: 500, cy: 150, r: 28 },
                        { cx: 300, cy: 900, r: 20 },
                        { cx: 700, cy: 800, r: 24 },
                    ].map((h, i) => (
                        <polygon
                            key={`hex${i}`}
                            points={Array.from({ length: 6 }, (_, j) => {
                                const angle = (Math.PI / 3) * j - Math.PI / 6;
                                return `${h.cx + h.r * Math.cos(angle)},${h.cy + h.r * Math.sin(angle)}`;
                            }).join(" ")}
                            fill="none"
                            stroke="#A855F7"
                            strokeOpacity={0.06}
                            strokeWidth={0.5}
                        />
                    ))}

                    {/* ── Purple data particles traveling along grid lines ── */}
                    {[
                        // Top row L→R
                        { path: "M80,60 L200,40 L340,80 L500,50 L650,70 L800,45 L920,75", dur: "18s", delay: "0s" },
                        // Row 2 L→R
                        { path: "M50,180 L160,200 L300,170 L440,190 L580,160 L720,185 L860,195 L960,170", dur: "22s", delay: "3s" },
                        // Left vertical drop
                        { path: "M80,60 L50,180 L100,340 L60,500 L90,650 L70,820", dur: "25s", delay: "1s" },
                        // Right vertical drop
                        { path: "M920,75 L960,170 L900,320 L950,480 L910,670 L930,815", dur: "24s", delay: "5s" },
                        // Mid diagonal zig-zag
                        { path: "M160,200 L240,320 L180,480 L220,670 L200,840", dur: "20s", delay: "2s" },
                        // Right mid diagonal
                        { path: "M720,185 L760,345 L820,505 L780,650 L800,845", dur: "22s", delay: "4s" },
                        // Bottom row L→R
                        { path: "M70,820 L200,840 L350,810 L500,850 L650,830 L800,845 L930,815", dur: "16s", delay: "6s" },
                        // Cross-link zigzag mid
                        { path: "M300,170 L240,320 L320,510 L360,640 L500,660 L640,680 L780,650", dur: "28s", delay: "1.5s" },
                        // Upper-mid flow
                        { path: "M440,190 L380,350 L320,510 L360,640", dur: "15s", delay: "7s" },
                        // Right upper flow
                        { path: "M580,160 L620,330 L680,490 L640,680", dur: "14s", delay: "3.5s" },
                    ].map((p, i) => (
                        <g key={`gp${i}`}>
                            <circle r={1.5} fill="#A855F7" opacity="0">
                                <animateMotion dur={p.dur} begin={p.delay} repeatCount="indefinite" path={p.path} />
                                <animate attributeName="opacity" values="0;0.35;0.35;0" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
                            </circle>
                            <circle r={5} fill="#A855F7" opacity="0" style={{ filter: "blur(3px)" }}>
                                <animateMotion dur={p.dur} begin={p.delay} repeatCount="indefinite" path={p.path} />
                                <animate attributeName="opacity" values="0;0.1;0.1;0" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
                            </circle>
                        </g>
                    ))}
                </svg>

                {/* ── ATMOSPHERIC LAYER 3: Floating micro-particles (slow drift) ── */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    {[
                        { x: "12%", y: "22%", size: 2.2, color: "#A855F7", dur: 22, dx: 30, dy: -20 },
                        { x: "72%", y: "18%", size: 1.8, color: "#3B82F6", dur: 28, dx: -25, dy: 15 },
                        { x: "88%", y: "72%", size: 2, color: "#22C55E", dur: 25, dx: -20, dy: -25 },
                        { x: "22%", y: "78%", size: 1.5, color: "#C4A484", dur: 30, dx: 35, dy: -15 },
                        { x: "48%", y: "8%", size: 1.8, color: "#A855F7", dur: 26, dx: -15, dy: 30 },
                        { x: "62%", y: "88%", size: 1.5, color: "#3B82F6", dur: 24, dx: 20, dy: -30 },
                        { x: "35%", y: "45%", size: 1.6, color: "#A855F7", dur: 32, dx: -18, dy: 22 },
                        { x: "82%", y: "42%", size: 1.4, color: "#22C55E", dur: 27, dx: 15, dy: -18 },
                    ].map((p, i) => (
                        <motion.div
                            key={`p${i}`}
                            className="absolute rounded-full"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                background: p.color,
                                boxShadow: `0 0 8px ${p.color}`,
                            }}
                            animate={{
                                x: [0, p.dx, 0],
                                y: [0, p.dy, 0],
                                opacity: [0.12, 0.4, 0.12],
                            }}
                            transition={{
                                duration: p.dur,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* ── SPLIT GRID ─────────────────────────────────────────── */}
                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-12">

                    {/* ════ LEFT — Copy ════ */}
                    <motion.div
                        variants={slideLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="flex flex-col gap-7"
                    >
                        {/* Module label */}
                        <div className="inline-flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full"
                                style={{ background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                                style={{ color: `${PURPLE}88` }}>
                                Smart BIM Sync
                            </span>
                        </div>

                        {/* Headline */}
                        <h2
                            className="font-display text-4xl font-extrabold uppercase leading-[1.04] tracking-tight text-white/92 sm:text-5xl xl:text-6xl"
                            style={{ textShadow: `0 0 60px rgba(168,85,247,0.10), 0 4px 40px rgba(0,0,0,0.95)` }}
                        >
                            La verdadera<br />
                            <span style={{ color: PURPLE }}>&apos;I&apos;</span>
                            {" "}de BIM.
                        </h2>

                        {/* Sub-headline */}
                        <p className="max-w-sm text-base leading-relaxed text-white/38">
                            Todo tu ecosistema conectado en un solo lugar.{" "}
                            <span className="font-medium text-white/58">
                                Cada registro, cada costo y cada tarea forman una sola fuente de verdad.
                            </span>
                        </p>

                        {/* Feature bullets */}
                        <motion.ul
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="flex flex-col gap-5"
                        >
                            {FEATURES.map(({ Icon, title, body }) => (
                                <motion.li key={title} variants={featureItem} className="flex items-start gap-3.5">
                                    <span
                                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: `${PURPLE}14`, border: `1px solid ${PURPLE}35` }}
                                    >
                                        <Icon size={12} style={{ color: PURPLE }} strokeWidth={2.5} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white/78">{title}</p>
                                        <p className="mt-0.5 text-sm leading-relaxed text-white/33">{body}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>

                    </motion.div>

                    {/* ════ RIGHT — Data Hub ════ */}
                    <motion.div
                        variants={slideRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="flex w-full justify-center"
                    >
                        <DataHubMockup />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
