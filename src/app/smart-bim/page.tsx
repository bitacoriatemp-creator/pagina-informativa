import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import SmartBimSyncSection from "@/components/ui/SmartBimSyncSection";

export const metadata: Metadata = {
    title: "Smart BIM Sync — BitacorIA",
    description:
        "Conecta el avance físico de la obra con el presupuesto y el cronograma. La 'I' del BIM: datos reales, no modelos 3D.",
    alternates: { canonical: "/smart-bim" },
};

export default function SmartBimPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">BIM Sync: catálogo y cronograma siempre en sincronía</h1>
            <SmartBimSyncSection />
        </MarketingShell>
    );
}
