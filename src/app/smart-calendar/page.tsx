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
            <CronogramaSection />
        </MarketingShell>
    );
}
