import type { BillingCycle } from "./appUrl";
import { PLAN_PRICING } from "./planes";

/* Traspaso del correo entre el hero y /registro.
   Va por sessionStorage y no por la URL: un correo en la barra de direcciones
   acaba en el historial del navegador y en el referrer de cualquier recurso
   externo que cargue la página. La clave se lee UNA vez y se borra. */
export const HANDOFF_EMAIL = "bitacoria_registro_email";

/** Bandera local de "esta persona ya se dio de alta desde este navegador". */
export const REGISTERED_FLAG = "bitacoria_registered";

/* ── Plan que le interesa a la persona: /registro?plan=plus&billing=annual ──
   2026-11-13 (Luis): Plus se anuncia en la página pero todavía no existe en la
   app ni en el servidor. Su botón trae aquí, al formulario, con el plan y el
   ciclo ya marcados. El plan viaja en la URL (no es un dato personal) y solo se
   aceptan los de esta lista: cualquier otro valor se ignora y el formulario
   queda como siempre. Lo que se guarda en la base no cambia: el plan va en el
   mensaje de WhatsApp. */

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
