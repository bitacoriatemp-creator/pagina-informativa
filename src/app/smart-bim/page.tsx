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
            <SmartBimSyncSection />
        </MarketingShell>
    );
}
