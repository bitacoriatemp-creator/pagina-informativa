import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi, beforeEach } from "vitest";

import { PLAN_PRICING, PROJECT_LICENSE, PRICING_FOOTER } from "../planes";

/**
 * Precios y enlaces del sitio: contrato congelado.
 *
 * El sitio es lo unico que ve un cliente antes de pagar. Si un precio cambia aqui
 * y no en la app (frontend-bitacoria/src/lib/plans.ts) ni en el backend
 * (TIER_QUOTAS), el usuario ve un numero en la landing y otro al solicitar el plan.
 * Estos tests no sincronizan nada: obligan a que el cambio sea consciente y en los
 * tres repos.
 *
 * La tarjeta (PlanesSection.tsx) todavia lleva los numeros inline; se leen del
 * archivo como texto hasta que esa seccion se refactorice para importar `planes.ts`.
 */

const SECTION = readFileSync(
    join(process.cwd(), "src/components/ui/PlanesSection.tsx"),
    "utf-8",
);

describe("tabla de precios", () => {
    it("congela los cuatro planes con sus importes en MXN sin IVA", () => {
        expect(PLAN_PRICING).toEqual([
            { planKey: "draft", title: "DRAFT", priceMonthly: "0", priceAnnual: "0", annualTotal: "0", cta: "Empezar Gratis" },
            { planKey: "resident", title: "THE RESIDENT", priceMonthly: "2,499", priceAnnual: "1,999", annualTotal: "23,988", cta: "Comenzar" },
            { planKey: "manager", title: "THE SITE MANAGER", priceMonthly: "3,899", priceAnnual: "3,199", annualTotal: "38,388", cta: "Comenzar" },
            { planKey: "executive", title: "EXECUTIVE PLAN", priceMonthly: "12,999", priceAnnual: "10,399", annualTotal: "124,788", cta: "Contactar" },
        ]);
    });

    it("el anual facturado equivale a doce meses del precio anual", () => {
        const aNumero = (s: string) => Number(s.replace(/,/g, ""));
        for (const plan of PLAN_PRICING) {
            expect(aNumero(plan.annualTotal)).toBe(aNumero(plan.priceAnnual) * 12);
        }
    });

    it("la licencia de proyecto es pago unico de 12 meses por una obra", () => {
        expect(PROJECT_LICENSE.detail).toBe("$10,999 MXN · Pago único · 12 meses · 1 obra.");
    });

    it("el pie dice como se paga (transferencia o Mercado Pago, sin permanencia)", () => {
        expect(PRICING_FOOTER).toContain("IVA no incluido");
        expect(PRICING_FOOTER).toContain("transferencia o Mercado Pago");
        expect(PRICING_FOOTER).toContain("Sin permanencia");
        expect(PRICING_FOOTER).not.toContain("tarjeta");
    });
});

describe("la tarjeta de planes muestra los mismos numeros", () => {
    it.each(PLAN_PRICING)("$title", (plan) => {
        expect(SECTION).toContain(`title: "${plan.title}"`);
        expect(SECTION).toContain(`priceMonthly: "${plan.priceMonthly}"`);
        expect(SECTION).toContain(`priceAnnual: "${plan.priceAnnual}"`);
        expect(SECTION).toContain(`annualTotal: "${plan.annualTotal}"`);
        expect(SECTION).toContain(`planKey: "${plan.planKey}"`);
    });

    it("incluye la licencia unica de proyecto y el pie de precios", () => {
        expect(SECTION).toContain(PROJECT_LICENSE.detail);
        expect(SECTION).toContain(PRICING_FOOTER);
    });
});

describe("enlaces hacia la app", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("acceso e alta apuntan a app.bitacoria.com", async () => {
        const { loginUrl, registerUrl } = await import("../appUrl");
        expect(loginUrl()).toBe("https://app.bitacoria.com/auth");
        expect(registerUrl("resident", "annual")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=resident&billing=annual",
        );
    });

    it("el ciclo solo viaja con los planes de suscripcion", async () => {
        const { registerUrl } = await import("../appUrl");
        expect(registerUrl("draft", "monthly")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=draft",
        );
        expect(registerUrl("project_license", "annual")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=project_license",
        );
    });

    it("respeta NEXT_PUBLIC_APP_URL y le recorta la diagonal final", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.bitacoria.com/");
        const { loginUrl } = await import("../appUrl");
        expect(loginUrl()).toBe("https://staging.bitacoria.com/auth");
    });
});
