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
            <BitacoraSection />
        </MarketingShell>
    );
}
