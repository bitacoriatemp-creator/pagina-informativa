import type { BillingCycle } from "./appUrl";
import { PLAN_PRICING } from "./planes";

/* Traspaso del correo entre el hero y /registro.
   Va por sessionStorage y no por la URL: un correo en la barra de direcciones
   acaba en el historial del navegador y en el referrer de cualquier recurso
   externo que cargue la página. La clave se lee UNA vez y se borra. */
export const HANDOFF_EMAIL = "bitacoria_registro_email";

/** Bandera local VIEJA de "esta persona ya se dio de alta desde este navegador".
    Desde el 2026-11-13 /registro ya no la escribe ni la lee: las solicitudes que
    la dejaron puesta se perdieron con la base vieja, y con ella la persona veía
    "Ya estás en la lista" sin estarlo. Cuando el servidor reciba solicitudes
    (tanda 4), el éxito real usará una marca con otro nombre. */
export const REGISTERED_FLAG = "bitacoria_registered";

/** Marca NUEVA (tanda 4, 2026-11-13): "el servidor guardó una solicitud de demo
    desde este navegador". Solo se escribe con una respuesta 2xx del servidor y
    lleva la fecha, nada de la persona. Tiene otro nombre a propósito: la vieja
    quedó puesta en navegadores cuyas solicitudes se perdieron. Hoy nadie la lee
    para tapar la hoja. */
export const DEMO_RECIBIDA_FLAG = "bitacoria_demo_recibida";

/** Escribe la marca nueva; si el navegador no deja (modo privado), no pasa nada. */
export function marcarSolicitudRecibida(ahora: Date = new Date()): void {
    try {
        localStorage.setItem(DEMO_RECIBIDA_FLAG, ahora.toISOString());
    } catch {
        /* sin almacenamiento: la solicitud ya quedó en el servidor */
    }
}

/* ── Plan que le interesa a la persona: /registro?plan=plus&billing=annual ──
   2026-11-13 (Luis): Plus se anuncia en la página pero todavía no existe en la
   app ni en el servidor. Su botón trae aquí, al formulario, con el plan y el
   ciclo ya marcados. El plan viaja en la URL (no es un dato personal) y solo se
   aceptan los de esta lista: cualquier otro valor se ignora y el formulario
   queda como siempre. El plan va en el mensaje de WhatsApp (o en el correo
   con el mismo texto). */

/** Planes que se piden por el formulario y no por el alta de la app. */
export type PlanPorSolicitud = "plus";

export interface PlanDeInteres {
    clave: PlanPorSolicitud;
    /** Nombre que ve la persona: "Plus". */
    nombre: string;
    ciclo: BillingCycle;
    /** Precio como en la tarjeta, sin IVA: "$549 al mes, pago anual". */
    precio: string;
}

const NOMBRES: Record<PlanPorSolicitud, string> = { plus: "Plus" };

/** Enlace del sitio al formulario con el plan y el ciclo ya marcados. */
export function solicitudPlanUrl(plan: PlanPorSolicitud, billing: BillingCycle): string {
    return `/registro?plan=${plan}&billing=${billing}`;
}

/**
 * Lee el plan de la búsqueda de la URL (`window.location.search`). Sin `billing`
 * o con un valor raro se asume anual, igual que la app y que el conmutador de
 * la página, que arranca en Anual.
 */
export function leerPlanDeInteres(search: string): PlanDeInteres | null {
    const qs = new URLSearchParams(search);
    const clave = qs.get("plan");
    if (clave !== "plus") return null;
    const tarjeta = PLAN_PRICING.find((p) => p.planKey === clave);
    if (!tarjeta) return null;
    const ciclo: BillingCycle = qs.get("billing") === "monthly" ? "monthly" : "annual";
    return {
        clave,
        nombre: NOMBRES[clave],
        ciclo,
        precio: ciclo === "annual"
            ? `$${tarjeta.priceAnnual} al mes, pago anual`
            : `$${tarjeta.priceMonthly} al mes`,
    };
}
