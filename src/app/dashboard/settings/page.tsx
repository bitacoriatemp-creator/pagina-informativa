"use client";

import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
    Palette,
    Bell,
    Globe,
    Monitor,
    Moon,
    SunDim,
    Lock,
    CheckCircle2,
    Shield
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useThemeVars } from "@/hooks/useThemeVars";

export default function SettingsDashboard() {
    const [activeTab, setActiveTab] = useState("Apariencia");

    const {
        isDark,
        theme,
        toggleTheme,
        mounted,
        bgClass,
        textClass,
        textMuted,
        borderColor,
        cardBg,
        bgPattern,
    } = useThemeVars();

    const user = {
        name: "Eduardo Mora",
        email: "eduardo.mora@constructora.com",
    };

    const accentClass = isDark ? "text-[#C39767]" : "text-[#A87B4C]";
    const hoverBgClass = isDark ? "hover:bg-white/[0.04]" : "hover:bg-[#2A241E]/[0.04]";
    const shadowClass = isDark ? "shadow-2xl" : "shadow-[0_8px_30px_rgba(42,36,30,0.06)]";

    if (!mounted) return null;

    const TABS = [
        { id: "Apariencia", icon: Palette, description: "Personaliza colores y temas" },
        { id: "Notificaciones", icon: Bell, description: "Alertas, emails y reportes" },
        { id: "Seguridad y Accesos", icon: Shield, description: "Contraseña y 2FA" },
        { id: "Región e Idioma", icon: Globe, description: "Husos horarios e idiomas" }
    ];

    return (
        <>
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl ${isDark ? "from-[#C39767]/10" : "from-[#A87B4C]/10"} to-transparent blur-[120px] rounded-full pointer-events-none transition-all duration-500`} />

            <DashboardTopBar activePage="configuracion" pageTitle="Configuración" />

            {/* Settings Content - Compactor sin scroll excesivo */}
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full p-4 lg:p-8 relative z-10 flex flex-col items-center">
                <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 lg:gap-8 pb-32">

                    {/* Tab Menu List */}
                    <div className="w-full lg:w-72 flex-shrink-0 flex sm:flex-col gap-3 lg:gap-1 overflow-x-auto sm:overflow-visible pb-3 pt-1 lg:pb-0 snap-x custom-scrollbar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 min-w-[200px] sm:min-w-0 sm:w-full snap-start flex items-start gap-4 p-3.5 lg:p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? (isDark ? 'bg-white/[0.06] shadow-lg border border-white/10' : 'bg-white border-[#2A241E]/10 shadow-md border') : `bg-transparent ${hoverBgClass} border border-transparent`}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === tab.id ? (isDark ? 'bg-[#C39767]/20 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]') : (isDark ? 'bg-white/5 text-white/40' : 'bg-[#2A241E]/5 text-[#2A241E]/50')}`}>
                                    <tab.icon size={20} />
                                </div>
                                <div className="text-left flex-1 pt-0.5 pointer-events-none">
                                    <h3 className={`font-display font-bold text-sm ${activeTab === tab.id ? '' : 'opacity-70'} whitespace-nowrap`}>{tab.id}</h3>
                                    <p className={`text-[11px] mt-0.5 ${textMuted} line-clamp-1`}>{tab.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Settings Content Area */}
                    <div className="flex-1">
                        <div className={`p-6 lg:p-8 rounded-3xl border ${borderColor} ${cardBg} backdrop-blur-md ${shadowClass} transition-all duration-500`}>

                            {activeTab === "Apariencia" && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <h2 className="text-xl font-display font-bold mb-1">Tema de Interfaz</h2>
                                        <p className={`text-xs ${textMuted} max-w-xl`}>
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
                                            <div className={`p-5 flex items-center justify-between ${cardBg}`}>
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
                                            <div className={`p-5 flex items-center justify-between ${cardBg}`}>
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
                                        <p className={`text-sm ${textMuted} max-w-xl`}>
                                            Controla qué correos de BitacorIA aterrizan en tu bandeja.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        {["Nuevas anotaciones en la bitácora", "Alertas de choques BIM (Clash Detection)", "Menciones en planos o modelos", "Reportes semanales automáticos", "Aprobaciones de firmas pendientes"].map((item, i) => (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${hoverBgClass}`}>
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
        </>
    );
}
