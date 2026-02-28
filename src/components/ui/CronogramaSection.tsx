"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import { RefreshCw, GanttChartSquare, HardHat, Zap, CheckCircle2, Loader2 } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   CronogramaSection — "Domino Effect" Gantt
   ──────────────────────────────────────────────────────────────
   4-phase infinite loop (while inView):
     Phase 1 (0s)    Bars grow in — nominal schedule
     Phase 2 (3s)    Task t1 (critical) extends +2 days → flickers
     Phase 3 (3.5s)  Domino: ALL critical tasks slide right
                     Float tasks stay exactly where they are
     Phase 4 (8s)    Reset to nominal → repeat
   ══════════════════════════════════════════════════════════════ */

const ACCENT = "#3B82F6";
const ACCENT_DIM = "rgba(59,130,246,0.75)";

// ── TIMELINE AXIS ─────────────────────────────────────────────────
const TOTAL_DAYS = 16;          // axis width in logical days
const DELAY_DAYS = 2;           // how many days t1 overruns (domino shift)
const DAYS = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8",
    "D9", "D10", "D11", "D12", "D13", "D14", "D15", "D16"];

// ── TASK SCHEMA ───────────────────────────────────────────────────
interface GanttTask {
    id: string;
    clave: string;
    name: string;
    dur: string;           // display label
    startDay: number;      // 1-based
    durDays: number;
    isCritical: boolean;   // true → red (cascades), false → blue (holds)
    isMilestone?: boolean; // diamond marker instead of bar
}

// Nominal schedule — exactly as-designed
const BASE_TASKS: GanttTask[] = [
    // ── Ruta Crítica ──
    { id: "t1", clave: "1.01", name: "Limpieza y trazo", dur: "3d", startDay: 1, durDays: 3, isCritical: true },
    { id: "t2", clave: "2.01", name: "Excavación de zapatas", dur: "5d", startDay: 3, durDays: 5, isCritical: true },
    { id: "t4", clave: "2.03", name: "Plantilla de concreto", dur: "2d", startDay: 7, durDays: 2, isCritical: true },
    { id: "m1", clave: "──", name: "Fin de Cimentación", dur: "0d", startDay: 9, durDays: 0, isCritical: true, isMilestone: true },
    { id: "t5", clave: "3.01", name: "Armado de zapatas", dur: "4d", startDay: 9, durDays: 4, isCritical: true },
    // ── Con holgura ──
    { id: "t3", clave: "2.02", name: "Habilitado de acero", dur: "5d", startDay: 2, durDays: 5, isCritical: false },
    { id: "t6", clave: "4.01", name: "Inst. hidrosanitarias", dur: "4d", startDay: 9, durDays: 4, isCritical: false },
    { id: "m2", clave: "──", name: "Cierre de Fase 1", dur: "0d", startDay: 13, durDays: 0, isCritical: false, isMilestone: true },
];

// ── BAR COLOUR TOKENS ─────────────────────────────────────────────
const CRIT = { bg: "rgba(239,68,68,0.65)", border: "#EF4444", glow: "0 0 10px rgba(239,68,68,0.40)" };
const FLOAT = { bg: "rgba(59,130,246,0.55)", border: "#3B82F6", glow: "0 0 8px rgba(59,130,246,0.30)" };

// ── ANIMATION VARIANTS (section) ─────────────────────────────────
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
    { Icon: RefreshCw, title: "Sincronización BIM y Bitácora", body: "Si la bitácora reporta un retraso por lluvia, el cronograma completo recalcula las dependencias automáticamente. Adiós a los Excels rotos." },
    { Icon: GanttChartSquare, title: "Visualización clara", body: "Controla tareas programadas, completadas y retrasadas en una interfaz fluida y moderna que todo tu equipo puede entender de un vistazo." },
    { Icon: HardHat, title: "Staging & Producción", body: "Juega con escenarios en modo 'Borrador' antes de hacer Commit y afectar la línea base de tu obra real." },
] as const;

// ── BIM SYNC BUTTON ───────────────────────────────────────────────
type SyncState = "idle" | "loading" | "synced";

function SyncButton({ state }: { state: SyncState }) {
    if (state === "loading") return (
        <div className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", color: ACCENT_DIM }}>
            <Loader2 size={11} className="animate-spin" />
            Sincronizando...
        </div>
    );
    if (state === "synced") return (
        <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}>
            <CheckCircle2 size={11} />
            Sincronizado
        </motion.div>
    );
    return (
        <div className="flex cursor-default items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold"
            style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.28)", color: ACCENT_DIM }}>
            <Zap size={11} />
            Sincronizar BIM
        </div>
    );
}

// ── GANTT BAR ─────────────────────────────────────────────────────
// Each bar is an absolutely-positioned motion.div whose left/width
// are driven by animated style values. On every render framer-motion
// will SPRING-interpolate toward the new target values automatically.
const MILESTONE = { bg: "rgba(234,179,8,0.75)", border: "#EAB308", glow: "0 0 10px rgba(234,179,8,0.45)" };

function GanttBar({
    task,
    inView,
    entryDelay,
    effectStartDay,
    effectDurDays,
    flickerT1,
}: {
    task: GanttTask;
    inView: boolean;
    entryDelay: number;
    effectStartDay: number;
    effectDurDays: number;
    flickerT1: boolean;
}) {
    const s = task.isMilestone ? MILESTONE : (task.isCritical ? CRIT : FLOAT);
    const leftPct = ((effectStartDay - 1) / TOTAL_DAYS) * 100;

    // ── Milestone: render diamond ──
    if (task.isMilestone) {
        return (
            <div className="relative h-full w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4, ease: "backOut", delay: entryDelay }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${leftPct}%` }}
                >
                    <div
                        className="h-3.5 w-3.5 rotate-45"
                        style={{
                            background: s.bg,
                            border: `1.5px solid ${s.border}`,
                            boxShadow: s.glow,
                        }}
                    />
                </motion.div>
            </div>
        );
    }

    // ── Normal bar ──
    const widthPct = (effectDurDays / TOTAL_DAYS) * 100;
    const animate = inView
        ? {
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            opacity: 1,
            boxShadow: flickerT1 && task.id === "t1"
                ? "0 0 22px rgba(239,68,68,0.9)"
                : s.glow,
        }
        : { left: `${leftPct}%`, width: "0%", opacity: 0 };

    return (
        <div className="relative h-full w-full">
            <motion.div
                initial={{ width: "0%", opacity: 0 }}
                animate={animate}
                transition={
                    task.isCritical && inView
                        ? { type: "spring", stiffness: 55, damping: 14, delay: 0 }
                        : { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: entryDelay }
                }
                className={`absolute top-1/2 -translate-y-1/2 rounded-full ${flickerT1 && task.id === "t1" ? "animate-pulse" : ""}`}
                style={{
                    height: "13px",
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                }}
            />
        </div>
    );
}

// ── DEPENDENCY ARROW (elbow connector) ────────────────────────────
// Draws a right-angle connector from the end of task A to the start of task B.
function DependencyArrow({
    fromEndDay,
    toStartDay,
    fromRowIndex,
    toRowIndex,
    totalRows,
}: {
    fromEndDay: number;
    toStartDay: number;
    fromRowIndex: number;
    toRowIndex: number;
    totalRows: number;
}) {
    const rowHeight = 100 / totalRows;
    // Arrow starts from the END of the source bar (startDay + dur - 1 gives last day, then +1 col boundary for the right edge)
    const fromEndPct = ((fromEndDay) / TOTAL_DAYS) * 100;
    const toStartPct = ((toStartDay - 1) / TOTAL_DAYS) * 100;
    const midPct = fromEndPct + (toStartPct - fromEndPct) * 0.5; // elbow at midpoint
    const topPct = (fromRowIndex + 0.5) * rowHeight;
    const bottomPct = (toRowIndex + 0.5) * rowHeight;
    const heightPct = bottomPct - topPct;

    // Skip if source and target are the same column
    if (toStartPct <= fromEndPct) return null;

    return (
        <>
            {/* Vertical segment: drop down from source row center */}
            <div
                className="pointer-events-none absolute z-10"
                style={{
                    left: `${midPct}%`,
                    top: `${topPct}%`,
                    width: 0,
                    height: `${heightPct}%`,
                    borderLeft: "1.5px dashed rgba(255,255,255,0.15)",
                    transition: "all 0.7s ease-in-out",
                }}
            />
            {/* Horizontal from source end to elbow */}
            <div
                className="pointer-events-none absolute z-10"
                style={{
                    left: `${fromEndPct}%`,
                    top: `${topPct}%`,
                    width: `${midPct - fromEndPct}%`,
                    height: 0,
                    borderTop: "1.5px dashed rgba(255,255,255,0.15)",
                    transition: "all 0.7s ease-in-out",
                }}
            />
            {/* Horizontal from elbow to target start */}
            <div
                className="pointer-events-none absolute z-10"
                style={{
                    left: `${midPct}%`,
                    top: `${bottomPct}%`,
                    width: `${toStartPct - midPct}%`,
                    height: 0,
                    borderTop: "1.5px dashed rgba(255,255,255,0.15)",
                    transition: "all 0.7s ease-in-out",
                }}
            />
            {/* Arrow head */}
            <div
                className="pointer-events-none absolute z-10"
                style={{
                    left: `${toStartPct}%`,
                    top: `${bottomPct}%`,
                    transform: "translate(-1px, -3.5px)",
                    width: 0,
                    height: 0,
                    borderTop: "3.5px solid transparent",
                    borderBottom: "3.5px solid transparent",
                    borderLeft: "6px solid rgba(255,255,255,0.22)",
                    transition: "all 0.7s ease-in-out",
                }}
            />
        </>
    );
}

// ── DELAY BANNER ──────────────────────────────────────────────────
// Full-width inline banner — rendered inside the timeline column,
// BELOW the day-header row, so the chrome bar stays perfectly clean.
function DelayBanner({ visible }: { visible: boolean }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "28px" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="shrink-0 overflow-hidden border-b"
                    style={{ borderColor: "rgba(239,68,68,0.35)" }}
                >
                    <div
                        className="flex h-full w-full items-center justify-center gap-2 px-3"
                        style={{
                            background: "rgba(26,5,5,0.96)",
                            borderTop: "1px solid rgba(239,68,68,0.20)",
                        }}
                    >
                        <span className="text-[9px] font-semibold" style={{ color: "#EF4444" }}>
                            ⚠ Retraso detectado en Ruta Crítica · Recalculando dependencias...
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function CronogramaSection() {
    const ganttRef = useRef<HTMLDivElement>(null);
    const inView = useInView(ganttRef, { once: true, amount: 0.35 });

    const [syncState, setSyncState] = useState<SyncState>("idle");

    // ── Domino state ──
    const [phase, setPhase] = useState<"nominal" | "flicker" | "delayed">("nominal");

    // ── Compute effective bar coordinates per-phase ───────────────
    // cascade: how many extra days to push each critical task that
    // starts AFTER t1 (t2, t4, t5). t1 itself just grows wider.
    function effective(task: GanttTask): { startDay: number; durDays: number } {
        if (phase === "nominal") {
            return { startDay: task.startDay, durDays: task.durDays };
        }
        if (!task.isCritical) {
            // Float tasks freeze — THIS is the visual proof of holgura
            return { startDay: task.startDay, durDays: task.durDays };
        }
        if (task.id === "t1") {
            // t1 grows wider (the delay)
            return { startDay: task.startDay, durDays: task.durDays + DELAY_DAYS };
        }
        // Every other critical task shifts right by DELAY_DAYS (cascade)
        return { startDay: task.startDay + DELAY_DAYS, durDays: task.durDays };
    }

    // ── BIM sync micro-interaction (one-time on inView) ───────────
    useEffect(() => {
        if (!inView) return;
        const t1 = setTimeout(() => setSyncState("loading"), 2800);
        const t2 = setTimeout(() => setSyncState("synced"), 4600);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [inView]);

    // ── Domino loop (runs while inView) ───────────────────────────
    // Phase timeline per cycle:
    //   0s     → "nominal"  (bars just entered / reset)
    //   3000ms → "flicker"  (t1 flashes red)
    //   3500ms → "delayed"  (full cascade)
    //   8500ms → "nominal"  (reset → repeat after 500ms pause)
    //
    // FIX: All timeout IDs are collected in a ref array.
    // The effect's cleanup function clears EVERY pending timeout,
    // stopping the recursive chain immediately on unmount or inView change.
    // Previously, returning a cleanup inside runCycle() was a no-op —
    // React only calls the return value of the useEffect callback itself.
    const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!inView) return;

        // Helper: schedule a timeout and track its ID for cleanup
        function schedule(fn: () => void, delay: number) {
            const id = setTimeout(fn, delay);
            timerIdsRef.current.push(id);
            return id;
        }

        function runCycle() {
            schedule(() => setPhase("flicker"), 3000);
            schedule(() => setPhase("delayed"), 3500);
            schedule(() => {
                setPhase("nominal");
                schedule(runCycle, 500); // next cycle — also tracked
            }, 8500);
        }

        // Kick off first cycle after initial bar grow-in (~1.5s)
        schedule(runCycle, 1500);

        // Cleanup: cancel every pending timeout when unmounting or inView changes
        return () => {
            timerIdsRef.current.forEach(clearTimeout);
            timerIdsRef.current = [];
            setPhase("nominal"); // reset visual state on cleanup
        };
    }, [inView]);

    // ── Compute dependency arrows for critical path ──
    const criticalTasks = BASE_TASKS.filter(t => t.isCritical && !t.isMilestone);
    const arrows: { fromIdx: number; toIdx: number; fromEndDay: number; toStartDay: number }[] = [];
    for (let i = 0; i < criticalTasks.length - 1; i++) {
        const from = criticalTasks[i];
        const to = criticalTasks[i + 1];
        const fromEff = effective(from);
        const toEff = effective(to);
        const fromIdx = BASE_TASKS.indexOf(from);
        const toIdx = BASE_TASKS.indexOf(to);
        arrows.push({
            fromIdx,
            toIdx,
            fromEndDay: fromEff.startDay + fromEff.durDays - 1,
            toStartDay: toEff.startDay,
        });
    }

    return (
        <section
            id="smart-calendar"
            className="relative w-full border-t border-white/5"
            style={{ backgroundColor: "#050505", minHeight: "150dvh", height: "auto" }}
        >
            {/* ── STICKY WRAPPER ── */}
            <div className="sticky top-0 min-h-[100dvh] h-auto md:h-screen w-full flex items-center justify-center pt-32 md:pt-20 pb-32 md:pb-0">
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
                        {/* Flowing timeline paths — sinusoidal waves flowing L→R */}
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
                            <path
                                key={`wave${i}`}
                                d={p.d}
                                fill="none"
                                stroke={p.c}
                                strokeWidth={p.w}
                            />
                        ))}

                        {/* Rhythmic tick markers traveling along the wave paths */}
                        {[
                            { path: "M0,120 C250,100 500,160 750,120 S1250,80 1500,140 S1750,100 2000,120", c: "#3B82F6", dur: "12s", delay: "0s" },
                            { path: "M0,220 C300,200 550,260 800,220 S1200,180 1500,250 S1800,210 2000,230", c: "#EF4444", dur: "14s", delay: "2s" },
                            { path: "M0,340 C200,320 450,380 700,340 S1100,300 1400,360 S1700,320 2000,350", c: "#3B82F6", dur: "11s", delay: "1s" },
                            { path: "M0,460 C350,440 600,500 850,460 S1150,420 1450,480 S1750,450 2000,460", c: "#EAB308", dur: "15s", delay: "3s" },
                            { path: "M0,560 C250,540 500,600 750,560 S1050,520 1350,580 S1650,550 2000,570", c: "#EF4444", dur: "13s", delay: "4s" },
                            { path: "M0,660 C300,640 550,700 800,660 S1200,620 1500,680 S1800,650 2000,670", c: "#3B82F6", dur: "16s", delay: "1.5s" },
                        ].map((m, i) => (
                            <g key={`tick${i}`}>
                                {/* Main tick dot */}
                                <circle r="2" fill={m.c} opacity="0">
                                    <animateMotion
                                        dur={m.dur}
                                        begin={m.delay}
                                        repeatCount="indefinite"
                                        path={m.path}
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0;0.35;0.35;0"
                                        dur={m.dur}
                                        begin={m.delay}
                                        repeatCount="indefinite"
                                    />
                                </circle>
                                {/* Glow trail */}
                                <circle r="6" fill={m.c} opacity="0" style={{ filter: "blur(3px)" }}>
                                    <animateMotion
                                        dur={m.dur}
                                        begin={m.delay}
                                        repeatCount="indefinite"
                                        path={m.path}
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0;0.12;0.12;0"
                                        dur={m.dur}
                                        begin={m.delay}
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            </g>
                        ))}

                        {/* Static node markers along the waves suggesting periodic milestones */}
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

                {/* ── SPLIT GRID ────────────────────────────────────────── */}
                <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-14 lg:px-12">

                    {/* ════════════════════════════════════════════════════════
            LEFT — Copy
           ════════════════════════════════════════════════════════ */}
                    <motion.div variants={slideLeft} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }} className="flex flex-col gap-7">

                        {/* Module label */}
                        <div className="inline-flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${ACCENT}88` }}>
                                Smart Calendar
                            </span>
                        </div>

                        {/* Headline */}
                        <h2 className="font-display text-3xl font-extrabold uppercase leading-[1.04] tracking-tight text-white/92 md:text-4xl sm:text-5xl xl:text-6xl"
                            style={{ textShadow: `0 0 60px rgba(59,130,246,0.09), 0 4px 40px rgba(0,0,0,0.95)` }}>
                            Cronograma<br />
                            <span style={{ color: ACCENT }}>vivo.</span>
                        </h2>

                        {/* Sub-headline */}
                        <p className="max-w-sm text-base leading-relaxed text-white/38">
                            Gantt inteligente que se ajusta solo.{" "}
                            <span className="font-medium text-white/58">
                                Cuando algo cambia en obra, el calendario lo sabe antes que tú.
                            </span>
                        </p>

                        {/* Features */}
                        <motion.ul variants={featureStagger} initial="hidden" whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }} className="flex flex-col gap-5">
                            {FEATURES.map(({ Icon, title, body }) => (
                                <motion.li key={title} variants={featureItem} className="flex items-start gap-3.5">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}35` }}>
                                        <Icon size={12} style={{ color: ACCENT }} strokeWidth={2.5} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white/78">{title}</p>
                                        <p className="mt-0.5 text-sm leading-relaxed text-white/33">{body}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* CTA */}
                        <a href="#bim-sync" className="group inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors"
                            style={{ color: `${ACCENT}58` }}>
                            Ver siguiente módulo
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </a>
                    </motion.div>

                    {/* ════════════════════════════════════════════════════════
            RIGHT — Gantt Mockup (LOCKED BOX)
           ════════════════════════════════════════════════════════ */}
                    <motion.div variants={slideRight} initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }} className="flex w-full justify-center">

                        <div className="w-full overflow-x-auto pb-2 md:overflow-visible">
                            <div ref={ganttRef}
                                className="relative flex w-full min-w-[320px] max-w-[600px] flex-col overflow-hidden rounded-2xl border border-white/8 mx-auto"
                                style={{
                                    height: "520px", background: "#111111",
                                    boxShadow: `0 0 70px rgba(59,130,246,0.07), 0 28px 60px rgba(0,0,0,0.80)`
                                }}>



                                {/* ── Chrome bar ── */}
                                <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3"
                                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                                    </div>
                                    <div className="flex flex-1 items-center justify-center">
                                        <span className="relative px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                                            style={{ color: ACCENT }}>
                                            Staging (Borrador)
                                            <div
                                                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                                                style={{ background: ACCENT }} />
                                        </span>
                                    </div>
                                    <SyncButton state={syncState} />
                                </div>

                                {/* ── Gantt body ── */}
                                <div className="flex flex-1 overflow-hidden">

                                    {/* Task list */}
                                    <div className="flex w-[185px] shrink-0 flex-col border-r"
                                        style={{ borderColor: "rgba(255,255,255,0.05)" }}>

                                        {/* Header */}
                                        <div className="grid shrink-0 grid-cols-[28px_1fr_34px] items-center gap-1 border-b px-3 py-2"
                                            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                            <span className="text-[8px] font-semibold uppercase tracking-wider text-white/20">Clave</span>
                                            <span className="text-[8px] font-semibold uppercase tracking-wider text-white/20">Tarea</span>
                                            <span className="text-center text-[8px] font-semibold uppercase tracking-wider text-white/20">Dur.</span>
                                        </div>

                                        {/* Rows */}
                                        <div className="flex flex-1 flex-col overflow-hidden">
                                            {BASE_TASKS.map((t, i) => {
                                                const claveColor = t.isMilestone ? MILESTONE.border : (t.isCritical ? CRIT.border : FLOAT.border);
                                                const { durDays } = effective(t);
                                                const durLabel = t.isMilestone ? "◆" : `${durDays}d`;
                                                const isDelayedTask = phase !== "nominal" && t.id === "t1";
                                                return (
                                                    <div key={t.id}
                                                        className="grid grid-cols-[28px_1fr_34px] items-center gap-1 border-b px-3"
                                                        style={{
                                                            borderColor: "rgba(255,255,255,0.04)",
                                                            height: `${100 / BASE_TASKS.length}%`,
                                                            background: isDelayedTask
                                                                ? "rgba(239,68,68,0.06)"
                                                                : (i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)"),
                                                            transition: "background 0.5s ease",
                                                        }}>
                                                        <span className="font-mono text-[8px] font-bold" style={{ color: claveColor }}>
                                                            {t.clave}
                                                        </span>
                                                        <span className="flex items-center gap-1 truncate text-[9px] text-white/50">
                                                            {isDelayedTask && (
                                                                <motion.span
                                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="text-[8px] shrink-0"
                                                                >
                                                                    ⚠️
                                                                </motion.span>
                                                            )}
                                                            <span className="truncate" style={{ color: isDelayedTask ? "#EF4444" : undefined }}>
                                                                {t.name}
                                                            </span>
                                                        </span>
                                                        <motion.span
                                                            animate={{
                                                                color: isDelayedTask
                                                                    ? "#EF4444"
                                                                    : "rgba(255,255,255,0.25)"
                                                            }}
                                                            transition={{ duration: 0.3 }}
                                                            className="text-center font-mono text-[8px]">
                                                            {durLabel}
                                                        </motion.span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="flex flex-1 flex-col overflow-hidden">

                                        {/* Day headers */}
                                        <div className="grid shrink-0 border-b"
                                            style={{
                                                gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))`,
                                                borderColor: "rgba(255,255,255,0.05)"
                                            }}>
                                            {DAYS.map((d) => (
                                                <div key={d} className="border-r py-2 text-center text-[7px] font-semibold text-white/18"
                                                    style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Delay banner — sits between day-header and bar rows ── */}
                                        <DelayBanner visible={phase !== "nominal"} />

                                        {/* Bar rows */}
                                        <div className="relative flex flex-1 flex-col overflow-hidden">
                                            {BASE_TASKS.map((task, i) => {
                                                const { startDay, durDays } = effective(task);
                                                return (
                                                    <div key={task.id}
                                                        className="relative shrink-0 border-b"
                                                        style={{
                                                            borderColor: "rgba(255,255,255,0.04)",
                                                            height: `${100 / BASE_TASKS.length}%`,
                                                            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)"
                                                        }}>

                                                        {/* Grid lines */}
                                                        <div className="pointer-events-none absolute inset-0 grid"
                                                            style={{ gridTemplateColumns: `repeat(${DAYS.length}, minmax(0, 1fr))` }}>
                                                            {DAYS.map((d) => (
                                                                <div key={d} className="border-r"
                                                                    style={{ borderColor: "rgba(255,255,255,0.03)" }} />
                                                            ))}
                                                        </div>

                                                        {/* Animated bar or milestone diamond */}
                                                        <GanttBar
                                                            task={task}
                                                            inView={inView}
                                                            entryDelay={0.15 + i * 0.11}
                                                            effectStartDay={startDay}
                                                            effectDurDays={durDays}
                                                            flickerT1={phase === "flicker"}
                                                        />
                                                    </div>
                                                );
                                            })}

                                            {/* ── Dependency arrows (critical path connectors) ── */}
                                            {inView && arrows.map((a, i) => (
                                                <DependencyArrow
                                                    key={`arrow-${i}`}
                                                    fromEndDay={a.fromEndDay}
                                                    toStartDay={a.toStartDay}
                                                    fromRowIndex={a.fromIdx}
                                                    toRowIndex={a.toIdx}
                                                    totalRows={BASE_TASKS.length}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Status bar / Legend ── */}
                                <div className="flex shrink-0 items-center justify-between border-t px-4 py-2"
                                    style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full"
                                                style={{ background: CRIT.border, boxShadow: CRIT.glow }} />
                                            <span className="text-[8px] text-white/35">
                                                Ruta Crítica <span className="text-white/20">(Holgura 0)</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full"
                                                style={{ background: FLOAT.border, boxShadow: FLOAT.glow }} />
                                            <span className="text-[8px] text-white/35">Actividades con holgura</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rotate-45"
                                                style={{ background: MILESTONE.bg, border: `1px solid ${MILESTONE.border}` }} />
                                            <span className="text-[8px] text-white/35">Hito</span>
                                        </div>
                                    </div>
                                    {/* Phase indicator */}
                                    <AnimatePresence mode="wait">
                                        {phase !== "nominal" ? (
                                            <motion.span key="recalc"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="text-[8px] font-semibold" style={{ color: "#EF4444" }}>
                                                ⟳ Recalculando...
                                            </motion.span>
                                        ) : (
                                            <motion.span key="ok"
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="text-[8px] text-white/20">
                                                {BASE_TASKS.length} tareas · Días 1–{TOTAL_DAYS}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
