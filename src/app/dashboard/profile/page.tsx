"use client";

import {
    User,
    Settings,
    Users,
    FolderGit2,
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
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useDashboard } from "@/context/DashboardContext";
import { useThemeVars } from "@/hooks/useThemeVars";

export default function ProfileDashboard() {
    const {
        isDark,
        mounted,
        bgClass,
        textClass,
        textMuted,
        textFaint,
        hoverBg,
        borderColor,
        cardBg,
        cardBorder,
        bgPattern,
        accentGlow,
    } = useThemeVars();

    if (!mounted) return null;

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

    return (
        <>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#C39767]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

            <DashboardTopBar activePage="perfil" pageTitle="Mi Perfil" />

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
                                    <span className={`hidden md:inline ${textFaint} `}>•</span>
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
                                    <div className={`pt-4 mt-2 border-t ${borderColor} `}>
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
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} `} style={{ color: stat.color }}>
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
        </>
    );
}
