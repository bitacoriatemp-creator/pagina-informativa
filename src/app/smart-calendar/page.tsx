import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import CronogramaSection from "@/components/ui/CronogramaSection";

export const metadata: Metadata = {
    title: "Smart Calendar — BitacorIA",
    description:
        "Cronograma que se recalcula con el avance real de la obra y avisa de las desviaciones antes de que cuesten.",
    alternates: { canonical: "/smart-calendar" },
};

export default function SmartCalendarPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">Smart Calendar: el cronograma de obra con IA</h1>
            <CronogramaSection />
        </MarketingShell>
    );
}
