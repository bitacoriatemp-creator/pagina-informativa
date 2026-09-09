/* ══════════════════════════════════════════════════════════════
   appUrl — enlaces del sitio hacia la app (app.bitacoria.com)
   ──────────────────────────────────────────────────────────────
   El sitio solo vende y enlaza: la cuenta, el pago y la primera obra
   ocurren en la app. Todo enlace hacia allá sale de aquí para que el
   contrato de parámetros viva en un único lugar:

     /auth                                   → iniciar sesión
     /auth?mode=register&plan=<plan>         → crear cuenta con un plan
     /auth?mode=register&plan=<plan>&billing=<monthly|annual>
                                             → plan de pago con su ciclo

   `plan`: draft | resident | manager | executive | project_license.
   `billing` solo viaja con los planes de suscripción; Draft es gratis y
   la licencia de proyecto es pago único, así que para ellos se omite
   (la app, si falta, asume anual).

   Acceso ESTÁTICO a la env (process.env.NEXT_PUBLIC_APP_URL): Next solo
   inlinea en el cliente las lecturas literales, no process.env[x].
   ══════════════════════════════════════════════════════════════ */

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.bitacoria.com").replace(/\/$/, "");

export type PlanKey = "draft" | "resident" | "manager" | "executive" | "project_license";
export type BillingCycle = "monthly" | "annual";

/** Planes que se cobran por suscripción (mensual o anual). */
const PLANES_SUSCRIPCION: readonly PlanKey[] = ["resident", "manager", "executive"];

/**
 * URL absoluta de la app. Los parámetros `undefined` se omiten, así el
 * caller puede pasar opcionales sin armar la query a mano.
 */
export function appUrl(path: string, params?: Record<string, string | undefined>): string {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined) qs.set(key, value);
    }
    const query = qs.toString();
    return `${APP_URL}${path}${query ? `?${query}` : ""}`;
}

/** Pantalla de inicio de sesión de la app. */
export function loginUrl(): string {
    return appUrl("/auth");
}

/**
 * Alta en la app, con el plan elegido en el sitio. Tras registrarse, la app
 * lleva al pago (planes de pago y licencia) o al panel (Draft).
 */
export function registerUrl(plan?: PlanKey, billing?: BillingCycle): string {
    const conCiclo = plan !== undefined && PLANES_SUSCRIPCION.includes(plan);
    return appUrl("/auth", {
        mode: "register",
        plan,
        billing: conCiclo ? billing : undefined,
    });
}
