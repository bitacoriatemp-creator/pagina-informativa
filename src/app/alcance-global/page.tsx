import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import WorldAdaptiveSection from "@/components/ui/WorldAdaptiveSection";

export const metadata: Metadata = {
    title: "Alcance global — BitacorIA",
    description:
        "Pensada para la obra latinoamericana: se adapta a las normativas y a la forma de construir de cada país.",
    alternates: { canonical: "/alcance-global" },
};

export default function AlcanceGlobalPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">BitacorIA se adapta a la normativa de cada región</h1>
            <WorldAdaptiveSection />
        </MarketingShell>
    );
}
