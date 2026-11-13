import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { leerPlanDeInteres } from "../registro";
import {
    CORREO_CONTACTO,
    abrirEnPestanaNueva,
    buildCorreoUrl,
    cabeceraFormulario,
    datosPrellenados,
    pasosDespues,
    textosFaltaUnPaso,
    type Ventana,
} from "../solicitudDemo";
import { armarMensaje, formatearNumeroVisible, numeroWhatsAppVisible } from "../whatsapp";

/**
 * Las piezas sin pantalla de "Solicitar demo" (2026-11-13, Luis, tanda 0 del
 * plan registro_filtro). Nada se guarda: se abre WhatsApp en el mismo clic y la
 * pantalla dice "Falta un paso". Se prueban sin montar el formulario.
 */

const PLUS = leerPlanDeInteres("?plan=plus&billing=annual");
const DATOS = {
    nombre: "SMOKE Prueba Uno",
    email: "prueba@example.com",
    perfil: "Constructora PyME",
    obras_activas: "4",
    interes_compra: "Muy probable — estoy evaluando seriamente",
    pais: "México",
};

/** Una ventana de mentira que anota qué se le pidió. */
function ventanaFalsa(abre: "si" | "no" | "truena", opener: "normal" | "truena" = "normal") {
    const llamadas: { open: [string, string][]; assign: string[] } = { open: [], assign: [] };
    const nueva =
        opener === "truena"
            ? Object.defineProperty({} as { opener: unknown }, "opener", {
                get: () => ({}),
                set: () => { throw new Error("no se deja"); },
            })
            : { opener: {} as unknown };
    const ventana: Ventana = {
        open: (url, target) => {
            llamadas.open.push([url, target]);
            if (abre === "truena") throw new Error("bloqueado");
            return abre === "si" ? nueva : null;
        },
        location: { assign: (url) => { llamadas.assign.push(url); } },
    };
    return { ventana, llamadas, nueva };
}

describe("abrir WhatsApp dentro del clic", () => {
    const URL_WA = "https://wa.me/5215500000000?text=hola";

    it("abre en pestaña nueva, sin noopener, y le corta el acceso a esta página", () => {
        const { ventana, llamadas, nueva } = ventanaFalsa("si");
        expect(abrirEnPestanaNueva(URL_WA, ventana)).toBe("pestana");
        // Dos argumentos: con la opción noopener, window.open siempre devuelve null.
        expect(llamadas.open).toEqual([[URL_WA, "_blank"]]);
        expect(nueva.opener).toBeNull();
        expect(llamadas.assign).toEqual([]);
    });

    it("si el navegador la bloquea, va a WhatsApp en la misma pestaña", () => {
        const { ventana, llamadas } = ventanaFalsa("no");
        expect(abrirEnPestanaNueva(URL_WA, ventana)).toBe("misma");
        expect(llamadas.assign).toEqual([URL_WA]);
    });

    it("si abrir truena, también cae a la misma pestaña", () => {
        const { ventana, llamadas } = ventanaFalsa("truena");
        expect(abrirEnPestanaNueva(URL_WA, ventana)).toBe("misma");
        expect(llamadas.assign).toEqual([URL_WA]);
    });

    it("si ya abrió pero no deja cortar el acceso, no abre otra vez", () => {
        const { ventana, llamadas } = ventanaFalsa("si", "truena");
        expect(abrirEnPestanaNueva(URL_WA, ventana)).toBe("pestana");
        expect(llamadas.open).toHaveLength(1);
        expect(llamadas.assign).toEqual([]);
    });
});

describe("Falta un paso: textos por caso", () => {
    it("demo por WhatsApp", () => {
        expect(textosFaltaUnPaso({ nombre: "Ana López", plan: null, canal: "whatsapp" })).toEqual({
            antetitulo: "Solicitud de demo",
            titulo: "Falta un paso, Ana",
            entrada: "Tu solicitud todavía no nos llega: envía el mensaje que ya está escrito y agendamos tu demo.",
            boton: "Continuar en WhatsApp",
        });
    });

    it("Plus por WhatsApp: el remate es el alta, no la demo", () => {
        expect(textosFaltaUnPaso({ nombre: "Ana López", plan: PLUS, canal: "whatsapp" })).toEqual({
            antetitulo: "Plan Plus",
            titulo: "Falta un paso, Ana",
            entrada: "Tu solicitud todavía no nos llega: envía el mensaje que ya está escrito y te damos de alta en Plus.",
            boton: "Continuar en WhatsApp",
        });
    });

    it("sin número de WhatsApp, el camino es el correo", () => {
        const t = textosFaltaUnPaso({ nombre: "Ana", plan: null, canal: "correo" });
        expect(t.boton).toBe("Enviar por correo");
        expect(t.entrada).toBe(
            "Tu solicitud todavía no nos llega: envíanos por correo el mensaje que ya está escrito y agendamos tu demo.",
        );
    });

    it("usa el primer nombre aunque traiga espacios de más", () => {
        expect(textosFaltaUnPaso({ nombre: "   María   del Carmen ", plan: null, canal: "whatsapp" }).titulo).toBe(
            "Falta un paso, María",
        );
        expect(textosFaltaUnPaso({ nombre: "   ", plan: null, canal: "whatsapp" }).titulo).toBe("Falta un paso");
    });

    it.each([
        [null, "whatsapp"],
        [PLUS, "whatsapp"],
        [null, "correo"],
        [PLUS, "correo"],
    ] as const)("nunca dice que ya llegó (plan %j, %s)", (plan, canal) => {
        const todo = Object.values(textosFaltaUnPaso({ nombre: "Ana", plan, canal })).join(" ").toLowerCase();
        for (const falso of ["recibida", "recibimos", "en la lista", "te escribimos", "listo,", "estás dentro", "✓"]) {
            expect(todo).not.toContain(falso);
        }
    });
});

describe("titular mientras llena la hoja", () => {
    it("demo: el de siempre", () => {
        expect(cabeceraFormulario(null, "whatsapp")).toEqual({
            antetitulo: "Acceso anticipado",
            titulo: "Solicita tu demo",
            entrada: "Seis datos. Con ellos preparamos una demo sobre tu obra, no una presentación genérica.",
        });
    });

    it("Plus: arma el mensaje para darte de alta por WhatsApp", () => {
        expect(cabeceraFormulario(PLUS, "whatsapp")).toEqual({
            antetitulo: "Plan Plus",
            titulo: "Comienza con el plan Plus",
            entrada: "Seis datos. Con ellos armamos el mensaje para darte de alta por WhatsApp.",
        });
    });

    it("Plus sin WhatsApp no promete WhatsApp", () => {
        expect(cabeceraFormulario(PLUS, "correo").entrada).toBe(
            "Seis datos. Con ellos armamos el mensaje para darte de alta por correo.",
        );
    });
});

describe("qué pasa después", () => {
    it("el renglón 2 dice que quien escribe es la persona", () => {
        expect(pasosDespues("whatsapp")[1]).toEqual([
            "Nos escribes por WhatsApp",
            "El mensaje ya lleva tus datos; contesta alguien del equipo.",
        ]);
        expect(pasosDespues("correo")[1][0]).toBe("Nos escribes por correo");
    });

    it("ya no promete que nosotros escribimos primero", () => {
        for (const canal of ["whatsapp", "correo"] as const) {
            const todo = pasosDespues(canal).flat().join(" ");
            expect(todo).not.toContain("Te escribimos");
            expect(pasosDespues(canal)).toHaveLength(3);
        }
    });
});

describe("correo con el mismo mensaje", () => {
    const partes = (url: string) => {
        const [destino, query] = url.split("?");
        const qs = new URLSearchParams(query);
        return { destino, asunto: qs.get("subject"), cuerpo: qs.get("body") };
    };

    it("va al correo de contacto del pie, con el mismo texto que WhatsApp", () => {
        const { destino, asunto, cuerpo } = partes(buildCorreoUrl(DATOS));
        expect(destino).toBe(`mailto:${CORREO_CONTACTO}`);
        expect(asunto).toBe("Quiero una demo de BitacorIA");
        // Mismo mensaje; solo cambia el salto de renglón al que esperan los correos.
        expect(cuerpo?.split("\r\n").join("\n")).toBe(armarMensaje(DATOS));
        expect(cuerpo).toContain("Obras activas: 4");
    });

    it("con Plus, el asunto lo dice", () => {
        const { asunto, cuerpo } = partes(buildCorreoUrl({ ...DATOS, plan: PLUS }));
        expect(asunto).toBe("Me interesa el plan Plus de BitacorIA");
        expect(cuerpo).toContain("Plan: Plus ($549 al mes, pago anual)");
    });

    it("es el mismo correo que el pie de la página: no se inventa otro", () => {
        const pie = readFileSync(resolve(process.cwd(), "src/components/ui/FooterSection.tsx"), "utf8");
        expect(pie).toContain(`mailto:${CORREO_CONTACTO}`);
    });

    it("los datos van escapados: un & o un ? en el nombre no rompe el enlace", () => {
        const url = buildCorreoUrl({ ...DATOS, nombre: "Ana & Co? body=x" });
        expect(url.split("&")).toHaveLength(2);
        expect(partes(url).cuerpo).toContain("Nombre: Ana & Co? body=x");
    });
});

describe("prellenado: la marca vieja ya no tapa la hoja", () => {
    it("nombre y correo de lo que guardó este navegador", () => {
        expect(datosPrellenados(null, { email: "ana@example.com", nombre: "Ana López" })).toEqual({
            nombre: "Ana López",
            email: "ana@example.com",
        });
    });

    it("el correo del hero gana al guardado", () => {
        expect(datosPrellenados("nuevo@example.com", { email: "viejo@example.com", nombre: "Ana" })).toEqual({
            nombre: "Ana",
            email: "nuevo@example.com",
        });
    });

    it("sin nada guardado, la hoja queda vacía", () => {
        expect(datosPrellenados(null, null)).toEqual({});
        expect(datosPrellenados("", undefined)).toEqual({});
    });

    it("tolera lo que venga raro del navegador", () => {
        expect(datosPrellenados(null, { email: 42, nombre: ["x"] })).toEqual({});
        expect(datosPrellenados(null, "texto")).toEqual({});
        expect(datosPrellenados(null, { email: "  ", nombre: "  Ana  " })).toEqual({ nombre: "Ana" });
    });
});

describe("número de WhatsApp a la vista", () => {
    it.each([
        ["5212712396353", "+52 271 239 6353"],
        ["522712396353", "+52 271 239 6353"],
        ["5215512345678", "+52 55 1234 5678"],
        ["523312345678", "+52 33 1234 5678"],
        ["+52 1 81 1234 5678", "+52 81 1234 5678"],
        ["14155550123", "+14155550123"],
    ])("%s se lee como %s", (crudo, visible) => {
        expect(formatearNumeroVisible(crudo)).toBe(visible);
    });

    it("con el número configurado hoy hay número que mostrar", () => {
        expect(numeroWhatsAppVisible()).toMatch(/^\+\d/);
    });
});

describe("sin número de WhatsApp configurado", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    it("no hay enlace ni número: el correo pasa a ser el camino principal", async () => {
        vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "sin-numero");
        vi.resetModules();
        const wa = await import("../whatsapp");
        expect(wa.hasWhatsApp()).toBe(false);
        expect(wa.buildWhatsAppUrl(DATOS)).toBeNull();
        expect(wa.numeroWhatsAppVisible()).toBeNull();
        const { buildCorreoUrl: correo } = await import("../solicitudDemo");
        expect(correo(DATOS).startsWith("mailto:")).toBe(true);
    });
});
