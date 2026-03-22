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
    Edit2,
    FileText,
    UploadCloud,
    CreditCard,
    Sparkles
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef } from "react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import dynamic from "next/dynamic";
import { useThemeVars } from "@/hooks/useThemeVars";
import { useDashboard } from "@/context/DashboardContext";

const PlanManagementModal = dynamic(() => import("@/components/dashboard/PlanManagementModal"), { ssr: false });

// Helper for basePath support in production
const getImagePath = (path: string) => {
    return process.env.NODE_ENV === "production" ? `/plataforma${path}` : path;
};

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

    const { userProfile, setUserProfile } = useDashboard();

    // Mock User Data -> State to allow local edits
    const [user, setUser] = useState({
        name: userProfile.name,
        email: "eduardo.mora@constructora.com",
        phone: "+52 55 1234 5678",
        role: "Director de Obra",
        company: "Construcciones y Desarrollos EM",
        location: "Ciudad de México, MX",
        joinDate: "Enero 2026",
        avatarGrad: userProfile.avatarGrad,
        customAvatarUrl: userProfile.customAvatarUrl,
        customCoverUrl: userProfile.customCoverUrl,
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
        },
        subscription: {
            planName: "THE SITE MANAGER",
            status: "Activo",
            cycle: "Mensual",
            nextBilling: "15 de Abril, 2026",
            price: "$3,899",
            storageUsed: 42, // percentage
        }
    });

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user.name);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Sync state cuando el context carga desde localStorage
    React.useEffect(() => {
        setUser(prev => ({
            ...prev,
            name: userProfile.name,
            avatarGrad: userProfile.avatarGrad,
            customAvatarUrl: userProfile.customAvatarUrl,
            customCoverUrl: userProfile.customCoverUrl,
        }));
    }, [userProfile]);

    if (!mounted) return null;

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUser({ ...user, customAvatarUrl: ev.target?.result as string });
            setHasChanges(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setUser({ ...user, customCoverUrl: ev.target?.result as string });
            setHasChanges(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            setUser({ ...user, name: tempName });
            setHasChanges(true);
        }
        setIsEditingName(false);
    };

    const handleSaveChanges = () => {
        setUserProfile(prev => ({
            ...prev,
            name: user.name,
            customAvatarUrl: user.customAvatarUrl,
            customCoverUrl: user.customCoverUrl
        }));
        setHasChanges(false);
    };

    return (
        <>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#C39767]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

            <DashboardTopBar activePage="perfil" pageTitle="Mi Perfil" />

            {/* Profile Scroll Area */}
            <main data-lenis-prevent className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10 ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Tarjeta de Presentación / Banner & Identidad */}
                    <div className={`rounded-[2.5rem] border ${isDark ? 'border-white/[0.08] bg-white/[0.02]' : 'border-black/[0.08] bg-[#F4EFE6]/70'} backdrop-blur-3xl overflow-hidden flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.4)] ring-1 ${isDark ? 'ring-white/[0.02]' : 'ring-black/[0.02]'} mb-8 group/card`}>
                        {/* Cover Area */}
                        <div
                            className="h-40 md:h-48 relative overflow-hidden group/cover cursor-pointer"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                ref={coverInputRef}
                                className="hidden"
                                onChange={handleCoverUpload}
                            />
                            {user.customCoverUrl ? (
                                <Image src={user.customCoverUrl} alt="Portada" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#2a241e] to-[#C39767]/20">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }} />
                                </div>
                            )}

                            {/* Cover Edit Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300">
                                <Camera size={28} className="text-white mb-2" />
                                <span className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Cambiar Portada</span>
                            </div>
                        </div>

                        {/* Contenido Centrado (Business Card Print) */}
                        <div className="px-6 pb-10 flex flex-col items-center -mt-20 relative z-10 text-center">
                            {/* Avatar */}
                            <div
                                className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br ${user.avatarGrad} p-[3px] shadow-2xl relative group/avatar cursor-pointer z-10 mb-6`}
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                {user.customAvatarUrl ? (
                                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#0a0a0a]">
                                        <Image src={user.customAvatarUrl} alt="Foto de perfil" fill className="object-cover" unoptimized />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                                            <Camera size={28} className="text-white mb-1.5" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#E8E0D5]'} flex items-center justify-center font-display font-black tracking-widest ${textClass} text-5xl relative overflow-hidden transition-all duration-300`}>
                                        <div className={`absolute inset-0 mix-blend-overlay ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'}`} />
                                        <span className="group-hover/avatar:opacity-0 transition-opacity duration-300 leading-none">
                                            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                        </span>
                                        {/* Edit Overlay */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                                            <Camera size={28} className={`${textClass}`} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Nombre y Rol */}
                            <div className="w-full max-w-sm flex flex-col items-center">
                                {isEditingName ? (
                                    <div className="flex items-center justify-center gap-2 mb-3 w-full">
                                        <input
                                            type="text"
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveName();
                                                if (e.key === 'Escape') setIsEditingName(false);
                                            }}
                                            autoFocus
                                            className={`text-3xl font-display font-bold ${textClass} bg-transparent border-b-2 border-[#C39767] focus:outline-none w-full text-center`}
                                        />
                                        <button onClick={handleSaveName} className="p-1.5 rounded-md bg-[#C39767]/20 text-[#C39767] hover:bg-[#C39767]/30 transition-colors shrink-0">
                                            <CheckCircle2 size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <h2 className={`text-4xl font-display font-medium ${textClass} tracking-wide mb-3 flex items-center justify-center gap-3 group/name`}>
                                        {user.name}
                                        <button onClick={() => { setTempName(user.name); setIsEditingName(true); }} className={`p-1.5 rounded-md ${isDark ? 'bg-white/5 opacity-0 group-hover/name:opacity-100' : 'bg-[#2A241E]/5 opacity-100 lg:opacity-0 lg:group-hover/name:opacity-100'} text-[#C39767] transition-all`}>
                                            <Edit2 size={18} />
                                        </button>
                                    </h2>
                                )}

                                <div className={`flex flex-col items-center gap-2 text-[15px] ${textMuted} font-medium mb-6`}>
                                    <span className="flex items-center gap-2"><Briefcase size={16} className="text-[#C39767]" /> {user.role}</span>
                                    <span className="flex items-center gap-2"><HardHat size={16} className={textClass} /> {user.company}</span>
                                </div>

                                {hasChanges && (
                                    <div className="animate-in fade-in zoom-in duration-300 mb-8">
                                        <button 
                                            onClick={handleSaveChanges}
                                            className="px-8 py-3.5 rounded-[1rem] bg-gradient-to-br from-[#C39767] to-[#A87B4C] text-white font-semibold font-display tracking-wide flex items-center gap-2.5 shadow-xl shadow-[#C39767]/30 hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                            <CheckCircle2 size={20} strokeWidth={2.5} /> Guardar Cambios
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Grid de Contenido Segmentado */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Columna Izquierda: Información de Contacto e Identidad */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Tarjeta Detalles Personales */}
                            <div className={`rounded-[2rem] border ${isDark ? 'border-white/[0.04] bg-white/[0.01]' : 'border-black/[0.04] bg-[#F4EFE6]/50'} backdrop-blur-2xl p-7 shadow-xl shadow-black/5`}>
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
                                    <div key={i} className={`rounded-[1.5rem] border ${isDark ? 'border-white/[0.04] bg-white/[0.01]' : 'border-black/[0.04] bg-[#F4EFE6]/50'} backdrop-blur-xl p-5 flex flex-col items-start gap-4 ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white'} hover:-translate-y-1 transition-all shadow-xl shadow-black/5 duration-300`}>
                                        <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'} `} style={{ color: stat.color }}>
                                            <stat.icon size={22} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className={`text-2xl font-display font-bold ${textClass} leading-none mb-1`}>{stat.value}</h4>
                                            <p className={`text-[11px] font-mono ${textFaint} uppercase tracking-wide`}>{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tarjeta de Mi Plan (Suscripción Horizontal Estilo Mockup) */}
                            <div className={`relative w-full rounded-3xl border ${isDark ? 'border-white/10' : 'border-[#2A241E]/10'} ${isDark ? 'bg-[#111111]/80' : 'bg-[#E8E0D5]/80'} shadow-xl flex flex-col pt-8 pb-6 px-8 overflow-hidden`}>

                                {/* Imagen de fondo derecha/inferior con Mask suave */}
                                <div
                                    className={`absolute inset-0 z-0 overflow-hidden ${isDark ? 'mix-blend-screen opacity-50' : 'mix-blend-multiply opacity-30'} pointer-events-none fade-in`}
                                    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 60%)', maskImage: 'linear-gradient(to right, transparent 0%, transparent 20%, black 60%)' }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#111111]' : 'from-[#E8E0D5]'} via-transparent to-transparent z-10`} />

                                    <Image src={getImagePath(
                                        user.subscription.planName.includes("DRAFT") ? "/images/plan_free.webp" :
                                            user.subscription.planName.includes("RESIDENT") ? "/images/plan_theresident.webp" :
                                                user.subscription.planName.includes("MANAGER") ? "/images/sitemanager.webp" :
                                                    user.subscription.planName.includes("EXECUTIVE") ? "/images/executive_plan.webp" :
                                                        "/images/sitemanager.webp" // Default fallback
                                    )} alt="Plan Actual" fill className="object-cover object-right-bottom scale-[1.2] translate-y-4" unoptimized />
                                    <div className="absolute inset-0 bg-black/40 mix-blend-overlay z-10" />
                                </div>

                                <div className="relative z-20 flex flex-col mb-8 mt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-[#C39767]" size={20} />
                                        <h3 className={`text-xl font-display font-medium ${textClass}`}>Plan Actual</h3>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                                        <p className={`text-4xl md:text-5xl font-display font-bold ${textClass} tracking-tight leading-none`}>
                                            {user.subscription.planName}
                                        </p>
                                        <p className={`text-sm md:text-base ${textMuted} font-medium tracking-wide sm:pb-1`}>
                                            / {user.subscription.price} MXN {user.subscription.cycle}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-20 mt-auto flex flex-col gap-4">
                                    <button
                                        onClick={() => setIsPlanModalOpen(true)}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8a6845]/90 to-[#4a3a2a]/90 hover:from-[#9c7852] hover:to-[#5e4b37] border border-[#C39767]/30 text-white text-[15px] font-medium transition-colors shadow-[0_0_20px_rgba(195,151,103,0.15)] flex items-center justify-center gap-2"
                                    >
                                        <CreditCard size={20} /> Administrar Plan
                                    </button>
                                    <p className={`text-[11px] text-center font-mono uppercase tracking-widest ${textFaint} font-bold`}>
                                        PRÓX. COBRO: {user.subscription.nextBilling}
                                    </p>
                                </div>
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

            {/* Modal de Planes */}
            <PlanManagementModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
            />
        </>
    );
}
