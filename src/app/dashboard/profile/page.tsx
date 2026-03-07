"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
    Home,
    Users,
    FolderGit2,
    User,
    Settings,
    LifeBuoy,
    Menu,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Zap,
    ShieldCheck,
    CheckCircle2,
    HardHat,
    Calendar,
    Camera,
    Building2,
    Moon,
    SunDim
} from "lucide-react";

export default function ProfileDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, toggleTheme, mounted } = useTheme();
    const isDark = theme === "dark";


    if (!mounted) return null;

    // ── THEME VARIABLES ──
    const bgClass = isDark ? "bg-[#060606]" : "bg-[#F8F6F0]";
    const textClass = isDark ? "text-white" : "text-[#2A241E]";
    const sidebarBg = isDark ? "bg-[#080808]/95" : "bg-[#F4EFE6]/95";
    const borderColor = isDark ? "border-white/[0.06]" : "border-[#2A241E]/10";
    const topBarBg = isDark ? "bg-[#080808]/80" : "bg-[#F4EFE6]/80";
    const textMuted = isDark ? "text-white/60" : "text-[#1A1510]";
    const textFaint = isDark ? "text-white/30" : "text-[#4A4035]";
    const hoverBg = isDark ? "hover:bg-white/5" : "hover:bg-[#2A241E]/10";
    const activeItemBg = isDark ? "bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767]" : "bg-[#A87B4C]/10 border border-[#A87B4C]/20 text-[#A87B4C]";
    const accentGlow = isDark ? "from-transparent via-[#C39767]/40 to-transparent" : "from-transparent via-[#A87B4C]/40 to-transparent";
    const cardBg = isDark ? "bg-white/[0.02]" : "bg-white/60";
    const cardBorder = isDark ? "border-white/[0.07]" : "border-[#2A241E]/10";
    const bgPattern = isDark
        ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)"
        : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.06) 1px, transparent 0)";

    // Mock User Data
    const user = {
        name: "Eduardo Mora",
        email: "eduardo.mora@constructora.com",
        phone: "+52 55 1234 5678",
        role: "Director de Obra",
        company: "Construcciones y Desarrollos EM",
        location: "Ciudad de México, MX",
        joinDate: "Enero 2026",
        avatarGrad: "from-[#C39767] to-amber-600",
        stats: {
            activeProjects: 4,
            completedProjects: 12,
            teamMembers: 28,
        },
        organization: {
            name: "Construcciones y Desarrollos EM",
            roleStatus: "Suscripción Administrada por Empresa",
            accessLevel: "Colaborador (Nivel 2)",
            features: [
                "Acceso a Bitácora Digital en tiempo real",
                "Permisos de revisión en modelos BIM",
                "Firma electrónica autorizada",
                "Sincronización móvil offline"
            ]
        }
    };

    /* ── HORIZONTAL TOP BAR (SMART ISLAND) ── */
    const TopBar = () => (
        <header className={`h-16 border-b ${borderColor} ${topBarBg} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 transition-colors duration-500 ${isDark ? 'dark-topbar' : 'light-topbar'}`}>

            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-4 sm:gap-6 h-full shrink-0">
                <Link href="/" className="flex items-center justify-center relative cursor-pointer group h-full">
                    <div className={`w-[130px] h-full ${sidebarBg} border-x border-b ${borderColor} flex items-center justify-center shrink-0 rounded-b-2xl shadow-sm transition-colors px-3`}>
                        {isDark ? (
                            <Image src="/images/logo_horizontal-removebg-preview.png" alt="BitacorIA Logo" width={130} height={64} className="object-contain w-full drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                            <Image src="/images/logo_horizontal-removebg-preview.png" alt="BitacorIA Logo" width={130} height={64} className="object-contain w-full drop-shadow-[0_2px_10px_rgba(168,123,76,0.3)] transition-transform duration-300 group-hover:scale-105" style={{ filter: "brightness(0.3) sepia(1) hue-rotate(-30deg) saturate(3)" }} />
                        )}
                    </div>
                </Link>

                <div className="hidden sm:flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${textFaint} uppercase tracking-widest`}>BIT —</span>
                    <h1 className={`text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap`}>Mi Perfil</h1>
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

                <Link href="/dashboard/contacts" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                    <Users size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Contactos
                    </span>
                </Link>

                <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>

                <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${activeItemBg}`}>
                    <User size={16} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[100px] ml-2 opacity-100">
                        Perfil
                    </span>
                </button>

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
                <button className={`p-2 lg:hidden ${textMuted} rounded-lg ${hoverBg} transition-colors`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu size={20} />
                </button>

                <button
                    onClick={toggleTheme}
                    className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors`}
                    title="Cambiar Tema"
                >
                    {theme === 'dark' ? <SunDim size={20} /> : <Moon size={20} />}
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
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#C39767]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

                <TopBar />

                {/* Profile Scroll Area */}
                <main data-lenis-prevent className={`flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10 ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
                    <div className="max-w-5xl mx-auto space-y-6">

                        {/* Banner & Identidad */}
                        <div className={`rounded-3xl border ${cardBorder} ${cardBg} backdrop-blur-md overflow-hidden flex flex-col shadow-2xl`}>
                            {/* Banner Gradient */}
                            <div className="h-32 md:h-40 bg-gradient-to-r from-[#1a1a1a] via-[#2a241e] to-[#C39767]/20 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }} />
                            </div>

                            <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-16 md:-mt-20 relative z-10">
                                {/* Avatar Grande */}
                                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${user.avatarGrad} p-1 shadow-2xl flex-shrink-0 relative group cursor-pointer`}>
                                    <div className={`w-full h-full rounded-[22px] ${isDark ? 'bg-[#0a0a0a]/60' : 'bg-[#E8E0D5]/60'} backdrop-blur-xl flex items-center justify-center font-display font-bold ${textClass} text-4xl relative overflow-hidden transition-all duration-300 ${isDark ? 'group-hover:bg-[#0a0a0a]/80' : 'group-hover:bg-[#E8E0D5]/80'}`}>
                                        <div className={`absolute inset-0 ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'} mix-blend-overlay`} />
                                        <span className="group-hover:opacity-0 transition-opacity duration-300">
                                            {user.name.split(" ").map(n => n[0]).join("")}
                                        </span>
                                        {/* Edit Overlay */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Camera size={28} className={`${textClass} mb-2`} />
                                            <span className={`text-[10px] font-mono uppercase tracking-widest ${textMuted} font-medium`}>Cambiar</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left mb-2">
                                    <h2 className={`text-3xl md:text-4xl font-display font-bold ${textClass} tracking-wide mb-2`}>{user.name}</h2>
                                    <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm ${textMuted} font-medium`}>
                                        <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-[#C39767]" /> {user.role}</span>
                                        <span className={`hidden md:inline ${textFaint}`}>•</span>
                                        <span className="flex items-center gap-1.5"><HardHat size={16} className={textClass} /> {user.company}</span>
                                    </div>
                                </div>

                                <button className={`mt-4 md:mt-0 px-6 py-2.5 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-[#2A241E]/5 hover:bg-[#2A241E]/10'} border ${cardBorder} ${textClass} font-medium flex items-center justify-center gap-2 transition-all`}>
                                    <Settings size={16} /> Editar Perfil
                                </button>
                            </div>
                        </div>

                        {/* Grid de Contenido Segmentado */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Columna Izquierda: Información de Contacto e Identidad */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* Tarjeta Detalles Personales */}
                                <div className={`rounded-3xl border ${cardBorder} ${cardBg} backdrop-blur-md p-6`}>
                                    <h3 className={`text-sm font-display font-bold ${textClass} opacity-90 uppercase tracking-widest mb-6 flex items-center gap-2`}>
                                        <User size={16} className="text-[#C39767]" /> Información
                                    </h3>

                                    <div className="space-y-5">
                                        <div>
                                            <p className={`text-[10px] font-mono ${textFaint} uppercase tracking-widest mb-1.5`}>Correo Electrónico</p>
                                            <div className={`flex items-center gap-3 ${textClass} opacity-90 font-medium`}>
                                                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} flex items-center justify-center`}><Mail size={14} className={textMuted} /></div>
                                                {user.email}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-mono ${textFaint} uppercase tracking-widest mb-1.5`}>Número de Celular</p>
                                            <div className={`flex items-center gap-3 ${textClass} opacity-90 font-mono`}>
                                                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} flex items-center justify-center`}><Phone size={14} className={textMuted} /></div>
                                                {user.phone}
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-mono ${textFaint} uppercase tracking-widest mb-1.5`}>Ubicación Global</p>
                                            <div className={`flex items-center gap-3 ${textClass} opacity-90 font-medium`}>
                                                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} flex items-center justify-center`}><MapPin size={14} className={textMuted} /></div>
                                                {user.location}
                                            </div>
                                        </div>
                                        <div className={`pt-4 mt-2 border-t ${borderColor}`}>
                                            <p className={`text-[10px] font-mono ${textFaint} uppercase tracking-widest mb-1.5`}>Miembro Desde</p>
                                            <div className={`flex items-center gap-3 ${textMuted} font-medium text-sm`}>
                                                <Calendar size={14} className={textFaint} />
                                                {user.joinDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Columna Derecha: Plan de Suscripción y Estadísticas */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Estadísticas Rápidas */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: "Obras Activas", value: user.stats.activeProjects, icon: FolderGit2, color: "#34d399" },
                                        { label: "Obras Finalizadas", value: user.stats.completedProjects, icon: HardHat, color: "#60a5fa" },
                                        { label: "Miembros Equipo", value: user.stats.teamMembers, icon: Users, color: "#a78bfa" }
                                    ].map((stat, i) => (
                                        <div key={i} className={`rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-md p-5 flex flex-col items-start gap-3 ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-[#2A241E]/5'} transition-colors`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'}`} style={{ color: stat.color }}>
                                                <stat.icon size={20} strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <h4 className={`text-2xl font-display font-bold ${textClass} leading-none mb-1`}>{stat.value}</h4>
                                                <p className={`text-[11px] font-mono ${textFaint} uppercase tracking-wide`}>{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tarjeta de Organización Activa (Perfil Trabajador) */}
                                <div className={`rounded-3xl border border-blue-500/20 ${isDark ? 'bg-gradient-to-b from-[#0a0c10]/80 to-[#060606]' : 'bg-gradient-to-b from-[#E8E0D5]/80 to-[#F8F6F0]'} backdrop-blur-md p-1 relative overflow-hidden shadow-[0_0_50px_rgba(96,165,250,0.03)]`}>
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

                                    <div className={`${isDark ? 'bg-[#0a0c10]/60' : 'bg-[#E8E0D5]/60'} backdrop-blur-xl rounded-[22px] p-6 lg:p-8 relative z-10`}>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className={`text-xl font-display font-bold ${textClass} flex items-center gap-2`}>
                                                        <Building2 className="text-blue-400" size={24} />
                                                        Trabajando en {user.organization.name}
                                                    </h3>
                                                    <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-widest hidden sm:inline-block">
                                                        {user.organization.accessLevel}
                                                    </span>
                                                </div>
                                                <p className={`${textMuted} text-sm`}>Los costos de tu licencia y almacenamiento los cubre tu organización.</p>
                                            </div>
                                        </div>

                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 border-t ${borderColor} pt-6`}>
                                            {user.organization.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <CheckCircle2 size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                                    <span className={`text-sm font-medium ${textClass} opacity-80`}>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
