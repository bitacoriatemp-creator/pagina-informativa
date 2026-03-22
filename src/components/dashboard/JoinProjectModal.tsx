"use client";

import React, { useState } from "react";
import {
    Key,
    Bell,
    CheckCircle2,
    X,
    AlertTriangle,
} from "lucide-react";
import { useThemeVars } from "@/hooks/useThemeVars";
import { Role } from "@/types/project";
import { APPEARANCES } from "@/utils/mockData";
import { motion } from "framer-motion";

interface PendingInvite {
    id: string;
    projectName: string;
    invitedBy: string;
    role: string;
    projectColor: string;
    date: string;
}

interface JoinProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectJoined: (project: {
        id: string;
        title: string;
        subtitle: string;
        role: Role;
        gradient: string;
        ownerInitials: string;
    }) => void;
}

export default function JoinProjectModal({ isOpen, onClose, onProjectJoined }: JoinProjectModalProps) {
    const {
        isDark,
        bgClass,
        textClass,
        cardBg,
        cardBorder,
        textMuted,
        textFaint,
        hoverBg,
        topBarBg,
    } = useThemeVars();

    const [joinTab, setJoinTab] = useState<"codigo" | "invitaciones">("codigo");
    const [joinCode, setJoinCode] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState(false);

    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
        { id: "inv1", projectName: "Torre Reforma", invitedBy: "Luis M. — Ing. Supervisor", role: "Editor", projectColor: "#C39767", date: "28 Feb 2026" },
        { id: "inv2", projectName: "Residencial Pedregal", invitedBy: "Diego R. — Residente", role: "Viewer", projectColor: "#60a5fa", date: "01 Mar 2026" },
    ]);

    const handleJoinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError("");
        if (joinCode.trim().length < 6) {
            setJoinError("El código debe tener al menos 6 caracteres.");
            return;
        }
        if (!joinPassword.trim()) {
            setJoinError("Ingresa la contraseña de acceso.");
            return;
        }
        if (joinCode.toUpperCase().startsWith("BIT-")) {
            setJoinSuccess(true);
            setTimeout(() => {
                onClose();
                setJoinSuccess(false);
                setJoinCode("");
                setJoinPassword("");
            }, 1800);
        } else {
            setJoinError("Código de invitación inválido o caducado.");
        }
    };

    const handleAcceptInvite = (id: string) => {
        const inv = pendingInvites.find(i => i.id === id);
        if (inv) {
            onProjectJoined({
                id: Date.now().toString(),
                title: inv.projectName,
                subtitle: "Miembro del Equipo",
                role: inv.role as Role,
                gradient: APPEARANCES[1].class,
                ownerInitials: inv.invitedBy.charAt(0),
            });
        }
        setPendingInvites(prev => prev.filter(i => i.id !== id));
    };

    const handleDeclineInvite = (id: string) => {
        setPendingInvites(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative w-full max-w-md ${bgClass} border ${cardBorder} rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}
            >

                {/* Header */}
                <div className={`px-5 py-4 border-b ${cardBorder} flex items-center justify-between ${topBarBg}`}>
                    <h2 className={`text-base font-display font-semibold ${textClass} flex items-center gap-2`}>
                        <Key size={16} className="text-[#C39767]" />
                        Unirse a una Obra
                    </h2>
                    <button onClick={onClose} className={`${textMuted} hover:opacity-100 transition-colors`}><X size={18} /></button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${cardBorder} ${topBarBg}`}>
                    {(["codigo", "invitaciones"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setJoinTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${joinTab === tab
                                ? "border-[#C39767] text-[#C39767] bg-white/[0.03]"
                                : `border-transparent ${textMuted} hover:opacity-100`
                                }`}
                        >
                            {tab === "codigo" ? (
                                <span className="flex items-center justify-center gap-2"><Key size={14} /> Ingresar Código</span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Bell size={14} />
                                    Invitaciones
                                    {pendingInvites.length > 0 && (
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C39767] text-black text-[10px] font-bold">{pendingInvites.length}</span>
                                    )}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className={`p-5 ${bgClass}`}>

                    {/* TAB: CÓDIGO */}
                    {joinTab === "codigo" && (
                        <form onSubmit={handleJoinSubmit} className="space-y-4">
                            {joinSuccess ? (
                                <div className="flex flex-col items-center py-8 gap-3">
                                    <CheckCircle2 size={40} className="text-emerald-400" />
                                    <p className="text-emerald-400 font-medium">¡Acceso concedido!</p>
                                    <p className={`${textMuted} text-sm`}>Eres parte de la obra ahora.</p>
                                </div>
                            ) : (
                                <>
                                    <p className={`text-xs ${textMuted} leading-relaxed`}>
                                        Solicita el código al administrador de la obra. El código tiene el formato <span className="font-mono text-[#C39767]">BIT-XXXX-XXX</span>.
                                    </p>
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Código de Invitación</label>
                                        <input
                                            type="text"
                                            value={joinCode}
                                            onChange={e => { setJoinCode(e.target.value); setJoinError(""); }}
                                            placeholder="BIT-2026-ABC"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2.5 ${textClass} font-mono focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-sm tracking-widest uppercase`}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Contraseña de Obra</label>
                                        <input
                                            type="password"
                                            value={joinPassword}
                                            onChange={e => { setJoinPassword(e.target.value); setJoinError(""); }}
                                            placeholder="••••••••"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-sm`}
                                        />
                                    </div>
                                    {joinError && (
                                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                            <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                                            <span className="text-red-400 text-xs">{joinError}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg text-sm ${textMuted} hover:opacity-100 ${hoverBg} transition-colors`}>Cancelar</button>
                                        <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#C39767] text-white hover:bg-[#d4a878] transition-all shadow-lg shadow-[#C39767]/20 flex items-center gap-2">
                                            <Key size={15} /> Unirme
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    )}

                    {/* TAB: INVITACIONES */}
                    {joinTab === "invitaciones" && (
                        <div className="space-y-3">
                            {pendingInvites.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Bell size={28} className={textFaint} />
                                    <p className={`text-xs ${textMuted} font-mono uppercase tracking-wider`}>Sin invitaciones pendientes</p>
                                </div>
                            ) : (
                                pendingInvites.map(inv => (
                                    <div key={inv.id} className={`rounded-xl border ${cardBorder} ${cardBg} overflow-hidden`}>
                                        <div className="h-1" style={{ background: `linear-gradient(to right, ${inv.projectColor}80, ${inv.projectColor}20)` }} />
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className={`text-sm font-display font-semibold ${textClass} leading-tight`}>{inv.projectName}</h3>
                                                    <p className={`text-[11px] ${textMuted} mt-0.5`}>{inv.invitedBy}</p>
                                                </div>
                                                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: `${inv.projectColor}15`, color: inv.projectColor }}>{inv.role}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`font-mono text-[10px] ${textFaint}`}>{inv.date}</span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDeclineInvite(inv.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs ${textMuted} hover:opacity-100 ${hoverBg} border-transparent hover:border-current transition-all`}
                                                    >Rechazar</button>
                                                    <button
                                                        onClick={() => handleAcceptInvite(inv.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark ? 'text-black' : 'text-white'} hover:opacity-90 transition-all shadow-sm`}
                                                        style={{ backgroundColor: inv.projectColor }}
                                                    >
                                                        <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Aceptar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
