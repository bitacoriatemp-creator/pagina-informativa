"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/* ══════════════════════════════════════════════════════════════
   LenisProvider
   ──────────────────────────────────────────────────────────────
   Smooth-scroll powered by Lenis, ONLY active on marketing
   pages (landing, pricing, etc.).

   On /dashboard/* routes, Lenis is NOT created at all because
   the dashboard uses h-screen + internal overflow-y-auto divs.
   Lenis hijacks wheel events at the document level, preventing
   those inner containers from scrolling via mouse wheel.
   ══════════════════════════════════════════════════════════════ */

const LenisContext = createContext<React.MutableRefObject<Lenis | null>>({ current: null });

export function useLenis() {
    return useContext(LenisContext);
}

// Apple-style ease: fast start, long deceleration tail
const appleEase = (t: number) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export default function LenisProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<Lenis | null>(null);
    const pathname = usePathname();

    const isDashboard = pathname.startsWith("/dashboard");

    useEffect(() => {
        // ── Do NOT create Lenis on dashboard routes ──
        if (isDashboard) {
            // If navigating FROM a non-dashboard page, destroy existing instance
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
            return;
        }

        // ── Create Lenis for landing/marketing pages ──
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        const lenis = new Lenis({
            duration: isMobile ? 0.8 : 1.8,
            easing: appleEase,
            touchMultiplier: isMobile ? 0 : 1.2,
            smoothWheel: !isMobile,
        });

        lenisRef.current = lenis;

        let rafId: number;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [isDashboard]);

    return (
        <LenisContext.Provider value={lenisRef}>
            {children}
        </LenisContext.Provider>
    );
}

