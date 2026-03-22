"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Search,
    Users,
    HardHat,
    Briefcase,
    X,
    MessageSquare,
    Phone,
    Mail,
    Send,
    Filter,
    Wrench,
    Laptop,
    MoreVertical,
    ShieldCheck,
    MapPin,
    FileText,
    UserPlus,
    Trash2
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeVars } from "@/hooks/useThemeVars";
import { assetPath } from "@/lib/assetPath";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { MOCK_CONTACTS, Contact, Category } from "@/utils/mockData";

const CATEGORY_COLORS: Record<Category, string> = {
    "Estructurista": "#f87171",
    "Residente": "#C39767",
    "Coordinador BIM": "#60a5fa",
    "Supervisor": "#34d399",
    "Administración": "#a78bfa"
};

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
    "Estructurista": Wrench,
    "Residente": HardHat,
    "Coordinador BIM": Laptop,
    "Supervisor": ShieldCheck,
    "Administración": Briefcase
};

export default function ContactosDashboard() {
    const [contactsList, setContactsList] = useState<Contact[]>(MOCK_CONTACTS);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
    const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);

    // Chat states
    const [activeChat, setActiveChat] = useState<Contact | null>(null);
    const [currentMessage, setCurrentMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<{ id: number, text: string }[]>([]);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [newContactCode, setNewContactCode] = useState("");

    const {
        isDark,
        mounted,
        textFaint,
        textMuted,
        textClass,
        cardBg,
        cardBorder,
        borderColor,
        hoverBg,
        bgClass,
        topBarBg
    } = useThemeVars();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("Todas");
    const [filterProject, setFilterProject] = useState<string>("Todas las Obras");

    const categories = useMemo(() => ["Todas", ...Array.from(new Set(contactsList.map(c => c.category)))], [contactsList]);
    // Extracción única de todos los proyectos para el filtro
    const allProjects = useMemo(() => ["Todas las Obras", ...Array.from(new Set(contactsList.flatMap(c => c.projects.map(p => p.name))))], [contactsList]);

    const filteredContacts = useMemo(() => {
        return contactsList.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.role.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = filterCategory === "Todas" || c.category === filterCategory;
            const matchProj = filterProject === "Todas las Obras" || c.projects.some(p => p.name === filterProject);
            return matchSearch && matchCat && matchProj;
        });
    }, [searchQuery, filterCategory, filterProject]);


    if (!mounted) return null;

    const rightActions = (
        <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative hidden md:block">
                <button
                    onClick={() => { setIsProjectFilterOpen(!isProjectFilterOpen); setIsCategoryFilterOpen(false); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 ${cardBorder} ${isProjectFilterOpen || filterProject !== 'Todas las Obras' ? (isDark ? 'bg-[#C39767]/10 text-[#C39767] border-[#C39767]/30' : 'bg-[#A87B4C]/10 text-[#A87B4C] border-[#A87B4C]/30') : `${cardBg} ${textMuted} ${hoverBg}`}`}
                    title="Filtrar por obra"
                >
                    <Filter size={16} />
                </button>
                {isProjectFilterOpen && (
                    <div className={`absolute right-0 top-full mt-2 min-w-[180px] ${isDark ? 'bg-[#111]' : 'bg-white'} border ${cardBorder} rounded-xl shadow-xl z-50 py-1 overflow-hidden`}>
                        <p className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest ${textFaint}`}>Obra</p>
                        {allProjects.map(p => (
                            <button
                                key={p}
                                onClick={() => { setFilterProject(p); setIsProjectFilterOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${filterProject === p ? (isDark ? 'bg-[#C39767]/10 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]') : `${textClass} ${hoverBg}`}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative hidden md:block">
                <button
                    onClick={() => { setIsCategoryFilterOpen(!isCategoryFilterOpen); setIsProjectFilterOpen(false); }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 ${cardBorder} ${isCategoryFilterOpen || filterCategory !== 'Todas' ? (isDark ? 'bg-[#C39767]/10 text-[#C39767] border-[#C39767]/30' : 'bg-[#A87B4C]/10 text-[#A87B4C] border-[#A87B4C]/30') : `${cardBg} ${textMuted} ${hoverBg}`}`}
                    title="Filtrar por categoría"
                >
                    <HardHat size={16} />
                </button>
                {isCategoryFilterOpen && (
                    <div className={`absolute right-0 top-full mt-2 min-w-[180px] ${isDark ? 'bg-[#111]' : 'bg-white'} border ${cardBorder} rounded-xl shadow-xl z-50 py-1 overflow-hidden`}>
                        <p className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest ${textFaint}`}>Categoría</p>
                        {categories.map(c => (
                            <button
                                key={c}
                                onClick={() => { setFilterCategory(c); setIsCategoryFilterOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${filterCategory === c ? (isDark ? 'bg-[#C39767]/10 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]') : `${textClass} ${hoverBg}`}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium "Añadir Contacto" Button (PC Only) */}
            <div className="hidden md:block ml-2 border-l pl-4 border-[#C39767]/20">
                <button
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="h-9 px-4 rounded-lg bg-[#C39767] text-white font-medium text-xs tracking-wider flex items-center gap-2 hover:bg-[#d4a878] shadow-lg shadow-[#C39767]/20 transition-all duration-300"
                    title="Añadir Nuevo Contacto"
                >
                    <UserPlus size={16} />
                    <span>Añadir</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C39767]/5 blur-[120px] rounded-full pointer-events-none" />

            <DashboardTopBar
                activePage="contactos"
                pageTitle="Contactos"
                rightActions={rightActions}
            />
            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 transition-colors duration-500 w-full">

                {/* Directorio Body */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6" data-lenis-prevent>
                    {filteredContacts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 rounded-2xl ${cardBg} border ${cardBorder} flex items-center justify-center mb-4`}>
                                <Search size={24} className={textFaint} />
                            </div>
                            <h3 className={`${textClass} opacity-80 font-display font-medium mb-1`}>No se encontraron ingenieros</h3>
                            <p className={`${textMuted} text-sm`}>Cambia tu búsqueda o los filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 relative z-10">
                            {/* Botón Añadir Principal (Solid Premium) - SOLO MÓVIL */}
                            <button
                                onClick={() => setIsAddContactModalOpen(true)}
                                className="w-full md:hidden py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group bg-gradient-to-r from-[#C39767] to-[#A87B4C] text-white shadow-[0_8px_30px_rgba(195,151,103,0.3)] hover:shadow-[0_8px_40px_rgba(195,151,103,0.5)] active:scale-[0.98] border border-white/10"
                            >
                                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-display font-semibold text-sm uppercase tracking-widest text-shadow-sm">
                                    Añadir Nuevo Contacto
                                </span>
                            </button>

                            {/* Grid de Contactos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {filteredContacts.map(contact => {
                                    const Icon = CATEGORY_ICONS[contact.category] || Users;
                                    const color = CATEGORY_COLORS[contact.category];

                                    return (
                                        <div key={contact.id} className={`group relative rounded-3xl border ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-[#2A241E]/10 bg-white/70'} backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C39767]/15 ${isDark ? 'hover:bg-white/[0.04] hover:border-white/[0.12]' : 'hover:bg-white hover:border-[#2A241E]/20'}`}>

                                            {/* Portada (Cover) */}
                                            {contact.coverUrl && (
                                                <div className="h-28 w-full relative overflow-hidden bg-black/10">
                                                    <Image src={assetPath(contact.coverUrl)} alt="Cover" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                </div>
                                            )}

                                            <div className={`px-6 pb-6 pt-0 relative z-10 flex flex-col gap-4 w-full ${contact.coverUrl ? '-mt-10' : 'pt-6'}`}>
                                                {/* Encabezado: Avatar y Etiqueta */}
                                                <div className="flex justify-between items-start w-full gap-2">
                                                    {/* Avatar Grande y Premium */}
                                                    <div className="relative shrink-0">
                                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${contact.avatarColor} p-[3px] shadow-xl`}>
                                                            <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F4EFE6]'} flex items-center justify-center font-display font-black ${textClass} tracking-widest text-lg relative overflow-hidden`}>
                                                                {contact.avatarUrl ? (
                                                                     <Image src={assetPath(contact.avatarUrl)} alt={contact.name} fill className="object-cover" unoptimized />
                                                                ) : (
                                                                     <>
                                                                         <div className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'} mix-blend-overlay`} />
                                                                         {contact.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                                     </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Status Dot */}
                                                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] ${isDark ? 'border-[#0a0a0a]' : 'border-[#F4EFE6]'} z-10 transition-colors duration-500`}
                                                            style={{ backgroundColor: contact.status === 'activo' ? '#34d399' : contact.status === 'ocupado' ? '#f59e0b' : '#52525b' }} 
                                                        />
                                                    </div>

                                                    {/* Role Label Premium */}
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-md mt-10 shrink-0">
                                                        <Icon size={12} style={{ color }} />
                                                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold max-w-[120px] truncate" style={{ color }}>
                                                            {contact.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Nombre y Puesto */}
                                                <div>
                                                    <h3 className={`text-xl font-display font-semibold ${textClass} tracking-tight mb-1`}>{contact.name}</h3>
                                                    <p className={`text-sm ${textMuted} font-medium`}>{contact.role}</p>
                                                </div>
                                            </div>

                                            {/* Info & Contact Box Minimalista */}
                                            <div className={`px-6 py-4 flex flex-col gap-3 ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'} border-y ${isDark ? 'border-white/[0.04]' : 'border-black/[0.04]'}`}>
                                                <div className={`flex items-center gap-3 ${textMuted} transition-colors group/tel cursor-pointer hover:text-[#C39767]`}>
                                                    <Phone size={14} className="opacity-70 group-hover/tel:opacity-100 transition-opacity" />
                                                    <span className="font-mono text-sm tracking-wide">{contact.phone}</span>
                                                </div>
                                                <div className={`flex items-center gap-3 ${textMuted} transition-colors group/mail cursor-pointer hover:text-[#C39767]`}>
                                                    <Mail size={14} className="opacity-70 group-hover/mail:opacity-100 transition-opacity" />
                                                    <span className="font-mono text-sm tracking-wide truncate">{contact.email}</span>
                                                </div>
                                            </div>

                                            {/* Projects Footer Premium */}
                                            <div className="p-6 mt-auto">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`font-mono text-[10px] ${textFaint} uppercase tracking-widest font-semibold`}>Obras asignadas</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setActiveChat(contact);
                                                                setTimeout(() => chatInputRef.current?.focus(), 100);
                                                            }}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-white/5 text-white/70 hover:text-white hover:bg-[#C39767]/20 hover:text-[#C39767]' : 'bg-black/5 text-black/70 hover:text-black hover:bg-[#C39767]/20 hover:text-[#C39767]'} `}
                                                            title="Enviar mensaje"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setContactToDelete(contact);
                                                            }}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/15' : 'bg-black/5 text-black/50 hover:text-red-600 hover:bg-red-500/10'}`}
                                                            title="Eliminar Contacto"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {contact.projects.length > 0 ? (
                                                        contact.projects.map(p => (
                                                            <span key={p.name} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-white/[0.04] text-white/80' : 'bg-black/[0.04] text-[#2A241E]/80'} font-medium text-[11px] leading-none whitespace-nowrap transition-colors hover:bg-[#C39767]/10 hover:text-[#C39767]`}>
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                                                {p.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className={`font-mono text-[11px] ${textFaint} italic`}>Disponible</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {/* MINI CHAT WIDGET PREMIUM */}
                {
                    activeChat && (
                        <div className={`fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-3rem)] ${isDark ? 'bg-[#0a0a0a]/70 border-white/[0.08]' : 'bg-[#F4EFE6]/70 border-[#2A241E]/10'} backdrop-blur-3xl border rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-500 ring-1 ${isDark ? 'ring-white/[0.02]' : 'ring-black/[0.02]'}`}>
                            
                            {/* Chat Header Premium */}
                            <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.04] bg-white/[0.02]' : 'border-black/[0.04] bg-black/[0.02]'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${activeChat.avatarColor} p-[2px] shadow-lg`}>
                                            <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F4EFE6]'} flex items-center justify-center font-display font-black ${textClass} tracking-widest text-sm relative overflow-hidden`}>
                                                {activeChat.avatarUrl ? (
                                                    <Image src={assetPath(activeChat.avatarUrl)} alt={activeChat.name} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <>
                                                        <div className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'} mix-blend-overlay`} />
                                                        {activeChat.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-[#F4EFE6]'} z-10 transition-colors duration-500`}
                                            style={{ backgroundColor: activeChat.status === 'activo' ? '#34d399' : activeChat.status === 'ocupado' ? '#f59e0b' : '#52525b' }} 
                                        />
                                    </div>
                                    <div>
                                        <h4 className={`font-display font-semibold text-base ${textClass} tracking-tight leading-tight mb-0.5`}>{activeChat.name}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-xs ${textMuted} font-medium`}>{activeChat.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setActiveChat(null)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isDark ? 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:rotate-90' : 'bg-black/5 text-black/50 hover:text-black hover:bg-black/10 hover:rotate-90'}`}>
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-transparent">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                        <div className={`w-16 h-16 rounded-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'} flex items-center justify-center mb-5 rotate-3`}>
                                            <MessageSquare size={24} className={textFaint} />
                                        </div>
                                        <p className={`text-sm ${textMuted} max-w-[200px] leading-relaxed font-medium`}>Inicia una conversación con {activeChat.name.split(" ")[0]}</p>
                                    </div>
                                ) : (
                                    chatMessages.map(msg => (
                                        <div key={msg.id} className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="bg-gradient-to-br from-[#C39767] to-[#A87B4C] text-white text-[15px] py-3 px-4 rounded-[1.25rem] rounded-tr-sm max-w-[85%] shadow-lg shadow-[#C39767]/20 font-medium tracking-wide">
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {/* Placeholder incoming message */}
                                {chatMessages.length > 0 && (
                                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className={`py-4 px-5 rounded-[1.25rem] rounded-tl-sm max-w-[85%] flex items-center gap-2 border shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-white/90' : 'bg-white/80 border-[#2A241E]/10 text-black/90'}`}>
                                            <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce delay-100" />
                                            <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input Premium */}
                            <div className={`p-4 border-t ${isDark ? 'border-white/[0.04] bg-white/[0.01]' : 'border-black/[0.04] bg-black/[0.01]'}`}>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!currentMessage.trim()) return;
                                        setChatMessages([...chatMessages, { id: Date.now(), text: currentMessage.trim() }]);
                                        setCurrentMessage("");
                                    }}
                                    className={`relative flex items-end gap-3 p-1.5 rounded-2xl border transition-all duration-300 focus-within:ring-2 focus-within:ring-[#C39767]/30 focus-within:border-[#C39767]/50 ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10 shadow-sm'}`}
                                >
                                    <textarea
                                        ref={chatInputRef}
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (currentMessage.trim()) {
                                                    setChatMessages([...chatMessages, { id: Date.now(), text: currentMessage.trim() }]);
                                                    setCurrentMessage("");
                                                }
                                            }
                                        }}
                                        placeholder="Escribe tu mensaje..."
                                        className={`flex-1 max-h-32 min-h-[44px] bg-transparent border-none px-3 py-3 text-[15px] font-medium ${textClass} focus:outline-none focus:ring-0 resize-none custom-scrollbar placeholder:text-opacity-40`}
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentMessage.trim()}
                                        className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 ${!currentMessage.trim() ? (isDark ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-black/5 text-black/30 cursor-not-allowed') : 'bg-gradient-to-br from-[#C39767] to-[#A87B4C] text-white hover:scale-105 active:scale-95 shadow-md shadow-[#C39767]/30'}`}
                                    >
                                        <Send size={18} className="translate-x-[1px]" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Añadir Contacto Modal */}
                <AnimatePresence>
                    {/* Eliminar Contacto Modal */}
                    {contactToDelete && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setContactToDelete(null)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`relative w-[calc(100%-2rem)] max-w-md ${bgClass} border ${isDark ? 'border-red-500/20' : 'border-red-500/30'} rounded-[2rem] shadow-2xl flex flex-col overflow-hidden`}
                            >
                                {/* Header / Info Area */}
                                <div className={`pt-10 px-6 sm:px-8 pb-6 relative flex flex-col items-center text-center`}>
                                    <div className={`w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]`}>
                                        <Trash2 size={28} />
                                    </div>
                                    <h2 className={`text-2xl font-display font-semibold ${textClass} mb-3 uppercase tracking-wider`}>
                                        ¿Eliminar Contacto?
                                    </h2>
                                    <p className={`text-sm ${textMuted} leading-relaxed mb-6 font-medium`}>
                                        Estás a punto de eliminar a <span className={`font-bold ${textClass}`}>{contactToDelete.name}</span> de tu directorio y revocarle su acceso al ERP.
                                    </p>
                                    
                                    {contactToDelete.projects.length > 0 && (
                                        <div className={`w-full p-4 rounded-xl ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border mb-2`}>
                                            <p className={`text-[11px] font-bold ${isDark ? 'text-red-400' : 'text-red-600'} uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5`}>
                                                <Briefcase size={14} /> ALERTA DE OBRAS ACTIVAS
                                            </p>
                                            <p className={`text-[13px] ${isDark ? 'text-red-300' : 'text-red-800'} leading-relaxed font-medium`}>
                                                Este usuario colabora en <b>{contactToDelete.projects.length}</b> obra{contactToDelete.projects.length > 1 ? 's' : ''}: <i>{contactToDelete.projects.map(p => p.name).join(', ')}</i>. Al confirmar, perderá su acceso.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Area */}
                                <div className={`px-6 sm:px-8 py-6 ${topBarBg} border-t ${cardBorder} flex flex-col-reverse sm:flex-row items-center justify-center gap-4`}>
                                    <button
                                        onClick={() => setContactToDelete(null)}
                                        className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold ${textMuted} hover:text-white hover:bg-white/10 transition-colors border border-transparent`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setContactsList(prev => prev.filter(c => c.id !== contactToDelete.id));
                                            setContactToDelete(null);
                                        }}
                                        className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white hover:opacity-90 shadow-lg shadow-red-500/30 border border-red-500/50 transition-all flexitems-center gap-2 uppercase tracking-wide`}
                                    >
                                        Eliminar Definitivamente
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {isAddContactModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                onClick={() => setIsAddContactModalOpen(false)}
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`relative w-[calc(100%-2rem)] max-w-md ${bgClass} border ${cardBorder} rounded-[2rem] shadow-2xl flex flex-col overflow-hidden`}
                            >
                                {/* Botón cerrar global */}
                                <button
                                    onClick={() => setIsAddContactModalOpen(false)}
                                    className={`absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-[#2A241E]/5 hover:bg-[#2A241E]/10'} ${textMuted} hover:text-[#C39767] transition-all z-10`}
                                >
                                    <X size={18} />
                                </button>

                                {/* Header / Info Area */}
                                <div className={`pt-10 px-6 sm:px-8 pb-6 relative flex flex-col items-start text-left`}>
                                    <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-[#C39767]/20 border border-[#C39767]/30' : 'bg-[#C39767]/10 border border-[#C39767]/20'} flex items-center justify-center mb-5`}>
                                        <UserPlus size={26} className="text-[#C39767]" />
                                    </div>
                                    <h2 className={`text-2xl font-display font-semibold ${textClass} mb-2`}>
                                        Añadir Contacto
                                    </h2>
                                    <p className={`text-sm ${textMuted} leading-relaxed`}>
                                        Ingresa el código único de invitación o el ID del usuario para vincularlo a tu libreta de contactos.
                                    </p>
                                </div>

                                {/* Input & Actions Area */}
                                <div className={`px-6 sm:px-8 py-8 ${topBarBg} border-t ${cardBorder} flex flex-col`}>
                                    <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-3`}>Código de Invitación / ID *</label>
                                    <input
                                        type="text"
                                        value={newContactCode}
                                        onChange={e => setNewContactCode(e.target.value)}
                                        placeholder="Ej. BIT-2026-XYZ"
                                        className={`w-full ${cardBg} border ${cardBorder} rounded-xl px-5 py-4 ${textClass} font-mono text-base focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all mb-8`}
                                        autoFocus
                                    />

                                    <div className={`flex flex-col-reverse sm:flex-row items-center justify-end gap-3`}>
                                        <button
                                            onClick={() => setIsAddContactModalOpen(false)}
                                            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium ${textMuted} hover:text-[#C39767] hover:${hoverBg} transition-colors`}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddContactModalOpen(false);
                                                setNewContactCode("");
                                            }}
                                            disabled={!newContactCode.trim()}
                                            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium bg-[#C39767] text-white hover:bg-[#d4a878] shadow-lg shadow-[#C39767]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Vincular Contacto
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}
