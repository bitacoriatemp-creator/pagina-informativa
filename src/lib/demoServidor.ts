/* ══════════════════════════════════════════════════════════════
   demoServidor — mandar la solicitud de demo al servidor de BitacorIA
   ──────────────────────────────────────────────────────────────
   2026-11-13 (Luis, tanda 4 del plan registro_filtro). El navegador
   manda la hoja a {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/demo-requests
   con la verificación de Cloudflare (acción "demo").

   Las dos variables son públicas (viajan al navegador). Si falta una, o si
   el recuadro de verificación no carga, la página sigue como en la tanda 0:
   arma el mensaje y abre WhatsApp en el mismo clic. Eso se sabe ANTES de
   enviar: tras esperar al servidor el navegador ya no deja abrir ventanas.

   Qué ve la persona según la respuesta (lo decide Formulario.tsx con lo
   que devuelve leerRespuesta):
   - 2xx: "Solicitud recibida".
   - 400 con campo: el aviso junto a ese campo.
   - 400 CAPTCHA_INVALIDO (verificación vencida): se pide otra y se
     reintenta UNA vez.
   - Cualquier otra cosa, sin red o más de 15 s: "No pudimos guardar tu
     solicitud. Envíanosla por WhatsApp", con el botón verde. Nunca se abre
     nada solo y nunca la letra roja.
   ══════════════════════════════════════════════════════════════ */

import {
    CAMPOS_DEMO,
    MENSAJES,
    cuerpoParaEnviar,
    mensajeWhatsApp,
    type CampoDemo,
    type CuerpoDemo,
    type CuerpoDemoConVerificacion,
} from "./demoContrato";

/** Ruta del servidor que recibe la solicitud (contrato, sección "demo"). */
export const RUTA_SOLICITUD_DEMO = "/api/v1/public/demo-requests";

/** Acción que el servidor exige en el token de la verificación. */
export const ACCION_VERIFICACION = "demo";

/** Más de esto esperando al servidor = no se guardó. */
export const TIEMPO_MAXIMO_ENVIO_MS = 15_000;

/** Lo que se espera un token de la verificación al enviar (o al reintentar). */
export const TIEMPO_MAXIMO_TOKEN_MS = 15_000;

/** Si el recuadro no está listo en este tiempo desde que se pinta, se da por
    caído y la hoja pasa al modo de WhatsApp directo. */
export const TIEMPO_RAZONABLE_VERIFICACION_MS = 12_000;

/**
 * URL completa de la ruta, o null si no hay servidor configurado.
 * Acceso ESTÁTICO a process.env (Next solo pone el valor si el nombre va
 * escrito literal) y leído en cada llamada, para que las pruebas lo cambien.
 */
export function urlSolicitudDemo(): string | null {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
    if (!/^https?:\/\/[^\s/]+/i.test(base)) return null;
    return `${base}${RUTA_SOLICITUD_DEMO}`;
}

/** Llave PÚBLICA del sitio para la verificación; vacía = sin verificación. */
export function llaveVerificacion(): string {
    return (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
}

/** Estado del recuadro de verificación, visto desde la hoja. */
export type EstadoVerificacion = "cargando" | "lista" | "interactiva" | "fallo";

/**
 * Qué hace el botón en el momento del clic. Se decide sin esperar nada:
 * - "whatsapp": falta una variable o el recuadro no cargó → modo de la tanda 0
 *   (WhatsApp dentro del mismo clic).
 * - "completar_verificacion": el recuadro pide que la persona lo marque.
 * - "servidor": se manda (si el token aún no llega, se espera un poco; si no
 *   llega, "No pudimos guardar", sin abrir nada solo).
 */
export function decidirEnvio(p: {
    url: string | null;
    llave: string;
    verificacion: EstadoVerificacion;
    hayToken: boolean;
}): "whatsapp" | "servidor" | "completar_verificacion" {
    if (!p.url || !p.llave) return "whatsapp";
    if (p.verificacion === "fallo") return "whatsapp";
    if (p.hayToken) return "servidor";
    if (p.verificacion === "interactiva") return "completar_verificacion";
    return "servidor";
}

export type ResultadoEnvio =
    | { tipo: "recibida" }
    | { tipo: "campo"; campo: CampoDemo; mensaje: string }
    | { tipo: "verificacion" }
    | { tipo: "fallo" };

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Traduce la respuesta del servidor. El error puede venir suelto
 * (`{code, campo, message}`) o dentro de `detail` (forma de FastAPI). El aviso
 * que se muestra es SIEMPRE el de la página para ese campo, nunca el texto del
 * servidor: así nunca se cuela un nombre interno.
 */
export function leerRespuesta(status: number, cuerpo: unknown, pais: string): ResultadoEnvio {
    if (status >= 200 && status < 300) return { tipo: "recibida" };
    if (status !== 400) return { tipo: "fallo" };
    const detalle = esObjeto(cuerpo) ? (esObjeto(cuerpo.detail) ? cuerpo.detail : cuerpo) : {};
    if (detalle.code === "CAPTCHA_INVALIDO") return { tipo: "verificacion" };
    const campo = detalle.campo;
    if (typeof campo === "string" && (CAMPOS_DEMO as readonly string[]).includes(campo)) {
        const c = campo as CampoDemo;
        return { tipo: "campo", campo: c, mensaje: c === "whatsapp" ? mensajeWhatsApp(pais) : MENSAJES[c] };
    }
    return { tipo: "fallo" };
}

type FetchMinimo = (url: string, init: RequestInit) => Promise<{ status: number; json: () => Promise<unknown> }>;

/**
 * Manda la solicitud y devuelve qué pasó. Nunca lanza: sin red, respuesta
 * rara o más de `tiempoMs` = "fallo".
 */
export async function enviarSolicitudDemo(
    url: string,
    cuerpo: CuerpoDemoConVerificacion,
    opciones: { fetchImpl?: FetchMinimo; tiempoMs?: number } = {},
): Promise<ResultadoEnvio> {
    const fetchImpl: FetchMinimo = opciones.fetchImpl ?? ((u, i) => fetch(u, i));
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), opciones.tiempoMs ?? TIEMPO_MAXIMO_ENVIO_MS);
    try {
        const res = await fetchImpl(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo),
            credentials: "omit",
            cache: "no-store",
            signal: control.signal,
        });
        let datos: unknown = null;
        try {
            datos = await res.json();
        } catch {
            datos = null;
        }
        return leerRespuesta(res.status, datos, cuerpo.pais);
    } catch {
        return { tipo: "fallo" };
    } finally {
        clearTimeout(reloj);
    }
}

/**
 * El envío completo, con la regla de la verificación: cada token sirve una vez;
 * si el servidor dice que venció, se pide otro y se reintenta UNA sola vez. Sin
 * token a tiempo, o con la verificación rechazada dos veces, "fallo". Devuelve
 * lo que la pantalla tiene que mostrar: recibida, el aviso de un campo o fallo.
 */
export async function enviarConReintento(p: {
    url: string;
    cuerpo: CuerpoDemo;
    /** El token vigente o el siguiente que dé el recuadro; null si no llega a tiempo. */
    esperarToken: () => Promise<string | null>;
    /** Pide al recuadro un token nuevo (el anterior ya se usó). */
    pedirOtroToken: () => void;
    enviar?: (url: string, cuerpo: CuerpoDemoConVerificacion) => Promise<ResultadoEnvio>;
}): Promise<Exclude<ResultadoEnvio, { tipo: "verificacion" }>> {
    const enviar = p.enviar ?? ((url, cuerpo) => enviarSolicitudDemo(url, cuerpo));
    for (let vuelta = 1; vuelta <= 2; vuelta++) {
        const token = await p.esperarToken();
        if (!token) return { tipo: "fallo" };
        const resultado = await enviar(p.url, cuerpoParaEnviar(p.cuerpo, token));
        if (resultado.tipo === "recibida") return resultado;
        p.pedirOtroToken();
        if (resultado.tipo !== "verificacion") return resultado;
    }
    return { tipo: "fallo" };
}
