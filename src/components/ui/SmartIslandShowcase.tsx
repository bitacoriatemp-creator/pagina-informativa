"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import {
    FileSpreadsheet,
    DollarSign,
    TrendingUp,
    Clock,
    Hourglass,
    GanttChart,
    FileJson,
    ImageIcon,
    MessageCircle,
    FileText,
    StickyNote,
    CalendarDays,
    Box,
    type LucideIcon,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SmartIslandShowcase v10 — Clean State Machine
   ──────────────────────────────────────────────────────────────
   ROOT CAUSE OF SEQUENCE BREAK (fixed here):
   onAnimationComplete fired → setTimeout(400ms) kept the old icon
   mounted (scale: 0) for 400ms. When the next particle mounted,
   Framer Motion read the CURRENT values of the previous DOM node
   (scale:0, y:TARGET_Y) as the implicit start, ignoring `initial`.
   This caused every icon after the first to shoot from TARGET_Y
   back to SPAWN_Y and forward again (the "broken trajectory").

   FIX — Three-stage state machine:
     "spawning"  → mounting phase; the particle runs its animation
     "absorbing" → onAnimationComplete fired; immediately unmount
                   the particle so Framer has a clean slate; fire pop
     "gap"       → 400ms pause with NOTHING mounted; then → "spawning"
   The next particle is NEVER built while the old one is still in DOM.
   ══════════════════════════════════════════════════════════════ */

const SPAWN_Y = "-50vh";
const TARGET_Y = "-15vh";
const FALL_DURATION = 4;       // seconds — ultra-slow fall
const GAP_MS = 400;     // ms between landing and next spawn

const PARTICLE_GROUPS = [
    {
        moduleId: "concepts",
        icons: [FileSpreadsheet, DollarSign, TrendingUp],
        colorClass: "text-[#00D26A]",
        targetX: -120,
    },
    {
        moduleId: "bitacora",
        icons: [ImageIcon, MessageCircle, FileText, StickyNote],
        colorClass: "text-[#C39767]",
        targetX: -40,
    },
    {
        moduleId: "calendar",
        icons: [CalendarDays, Clock, Hourglass, GanttChart, FileJson],
        colorClass: "text-[#3B82F6]",
        targetX: 40,
    },
    {
        moduleId: "bim",
        icons: [Box],
        colorClass: "text-[#A855F7]",
        targetX: 120,
    },
];

interface Particle {
    id: number;
    moduleId: string;
    Icon: LucideIcon;
    colorClass: string;
    targetX: number;
}

interface ShowcaseProps {
    onTriggerPop?: (moduleId: string) => void;
}

export default function SmartIslandShowcase({ onTriggerPop }: ShowcaseProps) {
    const containerRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Only fade IN on entry — NO exit fade. Panel freezes at full opacity
    // when scrolled to the end of the 300vh container and rides the document
    // flow naturally as the user continues scrolling into Planes.
    const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
    // scale and yContent exit transforms removed: no shrink/slide-up on exit

    // True while the sticky panel is visible in the viewport.
    // amount:0.01 fires as soon as even 1% of the div is visible.
    const inView = useInView(stickyRef, { amount: 0.01 });

    /* ── THREE-STAGE STATE MACHINE ──────────────────────────────
       "spawning"  → particle is mounted, falling animation plays
       "absorbing" → animation done; unmount immediately (clean DOM),
                     fire island pop, start gap timer
       "gap"       → nothing mounted; setTimeout fires → spawning

       LEAK FIX: every setTimeout id is pushed into timeoutIds.
       When inView flips false, all pending timers are cleared and
       the stage is forced back to "gap" so nothing re-spawns until
       the section is visible again.
    ──────────────────────────────────────────────────────────── */
    type Stage = "spawning" | "absorbing" | "gap";

    const [stage, setStage] = useState<Stage>("gap");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentParticle, setCurrentParticle] = useState<Particle | null>(null);

    // ── INVIEW GATE: start or kill the loop ────────────────────
    useEffect(() => {
        if (inView) {
            // Section entered view — resume from wherever we left off
            setStage("spawning");
        } else {
            // Section left view — cancel all pending timers, freeze loop
            timeoutIds.current.forEach(clearTimeout);
            timeoutIds.current = [];
            setStage("gap");
            setCurrentParticle(null);
        }
    }, [inView]);

    // ── SPAWN: build particle when entering "spawning" stage ────
    useEffect(() => {
        if (stage !== "spawning" || !inView) return;

        const gIdx = currentIndex % PARTICLE_GROUPS.length;
        const group = PARTICLE_GROUPS[gIdx];
        const iIdx = currentIndex % group.icons.length;

        setCurrentParticle({
            id: currentIndex,
            moduleId: group.moduleId,
            Icon: group.icons[iIdx],
            colorClass: group.colorClass,
            targetX: group.targetX,
        });
    }, [stage, currentIndex, inView]);

    // ── LAND: called when the fall animation completes ──────────
    const handleLand = (moduleId: string) => {
        setStage("absorbing");       // unmount immediately — clean DOM
        onTriggerPop?.(moduleId);    // fire island pop

        const t1 = setTimeout(() => {
            setStage("gap");
            const t2 = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setStage("spawning");
            }, 16);
            timeoutIds.current.push(t2);
        }, GAP_MS);
        timeoutIds.current.push(t1);
    };

    const isParticleVisible = stage === "spawning" && currentParticle !== null;

    return (
        <section
            ref={containerRef}
            id="showcase-section"
            className="relative w-full bg-[#050505]"
            style={{ height: "300vh" }}
        >
            {/* STICKY VIEWPORT */}
            <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
                <motion.div
                    className="relative flex h-full w-full flex-col items-center justify-center"
                    style={{ opacity }}
                >
                    {/* ── BACKGROUND LAYER 1: Radial spotlight glow ── */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(30, 18, 8, 0.95) 0%, rgba(5,5,5,1) 70%)",
                        }}
                    />

                    {/* ── BACKGROUND LAYER 2: Subtle grid texture ── */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(195,151,103,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195,151,103,1) 1px, transparent 1px)",
                            backgroundSize: "64px 64px",
                        }}
                    />

                    {/* ── BACKGROUND LAYER 3: Warm center bloom ── */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            backgroundImage:
                                "radial-gradient(ellipse 40% 30% at 50% 35%, rgba(195,151,103,0.05) 0%, transparent 100%)",
                        }}
                    />

                    {/* TEXT CONTENT — scroll anchor for "Cómo Funciona" nav link */}
                    <div id="como-funciona" className="relative z-10 text-center max-w-2xl px-6 mt-48 pointer-events-none scroll-mt-24">

                        {/* Eyebrow */}
                        <p className="mb-5 inline-flex items-center gap-2 font-ui text-[10px] uppercase tracking-[0.35em] text-[#C39767]/50">
                            <span className="inline-block h-px w-6 bg-[#C39767]/30" />
                            Presentamos la Smart Island
                            <span className="inline-block h-px w-6 bg-[#C39767]/30" />
                        </p>

                        {/* Headline */}
                        <h2
                            className="font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/92 sm:text-5xl lg:text-6xl"
                            style={{
                                textShadow:
                                    "0 0 60px rgba(195,151,103,0.12), 0 4px 40px rgba(0,0,0,0.95)",
                            }}
                        >
                            La interfaz que{" "}
                            <span className="text-gradient">ya sabes usar.</span>
                        </h2>

                        {/* Pitch */}
                        <p
                            className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/40"
                            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}
                        >
                            Tan familiar que sentirás que llevas años usándola.
                            Sin capacitaciones. Sin curvas de aprendizaje.{" "}
                            <span className="text-white/60 font-medium">
                                Toda la potencia del proyecto, en un solo lugar.
                            </span>
                        </p>
                    </div>

                    {/* ── ZERO POINT ──────────────────────────────────────────────
                        0×0 div at exact screen center (50vw, 50vh).
                        All particle coordinates are relative to this origin.
                    ──────────────────────────────────────────────────────────── */}
                    <div
                        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                        aria-hidden
                    >
                        <div className="relative w-0 h-0">
                            <AnimatePresence mode="wait">
                                {isParticleVisible && (
                                    <FunnelParticle
                                        key={currentParticle!.id}
                                        p={currentParticle!}
                                        onLand={() => handleLand(currentParticle!.moduleId)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}

/* ── FUNNEL PARTICLE ────────────────────────────────────────────────
   Each instance is fully isolated — it reads ONLY from its own
   `initial` prop, never from prior DOM state, because the previous
   particle is guaranteed unmounted before this one mounts.

   Animation timeline (4s tween, easeInOut):
     0%  →  8% : fade in at SPAWN_Y
     8%  → 82% : fully visible, falling toward TARGET_Y
     82% → 100%: opacity→0, scale→0 (absorption at landing)

   No `exit` prop needed: the parent unmounts us instantly when
   handleLand fires (stage → "absorbing"), so AnimatePresence
   has nothing to animate out. We just disappear cleanly.
─────────────────────────────────────────────────────────────────── */
function FunnelParticle({
    p,
    onLand,
}: {
    p: Particle;
    onLand: () => void;
}) {
    return (
        <motion.div
            className={`absolute ${p.colorClass}`}
            // Center the icon on the Zero Point
            style={{ left: 0, top: 0, translateX: "-50%", translateY: "-50%" }}
            initial={{
                y: SPAWN_Y,
                x: 0,
                opacity: 0,
                scale: 1,
            }}
            animate={{
                y: TARGET_Y,
                x: p.targetX,
                opacity: [0, 1, 1, 0],
                scale: [1, 1, 1, 0],
            }}
            transition={{
                type: "tween",
                duration: FALL_DURATION,
                ease: "easeInOut",
                opacity: {
                    times: [0, 0.08, 0.82, 1],
                    duration: FALL_DURATION,
                    ease: "linear",
                },
                scale: {
                    times: [0, 0.08, 0.82, 1],
                    duration: FALL_DURATION,
                    ease: "easeOut",
                },
            }}
            onAnimationComplete={onLand}
        >
            <p.Icon
                size={28}
                strokeWidth={2.5}
                className="drop-shadow-[0_0_16px_currentColor]"
            />
        </motion.div>
    );
}
