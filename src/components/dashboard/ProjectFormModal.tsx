"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, X, HardHat, Users, Paintbrush, Palette, CheckCircle2, QrCode, Copy, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useThemeVars } from "@/hooks/useThemeVars";
import { Project, Role } from "@/types/project";
import { APPEARANCES, RECENT_ENGINEERS } from "@/utils/mockData";

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (projectData: {
        title: string;
        subtitle: string;
        gradient: string;
        coverImage?: string | null;
        invitedUsers: { id: number, name: string, role: string }[];
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

    const [activeTab, setActiveTab] = useState<"detalles" | "equipo" | "apariencia">("detalles");
    const [formTitle, setFormTitle] = useState("");
    const [formStateLoc, setFormStateLoc] = useState("");
    const [formCity, setFormCity] = useState("");
    const [formStartDate, setFormStartDate] = useState("");
    const [formEndDate, setFormEndDate] = useState("");
    const [invitedUsers, setInvitedUsers] = useState<{ id: number, name: string, role: string }[]>([]);
    const [formAppearance, setFormAppearance] = useState(APPEARANCES[0].class);
    const [formCoverImage, setFormCoverImage] = useState<string | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showContactList, setShowContactList] = useState(false);

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
            } else {
                setFormTitle("");
                setFormCity("");
                setFormStateLoc("");
                setFormAppearance(APPEARANCES[0].class);
                setFormCoverImage(null);
            }
            setActiveTab("detalles");
            setInviteCode(null);
            setShowContactList(false);
            setInvitedUsers([]);
            setFormStartDate("");
            setFormEndDate("");
        }
    }, [isOpen, initialProject]);

    if (!isOpen) return null;

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
        const isInvited = invitedUsers.find(inv => inv.id === user.id);
        if (isInvited) {
            setInvitedUsers(invitedUsers.filter(inv => inv.id !== user.id));
        } else {
            setInvitedUsers([...invitedUsers, { ...user, role: "Editor" }]);
        }
    };

    const updateRole = (id: number, newRole: string) => {
        setInvitedUsers(invitedUsers.map(inv => inv.id === id ? { ...inv, role: newRole } : inv));
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
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

            <div className={`relative w-full max-w-md ${bgClass} border ${cardBorder} rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}>
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
                <div data-lenis-prevent className={`p-5 overflow-y-auto flex-1 ${bgClass}`}>
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
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Inicio</label>
                                        <input
                                            type="date"
                                            value={formStartDate}
                                            onChange={e => setFormStartDate(e.target.value)}
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base [color-scheme:dark_light]`}
                                            style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-2`}>Fin Estimado</label>
                                        <input
                                            type="date"
                                            value={formEndDate}
                                            onChange={e => setFormEndDate(e.target.value)}
                                            className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-1.5 sm:py-2.5 ${textClass} focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-base [color-scheme:dark_light]`}
                                            style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB: EQUIPO ──────── */}
                        {activeTab === "equipo" && (
                            <div className="space-y-4 min-h-[250px]">
                                <div className="text-center py-6 border-b border-dashed border-[#C39767]/30 mb-2">
                                    <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} flex items-center justify-center mx-auto mb-3`}>
                                        <Users size={20} className="text-[#C39767]" />
                                    </div>
                                    <h3 className={`text-sm font-semibold ${textClass} mb-1`}>Crear Enlace de Invitación</h3>
                                    <p className={`text-[11px] ${textMuted} max-w-[200px] mx-auto mb-4`}>Genera un código seguro para que clientes o contratistas se unan.</p>

                                    {!inviteCode ? (
                                        <button
                                            type="button"
                                            onClick={handleGenerateCode}
                                            className="px-4 py-2 bg-[#C39767]/10 text-[#C39767] font-semibold text-xs uppercase tracking-wider rounded-lg border border-[#C39767]/20 hover:bg-[#C39767]/20 transition-colors"
                                        >
                                            Generar Código
                                        </button>
                                    ) : (
                                        <div className={`w-full flex items-center justify-between ${bgClass} border border-[#C39767]/30 rounded-lg p-3 relative z-10`}>
                                            <div className="flex items-center gap-3">
                                                <QrCode size={24} className="text-[#C39767]" />
                                                <div>
                                                    <p className="text-[10px] text-[#C39767] uppercase tracking-wider font-bold mb-0.5">CÓDIGO ACTIVO</p>
                                                    <p className={`font-mono text-lg tracking-widest ${textClass} leading-none`}>{inviteCode}</p>
                                                </div>
                                            </div>
                                            <button type="button" className={`p-2 ${hoverBg} rounded-md ${textMuted} hover:opacity-100 transition-colors`} title="Copiar al portapapeles">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center"><span className={`w-full border-t ${cardBorder}`} /></div>
                                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className={`${bgClass} px-3 ${textFaint}`}>O</span></div>
                                </div>

                                {/* Lista Expandible */}
                                <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden`}>
                                    <button
                                        type="button"
                                        className={`w-full flex items-center justify-between p-3.5 ${hoverBg} transition-colors text-sm font-medium ${textClass}`}
                                        onClick={() => setShowContactList(!showContactList)}
                                    >
                                        <span className="flex items-center gap-2"><Users size={16} className={textMuted} /> Invitar contactos recientes</span>
                                        <ChevronRight size={16} className={`transition-transform duration-200 ${textMuted} ${showContactList ? 'rotate-90' : ''}`} />
                                    </button>

                                    {showContactList && (
                                        <div className={`px-3 pb-3 space-y-1 ${cardBg} border-t ${cardBorder} pt-3`}>
                                            {RECENT_ENGINEERS.map(user => {
                                                const isInvited = invitedUsers.find(inv => inv.id === user.id);
                                                return (
                                                    <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg ${hoverBg} transition-colors border border-transparent hover:border-[#333]`}>
                                                        <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => toggleInvite(user)}>
                                                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isInvited ? 'bg-[#C39767] border-[#C39767]' : cardBorder}`}>
                                                                {isInvited && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm ${isInvited ? textClass : textMuted}`}>{user.name}</span>
                                                        </div>
                                                        {isInvited && (
                                                            <select
                                                                className={`${bgClass} border ${cardBorder} ${textClass} text-[11px] rounded px-2 py-1 ml-4 focus:outline-none focus:border-[#C39767]`}
                                                                value={isInvited.role}
                                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                            >
                                                                <option value="Editor">Editor</option>
                                                                <option value="Viewer">Viewer</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
            </div>
        </div>
    );
}
