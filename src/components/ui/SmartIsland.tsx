"use client";

import { mostrarDemo } from "@/lib/eventos";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, useAnimationFrame, useSpring, useMotionValue } from "framer-motion";
import { useLenis } from "./LenisProvider";
import {
    TableProperties,
    Book,
    CalendarDays,
    Box,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   SmartIsland — 3-State Scroll Machine
   ──────────────────────────────────────────────────────────────
   HOVER FLICKER FIX:
   The onMouseEnter/Leave events are placed on a STABLE outer
   <div> that does NOT change size. The inner motion.button that
   actually grows during layout animation is purely visual.
   This prevents the "grow → cursor leaves → shrink → re-enter"
   infinite loop.

   POP FIX:
   The pop overlay `<motion.div>` carries `key={lastPop}` so
   React unmounts and remounts it fresh on every new pop, even
   for the same module. Without this key, React reused the same
   DOM node and the animation never re-played.
   ══════════════════════════════════════════════════════════════ */

/* Smart Concepts / Bitácora / Smart Calendar ahora viven dentro del Hero
   (HeroDemoShowcase) en vez de secciones aparte — sus módulos regresan
   arriba al hero. */
export const modules = [
    {
        id: "concepts",
        label: "Smart Concepts",
        Icon: TableProperties,
        color: "#00D26A",
        activeColor: "#000000",
        targetId: "hero-or-chaos",
        demo: 0,
    },
    {
        id: "bitacora",
        label: "Bitácora",
        Icon: Book,
        color: "#C39767",
        activeColor: "#1a0e08",
        targetId: "hero-or-chaos",
        demo: 1,
    },
    {
        id: "calendar",
        label: "Smart Calendar",
        Icon: CalendarDays,
        color: "#3B82F6",
        activeColor: "#000000",
        targetId: "hero-or-chaos",
        demo: 2,
    },
    {
        id: "bim",
        label: "Smart BIM",
        Icon: Box,
        color: "#A855F7",
        activeColor: "#ffffff",
        targetId: "bim-sync",
    },
];

export type IslandState = "hidden" | "center" | "top";

interface SmartIslandProps {
    islandState?: IslandState;
    triggerPop?: string | null;
    isBimSectionActive?: boolean;
    mode?: "fixed" | "default" | string;
    /** En móvil: fuerza la expansión completa cuando la sección showcase está en vista */
    forceExpand?: boolean;
    /** Oculta la isla con CSS puro cuando el footer es visible (evita race condition con state machine) */
    hideIsland?: boolean;
    /** Incrementa cada vez que el showcase entra en vista — dispara el reset de activeTabId */
    showcaseResetCount?: number;
}

export default function SmartIsland({ islandState = "hidden", triggerPop, isBimSectionActive = false, forceExpand = false, hideIsland = false, showcaseResetCount = 0 }: SmartIslandProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [popKey, setPopKey] = useState<Record<string, number>>({});
    const [isExpanded, setIsExpanded] = useState(false);
    // Última sección seleccionada — controla el ícono/color del botón circular colapsado
    const [activeTabId, setActiveTabId] = useState<string>(modules[0].id);
    const activeMod = modules.find(m => m.id === activeTabId) ?? modules[0];
    // Detectar móvil en runtime (evita SSR mismatch)
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        // Safari <14: solo addListener/removeListener
        if (typeof mq.addEventListener === "function") mq.addEventListener("change", handler);
        else (mq as MediaQueryList & { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handler);
        return () => {
            if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", handler);
            else (mq as MediaQueryList & { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(handler);
        };
    }, []);

    // Ref para rastrear el valor anterior de forceExpand
    // Solo auto-colapsamos cuando hace una TRANSICIÓN true→false (usuario sale del showcase).
    // Cuando forceExpand ya era false y el usuario hace clic para expandir,
    // el effect NO interfiere porque prevForceExpand.current ya era false.
    const prevForceExpand = useRef(false);
    useEffect(() => {
        if (!isMobile) return;
        if (forceExpand && !prevForceExpand.current) {
            // Showcase entró a la vista → expandir + RESET al estado neutral
            setIsExpanded(true);
            setActiveTabId(modules[0].id); // borra la selección residual
        } else if (!forceExpand && prevForceExpand.current) {
            // Showcase salió de la vista → colapsar
            setIsExpanded(false);
        }
        prevForceExpand.current = forceExpand;
    }, [forceExpand, isMobile]);

    // Reset directo sobre showcaseResetCount — completamente desacoplado de isMobile y rootMargin.
    // Cada vez que el contador cambia (showcase entró en vista), resetear el tab activo.
    useEffect(() => {
        if (showcaseResetCount > 0) {
            setActiveTabId(modules[0].id);
        }
    }, [showcaseResetCount]);

    // Sync external trigger → update key to a fresh timestamp
    useEffect(() => {
        if (triggerPop) {
            setPopKey((prev) => ({ ...prev, [triggerPop]: Date.now() }));
        }
    }, [triggerPop]);

    // Single source of truth: the IntersectionObserver state machine in page.tsx
    // controls all visibility transitions. No secondary scroll guard needed.
    const effectiveState = islandState;

    const lenisRef = useLenis();
    const handleScroll = (id: string) => {
        const lenis = lenisRef.current;
        if (lenis) {
            lenis.scrollTo(`#${id}`); // desktop: respeta el motor de scroll de Lenis
        } else {
            // móvil/touch: scroll nativo (la opción 'smooth' funciona aunque html sea 'auto')
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
    };

    // ── ANIMATION VARIANTS ──
    // x: "-50%" is owned by Framer, NOT Tailwind, to prevent transform clobbering.
    // ── TRACKING DINÁMICO DEL ANCLA ──
    // Permite que la isla siga perfectamente su placeholder en el DOM sin importar cómo reacomode el texto la pantalla.
    const rawTop = useMotionValue(400); // number, se ajustará en el primer frame
    const dynamicTop = useSpring(rawTop, { stiffness: 400, damping: 40 });

    useAnimationFrame(() => {
        if (typeof window === "undefined" || typeof document === "undefined") return;
        // Móvil: la posición se setea por estado en el useEffect de abajo (sin
        // getBoundingClientRect por frame). Esto elimina el reflow síncrono 60fps
        // que producía el jiggle/micro-jank al hacer scroll en el showcase.
        if (isMobile) return;
        if (islandState === "hidden") return; // nada que actualizar durante el fade-out

        if (islandState === "center") {
            const anchor = document.getElementById("island-anchor");
            if (anchor) {
                const rect = anchor.getBoundingClientRect();
                // Posicionar de manera que el y="-50%" de la variante logre encajar la isla
                // exactamente en el centro (vertical) de nuestro placeholder en pantalla.
                rawTop.set(rect.top + rect.height / 2);
            }
        } else if (islandState === "top") {
            // 80px da clearance a la slim navbar global tras el scroll.
            rawTop.set(80);
        }
    });

    // Móvil: posiciona la isla por estado (cero lectura de layout por frame).
    // En 'center' la subimos a ~40% del viewport (antes 50%) para que no quede
    // encima del texto descriptivo de la sección.
    useEffect(() => {
        if (!isMobile || typeof window === "undefined") return;
        rawTop.set(islandState === "top" ? 80 : window.innerHeight * 0.40);
    }, [isMobile, islandState, rawTop]);

    const variants = {
        hidden: {
            opacity: 0,
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 0.8,
            pointerEvents: "none" as const,
        },
        center: {
            opacity: 1,
            left: "50%",
            x: "-50%",
            y: "-50%",
            scale: 1,
            pointerEvents: "auto" as const,
            zIndex: 60,
        },
        top: {
            opacity: 1,
            left: "50%",
            x: "-50%",
            y: "0", // como dynamicTop bajará a 24px, no restamos 50%
            scale: 1,
            pointerEvents: "auto" as const,
            zIndex: 50,
        },
    };

    // Objeto Framer para ocultar la isla — aplicado como inline style
    // (mayor prioridad que las variantes), evitando el conflicto CSS vs Framer.
    const hiddenByFooter = {
        opacity: 0,
        y: 120,
        scale: 0.85,
        pointerEvents: "none" as const,
    };

    return (
        <motion.div
            className="fixed font-sans z-[100]"
            style={{ top: dynamicTop }}
            initial="hidden"
            animate={hideIsland ? hiddenByFooter : effectiveState}
            variants={variants}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
        >
            <LayoutGroup>
                {/*
                 * DOM ÚNICO — un solo <nav> que morphea entre círculo (colapsado)
                 * y pill (expandido) vía CSS transition de ancho.
                 * Nada se desmonta: cero flickering, cero parpadeo.
                 *
                 * En desktop: isMobile=false → siempre renderiza la pill completa
                 *             (collapsed=false, todos los íconos visibles).
                 * En móvil:   collapsed = isMobile && !isExpanded && !forceExpand
                 */}
                <div className="relative inline-flex">
                    {/* ── BIM Racing LED (solo cuando BIM section activa) ── */}
                    {isBimSectionActive && (
                        <svg
                            className="pointer-events-none absolute inset-0 w-full h-full"
                            style={{ borderRadius: "999px" }}
                        >
                            <motion.rect
                                x="1.5" y="1.5"
                                width="calc(100% - 3px)"
                                height="calc(100% - 3px)"
                                rx="999"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2"
                                strokeDasharray="60 1500"
                                strokeLinecap="round"
                                animate={{ strokeDashoffset: [1560, 0] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            />
                        </svg>
                    )}


                    {/* ════════════════════════════════════════════════════════
                     *  CONTENEDOR PILL ÚNICO — morphea via CSS entre
                     *  círculo [56×56px] ↔ pill [auto×auto]
                     *  La transición cubic-bezier crea el efecto "spring" de gelatina.
                     * ════════════════════════════════════════════════════════ */}
                    <nav
                        style={{
                            background: "#0a0a0a",
                            border: isBimSectionActive ? "none" : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: isBimSectionActive
                                ? "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(168,85,247,0.12)"
                                : "0 8px 32px rgba(0,0,0,0.4)",
                            // Morphing css-only removido para mantener isla extendida en móvil
                            width: undefined,
                            height: undefined,
                            transition: "width 1000ms cubic-bezier(0.34,1.56,0.64,1), height 1000ms cubic-bezier(0.34,1.56,0.64,1), border-radius 600ms ease, box-shadow 300ms ease",
                        }}
                        className="relative inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-2 overflow-hidden font-sans cursor-pointer"
                    >
                        {/* ── HALO COMETA ──
                         * Ahora está DENTRO del nav con overflow-hidden.
                         * El clip del nav lo contiene durante la transición → cero desbordamiento.
                         * -z-10 lo pone detrás del fondo semisólido del nav.
                         */}
                        {(() => {
                            const collapsed = false;
                            const haloColor = activeMod.color;
                            return (
                                <motion.div
                                    className="absolute inset-0 -z-10 rounded-full pointer-events-none"
                                    style={{
                                        background: `conic-gradient(from 0deg, transparent 0deg, transparent 200deg, ${haloColor}E6 240deg, rgba(255,255,255,0.55) 260deg, ${haloColor}E6 280deg, transparent 320deg, transparent 360deg)`,
                                    }}
                                    animate={{ rotate: 360, opacity: collapsed ? 1 : 0 }}
                                    transition={{
                                        rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                                        opacity: { duration: 0.3 },
                                    }}
                                />
                            );
                        })()}

                        {modules.map((mod, index) => {
                            const isHovered = hoveredId === mod.id;
                            const lastPop = popKey[mod.id] ?? 0;
                            // Siempre en modo pastilla expansiva
                            const collapsed = false;
                            const hideOnCollapse = false;

                            return (
                                <div
                                    key={mod.id}
                                    className="relative cursor-pointer flex-shrink-0"
                                    style={{
                                        width: hideOnCollapse ? "0px" : undefined,
                                        opacity: hideOnCollapse ? 0 : 1,
                                        transform: hideOnCollapse ? "scale(0.4)" : "scale(1)",
                                        filter: hideOnCollapse ? "blur(2px)" : "blur(0px)",
                                        overflow: "hidden",
                                        padding: hideOnCollapse ? "0" : "4px",
                                        position: "relative",
                                        zIndex: 11,
                                        // 200ms delay — snappy: el pop empieza cuando el nav
                                        // apenas comienza a abrirse, sin esperar al 50%.
                                        transition: `
                                            width     400ms cubic-bezier(0.34,1.56,0.64,1) 200ms,
                                            opacity   280ms cubic-bezier(0.34,1.56,0.64,1) 200ms,
                                            transform 300ms cubic-bezier(0.34,1.56,0.64,1) 200ms,
                                            filter    200ms ease                           200ms,
                                            padding   400ms ease                           100ms
                                        `,
                                        pointerEvents: hideOnCollapse ? "none" : "auto",
                                    }}
                                    onMouseEnter={() => setHoveredId(mod.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    onClick={(e) => {
                                        e.stopPropagation(); // evita bug de click en contenedor padre
                                        setActiveTabId(mod.id); // actualiza el ícono del colapsado
                                        if (isMobile) setIsExpanded(false); // colapsa al navegar
                                        handleScroll(mod.targetId);
                                        // Los tres módulos del hero comparten ancla: sin esto
                                        // "Bitácora" subía al hero pero seguía el demo que
                                        // estuviera puesto. Smart BIM no tiene demo: solo baja.
                                        if (mod.demo !== undefined) mostrarDemo(mod.demo);
                                    }}
                                >
                                    <motion.div
                                        className="relative flex items-center gap-2 rounded-full overflow-hidden pointer-events-none flex-shrink-0 whitespace-nowrap"
                                        style={{
                                            background: isHovered ? mod.color : "transparent",
                                            padding: isHovered ? "8px 16px 8px 10px" : "10px",
                                            WebkitFontSmoothing: "antialiased",
                                        }}
                                        animate={
                                            lastPop > 0
                                                ? {
                                                    scale: [1, 1.18, 0.95, 1],
                                                    filter: ["brightness(1)", "brightness(1.8)", "brightness(1.1)", "brightness(1)"],
                                                    transition: { type: "tween", duration: 0.35, ease: "easeInOut" },
                                                }
                                                : {
                                                    scale: 1,
                                                    filter: "brightness(1)",
                                                    transition: { type: "spring", stiffness: 400, damping: 30 },
                                                }
                                        }
                                        key={`${mod.id}-${lastPop}`}
                                    >
                                        <mod.Icon
                                            className="h-5 w-5 shrink-0 relative z-10"
                                            strokeWidth={isHovered ? 2.5 : 2}
                                            style={{
                                                color: isHovered ? mod.activeColor : "rgba(255,255,255,0.65)",
                                                transition: "color 0.15s",
                                            }}
                                        />
                                        <AnimatePresence mode="popLayout">
                                            {(isHovered && !collapsed) && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className="overflow-hidden whitespace-nowrap text-[13px] font-semibold tracking-wide leading-none relative z-10"
                                                    style={{
                                                        color: mod.activeColor,
                                                        fontFamily: "Inter, system-ui, sans-serif",
                                                    }}
                                                >
                                                    {mod.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        {lastPop > 0 && (
                                            <motion.div
                                                key={lastPop}
                                                className="absolute inset-0 rounded-full pointer-events-none"
                                                initial={{ opacity: 0.9, scale: 0.7 }}
                                                animate={{ opacity: 0, scale: 1.6 }}
                                                transition={{ duration: 0.45, ease: "easeOut" }}
                                                style={{
                                                    border: `2px solid ${mod.color}`,
                                                    backgroundColor: `${mod.color}25`,
                                                }}
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </LayoutGroup>
        </motion.div>
    );
}
