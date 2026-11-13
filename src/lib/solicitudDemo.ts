/* ══════════════════════════════════════════════════════════════
   solicitudDemo — lo que pasa al pulsar "Solicitar demo" en /registro
   ──────────────────────────────────────────────────────────────
   2026-11-13 (Luis, tanda 0 del plan registro_filtro): el formulario ya
   no manda nada a una base. Arma el mensaje con los datos de la persona
   y abre WhatsApp en el mismo clic; si no hay WhatsApp, el correo con el
   mismo texto. Nada queda guardado hasta que la persona envíe ese
   mensaje, y la pantalla lo dice tal cual ("Falta un paso").

   Aquí viven las piezas sin pantalla, para poder probarlas sin montar
   el formulario: los textos de cada caso, el enlace de correo y la
   regla de abrir en pestaña nueva o, si el navegador la bloquea, en la
   misma.
   ══════════════════════════════════════════════════════════════ */

import { armarMensaje, type LeadDatos } from "./whatsapp";

/** El correo de contacto del pie de la página (FooterSection). Una prueba
    vigila que los dos digan lo mismo. */
export const CORREO_CONTACTO = "bitacoria.temp@gmail.com";

/** Por dónde manda la persona su solicitud: WhatsApp si hay número
    configurado; si no, correo. */
export type Canal = "whatsapp" | "correo";

type PlanVisible = { nombre: string } | null | undefined;

/** Enlace de correo con el mismo mensaje que el de WhatsApp. */
export function buildCorreoUrl(datos: LeadDatos): string {
    const asunto = datos.plan
        ? `Me interesa el plan ${datos.plan.nombre} de BitacorIA`
        : "Quiero una demo de BitacorIA";
    // Los clientes de correo esperan el salto de renglón como CRLF (RFC 6068).
    const cuerpo = armarMensaje(datos).replace(/\n/g, "\r\n");
    return `mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

/** Lo mínimo que se usa de `window` para abrir el enlace. */
export type Ventana = {
    open: (url: string, target: string) => { opener: unknown } | null;
    location: { assign: (url: string) => void };
};

/**
 * Abre el enlace en una pestaña nueva DENTRO del mismo clic. Se llama sin
 * nada asíncrono antes: tras un `await` el navegador ya no lo cuenta como
 * parte del clic y bloquea la ventana (Safari de iPhone, sobre todo).
 *
 * - Sin la opción `noopener`: con ella `window.open` siempre devuelve null y no
 *   se sabría si abrió. En su lugar se corta `opener` a mano.
 * - Si no abrió (bloqueo, navegador dentro de Instagram o Facebook), se navega
 *   en la misma pestaña: mejor salir de la página que quedarse sin WhatsApp.
 */
export function abrirEnPestanaNueva(url: string, ventana: Ventana): "pestana" | "misma" {
    let nueva: { opener: unknown } | null = null;
    try {
        nueva = ventana.open(url, "_blank");
    } catch {
        nueva = null;
    }
    if (nueva) {
        try { nueva.opener = null; } catch { /* algunos navegadores no lo dejan; ya abrió */ }
        return "pestana";
    }
    ventana.location.assign(url);
    return "misma";
}

function primerNombre(nombre: string): string {
    return nombre.trim().split(/\s+/)[0] ?? "";
}

/** Titular y entrada mientras la persona llena la hoja. */
export function cabeceraFormulario(plan: PlanVisible, canal: Canal) {
    if (plan) {
        return {
            antetitulo: `Plan ${plan.nombre}`,
            titulo: `Comienza con el plan ${plan.nombre}`,
            entrada: `Seis datos. Con ellos armamos el mensaje para darte de alta por ${canal === "whatsapp" ? "WhatsApp" : "correo"}.`,
        };
    }
    return {
        antetitulo: "Acceso anticipado",
        titulo: "Solicita tu demo",
        entrada: "Seis datos. Con ellos preparamos una demo sobre tu obra, no una presentación genérica.",
    };
}

/**
 * Textos del estado después de pulsar el botón. Nada se guardó todavía: no se
 * dice "recibida", "estás en la lista" ni "te escribimos"; se dice qué falta.
 */
export function textosFaltaUnPaso({ nombre, plan, canal }: { nombre: string; plan: PlanVisible; canal: Canal }) {
    const quien = primerNombre(nombre);
    const remate = plan ? `y te damos de alta en ${plan.nombre}.` : "y agendamos tu demo.";
    return {
        antetitulo: plan ? `Plan ${plan.nombre}` : "Solicitud de demo",
        titulo: quien ? `Falta un paso, ${quien}` : "Falta un paso",
        entrada: canal === "whatsapp"
            ? `Tu solicitud todavía no nos llega: envía el mensaje que ya está escrito ${remate}`
            : `Tu solicitud todavía no nos llega: envíanos por correo el mensaje que ya está escrito ${remate}`,
        boton: canal === "whatsapp" ? "Continuar en WhatsApp" : "Enviar por correo",
    };
}

/** "Qué pasa después", en la columna izquierda y bajo la hoja en teléfono. */
export function pasosDespues(canal: Canal): [string, string][] {
    return [
        ["Revisamos tu caso", "Cuántas obras llevas y qué módulo te sirve primero."],
        canal === "whatsapp"
            ? ["Nos escribes por WhatsApp", "El mensaje ya lleva tus datos; contesta alguien del equipo."]
            : ["Nos escribes por correo", "El mensaje ya lleva tus datos; contesta alguien del equipo."],
        ["Demo en vivo sobre tu obra", "Veinte minutos, con tus propios datos si quieres."],
    ];
}

/**
 * Nombre y correo para prellenar la hoja: el correo que dejó el hero (si lo
 * hay) y lo que guardó este navegador en una solicitud anterior. Ese registro
 * viejo ya no tapa el formulario: esas solicitudes no quedaron guardadas, así
 * que se le vuelve a mostrar la hoja con lo que sí sabemos.
 */
export function datosPrellenados(
    correoDelHero: string | null | undefined,
    guardada: unknown,
): { nombre?: string; email?: string } {
    const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    const cuenta = guardada && typeof guardada === "object" ? (guardada as Record<string, unknown>) : {};
    const nombre = texto(cuenta.nombre);
    const email = texto(correoDelHero) ?? texto(cuenta.email);
    const out: { nombre?: string; email?: string } = {};
    if (nombre) out.nombre = nombre;
    if (email) out.email = email;
    return out;
}
