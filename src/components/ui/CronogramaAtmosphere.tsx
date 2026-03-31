"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * CronogramaAtmosphere — Extracted from CronogramaSection (Sprint 4.2)
 * Contains the 3 atmospheric background layers:
 *   1. Multi-zone focal glows (radial gradients)
 *   2. Flowing timeline wave paths (SVG)
 *   3. Floating time-particles (motion.div)
 */
const CronogramaAtmosphere = React.memo(function CronogramaAtmosphere() {
    return (
        <>
            {/* ── ATMOSPHERIC LAYER 1: Multi-zone focal glow ── */}
            <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 90% 40% at 50% 25%, rgba(59,130,246,0.07) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 55% at 72% 48%, rgba(59,130,246,0.07) 0%, transparent 65%),
                        radial-gradient(ellipse 30% 40% at 72% 48%, rgba(59,130,246,0.04) 0%, transparent 45%),
                        radial-gradient(ellipse 80% 30% at 30% 50%, rgba(239,68,68,0.02) 0%, transparent 55%),
                        radial-gradient(ellipse 100% 50% at 50% 100%, rgba(59,130,246,0.018) 0%, transparent 40%)
                    `,
                }}
            />

            {/* ── ATMOSPHERIC LAYER 2: Flowing timeline wave paths ── */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <svg
                    className="absolute h-full"
                    style={{ width: "200%", left: "-50%" }}
                    viewBox="0 0 2000 1000"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {[
                        { d: "M0,120 C250,100 500,160 750,120 S1250,80 1500,140 S1750,100 2000,120", c: "rgba(59,130,246,0.08)", w: 0.8 },
                        { d: "M0,220 C300,200 550,260 800,220 S1200,180 1500,250 S1800,210 2000,230", c: "rgba(239,68,68,0.06)", w: 0.6 },
                        { d: "M0,340 C200,320 450,380 700,340 S1100,300 1400,360 S1700,320 2000,350", c: "rgba(59,130,246,0.07)", w: 0.7 },
                        { d: "M0,460 C350,440 600,500 850,460 S1150,420 1450,480 S1750,450 2000,460", c: "rgba(234,179,8,0.05)", w: 0.5 },
                        { d: "M0,560 C250,540 500,600 750,560 S1050,520 1350,580 S1650,550 2000,570", c: "rgba(239,68,68,0.05)", w: 0.6 },
                        { d: "M0,660 C300,640 550,700 800,660 S1200,620 1500,680 S1800,650 2000,670", c: "rgba(59,130,246,0.06)", w: 0.7 },
                        { d: "M0,780 C200,760 450,820 700,780 S1100,740 1400,800 S1700,770 2000,790", c: "rgba(234,179,8,0.04)", w: 0.5 },
                        { d: "M0,880 C350,860 600,920 850,880 S1150,840 1450,900 S1750,870 2000,890", c: "rgba(59,130,246,0.05)", w: 0.6 },
                    ].map((p, i) => (
                        <path key={`wave${i}`} d={p.d} fill="none" stroke={p.c} strokeWidth={p.w} />
                    ))}

                    {[
                        { path: "M0,120 C250,100 500,160 750,120 S1250,80 1500,140 S1750,100 2000,120", c: "#3B82F6", dur: "12s", delay: "0s" },
                        { path: "M0,220 C300,200 550,260 800,220 S1200,180 1500,250 S1800,210 2000,230", c: "#EF4444", dur: "14s", delay: "2s" },
                        { path: "M0,340 C200,320 450,380 700,340 S1100,300 1400,360 S1700,320 2000,350", c: "#3B82F6", dur: "11s", delay: "1s" },
                        { path: "M0,460 C350,440 600,500 850,460 S1150,420 1450,480 S1750,450 2000,460", c: "#EAB308", dur: "15s", delay: "3s" },
                        { path: "M0,560 C250,540 500,600 750,560 S1050,520 1350,580 S1650,550 2000,570", c: "#EF4444", dur: "13s", delay: "4s" },
                        { path: "M0,660 C300,640 550,700 800,660 S1200,620 1500,680 S1800,650 2000,670", c: "#3B82F6", dur: "16s", delay: "1.5s" },
                    ].map((m, i) => (
                        <g key={`tick${i}`}>
                            <circle r="2" fill={m.c} opacity="0">
                                <animateMotion dur={m.dur} begin={m.delay} repeatCount="indefinite" path={m.path} />
                                <animate attributeName="opacity" values="0;0.35;0.35;0" dur={m.dur} begin={m.delay} repeatCount="indefinite" />
                            </circle>
                            <circle r="6" fill={m.c} opacity="0" style={{ filter: "blur(3px)" }}>
                                <animateMotion dur={m.dur} begin={m.delay} repeatCount="indefinite" path={m.path} />
                                <animate attributeName="opacity" values="0;0.12;0.12;0" dur={m.dur} begin={m.delay} repeatCount="indefinite" />
                            </circle>
                        </g>
                    ))}

                    {[
                        { cx: 250, cy: 100, c: "#3B82F6" }, { cx: 750, cy: 120, c: "#3B82F6" },
                        { cx: 1250, cy: 80, c: "#3B82F6" }, { cx: 1750, cy: 100, c: "#3B82F6" },
                        { cx: 300, cy: 200, c: "#EF4444" }, { cx: 800, cy: 220, c: "#EF4444" },
                        { cx: 1200, cy: 180, c: "#EF4444" }, { cx: 550, cy: 260, c: "#EF4444" },
                        { cx: 450, cy: 380, c: "#3B82F6" }, { cx: 1100, cy: 300, c: "#3B82F6" },
                        { cx: 600, cy: 500, c: "#EAB308" }, { cx: 1150, cy: 420, c: "#EAB308" },
                        { cx: 500, cy: 600, c: "#EF4444" }, { cx: 1050, cy: 520, c: "#EF4444" },
                        { cx: 700, cy: 660, c: "#3B82F6" }, { cx: 1400, cy: 800, c: "#EAB308" },
                    ].map((n, i) => (
                        <circle key={`sn${i}`} cx={n.cx} cy={n.cy} r={1} fill={n.c} opacity={0.18} />
                    ))}
                </svg>
            </div>

            {/* ── ATMOSPHERIC LAYER 3: Floating time-particles ── */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                {[
                    { x: "10%", y: "20%", size: 2, color: "#3B82F6", dur: 24, dx: 40, dy: -15 },
                    { x: "70%", y: "15%", size: 1.8, color: "#EF4444", dur: 28, dx: -30, dy: 20 },
                    { x: "85%", y: "65%", size: 2.2, color: "#3B82F6", dur: 22, dx: -20, dy: -25 },
                    { x: "20%", y: "75%", size: 1.5, color: "#EAB308", dur: 30, dx: 35, dy: -10 },
                    { x: "45%", y: "8%", size: 1.8, color: "#3B82F6", dur: 26, dx: -15, dy: 30 },
                    { x: "55%", y: "90%", size: 1.5, color: "#EF4444", dur: 25, dx: 25, dy: -20 },
                    { x: "30%", y: "42%", size: 1.6, color: "#3B82F6", dur: 32, dx: -22, dy: 18 },
                    { x: "78%", y: "38%", size: 1.4, color: "#EAB308", dur: 27, dx: 18, dy: -22 },
                ].map((p, i) => (
                    <motion.div
                        key={`tp${i}`}
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
                            opacity: [0.1, 0.35, 0.1],
                        }}
                        transition={{
                            duration: p.dur,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        </>
    );
});

export default CronogramaAtmosphere;
