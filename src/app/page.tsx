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
  // Bug fix 1: footer visibility is decoupled from the state machine
  // to avoid race conditions with planesObserver.
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  // Bug fix 2: counter that increments every time showcase enters view.
  // SmartIsland watches it to reset activeTabId, independently of rootMargin timing.
  const [showcaseResetCount, setShowcaseResetCount] = useState(0);

  // ── REFS FOR STATE TRIGGERS ──
  const heroRef = useRef<HTMLDivElement>(null);
  const chaosRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bimRef = useRef<HTMLDivElement>(null);
  const planesRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  // tracks whether island was hidden on behalf of Plans section
  const wasHiddenForPlanes = useRef(false);
  // tracks whether island was hidden on behalf of Footer section
  const wasHiddenForFooter = useRef(false);

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
              // Increment counter every time showcase enters view.
              // SmartIsland will reset activeTabId on each increment.
              setShowcaseResetCount((c) => c + 1);
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

    // Footer/Contacto section: independent boolean, NOT setIslandState.
    // rootMargin "0px 0px 200px 0px" extends detection 200px below viewport:
    // prevents the iOS overscroll bounce from firing isIntersecting=false
    // when the footer momentarily leaves the viewport during rubber-band.
    const footerObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setIsFooterVisible(true);
        // Only hide if scroll is clearly NOT at the bottom (prevents bounce flicker)
        else {
          const notAtBottom =
            window.scrollY + window.innerHeight <
            document.documentElement.scrollHeight - 80;
          if (notAtBottom) setIsFooterVisible(false);
        }
      }),
      { root: null, threshold: 0.04, rootMargin: "0px 0px 200px 0px" }
    );
    if (footerRef.current) footerObserver.observe(footerRef.current);

    // Scroll fallback: incorruptible bottom-of-page detection.
    // Fires when the user is within 80px of the absolute bottom,
    // ensuring the island stays hidden even through overscroll bounce.
    const handleScroll = () => {
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 80;
      if (atBottom) setIsFooterVisible(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      bimObserver.disconnect();
      planesObserver.disconnect();
      footerObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-clip selection:bg-[#c39767] selection:text-black font-sans snap-y snap-proximity md:snap-none"
      style={{ backgroundColor: "#0c0604" }}
    >
      {/* ── GLOBAL PERSISTENT DOCK ── */}
      <SmartIsland
        islandState={islandState}
        triggerPop={globalPopTrigger}
        isBimSectionActive={isBimSectionActive}
        forceExpand={islandState === "center"}
        hideIsland={isFooterVisible}
        showcaseResetCount={showcaseResetCount}
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
        className="relative z-20 snap-center"
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
        <div ref={footerRef}>
          <FooterSection />
        </div>
      </div>
    </main>
  );
}
