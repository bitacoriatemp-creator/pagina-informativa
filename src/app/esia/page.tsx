import type { Viewport } from "next";
import EsiaClient from "./EsiaClient";

/**
 * /esia — Registro a la Conferencia ESIA Zacatenco
 * Proxy desde bitacoria.com/esia → bitacoria.com/plataforma/esia
 * (rewrite definido en landing-bitacoria/vercel.json)
 *
 * page.tsx es Server Component (para metadata + viewport).
 * El funnel real (EsiaRegistro) se monta client-only vía EsiaClient
 * con dynamic(..., { ssr: false }) → cero hydration mismatch.
 */

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,           // dejar zoom al usuario (accesibilidad)
    userScalable: true,        // crítico WCAG — nunca disable
    viewportFit: "cover",      // habilita env(safe-area-inset-*) en iOS notch
    themeColor: "#f6efe1",
};

export const metadata = {
    title: "Conferencia BitacorIA · ESIA Zacatenco · 02 Jun 2026",
    description:
        "Registro al evento BitacorIA en la ESIA Zacatenco. Asistencia gratuita con asiento asignado. 2 sesiones disponibles.",
    robots: { index: true, follow: true },
    openGraph: {
        title: "Conferencia BitacorIA · ESIA Zacatenco",
        description: "02 Jun 2026. Asistencia gratuita, asiento asignado al registro.",
        type: "website",
    },
};

export default function EsiaPage() {
    return <EsiaClient />;
}
