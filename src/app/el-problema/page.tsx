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
            <Contenido />
        </MarketingShell>
    );
}
