/* ══════════════════════════════════════════════════════════════
   resenas — lectura de las reseñas para la portada (JC 2026-09-25)
   ──────────────────────────────────────────────────────────────
   SOLO SERVIDOR. src/app/page.tsx llama a obtenerResenas() al generar
   la página y le pasa el resultado a LandingHome; el navegador nunca
   habla con la API.

     GET {RESENAS_API_URL}/api/v1/public/reviews?limit=30
     caché de 5 minutos (revalidate), 8 s de espera como máximo

   La regla es "mejor nada que algo dudoso": sin variable, sin
   endpoint, con red caída, con una respuesta que no cumple el
   contrato o sin ninguna publicada (MINIMO_RESENAS), devuelve null y
   la sección no existe en el HTML. La portada se ve como hoy.

   JC 2026-10-03: si el backend falla (tiempo agotado, caída, respuesta
   que no es 2xx) al REGENERAR la página, el error se lanza a propósito:
   Next conserva la última portada buena, con sus reseñas, y lo reintenta
   en la siguiente visita. Devolver null ahí borraba la sección 5 minutos
   cada vez que el servidor pequeño tardaba. En `next build` sí se
   devuelve null, para que un backend lento no tumbe el despliegue.

   JC 2026-10-02: las reseñas se publican solas al enviarse (el super
   admin puede ocultarlas después) y la caja aparece desde la primera.
   La caché bajó de una hora a 5 minutos para que una reseña nueva
   salga en la portada en unos minutos, no en una hora.

   RESENAS_API_URL es variable DE SERVIDOR (sin NEXT_PUBLIC_): no se
   inlinea en el cliente. RESENAS_DEMO=true pinta los datos de ejemplo
   de resenasDemo.ts, solo fuera de producción.

   Contrato: _kit_socio/docs/PARA_LUIS_RESENAS_CONTRATO_2026-09-25.md.
   ══════════════════════════════════════════════════════════════ */

import { RESENAS_DEMO } from "./resenasDemo";
import {
    MINIMO_RESENAS,
    esFotoDeGoogle,
    nombreCorto,
    promedio,
    type Resena,
    type Resenas,
} from "./resenasFormato";

export * from "./resenasFormato";

/** Cuántas se piden: la cinta no necesita más y el contrato topa en 50. */
const LIMITE = 30;
/* JC 2026-10-03: 8 s (antes 4). El backend corre en una VM pequeña y la
   primera petición tras un rato sin uso puede tardar. */
const ESPERA_MS = 8000;

/** ¿Se está construyendo el sitio (`next build`)? Ahí un backend caído no puede tumbar el despliegue. */
function enBuild(): boolean {
    return process.env.NEXT_PHASE === "phase-production-build";
}
/* JC 2026-10-02: 5 min (antes 3600). Una reseña recién publicada, o una
   que el super admin ocultó, se refleja en la portada en ese plazo. */
const REVALIDAR_SEGUNDOS = 300;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function textoONulo(valor: unknown, maximo: number): string | null {
    if (typeof valor !== "string") return null;
    const limpio = valor.trim();
    return limpio && limpio.length <= maximo ? limpio : null;
}

/**
 * Una reseña del JSON, o null si no cumple lo que la tarjeta necesita:
 * estrellas entero 1–5, texto no vacío y nombre sin "@" (un correo nunca
 * se pinta). Lo demás se corrige en vez de descartar: foto de otro host →
 * iniciales; fecha ilegible → sin fecha; ciudad o respuesta vacías → null.
 */
function validarResena(valor: unknown, indice: number): Resena | null {
    if (!esObjeto(valor)) return null;

    const estrellas = valor.estrellas;
    if (typeof estrellas !== "number" || !Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return null;

    const texto = typeof valor.texto === "string" ? valor.texto.trim() : "";
    if (!texto) return null;

    if (typeof valor.nombre !== "string" || valor.nombre.indexOf("@") >= 0) return null;
    const nombre = nombreCorto(valor.nombre);

    const publicada = typeof valor.publicada_at === "string" && !Number.isNaN(new Date(valor.publicada_at).getTime())
        ? valor.publicada_at
        : "";

    return {
        id: typeof valor.id === "string" && valor.id ? valor.id : `resena-${indice}`,
        nombre,
        foto_url: esFotoDeGoogle(valor.foto_url) ? valor.foto_url : null,
        rol: typeof valor.rol === "string" ? valor.rol : "",
        tipo_obra: typeof valor.tipo_obra === "string" ? valor.tipo_obra : "",
        ciudad: textoONulo(valor.ciudad, 60),
        modulo: typeof valor.modulo === "string" && valor.modulo ? valor.modulo : null,
        estrellas,
        texto,
        respuesta_equipo: textoONulo(valor.respuesta_equipo, 300),
        publicada_at: publicada,
    };
}

/**
 * La respuesta completa del endpoint, ya limpia, o null si no sirve para
 * pintar la sección. Exportada para probarla sin red.
 */
export function validarResenas(datos: unknown): Resenas | null {
    if (!esObjeto(datos) || !Array.isArray(datos.resenas)) return null;

    const resenas = datos.resenas
        .map((r, i) => validarResena(r, i))
        .filter((r): r is Resena => r !== null);
    if (resenas.length === 0) return null;

    const resumen = esObjeto(datos.resumen) ? datos.resumen : {};
    const total = typeof resumen.total === "number" && Number.isInteger(resumen.total) && resumen.total >= 0
        ? resumen.total
        : resenas.length;
    if (total < MINIMO_RESENAS) return null;

    /* El promedio del backend es sobre todas las publicadas, que es el bueno;
       si no viene o no tiene sentido, se calcula con las que llegaron. */
    const promedioBackend = resumen.promedio;
    const promedioValido = typeof promedioBackend === "number" && promedioBackend >= 1 && promedioBackend <= 5
        ? Math.round(promedioBackend * 10) / 10
        : promedio(resenas.map((r) => r.estrellas));

    return { resumen: { promedio: promedioValido, total }, resenas };
}

/** Las reseñas para la portada, o null si la sección no debe existir. */
export async function obtenerResenas(): Promise<Resenas | null> {
    if (process.env.RESENAS_DEMO === "true" && process.env.NODE_ENV !== "production") {
        return RESENAS_DEMO;
    }

    const base = (process.env.RESENAS_API_URL ?? "").trim().replace(/\/+$/, "");
    if (!base) return null;

    try {
        const respuesta = await fetch(`${base}/api/v1/public/reviews?limit=${LIMITE}`, {
            headers: { accept: "application/json" },
            next: { revalidate: REVALIDAR_SEGUNDOS },
            signal: AbortSignal.timeout(ESPERA_MS),
        });
        if (!respuesta.ok) throw new Error(`reseñas: el backend respondió ${respuesta.status}`);
        return validarResenas(await respuesta.json());
    } catch (error) {
        /* Red caída, tiempo agotado, respuesta no 2xx o JSON roto. En el build,
           la portada sale sin la sección. Al regenerar, se lanza: Next sigue
           sirviendo la última portada buena y reintenta en la siguiente visita. */
        if (enBuild()) return null;
        throw error;
    }
}
