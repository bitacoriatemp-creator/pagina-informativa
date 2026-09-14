import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import BitacoraSection from "@/components/ui/BitacoraSection";

export const metadata: Metadata = {
    title: "Smart Log — BitacorIA",
    description:
        "Tomas una foto en obra, dictas qué pasó y la IA arma la bitácora del día. La responsiva sigue siendo tuya.",
    alternates: { canonical: "/smart-log" },
};

export default function SmartLogPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">Smart Log: la bitácora de obra inteligente</h1>
            <BitacoraSection />
        </MarketingShell>
    );
}
