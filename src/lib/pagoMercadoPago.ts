/* ══════════════════════════════════════════════════════════════
   pagoMercadoPago — enlaces de pago del sitio (2026-11-22)
   ──────────────────────────────────────────────────────────────
   Plus todavía no existe dentro de la app: se pide por /registro y, al
   guardar la hoja, la pantalla de "recibida" ofrece pagar aquí. El enlace es
   un "plan de suscripción" de Mercado Pago creado a mano por el equipo: cobra
   el total CON IVA cada mes (699 + 16 % = 810.84), con tarjeta de crédito o
   débito y sin cuenta de Mercado Pago. Verificado con Playwright el
   2026-11-22. Después del pago el equipo escribe por WhatsApp y deja lista la
   cuenta a mano.

   Plus anual no tiene enlace todavía: esa hoja sigue como antes (solo
   WhatsApp). Pro y Max se pagan dentro de la app, no aquí.
   ══════════════════════════════════════════════════════════════ */

import type { BillingCycle } from "@/lib/appUrl";

export interface PagoEnLinea {
    /** Enlace de Mercado Pago (siempre https y de Mercado Pago). */
    url: string;
    /** Lo que se cobra, como lo ve la persona: "$810.84 al mes con IVA". */
    total: string;
}

const PLUS: Readonly<Partial<Record<BillingCycle, PagoEnLinea>>> = {
    monthly: { url: "https://mpago.la/2UdX7Kq", total: "$810.84 al mes con IVA" },
};

const ORIGEN_PERMITIDO = /^https:\/\/(mpago\.la|www\.mercadopago\.com\.mx)\//;

/** Enlace de pago de Plus para ese ciclo, o null si todavía no hay. */
export function pagoPlus(ciclo: BillingCycle): PagoEnLinea | null {
    const pago = PLUS[ciclo];
    return pago && ORIGEN_PERMITIDO.test(pago.url) ? pago : null;
}
