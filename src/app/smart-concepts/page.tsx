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
            <SmartConceptsSection />
        </MarketingShell>
    );
}
