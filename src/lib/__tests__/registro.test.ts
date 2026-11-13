import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { leerPlanDeInteres, solicitudPlanUrl } from "../registro";
import { buildWhatsAppUrl } from "../whatsapp";

/**
 * El interés en Plus por el formulario de /registro (2026-11-13, Luis).
 *
 * Plus se anuncia en la página pero todavía no existe en la app: su botón trae
 * al formulario con ?plan=plus&billing=... El formulario lo marca, lo pone en
 * el mensaje de WhatsApp y NO cambia lo que se manda a la base.
 */

describe("enlace de la tarjeta al formulario", () => {
    it("lleva el plan y el ciclo que marcó el conmutador", () => {
        expect(solicitudPlanUrl("plus", "annual")).toBe("/registro?plan=plus&billing=annual");
        expect(solicitudPlanUrl("plus", "monthly")).toBe("/registro?plan=plus&billing=monthly");
    });
});

describe("el formulario lee el plan de la URL", () => {
    it("Plus anual con el precio de la tarjeta", () => {
        expect(leerPlanDeInteres("?plan=plus&billing=annual")).toEqual({
            clave: "plus",
            nombre: "Plus",
            ciclo: "annual",
            precio: "$549 al mes, pago anual",
        });
    });

    it("Plus mensual", () => {
        expect(leerPlanDeInteres("?plan=plus&billing=monthly")).toMatchObject({
            ciclo: "monthly",
            precio: "$699 al mes",
        });
    });

    it("sin ciclo o con uno raro asume anual, como la app y el conmutador", () => {
        expect(leerPlanDeInteres("?plan=plus")?.ciclo).toBe("annual");
        expect(leerPlanDeInteres("?plan=plus&billing=semanal")?.ciclo).toBe("annual");
    });

    it.each(["", "?plan=", "?plan=PLUS", "?plan=resident", "?plan=executive", "?plan=<script>", "?billing=annual"])(
        "ignora %j: el formulario queda como siempre",
        (search) => {
            expect(leerPlanDeInteres(search)).toBeNull();
        },
    );
});

describe("mensaje de WhatsApp", () => {
    const base = {
        nombre: "SMOKE Prueba",
        email: "prueba@example.com",
        perfil: "Residente independiente",
        interes_compra: "Probable",
        pais: "México",
    };
    const texto = (url: string | null) => decodeURIComponent((url ?? "").split("?text=")[1] ?? "");

    it("sin plan, es el de siempre", () => {
        const msg = texto(buildWhatsAppUrl(base));
        expect(msg.startsWith("Hola, quiero una demo de BitacorIA.")).toBe(true);
        expect(msg).not.toContain("Plan:");
    });

    it("con Plus, dice el plan con su precio y ciclo", () => {
        const plan = leerPlanDeInteres("?plan=plus&billing=annual");
        const msg = texto(buildWhatsAppUrl({ ...base, plan }));
        expect(msg.startsWith("Hola, me interesa el plan Plus de BitacorIA.")).toBe(true);
        expect(msg).toContain("Plan: Plus ($549 al mes, pago anual)");
        expect(msg).toContain("Correo: prueba@example.com");
    });
});

describe("lo que se manda a la base no cambia", () => {
    // El aviso llega a la función register-participant con los mismos seis
    // datos de siempre. El plan solo viaja en el mensaje de WhatsApp: agregar un
    // campo al envío podría hacer que la función lo rechace y se pierda el lead.
    const FORM = readFileSync(resolve(process.cwd(), "src/app/registro/Formulario.tsx"), "utf8");

    it("el envío lleva exactamente nombre, email, pais, perfil, obras_activas e interes_compra", () => {
        const inicio = FORM.indexOf("const payload = {");
        const fin = FORM.indexOf("};", inicio);
        expect(inicio).toBeGreaterThan(-1);
        const claves = FORM.slice(inicio, fin).match(/^\s*(\w+):/gm)?.map((c) => c.trim().replace(":", "")) ?? [];
        expect(claves).toEqual(["nombre", "email", "pais", "perfil", "obras_activas", "interes_compra"]);
    });

    it("el destino del aviso sigue siendo la misma función", () => {
        expect(FORM).toContain("/functions/v1/register-participant");
    });
});
