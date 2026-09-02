/* ══════════════════════════════════════════════════════════════
   whatsapp — enlace de contacto con mensaje precargado
   ──────────────────────────────────────────────────────────────
   El lead llena la encuesta, lo guardamos en Supabase y de ahí lo
   mandamos a un chat de WhatsApp con sus datos ya escritos.

   OJO: el mensaje precargado es EDITABLE y solo se envía si la
   persona pulsa "enviar" en WhatsApp. Por eso el registro en la
   base se hace ANTES: es la única captura garantizada.

   El número va aquí por defecto y NEXT_PUBLIC_WHATSAPP_NUMBER lo
   puede sobrescribir sin tocar código. No es un secreto: las vars
   NEXT_PUBLIC_ acaban embebidas en el bundle del navegador, y este
   número es justo el que queremos que el lead vea.

   Formato: código de país + número, solo dígitos (sin '+', espacios
   ni guiones). Ej. México: 55 1234 5678 → 525512345678
   ══════════════════════════════════════════════════════════════ */

const NUMERO_POR_DEFECTO = "5212712396353";

/** Deja solo dígitos: tolera que el número venga con +, espacios o guiones. */
const WHATSAPP_NUMBER = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || NUMERO_POR_DEFECTO
).replace(/\D/g, "");

/** ¿Hay un número configurado? Si no, el botón de WhatsApp no se muestra. */
export const hasWhatsApp = () => WHATSAPP_NUMBER.length >= 8;

export type LeadDatos = {
    nombre: string;
    email: string;
    perfil: string;
    obras_activas?: string | number | null;
    interes_compra: string;
    pais: string;
};

/**
 * Arma la URL de WhatsApp con el mensaje del lead ya redactado.
 * Devuelve null si no hay número configurado, para que el caller
 * pueda ocultar el botón en vez de mandar a un enlace roto.
 */
export function buildWhatsAppUrl(datos: LeadDatos): string | null {
    if (!hasWhatsApp()) return null;

    const lineas = [
        "Hola, quiero una demo de BitacorIA.",
        "",
        `Nombre: ${datos.nombre}`,
        `Correo: ${datos.email}`,
        `Perfil: ${datos.perfil}`,
    ];

    // Campo opcional: solo lo incluimos si de verdad lo llenaron.
    const obras = datos.obras_activas;
    if (obras !== null && obras !== undefined && `${obras}`.trim() !== "") {
        lineas.push(`Obras activas: ${obras}`);
    }

    lineas.push(`Interés: ${datos.interes_compra}`);
    lineas.push(`País: ${datos.pais}`);

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join("\n"))}`;
}
