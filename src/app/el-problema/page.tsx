import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import Contenido from "./Contenido";

export const metadata: Metadata = {
    title: "El problema — BitacorIA",
    description:
        "En una obra se genera información todo el día, y casi nunca queda documentada en el momento. Se anota de memoria, tarde, en la noche.",
    alternates: { canonical: "/el-problema" },
};

export default function ElProblemaPage() {
    return (
        <MarketingShell>
            {/* h1 sr-only: la página vivía sin <h1> propio (huérfana para rastreo
               y lectores de pantalla). La sección trae su cabecera visual, así
               que este es solo para el árbol del documento. Mismo patrón que
               planes/page.tsx:52. */}
            <h1 className="sr-only">El problema que resuelve BitacorIA</h1>
            <Contenido />
        </MarketingShell>
    );
}
