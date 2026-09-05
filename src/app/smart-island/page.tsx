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
            <Contenido />
        </MarketingShell>
    );
}
