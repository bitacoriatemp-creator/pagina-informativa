import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import WorldAdaptiveSection from "@/components/ui/WorldAdaptiveSection";

export const metadata: Metadata = {
    title: "Alcance global — BitacorIA",
    description:
        "Pensada para la obra latinoamericana: se adapta a las normativas y a la forma de construir de cada país.",
    alternates: { canonical: "/alcance-global" },
};

export default function AlcanceGlobalPage() {
    return (
        <MarketingShell>
            <WorldAdaptiveSection />
        </MarketingShell>
    );
}
