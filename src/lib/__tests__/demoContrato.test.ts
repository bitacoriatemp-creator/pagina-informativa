import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
    CAMPOS_DEMO,
    INTERESES,
    MENSAJES,
    PAISES,
    PERFILES,
    armarCuerpoDemo,
    cuerpoParaEnviar,
    limpiarCorreo,
    limpiarNombre,
    mensajeWhatsApp,
    normalizarWhatsApp,
    normalizarWhatsAppMx,
    normalizarWhatsAppOtroPais,
    type HojaDemo,
} from "../demoContrato";

/**
 * El contrato común página ↔ app ↔ servidor (plan registro_filtro_2026-11-13).
 * fixtures/contrato_cuestionario.json es copia TAL CUAL del plan; el servidor
 * corre los mismos casos. Si una regla cambia aquí sin cambiar el contrato (o
 * al revés), estas pruebas se rompen.
 */

type Caso = { entrada: string; salida: string | null };

const CONTRATO = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/lib/__tests__/fixtures/contrato_cuestionario.json"), "utf8"),
) as {
    version: number;
    opciones: {
        perfil: [string, string][];
        interes_compra_demo: [string, string][];
    };
    mensajes: Record<string, string>;
    whatsapp: { mx: Caso[]; otro_pais: Caso[] };
    nombre: { casos: Caso[] };
    ejemplos: { demo_cuerpo: Record<string, unknown> };
    demo: { mensajes_extra: Record<string, string> };
};

describe("el contrato que se lee es el del plan", () => {
    it("versión 1, con todas sus secciones", () => {
        expect(CONTRATO.version).toBe(1);
        expect(CONTRATO.whatsapp.mx.length).toBeGreaterThan(10);
        expect(CONTRATO.whatsapp.otro_pais.length).toBeGreaterThan(5);
        expect(CONTRATO.nombre.casos.length).toBeGreaterThan(10);
        expect(CONTRATO.ejemplos.demo_cuerpo).toBeTruthy();
    });
});

describe("WhatsApp de México: todos los casos del contrato", () => {
    it.each(CONTRATO.whatsapp.mx.map((c) => [c.entrada, c.salida] as const))("%j → %j", (entrada, salida) => {
        expect(normalizarWhatsAppMx(entrada)).toBe(salida);
        // Con país México la hoja usa esta misma regla.
        expect(normalizarWhatsApp(entrada, "MX")).toBe(salida);
    });

    it("vacío o ausente no truena", () => {
        expect(normalizarWhatsAppMx(null)).toBeNull();
        expect(normalizarWhatsAppMx(undefined)).toBeNull();
    });
});

describe("WhatsApp de otro país: todos los casos del contrato", () => {
    it.each(CONTRATO.whatsapp.otro_pais.map((c) => [c.entrada, c.salida] as const))("%j → %j", (entrada, salida) => {
        expect(normalizarWhatsAppOtroPais(entrada)).toBe(salida);
        // Con cualquier país que no sea México (también "Otro") la hoja usa esta.
        expect(normalizarWhatsApp(entrada, "CO")).toBe(salida);
        expect(normalizarWhatsApp(entrada, "OT")).toBe(salida);
    });

    it("con otro país, 10 dígitos sin lada no pasan: no se guardan como si fueran de México", () => {
        expect(normalizarWhatsApp("4155550123", "US")).toBeNull();
        expect(normalizarWhatsApp("3001234567", "CO")).toBeNull();
    });

    it("con México, un número de otro país no pasa", () => {
        expect(normalizarWhatsApp("+1 415 555 0123", "MX")).toBeNull();
    });

    it("el aviso cambia con el país", () => {
        expect(mensajeWhatsApp("MX")).toBe(CONTRATO.mensajes.whatsapp);
        expect(mensajeWhatsApp("mx")).toBe(CONTRATO.mensajes.whatsapp);
        expect(mensajeWhatsApp("US")).toBe(CONTRATO.mensajes.whatsapp_otro_pais);
    });
});

describe("nombre: todos los casos del contrato", () => {
    it.each(CONTRATO.nombre.casos.map((c) => [c.entrada, c.salida] as const))("%j → %j", (entrada, salida) => {
        expect(limpiarNombre(entrada)).toBe(salida);
    });

    it("el apóstrofo curvo del iPhone cuenta como apóstrofo", () => {
        expect(limpiarNombre("José O’Connor")).toBe("José O'Connor");
    });

    it("los acentos sueltos se juntan a su letra", () => {
        const separado = "José Pérez";
        expect(limpiarNombre(separado)).toBe("José Pérez");
    });
});

describe("correo", () => {
    it.each([
        ["obra@ejemplo.mx", "obra@ejemplo.mx"],
        ["  OBRA@Ejemplo.MX ", "obra@ejemplo.mx"],
        ["obra@ejemplo", null],
        ["obra ejemplo@x.mx", null],
        ["", null],
        [`${"a".repeat(250)}@x.mx`, null],
    ] as const)("%j → %j", (entrada, salida) => {
        expect(limpiarCorreo(entrada)).toBe(salida);
    });
});

describe("opciones: mismas claves que el contrato", () => {
    it("¿A qué te dedicas?: claves y textos del contrato, en su orden", () => {
        expect(PERFILES.map(([c, t]) => [c, t])).toEqual(CONTRATO.opciones.perfil);
    });

    it("¿Qué tan listo estás?: claves del contrato; los textos largos de siempre empiezan con el del contrato", () => {
        expect(INTERESES.map(([c]) => c)).toEqual(CONTRATO.opciones.interes_compra_demo.map(([c]) => c));
        INTERESES.forEach(([, largo], i) => {
            expect(largo.startsWith(CONTRATO.opciones.interes_compra_demo[i][1])).toBe(true);
        });
    });

    it("país: códigos de 2 letras en mayúsculas, con OT = otro", () => {
        for (const [codigo] of PAISES) expect(codigo).toMatch(/^[A-Z]{2}$/);
        expect(PAISES.some(([c]) => c === "MX")).toBe(true);
        expect(PAISES.some(([c]) => c === "OT")).toBe(true);
    });
});

describe("avisos junto a cada campo: los del contrato", () => {
    it("los del cuestionario", () => {
        expect(MENSAJES.nombre).toBe(CONTRATO.mensajes.nombre);
        expect(MENSAJES.perfil).toBe(CONTRATO.mensajes.perfil);
        expect(MENSAJES.whatsapp).toBe(CONTRATO.mensajes.whatsapp);
        expect(MENSAJES.whatsapp_otro_pais).toBe(CONTRATO.mensajes.whatsapp_otro_pais);
    });

    it("los propios de la demo", () => {
        expect(MENSAJES.email).toBe(CONTRATO.demo.mensajes_extra.email);
        expect(MENSAJES.pais).toBe(CONTRATO.demo.mensajes_extra.pais);
        expect(MENSAJES.interes_compra).toBe(CONTRATO.demo.mensajes_extra.interes_compra);
        expect(MENSAJES.obras_activas).toBe(CONTRATO.demo.mensajes_extra.obras_activas);
    });

    it("ningún aviso nombra un campo interno", () => {
        // "nombre" es también la palabra de siempre: se vigilan los nombres que
        // solo existen en el código.
        const internos = CAMPOS_DEMO.filter((c) => c !== "nombre");
        for (const texto of Object.values(MENSAJES)) {
            for (const interno of [...internos, "captcha_token", "DEMO_INVALIDA", "CAPTCHA_INVALIDO"]) {
                expect(texto).not.toContain(interno);
            }
        }
    });
});

/** La hoja escrita como la escribiría alguien para obtener el cuerpo del ejemplo. */
const HOJA_DEL_EJEMPLO: HojaDemo = {
    nombre: "Juan Pérez",
    email: "obra@ejemplo.mx",
    whatsapp: "+525512345678",
    pais: "MX",
    perfil: "constructora",
    obras_activas: "8",
    interes_compra: "muy_probable",
    plan: "plus",
};

describe("el cuerpo que viaja al servidor", () => {
    it("la hoja del ejemplo da EXACTAMENTE el cuerpo de ejemplo del contrato, en su orden", () => {
        const armado = armarCuerpoDemo(HOJA_DEL_EJEMPLO);
        expect(armado.ok).toBe(true);
        if (!armado.ok) return;
        const cuerpo = cuerpoParaEnviar(armado.cuerpo, "token-de-prueba");
        expect(cuerpo).toEqual(CONTRATO.ejemplos.demo_cuerpo);
        expect(Object.keys(cuerpo)).toEqual(Object.keys(CONTRATO.ejemplos.demo_cuerpo));
    });

    it("lo mismo escrito como lo escribe la gente: limpio, en minúsculas y con +52", () => {
        const armado = armarCuerpoDemo({
            ...HOJA_DEL_EJEMPLO,
            nombre: "  Juan   Pérez ",
            email: " OBRA@Ejemplo.MX ",
            whatsapp: "(55) 1234-5678",
            pais: "mx",
            obras_activas: " 8 ",
        });
        expect(armado.ok && cuerpoParaEnviar(armado.cuerpo, "token-de-prueba")).toEqual(CONTRATO.ejemplos.demo_cuerpo);
    });

    it("obras_activas viaja como número; vacío viaja como null", () => {
        const sinObras = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, obras_activas: "" });
        expect(sinObras.ok && sinObras.cuerpo.obras_activas).toBeNull();
        const cero = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, obras_activas: "0" });
        expect(cero.ok && cero.cuerpo.obras_activas).toBe(0);
    });

    it("sin plan, la clave plan no viaja", () => {
        const armado = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, plan: null });
        expect(armado.ok).toBe(true);
        if (!armado.ok) return;
        expect("plan" in armado.cuerpo).toBe(false);
        expect(Object.keys(cuerpoParaEnviar(armado.cuerpo, "t"))).toEqual(
            Object.keys(CONTRATO.ejemplos.demo_cuerpo).filter((k) => k !== "plan"),
        );
    });

    it("otro país con lada: se guarda con + y sus dígitos", () => {
        const armado = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, pais: "CO", whatsapp: "+57 300 123 4567" });
        expect(armado.ok && armado.cuerpo.whatsapp).toBe("+573001234567");
    });

    it("marca TODOS los campos malos a la vez, con el aviso del contrato", () => {
        const armado = armarCuerpoDemo({
            nombre: "Juan",
            email: "obra@",
            whatsapp: "123",
            pais: "MX",
            perfil: "Constructora PyME",
            obras_activas: "1000",
            interes_compra: "Probable",
            plan: null,
        });
        expect(armado.ok).toBe(false);
        if (armado.ok) return;
        expect(armado.errores).toEqual({
            nombre: CONTRATO.mensajes.nombre,
            email: CONTRATO.demo.mensajes_extra.email,
            whatsapp: CONTRATO.mensajes.whatsapp,
            perfil: CONTRATO.mensajes.perfil,
            obras_activas: CONTRATO.demo.mensajes_extra.obras_activas,
            interes_compra: CONTRATO.demo.mensajes_extra.interes_compra,
        });
    });

    it("sin país válido el aviso va en el país, no en el WhatsApp", () => {
        const armado = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, pais: "" });
        expect(armado.ok).toBe(false);
        if (armado.ok) return;
        expect(armado.errores).toEqual({ pais: CONTRATO.demo.mensajes_extra.pais });
    });

    it("con otro país el aviso del WhatsApp pide la lada", () => {
        const armado = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, pais: "US", whatsapp: "4155550123" });
        expect(armado.ok).toBe(false);
        if (armado.ok) return;
        expect(armado.errores).toEqual({ whatsapp: CONTRATO.mensajes.whatsapp_otro_pais });
    });

    it("las claves viejas de la hoja (los textos de antes) ya no pasan", () => {
        const armado = armarCuerpoDemo({ ...HOJA_DEL_EJEMPLO, perfil: "Residente independiente", interes_compra: "Muy probable" });
        expect(armado.ok).toBe(false);
    });
});
