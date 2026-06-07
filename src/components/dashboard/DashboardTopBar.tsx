"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Home,
    Users,
    User,
    Settings,
    LifeBuoy,
    Moon,
    SunDim,
    Bell,
    AtSign,
} from "lucide-react";
import Image from "next/image";
import { useThemeVars } from "@/hooks/useThemeVars";
import { useDashboard, DashboardNotification } from "@/context/DashboardContext";
import { assetPath } from "@/lib/assetPath";

type PageKey = "inicio" | "contactos" | "perfil" | "configuracion" | "ayuda" | string;

interface DashboardTopBarProps {
    activePage: PageKey;
    pageTitle: string;
    rightActions?: React.ReactNode;
    onMenuClick?: () => void;
}

const NAV_ITEMS: { key: PageKey; href: string; label: string; icon: React.ElementType; maxWidth: string }[] = [
    { key: "inicio", href: "/dashboard", label: "Inicio", icon: Home, maxWidth: "100px" },
    { key: "contactos", href: "/dashboard/contacts", label: "Contactos", icon: Users, maxWidth: "100px" },
    { key: "social", href: "/dashboard/social", label: "Social", icon: AtSign, maxWidth: "100px" },
    { key: "perfil", href: "/dashboard/profile", label: "Perfil", icon: User, maxWidth: "100px" },
    { key: "configuracion", href: "/dashboard/settings", label: "Sistema", icon: Settings, maxWidth: "120px" },
    { key: "ayuda", href: "/dashboard/help", label: "Ayuda", icon: LifeBuoy, maxWidth: "100px" },
];

const LOGO_SRC = "/images/logo_horizontal-removebg-preview.png";

export default function DashboardTopBar({ activePage, pageTitle, rightActions, onMenuClick }: DashboardTopBarProps) {
    const {
        isDark,
        theme,
        toggleTheme,
        borderColor,
        topBarBg,
        sidebarBg,
        textMuted,
        textClass,
        hoverBg,
        activeItemBg,
    } = useThemeVars();

    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const mobileIslandRef = useRef<HTMLDivElement>(null);

    const { notifications, markAllAsRead, userProfile } = useDashboard();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (mobileIslandRef.current && !mobileIslandRef.current.contains(event.target as Node)) {
                setIsMobileExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

            {/* CENTER: Mobile & Desktop Smart Island Navigation */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[60]">
                {/* Desktop Version */}
                <nav className="hidden lg:flex items-center px-2 py-1.5 rounded-full shadow-2xl transition-colors duration-300 border backdrop-blur-xl"
                    style={{
                        backgroundColor: isDark ? 'rgba(15, 15, 15, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 10px 40px -10px rgba(0,0,0,0.1)',
                    }}
                >
                    {NAV_ITEMS.map((item, idx) => {
                        const isActive = item.key === activePage;
                        const Icon = item.icon;

                        // Divider only after "contactos"
                        const showDivider = item.key === "contactos";

                        return (
                            <React.Fragment key={item.key}>
                                {isActive ? (
                                    <button className="flex items-center h-[38px] px-5 rounded-full transition-all duration-300 bg-[#C39767] text-white shadow-[0_0_24px_rgba(195,151,103,0.4)]">
                                        <Icon size={16} strokeWidth={2.5} className="shrink-0" />
                                        <span className="text-[14px] font-semibold whitespace-nowrap ml-2.5">
                                            {item.label}
                                        </span>
                                    </button>
                                ) : (
                                    <Link href={item.href} className={`flex items-center h-[38px] px-3.5 rounded-full transition-all duration-300 group/nav ${textMuted} ${isDark ? 'hover:text-white hover:bg-white/10' : 'hover:text-black hover:bg-black/5'}`}>
                                        <Icon size={18} strokeWidth={2} className="shrink-0" />
                                        <span className="text-[14px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover/nav:max-w-[100px] group-hover/nav:ml-2.5 group-hover/nav:opacity-100">
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                                {showDivider && (
                                    <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>

                {/* Mobile Version — Centered expanding pill */}
                <div
                    ref={mobileIslandRef}
                    className={`lg:hidden flex items-center shadow-lg border transition-all duration-[400ms] ease-out overflow-hidden rounded-[100px] ${isMobileExpanded ? 'p-1.5 gap-1' : 'p-1 gap-0'}`}
                    style={{
                        backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(250,245,240,0.95)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.key === activePage;
                        const Icon = item.icon;
                        // Ensure the active item is visually present even when collapsed
                        const isVisible = isMobileExpanded || isActive;

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={(e) => {
                                    if (!isMobileExpanded) {
                                        // Collapsed -> Expand! (prevent navigation)
                                        e.preventDefault();
                                        setIsMobileExpanded(true);
                                    } else {
                                        // Expanded -> Collapse and logic
                                        if (isActive) {
                                            e.preventDefault(); // already here
                                            setIsMobileExpanded(false);
                                        } else {
                                            // Wait for micro animation to let user see feedback before route change
                                            setTimeout(() => setIsMobileExpanded(false), 200);
                                        }
                                    }
                                }}
                                className={`flex items-center justify-center rounded-full transition-all duration-[400ms] ease-out overflow-hidden ${isVisible
                                        ? `w-10 h-10 opacity-100 ${isActive ? activeItemBg : `${textMuted} ${hoverBg}`}`
                                        : 'w-0 h-10 opacity-0 px-0 mx-0 border-0 pointer-events-none'
                                    }`}
                                aria-label={item.label}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0 ml-auto relative">

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
                <div className="relative hidden sm:block">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 ${textMuted} rounded-full ${hoverBg} transition-colors`}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && notifications.some(n => !n.read) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className={`absolute top-full right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl border ${borderColor} ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'} overflow-hidden animate-fade-in`} style={{ zIndex: 9999 }}>
                            <div className={`p-4 border-b ${borderColor} flex justify-between items-center bg-black/5 dark:bg-white/5`}>
                                <h3 className={`font-bold ${textClass}`}>Notificaciones</h3>
                                <button onClick={markAllAsRead} className="text-[11px] text-[#C39767] hover:underline uppercase tracking-wider font-bold">Marcar leídas</button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className={`p-6 text-center text-sm ${textMuted}`}>No hay notificaciones nuevas</div>
                                ) : (
                                    notifications.map((n: DashboardNotification) => (
                                        <div key={n.id} className={`p-4 border-b ${borderColor} ${!n.read ? (isDark ? 'bg-white/5' : 'bg-black/5') : ''}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                <h4 className={`text-sm font-bold ${textClass}`}>{n.title}</h4>
                                            </div>
                                            <p className={`text-xs ${textMuted}`}>{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <Link href="/dashboard/profile" className={`relative w-8 h-8 rounded-full bg-gradient-to-br ${userProfile.avatarGrad} flex items-center justify-center text-sm font-bold shadow-lg ring-2 ${isDark ? 'ring-white/10 hover:ring-white/30 text-white' : 'ring-[#2A241E]/10 hover:ring-[#2A241E]/30 text-white'} transition-all cursor-pointer overflow-hidden`}>
                    {userProfile.customAvatarUrl ? (
                         <Image src={assetPath(userProfile.customAvatarUrl)} alt="Avatar" fill className="object-cover" unoptimized />
                    ) : (
                         userProfile.name.split(" ").map(n => n[0]).join("").substring(0, 2)
                    )}
                </Link>
            </div>
        </header>
    );
}
