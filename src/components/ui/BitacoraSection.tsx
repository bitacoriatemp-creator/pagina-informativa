"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { MessageSquare, Paperclip, FileText, Send } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   BitacoraSection — SPLIT LAYOUT + 4 SCENARIOS (Bulletproof V3)
   ──────────────────────────────────────────────────────────────
   Layout:   2-column split. Left = Copy+Features, Right = Chat
   Container: h-screen, scroll-locked.
   Scenarios: Loop of 4 independent chats.
   Scroll:   Strict internal container scroll (`scrollTop`).
   ══════════════════════════════════════════════════════════════ */

const ACCENT = "#C4A484";

type MsgRole = "user" | "ai" | "thinking";

interface Msg {
    id: string;
    role: MsgRole;
    text?: string;
    thinkingLabel?: string;
    isPhoto?: boolean;
    photoSrc?: string;
    isPdf?: boolean;
    pdfName?: string;
    pdfSize?: string;
}

// ── SCENARIOS CONSTANTS ──
const SCENARIOS_DATA = [
    {
        title: "Reporte de Avance",
        steps: [
            { role: "user", text: "Subiendo reporte del colado de zapatas en el Eje 3. Concreto f'c=250.", isPhoto: true, photoSrc: "/plataforma/images/COLADO_EJE3.webp" },
            { role: "ai", thinking: "Procesando imagen...", text: "Avance de obra registrado en la bitácora electrónica. Volúmenes descontados del inventario y estimación actualizada. ¿Todo en orden?" },
            { role: "user", text: "Sí, todo sin problemas." },
            { role: "ai", thinking: "Actualizando bitácora...", text: "Perfecto. Bitácora actualizada." },
        ]
    },
    {
        title: "Duda en Planos",
        steps: [
            { role: "user", text: "Revisa este plano estructural, por favor.", isPdf: true, pdfName: "Plano_Estructural_RevB.pdf", pdfSize: "4.2 MB" },
            { role: "ai", thinking: "Analizando plano estructural...", text: "Analizando plano... La especificación para esa zona marca varilla de 3/4''. He cruzado el dato con tu catálogo." },
            { role: "user", text: "Anota en bitácora que se autoriza el armado según el plano." },
            { role: "ai", thinking: "Generando apunte oficial...", text: "Nota generada y lista para tu firma electrónica." },
        ]
    },
    {
        title: "Seguridad y Clima",
        steps: [
            { role: "user", text: "Se detiene la obra por lluvia intensa. Imposible continuar.", isPhoto: true, photoSrc: "/plataforma/images/CLIMA_LLUVIOSO.webp" },
            { role: "ai", thinking: "Escaneando entorno y protocolos...", text: "Incidencia climática registrada. ⚠️ ALERTA DE SEGURIDAD: He detectado en la imagen a un trabajador sin casco. Sugiero notificar al supervisor de inmediato." },
            { role: "user", text: "Enterado, notificando al residente. El colado se pasa para mañana." },
            { role: "ai", thinking: "Recalculando rutas críticas...", text: "Cronograma actualizado con 1 día de desfase y alerta guardada en el reporte HSE." },
        ]
    },
    {
        title: "Control de Material",
        steps: [
            { role: "user", text: "Llegó el camión con el pedido de cemento.", isPhoto: true, photoSrc: "/plataforma/images/Camion_llegando.webp" },
            { role: "ai", thinking: "Extrayendo datos de remisión...", text: "Descarga detectada. ¿Me confirmas si la remisión ampara las 5 toneladas programadas para hoy?" },
            { role: "user", text: "Es correcto, son 100 bultos." },
            { role: "ai", thinking: "Compilando sumatorias...", text: "Excelente. 5 toneladas agregadas al inventario y reporte financiero actualizado." },
        ]
    }
] as const;


// ── ANIMATION VARIANTS ──
const bubblePop: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 15 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
};
const slideLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const slideRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50, damping: 18 } },
};
const featureStagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const featureItem: Variants = {
    hidden: { opacity: 0, x: -14 },
    visible: { opacity: 1, x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.3 } },
};

// ── SUB-COMPONENTS ──
function AIAvatar() {
    return (
        <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}35` }}
        >
            B
        </div>
    );
}

function ThinkingBubble({ label }: { label: string }) {
    return (
        <motion.div
            key="thinking"
            variants={bubblePop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex items-start gap-3"
        >
            <AIAvatar />
            <div
                className="max-w-[76%] rounded-2xl rounded-tl-sm px-4 py-3"
                style={{ background: "#1c1a18", border: "1px solid rgba(255,255,255,0.06)" }}
            >
                <p className="mb-2 text-[11px]" style={{ color: `${ACCENT}75` }}>{label}</p>
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: ACCENT }}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                            transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.2, ease: "easeInOut" }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function ChatBubble({ msg }: { msg: Msg }) {
    if (msg.role === "thinking") {
        return <ThinkingBubble label={msg.thinkingLabel ?? "..."} />;
    }

    const isUser = msg.role === "user";

    return (
        <motion.div
            variants={bubblePop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
            {!isUser && <AIAvatar />}
            <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 flex flex-col ${isUser ? "rounded-br-sm bg-[#242018]" : "rounded-bl-sm bg-[#1c1a18]"}`}
                style={{ border: isUser ? "1px solid rgba(255,255,255,0.09)" : "1px solid rgba(255,255,255,0.06)" }}
            >
                {msg.isPhoto && msg.photoSrc && (
                    <div className="relative mb-1.5 mt-1 h-28 w-full max-w-[160px] overflow-hidden rounded-lg border border-white/10 shrink-0 self-end">
                        <Image src={msg.photoSrc} alt="Adjunto" fill className="object-cover" sizes="(max-width: 768px) 100vw, 240px" />
                    </div>
                )}

                {msg.isPdf && (
                    <div className="flex items-center gap-3 rounded-lg p-2.5 mt-1 mb-1 w-56 self-end" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-500/15">
                            <FileText size={18} className="text-red-400" strokeWidth={1.8} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-medium text-white/85 truncate">{msg.pdfName ?? "Documento.pdf"}</span>
                            <span className="text-[10px] text-white/40">PDF • {msg.pdfSize ?? "—"}</span>
                        </div>
                    </div>
                )}

                {msg.text && (
                    <p className={`text-[12px] leading-relaxed ${(msg.isPhoto || msg.isPdf) ? "mt-1" : ""} ${msg.text.includes("⚠️") ? "text-amber-100/90 font-medium" : isUser ? "text-white/85" : "text-white/70"}`}>
                        {msg.text}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

const FEATURES = [
    { Icon: MessageSquare, title: "Habla con tu obra", body: "Escribe o dicta desde campo. La IA redacta el registro técnico por ti al instante." },
    { Icon: Paperclip, title: "Análisis multimodal", body: "Sube fotos o PDFs. El sistema entiende estimaciones y planos automáticamente." },
    { Icon: FileText, title: "Reportes en un clic", body: "Exporta resúmenes diarios estructurados y listos para firma electrónica." },
];

export default function BitacoraSection() {
    const [visibleMsgs, setVisibleMsgs] = useState<Msg[]>([]);
    const [inputText, setInputText] = useState("");
    const [currentScenarioLabel, setCurrentScenarioLabel] = useState("");

    // Strict internal scroll ref (never scrolls window)
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [visibleMsgs, inputText]);

    // ── ANIMATION ENGINE (4 SCENARIOS) ──
    useEffect(() => {
        let isActive = true;

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

        const typeString = async (text: string) => {
            for (let i = 1; i <= text.length; i++) {
                if (!isActive) break;
                setInputText(text.slice(0, i));
                await sleep(25 + Math.random() * 30); // Faster typing cadence
            }
            if (isActive) await sleep(400); // slight human pause before send
        };

        const runAnimationLoop = async () => {
            while (isActive) {
                // Loop through the 4 scenarios
                for (let sIdx = 0; sIdx < SCENARIOS_DATA.length; sIdx++) {
                    if (!isActive) break;

                    const scenario = SCENARIOS_DATA[sIdx];
                    setCurrentScenarioLabel(scenario.title);
                    setVisibleMsgs([]); // Clean slate for new scenario
                    setInputText("");

                    await sleep(1000); // Initial pause on empty chat

                    // Loop through the 4 steps of the current scenario
                    for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
                        if (!isActive) break;
                        const action = scenario.steps[stepIdx];

                        if (action.role === "user") {
                            // User typing + send
                            await typeString(action.text);
                            if (!isActive) break;

                            setInputText("");
                            setVisibleMsgs((prev) => [...prev, {
                                id: `s${sIdx}-u${stepIdx}`,
                                role: "user",
                                text: action.text,
                                isPhoto: "isPhoto" in action ? action.isPhoto : false,
                                photoSrc: "photoSrc" in action ? action.photoSrc : undefined,
                                isPdf: "isPdf" in action ? action.isPdf : false,
                                pdfName: "pdfName" in action ? action.pdfName : undefined,
                                pdfSize: "pdfSize" in action ? action.pdfSize : undefined
                            }]);
                        } else {
                            // AI thinking + reply
                            setVisibleMsgs((prev) => [...prev, {
                                id: `s${sIdx}-t${stepIdx}`,
                                role: "thinking",
                                thinkingLabel: action.thinking
                            }]);

                            await sleep(2000); // "Processing" time
                            if (!isActive) break;

                            setVisibleMsgs((prev) => [
                                ...prev.filter(m => m.role !== "thinking"),
                                {
                                    id: `s${sIdx}-a${stepIdx}`,
                                    role: "ai",
                                    text: action.text
                                }
                            ]);
                        }

                        // Pause between messages
                        await sleep(1500);
                    }

                    // End of scenario: Hold to read, then wipe
                    if (isActive) await sleep(5000);
                }
            }
        };

        runAnimationLoop();
        return () => { isActive = false; };
    }, []);

    return (
        <section
            id="bitacora"
            className="relative w-full border-t border-white/5 bg-[#080504]"
            style={{ height: "140vh" }}
        >
            {/* ── STICKY WRAPPER: anchors content while user scrolls through 140vh track ── */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">

                {/* ── ATMOSPHERIC LAYER 1: Multi-zone warm focal glow ── */}
                <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(ellipse 45% 50% at 50% 45%, rgba(196,164,132,0.055) 0%, transparent 65%),
                            radial-gradient(ellipse 30% 35% at 50% 45%, rgba(196,164,132,0.035) 0%, transparent 45%),
                            radial-gradient(ellipse 70% 35% at 20% 50%, rgba(180,130,80,0.018) 0%, transparent 55%),
                            radial-gradient(ellipse 70% 35% at 80% 50%, rgba(180,130,80,0.018) 0%, transparent 55%),
                            radial-gradient(ellipse 100% 40% at 50% 100%, rgba(196,164,132,0.015) 0%, transparent 40%)
                        `,
                    }}
                />

                {/* ── ATMOSPHERIC LAYER 2: Ledger dot-grid + hash fragments (SVG) ── */}
                <svg
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Dot grid — simulates milimetric ledger paper */}
                    {Array.from({ length: 20 }, (_, row) =>
                        Array.from({ length: 25 }, (_, col) => (
                            <circle
                                key={`dot-${row}-${col}`}
                                cx={40 + col * 38}
                                cy={40 + row * 48}
                                r={0.6}
                                fill="#C4A484"
                                opacity={0.08}
                            />
                        ))
                    )}

                    {/* Horizontal ruled lines — every 5th row, like a real ledger */}
                    {Array.from({ length: 4 }, (_, i) => (
                        <line
                            key={`rule-${i}`}
                            x1={30} y1={280 + i * 192}
                            x2={970} y2={280 + i * 192}
                            stroke="#C4A484"
                            strokeOpacity={0.04}
                            strokeWidth={0.4}
                        />
                    ))}

                    {/* Vertical margin line — left side like a traditional cuaderno */}
                    <line
                        x1={85} y1={20} x2={85} y2={980}
                        stroke="#C4A484"
                        strokeOpacity={0.05}
                        strokeWidth={0.5}
                        strokeDasharray="4 8"
                    />

                    {/* Hash fragments — tenue encryption text at peripheral zones */}
                    {[
                        { x: 30, y: 80, text: "a7f3e2b1" },
                        { x: 890, y: 120, text: "d4c8f901" },
                        { x: 40, y: 320, text: "b2e5a7c3" },
                        { x: 910, y: 380, text: "f8d1e6b4" },
                        { x: 25, y: 560, text: "c9a3f2d7" },
                        { x: 880, y: 620, text: "e1b4c8a5" },
                        { x: 35, y: 780, text: "d6f2b1e8" },
                        { x: 900, y: 840, text: "a3c7d4f9" },
                        { x: 30, y: 940, text: "f5e8b2c1" },
                        { x: 895, y: 950, text: "b1d3a6f7" },
                    ].map((h, i) => (
                        <text
                            key={`hash-${i}`}
                            x={h.x}
                            y={h.y}
                            fill="#C4A484"
                            opacity={0.04}
                            fontSize={8}
                            fontFamily="monospace"
                        >
                            {h.text}
                        </text>
                    ))}

                    {/* Security block outlines — abstract ledger blocks */}
                    {[
                        { x: 60, y: 150, w: 120, h: 60 },
                        { x: 820, y: 250, w: 130, h: 55 },
                        { x: 50, y: 450, w: 110, h: 50 },
                        { x: 840, y: 520, w: 115, h: 65 },
                        { x: 55, y: 700, w: 125, h: 55 },
                        { x: 830, y: 750, w: 120, h: 60 },
                    ].map((b, i) => (
                        <rect
                            key={`block-${i}`}
                            x={b.x} y={b.y}
                            width={b.w} height={b.h}
                            rx={3}
                            fill="none"
                            stroke="#C4A484"
                            strokeOpacity={0.03}
                            strokeWidth={0.5}
                        />
                    ))}

                    {/* Thin connection lines between security blocks */}
                    {[
                        { x1: 180, y1: 180, x2: 820, y2: 277 },
                        { x1: 160, y1: 475, x2: 840, y2: 552 },
                        { x1: 180, y1: 727, x2: 830, y2: 780 },
                    ].map((l, i) => (
                        <line
                            key={`bconn-${i}`}
                            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                            stroke="#C4A484"
                            strokeOpacity={0.025}
                            strokeWidth={0.4}
                            strokeDasharray="3 6"
                        />
                    ))}
                </svg>

                {/* ── Floating warm micro-particles ── */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    {[
                        { x: "12%", y: "18%", size: 2, color: "#C4A484", dur: 24, dx: 30, dy: -18 },
                        { x: "82%", y: "22%", size: 1.8, color: "#B48050", dur: 28, dx: -25, dy: 15 },
                        { x: "88%", y: "68%", size: 2.2, color: "#C4A484", dur: 22, dx: -20, dy: -22 },
                        { x: "15%", y: "75%", size: 1.5, color: "#B48050", dur: 30, dx: 35, dy: -12 },
                        { x: "50%", y: "6%", size: 1.6, color: "#C4A484", dur: 26, dx: -12, dy: 28 },
                        { x: "45%", y: "92%", size: 1.5, color: "#B48050", dur: 25, dx: 22, dy: -25 },
                        { x: "30%", y: "40%", size: 1.4, color: "#C4A484", dur: 32, dx: -18, dy: 20 },
                        { x: "72%", y: "45%", size: 1.8, color: "#B48050", dur: 27, dx: 15, dy: -18 },
                    ].map((p, i) => (
                        <motion.div
                            key={`lp${i}`}
                            className="absolute rounded-full"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                background: p.color,
                                boxShadow: `0 0 6px ${p.color}`,
                            }}
                            animate={{
                                x: [0, p.dx, 0],
                                y: [0, p.dy, 0],
                                opacity: [0.08, 0.28, 0.08],
                            }}
                            transition={{
                                duration: p.dur,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* ── SANDWICH LAYOUT (untouched internals) ── */}
                <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-6 px-6 max-w-7xl xl:px-12 -translate-y-12">

                    {/* ═══ BLOCK 1: TEXT (top) ═══ */}
                    <motion.div
                        variants={slideLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 text-center"
                    >
                        <div className="inline-flex items-center justify-center gap-2.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${ACCENT}88` }}>
                                Bitácora
                            </span>
                        </div>

                        <h2
                            className="font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/92 sm:text-5xl"
                            style={{ textShadow: `0 0 60px rgba(196,164,132,0.09), 0 4px 40px rgba(0,0,0,0.95)` }}
                        >
                            La bitácora<br /> que <span style={{ color: ACCENT }}>se escribe sola.</span>
                        </h2>

                        <p className="max-w-xl mx-auto text-sm leading-relaxed text-white/40 sm:text-base">
                            Tu asistente de obra disponible 24/7. Olvídate de llenar formatos a mano al final del día; chatea, adjunta fotos y deja que la IA organice tu bitácora.
                        </p>
                    </motion.div>

                    {/* ═══ BLOCK 2: 3-ZONE GRID (Features | Chat | Features) ═══ */}
                    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4">

                        {/* ── LEFT: Feature 1 ── */}
                        <motion.div
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="hidden lg:flex lg:col-span-3 flex-col items-end text-right gap-4"
                        >
                            {(() => {
                                const f = FEATURES[0];
                                return (
                                    <motion.div variants={featureItem} className="flex flex-col items-end gap-3 max-w-[280px]">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                            <f.Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                        </span>
                                        <div>
                                            <p className="text-[14px] font-semibold text-white/90">{f.title}</p>
                                            <p className="mt-1 text-[12px] leading-relaxed text-white/40">{f.body}</p>
                                        </div>
                                    </motion.div>
                                );
                            })()}
                        </motion.div>

                        {/* ── CENTER: Chat (untouched) ── */}
                        <motion.div
                            variants={slideRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            className="w-full lg:col-span-6 max-w-xl mx-auto"
                        >
                            <div
                                className="flex w-full flex-col overflow-hidden rounded-2xl border border-white/8"
                                style={{
                                    height: "350px",
                                    background: "#111111",
                                    boxShadow: `0 0 70px rgba(196,164,132,0.05), 0 28px 60px rgba(0,0,0,0.80)`,
                                }}
                            >
                                {/* Chrome bar */}
                                <div className="flex shrink-0 items-center justify-between border-b px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#141414" }}>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                                        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                                        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Bitácora del Proyecto</span>
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={currentScenarioLabel}
                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                className="text-[9px] text-[#C4A484]/70 tracking-wide mt-0.5"
                                            >
                                                {currentScenarioLabel}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    <div className="w-12"></div>
                                </div>

                                {/* Messages area */}
                                <div
                                    ref={chatContainerRef}
                                    className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 pb-6"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    <AnimatePresence>
                                        {visibleMsgs.map((msg) => (
                                            <ChatBubble key={msg.id} msg={msg} />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Input bar */}
                                <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#141414" }}>
                                    <div className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="flex flex-1 items-center gap-3">
                                            <Paperclip size={16} className="shrink-0 text-white/20" strokeWidth={1.8} />
                                            <span className="flex-1 select-none text-[12px] break-all" style={{ color: inputText ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)" }}>
                                                {inputText || "Escribe un mensaje o adjunta archivo..."}
                                                {inputText && (
                                                    <motion.span
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.8 }}
                                                        className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-[#C4A484]"
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform"
                                            style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}35`, transform: inputText ? "scale(1.05)" : "scale(1)" }}
                                        >
                                            <Send size={14} style={{ color: ACCENT }} strokeWidth={2} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── RIGHT: Features 2 & 3 ── */}
                        <motion.div
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="hidden lg:flex lg:col-span-3 flex-col items-start text-left gap-10"
                        >
                            {FEATURES.slice(1).map((f) => (
                                <motion.div key={f.title} variants={featureItem} className="flex flex-col items-start gap-3 max-w-[280px]">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                        <f.Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <p className="text-[14px] font-semibold text-white/90">{f.title}</p>
                                        <p className="mt-1 text-[12px] leading-relaxed text-white/40">{f.body}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ── MOBILE FALLBACK: all 3 features stacked ── */}
                        <motion.ul
                            variants={featureStagger}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="lg:hidden col-span-1 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-2"
                        >
                            {FEATURES.map(({ Icon, title, body }) => (
                                <motion.li key={title} variants={featureItem} className="flex flex-col items-start gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full mt-1" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}25` }}>
                                        <Icon size={18} style={{ color: ACCENT }} strokeWidth={2} />
                                    </span>
                                    <div>
                                        <p className="text-[15px] font-semibold text-white/90">{title}</p>
                                        <p className="mt-1 text-[13px] leading-relaxed text-white/40">{body}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </motion.ul>

                    </div>

                </div>
            </div>
        </section>
    );
}
