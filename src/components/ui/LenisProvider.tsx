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
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
            return;
        }

        // ── On mobile / touch devices: use NATIVE scroll (no Lenis) ──
        // Lenis on touch fights the native momentum scroll → the "scroll raro".
        // Native touch scrolling is smoother and frees the main thread.
        // Re-evaluates on viewport/input change so desktop⇄mobile stays correct.
        const mql = window.matchMedia("(max-width: 1023px), (pointer: coarse)");
        let rafId: number | null = null;

        const startLenis = () => {
            if (lenisRef.current) return;
            const lenis = new Lenis({
                duration: 1.8,
                easing: appleEase,
                smoothWheel: true,
            });
            lenisRef.current = lenis;
            const raf = (time: number) => {
                lenis.raf(time);
                rafId = requestAnimationFrame(raf);
            };
            rafId = requestAnimationFrame(raf);
        };

        const stopLenis = () => {
            if (rafId != null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
        };

        const apply = () => {
            if (mql.matches) stopLenis(); // móvil/touch → scroll nativo
            else startLenis();            // desktop con mouse → smooth Lenis
        };

        apply();
        // Safari <14 solo tiene addListener/removeListener (sin esto, el
        // TypeError en useEffect desmonta TODO el árbol → página en blanco).
        if (typeof mql.addEventListener === "function") mql.addEventListener("change", apply);
        else (mql as MediaQueryList & { addListener: (cb: () => void) => void }).addListener(apply);

        return () => {
            if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", apply);
            else (mql as MediaQueryList & { removeListener: (cb: () => void) => void }).removeListener(apply);
            stopLenis();
        };
    }, [isDashboard]);

    return (
        <LenisContext.Provider value={lenisRef}>
            {children}
        </LenisContext.Provider>
    );
}

