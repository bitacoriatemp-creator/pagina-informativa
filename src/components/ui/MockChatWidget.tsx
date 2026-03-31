"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Paperclip, FileText, Send } from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ══════════════════════════════════════════════════════════════
   MockChatWidget — Extracted from BitacoraSection (Sprint 4.3)
   Handles the 4-scenario animated chat simulation loop.
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
            { role: "user", text: "Subiendo reporte del colado de zapatas en el Eje 3. Concreto f'c=250.", isPhoto: true, photoSrc: assetPath("/images/colado_eje3.webp") },
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
            { role: "user", text: "Se detiene la obra por lluvia intensa. Imposible continuar.", isPhoto: true, photoSrc: assetPath("/images/clima_lluvioso.webp") },
            { role: "ai", thinking: "Escaneando entorno y protocolos...", text: "Incidencia climática registrada. ⚠️ ALERTA DE SEGURIDAD: He detectado en la imagen a un trabajador sin casco. Sugiero notificar al supervisor de inmediato." },
            { role: "user", text: "Enterado, notificando al residente. El colado se pasa para mañana." },
            { role: "ai", thinking: "Recalculando rutas críticas...", text: "Cronograma actualizado con 1 día de desfase y alerta guardada en el reporte HSE." },
        ]
    },
    {
        title: "Control de Material",
        steps: [
            { role: "user", text: "Llegó el camión con el pedido de cemento.", isPhoto: true, photoSrc: assetPath("/images/camion_llegando.webp") },
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

/**
 * MockChatWidget renders the auto-playing chat simulation
 * with scenario label, messages area, and fake input bar.
 */
export default function MockChatWidget() {
    const [visibleMsgs, setVisibleMsgs] = useState<Msg[]>([]);
    const [inputText, setInputText] = useState("");
    const [currentScenarioLabel, setCurrentScenarioLabel] = useState("");
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
                await sleep(25 + Math.random() * 30);
            }
            if (isActive) await sleep(400);
        };

        const runAnimationLoop = async () => {
            while (isActive) {
                for (let sIdx = 0; sIdx < SCENARIOS_DATA.length; sIdx++) {
                    if (!isActive) break;
                    const scenario = SCENARIOS_DATA[sIdx];
                    setCurrentScenarioLabel(scenario.title);
                    setVisibleMsgs([]);
                    setInputText("");
                    await sleep(1000);

                    for (let stepIdx = 0; stepIdx < 4; stepIdx++) {
                        if (!isActive) break;
                        const action = scenario.steps[stepIdx];

                        if (action.role === "user") {
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
                            setVisibleMsgs((prev) => [...prev, {
                                id: `s${sIdx}-t${stepIdx}`,
                                role: "thinking",
                                thinkingLabel: action.thinking
                            }]);
                            await sleep(2000);
                            if (!isActive) break;
                            setVisibleMsgs((prev) => [
                                ...prev.filter(m => m.role !== "thinking"),
                                { id: `s${sIdx}-a${stepIdx}`, role: "ai", text: action.text }
                            ]);
                        }
                        await sleep(1500);
                    }
                    if (isActive) await sleep(5000);
                }
            }
        };

        runAnimationLoop();
        return () => { isActive = false; };
    }, []);

    return (
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
    );
}
