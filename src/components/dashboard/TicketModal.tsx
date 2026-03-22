"use client";

import React, { useState } from "react";
import { X, SendHorizontal, Paperclip, MessageSquareText } from "lucide-react";
import { useThemeVars } from "@/hooks/useThemeVars";
import { useDashboard } from "@/context/DashboardContext";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TicketModal({ isOpen, onClose }: TicketModalProps) {
    const { isDark, cardBg, cardBorder, textClass, textMuted } = useThemeVars();
    const { addNotification } = useDashboard();
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("obra");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            addNotification("Actualización de Estado", `Tu ticket "${subject}" ha sido registrado.`, "info");
            setTimeout(() => {
                setIsSuccess(false);
                setSubject("");
                setDescription("");
                onClose();
            }, 2500);
        }, 1500);
    };

    const inputClasses = `w-full bg-transparent border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-xl px-4 py-3 ${textClass} placeholder:${textMuted} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767]/50 transition-all`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`w-full max-w-lg rounded-3xl border ${cardBorder} shadow-2xl relative z-10 overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}
                style={{
                    animation: 'modalFadeIn 0.3s ease-out forwards',
                }}
            >
                {/* Header */}
                <div className={`px-6 py-5 border-b ${isDark ? 'border-white/5' : 'border-black/5'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'} text-[#C39767]`}>
                            <MessageSquareText size={20} />
                        </div>
                        <div>
                            <h3 className={`font-display font-bold text-lg ${textClass} leading-tight`}>
                                Soporte Técnico
                            </h3>
                            <p className={`text-xs ${textMuted}`}>Crear nuevo ticket</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:${isDark ? 'bg-white/10' : 'bg-black/5'} transition-colors ${textMuted}`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6">
                            <SendHorizontal size={32} />
                        </div>
                        <h4 className={`text-2xl font-bold ${textClass} mb-2`}>Ticket Enviado</h4>
                        <p className={textMuted}>Nuestro equipo de ingenieros te contactará a la brevedad posible.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider ${textMuted} mb-2`}>
                                    Asunto
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Ej. Error al sincronizar modelo BIM L3"
                                    className={inputClasses}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider ${textMuted} mb-2`}>
                                    Categoría
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={`${inputClasses} appearance-none cursor-pointer`}
                                    disabled={isSubmitting}
                                >
                                    <option value="obra">Gestión de Obra en Campo</option>
                                    <option value="bim">Sincronización BIM</option>
                                    <option value="seguridad">Accesos y Contraseñas</option>
                                    <option value="facturacion">Planes y Facturación</option>
                                    <option value="otro">Otro problema técnico</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider ${textMuted} mb-2`}>
                                    Descripción Detallada
                                </label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe los pasos para reproducir el problema o la duda que tienes..."
                                    className={`${inputClasses} min-h-[120px] resize-none`}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className={`pt-6 border-t ${isDark ? 'border-white/5' : 'border-black/5'} flex items-center justify-between`}>
                            <button
                                type="button"
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${textMuted} hover:${textClass} transition-colors`}
                                disabled={isSubmitting}
                            >
                                <Paperclip size={18} />
                                <span>Adjuntar archivo</span>
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting || !subject.trim() || !description.trim()}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all ${
                                    isSubmitting || !subject.trim() || !description.trim()
                                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                    : 'bg-[#C39767] hover:bg-[#d4a878] hover:shadow-[#C39767]/20 hover:-translate-y-0.5'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>Procesando...</>
                                ) : (
                                    <>
                                        Enviar Ticket <SendHorizontal size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <style jsx>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
