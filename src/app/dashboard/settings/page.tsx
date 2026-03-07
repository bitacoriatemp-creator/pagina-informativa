"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import {
    Home,
    Users,
    User,
    Settings,
    LifeBuoy,
    Menu,
    Palette,
    Bell,
    Lock,
    Globe,
    Monitor,
    Moon,
    SunDim,
    CheckCircle2,
    Shield
} from "lucide-react";

export default function SettingsDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Apariencia");

    const { theme, toggleTheme, mounted } = useTheme();

    const user = {
        name: "Eduardo Mora",
        email: "eduardo.mora@constructora.com",
    };

    // Derived theme variables
    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-[#060606]" : "bg-[#F8F6F0]"; // Cream white background
    const textClass = isDark ? "text-white" : "text-[#2A241E]";
    const textMutedClass = isDark ? "text-white/60" : "text-[#2A241E]";
    const borderClass = isDark ? "border-white/[0.06]" : "border-[#2A241E]/10";
    const sidebarBgClass = isDark ? "bg-[#080808]/95" : "bg-[#F4EFE6]/95";
    const topBarBgClass = isDark ? "bg-[#080808]/80" : "bg-[#F4EFE6]/80";
    const accentClass = isDark ? "text-[#C39767]" : "text-[#A87B4C]";
    const cardBgClass = isDark ? "bg-white/[0.02]" : "bg-white/60";
    const hoverBgClass = isDark ? "hover:bg-white/[0.04]" : "hover:bg-[#2A241E]/[0.04]";
    const shadowClass = isDark ? "shadow-2xl" : "shadow-[0_8px_30px_rgba(42,36,30,0.06)]";
    const bgPattern = isDark
        ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)"
        : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.06) 1px, transparent 0)";


    if (!mounted) return null;

    /* ── HORIZONTAL TOP BAR (SMART ISLAND) ── */
    const TopBar = () => (
        <header className={`h-16 border-b ${borderClass} ${topBarBgClass} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 transition-colors duration-500 ${isDark ? 'dark-topbar' : 'light-topbar'}`}>

            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-4 sm:gap-6 h-full shrink-0">
                <Link href="/" className="flex items-center justify-center relative cursor-pointer group h-full">
                    <div className={`w-[130px] h-full ${sidebarBgClass} border-x border-b ${borderClass} flex items-center justify-center shrink-0 rounded-b-2xl shadow-sm transition-colors px-3`}>
                        {isDark ? (
                            <img src="/images/logo-bitacoria.webp" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                            <img src="/images/logo-bitacoria.webp" alt="BitacorIA Logo" className="object-contain w-full drop-shadow-[0_2px_10px_rgba(168,123,76,0.3)] transition-transform duration-300 group-hover:scale-105" style={{ filter: "brightness(0.3) sepia(1) hue-rotate(-30deg) saturate(3)" }} />
                        )}
                    </div>
                </Link>

                <div className="hidden sm:flex items-center gap-2">
                    <span className={`text-[11px] font-mono ${textMutedClass} uppercase tracking-widest`}>BIT —</span>
                    <h1 className={`text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap`}>Configuración</h1>
                </div>
            </div>

            {/* CENTER: Smart Island Navigation */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 p-1.5 rounded-2xl shadow-sm border transition-colors duration-300"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
            >
                <Link href="/dashboard" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMutedClass} ${hoverBgClass}`}>
                    <Home size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Inicio
                    </span>
                </Link>

                <Link href="/dashboard/contacts" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMutedClass} ${hoverBgClass}`}>
                    <Users size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Contactos
                    </span>
                </Link>

                <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}></div>

                <Link href="/dashboard/profile" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMutedClass} ${hoverBgClass}`}>
                    <User size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Perfil
                    </span>
                </Link>

                <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${isDark ? 'bg-[#C39767]/10 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                    <Settings size={16} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[120px] ml-2 opacity-100">
                        Configuración
                    </span>
                </button>

                <Link href="/dashboard/help" className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMutedClass} ${hoverBgClass}`}>
                    <LifeBuoy size={16} strokeWidth={1.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100">
                        Ayuda
                    </span>
                </Link>
            </nav>

            {/* RIGHT: Actions */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0 ml-auto">
                <button className={`p-2 lg:hidden ${textMutedClass} rounded-lg ${hoverBgClass} transition-colors`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu size={20} />
                </button>

                <button
                    onClick={toggleTheme}
                    className={`relative p-2 ${textMutedClass} rounded-full ${hoverBgClass} transition-colors hidden`}
                    title="Cambiar Tema (Usa el switch abajo)"
                >
                    {theme === 'dark' ? <SunDim size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );

    const TABS = [
        { id: "Apariencia", icon: Palette, description: "Personaliza colores y temas" },
        { id: "Notificaciones", icon: Bell, description: "Alertas, emails y reportes" },
        { id: "Seguridad y Accesos", icon: Shield, description: "Contraseña y 2FA" },
        { id: "Región e Idioma", icon: Globe, description: "Husos horarios e idiomas" }
    ];

    return (
        <div className={`flex h-screen ${bgClass} ${textClass} font-sans overflow-hidden transition-colors duration-500`}
            style={{ backgroundImage: bgPattern, backgroundSize: "32px 32px" }}>

            {isSidebarOpen && <div className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">

                {/* Ambient Background Glow */}
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl ${isDark ? "from-[#C39767]/10" : "from-[#A87B4C]/10"} to-transparent blur-[120px] rounded-full pointer-events-none transition-all duration-500`} />

                <TopBar />

                {/* Settings Content - Compactor sin scroll excesivo */}
                <div className="flex-1 p-6 lg:p-8 relative z-10 flex items-start justify-center">
                    <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 lg:gap-8">

                        {/* Tab Menu List */}
                        <div className="w-full lg:w-72 flex-shrink-0 space-y-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? (isDark ? 'bg-white/[0.06] shadow-lg border border-white/10' : 'bg-white border-[#2A241E]/10 shadow-md border') : `bg-transparent ${hoverBgClass} border border-transparent`}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === tab.id ? (isDark ? 'bg-[#C39767]/20 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]') : (isDark ? 'bg-white/5 text-white/40' : 'bg-[#2A241E]/5 text-[#2A241E]/50')}`}>
                                        <tab.icon size={20} />
                                    </div>
                                    <div className="text-left flex-1 pt-0.5">
                                        <h3 className={`font-display font-bold text-sm ${activeTab === tab.id ? '' : 'opacity-70'}`}>{tab.id}</h3>
                                        <p className={`text-[11px] mt-0.5 ${textMutedClass}`}>{tab.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Settings Content Area */}
                        <div className="flex-1">
                            <div className={`p-6 lg:p-8 rounded-3xl border ${borderClass} ${cardBgClass} backdrop-blur-md ${shadowClass} transition-all duration-500`}>

                                {activeTab === "Apariencia" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h2 className="text-xl font-display font-bold mb-1">Tema de Interfaz</h2>
                                            <p className={`text-xs ${textMutedClass} max-w-xl`}>
                                                Personaliza el aspecto de BitacorIA según tu entorno de trabajo.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Dark Theme Option */}
                                            <button
                                                onClick={() => { if (!isDark) toggleTheme(); }}
                                                className={`group relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-300 ${isDark ? 'border-[#C39767] ring-4 ring-[#C39767]/10' : 'border-[#2A241E]/10 hover:border-[#2A241E]/20'}`}
                                            >
                                                <div className="h-32 bg-[#060606] border-b border-white/[0.05] relative overflow-hidden flex items-center justify-center">
                                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,1) 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                                                    {/* Mini UI Mockup */}
                                                    <div className="w-48 h-20 bg-[#111] border border-white/10 rounded-xl shadow-2xl flex flex-col p-3 z-10 gap-2">
                                                        <div className="w-full h-3 bg-white/5 rounded-full" />
                                                        <div className="w-3/4 h-3 bg-white/5 rounded-full" />
                                                        <div className="w-12 h-4 bg-[#C39767] rounded-full mt-auto" />
                                                    </div>
                                                </div>
                                                <div className={`p-5 flex items-center justify-between ${cardBgClass}`}>
                                                    <div>
                                                        <h4 className={`font-bold ${textClass} flex items-center gap-2`}><Moon size={16} /> Dark Tech</h4>
                                                        <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Modo Estudio</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isDark ? 'border-[#C39767] bg-[#C39767]' : 'border-gray-300'}`}>
                                                        {isDark && <CheckCircle2 size={14} className="text-[#111] font-bold" />}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Light Cream Theme Option */}
                                            <button
                                                onClick={() => { if (isDark) toggleTheme(); }}
                                                className={`group relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-300 ${!isDark ? 'border-[#A87B4C] ring-4 ring-[#A87B4C]/10' : 'border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="h-32 bg-[#F8F6F0] border-b border-[#2A241E]/5 relative overflow-hidden flex items-center justify-center">
                                                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2A241E 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                                                    {/* Mini UI Mockup */}
                                                    <div className="w-48 h-20 bg-white border border-[#2A241E]/10 rounded-xl shadow-xl flex flex-col p-3 z-10 gap-2">
                                                        <div className="w-full h-3 bg-[#2A241E]/5 rounded-full" />
                                                        <div className="w-3/4 h-3 bg-[#2A241E]/5 rounded-full" />
                                                        <div className="w-12 h-4 bg-[#A87B4C] rounded-full mt-auto" />
                                                    </div>
                                                </div>
                                                <div className={`p-5 flex items-center justify-between ${cardBgClass}`}>
                                                    <div>
                                                        <h4 className={`font-bold ${textClass} flex items-center gap-2`}><SunDim size={16} /> Blanco Crema</h4>
                                                        <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-mono">Modo Campo</p>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${!isDark ? 'border-[#A87B4C] bg-[#A87B4C]' : 'border-gray-300'}`}>
                                                        {!isDark && <CheckCircle2 size={14} className="text-white font-bold" />}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "Notificaciones" && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div>
                                            <h2 className="text-2xl font-display font-bold mb-2">Preferencias de Alertas</h2>
                                            <p className={`text-sm ${textMutedClass} max-w-xl`}>
                                                Controla qué correos de BitacorIA aterrizan en tu bandeja.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            {["Nuevas anotaciones en la bitácora", "Alertas de choques BIM (Clash Detection)", "Menciones en planos o modelos", "Reportes semanales automáticos", "Aprobaciones de firmas pendientes"].map((item, i) => (
                                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${borderClass} ${hoverBgClass}`}>
                                                    <p className={`text-sm font-medium ${textClass}`}>{item}</p>
                                                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${i < 3 ? (isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]') : (isDark ? 'bg-white/10' : 'bg-[#2A241E]/10')}`}>
                                                        <div className={`w-4 h-4 rounded-full transition-transform ${isDark ? 'bg-white' : 'bg-[#F4EFE6]'} ${i < 3 ? 'translate-x-6' : 'translate-x-0'}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Other tabs can go here */}
                                {(activeTab === "Seguridad y Accesos" || activeTab === "Región e Idioma") && (
                                    <div className="py-12 flex flex-col items-center justify-center text-center animate-fade-in opacity-50">
                                        <Lock size={32} strokeWidth={1} className="mb-3" />
                                        <h3 className="text-lg font-display font-bold mb-1">Sección en Desarrollo</h3>
                                        <p className="text-xs">Estas opciones estarán disponibles en la próxima actualización.</p>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
