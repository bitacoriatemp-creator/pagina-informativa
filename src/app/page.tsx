"use client";

import { useState, useRef, useEffect } from "react";
import { useInView, MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import HeroHybrid from "@/components/ui/HeroHybrid";
import GlobalNavbar from "@/components/ui/GlobalNavbar";

/* ProblemChaos usa Matter.js (~26kB gz) y está 3 pantallas abajo del fold:
   carga diferida con placeholder del mismo alto para no causar CLS. */
const ProblemChaos = dynamic(() => import("@/components/ui/ProblemChaos"), {
    ssr: false,
    loading: () => (
        <div style={{ height: "200vh", minHeight: 1600, backgroundColor: "#0c0604" }} />
    ),
});
import SmartIslandShowcase from "@/components/ui/SmartIslandShowcase";
import SmartBimSyncSection from "@/components/ui/SmartBimSyncSection";
import WorldAdaptiveSection from "@/components/ui/WorldAdaptiveSection";
import PlanesSection from "@/components/ui/PlanesSection";
import FooterSection from "@/components/ui/FooterSection";
import SmartIsland from "@/components/ui/SmartIsland";
import type { IslandState } from "@/components/ui/SmartIsland";
import { RegistroModalProvider } from "@/components/ui/RegistroModal";

export default function LandingPage() {
    const [isQuienesSomosOpen, setIsQuienesSomosOpen] = useState(false);

    /* ── SENSORES DE SCROLL ── */
    // Sección 3: Showcase → isla se REVELA centrada
    const showcaseRef = useRef<HTMLDivElement>(null);
    const showcaseInView = useInView(showcaseRef, { margin: "0px 0px -95% 0px" });

    // Sección 4: Smart BIM Sync (Smart Concepts / Bitácora / Smart Calendar
    // ahora viven dentro del Hero como HeroDemoShowcase — ya no son secciones aparte).
    const bimRef = useRef<HTMLDivElement>(null);
    const bimInView = useInView(bimRef, { amount: 0.1 });

    /* ── MÁQUINA DE ESTADOS ──
       hidden  → Hero + ProblemChaos (secciones 1-2)
       center  → Showcase (sección 3) — isla se revela grande, centrada
       top     → Smart BIM Sync (sección 4)
       hidden  → Planes + Footer (sección 5+) — desaparece
    */
    const isInContentSections = bimInView;

    let islandState: IslandState = "hidden";
    if (isInContentSections) {
        islandState = "top";
    } else if (showcaseInView) {
        islandState = "center";
    }

    return (
        <MotionConfig reducedMotion="user">
        <RegistroModalProvider>
        <main className="bg-[#0c0604] min-h-screen text-white relative">
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

                {/* Sección 2: Planes de Pago (movida arriba — primer scroll).
                    El id="soluciones" lo lleva la <section> interna del componente. */}
                <div>
                    <PlanesSection />
                </div>

                {/* Sección 3: El Problema */}
                <ProblemChaos />

                {/* Sección 3: Showcase — isla se revela aquí (imán de scroll) */}
                <div ref={showcaseRef}>
                    <SmartIslandShowcase />
                </div>

                {/* Sección 4: Smart BIM Sync — isla desaparece después */}
                <div ref={bimRef}>
                    <SmartBimSyncSection />
                </div>

                {/* Sección 5: Alcance Global — globe spinning con 8 países activos */}
                <WorldAdaptiveSection />

                <div>
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
                            className="cream-glass relative w-full max-w-3xl max-h-[85vh] overflow-y-auto overscroll-contain rounded-2xl p-8 md:p-12"
                            onClick={e => e.stopPropagation()}
                            data-lenis-prevent
                        >
                            <button 
                                onClick={() => setIsQuienesSomosOpen(false)} 
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5f0e8]/[0.2] text-[#e8ddc9]/[0.7] hover:border-[#e8ddc9]/[0.5] hover:text-[#f5f0e8] transition-colors"
                            >
                                ×
                            </button>
                            <div className="mb-1 font-ui text-[11px] uppercase tracking-[0.35em] text-[#c39767]/70">El origen de BitacorIA</div>
                            <h2 className="mb-8 text-3xl font-display font-bold uppercase text-white/90 tracking-tight">Quiénes Somos</h2>

                            <div className="space-y-8 text-zinc-400 text-sm leading-relaxed">
                                <div className="space-y-3">
                                    <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#c39767]">Innovación con sello de campo</h3>
                                    <p>En BitacorIA no somos una empresa de software común que intenta adivinar cómo funciona una obra desde una oficina. Nacimos directamente en el polvo del terreno, entre planos impresos, levantamientos topográficos y la presión diaria de cumplir con los tiempos de entrega. Conocemos de primera mano los verdaderos dolores de cabeza de la construcción: catálogos de conceptos infinitos, programaciones de obra que se desfasan por falta de comunicación y el eterno reto de mantener el control financiero de un proyecto.</p>
                                    <p>Nuestra historia empieza con una visión clara: fusionar la experiencia de la ingeniería civil tradicional con el poder de la Inteligencia Artificial. Mientras la tecnología avanzaba a pasos agigantados en otros sectores, la gestión de proyectos de construcción seguía atrapada en procesos manuales, hojas de cálculo propensas a errores y burocracia técnica. Decidimos cambiar las reglas del juego.</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#c39767]">Nuestra misión</h3>
                                    <p>Romper la brecha digital en la industria de la construcción, dotando a ingenieros, arquitectos y contratistas de herramientas inteligentes que automaticen las tareas administrativas complejas, permitiéndoles enfocarse en lo que mejor saben hacer: construir el futuro.</p>
                                    <p>Queremos que dejes de perder días enteros arrastrando celdas en Excel o cuadrando presupuestos de precios unitarios. BitacorIA está diseñada para ser el copiloto tecnológico que procesa, analiza y estructura tu información técnica en cuestión de minutos, con precisión y optimización de recursos.</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#c39767]">Los pilares que nos definen</h3>
                                    <p>Para transformar una industria tan competitiva, nos basamos en tres principios fundamentales:</p>
                                    <ul className="space-y-4">
                                        <li>
                                            <strong className="text-white">Rigor técnico y experiencia real.</strong> Todo lo que programamos está validado bajo las metodologías de la ingeniería civil contemporánea y los estándares de la industria (BIM, normativas de costos y planeación logística).
                                        </li>
                                        <li>
                                            <strong className="text-white">Inteligencia Artificial con propósito.</strong> No usamos la IA como palabra de moda. Desarrollamos sistemas de procesamiento de lenguaje natural y recuperación de información (RAG) diseñados específicamente para entender el lenguaje técnico de la construcción.
                                        </li>
                                        <li>
                                            <strong className="text-white">Simplicidad para el constructor.</strong> El tiempo en la construcción es oro. Creamos una plataforma intuitiva, ágil y de rápida adopción, pensada para que cualquier profesional pueda usarla desde el día uno, en la oficina o a pie de obra.
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#c39767]">Hacia dónde vamos</h3>
                                    <p>No nos detenemos en la automatización de catálogos y calendarios. Estamos construyendo el ecosistema donde la gestión del conocimiento de tus obras pasadas sirva para predecir, optimizar y asegurar el éxito de tus proyectos futuros. Creamos una comunidad de constructores innovadores —los Early Builders de una nueva era tecnológica— que entienden que la eficiencia digital ya no es una opción, sino una ventaja competitiva indispensable.</p>
                                </div>

                                <p className="border-t border-white/10 pt-6 text-base text-white/80">
                                    Somos ingenieros potenciando a ingenieros. Bienvenido a la evolución de la gestión de proyectos. <strong className="text-[#c39767]">Bienvenido a BitacorIA.</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </RegistroModalProvider>
        </MotionConfig>
    );
}
