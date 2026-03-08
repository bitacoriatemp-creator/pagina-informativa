"use client";

import React from "react";
import { useThemeVars } from "@/hooks/useThemeVars";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { bgClass, textClass, bgPattern, mounted } = useThemeVars();
    const { isSidebarOpen, setIsSidebarOpen } = useDashboard();

    if (!mounted) return null;

    return (
        <div className={`flex h-screen ${bgClass} ${textClass} font-sans overflow-hidden transition-colors duration-500`} style={{ backgroundImage: bgPattern, backgroundSize: "32px 32px" }}>

            {/* MOBILE OVERLAY (if needed later) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent">
                {children}
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </DashboardProvider>
    );
}
