import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import WorldAdaptiveSection from "@/components/ui/WorldAdaptiveSection";

export const metadata: Metadata = {
    title: "Hecho para México — BitacorIA",
    description:
        "Pensada para la obra en México: trabaja con las NOM federales y el reglamento de la CDMX con sus Normas Técnicas. En otros estados, tú verificas lo local.",
    alternates: { canonical: "/alcance-global" },
};

export default function AlcanceGlobalPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">BitacorIA trabaja con la normativa de México</h1>
            <WorldAdaptiveSection />
        </MarketingShell>
    );
}
