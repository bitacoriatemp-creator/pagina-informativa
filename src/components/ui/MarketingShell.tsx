"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import GlobalNavbar from "@/components/ui/GlobalNavbar";
import FooterSection from "@/components/ui/FooterSection";

/* ══════════════════════════════════════════════════════════════
   MarketingShell — barra, pie y encuesta para las páginas sueltas
   ──────────────────────────────────────────────────────────────
   La home monta estas piezas ella misma (junto con la isla y su
   máquina de estados de scroll, que solo tienen sentido allí).
   Sin este envoltorio, una página nueva nacería sin navegación y
   sin pie. El alta no vive aquí: es su propia página, /registro.
   No se sube a layout.tsx porque ese layout también cubre
   /dashboard y /admin, que no llevan navegación de marketing.
   ══════════════════════════════════════════════════════════════ */
export default function MarketingShell({ children }: { children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="user">
            <main className="relative min-h-screen bg-[#0c0604] text-white">
                <GlobalNavbar />
                {children}
                <FooterSection />
            </main>
        </MotionConfig>
    );
}
