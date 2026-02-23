"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Matter from "matter-js";
import {
    FileSpreadsheet,
    FileText,
    FileJson,
    GanttChart,
    MessageCircle,
    ImageIcon,
    DollarSign,
    TrendingUp,
    Calendar,
    Clock,
    Hourglass,
    StickyNote,
    type LucideIcon,
} from "lucide-react";
import { useInView } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   ProblemChaos v12 — Fine Tuning
   ──────────────────────────────────────────────────────────────
   - "Smaller Icons": Reduced VISUAL_SIZE to 28px (was 42px).
   - "Soft Repulsion": Reduced Force to 0.01 (was 0.25).
   - "Density": Kept body radius small (14px) for overlap.
   ══════════════════════════════════════════════════════════════ */

const {
    Engine,
    Bodies,
    Body,
    Runner,
    Events,
    Composite,
} = Matter;

/* ── Icon types ── */
interface DebrisType {
    Icon: LucideIcon;
    colorClass: string; // Tailwind class
    label: string;
}

// 1. DINERO Y EXCEL (Verde) -> text-emerald-500
const GROUP_MONEY: DebrisType[] = [
    { Icon: FileSpreadsheet, colorClass: "text-emerald-500", label: "Excel" },
    { Icon: DollarSign, colorClass: "text-emerald-500", label: "Costos" },
    { Icon: TrendingUp, colorClass: "text-emerald-500", label: "Estimaciones" },
];

// 2. TIEMPO Y PLANIFICACIÓN (Azul) -> text-blue-500
const GROUP_TIME: DebrisType[] = [
    { Icon: Calendar, colorClass: "text-blue-500", label: "Calendario" },
    { Icon: Clock, colorClass: "text-blue-500", label: "Plazos" },
    { Icon: Hourglass, colorClass: "text-blue-500", label: "Retrasos" },
    { Icon: GanttChart, colorClass: "text-blue-500", label: "Gantt" },
    { Icon: FileJson, colorClass: "text-blue-500", label: "Project" },
];

// 3. FOTOS, MENSAJES Y DOCS (Café/Bronce) -> text-[#c39767]
const GROUP_DOCS: DebrisType[] = [
    { Icon: ImageIcon, colorClass: "text-[#c39767]", label: "Foto" },
    { Icon: MessageCircle, colorClass: "text-[#c39767]", label: "WhatsApp" },
    { Icon: FileText, colorClass: "text-[#c39767]", label: "Reporte" },
    { Icon: StickyNote, colorClass: "text-[#c39767]", label: "Nota" },
];

const DEBRIS_TYPES = [...GROUP_MONEY, ...GROUP_TIME, ...GROUP_DOCS];

const TOTAL_BODIES = 140;   // Increased slightly for more density
const BODY_RADIUS = 14;     // Small physics body
const VISUAL_SIZE = 28;     // Reduced visual size (User request: w-7)
const SPAWN_INTERVAL = 25;  // Very fast spawn
const REPULSION_RADIUS = 150;
const REPULSION_FORCE = 0.01; // Soft push (User request)

/* ── Seeded random ── */
function sr(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

/* ── Body metadata ── */
interface BodyMeta {
    typeIdx: number;
}

/* ── State for rendered icons ── */
interface IconState {
    id: number;
    x: number;
    y: number;
    angle: number;
    type: DebrisType;
}

/* ── Grid bg ── */
const gridBg = [
    "repeating-linear-gradient(to right,rgba(195,151,103,.04) 0 1px,transparent 1px 80px)",
    "repeating-linear-gradient(to bottom,rgba(195,151,103,.04) 0 1px,transparent 1px 80px)",
].join(",");

export default function ProblemChaos() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);
    const rafRef = useRef<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const mousePosRef = useRef<{ x: number; y: number } | null>(null);

    // Scroll Trigger
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
    const hasStartedRef = useRef(false);

    // State for React rendering
    const [icons, setIcons] = useState<IconState[]>([]);

    /* ── Sync DOM to physics loop ── */
    const syncDOM = useCallback(() => {
        const engine = engineRef.current;
        if (!engine) return;

        const bodies = Composite.allBodies(engine.world).filter(
            (b) => !b.isStatic && b.label.startsWith("{")
        );

        const next: IconState[] = bodies.map((b) => {
            let meta: BodyMeta = { typeIdx: 0 };
            try {
                meta = JSON.parse(b.label);
            } catch { /* ignore */ }
            return {
                id: b.id,
                x: b.position.x,
                y: b.position.y,
                angle: b.angle,
                type: DEBRIS_TYPES[meta.typeIdx % DEBRIS_TYPES.length],
            };
        });

        setIcons(next);
        rafRef.current = requestAnimationFrame(syncDOM);
    }, []);

    /* ── Init Engine ── */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const w = container.clientWidth;
        const h = container.clientHeight;

        // 1. Create Engine
        const engine = Engine.create({
            gravity: { x: 0, y: 1.5, scale: 0.001 },
        });
        engineRef.current = engine;

        // 2. World Bounds
        const wallThickness = 200;
        const floorY = h - 30;

        const floor = Bodies.rectangle(w / 2, floorY + wallThickness / 2, w * 3, wallThickness, {
            isStatic: true,
            friction: 1,
            frictionStatic: 10,
            label: "wall",
        });

        const leftWall = Bodies.rectangle(-20, h / 2, wallThickness, h * 3, {
            isStatic: true,
            friction: 0.5,
            label: "wall",
        });
        const rightWall = Bodies.rectangle(w + 20, h / 2, wallThickness, h * 3, {
            isStatic: true,
            friction: 0.5,
            label: "wall",
        });

        Composite.add(engine.world, [floor, leftWall, rightWall]);

        // 3. Repulsion Logic
        Events.on(engine, "beforeUpdate", () => {
            const mouse = mousePosRef.current;
            if (!mouse) return;

            const rect = container.getBoundingClientRect();
            const localMouseX = mouse.x - rect.left;
            const localMouseY = mouse.y - rect.top;

            if (
                localMouseX < -100 || localMouseX > w + 100 ||
                localMouseY < -100 || localMouseY > h + 100
            ) return;

            const bodies = Composite.allBodies(engine.world).filter(
                (b) => !b.isStatic
            );

            bodies.forEach((body) => {
                const dx = body.position.x - localMouseX;
                const dy = body.position.y - localMouseY;
                const distSq = dx * dx + dy * dy;

                if (distSq < REPULSION_RADIUS * REPULSION_RADIUS) {
                    const dist = Math.sqrt(distSq);
                    const forceMagnitude = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;

                    if (dist > 0) {
                        const force = { x: (dx / dist) * forceMagnitude, y: (dy / dist) * forceMagnitude };
                        Body.applyForce(body, body.position, force);
                    }
                }
            });
        });

        return () => {
            Engine.clear(engine);
        };
    }, []);

    /* ── Start/Stop Runner based on View ── */
    useEffect(() => {
        if (!isInView || hasStartedRef.current) return;

        const engine = engineRef.current;
        if (!engine) return;

        hasStartedRef.current = true; // Only start once

        // Runner
        const runner = Runner.create();
        runnerRef.current = runner;
        Runner.run(runner, engine);

        // SYNC
        rafRef.current = requestAnimationFrame(syncDOM);

        // SPAWN
        let spawned = 0;
        const container = containerRef.current;
        const w = container?.clientWidth || 1000;

        intervalRef.current = setInterval(() => {
            if (spawned >= TOTAL_BODIES) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }

            const typeIdx = Math.floor(sr(spawned * 13 + 7) * DEBRIS_TYPES.length);
            const pRadius = BODY_RADIUS + (sr(spawned * 23) - 0.5) * 4;
            const xJitter = (sr(spawned * 37) - 0.5) * (w * 0.3);

            const body = Bodies.circle(w / 2 + xJitter, -100, pRadius, {
                restitution: 0.2,
                friction: 0.9,
                frictionStatic: 10,
                frictionAir: 0.02,
                density: 0.005,
                label: JSON.stringify({ typeIdx } as BodyMeta),
            });

            Body.setAngularVelocity(body, (sr(spawned * 41) - 0.5) * 0.2);
            Composite.add(engine.world, body);
            spawned++;
        }, SPAWN_INTERVAL);

    }, [isInView, syncDOM]);

    /* ── Cleanup ── */
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            cancelAnimationFrame(rafRef.current);
            if (runnerRef.current) Runner.stop(runnerRef.current);
            if (engineRef.current) {
                Engine.clear(engineRef.current);
                Composite.clear(engineRef.current.world, false);
            }
        };
    }, []);

    /* ── Global Mouse Tracker ── */
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section
            ref={sectionRef}
            id="problema"
            className="relative w-full"
            style={{
                backgroundColor: "#0c0604",
                height: "200vh", // Scroll retention track (200% viewport height)
                minHeight: 1600,
            }}
        >
            {/* ── STICKY WRAPPER ── */}
            <div ref={containerRef} className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                {/* Grid bg */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: gridBg }}
                />

                {/* ── ICONS CONTAINER ── */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    {icons.map((icon) => {
                        const { Icon, colorClass } = icon.type;
                        return (
                            <div
                                key={icon.id}
                                className={`absolute flex items-center justify-center ${colorClass}`}
                                style={{
                                    width: VISUAL_SIZE,
                                    height: VISUAL_SIZE,
                                    left: icon.x - VISUAL_SIZE / 2,
                                    top: icon.y - VISUAL_SIZE / 2,
                                    transform: `rotate(${icon.angle}rad)`,
                                    willChange: "transform, left, top",
                                }}
                            >
                                <Icon
                                    size={VISUAL_SIZE}
                                    strokeWidth={2.5}
                                    className="drop-shadow-2xl filter"
                                />
                            </div>
                        );
                    })}
                </div>

                {/* ── FLOOR GRADIENT ── */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full"
                    style={{
                        height: "15%",
                        zIndex: 20,
                        background:
                            "linear-gradient(to top, #0c0604 0%, rgba(12,6,4,.6) 50%, transparent 100%)",
                    }}
                />

                {/* ── TEXT OVERLAY ── */}
                <div
                    className="absolute inset-0 flex items-start justify-center pointer-events-none"
                    style={{ zIndex: 30, paddingTop: "12vh" }}
                >
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <p className="mb-5 font-ui text-xs uppercase tracking-[0.3em] text-[#b07040]/70">
                            El Problema
                        </p>

                        <h2
                            className="mb-6 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl lg:text-5xl text-white/90"
                            style={{
                                textShadow:
                                    "0 4px 40px rgba(0,0,0,.95), 0 0 80px rgba(12,6,4,.9), 0 0 120px rgba(12,6,4,.6)",
                            }}
                        >
                            Tu obra es un{" "}
                            <span className="text-gradient">caos de archivos.</span>
                        </h2>

                        <p
                            className="mx-auto max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base lg:text-lg"
                            style={{
                                textShadow:
                                    "0 2px 30px rgba(0,0,0,.98), 0 0 60px rgba(12,6,4,.8)",
                            }}
                        >
                            Miles de fotos en WhatsApp, Excels rotos y reportes perdidos.
                            La construcción tradicional sepulta tu dinero bajo una montaña
                            de desorden administrativo.
                        </p>

                        <div
                            className="mx-auto mt-8 h-px w-24"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, #c39767 50%, transparent)",
                                boxShadow: "0 0 8px rgba(195,151,103,.4)",
                            }}
                        />
                    </div>
                </div>

                {/* ── TOP FADE ── */}
                <div
                    className="pointer-events-none absolute top-0 left-0 w-full"
                    style={{
                        height: "10%",
                        zIndex: 25,
                        background:
                            "linear-gradient(to bottom, #0c0604 10%, transparent 100%)",
                    }}
                />

            </div> {/* End Sticky Wrapper */}
        </section>
    );
}
