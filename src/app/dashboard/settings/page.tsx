"use client";

import { useState } from "react";

import {
    Palette,
    Bell,
    Globe,
    Monitor,
    Moon,
    SunDim,
    Lock,
    CheckCircle2,
    Shield,
    KeyRound,
    ShieldCheck,
    Smartphone,
    X,
    Clock,
    Calendar,
    Languages,
    Ruler,
    CalendarDays,
    Save
} from "lucide-react";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useThemeVars } from "@/hooks/useThemeVars";

export default function SettingsDashboard() {
    const [activeTab, setActiveTab] = useState("Apariencia");

    const [notifications, setNotifications] = useState([
        { id: "new_logs", label: "Nuevas anotaciones en la bitácora", active: true },
        { id: "mentions", label: "Menciones en planos", active: true },
        { id: "ticket_status", label: "Actualizaciones de estado en tickets", active: true },
        { id: "weekly_reports", label: "Reportes semanales automáticos", active: true },
        { id: "pending_signatures", label: "Aprobaciones de firmas pendientes", active: false },
        { id: "deadlines", label: "Recordatorios de fechas límite", active: false },
    ]);

    const toggleNotification = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
    };

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordFeedback, setPasswordFeedback] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [activeSessions, setActiveSessions] = useState([
        { id: '1', device: 'Windows 11 - Chrome', location: 'Monterrey, NL', time: 'En este momento', isCurrent: true, icon: Monitor },
        { id: '2', device: 'iPhone 15 Pro - Safari', location: 'Ciudad de México', time: 'Ayer, 14:30', isCurrent: false, icon: Smartphone }
    ]);

    const [selectedTimezone, setSelectedTimezone] = useState("America/Mexico_City");
    const [selectedLanguage, setSelectedLanguage] = useState("es");
    const [dateFormat, setDateFormat] = useState("DD/MM/AAAA");
    const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
    const [measurementUnit, setMeasurementUnit] = useState<"metric" | "imperial">("metric");
    const [firstDayOfWeek, setFirstDayOfWeek] = useState<"monday" | "sunday">("monday");
    const [regionSaved, setRegionSaved] = useState(false);

    const TIMEZONES = [
        { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
        { value: "America/Cancun", label: "Cancún (UTC-5)" },
        { value: "America/Monterrey", label: "Monterrey (UTC-6)" },
        { value: "America/Tijuana", label: "Tijuana (UTC-8)" },
        { value: "America/Hermosillo", label: "Hermosillo (UTC-7)" },
        { value: "America/Mazatlan", label: "Mazatlán (UTC-7)" },
        { value: "America/Chihuahua", label: "Chihuahua (UTC-6)" },
        { value: "America/Bogota", label: "Bogotá (UTC-5)" },
        { value: "America/Lima", label: "Lima (UTC-5)" },
        { value: "America/Santiago", label: "Santiago (UTC-3)" },
        { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
        { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
        { value: "America/New_York", label: "Nueva York (UTC-5)" },
        { value: "America/Los_Angeles", label: "Los Ángeles (UTC-8)" },
        { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
    ];

    const DATE_FORMATS = [
        { value: "DD/MM/AAAA", example: "18/03/2026" },
        { value: "MM/DD/AAAA", example: "03/18/2026" },
        { value: "AAAA-MM-DD", example: "2026-03-18" },
    ];

    const getTimePreview = () => {
        const now = new Date();
        if (timeFormat === "12h") {
            return now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
        }
        return now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
    };

    const handleSaveRegion = () => {
        setRegionSaved(true);
        setTimeout(() => setRegionSaved(false), 3000);
    };
    // --------------------------

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordFeedback(null);
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordFeedback({ msg: "Completa todos los campos", type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordFeedback({ msg: "Las contraseñas no coinciden", type: 'error' });
            return;
        }
        setPasswordFeedback({ msg: "Contraseña actualizada exitosamente", type: 'success' });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordFeedback(null), 3000);
    };

    const handleRemoveSession = (id: string) => {
        setActiveSessions(prev => prev.filter(s => s.id !== id));
    };


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
        <div className="h-screen flex flex-col overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl ${isDark ? "from-[#C39767]/10" : "from-[#A87B4C]/10"} to-transparent blur-[120px] rounded-full pointer-events-none transition-all duration-500`} />

            <DashboardTopBar activePage="configuracion" pageTitle="Configuración" />

            {/* Settings Content — this entire area scrolls */}
            <div className="w-full flex-1 min-h-0 p-4 lg:p-8 relative z-10 overflow-y-auto" data-lenis-prevent>
                <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Tab Menu List — sticky sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-0 lg:self-start flex sm:flex-col gap-3 lg:gap-1 overflow-x-auto sm:overflow-visible pb-3 pt-1 lg:pb-0 snap-x custom-scrollbar">
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
                    <div className="flex-1 pb-16">
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
                                        {notifications.map((item) => (
                                            <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${borderColor} ${hoverBgClass}`}>
                                                <p className={`text-sm font-medium ${textClass}`}>{item.label}</p>
                                                <div 
                                                    onClick={() => toggleNotification(item.id)}
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? (isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]') : (isDark ? 'bg-white/10' : 'bg-[#2A241E]/10')}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full transition-transform shadow-sm ${isDark ? 'bg-white' : 'bg-[#F4EFE6]'} ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- SEGURIDAD Y ACCESOS --- */}
                            {activeTab === "Seguridad y Accesos" && (
                                <div className="space-y-8 animate-fade-in">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold mb-2">Seguridad y Accesos</h2>
                                        <p className={`text-sm ${textMuted} max-w-xl`}>
                                            Gestiona tu contraseña, la autenticación en dos pasos y revisa tus sesiones activas.
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Columna Izquierda */}
                                        <div className="space-y-6">
                                            <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm flex flex-col gap-5 items-start justify-between`}>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'}`}>
                                                            <KeyRound size={20} className={isDark ? "text-white" : "text-[#2A241E]"} />
                                                        </div>
                                                        <h3 className={`font-bold ${textClass}`}>Cambiar Contraseña</h3>
                                                    </div>
                                                    <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
                                                        Actualiza tu contraseña periódicamente para mantener la seguridad de tu cuenta.
                                                    </p>
                                                </div>
                                                <button onClick={() => setIsPasswordModalOpen(true)} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#C39767] text-white hover:bg-[#A87B4C] transition-colors shadow-md shadow-[#C39767]/20 whitespace-nowrap shrink-0 w-full sm:w-auto">
                                                    Cambiar Contraseña
                                                </button>
                                            </div>

                                            {/* 2FA */}
                                            <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between`}>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-[#2A241E]/10'}`}>
                                                            <ShieldCheck size={20} className={isDark ? "text-white" : "text-[#2A241E]"} />
                                                        </div>
                                                        <h3 className={`font-bold ${textClass}`}>Verificación en 2 Pasos</h3>
                                                    </div>
                                                    <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
                                                        {is2FAEnabled 
                                                            ? "Tu cuenta está protegida con código de autenticador. Retira esta opción bajo tu propio riesgo." 
                                                            : "Añade una capa extra de seguridad solicitando un código temporal al iniciar sesión desde dispositivos nuevos."}
                                                    </p>
                                                </div>
                                                <div 
                                                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors shrink-0 mt-1 sm:mt-0 ${is2FAEnabled ? (isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]') : (isDark ? 'bg-white/10' : 'bg-[#2A241E]/10')}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full transition-transform shadow-sm ${isDark ? 'bg-white' : 'bg-[#F4EFE6]'} ${is2FAEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Sesiones */}
                                        <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm h-fit`}>
                                            <h3 className={`font-bold ${textClass} mb-1`}>Sesiones Activas</h3>
                                            <p className={`text-xs ${textMuted} mb-6`}>Dispositivos en los que has iniciado sesión recientemente.</p>
                                            
                                            <div className="space-y-4">
                                                {activeSessions.map((session) => (
                                                    <div key={session.id} className={`flex items-start justify-between p-3 rounded-xl border border-transparent hover:border-[#C39767]/30 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#2A241E]/5'}`}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 p-2 rounded-lg ${session.isCurrent ? 'bg-emerald-500/10 text-emerald-500' : (isDark ? 'bg-white/5 text-white/50' : 'bg-black/5 text-black/50')}`}>
                                                                <session.icon size={18} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-semibold ${textClass}`}>{session.device}</p>
                                                                <p className={`text-xs ${textMuted} mt-0.5`}>{session.location} • {session.time}</p>
                                                                {session.isCurrent && (
                                                                    <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Este dispositivo</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!session.isCurrent && (
                                                            <button 
                                                                onClick={() => handleRemoveSession(session.id)}
                                                                className={`text-xs font-semibold px-3 py-1.5 rounded-md border ${borderColor} hover:bg-red-500 hover:border-red-500 hover:text-white transition-all text-red-500`}
                                                            >
                                                                Cerrar
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                {activeSessions.length === 0 && (
                                                    <p className={`text-sm text-center py-4 ${textMuted}`}>No hay sesiones activas adicionales.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "Región e Idioma" && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Header */}
                                    <div>
                                        <h2 className="text-2xl font-display font-bold mb-2">Región e Idioma</h2>
                                        <p className={`text-sm ${textMuted} max-w-xl`}>
                                            Configura tu zona horaria, idioma y formatos de fecha para personalizar tu experiencia en BitacorIA.
                                        </p>
                                    </div>

                                    {/* Zona Horaria */}
                                    <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${textClass}`}>Zona Horaria</h3>
                                                <p className={`text-[11px] ${textMuted} mt-0.5`}>Selecciona la zona horaria de tu ubicación principal.</p>
                                            </div>
                                        </div>
                                        <select
                                            value={selectedTimezone}
                                            onChange={(e) => setSelectedTimezone(e.target.value)}
                                            className={`w-full bg-transparent border ${borderColor} rounded-xl px-4 py-3 ${textClass} focus:outline-none focus:border-[#C39767] transition-all cursor-pointer appearance-none`}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? '%23C39767' : '%23A87B4C'}' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                        >
                                            {TIMEZONES.map((tz) => (
                                                <option key={tz.value} value={tz.value} className={isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#2A241E]'}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Idioma */}
                                    <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                <Languages size={20} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${textClass}`}>Idioma de la Interfaz</h3>
                                                <p className={`text-[11px] ${textMuted} mt-0.5`}>Elige el idioma en el que se muestra BitacorIA.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: "es", label: "Español", flag: "🇲🇽", desc: "Interfaz en español" },
                                                { id: "en", label: "English", flag: "🇺🇸", desc: "English interface" },
                                            ].map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => setSelectedLanguage(lang.id)}
                                                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                        selectedLanguage === lang.id
                                                            ? (isDark ? 'border-[#C39767] ring-4 ring-[#C39767]/10 bg-[#C39767]/5' : 'border-[#A87B4C] ring-4 ring-[#A87B4C]/10 bg-[#A87B4C]/5')
                                                            : (isDark ? 'border-white/10 hover:border-white/20' : 'border-[#2A241E]/10 hover:border-[#2A241E]/20')
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{lang.flag}</span>
                                                            <div>
                                                                <h4 className={`font-bold text-sm ${textClass}`}>{lang.label}</h4>
                                                                <p className={`text-[11px] ${textMuted} mt-0.5`}>{lang.desc}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                            selectedLanguage === lang.id
                                                                ? (isDark ? 'border-[#C39767] bg-[#C39767]' : 'border-[#A87B4C] bg-[#A87B4C]')
                                                                : (isDark ? 'border-white/20' : 'border-[#2A241E]/20')
                                                        }`}>
                                                            {selectedLanguage === lang.id && <CheckCircle2 size={12} className={isDark ? 'text-[#0a0a0a]' : 'text-white'} />}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Formato de Fecha y Hora */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Formato de Fecha */}
                                        <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${textClass}`}>Formato de Fecha</h3>
                                                    <p className={`text-[11px] ${textMuted} mt-0.5`}>Elige cómo se muestran las fechas.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {DATE_FORMATS.map((fmt) => (
                                                    <button
                                                        key={fmt.value}
                                                        onClick={() => setDateFormat(fmt.value)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                                            dateFormat === fmt.value
                                                                ? (isDark ? 'border-[#C39767]/50 bg-[#C39767]/10' : 'border-[#A87B4C]/40 bg-[#A87B4C]/5')
                                                                : `border-transparent ${hoverBgClass}`
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                                dateFormat === fmt.value
                                                                    ? (isDark ? 'border-[#C39767]' : 'border-[#A87B4C]')
                                                                    : (isDark ? 'border-white/20' : 'border-[#2A241E]/20')
                                                            }`}>
                                                                {dateFormat === fmt.value && <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]'}`} />}
                                                            </div>
                                                            <span className={`text-sm font-medium ${textClass}`}>{fmt.value}</span>
                                                        </div>
                                                        <span className={`text-xs font-mono ${textMuted}`}>{fmt.example}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Formato de Hora */}
                                        <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${textClass}`}>Formato de Hora</h3>
                                                    <p className={`text-[11px] ${textMuted} mt-0.5`}>Elige entre formato de 12 o 24 horas.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {(["24h", "12h"] as const).map((fmt) => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() => setTimeFormat(fmt)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                                            timeFormat === fmt
                                                                ? (isDark ? 'border-[#C39767]/50 bg-[#C39767]/10' : 'border-[#A87B4C]/40 bg-[#A87B4C]/5')
                                                                : `border-transparent ${hoverBgClass}`
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                                timeFormat === fmt
                                                                    ? (isDark ? 'border-[#C39767]' : 'border-[#A87B4C]')
                                                                    : (isDark ? 'border-white/20' : 'border-[#2A241E]/20')
                                                            }`}>
                                                                {timeFormat === fmt && <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]'}`} />}
                                                            </div>
                                                            <span className={`text-sm font-medium ${textClass}`}>{fmt === "24h" ? "24 horas" : "12 horas (AM/PM)"}</span>
                                                        </div>
                                                        <span className={`text-xs font-mono ${textMuted}`}>{getTimePreview()}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unidades y Primer día */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Unidades de Medida */}
                                        <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                    <Ruler size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${textClass}`}>Unidades de Medida</h3>
                                                    <p className={`text-[11px] ${textMuted} mt-0.5`}>Sistema de unidades para reportes y planos.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { id: "metric" as const, label: "Sistema Métrico", desc: "m, m², kg, °C" },
                                                    { id: "imperial" as const, label: "Sistema Imperial", desc: "ft, ft², lb, °F" },
                                                ].map((unit) => (
                                                    <button
                                                        key={unit.id}
                                                        onClick={() => setMeasurementUnit(unit.id)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                                            measurementUnit === unit.id
                                                                ? (isDark ? 'border-[#C39767]/50 bg-[#C39767]/10' : 'border-[#A87B4C]/40 bg-[#A87B4C]/5')
                                                                : `border-transparent ${hoverBgClass}`
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                                measurementUnit === unit.id
                                                                    ? (isDark ? 'border-[#C39767]' : 'border-[#A87B4C]')
                                                                    : (isDark ? 'border-white/20' : 'border-[#2A241E]/20')
                                                            }`}>
                                                                {measurementUnit === unit.id && <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]'}`} />}
                                                            </div>
                                                            <span className={`text-sm font-medium ${textClass}`}>{unit.label}</span>
                                                        </div>
                                                        <span className={`text-xs font-mono ${textMuted}`}>{unit.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Primer día de la semana */}
                                        <div className={`p-6 rounded-2xl border ${borderColor} ${cardBg} shadow-sm`}>
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C39767]/15 text-[#C39767]' : 'bg-[#A87B4C]/10 text-[#A87B4C]'}`}>
                                                    <CalendarDays size={20} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${textClass}`}>Primer Día de la Semana</h3>
                                                    <p className={`text-[11px] ${textMuted} mt-0.5`}>Define qué día inicia tu semana laboral.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {[
                                                    { id: "monday" as const, label: "Lunes", desc: "Estándar internacional" },
                                                    { id: "sunday" as const, label: "Domingo", desc: "Estándar EE.UU." },
                                                ].map((day) => (
                                                    <button
                                                        key={day.id}
                                                        onClick={() => setFirstDayOfWeek(day.id)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                                            firstDayOfWeek === day.id
                                                                ? (isDark ? 'border-[#C39767]/50 bg-[#C39767]/10' : 'border-[#A87B4C]/40 bg-[#A87B4C]/5')
                                                                : `border-transparent ${hoverBgClass}`
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                                firstDayOfWeek === day.id
                                                                    ? (isDark ? 'border-[#C39767]' : 'border-[#A87B4C]')
                                                                    : (isDark ? 'border-white/20' : 'border-[#2A241E]/20')
                                                            }`}>
                                                                {firstDayOfWeek === day.id && <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C39767]' : 'bg-[#A87B4C]'}`} />}
                                                            </div>
                                                            <span className={`text-sm font-medium ${textClass}`}>{day.label}</span>
                                                        </div>
                                                        <span className={`text-xs ${textMuted}`}>{day.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón Guardar */}
                                    <div className="flex items-center justify-end gap-4 pt-2">
                                        {regionSaved && (
                                            <span className="text-sm text-emerald-500 font-medium flex items-center gap-1.5 animate-fade-in">
                                                <CheckCircle2 size={16} /> Preferencias guardadas
                                            </span>
                                        )}
                                        <button
                                            onClick={handleSaveRegion}
                                            className="px-8 py-3 rounded-xl text-sm font-bold bg-[#C39767] text-white hover:bg-[#A87B4C] transition-all duration-300 shadow-xl shadow-[#C39767]/20 flex items-center gap-2"
                                        >
                                            <Save size={16} />
                                            Guardar Preferencias
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
            {/* Modal de Contraseña */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
                    <div className={`relative w-full max-w-md ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#F4EFE6]'} border ${borderColor} rounded-3xl shadow-2xl p-6 lg:p-8 animate-in fade-in zoom-in-95`}>
                        <button onClick={() => setIsPasswordModalOpen(false)} className={`absolute top-4 right-4 p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors`}>
                            <X size={20} className={textMuted} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-[#C39767]/20 text-[#C39767]' : 'bg-[#A87B4C]/20 text-[#A87B4C]'}`}>
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h2 className={`text-xl font-display font-bold ${textClass}`}>Cambiar Contraseña</h2>
                                <p className={`text-xs ${textMuted}`}>Ingresa tu contraseña actual y la nueva.</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => {
                            handlePasswordUpdate(e);
                            if (newPassword && newPassword === confirmPassword && currentPassword) {
                                setTimeout(() => setIsPasswordModalOpen(false), 1500);
                            }
                        }} className="space-y-4">
                            <div>
                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-1.5`}>Contraseña Actual</label>
                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`w-full bg-transparent border ${borderColor} rounded-xl px-4 py-3 ${textClass} focus:outline-none focus:border-[#C39767] transition-all`} />
                            </div>
                            <div>
                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-1.5`}>Nueva Contraseña</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full bg-transparent border ${borderColor} rounded-xl px-4 py-3 ${textClass} focus:outline-none focus:border-[#C39767] transition-all`} />
                            </div>
                            <div>
                                <label className={`block text-[11px] font-bold ${textMuted} uppercase tracking-widest mb-1.5`}>Confirmar Contraseña</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-transparent border ${borderColor} rounded-xl px-4 py-3 ${textClass} focus:outline-none focus:border-[#C39767] transition-all`} />
                            </div>
                            
                            {passwordFeedback && (
                                <div className={`text-xs p-3 rounded-lg font-medium border ${passwordFeedback.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    {passwordFeedback.msg}
                                </div>
                            )}
                            
                            <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#C39767] text-white hover:bg-[#A87B4C] transition-colors shadow-xl shadow-[#C39767]/30 mt-6">
                                Actualizar Contraseña
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
