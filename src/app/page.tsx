"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import HeroHybrid from "@/components/ui/HeroHybrid";
import ProblemChaos from "@/components/ui/ProblemChaos";
import SmartIslandShowcase from "@/components/ui/SmartIslandShowcase";
import SmartIsland, { type IslandState } from "@/components/ui/SmartIsland";
import SmartConceptsSection from "@/components/ui/SmartConceptsSection";
import BitacoraSection from "@/components/ui/BitacoraSection";
import CronogramaSection from "@/components/ui/CronogramaSection";
import SmartBimSyncSection from "@/components/ui/SmartBimSyncSection";
import PlanesSection from "@/components/ui/PlanesSection";
import FooterSection from "@/components/ui/FooterSection";
import QuienesSomosModal from "@/components/ui/QuienesSomosModal";

/* ════════════════════════════════════════════════════════════
   ONE-PAGE APPLICATION ORCHESTRATOR
   ────────────────────────────────────────────────────────────
   Implementation of SCROLL-DRIVEN STATE MACHINE for Island.
   
   State Logic:
   0. Hero/Chaos -> "hidden"
   1. Showcase InView -> "center"
   2. Past Showcase -> "top"
   ════════════════════════════════════════════════════════════ */

export default function Home() {
  const [globalPopTrigger, setGlobalPopTrigger] = useState<string | null>(null);
  const [islandState, setIslandState] = useState<IslandState>("hidden");
  const [isBimSectionActive, setIsBimSectionActive] = useState(false);
  const [isQuienesSomosOpen, setIsQuienesSomosOpen] = useState(false);

  // ── REFS FOR STATE TRIGGERS ──
  const heroRef = useRef<HTMLDivElement>(null);
  const chaosRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bimRef = useRef<HTMLDivElement>(null);
  const planesRef = useRef<HTMLDivElement>(null);
  // tracks whether island was hidden on behalf of Plans section
  const wasHiddenForPlanes = useRef(false);

  // ── HERO SCROLL LOCK ──
  const lockRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lockRef,
    offset: ["start start", "end start"],
  });
  const overlayOpacity = useTransform(scrollYProgress, [0.3, 0.85], [0, 1]);

  // ── SCROLL OBSERVER FOR STATE MACHINE ──
  // Using IntersectionObserver is cleaner than raw scrollY calculation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine state based on which section is primary in view
            if (entry.target.id === "showcase-section") {
              setIslandState("center");
            } else if (entry.target.id === "content-start") {
              setIslandState("top");
            } else if (entry.target.id === "hero-or-chaos" || entry.target.id === "problem-chaos") {
              setIslandState("hidden");
            }
          }
        });
      },
      {
        root: null,
        // rootMargin shrinks detection zone: only fires when the target
        // crosses the center 30% of the viewport, not the edges.
        // This prevents the island from appearing while still in ProblemChaos.
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0.01, 0.1],
      }
    );

    if (showcaseRef.current) observer.observe(showcaseRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    if (heroRef.current) observer.observe(heroRef.current);
    if (chaosRef.current) observer.observe(chaosRef.current);

    // BIM section LED trigger
    const bimObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => setIsBimSectionActive(e.isIntersecting)),
      { root: null, threshold: 0.3 }
    );
    if (bimRef.current) bimObserver.observe(bimRef.current);

    // Plans section: hide dock on enter, restore on exit (scroll back up)
    const planesObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          wasHiddenForPlanes.current = true;
          setIslandState("hidden");
        } else if (wasHiddenForPlanes.current) {
          // Only restore if WE hid it (not some other observer)
          wasHiddenForPlanes.current = false;
          setIslandState("top");
        }
      }),
      { root: null, threshold: 0.04 }
    );
    if (planesRef.current) planesObserver.observe(planesRef.current);

    return () => { observer.disconnect(); bimObserver.disconnect(); planesObserver.disconnect(); };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden selection:bg-[#c39767] selection:text-black font-sans"
      style={{ backgroundColor: "#0c0604" }}
    >
      {/* ── GLOBAL PERSISTENT DOCK ── */}
      <SmartIsland
        islandState={islandState}
        triggerPop={globalPopTrigger}
        isBimSectionActive={isBimSectionActive}
      />

      {/* ── GLOBAL MODAL ── */}
      <QuienesSomosModal
        isOpen={isQuienesSomosOpen}
        onClose={() => setIsQuienesSomosOpen(false)}
      />

      {/* ── 1. HERO LOCK + CHAOS (Hidden Zone) ── */}
      <div id="hero-or-chaos" ref={heroRef} className="relative z-0">
        <div ref={lockRef} className="relative z-0" style={{ height: "250vh" }}>
          <div className="sticky top-0 h-screen overflow-hidden">
            <HeroHybrid onOpenQuienesSomos={() => setIsQuienesSomosOpen(true)} />
            <motion.div
              className="pointer-events-none absolute inset-0 z-40"
              style={{ opacity: overlayOpacity, backgroundColor: "#0c0604" }}
            />
          </div>
        </div>

        {/* ── 2. PROBLEM CHAOS ── */}
        <div id="problem-chaos" ref={chaosRef} className="relative z-10" style={{ backgroundColor: "#0c0604" }}>
          <ProblemChaos />
        </div>
      </div>

      {/* ── 3. SMART ISLAND SHOWCASE (Center Zone) ── */}
      <div
        id="showcase-section"
        ref={showcaseRef}
        className="relative z-20"
        style={{ backgroundColor: "#0c0604" }}
      >
        <SmartIslandShowcase onTriggerPop={setGlobalPopTrigger} />
      </div>

      {/* ── 4. FEATURE SECTIONS (Top Zone) ── */}
      <div id="content-start" ref={contentRef} className="relative z-30">

        {/* SECTION A: SMART CONCEPTS */}
        <SmartConceptsSection />

        {/* SECTION B: BITÁCORA */}
        <BitacoraSection />

        {/* SECTION C: SMART CALENDAR */}
        <CronogramaSection />

        {/* SECTION D: BIM SYNC */}
        <div ref={bimRef}>
          <SmartBimSyncSection />
        </div>

        {/* SECTION E: PLANES */}
        <div ref={planesRef}>
          <PlanesSection />
        </div>

        {/* SECTION F: FOOTER / CONTACTO */}
        <FooterSection />
      </div>
    </main>
  );
}
