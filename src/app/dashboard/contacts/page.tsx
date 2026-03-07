"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
    Home,
    Users,
    User,
    Settings,
    LifeBuoy,
    Menu,
    Filter,
    Search,
    Phone,
    Mail,
    HardHat,
    Briefcase,
    ShieldCheck,
    Laptop,
    MapPin,
    MessageSquare,
    MoreVertical,
    Wrench,
    X,
    Send
} from "lucide-react";

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
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Residencial Pedregal", color: "#60a5fa" }]
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
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Hospital Regional", color: "#34d399" }]
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);
    const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);

    // Chat states
    const [activeChat, setActiveChat] = useState<Contact | null>(null);
    const [currentMessage, setCurrentMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<{ id: number, text: string }[]>([]);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    const { theme, toggleTheme, mounted } = useTheme();

    const isDark = theme === "dark";

    // ── THEME VARIABLES ──
    const bgClass = isDark ? "bg-[#060606]" : "bg-[#F8F6F0]";
    const textClass = isDark ? "text-white" : "text-[#2A241E]";
    const sidebarBg = isDark ? "bg-[#080808]/95" : "bg-[#F4EFE6]/95";
    const borderColor = isDark ? "border-white/[0.06]" : "border-[#2A241E]/10";
    const topBarBg = isDark ? "bg-[#080808]/80" : "bg-[#F4EFE6]/80";
    const textMuted = isDark ? "text-white/60" : "text-[#2A241E]";
    const textFaint = isDark ? "text-white/30" : "text-[#4A4035]";
    const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-[#2A241E]/10";
    const activeItemBg = isDark ? "bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767]" : "bg-[#A87B4C]/10 border border-[#A87B4C]/20 text-[#A87B4C]";
    const accentGlow = isDark ? "from-transparent via-[#C39767]/40 to-transparent" : "from-transparent via-[#A87B4C]/40 to-transparent";
    const cardBg = isDark ? "bg-white/[0.02]" : "bg-white/60";
    const cardBorder = isDark ? "border-white/[0.07]" : "border-[#2A241E]/10";
    const bgPattern = isDark
        ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)"
        : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.06) 1px, transparent 0)";
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

    /* ── HORIZONTAL TOP BAR (SMART ISLAND) ── */
    const TopBar = () => (
        <header className={`h-16 border-b ${borderColor} ${topBarBg} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 transition-colors duration-500 ${isDark ? 'dark-topbar' : 'light-topbar'}`}>

            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-4 sm:gap-6 h-full shrink-0">
                <Link href="/" className="flex items-center justify-center relative cursor-pointer group h-full">
                    <div className={`w-[130px] h-full ${sidebarBg} border-x border-b ${borderColor} flex items-center justify-center shrink-0 rounded-b-2xl shadow-sm transition-colors px-3`}>
                        {isDark ? (
                            <img src="/images/logo_horizontal-removebg-preview.png" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                            <img src="/images/logo_horizontal-removebg-preview.png" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_2px_10px_rgba(168,123,76,0.3)] transition-transform duration-300 group-hover:scale-105" style={{ filter: "brightness(0.3) sepia(1) hue-rotate(-30deg) saturate(3)" }} />
                        )}
                    </div>
                </Link>

                <div className="hidden sm:flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${textFaint} uppercase tracking-widest`}>BIT —</span>
                    <h1 className={`text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap`}>Contactos</h1>
                </div>
            </div>

            {/* CENTER: Smart Island Navigation */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 p-1.5 rounded-2xl shadow-sm border transition-colors duration-300"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
            >
                <Link href="/dashboard" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                    <Home size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Inicio
                    </span>
                </Link>

                <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${activeItemBg}`}>
                    <Users size={16} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[100px] ml-2 opacity-100">
                        Contactos
                    </span>
                </button>

                <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>

                <Link href="/dashboard/profile" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                    <User size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Perfil
                    </span>
                </Link>

                <Link href="/dashboard/settings" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                    <Settings size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[120px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Configuración
                    </span>
                </Link>

                <Link href="/dashboard/help" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                    <LifeBuoy size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Ayuda
                    </span>
                </Link>
            </nav>

            {/* RIGHT: Actions & Filters */}
            <div className="flex items-center justify-end gap-2 lg:gap-3 shrink-0 ml-auto">
                <button className={`p-1.5 ${textMuted} rounded-lg ${hoverBg} lg:hidden`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu size={22} />
                </button>

                <div
                    className={`relative group hidden xl:flex items-center transition-all duration-300 ease-in-out ${isSearchExpanded || searchQuery ? 'w-[200px]' : 'w-9'
                        }`}
                >
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
                        className={`w-full h-9 ${cardBg} border ${cardBorder} rounded-lg py-1.5 text-xs sm:text-sm ${textClass} placeholder:opacity-50 focus:outline-none focus:border-[#C39767]/50 transition-all duration-300 flex-1 ${isSearchExpanded || searchQuery ? 'pl-9 pr-3 opacity-100' : 'px-0 opacity-0 cursor-pointer pointer-events-none'
                            }`}
                        style={{ outline: 'none', boxShadow: 'none' }}
                    />
                    {(isSearchExpanded || searchQuery) && (
                        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted} text-[#C39767] transition-colors pointer-events-none`} />
                    )}
                </div>

                {/* Project Filter - collapsible */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => { setIsProjectFilterOpen(!isProjectFilterOpen); setIsCategoryFilterOpen(false); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 ${cardBorder} ${isProjectFilterOpen || filterProject !== 'Todas las Obras'
                            ? `${isDark ? 'bg-[#C39767]/10 text-[#C39767] border-[#C39767]/30' : 'bg-[#A87B4C]/10 text-[#A87B4C] border-[#A87B4C]/30'}`
                            : `${cardBg} ${textMuted} ${hoverBg}`
                            }`}
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
                                    className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${filterProject === p
                                        ? isDark ? 'bg-[#C39767]/10 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'
                                        : `${textClass} ${hoverBg}`
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Category Filter - collapsible */}
                <div className="relative hidden md:block">
                    <button
                        onClick={() => { setIsCategoryFilterOpen(!isCategoryFilterOpen); setIsProjectFilterOpen(false); }}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-200 ${cardBorder} ${isCategoryFilterOpen || filterCategory !== 'Todas'
                            ? `${isDark ? 'bg-[#C39767]/10 text-[#C39767] border-[#C39767]/30' : 'bg-[#A87B4C]/10 text-[#A87B4C] border-[#A87B4C]/30'}`
                            : `${cardBg} ${textMuted} ${hoverBg}`
                            }`}
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
                                    className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${filterCategory === c
                                        ? isDark ? 'bg-[#C39767]/10 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'
                                        : `${textClass} ${hoverBg}`
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`w-px h-6 ${isDark ? 'bg-[#333]' : 'bg-[#2A241E]/10'} hidden sm:block mx-1`}></div>

                <button className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#C39767] to-amber-600 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ${isDark ? 'ring-white/10 hover:ring-white/30 text-white' : 'ring-[#2A241E]/10 hover:ring-[#2A241E]/30 text-white'} transition-all cursor-pointer shrink-0`}>
                    EM
                </button>
            </div>
        </header>
    );

    return (
        <div className={`flex h-screen ${bgClass} ${textClass} font-sans overflow-hidden transition-colors duration-500`}
            style={{ backgroundImage: bgPattern, backgroundSize: "32px 32px" }}>

            {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">

                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C39767]/5 blur-[120px] rounded-full pointer-events-none" />

                <TopBar />

                {/* Directorio Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6" data-lenis-prevent>
                    {filteredContacts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className={`w-16 h-16 rounded-2xl ${cardBg} border ${cardBorder} flex items-center justify-center mb-4`}>
                                <Search size={24} className={textFaint} />
                            </div>
                            <h3 className={`${textClass} opacity-80 font-display font-medium mb-1`}>No se encontraron ingenieros</h3>
                            <p className={`${textMuted} text-sm`}>Cambia tu búsqueda o los filtros aplicados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 relative z-10">
                            {filteredContacts.map(contact => {
                                const Icon = CATEGORY_ICONS[contact.category] || Users;
                                const color = CATEGORY_COLORS[contact.category];

                                return (
                                    <div key={contact.id} className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:border-[#C39767]/30 ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[#2A241E]/5'} hover:shadow-[0_0_30px_rgba(195,151,103,0.06)]`}>

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
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ backgroundColor: `${color}10`, borderColor: `${color}20` }}>
                                                    <Icon size={12} style={{ color }} />
                                                    <span className="font-mono text-[9px] uppercase tracking-widest font-bold truncate max-w-[120px]" style={{ color }}>
                                                        {contact.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className={`text-base font-display font-semibold ${textClass} leading-tight mb-1`}>{contact.name}</h3>
                                                <p className={`text-xs ${textMuted}`}>{contact.role}</p>
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
                                                        className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-[#2A241E]/40 hover:text-[#2A241E] hover:bg-[#2A241E]/10'}`}
                                                        title="Enviar mensaje"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </button>
                                                    <button className={`${textFaint} hover:opacity-100 transition-colors p-1.5 rounded-md`}>
                                                        <MoreVertical size={14} className={textClass} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {contact.projects.length > 0 ? (
                                                    contact.projects.map(p => (
                                                        <span key={p.name} className={`flex items-center gap-1.5 px-2 py-1 rounded ${isDark ? 'bg-[#111] border-white/[0.06]' : 'bg-[#E8E0D5] border-[#2A241E]/10'} border font-mono text-[10px] leading-none whitespace-nowrap ${textMuted}`}>
                                                            <MapPin size={10} style={{ color: p.color }} />
                                                            {p.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className={`font-mono text-[10px] ${textFaint} italic`}>Disponible / Sin asignar</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* MINI CHAT WIDGET */}
            {activeChat && (
                <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-8 w-80 sm:w-80 shadow-2xl z-[100] flex flex-col rounded-xl border ${cardBorder} ${isDark ? 'bg-[#111]/95' : 'bg-white/95'} backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 overflow-hidden`}>

                    {/* Chat Header */}
                    <div className={`px-4 py-3 flex items-center justify-between border-b ${cardBorder} ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeChat.avatarColor} p-[1px] shadow-sm`}>
                                    <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#0a0a0a]/60' : 'bg-[#F4EFE6]/60'} backdrop-blur-sm flex items-center justify-center font-display font-bold ${textClass} tracking-widest text-[10px]`}>
                                        {activeChat.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: activeChat.status === 'activo' ? '#34d399' : activeChat.status === 'ocupado' ? '#f59e0b' : '#52525b' }} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold ${textClass} truncate leading-tight`}>{activeChat.name}</p>
                                <p className={`text-[10px] ${textMuted} truncate`}>{activeChat.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveChat(null)}
                            className={`p-1 rounded-md ${textFaint} hover:text-[#C39767] transition-colors shrink-0`}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div data-lenis-prevent className={`flex-1 min-h-[200px] max-h-[250px] overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar text-sm ${isDark ? 'bg-[#0a0a0a]/50' : 'bg-[#F8F6F0]/50'}`}>
                        {/* Pinned Info Message */}
                        <div className="flex flex-col items-center justify-center my-2">
                            <ShieldCheck size={18} className="text-[#C39767] mb-1 opacity-80" />
                            <p className={`text-[10px] font-mono text-center px-4 ${textFaint}`}>
                                CANAL SEGURO · AVISOS Y REPORTES
                            </p>
                            <p className={`text-[9px] text-center mt-1 text-[#C39767] opacity-60`}>Solo se permite texto en este canal</p>
                        </div>

                        {/* Dummy message */}
                        <div className="self-start max-w-[85%]">
                            <div className={`p-2.5 rounded-2xl rounded-tl-sm ${isDark ? 'bg-white/10 text-white/90' : 'bg-[#2A241E]/10 text-[#2A241E]/90'} border ${cardBorder}`}>
                                <p className="leading-snug">Hola, ¿todo bien en la obra de hoy?</p>
                            </div>
                            <p className={`text-[9px] ${textFaint} mt-1 ml-1`}>09:41 AM</p>
                        </div>

                        {/* Sent message */}
                        {chatMessages.map(msg => (
                            <div key={msg.id} className="self-end max-w-[85%]">
                                <div className={`p-2.5 rounded-2xl rounded-tr-sm bg-[#C39767] text-black border border-transparent`}>
                                    <p className="leading-snug">{msg.text}</p>
                                </div>
                                <p className={`text-[9px] ${textFaint} mt-1 text-right mr-1`}>Justo ahora</p>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!currentMessage.trim()) return;
                            setChatMessages([...chatMessages, { id: Date.now(), text: currentMessage.trim() }]);
                            setCurrentMessage("");
                        }}
                        className={`p-3 border-t ${cardBorder} flex gap-2 items-end`}
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
                            placeholder="Escribe un aviso o reporte..."
                            className={`flex-1 max-h-[80px] min-h-[36px] bg-transparent border-0 focus:ring-0 resize-none py-1.5 px-2 text-sm ${textClass} placeholder:opacity-40 custom-scrollbar`}
                            rows={1}
                        />
                        <button
                            type="submit"
                            disabled={!currentMessage.trim()}
                            className={`p-2 rounded-full flex-shrink-0 transition-all ${currentMessage.trim()
                                ? 'bg-[#C39767] text-black hover:scale-105'
                                : `${isDark ? 'bg-white/5 text-white/20' : 'bg-black/5 text-black/20'}`
                                }`}
                        >
                            <Send size={14} className={currentMessage.trim() ? "translate-x-[1px] -translate-y-[1px]" : ""} />
                        </button>
                    </form>
                </div>
            )}

        </div>
    );
}
