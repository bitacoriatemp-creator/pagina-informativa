"use client";

import { MotionConfig } from "framer-motion";
import HeroHybrid from "@/components/ui/HeroHybrid";
import GlobalNavbar from "@/components/ui/GlobalNavbar";
import ResenasSection from "@/components/ui/ResenasSection";
import PlanesSection from "@/components/ui/PlanesSection";
import FooterSection from "@/components/ui/FooterSection";
import type { Resenas } from "@/lib/resenasFormato";

/* La home se queda en lo esencial: qué es y cuánto cuesta. Todo lo que venía
   después de los planes —el problema, la Smart Island, los tres módulos, BIM
   y el alcance global— vive ahora en su propia página, accesible desde el menú
   del logo. La página deja de ser un scroll interminable y cada sección puede
   compartirse por enlace y salir en Google.

   JC 2026-09-25: esto era src/app/page.tsx. Se movió aquí, como componente
   cliente, para que page.tsx pueda ser de servidor y leer las reseñas del
   backend antes de pintar (ver src/lib/resenas.ts). `resenas` llega ya
   validado o null; con null la portada es exactamente la de antes. */
export default function LandingHome({ resenas }: { resenas: Resenas | null }) {
    return (
        <MotionConfig reducedMotion="user">
            <main className="relative min-h-screen bg-[#0c0604] text-white">
                <GlobalNavbar />

                <HeroHybrid />

                {/* El id="soluciones" lo lleva la <section> interna. */}
                <PlanesSection />

                {/* JC 2026-09-25: debajo de los planes (hero → planes → reseñas).
                    Quien ya vio cuánto cuesta lee a quién ya le funcionó antes de
                    decidir. Sin datos no existe en el HTML. */}
                {resenas && <ResenasSection resenas={resenas} />}

                <FooterSection />
            </main>
        </MotionConfig>
    );
}
