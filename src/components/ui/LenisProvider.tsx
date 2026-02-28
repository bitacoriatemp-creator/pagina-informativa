"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";

/* ══════════════════════════════════════════════════════════════
   LenisProvider
   ──────────────────────────────────────────────────────────────
   Wraps the app in a smooth-scroll instance using Lenis.
   Exposes the instance via React Context so child components
   (e.g. modals) can call lenis.stop() / lenis.start().
   
   Why Lenis over snap-mandatory:
   - snap-mandatory breaks scroll-driven Framer Motion animations
     (250vh hero lock, 300vh island showcase)
   - Lenis adds butter-smooth inertia without overriding native
     scroll events — useScroll() in Framer Motion stays in sync
   
   Config chosen for "Apple-like" feel:
   - duration: 1.8s    → longer hang = more premium feel
   - easing: custom cubic-bezier mimicking Apple's spring curve
   - orientation: vertical
   ══════════════════════════════════════════════════════════════ */

// ── Context for accessing the Lenis instance from anywhere ──
const LenisContext = createContext<React.MutableRefObject<Lenis | null>>({ current: null });

/** Hook to access the Lenis instance. Call lenis.stop() / lenis.start() to freeze/resume scrolling. */
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

    useEffect(() => {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;

        const lenis = new Lenis({
            duration: isMobile ? 0.8 : 1.8,   // móvil: rápido y natural; desktop: premium inertia
            easing: appleEase,
            touchMultiplier: isMobile ? 0 : 1.2, // móvil: scroll táctil nativo (0 = sin override)
            smoothWheel: !isMobile,              // wheel smoothing solo en desktop
        });

        lenisRef.current = lenis;

        // RAF loop — keeps Lenis synced with Framer Motion's scroll tracking
        let rafId: number;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return (
        <LenisContext.Provider value={lenisRef}>
            {children}
        </LenisContext.Provider>
    );
}
