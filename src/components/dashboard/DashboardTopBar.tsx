"use client";

import React from "react";
import Link from "next/link";
import {
    Home,
    Users,
    User,
    Settings,
    LifeBuoy,
    Menu,
    Moon,
    SunDim,
    Bell,
} from "lucide-react";
import Image from "next/image";
import { useThemeVars } from "@/hooks/useThemeVars";

/* ══════════════════════════════════════════════════════════════
   DashboardTopBar — Barra superior compartida del Dashboard
   ──────────────────────────────────────────────────────────────
   Componente reutilizable que renderiza:
   - Logo (con soporte para basePath en producción)
   - Título de la sección
   - Smart Island Navigation (con tab activo dinámico)
   - Acciones (tema, notificaciones, avatar)
   
   Props:
   - activePage: clave del tab activo
   - pageTitle: texto que aparece al lado del logo
   - rightActions: elementos adicionales para el lado derecho
   ══════════════════════════════════════════════════════════════ */

type PageKey = "inicio" | "contactos" | "perfil" | "configuracion" | "ayuda";

interface DashboardTopBarProps {
    activePage: PageKey;
    pageTitle: string;
    rightActions?: React.ReactNode;
    onMenuClick?: () => void;
}

const NAV_ITEMS: { key: PageKey; href: string; label: string; icon: React.ElementType; maxWidth: string }[] = [
    { key: "inicio", href: "/dashboard", label: "Inicio", icon: Home, maxWidth: "100px" },
    { key: "contactos", href: "/dashboard/contacts", label: "Contactos", icon: Users, maxWidth: "100px" },
    { key: "perfil", href: "/dashboard/profile", label: "Perfil", icon: User, maxWidth: "100px" },
    { key: "configuracion", href: "/dashboard/settings", label: "Configuración", icon: Settings, maxWidth: "120px" },
    { key: "ayuda", href: "/dashboard/help", label: "Ayuda", icon: LifeBuoy, maxWidth: "100px" },
];

const LOGO_SRC = process.env.NODE_ENV === "production"
    ? "/plataforma/images/logo_horizontal-removebg-preview.png"
    : "/images/logo_horizontal-removebg-preview.png";

export default function DashboardTopBar({ activePage, pageTitle, rightActions, onMenuClick }: DashboardTopBarProps) {
    const {
        isDark,
        theme,
        toggleTheme,
        borderColor,
        topBarBg,
        sidebarBg,
        textMuted,
        textFaint,
        hoverBg,
        activeItemBg,
    } = useThemeVars();

    return (
        <header className={`h-16 border-b ${borderColor} ${topBarBg} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 transition-colors duration-500 ${isDark ? 'dark-topbar' : 'light-topbar'}`}>

            {/* LEFT: Logo & Brand */}
            <div className="flex items-center gap-4 sm:gap-6 h-full shrink-0">
                <Link href="/" className="flex items-center justify-center relative cursor-pointer group h-full">
                    <div className={`w-[130px] h-full ${sidebarBg} border-x border-b ${borderColor} flex items-center justify-center shrink-0 rounded-b-2xl shadow-sm transition-colors px-3 relative`}>
                        {isDark ? (
                            <Image src={LOGO_SRC} alt="BitacorIA Logo" fill sizes="130px" className="object-contain p-3 drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] transition-transform duration-300 group-hover:scale-105" priority />
                        ) : (
                            <Image src={LOGO_SRC} alt="BitacorIA Logo" fill sizes="130px" className="object-contain p-3 drop-shadow-[0_2px_10px_rgba(168,123,76,0.3)] transition-transform duration-300 group-hover:scale-105" style={{ filter: "brightness(0.3) sepia(1) hue-rotate(-30deg) saturate(3)" }} priority />
                        )}
                    </div>
                </Link>

                <div className="hidden sm:flex items-center gap-2">
                    <h1 className="text-sm md:text-base font-display font-medium tracking-widest uppercase opacity-80 whitespace-nowrap">
                        {pageTitle}
                    </h1>
                </div>
            </div>

            {/* CENTER: Smart Island Navigation */}
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 p-1.5 rounded-2xl shadow-sm border transition-colors duration-300"
                style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
            >
                {NAV_ITEMS.map((item, idx) => {
                    const isActive = item.key === activePage;
                    const Icon = item.icon;

                    // Divider after "contactos"
                    const showDivider = item.key === "contactos";

                    return (
                        <React.Fragment key={item.key}>
                            {isActive ? (
                                <button className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${activeItemBg}`}>
                                    <Icon size={16} strokeWidth={2.5} className="shrink-0" />
                                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-[100px] ml-2 opacity-100"
                                        style={{ maxWidth: item.maxWidth }}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            ) : (
                                <Link href={item.href} className={`flex items-center h-9 px-3 rounded-xl transition-all duration-300 group/nav ${textMuted} ${hoverBg}`}>
                                    <Icon size={16} strokeWidth={1.5} className="shrink-0" />
                                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2 group-hover/nav:opacity-100"
                                        style={{ '--max-expand': item.maxWidth } as React.CSSProperties}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            )}
                            {showDivider && (
                                <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>

            {/* RIGHT: Actions */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0 ml-auto">
                {/* Mobile Menu Toggle — hidden on desktop */}
                <button
                    onClick={onMenuClick}
                    className={`p-2 lg:hidden ${textMuted} rounded-lg ${hoverBg} transition-colors`}
                >
                    <Menu size={20} />
                </button>

                {/* Page-specific actions (Create, Search, etc.) */}
                {rightActions}

                <div className={`w-px h-6 ${isDark ? 'bg-[#333]' : 'bg-[#2A241E]/10'} hidden sm:block`} />

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors`}
                    title="Cambiar Tema"
                >
                    {theme === 'dark' ? <SunDim size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors hidden sm:block`}>
                    <Bell size={20} />
                </button>

                {/* Avatar */}
                <Link href="/dashboard/profile" className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#C39767] to-amber-600 flex items-center justify-center text-sm font-bold shadow-lg ring-2 ${isDark ? 'ring-white/10 hover:ring-white/30 text-white' : 'ring-[#2A241E]/10 hover:ring-[#2A241E]/30 text-white'} transition-all cursor-pointer`}>
                    EM
                </Link>
            </div>
        </header>
    );
}
