"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    projectId: string | null;
    projectTitle: string;
    onClose: () => void;
    onConfirm: (projectId: string) => void;
}

const DELETE_UNLOCK_SECONDS = 5;

export default function DeleteConfirmModal({
    isOpen,
    projectId,
    projectTitle,
    onClose,
    onConfirm
}: DeleteConfirmModalProps) {
    const [deleteCountdown, setDeleteCountdown] = useState(DELETE_UNLOCK_SECONDS);
    const deleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setDeleteCountdown(DELETE_UNLOCK_SECONDS);
            if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
            deleteIntervalRef.current = setInterval(() => {
                setDeleteCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(deleteIntervalRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
            setDeleteCountdown(DELETE_UNLOCK_SECONDS);
        }

        return () => {
            if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
        };
    }, [isOpen]);

    if (!isOpen || !projectId) return null;

    const handleConfirm = () => {
        if (deleteCountdown === 0) {
            onConfirm(projectId);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-red-500/25 rounded-2xl shadow-2xl shadow-red-900/20 flex flex-col overflow-hidden">

                {/* Red top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                        <Trash2 size={26} className="text-red-400" />
                    </div>
                    <h2 className="text-lg font-display font-semibold text-white mb-1">
                        ¿Eliminar esta obra?
                    </h2>
                    <p className="text-white/40 text-[12px] font-mono uppercase tracking-widest mb-5">
                        {projectTitle}
                    </p>

                    {/* Warning message */}
                    <div className="w-full bg-red-950/30 border border-red-500/15 rounded-xl p-4 text-left mb-5">
                        <div className="flex gap-3">
                            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                                <p className="text-red-300 text-[13px] font-medium">Esta acción es permanente e irreversible.</p>
                                <p className="text-white/40 text-[12px] leading-relaxed">
                                    Se eliminarán todos los datos asociados a esta obra: bitácoras, documentos, reportes y registros de equipo. Esta acción <span className="text-red-400 font-semibold">no se puede deshacer</span> una vez confirmada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Countdown bar — fills up, then confirm unlocks */}
                    <div className="w-full mb-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                                {deleteCountdown > 0 ? `Habilitando en ${deleteCountdown}s…` : 'Listo para confirmar'}
                            </span>
                            <span className={`text-[10px] font-bold font-mono ${deleteCountdown === 0 ? 'text-red-400' : 'text-white/20'}`}>
                                {deleteCountdown === 0 ? '✓ LISTO' : `${DELETE_UNLOCK_SECONDS - deleteCountdown}/${DELETE_UNLOCK_SECONDS}`}
                            </span>
                        </div>
                        <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full transition-all duration-1000"
                                style={{ width: `${((DELETE_UNLOCK_SECONDS - deleteCountdown) / DELETE_UNLOCK_SECONDS) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleteCountdown > 0}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${deleteCountdown > 0
                            ? 'bg-red-900/20 text-red-900/40 border border-red-900/20 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white border border-red-500/50 shadow-lg shadow-red-900/30 cursor-pointer active:scale-95'
                            }`}
                    >
                        <Trash2 size={15} />
                        Confirmar eliminación
                    </button>
                </div>
            </div>
        </div>
    );
}
