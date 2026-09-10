import type { Metadata } from "next";
import MarketingShell from "@/components/ui/MarketingShell";
import PlanesSection from "@/components/ui/PlanesSection";

/* /planes — los precios con enlace propio.
   La misma sección que vive en la home (/#soluciones), pero como página:
   se puede compartir, sale en Google y /pricing redirige aquí. Los CTA
   llevan a la app con el plan y el ciclo elegidos (ver PlanesSection). */
export const metadata: Metadata = {
    title: "Planes y precios — BitacorIA",
    description:
        "Draft gratis, The Resident, The Site Manager y Executive Plan. Precios en MXN, mensual o anual, y licencia única por obra. Elige tu plan y crea tu cuenta.",
    alternates: { canonical: "/planes" },
    openGraph: {
        title: "Planes y precios — BitacorIA",
        description:
            "Desde estudiantes hasta constructoras. El nivel exacto para tu escala, en MXN, mensual o anual.",
        url: "https://bitacoria.com/planes",
        type: "website",
        /* 2026-09-09 (revisión de código, hallazgo MEDIUM planes/page.tsx:14):
           al declarar `openGraph` la página pisa por completo el default del
           layout raíz (siteName/locale/images no se heredan campo a campo),
           así que sin esto el enlace se comparte sin tarjeta de vista previa.
           Se reutiliza la misma imagen que ya usa la portada. */
        siteName: "BitacorIA",
        locale: "es_MX",
        images: [
            {
                url: "/images/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "BitacorIA — Planes y precios",
            },
        ],
    },
};

export default function PlanesPage() {
    return (
        <MarketingShell>
            {/* En la home la sección va tras el hero y con su py-20 le basta; aquí es
                lo primero de la página y la barra fija le pisaría la cabecera. Las
                demás páginas sueltas arrancan en pt-24/pt-32: mismo aire. */}
            <div className="pt-12 md:pt-16">
                {/* 2026-09-09 (revisión de código, hallazgo MEDIUM planes/page.tsx:30):
                   la página no tenía <h1> propio (quedaba huérfana para rastreo).
                   PlanesSection ya trae su propio <h2> visual ("El plan para cada
                   obra"), así que este va sr-only: le da el h1 que le faltaba sin
                   duplicar la jerarquía visual. No se tocó la navegación (mejor
                   fix verificado: el enlace "/#soluciones" del navbar es intencional
                   y no es archivo propio de este cambio; ver open_issues). */}
                <h1 className="sr-only">Planes y precios de BitacorIA</h1>
                <PlanesSection />
            </div>
        </MarketingShell>
    );
}
