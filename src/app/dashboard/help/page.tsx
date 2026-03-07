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
    Search,
    BookOpenText,
    Video,
    MessageSquareText,
    HardHat,
    CreditCard,
    Shield,
    Terminal,
    ArrowRight,
    Play,
    FolderGit2
} from "lucide-react";

export default function HelpCenterDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { theme, mounted } = useTheme();
    const isDark = theme === "dark";

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

    const faqs = [
        { title: "¿Cómo importo un modelo BIM?", category: "BIM", readTime: "3 min leo" },
        { title: "Configurar firma electrónica autorizada", category: "Seguridad", readTime: "5 min conf" },
        { title: "Crear reportes fotográficos en 1 clic", category: "Obra", readTime: "VÍDEO" },
        { title: "Añadir nuevos ingenieros a mi Obra", category: "Equipo", readTime: "2 min leo" },
    ];


    if (!mounted) return null;

    /* ── SIDEBAR ── */
    /* ── HORIZONTAL TOP BAR (SMART ISLAND) ── */
    const TopBar = () => (
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
                    <span className={`text-[11px] font-mono ${textFaint} uppercase tracking-widest`}>BIT —</span>
                    <h1 className={`text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap`}>Soporte</h1>
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

                <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${activeItemBg}`}>
                    <LifeBuoy size={16} strokeWidth={2.5} className="shrink-0" />
                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[100px] ml-2 opacity-100">
                        Ayuda
                    </span>
                </button>
            </nav>

            {/* RIGHT: Actions */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0 ml-auto">
                <button className={`p-2 lg:hidden ${textMuted} rounded-lg ${hoverBg} transition-colors`} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <Menu size={20} />
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
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/10 to-transparent blur-[120px] rounded-full pointer-events-none transition-opacity duration-500 opacity-60" />

                <TopBar />

                {/* Main Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10" data-lenis-prevent>

                    {/* Hero Header Area */}
                    <div className={`relative pt-16 pb-20 px-6 lg:px-10 border-b ${borderColor} bg-gradient-to-b ${isDark ? 'from-white/[0.02]' : 'from-[#2A241E]/[0.02]'} to-transparent transition-colors duration-500`}>
                        <div className={`absolute inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`} style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(42,36,30,0.04)'} 10px, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(42,36,30,0.04)'} 20px)` }} />

                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <h2 className={`text-4xl md:text-5xl font-display font-bold ${textClass} mb-4`}>¿En qué podemos ayudarte?</h2>
                            <p className={`text-lg ${textMuted} mb-10 max-w-2xl mx-auto`}>Busca temas técnicos, problemas con el sitio de construcción, herramientas BIM, o chatea con nuestra IA de soporte técnico.</p>

                            {/* Gran Barra de Búsqueda */}
                            <div className="relative max-w-2xl mx-auto">
                                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${textMuted}`} size={24} />
                                <input
                                    type="text"
                                    placeholder="Ej. 'Cómo reasignar un residente' o 'Exportar BIM'"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full ${cardBg} border ${cardBorder} rounded-2xl py-5 pl-14 pr-6 text-lg ${textClass} placeholder:opacity-50 focus:outline-none focus:border-[#C39767] focus:ring-4 focus:ring-[#C39767]/10 transition-all shadow-xl`}
                                />
                                <button className={`absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[#2A241E]/10 hover:bg-[#2A241E]/20 text-[#2A241E]'} rounded-xl font-medium transition-colors text-sm`}>
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-12">

                        {/* Featured Quick Links (AI & Agent) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-14 relative z-20">

                            {/* AI Chat Support */}
                            <div className={`rounded-3xl border border-[#C39767]/30 ${isDark ? 'bg-gradient-to-br from-[#1c1611] to-[#0a0a0a]' : 'bg-gradient-to-br from-[#E8E0D5] to-[#F4EFE6]'} backdrop-blur-xl p-8 shadow-2xl group cursor-pointer overflow-hidden relative`}>
                                <div className="absolute right-0 top-0 w-32 h-32 bg-[#C39767]/20 blur-[50px] rounded-full group-hover:bg-[#C39767]/30 transition-colors" />
                                <div className="w-14 h-14 rounded-2xl bg-[#C39767]/20 border border-[#C39767]/30 flex items-center justify-center mb-6">
                                    <Terminal size={28} className="text-[#C39767]" />
                                </div>
                                <h3 className={`text-2xl font-display font-bold ${textClass} mb-2`}>Asistente BitacorIA</h3>
                                <p className={`${textMuted} text-sm mb-6 max-w-sm`}>Resolución instantánea de problemas o dudas sobre la plataforma impulsada por Inteligencia Artificial especializada en construcción.</p>
                                <button className="flex items-center gap-2 text-[#C39767] font-semibold group-hover:gap-3 transition-all">
                                    Iniciar Chat <ArrowRight size={18} />
                                </button>
                            </div>

                            {/* Human Support */}
                            <div className={`rounded-3xl border ${cardBorder} ${cardBg} backdrop-blur-xl p-8 shadow-2xl group cursor-pointer ${hoverBg} transition-colors relative`}>
                                <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} border ${borderColor} flex items-center justify-center mb-6`}>
                                    <MessageSquareText size={28} className={textMuted} />
                                </div>
                                <h3 className={`text-2xl font-display font-bold ${textClass} mb-2`}>Soporte Técnico Especializado</h3>
                                <p className={`${textMuted} text-sm mb-6 max-w-sm`}>Contacta con un ingeniero humano o abre un ticket si tienes problemas críticos con el despliegue del software en obra.</p>
                                <button className={`flex items-center gap-2 ${textClass} font-semibold group-hover:gap-3 transition-all`}>
                                    Crear Ticket <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Categories Grid */}
                            <div className="lg:col-span-2">
                                <h3 className={`text-sm font-display font-bold ${textClass} opacity-90 uppercase tracking-widest mb-6 flex items-center gap-2`}>
                                    <BookOpenText size={16} className="text-[#C39767]" /> Categorías de Ayuda
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { icon: HardHat, title: "Gestión de Obra", desc: "Anotaciones, residentes y aprobaciones." },
                                        { icon: FolderGit2, title: "Sincronización BIM L3", desc: "Conexión con Revit, modelos y colisiones." },
                                        { icon: Users, title: "Directorio y Contactos", desc: "Invitaciones y asignación de obras." },
                                        { icon: Shield, title: "Ajustes de Seguridad", desc: "Firmas, doble factor y logs." },
                                        { icon: CreditCard, title: "Planes y Facturación", desc: "Dudas sobre cobros o límites." },
                                        { icon: Video, title: "Video Tutoriales", desc: "Paso a paso audiovisual." }
                                    ].map((cat, i) => (
                                        <div key={i} className={`p-5 rounded-2xl border ${cardBorder} ${cardBg} ${hoverBg} transition-colors cursor-pointer group flex items-start gap-4`}>
                                            <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5' : 'bg-[#2A241E]/5'} flex items-center justify-center flex-shrink-0 text-[#C39767] group-hover:scale-110 transition-transform`}>
                                                <cat.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${textClass} text-sm mb-1 group-hover:text-[#C39767] transition-colors`}>{cat.title}</h4>
                                                <p className={`text-xs ${textMuted} leading-relaxed`}>{cat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQs & Articles */}
                            <div className="lg:col-span-1">
                                <h3 className={`text-sm font-display font-bold ${textClass} opacity-90 uppercase tracking-widest mb-6 flex items-center gap-2`}>
                                    <Search size={16} className="text-[#C39767]" /> Artículos Populares
                                </h3>
                                <div className="space-y-3">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className={`p-4 rounded-xl border ${cardBorder} ${cardBg} ${hoverBg} transition-colors cursor-pointer group`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2 py-0.5 rounded border border-[#C39767]/20 bg-[#C39767]/10 text-[#C39767] text-[9px] font-mono tracking-widest font-bold uppercase">
                                                    {faq.category}
                                                </span>
                                                <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${faq.readTime === 'VÍDEO' ? 'text-blue-400' : textFaint}`}>
                                                    {faq.readTime === 'VÍDEO' && <Play size={10} />}
                                                    {faq.readTime}
                                                </span>
                                            </div>
                                            <h4 className={`text-sm ${textClass} opacity-80 font-medium group-hover:opacity-100 transition-opacity leading-tight`}>
                                                {faq.title}
                                            </h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Footer Contact */}
                        <div className={`mt-8 pt-8 border-t ${borderColor} text-center`}>
                            <p className={`${textMuted} text-sm mb-4`}>¿No encuentras lo que buscas?</p>
                            <div className="flex items-center justify-center gap-4">
                                <button className={`px-5 py-2 rounded-lg border ${cardBorder} ${cardBg} ${hoverBg} ${textClass} text-sm transition-colors`}>
                                    Enviar un correo
                                </button>
                                <button className="px-5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 font-medium text-sm transition-colors">
                                    Asistencia por WhatsApp
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}
