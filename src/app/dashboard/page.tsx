"use client";

import { useState, useEffect, useRef } from "react";
import {
    Home,
    CalendarDays,
    FolderGit2,
    Users,
    User,
    Settings,
    LifeBuoy,
    LogOut,
    Plus,
    Menu,
    Search,
    Bell,
    ChevronDown,
    Key,
    HardHat,
    MoreVertical,
    Folder,
    ListTodo,
    QrCode,
    ImageIcon,
    Paintbrush,
    Palette,
    CheckCircle2,
    Copy,
    ChevronRight,
    X,
    AlertTriangle,
    Moon,
    SunDim,
    Trash2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { assetPath } from "@/lib/assetPath";
import { useTheme } from "@/components/ThemeProvider";

/* ══════════════════════════════════════════════════════════════
   DASHBOARD - MAIN HUB (Local State & Create Modal)
   ──────────────────────────────────────────────────────────────
   Esta es la vista inicial que maneja estado local para crear obras
   sin depender de una base de datos aún. Incluye fix de logo.
   ══════════════════════════════════════════════════════════════ */

type Role = "Owner" | "Editor" | "Viewer";

interface TeamMember {
    initials: string;
    name?: string;
    role: Role;
    color: string;
    lastActivity?: string;
}

interface Project {
    id: string;
    title: string;
    subtitle: string;
    role: Role;
    gradient: string;
    ownerInitials: string;
    lastUpdated?: string;
    lastEntry?: string;
    team?: TeamMember[];
    coverImage?: string; // base64 data URL for custom cover photo
}

// Lista de apariencias (Colores y Texturas simuladas)
const APPEARANCES = [
    { id: "solid-1", class: "from-slate-800 to-slate-950", name: "Gris Pizarra" },
    { id: "solid-2", class: "from-emerald-900 to-emerald-950", name: "Esmeralda Oscuro" },
    { id: "solid-3", class: "from-blue-900 to-slate-950", name: "Azul Noche" },
    { id: "text-1", class: "from-[#222] to-[#111] bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]", name: "Acero / Grid" },
    { id: "text-2", class: "from-[#2A231E] to-[#14120F]", name: "Madera" },
    { id: "text-3", class: "from-[#1e2022] to-[#0f1115]", name: "Concreto" }
];

// Usuarios mock para invitar
const RECENT_ENGINEERS = [
    { id: 1, name: "Luis (Ing. Supervisor)" },
    { id: 2, name: "Diego (Ing. Supervisor)" },
    { id: 3, name: "Erick (Cliente)" }
];

export default function DashboardHub() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, toggleTheme, mounted } = useTheme();

    const isDark = theme === "dark";

    // ── THEME VARIABLES ──
    const bgClass = isDark ? "bg-[#060606]" : "bg-[#F8F6F0]";
    const textClass = isDark ? "text-white" : "text-[#2A241E]";
    const sidebarBg = isDark ? "bg-[#080808]/95" : "bg-[#F4EFE6]/95";
    const borderColor = isDark ? "border-white/[0.06]" : "border-[#2A241E]/10";
    const topBarBg = isDark ? "bg-[#080808]/80" : "bg-[#F4EFE6]/80";
    const textMuted = isDark ? "text-white/60" : "text-[#1A1510]"; // Solid, very dark brown
    const textFaint = isDark ? "text-white/30" : "text-[#4A4035]"; // Solid medium brown
    const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-[#2A241E]/10";
    const activeItemBg = isDark ? "bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767]" : "bg-[#A87B4C]/10 border border-[#A87B4C]/20 text-[#A87B4C]";
    const accentGlow = isDark ? "from-transparent via-[#C39767]/40 to-transparent" : "from-transparent via-[#A87B4C]/40 to-transparent";
    const cardBg = isDark ? "bg-white/[0.02]" : "bg-white/60";
    const cardBorder = isDark ? "border-white/[0.07]" : "border-[#2A241E]/10";
    const bgPattern = isDark
        ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)"
        : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.06) 1px, transparent 0)";
    // ── ESTADOS DEL DASHBOARD ──
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("bitacoria_projects");
                if (saved) {
                    const parsed = JSON.parse(saved) as Project[];
                    // Migration: if team members are missing names, reset to defaults
                    const hasNames = parsed.every(p => (p.team || []).every(m => m.name));
                    if (parsed.length > 0 && hasNames) return parsed;
                }
            } catch { /* ignore corrupt data */ }
        }
        // Mockup properties if empty
        return [
            {
                id: "1",
                title: "Torre Reforma",
                subtitle: "CDMX",
                role: "Owner",
                gradient: "from-slate-800 to-slate-950",
                ownerInitials: "EM",
                lastUpdated: "5 Mar, 10:42 AM",
                lastEntry: "5 Mar, 10:38 AM — Colado de losa nivel 8",
                team: [
                    { initials: "EM", name: "Ernesto Molina", role: "Owner", color: "bg-[#C39767]", lastActivity: "5 Mar, 10:42 AM" },
                    { initials: "AR", name: "Ana Ríos", role: "Editor", color: "bg-blue-500", lastActivity: "5 Mar, 09:15 AM" },
                    { initials: "LP", name: "Luis Paredes", role: "Viewer", color: "bg-emerald-500", lastActivity: "4 Mar, 02:30 PM" },
                    { initials: "MG", name: "María González", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 11:00 AM" },
                    { initials: "RV", name: "Ricardo Vega", role: "Viewer", color: "bg-emerald-500", lastActivity: "3 Mar, 04:00 PM" },
                    { initials: "TS", name: "Tomás Santos", role: "Editor", color: "bg-blue-500", lastActivity: "3 Mar, 10:15 AM" }
                ]
            },
            {
                id: "2",
                title: "C.C. Oasis",
                subtitle: "Guadalajara",
                role: "Owner",
                gradient: "from-[#2A231E] to-[#14120F]",
                ownerInitials: "JN",
                lastUpdated: "4 Mar, 04:15 PM",
                lastEntry: "4 Mar, 03:50 PM — Revisión de fachada",
                team: [
                    { initials: "JN", name: "Javier Nájera", role: "Owner", color: "bg-[#C39767]", lastActivity: "4 Mar, 04:20 PM" },
                    { initials: "EM", name: "Ernesto Molina", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 04:15 PM" },
                    { initials: "SC", name: "Sara Castillo", role: "Viewer", color: "bg-emerald-500", lastActivity: "3 Mar, 09:00 AM" }
                ]
            }
        ];
    });

    // Persist projects to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem("bitacoria_projects", JSON.stringify(projects));
        } catch { /* storage full or unavailable */ }
    }, [projects]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"detalles" | "equipo" | "apariencia">("detalles");
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    // ── ESTADOS DEL FORMULARIO DE NUEVA OBRA ──
    const [formTitle, setFormTitle] = useState("");
    const [formStateLoc, setFormStateLoc] = useState("");
    const [formCity, setFormCity] = useState("");
    const [formStartDate, setFormStartDate] = useState("");
    const [formEndDate, setFormEndDate] = useState("");
    const [invitedUsers, setInvitedUsers] = useState<{ id: number, name: string, role: string }[]>([]);
    const [formAppearance, setFormAppearance] = useState(APPEARANCES[0].class);
    const [formCoverImage, setFormCoverImage] = useState<string | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Estados para Invitar (Pestaña Equipo)
    const [inviteCode, setInviteCode] = useState<string | null>(null);
    const [showContactList, setShowContactList] = useState(false);

    // ── MODAL INGRESAR CÓDIGO / INVITACIONES ──
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinTab, setJoinTab] = useState<"codigo" | "invitaciones">("codigo");
    const [joinCode, setJoinCode] = useState("");
    const [joinPassword, setJoinPassword] = useState("");
    const [joinError, setJoinError] = useState("");
    const [joinSuccess, setJoinSuccess] = useState(false);

    // Mock de invitaciones pendientes
    const [pendingInvites, setPendingInvites] = useState([
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
        // Simulate: BIT-2026-XXX codes are "valid"
        if (joinCode.toUpperCase().startsWith("BIT-")) {
            setJoinSuccess(true);
            setTimeout(() => {
                setIsJoinModalOpen(false);
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
            setProjects(prev => [{
                id: Date.now().toString(),
                title: inv.projectName,
                subtitle: "Miembro del Equipo",
                role: inv.role as Role,
                gradient: APPEARANCES[1].class,
                ownerInitials: inv.invitedBy.charAt(0)
            }, ...prev]);
        }
        setPendingInvites(prev => prev.filter(i => i.id !== id));
    };

    const handleDeclineInvite = (id: string) => {
        setPendingInvites(prev => prev.filter(i => i.id !== id));
    };

    // ── FUNCIONES ──
    const handleOpenCreateModal = () => {
        setEditingProjectId(null);
        setFormTitle("");
        setFormStateLoc("");
        setFormCity("");
        setFormStartDate("");
        setFormEndDate("");
        setInvitedUsers([]);
        setFormAppearance(APPEARANCES[0].class);
        setFormCoverImage(null);
        setInviteCode(null);
        setShowContactList(false);
        setActiveTab("detalles");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setEditingProjectId(project.id);
        setFormTitle(project.title);
        const parts = project.subtitle.split(", ");
        setFormCity(parts[0] || "");
        setFormStateLoc(parts[1] || "");
        setFormAppearance(project.gradient);
        setFormCoverImage(project.coverImage || null);
        setInviteCode(null);
        setShowContactList(false);
        setActiveTab("detalles");
        setIsModalOpen(true);
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

    const handleSaveProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        const subtitleStr = `${formCity}${formCity && formStateLoc ? ", " : ""}${formStateLoc}`.trim() || "Ubicación no especificada";

        if (editingProjectId) {
            // Edit Mode
            setProjects(projects.map(p => p.id === editingProjectId ? {
                ...p,
                title: formTitle,
                subtitle: subtitleStr,
                gradient: formAppearance,
                coverImage: formCoverImage ?? p.coverImage
            } : p));
        } else {
            // Create Mode
            const newProject: Project = {
                id: Date.now().toString(),
                title: formTitle,
                subtitle: subtitleStr,
                role: "Owner",
                gradient: formAppearance,
                coverImage: formCoverImage ?? undefined,
                ownerInitials: "EM",
                lastUpdated: "Justo ahora",
                team: [
                    { initials: "EM", role: "Owner", color: "bg-[#C39767]" },
                    ...invitedUsers.map((inv, idx) => ({
                        initials: inv.name.split(" ")[0].substring(0, 2).toUpperCase(),
                        role: inv.role as Role,
                        color: idx % 2 === 0 ? "bg-blue-500" : "bg-emerald-500"
                    }))
                ]
            };
            setProjects([newProject, ...projects]);
        }
        setIsModalOpen(false);
    };

    // ── DELETE MODAL WITH CONFIRM COUNTDOWN ──
    const DELETE_UNLOCK_SECONDS = 5;
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; projectId: string | null; projectTitle: string }>({ open: false, projectId: null, projectTitle: "" });
    const [deleteCountdown, setDeleteCountdown] = useState(DELETE_UNLOCK_SECONDS);
    const deleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleDeleteRequest = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        setDeleteModal({ open: true, projectId: id, projectTitle: title });
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
    };

    const handleCancelDelete = () => {
        if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
        setDeleteModal({ open: false, projectId: null, projectTitle: "" });
        setDeleteCountdown(DELETE_UNLOCK_SECONDS);
    };

    const handleConfirmDelete = () => {
        if (deleteCountdown > 0) return;
        setProjects(p => p.filter(pr => pr.id !== deleteModal.projectId));
        handleCancelDelete();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => { if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current); };
    }, []);

    if (!mounted) return null;

    return (
        <div className={`flex h-screen ${bgClass} ${textClass} font-sans overflow-hidden transition-colors duration-500`} style={{ backgroundImage: bgPattern, backgroundSize: "32px 32px" }}>

            {/* MOBILE OVERLAY (if needed later) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">

                {/* HORIZONTAL TOP BAR (SMART ISLAND) */}
                <header className={`h-16 border-b ${borderColor} ${topBarBg} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 transition-colors duration-500 ${isDark ? 'dark-topbar' : 'light-topbar'}`}>

                    {/* LEFT: Logo & Brand */}
                    <div className="flex items-center gap-4 sm:gap-6 h-full shrink-0">
                        <Link href="/" className="flex items-center justify-center relative cursor-pointer group h-full">
                            <div className={`w-[130px] h-full ${sidebarBg} border-x border-b ${borderColor} flex items-center justify-center shrink-0 rounded-b-2xl shadow-sm transition-colors px-3`}>
                                {isDark ? (
                                    <img src="/images/logo-bitacoria.webp" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <img src="/images/logo-bitacoria.webp" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_2px_10px_rgba(168,123,76,0.3)] transition-transform duration-300 group-hover:scale-105" style={{ filter: "brightness(0.3) sepia(1) hue-rotate(-30deg) saturate(3)" }} />
                                )}
                            </div>
                        </Link>

                        <div className="hidden sm:flex items-center gap-2">
                            <h1 className={`text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap`}>Proyectos</h1>
                        </div>
                    </div>

                    {/* CENTER: Smart Island Navigation */}
                    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 p-1.5 rounded-2xl shadow-sm border transition-colors duration-300"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        }}
                    >
                        <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${activeItemBg}`}>
                            <Home size={16} strokeWidth={2.5} className="shrink-0" />
                            <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[100px] ml-2 opacity-100">
                                Inicio
                            </span>
                        </button>

                        <Link href="/dashboard/contacts" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                            <Users size={16} strokeWidth={1.5} className="shrink-0" />
                            <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                                Contactos
                            </span>
                        </Link>

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

                    {/* RIGHT: Actions */}
                    <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0 ml-auto">
                        {/* Mobile Menu Toggle */}
                        <button className={`p-2 lg:hidden ${textMuted} rounded-lg ${hoverBg} transition-colors`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu size={20} />
                        </button>

                        <button className={`p-2 ${textMuted} rounded-full ${hoverBg} transition-colors hidden sm:block`}>
                            <Search size={20} />
                        </button>

                        {/* BOTÓN CREAR OBRA */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={`flex items-center justify-center p-2 rounded-full hover:bg-[#C39767]/20 hover:text-[#C39767] ${isDark ? 'text-white/80' : 'text-[#2A241E]/80'} transition-all group`}
                            title="Crear o unirse a una obra"
                        >
                            <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className={`w-px h-6 ${isDark ? 'bg-[#333]' : 'bg-[#2A241E]/10'} hidden sm:block`}></div>

                        {/* TEMA */}
                        <button
                            onClick={toggleTheme}
                            className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors`}
                            title="Cambiar Tema"
                        >
                            {theme === 'dark' ? <SunDim size={20} /> : <Moon size={20} />}
                        </button>

                        <button className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors hidden sm:block`}>
                            <Bell size={20} />
                        </button>

                        <Link href="/dashboard/profile" className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#C39767] to-amber-600 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ${isDark ? 'ring-white/10 hover:ring-white/30 text-white' : 'ring-[#2A241E]/10 hover:ring-[#2A241E]/30 text-white'} transition-all cursor-pointer`}>
                            EM
                        </Link>
                    </div>
                </header>

                <main data-lenis-prevent className={`flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar relative ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
                    {/* Ambient glow top-left */}
                    <div className="fixed top-0 left-64 w-[600px] h-[300px] bg-[#C39767]/[0.03] blur-[100px] pointer-events-none" />

                    {projects.length === 0 ? (
                        /* ── EMPTY STATE ── */
                        <div className="h-full flex items-center justify-center">
                            <div className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center p-10 rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm relative z-10 overflow-hidden`}>
                                {/* Grid pattern overlay */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: isDark ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)" : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.1) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                                {/* Gold accent corner */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C39767]/60 to-transparent" />
                                <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-[#111] border border-white/[0.08]' : 'bg-[#E8E0D5] border border-[#2A241E]/10'} flex items-center justify-center mb-7 shadow-inner relative z-10`}>
                                    <HardHat size={36} className="text-[#C39767]/60" strokeWidth={1.5} />
                                </div>

                                <span className={`font-mono text-[10px] tracking-[0.3em] ${textFaint} uppercase mb-3 relative z-10`}>ESTADO · VACÍO</span>
                                <h2 className={`text-xl font-display font-medium mb-3 tracking-wide relative z-10`}>
                                    Sin obras activas
                                </h2>

                                <p className={`${textMuted} mb-8 max-w-sm text-sm leading-relaxed relative z-10`}>
                                    Ingresa un código de invitación o crea un proyecto nuevo para comenzar a gestionar tu obra con IA.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center relative z-10">
                                    <button
                                        onClick={() => { setIsJoinModalOpen(true); setJoinTab("codigo"); }}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#C39767] text-black font-semibold hover:bg-[#d4a878] transition-colors shadow-lg shadow-[#C39767]/20 text-sm"
                                    >
                                        <Key size={16} />
                                        <span>Ingresar Código</span>
                                    </button>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg ${isDark ? 'bg-transparent border border-white/10 text-white/70 hover:bg-white/[0.04] hover:text-white' : 'bg-transparent border border-[#2A241E]/20 text-[#2A241E]/70 hover:bg-[#2A241E]/[0.06] hover:text-[#2A241E]'} font-medium transition-colors text-sm`}
                                    >
                                        <Plus size={16} />
                                        <span>Crear Nueva Obra</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── GRID DE PROYECTOS ── */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:border-[#C39767]/30 hover:${isDark ? 'bg-white/[0.04]' : 'bg-[#2A241E]/[0.04]'} hover:shadow-[0_0_40px_rgba(195,151,103,0.07)] h-[380px] cursor-pointer`}
                                >
                                    {/* Top accent line */}
                                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/10' : 'via-[#2A241E]/10'} to-transparent group-hover:via-[#C39767]/50 transition-all duration-500`} />

                                    {/* Header: proyecto gradient o solid color (o foto de portada) */}
                                    <div className={`h-[110px] ${!project.coverImage && !project.gradient.startsWith('#') ? 'bg-gradient-to-br ' + project.gradient : ''} p-4 flex flex-col justify-between relative overflow-hidden`}
                                        style={project.coverImage
                                            ? { backgroundImage: `url(${project.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : project.gradient.startsWith('#') ? { backgroundColor: project.gradient } : undefined}>
                                        {/* Overlay when cover photo is used */}
                                        {project.coverImage && <div className="absolute inset-0 bg-black/40" />}
                                        {/* Scanline effect */}
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />
                                        <div className="flex justify-between items-start relative z-10">
                                            <h2 className="text-lg font-display font-semibold text-white truncate max-w-[70%] leading-tight tracking-wide">
                                                {project.title}
                                            </h2>
                                            <div className="flex items-center gap-1">
                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => handleDeleteRequest(e, project.id, project.title)}
                                                    className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-400 p-1 rounded hover:bg-red-500/20 transition-all"
                                                    title="Eliminar obra"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEditModal(project); }}
                                                    className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white p-1 rounded hover:bg-black/30 transition-all"
                                                    title="Editar"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/60 font-mono truncate relative z-10 uppercase tracking-wider">{project.subtitle}</p>
                                    </div>

                                    {/* Body con la lista del equipo */}
                                    <div className="flex-1 px-4 pt-4 pb-4 flex flex-col justify-between">

                                        {/* Team List Box */}
                                        <div className="flex-1 min-h-0 relative group/teamlist">
                                            <div data-lenis-prevent className="absolute inset-0 overflow-y-auto custom-scrollbar pr-1 pb-5" style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 15px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 15px), transparent 100%)' }}>
                                                <div className="flex flex-col gap-2 relative z-20">
                                                    {(project.team || [{ initials: project.ownerInitials, role: project.role, color: 'bg-[#C39767]', lastActivity: undefined as string | undefined }]).map((member, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-3 px-1.5 py-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#2A241E]/5'}`}
                                                        >
                                                            <div className={`relative shrink-0 rounded-lg ${isDark ? 'bg-black/60' : 'bg-[#F8F6F0]'} backdrop-blur-md border ${cardBorder} flex items-center justify-center w-8 h-8 text-[10px] font-bold ${textClass} shadow-sm`}>
                                                                {member.initials}
                                                                <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${member.role === 'Owner' ? 'bg-[#C39767]' : member.role === 'Editor' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                            </div>
                                                            <div className="flex flex-col min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    {member.name && (
                                                                        <span className={`text-[10px] font-semibold ${textClass} truncate`}>{member.name}</span>
                                                                    )}
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${member.role === 'Owner' ? 'text-[#C39767]' : member.role === 'Editor' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                                        {member.role === 'Owner' && <HardHat size={10} className="inline mr-1 -mt-0.5" />}
                                                                        {member.role}
                                                                    </span>
                                                                </div>
                                                                {member.lastActivity && (
                                                                    <span className={`text-[9px] font-mono ${textFaint} leading-tight flex items-center gap-1 mt-0.5`} title="\u00daltima actividad del usuario">
                                                                        <Clock size={8} className="shrink-0" />
                                                                        {member.lastActivity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Scroll Indicator (Discreto, se muestra cuando hay más de 3 miembros) */}
                                            {project.team && project.team.length > 3 && (
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center opacity-40 group-hover/teamlist:opacity-100 transition-opacity duration-300">
                                                    <ChevronDown size={16} className={`animate-bounce ${textClass}`} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Controles de abajo (Fecha y Progreso) */}
                                        <div className="mt-4">
                                            {/* Status bar — fake progress for aesthetics */}
                                            <div className="space-y-1 mb-3">
                                                <div className={`flex justify-between items-center text-[10px] ${textFaint} font-mono uppercase tracking-wider`}>
                                                    <div className="flex items-center gap-1" title="Último registro en bitácora del proyecto">
                                                        <Clock size={9} className="text-[#C39767]" />
                                                        <span className="text-[#C39767] font-bold">REG</span>
                                                        <span className="truncate max-w-[120px]">{project.lastEntry || project.lastUpdated || "—"}</span>
                                                    </div>
                                                    <span>PROGRESO</span>
                                                </div>
                                                <div className={`h-[2px] w-full ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/10'} rounded-full overflow-hidden`}>
                                                    <div className="h-full w-1/3 bg-gradient-to-r from-[#C39767]/40 to-[#C39767] rounded-full" />
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className={`flex items-center justify-between border-t ${cardBorder} pt-3`}>
                                                <span className={`text-[10px] font-mono ${textFaint} uppercase tracking-wider`}>BIT-{project.id.slice(-4)}</span>
                                                <div className="flex gap-1">
                                                    <button className={`${textFaint} hover:text-[#C39767] transition-colors p-2 rounded-lg hover:bg-[#C39767]/10 active:scale-95`} title="Archivos">
                                                        <Folder size={16} strokeWidth={1.5} />
                                                    </button>
                                                    <button className={`${textFaint} ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-[#2A241E] hover:bg-[#2A241E]/10'} transition-colors p-2 rounded-lg active:scale-95`} title="Bitácora">
                                                        <ListTodo size={16} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* 3. MODAL COMPACTO (CREAR / EDITAR) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

                    <div className={`relative w-full max-w-md ${bgClass} border ${cardBorder} rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden`}>
                        {/* Header Modal */}
                        <div className={`px-5 py-4 border-b ${cardBorder} flex items-center justify-between ${topBarBg}`}>
                            <h2 className={`text-lg font-display font-medium ${textClass} flex items-center gap-2`}>
                                {editingProjectId ? <Paintbrush size={18} className="text-[#C39767]" /> : <Plus size={18} className="text-[#C39767]" />}
                                {editingProjectId ? "Personalizar" : "Crear Nueva Obra"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className={`${textMuted} hover:opacity-100 transition-colors`}><X size={20} /></button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className={`flex items-center border-b ${cardBorder} ${topBarBg}`}>
                            {([
                                { id: "detalles", label: "Detalles", icon: Folder },
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
                        <div data-lenis-prevent className={`p-5 overflow-y-auto custom-scrollbar flex-1 ${bgClass}`}>
                            <form id="projectForm" onSubmit={handleSaveProject}>

                                {/* ──────── TAB: DETALLES ──────── */}
                                {activeTab === "detalles" && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-wider mb-2`}>Nombre del Proyecto *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formTitle}
                                                onChange={(e) => setFormTitle(e.target.value)}
                                                className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2.5 ${textClass} placeholder:opacity-40 focus:outline-none focus:border-[#C39767] focus:ring-1 focus:ring-[#C39767] transition-all text-sm`}
                                                placeholder="Ej. Torre Reforma 2026"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-wider mb-2`}>Estado</label>
                                                <input
                                                    type="text"
                                                    value={formStateLoc}
                                                    onChange={(e) => setFormStateLoc(e.target.value)}
                                                    className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2 ${textClass} placeholder:opacity-40 focus:outline-none focus:border-[#C39767] transition-all text-sm`}
                                                    placeholder="Ej. CDMX"
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-wider mb-2`}>Localidad</label>
                                                <input
                                                    type="text"
                                                    value={formCity}
                                                    onChange={(e) => setFormCity(e.target.value)}
                                                    className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2 ${textClass} placeholder:opacity-40 focus:outline-none focus:border-[#C39767] transition-all text-sm`}
                                                    placeholder="Ej. Cuauhtémoc"
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-wider mb-2`}>Inicio</label>
                                                <input
                                                    type="date"
                                                    value={formStartDate}
                                                    onChange={(e) => setFormStartDate(e.target.value)}
                                                    className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2 ${textClass} focus:outline-none focus:border-[#C39767] transition-all text-sm ${isDark ? 'color-scheme-dark' : ''}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-wider mb-2`}>Fin Estimado</label>
                                                <input
                                                    type="date"
                                                    value={formEndDate}
                                                    onChange={(e) => setFormEndDate(e.target.value)}
                                                    className={`w-full ${cardBg} border ${cardBorder} rounded-lg px-3 py-2 ${textClass} focus:outline-none focus:border-[#C39767] transition-all text-sm ${isDark ? 'color-scheme-dark' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ──────── TAB: EQUIPO ──────── */}
                                {activeTab === "equipo" && (
                                    <div className="space-y-4">
                                        <p className={`text-[13px] ${textMuted} mb-2 leading-relaxed`}>
                                            Invita a constructores, residentes o clientes para que tengan acceso a los catálogos y reportes de obra.
                                        </p>

                                        {/* Botón Generar Código */}
                                        <div className={`${cardBg} border ${cardBorder} rounded-xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#C39767]/5 to-transparent pointer-events-none" />
                                            {!inviteCode ? (
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateCode}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#C39767]/10 hover:bg-[#C39767]/20 text-[#C39767] rounded-lg transition-colors border border-[#C39767]/20 text-sm font-medium w-full justify-center relative z-10"
                                                >
                                                    <QrCode size={18} />
                                                    Generar código de invitación
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
                                                        <img src={formCoverImage} alt="Portada" className="absolute inset-0 w-full h-full object-cover" />
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
                                onClick={() => setIsModalOpen(false)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${textMuted} hover:opacity-100 ${hoverBg} transition-colors`}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="projectForm"
                                className="px-5 py-2 rounded-lg text-sm font-medium bg-[#C39767] text-white hover:bg-[#d4a878] shadow-lg shadow-[#C39767]/20 transition-all flex items-center gap-2"
                            >
                                {editingProjectId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                                {editingProjectId ? "Guardar Cambios" : "Crear Obra"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* ══════ MODAL: CONFIRMAR ELIMINACIÓN ══════ */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={handleCancelDelete} />
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
                                {deleteModal.projectTitle}
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
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
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
            )}

            {/* ══════ MODAL: INGRESAR CÓDIGO / INVITACIONES ══════ */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsJoinModalOpen(false)} />
                    <div className={`relative w-full max-w-md ${bgClass} border ${cardBorder} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>

                        {/* Header */}
                        <div className={`px-5 py-4 border-b ${cardBorder} flex items-center justify-between ${topBarBg}`}>
                            <h2 className={`text-base font-display font-semibold ${textClass} flex items-center gap-2`}>
                                <Key size={16} className="text-[#C39767]" />
                                Unirse a una Obra
                            </h2>
                            <button onClick={() => setIsJoinModalOpen(false)} className={`${textMuted} hover:opacity-100 transition-colors`}><X size={18} /></button>
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

                            {/* ─ TAB: CÓDIGO ─ */}
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
                                                <button type="button" onClick={() => setIsJoinModalOpen(false)} className={`px-4 py-2 rounded-lg text-sm ${textMuted} hover:opacity-100 ${hoverBg} transition-colors`}>Cancelar</button>
                                                <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#C39767] text-white hover:bg-[#d4a878] transition-all shadow-lg shadow-[#C39767]/20 flex items-center gap-2">
                                                    <Key size={15} /> Unirme
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            )}

                            {/* ─ TAB: INVITACIONES ─ */}
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
                                                {/* Color bar */}
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
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                .color-scheme-dark {
                    color-scheme: dark;
                }
            `}</style>
        </div>
    );
}
