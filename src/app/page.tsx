"use client";

import { useState, useRef, useEffect } from "react";
import { useInView } from "framer-motion";
import HeroHybrid from "@/components/ui/HeroHybrid";
import GlobalNavbar from "@/components/ui/GlobalNavbar";
import ProblemChaos from "@/components/ui/ProblemChaos";
import SmartIslandShowcase from "@/components/ui/SmartIslandShowcase";
import SmartConceptsSection from "@/components/ui/SmartConceptsSection";
import SmartBimSyncSection from "@/components/ui/SmartBimSyncSection";
import WorldAdaptiveSection from "@/components/ui/WorldAdaptiveSection";
import CronogramaSection from "@/components/ui/CronogramaSection";
import BitacoraSection from "@/components/ui/BitacoraSection";
import PlanesSection from "@/components/ui/PlanesSection";
import FooterSection from "@/components/ui/FooterSection";
import SmartIsland from "@/components/ui/SmartIsland";
import type { IslandState } from "@/components/ui/SmartIsland";
import LaserTrail from "@/components/ui/LaserTrail";

export default function LandingPage() {
    const [isQuienesSomosOpen, setIsQuienesSomosOpen] = useState(false);

    /* ── SENSORES DE SCROLL ── */
    // Sección 3: Showcase → isla se REVELA centrada
    const showcaseRef = useRef<HTMLDivElement>(null);
    const showcaseInView = useInView(showcaseRef, { margin: "0px 0px -95% 0px" });

    // Sección 4: Smart Concepts
    const conceptsRef = useRef<HTMLDivElement>(null);
    const conceptsInView = useInView(conceptsRef, { amount: 0.1 });

    // Sección 5: Bitácoras
    const bitacoraRef = useRef<HTMLDivElement>(null);
    const bitacoraInView = useInView(bitacoraRef, { amount: 0.1 });

    // Sección 6: Smart Calendar
    const calendarRef = useRef<HTMLDivElement>(null);
    const calendarInView = useInView(calendarRef, { amount: 0.1 });

    // Sección 7: Smart BIM Sync
    const bimRef = useRef<HTMLDivElement>(null);
    const bimInView = useInView(bimRef, { amount: 0.1 });

    /* ── MÁQUINA DE ESTADOS ──
       hidden  → Hero + ProblemChaos (secciones 1-2)
       center  → Showcase (sección 3) — isla se revela grande, centrada
       top     → Concepts + Bitácoras + Calendar + BIM (secciones 4-7)
       hidden  → Planes + Footer (sección 8+) — desaparece
    */
    const isInContentSections = conceptsInView || bitacoraInView || calendarInView || bimInView;

    let islandState: IslandState = "hidden";
    if (isInContentSections) {
        islandState = "top";
    } else if (showcaseInView) {
        islandState = "center";
    }

    return (
        <main className="bg-[#0c0604] min-h-screen text-white relative">
            {/* ── RASTRO LÁSER GLOBAL ── */}
                <LaserTrail />

                {/* ── NAVBAR GLOBAL (fixed, persiste en todo el scroll) ── */}
                <GlobalNavbar onOpenQuienesSomos={() => setIsQuienesSomosOpen(true)} />

                {/* ── ISLA FLOTANTE ÚNICA ── */}
                <SmartIsland
                    islandState={islandState}
                    hideIsland={false}
                    isBimSectionActive={bimInView}
                    forceExpand={showcaseInView}
                    triggerPop={null}
                />

                {/* Sección 1: Hero */}
                <HeroHybrid />

                {/* Sección 2: El Problema */}
                <ProblemChaos />

                {/* Sección 3: Showcase — isla se revela aquí (imán de scroll) */}
                <div ref={showcaseRef}>
                    <SmartIslandShowcase />
                </div>

                {/* Sección 4: Smart Concepts */}
                <div ref={conceptsRef} id="smart-concepts">
                    <SmartConceptsSection />
                </div>

                {/* Sección 5: Bitácoras */}
                <div ref={bitacoraRef} id="bitacora">
                    <BitacoraSection />
                </div>

                {/* Sección 6: Smart Calendar */}
                <div ref={calendarRef} id="smart-calendar">
                    <CronogramaSection />
                </div>

                {/* Sección 7: Smart BIM Sync — isla desaparece después */}
                <div ref={bimRef} id="bim-sync">
                    <SmartBimSyncSection />
                </div>

                {/* Sección 7.5: Alcance Global — globe spinning con 8 países activos */}
                <WorldAdaptiveSection />

                {/* Sección 8+: Sin isla */}
                <div id="soluciones">
                    <PlanesSection />
                </div>

                <div id="contacto">
                    <FooterSection />
                </div>

                {/* Modal Quiénes Somos */}
                {isQuienesSomosOpen && (
                    <div 
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
                        onClick={() => setIsQuienesSomosOpen(false)}
                        data-lenis-prevent
                    >
                        <div 
                            className="relative w-full max-w-3xl rounded-2xl border border-amber-900/50 bg-zinc-950 p-8 md:p-12 shadow-[0_0_50px_rgba(120,53,15,0.2)]" 
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setIsQuienesSomosOpen(false)} 
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-amber-700/50 hover:text-amber-500 transition-colors"
                            >
                                ×
                            </button>
                            <h2 className="mb-8 text-3xl font-display font-bold uppercase text-white/90 tracking-tight">Quiénes Somos</h2>
                            
                            <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                                <p>
                                    Somos <strong className="text-amber-500">BitacorIA</strong>, creadores del primer ERP Invisible impulsado por Inteligencia Artificial para la industria de la construcción en América Latina.
                                </p>
                                <p>
                                    Nuestra misión es erradicar el sobrecosto producido por la desconexión entre la oficina central y el residente en campo. Reemplazamos la captura manual, las bitácoras de papel y los reportes burocráticos por un ecosistema que aprende de tus catálogos constructivos en tiempo récord.
                                </p>
                                <p>
                                    Fundada por arquitectos, ingenieros civiles y desarrolladores, BitacorIA fue construida desde la trinchera para proteger el prestigio de tu constructora mediante auditoría automatizada y firmas electrónicas regidas por la NOM-151.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
    );
}
