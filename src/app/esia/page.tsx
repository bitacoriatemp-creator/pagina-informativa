import EsiaRegistro from "./EsiaRegistro";

/**
 * /esia — Registro a la Conferencia ESIA Zacatenco
 * Proxy desde bitacoria.com/esia → bitacoria.com/plataforma/esia
 * (rewrite definido en landing-bitacoria/vercel.json)
 */

export const dynamic = "force-dynamic"; // no cache, queremos inventario en vivo

export const metadata = {
    title: "Conferencia BitacorIA · ESIA Zacatenco · 02 Jun 2026",
    description:
        "Registro al evento BitacorIA en la ESIA Zacatenco. Asistencia gratuita con asiento asignado. 2 sesiones disponibles.",
    robots: { index: true, follow: true },
};

export default function EsiaPage() {
    return <EsiaRegistro />;
}
