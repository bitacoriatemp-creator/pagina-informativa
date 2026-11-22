/* Enlace de pago de Plus en el sitio (2026-11-22): solo mensual por ahora, con el total
   con IVA que cobra Mercado Pago (699 + 16 % = 810.84). */
import { describe, expect, it } from "vitest";
import { pagoPlus } from "../pagoMercadoPago";
import { PLAN_PRICING } from "../planes";

describe("pagoPlus", () => {
    it("Plus mensual: suscripción de Mercado Pago con el total con IVA", () => {
        expect(pagoPlus("monthly")).toEqual({ url: "https://mpago.la/2UdX7Kq", total: "$810.84 al mes con IVA" });
    });

    it("Plus anual todavía no tiene enlace", () => {
        expect(pagoPlus("annual")).toBeNull();
    });

    it("el total cuadra con el precio de la tarjeta más 16 % de IVA", () => {
        const plus = PLAN_PRICING.find((p) => p.planKey === "plus");
        const mensual = Number(plus?.priceMonthly.replace(/,/g, ""));
        const conIva = (Math.round(mensual * 116) / 100).toFixed(2);
        expect(pagoPlus("monthly")?.total).toContain(`$${conIva}`);
    });

    it("solo enlaces https de Mercado Pago", () => {
        expect(pagoPlus("monthly")?.url).toMatch(/^https:\/\/(mpago\.la|www\.mercadopago\.com\.mx)\//);
    });
});
