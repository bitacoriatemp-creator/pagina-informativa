"use client";

import { MotionConfig } from "framer-motion";
import HeroHybrid from "@/components/ui/HeroHybrid";
import GlobalNavbar from "@/components/ui/GlobalNavbar";
import PlanesSection from "@/components/ui/PlanesSection";
import FooterSection from "@/components/ui/FooterSection";

/* La home se queda en lo esencial: qué es y cuánto cuesta. Todo lo que venía
   después de los planes —el problema, la Smart Island, los tres módulos, BIM
   y el alcance global— vive ahora en su propia página, accesible desde el menú
   del logo. La página deja de ser un scroll interminable y cada sección puede
   compartirse por enlace y salir en Google. */
export default function LandingPage() {
    return (
        <MotionConfig reducedMotion="user">
            <main className="relative min-h-screen bg-[#0c0604] text-white">
                <GlobalNavbar />

                <HeroHybrid />

                {/* El id="soluciones" lo lleva la <section> interna. */}
                <PlanesSection />

                <FooterSection />
            </main>
        </MotionConfig>
    );
}
