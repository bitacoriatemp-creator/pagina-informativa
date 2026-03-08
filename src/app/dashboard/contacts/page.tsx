"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
    Search,
    Users,
    HardHat,
    Briefcase,
    Shield,
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
    UserPlus
} from "lucide-react";

import { useThemeVars } from "@/hooks/useThemeVars";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useDashboard } from "@/context/DashboardContext";

/* ════════════════════════════════════════════════
   DATOS MOCK DE CONTACTOS
   ════════════════════════════════════════════════ */

type Category = "Estructurista" | "Residente" | "Coordinador BIM" | "Supervisor" | "Administración";

interface Contact {
    id: string;
    name: string;
    role: string;
    category: Category;
    phone: string;
    email: string;
    projects: { name: string; color: string }[];
    avatarColor: string;
    status: "activo" | "ocupado" | "inactivo";
    hasCvv?: boolean;
}

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

const MOCK_CONTACTS: Contact[] = [
    {
        id: "c1",
        name: "Diego Ramírez",
        role: "Ing. Residente de Obra",
        category: "Residente",
        phone: "+52 55 1234 5678",
        email: "d.ramirez@bitacoria.app",
        avatarColor: "from-[#C39767] to-amber-600",
        status: "activo",
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Residencial Pedregal", color: "#60a5fa" }],
        hasCvv: true
    },
    {
        id: "c2",
        name: "Valeria Santillán",
        role: "Desarrollo BIM L3",
        category: "Coordinador BIM",
        phone: "+52 55 9876 5432",
        email: "v.santillan@bitacoria.app",
        avatarColor: "from-blue-500 to-indigo-600",
        status: "ocupado",
        projects: [{ name: "Torre Reforma", color: "#C39767" }]
    },
    {
        id: "c3",
        name: "Carlos Medina",
        role: "Cálculo Estructural",
        category: "Estructurista",
        phone: "+52 33 4455 6677",
        email: "c.medina@estructuras.inc",
        avatarColor: "from-red-500 to-rose-700",
        status: "activo",
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Hospital Regional", color: "#34d399" }],
        hasCvv: true
    },
    {
        id: "c4",
        name: "Fernanda López",
        role: "Supervisora SSHA",
        category: "Supervisor",
        phone: "+52 81 2233 4455",
        email: "f.lopez@bitacoria.app",
        avatarColor: "from-emerald-400 to-teal-600",
        status: "activo",
        projects: [{ name: "Residencial Pedregal", color: "#60a5fa" }]
    },
    {
        id: "c5",
        name: "Roberto Garza",
        role: "Gerente de Finanzas",
        category: "Administración",
        phone: "+52 55 1122 3344",
        email: "r.garza@bitacoria.app",
        avatarColor: "from-purple-500 to-fuchsia-600",
        status: "inactivo",
        projects: []
    },
    {
        id: "c6",
        name: "Elena Torres",
        role: "Residente Junior",
        category: "Residente",
        phone: "+52 55 5566 7788",
        email: "e.torres@bitacoria.app",
        avatarColor: "from-amber-400 to-orange-500",
        status: "activo",
        projects: [{ name: "Hospital Regional", color: "#34d399" }]
    }
];

export default function ContactosDashboard() {
    const { isSidebarOpen, setIsSidebarOpen } = useDashboard();
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

    const categories = useMemo(() => ["Todas", ...Array.from(new Set(MOCK_CONTACTS.map(c => c.category)))], []);
    // Extracción única de todos los proyectos para el filtro
    const allProjects = useMemo(() => ["Todas las Obras", ...Array.from(new Set(MOCK_CONTACTS.flatMap(c => c.projects.map(p => p.name))))], []);

    const filteredContacts = useMemo(() => {
        return MOCK_CONTACTS.filter(c => {
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
            <div className={`relative group hidden xl:flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded || searchQuery ? 'w-[200px]' : 'w-9'}`}>
                <button
                    onClick={() => setIsSearchExpanded(true)}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center ${textMuted} hover:text-[#C39767] transition-colors z-10 ${isSearchExpanded || searchQuery ? 'pointer-events-none' : ''}`}
                >
                    <Search size={16} />
                </button>
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => setIsSearchExpanded(false)}
                    className={`w-full h-9 ${cardBg} border ${cardBorder} rounded-lg py-1.5 text-xs sm:text-sm ${textClass} placeholder:opacity-50 focus:outline-none focus:border-[#C39767]/50 transition-all duration-300 flex-1 ${isSearchExpanded || searchQuery ? 'pl-9 pr-3 opacity-100' : 'px-0 opacity-0 cursor-pointer pointer-events-none'}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                />
                {(isSearchExpanded || searchQuery) && (
                    <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted} transition-colors pointer-events-none`} />
                )}
            </div>

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
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
                            {/* Botón Añadir Principal (Dashed Pill) */}
                            <button
                                onClick={() => setIsAddContactModalOpen(true)}
                                className={`w-full py-4 md:py-5 rounded-2xl border-2 border-dashed ${isDark ? 'border-[#C39767]/30 hover:border-[#C39767]/60' : 'border-[#C39767]/40 hover:border-[#C39767]'} flex items-center justify-center gap-3 transition-all duration-300 group ${cardBg} hover:bg-[#C39767]/5 shadow-sm`}
                            >
                                <UserPlus size={20} className="text-[#C39767] group-hover:scale-110 transition-transform" />
                                <span className={`font-display font-medium text-sm md:text-base text-[#C39767] uppercase tracking-widest`}>
                                    Añadir Contacto
                                </span>
                            </button>

                            {/* Grid de Contactos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {filteredContacts.map(contact => {
                                    const Icon = CATEGORY_ICONS[contact.category] || Users;
                                    const color = CATEGORY_COLORS[contact.category];

                                    return (
                                        <div key={contact.id} className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover: border-[#C39767]/30 ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[#2A241E]/5'} hover: shadow-[0_0_30px_rgba(195, 151, 103, 0.06)]`}>

                                            {/* Status glowing line at top */}
                                            <div className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-500`}
                                                style={{ backgroundColor: contact.status === 'activo' ? '#34d399' : contact.status === 'ocupado' ? '#f59e0b' : '#52525b', opacity: 0.8 }} />

                                            <div className="p-5 pb-4 relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    {/* Avatar */}
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.avatarColor} p-[1px] shadow-lg`}>
                                                        <div className={`w-full h-full rounded-[11px] ${isDark ? 'bg-[#0a0a0a]/40' : 'bg-[#F4EFE6]/40'} backdrop-blur-md flex items-center justify-center font-display font-bold ${textClass} tracking-widest text-sm relative overflow-hidden`}>
                                                            <div className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'} mix-blend-overlay`} />
                                                            {contact.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                                        </div>
                                                    </div>

                                                    {/* Role Label */}
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ backgroundColor: `${color} 10`, borderColor: `${color} 20` }}>
                                                        <Icon size={12} style={{ color }} />
                                                        <span className="font-mono text-[9px] uppercase tracking-widest font-bold truncate max-w-[120px]" style={{ color }}>
                                                            {contact.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className={`text-base font-display font-semibold ${textClass} leading-tight mb-1`}>{contact.name}</h3>
                                                    <p className={`text-xs ${textMuted} `}>{contact.role}</p>
                                                </div>
                                            </div>

                                            {/* Info & Contact Box */}
                                            <div className={`px-5 py-3 ${isDark ? 'bg-[#0a0a0a]/50 border-white/[0.04]' : 'bg-[#E8E0D5]/30 border-[#2A241E]/[0.04]'} border-t border-b space-y-2.5`}>
                                                <div className={`flex items-center gap-2.5 ${textMuted} transition-colors group/tel cursor-pointer`}>
                                                    <div className={`w-6 h-6 rounded-md ${isDark ? 'bg-white/[0.03] group-hover/tel:bg-white/[0.08] border-white/[0.02]' : 'bg-[#2A241E]/[0.03] group-hover/tel:bg-[#2A241E]/[0.08] border-[#2A241E]/[0.02]'} flex items-center justify-center transition-colors border`}>
                                                        <Phone size={12} className={textClass} />
                                                    </div>
                                                    <span className="font-mono text-xs">{contact.phone}</span>
                                                </div>
                                                <div className={`flex items-center gap-2.5 ${textMuted} transition-colors group/mail cursor-pointer`}>
                                                    <div className={`w-6 h-6 rounded-md ${isDark ? 'bg-white/[0.03] group-hover/mail:bg-white/[0.08] border-white/[0.02]' : 'bg-[#2A241E]/[0.03] group-hover/mail:bg-[#2A241E]/[0.08] border-[#2A241E]/[0.02]'} flex items-center justify-center transition-colors border`}>
                                                        <Mail size={12} className={textClass} />
                                                    </div>
                                                    <span className="font-mono text-xs truncate pr-2">{contact.email}</span>
                                                </div>

                                                {contact.hasCvv && (
                                                    <div className={`flex items-center gap-2.5 ${textMuted} transition-colors group/cvv cursor-pointer`}>
                                                        <div className={`w-6 h-6 rounded-md ${isDark ? 'bg-white/[0.03] group-hover/cvv:bg-white/[0.08] border-white/[0.02]' : 'bg-[#2A241E]/[0.03] group-hover/cvv:bg-[#2A241E]/[0.08] border-[#2A241E]/[0.02]'} flex items-center justify-center transition-colors border`}>
                                                            <FileText size={12} className={textClass} />
                                                        </div>
                                                        <span className="font-mono text-xs">Ver CV (.pdf)</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Projects Footer */}
                                            <div className="p-4 mt-auto">
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <span className={`font-mono text-[10px] ${textFaint} uppercase tracking-widest`}>Obras asignadas</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setActiveChat(contact);
                                                                setTimeout(() => chatInputRef.current?.focus(), 100);
                                                            }}
                                                            className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-[#2A241E]/40 hover:text-[#2A241E] hover:bg-[#2A241E]/10'} `}
                                                            title="Enviar mensaje"
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        <button className={`${textFaint} hover: opacity-100 transition-colors p-1.5 rounded-md`}>
                                                            <MoreVertical size={14} className={textClass} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {contact.projects.length > 0 ? (
                                                        contact.projects.map(p => (
                                                            <span key={p.name} className={`flex items-center gap-1.5 px-2 py-1 rounded ${isDark ? 'bg-[#111] border-white/[0.06]' : 'bg-[#E8E0D5] border-[#2A241E]/10'} border font-mono text-[10px] leading-none whitespace-nowrap ${textMuted} `}>
                                                                <MapPin size={10} style={{ color: p.color }} />
                                                                {p.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className={`font-mono text-[10px] ${textFaint} italic`}>Disponible/Sin asignar</span>
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
                {/* MINI CHAT WIDGET */}
                {
                    activeChat && (
                        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-2rem)] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom-5">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${activeChat.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                                        {activeChat.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm leading-tight">{activeChat.name}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${activeChat.status === 'activo' ? 'bg-emerald-400' : activeChat.status === 'ocupado' ? 'bg-amber-400' : 'bg-zinc-500'}`} />
                                            <span className="text-white/40 text-xs">{activeChat.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setActiveChat(null)} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                        <MessageSquare size={32} className="mb-3 opacity-50" />
                                        <p className="text-sm">Envía un mensaje a {activeChat.name.split(" ")[0]}</p>
                                    </div>
                                ) : (
                                    chatMessages.map(msg => (
                                        <div key={msg.id} className="flex justify-end">
                                            <div className="bg-[#C39767]/20 border border-[#C39767]/30 text-white/90 text-sm py-2 px-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {/* Placeholder incoming message */}
                                {chatMessages.length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 border border-white/10 text-white/80 text-sm py-2 px-3 rounded-2xl rounded-tl-sm max-w-[85%] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-75" />
                                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-150" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!currentMessage.trim()) return;
                                        setChatMessages([...chatMessages, { id: Date.now(), text: currentMessage.trim() }]);
                                        setCurrentMessage("");
                                    }}
                                    className="flex items-end gap-2"
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
                                        placeholder="Escribe un mensaje..."
                                        className="flex-1 max-h-32 min-h-[40px] bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C39767]/50 resize-none custom-scrollbar"
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentMessage.trim()}
                                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#C39767] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4a878] transition-colors"
                                    >
                                        <Send size={16} className="ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Añadir Contacto Modal */}
                {isAddContactModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddContactModalOpen(false)} />

                        <div className={`relative w-[calc(100%-2rem)] max-w-md ${bgClass} border ${cardBorder} rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 flex flex-col overflow-hidden`}>

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
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
