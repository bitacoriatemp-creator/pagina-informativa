"use client";

import { useState, useEffect } from "react";
import {
    Home,
    Users,
    User,
    Settings,
    LifeBuoy,
    Plus,
    Menu,
    Search,
    Bell,
    ChevronDown,
    Key,
    HardHat,
    MoreVertical,
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
import { useThemeVars } from "@/hooks/useThemeVars";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
/* ══════════════════════════════════════════════════════════════
   DASHBOARD - MAIN HUB (Local State & Create Modal)
   ──────────────────────────────────────────────────────────────
   Esta es la vista inicial que maneja estado local para crear obras
   sin depender de una base de datos aún. Incluye fix de logo.
   ══════════════════════════════════════════════════════════════ */

import { Project, Role, TeamMember } from "@/types/project";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectFormModal from "@/components/dashboard/ProjectFormModal";
import DeleteConfirmModal from "@/components/dashboard/DeleteConfirmModal";

import { APPEARANCES, RECENT_ENGINEERS, DEFAULT_PROJECTS } from "@/utils/mockData";

import { useDashboard } from "@/context/DashboardContext";

export default function DashboardHub() {
    const { isSidebarOpen, setIsSidebarOpen } = useDashboard();
    const {
        theme,
        toggleTheme,
        isDark,
        mounted,
        bgClass,
        textClass,
        cardBg,
        cardBorder,
        textMuted,
        textFaint,
        hoverBg,
        topBarBg,
        sidebarBg,
        borderColor,
        activeItemBg,
        accentGlow
    } = useThemeVars();
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
        return DEFAULT_PROJECTS;
    });

    // Persist projects to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem("bitacoria_projects", JSON.stringify(projects));
        } catch { /* storage full or unavailable */ }
    }, [projects]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

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
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleSaveProject = (projectData: {
        title: string;
        subtitle: string;
        gradient: string;
        coverImage?: string | null;
        invitedUsers: { id: number, name: string, role: string }[];
    }) => {
        if (editingProject) {
            // Edit Mode
            setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...projectData, coverImage: projectData.coverImage || undefined } : p));
        } else {
            // Create Mode
            const newProject: Project = {
                id: Date.now().toString(),
                title: projectData.title,
                subtitle: projectData.subtitle,
                role: "Owner",
                gradient: projectData.gradient,
                coverImage: projectData.coverImage || undefined,
                ownerInitials: "EM",
                lastUpdated: "Justo ahora",
                team: [
                    { initials: "EM", role: "Owner", color: "bg-[#C39767]" },
                    ...(projectData.invitedUsers || []).map((inv, idx: number) => ({
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

    // ── DELETE MODAL ──
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; projectId: string | null; projectTitle: string }>({ open: false, projectId: null, projectTitle: "" });

    const handleDeleteRequest = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        setDeleteModal({ open: true, projectId: id, projectTitle: title });
    };

    const handleConfirmDelete = (projectId: string) => {
        setProjects(p => p.filter(pr => pr.id !== projectId));
        setDeleteModal({ open: false, projectId: null, projectTitle: "" });
    };

    if (!mounted) return null;

    return (
        <>
            {/* HORIZONTAL TOP BAR (SMART ISLAND) */}
            <DashboardTopBar
                activePage="inicio"
                pageTitle="Proyectos"
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                rightActions={
                    <div className="flex items-center gap-3 sm:gap-5">
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
                    </div>
                }
            />

            <main data-lenis-prevent className={`flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar relative ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
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
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDeleteClick={handleDeleteRequest}
                                onEditClick={handleOpenEditModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 3. MODAL COMPACTO (CREAR / EDITAR) */}
            <ProjectFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                initialProject={editingProject}
            />


            {/* ══════ MODAL: CONFIRMAR ELIMINACIÓN ══════ */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                projectId={deleteModal.projectId}
                projectTitle={deleteModal.projectTitle}
                onClose={() => setDeleteModal({ open: false, projectId: null, projectTitle: "" })}
                onConfirm={handleConfirmDelete}
            />

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
        </>
    );
}
