"use client";

import { useTheme } from "@/components/ThemeProvider";

/* ══════════════════════════════════════════════════════════════
   useThemeVars — hook centralizado de variables de tema
   ──────────────────────────────────────────────────────────────
   Todas las páginas del dashboard usaban exactamente las mismas
   ~20 variables CSS condicionales. Este hook las centraliza en
   un solo lugar para eliminar duplicación y garantizar
   consistencia.
   ══════════════════════════════════════════════════════════════ */

export function useThemeVars() {
    const { theme, toggleTheme, mounted } = useTheme();
    const isDark = theme === "dark";

    return {
        // Core
        theme,
        isDark,
        mounted,
        toggleTheme,

        // Backgrounds
        bgClass: isDark ? "bg-[#060606]" : "bg-[#F8F6F0]",
        sidebarBg: isDark ? "bg-[#080808]/95" : "bg-[#F4EFE6]/95",
        topBarBg: isDark ? "bg-[#080808]/80" : "bg-[#F4EFE6]/80",
        cardBg: isDark ? "bg-white/[0.02]" : "bg-white/60",
        hoverBg: isDark ? "hover:bg-white/5" : "hover:bg-[#2A241E]/10",

        // Borders
        borderColor: isDark ? "border-white/[0.06]" : "border-[#2A241E]/10",
        cardBorder: isDark ? "border-white/[0.07]" : "border-[#2A241E]/10",

        // Text
        textClass: isDark ? "text-white" : "text-[#2A241E]",
        textMuted: isDark ? "text-white/60" : "text-[#1A1510]",
        textFaint: isDark ? "text-white/30" : "text-[#4A4035]",

        // Accents
        activeItemBg: isDark
            ? "bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767]"
            : "bg-[#A87B4C]/10 border border-[#A87B4C]/20 text-[#A87B4C]",
        accentGlow: isDark
            ? "from-transparent via-[#C39767]/40 to-transparent"
            : "from-transparent via-[#A87B4C]/40 to-transparent",

        // Patterns
        bgPattern: isDark
            ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)"
            : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.06) 1px, transparent 0)",
    };
}
