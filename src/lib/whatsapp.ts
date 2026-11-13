/* ══════════════════════════════════════════════════════════════
   whatsapp — enlace de contacto con mensaje precargado
   ──────────────────────────────────────────────────────────────
   El lead llena la encuesta de /registro y lo mandamos a un chat de
   WhatsApp con sus datos ya escritos.

   OJO (2026-11-13): hoy NADA se guarda en la base. La base vieja del
   sitio ya no existe y el servidor todavía no recibe solicitudes (llega
   con la tanda 4 del plan registro_filtro). El mensaje precargado es
   EDITABLE y solo nos llega si la persona pulsa "enviar" en WhatsApp
   (o manda el correo con el mismo texto): por eso la pantalla dice
   "Falta un paso" y no "Solicitud recibida".

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
    /** Plan que pidió desde la página (2026-11-13: Plus), con su precio y ciclo
        ("$549 al mes, pago anual"). Sin plan, el mensaje es el de siempre. */
    plan?: { nombre: string; precio: string } | null;
};

/**
 * El texto del mensaje, renglón por renglón. Es el mismo para WhatsApp y para
 * el correo de respaldo: así el equipo recibe lo mismo por cualquiera de los
 * dos caminos.
 */
export function armarMensaje(datos: LeadDatos): string {
    // Plus todavía no existe en la app: el plan que pidió solo llega al equipo
    // por este mensaje.
    const plan = datos.plan;
    const lineas = [
        plan ? `Hola, me interesa el plan ${plan.nombre} de BitacorIA.` : "Hola, quiero una demo de BitacorIA.",
        "",
        `Nombre: ${datos.nombre}`,
        `Correo: ${datos.email}`,
        `Perfil: ${datos.perfil}`,
    ];
    if (plan) lineas.push(`Plan: ${plan.nombre} (${plan.precio})`);

    // Campo opcional: solo lo incluimos si de verdad lo llenaron.
    const obras = datos.obras_activas;
    if (obras !== null && obras !== undefined && `${obras}`.trim() !== "") {
        lineas.push(`Obras activas: ${obras}`);
    }

    lineas.push(`Interés: ${datos.interes_compra}`);
    lineas.push(`País: ${datos.pais}`);

    return lineas.join("\n");
}

/**
 * Arma la URL de WhatsApp con el mensaje del lead ya redactado.
 * Devuelve null si no hay número configurado, para que el caller
 * pueda ocultar el botón en vez de mandar a un enlace roto.
 */
export function buildWhatsAppUrl(datos: LeadDatos): string | null {
    if (!hasWhatsApp()) return null;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(armarMensaje(datos))}`;
}

/**
 * Número para leerlo en pantalla ("+52 271 239 6353"): quien está en una
 * computadora sin WhatsApp lo puede escribir en su teléfono. Los números de
 * México (52, con o sin el 1 de celular) salen a 10 dígitos agrupados; los de
 * otro país, con "+" y sus dígitos tal cual.
 */
export function formatearNumeroVisible(digitos: string): string {
    const d = digitos.replace(/\D/g, "");
    let local: string | null = null;
    if (d.length === 13 && d.startsWith("521")) local = d.slice(3);
    else if (d.length === 12 && d.startsWith("52")) local = d.slice(2);
    if (!local) return `+${d}`;
    // Ciudad de México, Guadalajara y Monterrey usan lada de 2 dígitos.
    return /^(55|56|33|81)/.test(local)
        ? `+52 ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`
        : `+52 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

/** El número configurado, listo para leerse, o null si no hay número. */
export function numeroWhatsAppVisible(): string | null {
    return hasWhatsApp() ? formatearNumeroVisible(WHATSAPP_NUMBER) : null;
}
