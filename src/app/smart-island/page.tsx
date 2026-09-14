import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import Contenido from "./Contenido";

export const metadata: Metadata = {
    title: "Smart Island — BitacorIA",
    description:
        "La navegación de BitacorIA: los módulos que necesitas, siempre al alcance, sin menús complejos ni curva de aprendizaje.",
    alternates: { canonical: "/smart-island" },
};

export default function SmartIslandPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">Smart Island: el asistente flotante de BitacorIA</h1>
            <Contenido />
        </MarketingShell>
    );
}
