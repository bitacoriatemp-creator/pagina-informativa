/* ══════════════════════════════════════════════════════════════
   planes — tabla de precios congelada del sitio
   ──────────────────────────────────────────────────────────────
   Los precios viven en TRES lugares que deben coincidir:

     1. este sitio            → src/components/ui/PlanesSection.tsx
     2. la app                → frontend-bitacoria/src/lib/plans.ts
     3. el backend            → backend-bitacoria app/services/billing_service.py
                                (TIER_QUOTAS, congelado por test_billing_prices_pinned.py)

   No se sincronizan solos: se congelan con tests. Este archivo es la fuente de
   verdad del SITIO y `src/lib/__tests__/planes.test.ts` verifica que el componente
   siga mostrando exactamente estos numeros. Si alguien cambia un precio en la
   tarjeta y no aqui (o al reves), la CI del sitio se cae.

   Importes en MXN, IVA NO incluido. La columna anual es el precio mensual
   facturado por ano (12 meses por adelantado).
   ══════════════════════════════════════════════════════════════ */

import type { PlanKey } from "./appUrl";

export interface PlanPricing {
    /** Clave que viaja a la app en el CTA (?plan=...). */
    planKey: PlanKey;
    /** Titulo tal como se muestra en la tarjeta. */
    title: string;
    /** Precio mensual sin IVA, formateado como en la tarjeta. */
    priceMonthly: string;
    /** Precio mensual cuando se factura por ano, sin IVA. */
    priceAnnual: string;
    /** Total facturado al ano (priceAnnual x 12). */
    annualTotal: string;
    /** Texto del boton principal. */
    cta: string;
}

export const PLAN_PRICING: readonly PlanPricing[] = [
    { planKey: "draft", title: "DRAFT", priceMonthly: "0", priceAnnual: "0", annualTotal: "0", cta: "Empezar Gratis" },
    { planKey: "resident", title: "THE RESIDENT", priceMonthly: "2,499", priceAnnual: "1,999", annualTotal: "23,988", cta: "Comenzar" },
    { planKey: "manager", title: "THE SITE MANAGER", priceMonthly: "3,899", priceAnnual: "3,199", annualTotal: "38,388", cta: "Comenzar" },
    { planKey: "executive", title: "EXECUTIVE PLAN", priceMonthly: "12,999", priceAnnual: "10,399", annualTotal: "124,788", cta: "Contactar" },
] as const;

/** Licencia unica de proyecto: pago unico, 12 meses, 1 obra (alcances Site Manager). */
export const PROJECT_LICENSE = {
    planKey: "project_license" as const,
    pill: "LICENCIA ÚNICA DE PROYECTO",
    detail: "$10,999 MXN · Pago único · 12 meses · 1 obra.",
} as const;

/** Pie de la seccion de planes: como se paga. */
export const PRICING_FOOTER =
    "Todos los precios en MXN · IVA no incluido · Pago por transferencia o Mercado Pago · Sin permanencia";
