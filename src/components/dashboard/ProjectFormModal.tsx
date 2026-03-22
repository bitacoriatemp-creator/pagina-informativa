"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, X, HardHat, Users, Paintbrush, Palette, CheckCircle2, QrCode, Copy, ChevronRight, ImageIcon, MoreVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useThemeVars } from "@/hooks/useThemeVars";
import { Project, Role } from "@/types/project";
import { APPEARANCES, RECENT_ENGINEERS } from "@/utils/mockData";
import { useDashboard } from "@/context/DashboardContext";

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: {
        title: string;
        subtitle: string;
        gradient: string;
        coverImage?: string | null;
        invitedUsers: { id: string | number, name: string, role: string }[];
    }) => void;
    initialProject?: Project | null;
}

export default function ProjectFormModal({
    isOpen,
    onClose,
    onSave,
    initialProject
}: ProjectFormModalProps) {
    const { isDark, bgClass, textClass, cardBg, cardBorder, textMuted, textFaint, hoverBg, topBarBg } = useThemeVars();
    const { addNotification } = useDashboard();

    const [activeTab, setActiveTab] = useState<"detalles" | "equipo" | "apariencia">("detalles");
    const [formTitle, setFormTitle] = useState("");
    const [formStateLoc, setFormStateLoc] = useState("");
    const [formCity, setFormCity] = useState("");
    const [formStartDate, setFormStartDate] = useState("");
    const [formEndDate, setFormEndDate] = useState("");
    const [invitedUsers, setInvitedUsers] = useState<{ id: string | number, name: string, role: string, initials?: string, avatarUrl?: string, color?: string }[]>([]);
    const [formAppearance, setFormAppearance] = useState(APPEARANCES[0].class);
    const [formCoverImage, setFormCoverImage] = useState<string | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showContactList, setShowContactList] = useState(false);
    const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

    // Inicializar estado cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (initialProject) {
                setFormTitle(initialProject.title);
                const parts = initialProject.subtitle.split(", ");
                setFormCity(parts[0] || "");
                setFormStateLoc(parts[1] || "");
                setFormAppearance(initialProject.gradient);
                setFormCoverImage(initialProject.coverImage || null);
                // Popular el equipo actual copiándolo de initialProject
                if (initialProject.team) {
                    setInvitedUsers(initialProject.team.map((m: any, i) => ({
                        id: "ex-" + i, // Fake ID para los que ya estaban
                        name: m.name || m.initials,
                        role: m.role,
                        initials: m.initials || m.name?.substring(0, 2).toUpperCase(),
                        avatarUrl: m.avatarUrl,
                        color: m.color
                    })));
                } else {
                    setInvitedUsers([]);
                }
            } else {
                setFormTitle("");
                setFormCity("");
                setFormStateLoc("");
                setFormAppearance(APPEARANCES[0].class);
                setFormCoverImage(null);
                setInvitedUsers([]);
            }
            setActiveTab("detalles");
            setInviteCode(null);
            setShowContactList(false);
            setFormStartDate("");
            setFormEndDate("");
        }
    }, [isOpen, initialProject]);

    const handleClose = () => {
        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setTimeout(onClose, 100);
    };

    const handleGenerateCode = () => {
        setInviteCode("BIT-2026-" + Math.random().toString(36).substring(2, 5).toUpperCase());
    };

    const toggleInvite = (user: typeof RECENT_ENGINEERS[0]) => {
        const isInvited = invitedUsers.find(inv => inv.name === user.name);
        if (isInvited) {
            setInvitedUsers(invitedUsers.filter(inv => inv.name !== user.name));
        } else {
            setInvitedUsers([...invitedUsers, { ...user, role: "Viewer", initials: user.name.substring(0, 2).toUpperCase() }]);
        }
    };

    const updateRole = (id: string | number, newRole: string) => {
        setInvitedUsers(prev => {
            const next = [...prev];
            if (newRole === 'Owner') {
                next.forEach(m => {
                    if (m.role === 'Owner') m.role = 'Editor';
                });
            }
            const memberRef = next.find(m => m.id === id);
            if (memberRef) memberRef.role = newRole;
            return next;
        });
        setOpenDropdownIdx(null);
    };

    const removeUser = (id: string | number) => {
        setInvitedUsers(prev => prev.filter(m => m.id !== id));
        setOpenDropdownIdx(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const subtitleStr = `${formCity}${formCity && formStateLoc ? ", " : ""}${formStateLoc}`.trim() || "Ubicación no especificada";

        onSave({
            title: formTitle,
            subtitle: subtitleStr,
            gradient: formAppearance,
            coverImage: formCoverImage,
            invitedUsers
        });

        addNotification(
            "Nuevas anotaciones en bitácora",
            `Se ha registrado la apertura de la obra ${formTitle} en el sistema.`,
            "success"
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative w-full max-w-md ${bgClass} border ${cardBorder} rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}
            >
                {/* Header Modal */}
                <div className={`px-5 py-4 border-b ${cardBorder} flex items-center justify-between ${topBarBg}`}>
                    <h2 className={`text-lg font-display font-medium ${textClass} flex items-center gap-2`}>
                        {initialProject ? <Paintbrush size={18} className="text-[#C39767]" /> : <Plus size={18} className="text-[#C39767]" />}
                        {initialProject ? "Personalizar Proyecto" : "Nuevo Proyecto"}
                    </h2>
                    <button type="button" onClick={handleClose} className={`${textMuted} hover:opacity-100 transition-colors`}><X size={20} /></button>
                </div>

                {/* Tabs Navigation */}
                <div className={`flex items-center border-b ${cardBorder} ${topBarBg}`}>
                    {([
                        { id: "detalles", label: "Detalles", icon: HardHat },
                        { id: "equipo", label: "Equipo", icon: Users },
                        { id: "apariencia", label: "Apariencia", icon: Paintbrush }
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex justify-center items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors flex-1 ${activeTab === tab.id
                                ? "border-[#C39767] text-[#C39767] bg-white/5"
                                : `border-transparent ${textMuted} hover:${textClass} hover:bg-white/5`
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Modal Body */}
                <div data-lenis-prevent className={`p-5 overflow-y-auto flex-1 ${bgClass}`} onClick={() => setOpenDropdownIdx(null)}>
                    <form id="projectForm" onSubmit={handleSubmit}>
                        {/* ──────── TAB: DETALLES ──────── */}
                        {activeTab === "detalles" && (
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Título de la Obra *</label>
                                    <input
                                        type="text"
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        placeholder="Ej. Torre Reforma, C.C. Oasis..."
                                        className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base`}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Ciudad</label>
                                        <input
                                            type="text"
                                            value={formCity}
                                            onChange={e => setFormCity(e.target.value)}
                                            placeholder="Ej. CDMX"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Estado/Región</label>
                                        <input
                                            type="text"
                                            value={formStateLoc}
                                            onChange={e => setFormStateLoc(e.target.value)}
                                            placeholder="Ej. Valle de Bravo"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base`}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Inicio</label>
                                        <input
                                            type="text"
                                            value={formStartDate}
                                            onChange={e => setFormStartDate(e.target.value)}
                                            placeholder="dd/mm/aaaa"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Fin Estimado</label>
                                        <input
                                            type="text"
                                            value={formEndDate}
                                            onChange={e => setFormEndDate(e.target.value)}
                                            placeholder="dd/mm/aaaa"
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB: EQUIPO ──────── */}
                        {activeTab === "equipo" && (
                            <div className="space-y-6">
                                {/* SECCIÓN: EQUIPO ACTUAL */}
                                <div>
                                    <h3 className={`text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-3 px-1 flex items-center justify-between`}>
                                        Equipo Actual
                                        <span className={`text-[9px] ${textFaint} font-normal`}>{invitedUsers.length} miembros</span>
                                    </h3>
                                    
                                    <div className="flex flex-col gap-2">
                                        {invitedUsers.length === 0 ? (
                                            <p className={`text-xs ${textFaint} text-center py-6 border border-dashed ${cardBorder} rounded-xl`}>No hay integrantes vinculados.</p>
                                        ) : (
                                            invitedUsers.map((member, i) => (
                                                <div key={member.id} className={`flex items-center justify-between p-2.5 rounded-xl border ${cardBorder} ${cardBg} shadow-sm group/teamrow transition-all hover:border-[#C39767]/30`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`relative w-9 h-9 rounded-full ${member.role === 'Owner' ? 'bg-[#C39767]' : member.role === 'Editor' ? 'bg-blue-500' : 'bg-emerald-500'} flex items-center justify-center text-white font-bold text-xs ring-2 ${isDark ? 'ring-[#1A1A1A]' : 'ring-white'} shadow-sm overflow-hidden`}>
                                                            {member.avatarUrl ? (
                                                                <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" unoptimized />
                                                            ) : (
                                                                member.initials || member.name.substring(0, 2).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-semibold ${textClass}`}>{member.name}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5 ${member.role === 'Owner' ? 'text-[#C39767]' : member.role === 'Editor' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                                {member.role === 'Owner' && <HardHat size={10} className="inline mr-1 -mt-0.5" />}
                                                                {member.role}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {member.role !== 'Owner' && (
                                                        <div className="relative">
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownIdx(openDropdownIdx === i ? null : i);
                                                                }}
                                                                className={`p-1.5 rounded-lg ${openDropdownIdx === i ? 'bg-[#C39767]/20 text-[#C39767]' : `opacity-0 group-hover/teamrow:opacity-100 ${textMuted} hover:${textClass} ${hoverBg}`} transition-all`}
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>

                                                            <AnimatePresence>
                                                                {openDropdownIdx === i && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className={`absolute bottom-full right-0 mb-2 w-40 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] border ${isDark ? 'bg-[#111111] border-white/10' : 'bg-white border-black/10'} overflow-hidden z-[200]`}
                                                                    >
                                                                        <div className={`p-1 border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                                                                            <button type="button" onClick={() => updateRole(member.id, 'Owner')} className={`w-full py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg text-left ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-black/70 hover:bg-black/5'} transition-all`}>Hacer Owner</button>
                                                                            <button type="button" onClick={() => updateRole(member.id, 'Editor')} className={`w-full py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg text-left ${member.role === 'Editor' ? 'bg-blue-500 text-white' : isDark ? 'text-white/70 hover:bg-white/10' : 'text-black/70 hover:bg-black/5'} transition-all`}>Hacer Editor</button>
                                                                            <button type="button" onClick={() => updateRole(member.id, 'Viewer')} className={`w-full py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg text-left ${member.role === 'Viewer' ? 'bg-emerald-500 text-white' : isDark ? 'text-white/70 hover:bg-white/10' : 'text-black/70 hover:bg-black/5'} transition-all`}>Hacer Viewer</button>
                                                                        </div>
                                                                        <div className="p-1">
                                                                            <button type="button" onClick={() => removeUser(member.id)} className="w-full py-2 px-2 text-[10px] font-bold uppercase tracking-widest rounded-lg text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-all"><Trash2 size={13}/> Desvincular</button>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-[#C39767]/30" />

                                {/* SECCIÓN: AÑADIR INTEGRANTE */}
                                <div>
                                    <h3 className={`text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-3 px-1`}>
                                        Añadir Integrante
                                    </h3>
                                    
                                    {/* Invite Code Option */}
                                    {!inviteCode ? (
                                        <button
                                            type="button"
                                            onClick={handleGenerateCode}
                                            className={`w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-[#C39767]/5 text-[#C39767] text-xs font-bold uppercase tracking-wider rounded-xl border border-[#C39767]/20 hover:bg-[#C39767]/10 transition-colors`}
                                        >
                                            <QrCode size={16} /> Generar Enlace de Invitación
                                        </button>
                                    ) : (
                                        <div className={`w-full mb-3 flex items-center justify-between ${bgClass} border border-[#C39767]/30 rounded-xl p-3`}>
                                            <div className="flex items-center gap-3">
                                                <QrCode size={24} className="text-[#C39767]" />
                                                <div>
                                                    <p className="text-[9px] text-[#C39767] uppercase tracking-wider font-bold mb-0.5">CÓDIGO ACTIVO</p>
                                                    <p className={`font-mono text-base font-semibold tracking-widest ${textClass} leading-none`}>{inviteCode}</p>
                                                </div>
                                            </div>
                                            <button type="button" className={`p-2 ${hoverBg} rounded-md ${textMuted} hover:text-[#C39767] transition-colors`} title="Copiar al portapapeles">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Lista de Contactos Sugeridos */}
                                    <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                                        <div className={`px-4 py-3 border-b ${cardBorder} bg-[#C39767]/5 flex items-center gap-2`}>
                                            <Users size={14} className="text-[#C39767]"/>
                                            <p className={`text-[10px] font-bold ${textClass} uppercase tracking-widest`}>Sugerencias Rápidas</p>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                            {RECENT_ENGINEERS.filter(user => !invitedUsers.find(inv => inv.name === user.name)).length === 0 ? (
                                                <p className={`text-xs ${textFaint} text-center py-6`}>Todos tus contactos están en este proyecto.</p>
                                            ) : RECENT_ENGINEERS.map(user => {
                                                const isInvited = invitedUsers.find(inv => inv.name === user.name);
                                                if (isInvited) return null;
                                                return (
                                                    <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg ${hoverBg} transition-colors group/suggest`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`relative w-8 h-8 rounded-full ${isDark ? 'bg-[#C39767]/10 border-[#C39767]/30' : 'bg-[#C39767]/10 border-[#C39767]/20'} text-[#C39767] flex items-center justify-center font-bold text-xs ring-1 ring-white/5 overflow-hidden`}>
                                                                {user.avatarUrl ? (
                                                                    <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" unoptimized />
                                                                ) : (
                                                                    user.name.substring(0,2).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs font-semibold ${textClass}`}>{user.name}</p>
                                                                <p className={`text-[9px] ${textFaint} uppercase tracking-widest`}>{user.category || user.role}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); toggleInvite(user); }}
                                                            className={`opacity-0 group-hover/suggest:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C39767]/10 text-[#C39767] font-bold text-[9px] uppercase tracking-wider hover:bg-[#C39767] hover:text-white transition-all border border-[#C39767]/20 hover:border-transparent`}
                                                        >
                                                            <Plus size={10} strokeWidth={3} /> Añadir
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB: APARIENCIA ──────── */}
                        {activeTab === "apariencia" && (
                            <div className="space-y-4">
                                <p className={`text-[13px] ${textMuted} mb-2`}>Personaliza la cabecera de la obra visible en el Dashboard principal.</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {APPEARANCES.map((appearance) => (
                                        <div
                                            key={appearance.id}
                                            onClick={() => setFormAppearance(appearance.class)}
                                            className={`cursor-pointer rounded-xl border-2 overflow-hidden flex flex-col transition-all ${formAppearance === appearance.class ? 'border-[#C39767] scale-[1.02] shadow-lg shadow-[#C39767]/20 relative z-10' : `${cardBorder} ${hoverBg}`}`}
                                        >
                                            <div className={`h-16 w-full ${appearance.class.startsWith('#') ? '' : 'bg-gradient-to-br ' + appearance.class}`} style={appearance.class.startsWith('#') ? { backgroundColor: appearance.class } : undefined} />
                                            <div className={`${isDark ? 'bg-[#111]' : 'bg-[#EAE5DA]'} p-2 text-center border-t ${formAppearance === appearance.class ? 'border-[#C39767]/30' : cardBorder}`}>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${textMuted}`}>{appearance.name}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Selector Color Personalizado */}
                                    <div
                                        className={`cursor-pointer rounded-xl border-2 overflow-hidden flex flex-col transition-all ${formAppearance.startsWith('#') ? 'border-[#C39767] scale-[1.02] shadow-lg shadow-[#C39767]/20 relative z-10' : `${cardBorder} ${hoverBg}`}`}
                                    >
                                        <div
                                            className="h-16 w-full relative"
                                            style={{ backgroundColor: formAppearance.startsWith('#') ? formAppearance : '#C39767' }}
                                        >
                                            <input
                                                type="color"
                                                value={formAppearance.startsWith('#') ? formAppearance : '#C39767'}
                                                onChange={(e) => setFormAppearance(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                title="Elegir color personalizado"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <Palette size={20} className="text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                        <div className={`${isDark ? 'bg-[#111]' : 'bg-[#EAE5DA]'} p-2 text-center border-t ${formAppearance.startsWith('#') ? 'border-[#C39767]/30' : cardBorder}`}>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${textMuted}`}>Color</span>
                                        </div>
                                    </div>

                                    {/* Subir Foto custom */}
                                    <div
                                        className={`cursor-pointer rounded-xl border-2 overflow-hidden flex flex-col transition-all ${formCoverImage
                                            ? 'border-[#C39767] scale-[1.02] shadow-lg shadow-[#C39767]/20 relative z-10'
                                            : `border-dashed ${cardBorder} hover:border-[#C39767] ${hoverBg}`
                                            } h-[92px] relative`}
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setFormCoverImage(ev.target?.result as string);
                                                reader.readAsDataURL(file);
                                                e.target.value = '';
                                            }}
                                        />
                                        {formCoverImage ? (
                                            <>
                                                <Image src={formCoverImage} alt="Portada" fill className="absolute inset-0 object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setFormCoverImage(null); }}
                                                        className="text-white text-[9px] font-bold uppercase tracking-wider bg-red-500/80 hover:bg-red-600 px-2 py-1 rounded-md"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                                <div className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-[#111]' : 'bg-[#EAE5DA]'} p-1 text-center border-t border-[#C39767]/30`}>
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider text-[#C39767]`}>Portada ✓</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full p-3">
                                                <ImageIcon size={20} className={`${textFaint} mb-1.5`} />
                                                <span className={`text-[9px] uppercase font-bold ${textMuted} text-center leading-tight`}>Subir<br />Portada</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Modal Footer (Botones) */}
                <div className={`px-5 py-4 border-t ${cardBorder} flex justify-end gap-3 ${topBarBg} rounded-b-2xl`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${textMuted} hover:opacity-100 ${hoverBg} transition-colors`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="projectForm"
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-[#C39767] text-white hover:bg-[#d4a878] shadow-lg shadow-[#C39767]/20 transition-all flex items-center gap-2"
                    >
                        {initialProject ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                        {initialProject ? "Guardar Cambios" : "Crear Obra"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
