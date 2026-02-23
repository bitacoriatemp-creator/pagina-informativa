"use client";

import { useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   QuienesSomosModal — Premium Dark Glassmorphism
   ──────────────────────────────────────────────────────────────
   Design tokens:
   · Overlay:    backdrop-blur-xl + bg-black/65
   · Container:  bg-[#111111], border bronze/20, rounded-2xl
   · Typography: font-sans (Kumbh Sans), wide line-height
   · Motion:     spring open, ease-out close via AnimatePresence
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "rgba(195,151,103,0.18)"; // 1px perimeter border
const BRONZE_HOVER = "rgba(195,151,103,0.45)";

interface QuienesSomosModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Framer Motion variants
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const panelVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.9 },
    },
    exit: {
        opacity: 0, scale: 0.97, y: 12,
        transition: { duration: 0.18, ease: "easeIn" as const },
    },
};

export default function QuienesSomosModal({ isOpen, onClose }: QuienesSomosModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: globalThis.KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                /* ── OVERLAY ── */
                <motion.div
                    key="quienes-overlay"
                    className="fixed inset-0 z-[200] flex items-center justify-center p-5"
                    style={{
                        backdropFilter: "blur(14px) saturate(0.8)",
                        WebkitBackdropFilter: "blur(14px) saturate(0.8)",
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                    }}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    // Click overlay → close
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                    aria-labelledby="quienes-title"
                >
                    {/* ── PANEL ── */}
                    <motion.div
                        className="relative w-full max-w-[540px] rounded-2xl p-8 sm:p-10"
                        style={{
                            backgroundColor: "#111111",
                            border: `1px solid ${BRONZE}`,
                            boxShadow:
                                "0 32px 80px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(195,151,103,0.08) inset",
                        }}
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        // Stop propagation so clicking inside doesn't close
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ── CLOSE BUTTON ── */}
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="group absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        >
                            <X
                                size={14}
                                className="text-white/40 transition-colors duration-150 group-hover:text-white/80"
                                strokeWidth={2}
                            />
                        </button>

                        {/* ── EYEBROW ── */}
                        <div className="mb-5 inline-flex items-center gap-2">
                            <span
                                className="h-[5px] w-[5px] rounded-full"
                                style={{ backgroundColor: "#c39767", boxShadow: "0 0 6px #c39767" }}
                            />
                            <span
                                className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                                style={{ color: "rgba(195,151,103,0.6)" }}
                            >
                                BitacorIA
                            </span>
                        </div>

                        {/* ── TITLE ── */}
                        <h2
                            id="quienes-title"
                            className="mb-5 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-white/92 sm:text-3xl"
                        >
                            El equipo detrás<br />
                            <span style={{ color: "#c39767" }}>de BitacorIA.</span>
                        </h2>

                        {/* ── DIVIDER ── */}
                        <div
                            className="mb-6 h-px w-12"
                            style={{ background: "linear-gradient(to right, rgba(195,151,103,0.5), transparent)" }}
                        />

                        {/* ── BODY ── */}
                        <p
                            className="font-sans text-[15px] leading-[1.85] text-white/50"
                            style={{ fontVariantNumeric: "oldstyle-nums" }}
                        >
                            Somos una startup fundada por tres ingenieros apasionados por
                            transformar la industria de la construcción. Al conocer de primera
                            mano los cuellos de botella y el caos administrativo en campo,
                            unimos nuestra experiencia en ingeniería y desarrollo de software
                            para crear la solución.
                        </p>
                        <p className="mt-4 font-sans text-[15px] leading-[1.85] text-white/50">
                            Nuestro objetivo es claro:{" "}
                            <span className="font-semibold text-white/72">
                                democratizar el uso de la Inteligencia Artificial en la obra
                            </span>{" "}
                            para automatizar la gestión, mitigar errores y devolverte el
                            control total de tus proyectos.
                        </p>

                        {/* ── FOOTER ROW ── */}
                        <div
                            className="mt-8 flex items-center justify-between border-t pt-5"
                            style={{ borderColor: "rgba(255,255,255,0.06)" }}
                        >
                            <span className="text-[11px] text-white/22">
                                Monterrey, México · 2026
                            </span>
                            <button
                                onClick={onClose}
                                className="rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all duration-150"
                                style={{
                                    backgroundColor: "rgba(195,151,103,0.08)",
                                    border: "1px solid rgba(195,151,103,0.25)",
                                    color: "rgba(195,151,103,0.75)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(195,151,103,0.14)";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = BRONZE_HOVER;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(195,151,103,0.08)";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(195,151,103,0.25)";
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
