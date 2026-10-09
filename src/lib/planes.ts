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

/**
 * Lo que NO se puede decir en el sitio (planes, pie, módulos), porque hoy no
 * existe.
 *
 * Cada entrada es una promesa que estuvo publicada y no tenía respaldo en el
 * producto. `planes.test.ts` revisa que ninguna vuelva al copy: si una de estas
 * funciones llega a existir de verdad, se quita de aquí en el mismo cambio que
 * la construye.
 */
export const PROMESAS_SIN_RESPALDO: readonly string[] = [
    // No hay SSO empresarial. Lo real en Executive es el cupo sin límite.
    "Single Sign-On",
    "SSO",
    // Las firmas son dibujadas dentro del PDF, no un flujo de aprobación.
    "Aprobación automatizada",
    // No hay exportación total de la base ni empaquetado final al cancelar.
    "toda tu base de datos",
    // El indicador de estado era un adorno fijo, no consultaba nada.
    "Todos los sistemas operativos",
    // El rol de solo lectura no existe: hay administrador y miembro.
    "View-Only",
    // Los planos no se convierten solos en catálogo.
    "planos automáticamente",
    // 2026-10-05 (Luis): no hay firma electrónica avanzada ni sello NOM-151.
    // "NOM-151", "Electrónica Avanzada" y "e.firma" siguen en los Términos de
    // junio; vuelven a esta lista cuando la Fase 6 publique los Términos nuevos.
    // 2026-10-05 (Luis): no se venden usuarios extra a $299.
    "+$299",
    // 2026-10-05 (Luis): BIM Sync es "catálogo y cronograma conectados": el
    // avance confirmado mueve lo ejecutado, pero un cambio en el catálogo no
    // mueve el cronograma.
    "siempre en sincronía",
    "se refleja en el otro",
    // 2026-10-05 (Luis): hoy solo se trabaja con la normativa de México.
    "8 países",
    "ocho países",
    "América Latina",
    "Lo agregamos",
    // No hay alertas automáticas: el programador de tareas está apagado. El
    // cronograma tampoco se ajusta solo: un retraso se propone y se aplica con
    // el sí del residente.
    "alertas automáticas",
    "lo sabe antes que tú",
    "avisa de las desviaciones",
    "se ajusta solo",
    // 2026-10-04 (Luis): toda la empresa ve todas sus obras y el código por
    // obra se quitó. Invitar al cliente final le abriría todas las obras.
    "código de acceso",
    "cliente final",
    // 2026-10-07 (Luis): al vencer o cancelar, 30 días en solo lectura con PDF
    // y nada se borra solo.
    "se eliminan de nuestros servidores",
    // 2026-10-08 (Luis): no hay nada predictivo en el cronograma. Lo real es el
    // cronograma doble (programado contra real) con el avance que se confirma.
    "predictiv",
    // El Aviso de junio todavía dice que solo se transfiere por orden judicial y
    // a PACs; "solo transferirá" y "Proveedores Autorizados de Certificación"
    // vuelven a esta lista con el Aviso nuevo de la Fase 6.
];
