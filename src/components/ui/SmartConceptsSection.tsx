"use client";

import { useState, useEffect, useRef } from "react";
import type { ElementType } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Check, MapPin, Pencil, Home, Building2, Mountain, Layers } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SmartConceptsSection — 3-Scenario Dynamic Loop
   ──────────────────────────────────────────────────────────────
   State machine:
     "step0" → "step1" → "step2" → "table" → (next scenario)
   Each step shows a question; a simulated click selects an option.
   Times are intentionally slow so the user can read everything.
   ══════════════════════════════════════════════════════════════ */

const ACCENT = "#00D26A";

// ── TIMING (ms) ──────────────────────────────────────────────────
const STEP_READ = 3200;  // time to read each question before click
const CLICK_HOLD = 500;   // how long the click animation holds
const STEP_GAP = 600;   // gap between steps after click
const TABLE_SHOW = 5000;  // how long the result table stays visible
const PHASE_FADE = 350;   // AnimatePresence fade duration

// ── SCENARIO DATA ────────────────────────────────────────────────
interface Concept { clave: string; desc: string; unit: string; pu: string; qty: string; total: string; }

interface Scenario {
    id: string;
    label: string;         // badge label
    zone: string;
    steps: { icon: ElementType; question: string; options: string[]; answer: string }[];
    concepts: Concept[];
    totalStr: string;
}

const SCENARIOS: Scenario[] = [
    {
        id: "residential",
        label: "Residencial",
        zone: "Zona Norte (Local)",
        steps: [
            { icon: Home, question: "Uso del inmueble:", options: ["Vivienda Unifamiliar", "Plaza Comercial", "Nave Industrial"], answer: "Vivienda Unifamiliar" },
            { icon: Mountain, question: "Topografía del terreno:", options: ["Terreno Plano", "Pendiente Leve", "Accidentado / Rocoso"], answer: "Terreno Plano" },
            { icon: Layers, question: "Tipo de cimentación:", options: ["Zapatas Aisladas", "Losa de Cimentación", "Pilotes Profundos"], answer: "Zapatas Aisladas" },
        ],
        concepts: [
            { clave: "01.01", desc: "Trazo y nivelación con nivel óptico", unit: "m²", pu: "$18.50", qty: "320.00", total: "$5,920.00" },
            { clave: "01.02", desc: "Excavación manual para zapatas", unit: "m³", pu: "$185.00", qty: "38.40", total: "$7,104.00" },
            { clave: "02.01", desc: "Concreto f'c=250 kg/cm² en cimentación", unit: "m³", pu: "$3,480.00", qty: "18.20", total: "$63,336.00" },
            { clave: "02.02", desc: "Acero de refuerzo fy=4200 kg/cm² habilitado", unit: "kg", pu: "$28.90", qty: "3,200.00", total: "$92,480.00" },
        ],
        totalStr: "$168,840.00",
    },
    {
        id: "commercial",
        label: "Comercial",
        zone: "Zona Centro (Local)",
        steps: [
            { icon: Building2, question: "Uso del inmueble:", options: ["Vivienda Unifamiliar", "Plaza Comercial", "Nave Industrial"], answer: "Plaza Comercial" },
            { icon: Mountain, question: "Topografía del terreno:", options: ["Terreno Plano", "Pendiente Leve", "Accidentado / Rocoso"], answer: "Accidentado / Rocoso" },
            { icon: Layers, question: "Tipo de cimentación:", options: ["Zapatas Aisladas", "Losa de Cimentación", "Pilotes Profundos"], answer: "Pilotes Profundos" },
        ],
        concepts: [
            { clave: "01.01", desc: "Desmonte con maquinaria pesada (roca)", unit: "m²", pu: "$95.00", qty: "640.00", total: "$60,800.00" },
            { clave: "01.02", desc: "Barrenación y uso de explosivos controlados", unit: "m³", pu: "$1,240.00", qty: "96.00", total: "$119,040.00" },
            { clave: "02.01", desc: "Pilotes de concreto f'c=300 kg/cm² (15 m)", unit: "pza", pu: "$28,500.00", qty: "24.00", total: "$684,000.00" },
            { clave: "02.02", desc: "Acero de alta resistencia A-572 Gr.50", unit: "kg", pu: "$36.40", qty: "12,800.00", total: "$465,920.00" },
        ],
        totalStr: "$1,329,760.00",
    },
    {
        id: "industrial",
        label: "Industrial",
        zone: "Zona Sur (Local)",
        steps: [
            { icon: Building2, question: "Uso del inmueble:", options: ["Vivienda Unifamiliar", "Plaza Comercial", "Nave Industrial"], answer: "Nave Industrial" },
            { icon: Mountain, question: "Topografía del terreno:", options: ["Terreno Plano", "Pendiente Leve", "Accidentado / Rocoso"], answer: "Pendiente Leve" },
            { icon: Layers, question: "Tipo de cimentación:", options: ["Zapatas Aisladas", "Losa de Cimentación", "Pilotes Profundos"], answer: "Losa de Cimentación" },
        ],
        concepts: [
            { clave: "TC.01", desc: "Corte y terraplén compactado al 90% Proctor", unit: "m³", pu: "$145.00", qty: "1,280.00", total: "$185,600.00" },
            { clave: "TC.02", desc: "Subrasante con material seleccionado", unit: "m²", pu: "$62.00", qty: "2,400.00", total: "$148,800.00" },
            { clave: "LS.01", desc: "Losa de cimentación e=20 cm, f'c=250 kg/cm²", unit: "m³", pu: "$3,680.00", qty: "480.00", total: "$1,766,400.00" },
            { clave: "LS.02", desc: "Malla electrosoldada 6×6-6/6 en losa", unit: "m²", pu: "$185.00", qty: "2,400.00", total: "$444,000.00" },
        ],
        totalStr: "$2,544,800.00",
    },
];

// ── ANIMATION VARIANTS ───────────────────────────────────────────
const slideLeft: Variants = {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 52, damping: 18 } },
};
const slideRight: Variants = {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 52, damping: 18 } },
};
const panelFade: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, type: "tween" as const } },
    exit: { opacity: 0, transition: { duration: PHASE_FADE / 1000, type: "tween" as const } },
};
const tableStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const tableRow: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "tween" as const, ease: "easeOut", duration: 0.35 } },
};
const featureList: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.45 } },
};
const featureItem: Variants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { type: "tween" as const, ease: "easeOut", duration: 0.4 } },
};

// ── COPY ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: Check,
        title: "Configuración guiada",
        body: "No hay que adivinar. Elige entre opciones predefinidas —tipo de obra, topografía, cimentación— y el sistema estructura todas las partidas necesarias automáticamente.",
    },
    {
        icon: MapPin,
        title: "Inteligencia de precios local",
        body: "Nada de plantillas muertas. El sistema revisa el mercado de tu zona para ofrecerte un Análisis de Precios Unitarios realista y certero.",
    },
    {
        icon: Pencil,
        title: "100% Editable y tuyo",
        body: "El catálogo generado no está bloqueado. Añade partidas, edita precios y ajusta rendimientos en una interfaz limpia —sin perderte en celdas de Excel.",
    },
] as const;

// ── QUESTION STEP SUB-COMPONENT ──────────────────────────────────
function QuestionStep({
    stepIndex,
    totalSteps,
    scenario,
    currentStep,
    clickingAnswer,
}: {
    stepIndex: number;
    totalSteps: number;
    scenario: Scenario;
    currentStep: number;
    clickingAnswer: boolean;
}) {
    const step = scenario.steps[stepIndex];

    return (
        <motion.div
            key={`${scenario.id}-step-${stepIndex}`}
            variants={panelFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-4 p-5"
        >
            {/* Progress */}
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{
                            background: i <= stepIndex ? ACCENT : "rgba(255,255,255,0.08)",
                            opacity: i < stepIndex ? 0.45 : 1,
                        }}
                    />
                ))}
                <span className="ml-1 shrink-0 text-[10px] text-white/25">
                    {stepIndex + 1}/{totalSteps}
                </span>
            </div>

            {/* Answered previous steps — collapsed */}
            {Array.from({ length: stepIndex }).map((_, i) => {
                const prev = scenario.steps[i];
                return (
                    <div key={i} className="flex items-center gap-2">
                        <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px]"
                            style={{ background: `${ACCENT}20`, color: ACCENT }}
                        >✓</span>
                        <span className="text-[10px] text-white/30">{prev.question}</span>
                        <span
                            className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                            style={{ background: `${ACCENT}18`, color: `${ACCENT}BB` }}
                        >
                            {prev.answer}
                        </span>
                    </div>
                );
            })}

            {/* Separator if there are previous steps */}
            {stepIndex > 0 && <div className="h-px bg-white/5" />}

            {/* Active question */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    {/* Step icon */}
                    {step.icon && (() => {
                        const StepIcon = step.icon as ElementType;
                        return (
                            <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}28` }}
                            >
                                <StepIcon size={14} style={{ color: `${ACCENT}BB` }} strokeWidth={1.8} />
                            </span>
                        );
                    })()}
                    <p className="text-sm font-semibold text-white/80">{step.question}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {step.options.map((opt) => {
                        const isAnswer = opt === step.answer;
                        const isClicked = isAnswer && clickingAnswer;
                        return (
                            <motion.span
                                key={opt}
                                animate={isClicked ? { scale: [1, 0.93, 1.05, 1] } : { scale: 1 }}
                                transition={{ duration: 0.32, type: "tween" as const }}
                                className="cursor-default rounded-full border px-3 py-1 text-[11px] font-medium select-none"
                                style={
                                    isClicked
                                        ? { background: `${ACCENT}20`, borderColor: `${ACCENT}55`, color: ACCENT }
                                        : { background: "transparent", borderColor: "rgba(255,255,255,0.11)", color: "rgba(255,255,255,0.45)" }
                                }
                            >
                                {opt}
                            </motion.span>
                        );
                    })}
                </div>
                {!clickingAnswer && (
                    <motion.p
                        animate={{ opacity: [0.25, 0.6, 0.25] }}
                        transition={{ repeat: Infinity, duration: 2, type: "tween" as const }}
                        className="text-[10px] text-white/25"
                    >
                        Selecciona una opción...
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
}

// ── RESULT TABLE SUB-COMPONENT ───────────────────────────────────
function ResultTable({ scenario }: { scenario: Scenario }) {
    return (
        <motion.div
            key={`${scenario.id}-table`}
            variants={panelFade}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Pricing badge */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
                <span className="text-[10px] text-white/30">
                    Catálogo · {scenario.label}
                </span>
                <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: `${ACCENT}12`, color: `${ACCENT}CC`, border: `1px solid ${ACCENT}28` }}
                >
                    <MapPin size={9} />
                    {scenario.zone}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Clave", "Descripción", "Unidad", "P.U.", "Cant.", "Importe"].map((h) => (
                                <th key={h} className="px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-white/20">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <motion.tbody variants={tableStagger} initial="hidden" animate="visible">
                        {scenario.concepts.map((row) => (
                            <motion.tr key={row.clave} variants={tableRow} className="border-b border-white/4">
                                <td className="px-3 py-2.5">
                                    <span className="font-mono text-[10px] font-semibold" style={{ color: `${ACCENT}90` }}>
                                        {row.clave}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 text-[10px] leading-snug text-white/60 max-w-[170px]">{row.desc}</td>
                                <td className="px-3 py-2.5 text-center text-[10px] text-white/30">{row.unit}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-[10px] text-white/50">{row.pu}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-[10px] text-white/30">{row.qty}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-[10px] font-semibold text-white/80">{row.total}</td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
                <span className="text-[10px] text-white/25">4 conceptos · generado en 2.4 s</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/35">Total estimado:</span>
                    <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>
                        {scenario.totalStr}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ── STATE MACHINE TYPES ──────────────────────────────────────────
type Phase =
    | { kind: "step"; stepIndex: number; clicking: boolean }
    | { kind: "table" };

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function SmartConceptsSection() {
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>({ kind: "step", stepIndex: 0, clicking: false });
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    const schedule = (fn: () => void, delay: number) => {
        const id = setTimeout(fn, delay);
        timers.current.push(id);
        return id;
    };

    const runScenario = (sIdx: number) => {
        const scenario = SCENARIOS[sIdx];
        const totalSteps = scenario.steps.length;

        // Advance through each step
        const runStep = (stepIndex: number) => {
            setPhase({ kind: "step", stepIndex, clicking: false });

            // After STEP_READ ms — trigger simulated click
            schedule(() => {
                setPhase({ kind: "step", stepIndex, clicking: true });

                // After click animation — go to next step or table
                schedule(() => {
                    if (stepIndex + 1 < totalSteps) {
                        runStep(stepIndex + 1);
                    } else {
                        // All steps answered — show result table
                        schedule(() => {
                            setPhase({ kind: "table" });

                            // After TABLE_SHOW ms — advance to next scenario
                            schedule(() => {
                                const nextIdx = (sIdx + 1) % SCENARIOS.length;
                                setScenarioIndex(nextIdx);
                                runScenario(nextIdx);
                            }, TABLE_SHOW);
                        }, STEP_GAP);
                    }
                }, CLICK_HOLD);
            }, STEP_READ);
        };

        runStep(0);
    };

    useEffect(() => {
        clearTimers();
        runScenario(0);
        return clearTimers;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scenario = SCENARIOS[scenarioIndex];

    return (
        <section
            id="smart-concepts"
            className="relative w-full border-t border-white/5 bg-[#050505]"
            style={{ height: "130vh" }}
        >
            {/* ── STICKY WRAPPER ── */}
            <div className="sticky top-0 w-full h-screen flex flex-col justify-center pt-[120px] pb-10 overflow-hidden">
                {/* ── ATMOSPHERIC LAYER 1: Multi-zone emerald focal glow ── */}
                <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(ellipse 50% 55% at 28% 50%, rgba(0,210,106,0.06) 0%, transparent 65%),
                            radial-gradient(ellipse 30% 35% at 28% 50%, rgba(0,210,106,0.035) 0%, transparent 45%),
                            radial-gradient(ellipse 55% 40% at 72% 45%, rgba(0,210,106,0.025) 0%, transparent 55%),
                            radial-gradient(ellipse 100% 45% at 50% 100%, rgba(0,210,106,0.015) 0%, transparent 40%)
                        `,
                    }}
                />

                {/* ── ATMOSPHERIC LAYER 2: Trend curves + data grid (SVG) ── */}
                <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Data dot grid — calculation matrix */}
                    {Array.from({ length: 16 }, (_, row) =>
                        Array.from({ length: 20 }, (_, col) => (
                            <circle
                                key={`gd-${row}-${col}`}
                                cx={50 + col * 48}
                                cy={50 + row * 58}
                                r={0.5}
                                fill="#00D26A"
                                opacity={0.06}
                            />
                        ))
                    )}

                    {/* Optimization trend curves — ascending Bézier lines */}
                    {[
                        { d: "M0,850 C150,820 300,780 450,720 S700,600 850,520 S950,460 1000,430", c: "rgba(0,210,106,0.07)", w: 0.7 },
                        { d: "M0,900 C200,870 400,800 550,730 S750,620 900,540 S980,480 1000,460", c: "rgba(0,210,106,0.05)", w: 0.5 },
                        { d: "M0,780 C100,760 250,700 400,650 S600,550 750,480 S900,400 1000,360", c: "rgba(0,210,106,0.06)", w: 0.6 },
                        { d: "M0,700 C180,680 350,640 500,580 S680,500 800,420 S920,350 1000,310", c: "rgba(0,210,106,0.04)", w: 0.5 },
                        { d: "M0,600 C120,590 280,560 420,510 S600,440 740,370 S880,300 1000,260", c: "rgba(0,210,106,0.05)", w: 0.6 },
                        { d: "M0,500 C200,480 380,440 520,380 S680,310 800,250 S920,200 1000,180", c: "rgba(0,210,106,0.035)", w: 0.4 },
                        /* Descending cost curves — showing savings */
                        { d: "M0,200 C200,220 400,280 550,350 S700,440 850,520 S950,580 1000,620", c: "rgba(0,210,106,0.03)", w: 0.4 },
                        { d: "M0,150 C150,180 350,250 500,330 S700,410 850,490 S960,550 1000,580", c: "rgba(0,210,106,0.025)", w: 0.3 },
                    ].map((p, i) => (
                        <path
                            key={`trend${i}`}
                            d={p.d}
                            fill="none"
                            stroke={p.c}
                            strokeWidth={p.w}
                        />
                    ))}

                    {/* Static milestone nodes on the trend curves */}
                    {[
                        { cx: 150, cy: 820 }, { cx: 450, cy: 720 }, { cx: 700, cy: 600 }, { cx: 950, cy: 460 },
                        { cx: 100, cy: 760 }, { cx: 400, cy: 650 }, { cx: 750, cy: 480 },
                        { cx: 200, cy: 480 }, { cx: 520, cy: 380 }, { cx: 800, cy: 250 },
                        { cx: 280, cy: 560 }, { cx: 600, cy: 440 }, { cx: 880, cy: 300 },
                    ].map((n, i) => (
                        <circle key={`mn${i}`} cx={n.cx} cy={n.cy} r={1} fill="#00D26A" opacity={0.15} />
                    ))}

                    {/* Price comparison markers — horizontal dashed reference lines */}
                    {[350, 500, 650].map((y, i) => (
                        <line
                            key={`ref${i}`}
                            x1={50} y1={y} x2={950} y2={y}
                            stroke="#00D26A"
                            strokeOpacity={0.025}
                            strokeWidth={0.4}
                            strokeDasharray="6 10"
                        />
                    ))}
                </svg>

                {/* ── Data-flow particles on trend curves (SVG animateMotion) ── */}
                <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {[
                        { path: "M0,850 C150,820 300,780 450,720 S700,600 850,520 S950,460 1000,430", c: "#00D26A", dur: "10s", delay: "0s" },
                        { path: "M0,780 C100,760 250,700 400,650 S600,550 750,480 S900,400 1000,360", c: "#00D26A", dur: "12s", delay: "2s" },
                        { path: "M0,600 C120,590 280,560 420,510 S600,440 740,370 S880,300 1000,260", c: "#00D26A", dur: "14s", delay: "1s" },
                        { path: "M0,500 C200,480 380,440 520,380 S680,310 800,250 S920,200 1000,180", c: "#00D26A", dur: "11s", delay: "3s" },
                        { path: "M0,900 C200,870 400,800 550,730 S750,620 900,540 S980,480 1000,460", c: "#00D26A", dur: "13s", delay: "1.5s" },
                        { path: "M0,700 C180,680 350,640 500,580 S680,500 800,420 S920,350 1000,310", c: "#00D26A", dur: "15s", delay: "4s" },
                    ].map((m, i) => (
                        <g key={`flow${i}`}>
                            <circle r="2" fill={m.c} opacity="0">
                                <animateMotion dur={m.dur} begin={m.delay} repeatCount="indefinite" path={m.path} />
                                <animate attributeName="opacity" values="0;0.4;0.4;0" dur={m.dur} begin={m.delay} repeatCount="indefinite" />
                            </circle>
                            <circle r="6" fill={m.c} opacity="0" style={{ filter: "blur(3px)" }}>
                                <animateMotion dur={m.dur} begin={m.delay} repeatCount="indefinite" path={m.path} />
                                <animate attributeName="opacity" values="0;0.12;0.12;0" dur={m.dur} begin={m.delay} repeatCount="indefinite" />
                            </circle>
                        </g>
                    ))}
                </svg>

                {/* ── Floating emerald micro-particles ── */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    {[
                        { x: "8%", y: "20%", size: 2, dur: 24, dx: 35, dy: -18 },
                        { x: "78%", y: "15%", size: 1.8, dur: 28, dx: -25, dy: 20 },
                        { x: "90%", y: "70%", size: 2.2, dur: 22, dx: -22, dy: -25 },
                        { x: "18%", y: "78%", size: 1.5, dur: 30, dx: 30, dy: -12 },
                        { x: "42%", y: "5%", size: 1.6, dur: 26, dx: -15, dy: 28 },
                        { x: "55%", y: "92%", size: 1.5, dur: 25, dx: 20, dy: -22 },
                        { x: "32%", y: "45%", size: 1.4, dur: 32, dx: -20, dy: 18 },
                        { x: "68%", y: "38%", size: 1.8, dur: 27, dx: 18, dy: -20 },
                    ].map((p, i) => (
                        <motion.div
                            key={`ep${i}`}
                            className="absolute rounded-full"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                background: "#00D26A",
                                boxShadow: "0 0 8px #00D26A",
                            }}
                            animate={{
                                x: [0, p.dx, 0],
                                y: [0, p.dy, 0],
                                opacity: [0.08, 0.3, 0.08],
                            }}
                            transition={{
                                duration: p.dur,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2 lg:gap-16 lg:px-12">

                    {/* ── LEFT: Animated Mockup ─────────────────────────────── */}
                    <motion.div
                        variants={slideLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="w-full"
                    >
                        <div
                            className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d]"
                            style={{
                                boxShadow: "0 0 60px rgba(0,210,106,0.07), 0 24px 56px rgba(0,0,0,0.7)",
                                minHeight: 320,
                            }}
                        >
                            {/* Window chrome */}
                            <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                                </div>
                                <span className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                                    {phase.kind === "table" ? "Catálogo Generado" : "Asistente de Proyecto · IA"}
                                </span>
                                {/* Scenario badge */}
                                <span
                                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                                    style={{ background: `${ACCENT}14`, color: `${ACCENT}90` }}
                                >
                                    {scenario.label}
                                </span>
                            </div>

                            {/* Phase content with AnimatePresence */}
                            <AnimatePresence mode="wait">
                                {phase.kind === "step" ? (
                                    <QuestionStep
                                        key={`${scenarioIndex}-${phase.stepIndex}`}
                                        stepIndex={phase.stepIndex}
                                        totalSteps={scenario.steps.length}
                                        scenario={scenario}
                                        currentStep={phase.stepIndex}
                                        clickingAnswer={phase.clicking}
                                    />
                                ) : (
                                    <ResultTable
                                        key={`${scenarioIndex}-table`}
                                        scenario={scenario}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <p className="mt-2 text-[10px] text-white/20 px-1">
                            3 preguntas → catálogo completo generado en segundos
                        </p>
                    </motion.div>

                    {/* ── RIGHT: Copy ───────────────────────────────────────── */}
                    <motion.div
                        variants={slideRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Module label */}
                        <div className="inline-flex items-center gap-2.5">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
                            />
                            <span
                                className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                                style={{ color: `${ACCENT}88` }}
                            >
                                Smart Concepts
                            </span>
                        </div>

                        {/* Headline */}
                        <div>
                            <h2
                                className="font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/92 sm:text-4xl lg:text-5xl"
                                style={{ textShadow: "0 0 60px rgba(0,210,106,0.09), 0 4px 40px rgba(0,0,0,0.95)" }}
                            >
                                De cero a<br />
                                un presupuesto{" "}
                                <span style={{ color: ACCENT }}>exacto</span><br />
                                en minutos.
                            </h2>
                            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/40">
                                Ya sea que subas tu catálogo en PDF o dejes que nuestra Inteligencia Artificial lo cree desde cero,{" "}
                                <span className="text-white/60 font-medium">
                                    seleccionando las características de tu proyecto con un clic.
                                </span>
                            </p>
                        </div>

                        {/* Features */}
                        <motion.ul
                            variants={featureList}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            className="flex flex-col gap-4"
                        >
                            {FEATURES.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <motion.li
                                        key={f.title}
                                        variants={featureItem}
                                        className="flex items-start gap-4"
                                    >
                                        <span
                                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                                            style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}35` }}
                                        >
                                            <Icon size={12} style={{ color: ACCENT }} strokeWidth={2.5} />
                                        </span>
                                        <div>
                                            <p className="text-[13px] font-semibold text-white/80">{f.title}</p>
                                            <p className="mt-0.5 text-[12px] leading-relaxed text-white/35">{f.body}</p>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </motion.ul>

                        {/* CTA */}
                        <a
                            href="#bitacora"
                            className="group inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors"
                            style={{ color: `${ACCENT}60` }}
                        >
                            Ver siguiente módulo
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </a>
                    </motion.div>


                </div>

            </div> {/* End Sticky Wrapper */}
        </section>
    );
}
