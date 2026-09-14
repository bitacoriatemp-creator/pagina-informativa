import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import SmartConceptsSection from "@/components/ui/SmartConceptsSection";

export const metadata: Metadata = {
    title: "Smart Concepts — BitacorIA",
    description:
        "Catálogos de conceptos y precios unitarios armados por IA en minutos, listos para revisar y firmar.",
    alternates: { canonical: "/smart-concepts" },
};

export default function SmartConceptsPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">Smart Concepts: catálogos y precios unitarios armados con IA</h1>
            <SmartConceptsSection />
        </MarketingShell>
    );
}
