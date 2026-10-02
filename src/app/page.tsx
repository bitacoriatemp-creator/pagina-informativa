import LandingHome from "@/components/ui/LandingHome";
import { obtenerResenas } from "@/lib/resenas";

/* JC 2026-09-25: la portada pasa a componente de servidor para leer las
   reseñas reales del backend antes de pintar (src/lib/resenas.ts: caché de
   5 minutos, 4 s de espera, null si falta RESENAS_API_URL, si la API no
   responde o si no hay ninguna publicada; JC 2026-10-02: antes una hora y
   un mínimo de 5, ahora la caja aparece desde la primera reseña, que se
   publica sola al enviarse). Lo que antes estaba aquí —la
   composición de barra, hero, planes y pie con MotionConfig— vive tal cual
   en LandingHome, que sigue siendo cliente. Sin variable no hay fetch y la
   página se genera estática como siempre. */
export default async function LandingPage() {
    const resenas = await obtenerResenas();
    return <LandingHome resenas={resenas} />;
}
