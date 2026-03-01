"use client";

import { useState } from "react";
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
    HardHat
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/assetPath";

/* ══════════════════════════════════════════════════════════════
   DASHBOARD - MAIN HUB (Empty State)
   ──────────────────────────────────────────────────────────────
   Esta es la vista inicial que ve un usuario nuevo sin obras.
   Incluye Sidebar enriquecido y un Empty State premium.
   ══════════════════════════════════════════════════════════════ */

export default function DashboardHub() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Empty state - Array vacío por defecto
    const MOCK_PROJECTS: any[] = [];

    return (
        <div className="flex h-screen bg-[#080808] text-white font-sans overflow-hidden">

            {/* 1. SIDEBAR IZQUIERDO */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0a] border-r border-[#222] flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Sidebar Header (Logo Real) */}
                <div className="h-16 flex items-center px-6 border-b border-[#222]">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image
                                src={assetPath("/images/logo2.png")}
                                alt="BitacorIA Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-display font-medium text-xl tracking-wide">
                            Bitacor<span className="text-[#C39767] font-semibold">IA</span>
                        </span>
                    </Link>
                </div>

                {/* Sidebar Navigation */}
                <div className="flex-1 overflow-y-auto py-6 flex flex-col custom-scrollbar">

                    {/* Primary Links */}
                    <div className="px-4 space-y-1 mb-8">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#C39767]/10 text-[#C39767] font-medium transition-colors">
                            <Home size={20} strokeWidth={2.5} />
                            <span>Inicio</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                            <CalendarDays size={20} strokeWidth={2} />
                            <span>Calendario Global</span>
                        </button>
                    </div>

                    {/* Obras (Vistas colapsables) */}
                    <div className="px-4 mb-8">
                        {/* Mis Obras */}
                        <div className="mb-4">
                            <div className="px-3 mb-2 flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors">
                                    <FolderGit2 size={16} />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Mis Obras</h3>
                                </div>
                                <ChevronDown size={14} className="text-white/40" />
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-xs text-white/30 italic">Ningún proyecto aún</p>
                            </div>
                        </div>

                        {/* Obras Compartidas */}
                        <div>
                            <div className="px-3 mb-2 flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors">
                                    <Users size={16} />
                                    <h3 className="text-xs font-bold uppercase tracking-widest">Compartidas Conmigo</h3>
                                </div>
                                <ChevronDown size={14} className="text-white/40" />
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-xs text-white/30 italic">No tienes invitaciones</p>
                            </div>
                        </div>
                    </div>

                    {/* Cuenta y Ajustes (Bottom) */}
                    <div className="mt-auto px-4 border-t border-[#222] pt-4 space-y-1 pb-4">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                            <User size={18} />
                            <span className="text-sm">Mi Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                            <Settings size={18} />
                            <span className="text-sm">Configuración</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors">
                            <LifeBuoy size={18} />
                            <span className="text-sm">Centro de Ayuda</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-colors mt-2">
                            <LogOut size={18} />
                            <span className="text-sm">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0a0a0a]">

                {/* Top Bar */}
                <header className="h-16 border-b border-[#222] bg-[#0d0d0d]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 -ml-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-display font-medium tracking-wide hidden sm:block">Proyectos</h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <button className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-colors hidden sm:block">
                            <Search size={20} />
                        </button>

                        <button className="flex items-center justify-center p-2 rounded-full hover:bg-white/5 text-white/80 hover:text-white transition-all group" title="Crear o unirse a una obra">
                            <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="w-px h-6 bg-[#333] hidden sm:block"></div>

                        <button className="relative p-2 text-white/70 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                            <Bell size={20} />
                        </button>

                        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C39767] to-amber-600 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white/10 hover:ring-white/30 transition-all cursor-pointer">
                            EM
                        </button>
                    </div>
                </header>

                {/* Dashboard EMPTY STATE */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative flex items-center justify-center">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#111] to-transparent pointer-events-none -z-10" />

                    {/* EMPTY STATE CONTAINER */}
                    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-[#333] bg-[#0d0d0d]/50 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-[#161616] flex items-center justify-center mb-8 border border-[#222] shadow-inner">
                            <HardHat size={40} className="text-white/20" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-2xl font-display font-medium text-white mb-3 tracking-wide">
                            Aún no formas parte de ninguna obra.
                        </h2>

                        <p className="text-white/50 mb-10 max-w-md text-sm leading-relaxed">
                            Ingresa un código de invitación de tu constructora, o crea un proyecto nuevo si eres administrador.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#C39767] text-white font-medium hover:bg-[#d4a878] transition-colors shadow-lg shadow-[#C39767]/20">
                                <Key size={18} />
                                <span>Ingresar Código</span>
                            </button>

                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-transparent border border-[#444] text-white/80 hover:bg-white/5 hover:text-white font-medium transition-colors">
                                <Plus size={18} />
                                <span>Crear Nueva Obra</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

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
            `}</style>
        </div>
    );
}
