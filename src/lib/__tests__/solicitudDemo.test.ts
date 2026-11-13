import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { armarCuerpoDemo } from "../demoContrato";
import { DEMO_RECIBIDA_FLAG, REGISTERED_FLAG, leerPlanDeInteres, marcarSolicitudRecibida } from "../registro";
import {
    CORREO_CONTACTO,
    abrirEnPestanaNueva,
    buildCorreoUrl,
    cabeceraFormulario,
    datosDelMensaje,
    datosPrellenados,
    pasosDespues,
    textosFaltaUnPaso,
    textosNoGuardada,
    textosRecibida,
    type Ventana,
} from "../solicitudDemo";
import { armarMensaje, formatearNumeroVisible, numeroWhatsAppVisible, type LeadDatos } from "../whatsapp";

/**
 * Las piezas sin pantalla de "Solicitar demo" (2026-11-13, Luis). Tanda 0 del
 * plan registro_filtro: sin servidor nada se guarda, se abre WhatsApp en el
 * mismo clic y la pantalla dice "Falta un paso". Tanda 4: con servidor, "Solicitud
 * recibida" solo si llegó; si no, "No pudimos guardar tu solicitud". Se prueban
 * sin montar el formulario.
 */

const PLUS = leerPlanDeInteres("?plan=plus&billing=annual");
const DATOS: LeadDatos = {
    nombre: "SMOKE Prueba Uno",
    email: "prueba@example.com",
    whatsapp: "+52 55 1234 5678",
    perfil: "Constructora o contratista",
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
    it("demo: siete datos (el WhatsApp es el séptimo), con servidor o sin él", () => {
        const esperado = {
            antetitulo: "Acceso anticipado",
            titulo: "Solicita tu demo",
            entrada: "Siete datos. Con ellos preparamos una demo sobre tu obra, no una presentación genérica.",
        };
        expect(cabeceraFormulario(null, "whatsapp")).toEqual(esperado);
        expect(cabeceraFormulario(null, "whatsapp", "servidor")).toEqual(esperado);
    });

    it("Plus sin servidor: arma el mensaje para darte de alta por WhatsApp", () => {
        expect(cabeceraFormulario(PLUS, "whatsapp")).toEqual({
            antetitulo: "Plan Plus",
            titulo: "Comienza con el plan Plus",
            entrada: "Siete datos. Con ellos armamos el mensaje para darte de alta por WhatsApp.",
        });
    });

    it("Plus sin WhatsApp no promete WhatsApp", () => {
        expect(cabeceraFormulario(PLUS, "correo").entrada).toBe(
            "Siete datos. Con ellos armamos el mensaje para darte de alta por correo.",
        );
    });

    it("Plus con servidor: el equipo escribe", () => {
        expect(cabeceraFormulario(PLUS, "whatsapp", "servidor").entrada).toBe(
            "Siete datos. Con ellos te escribimos por WhatsApp para darte de alta.",
        );
    });

    it("ya no dice seis datos", () => {
        for (const plan of [null, PLUS]) {
            for (const modo of ["directo", "servidor"] as const) {
                expect(cabeceraFormulario(plan, "whatsapp", modo).entrada).not.toContain("Seis");
            }
        }
    });
});

describe("qué pasa después", () => {
    it("sin servidor, el renglón 2 dice que quien escribe es la persona", () => {
        expect(pasosDespues("whatsapp")[1]).toEqual([
            "Nos escribes por WhatsApp",
            "El mensaje ya lleva tus datos; contesta alguien del equipo.",
        ]);
        expect(pasosDespues("correo")[1][0]).toBe("Nos escribes por correo");
    });

    it("sin servidor ya no promete que nosotros escribimos primero", () => {
        for (const canal of ["whatsapp", "correo"] as const) {
            const todo = pasosDespues(canal).flat().join(" ");
            expect(todo).not.toContain("Te escribimos");
            expect(pasosDespues(canal)).toHaveLength(3);
        }
    });

    it("con servidor la solicitud queda guardada y el equipo escribe al número que dejó", () => {
        expect(pasosDespues("whatsapp", "servidor")[1]).toEqual([
            "Te escribimos por WhatsApp",
            "Al número que nos dejes; contesta alguien del equipo.",
        ]);
        expect(pasosDespues("whatsapp", "servidor")).toHaveLength(3);
    });
});

describe("Solicitud recibida (solo cuando el servidor la guardó)", () => {
    it("demo: recibida, gracias y el número al que escribimos", () => {
        expect(textosRecibida({ nombre: "Ana López", plan: null, whatsapp: "+52 55 1234 5678" })).toEqual({
            antetitulo: "Solicitud de demo",
            titulo: "Solicitud recibida",
            entrada: "Gracias, Ana. Te escribimos por WhatsApp al +52 55 1234 5678 para agendar tu demo.",
            extra: "No hace falta, pero si prefieres escribirnos tú:",
            boton: "Escríbenos por WhatsApp",
        });
    });

    it("Plus: el remate es el alta", () => {
        const t = textosRecibida({ nombre: "Ana", plan: PLUS, whatsapp: "+52 55 1234 5678" });
        expect(t.antetitulo).toBe("Plan Plus");
        expect(t.entrada).toBe("Gracias, Ana. Te escribimos por WhatsApp al +52 55 1234 5678 para darte de alta en Plus.");
    });

    it("sin nombre ni número no deja huecos", () => {
        expect(textosRecibida({ nombre: " ", plan: null, whatsapp: "" }).entrada).toBe(
            "Te escribimos por WhatsApp para agendar tu demo.",
        );
    });
});

describe("No pudimos guardar tu solicitud (el servidor falló)", () => {
    it("con WhatsApp: envíanosla por WhatsApp, sin decir que llegó", () => {
        expect(textosNoGuardada({ plan: null, canal: "whatsapp" })).toEqual({
            antetitulo: "Solicitud de demo",
            titulo: "No pudimos guardar tu solicitud",
            entrada: "Envíanosla por WhatsApp: el mensaje ya va escrito con tus datos.",
            boton: "Enviar por WhatsApp",
        });
    });

    it("sin número de WhatsApp, por correo", () => {
        const t = textosNoGuardada({ plan: PLUS, canal: "correo" });
        expect(t.antetitulo).toBe("Plan Plus");
        expect(t.boton).toBe("Enviar por correo");
        expect(t.entrada).toBe("Envíanosla por correo: el mensaje ya va escrito con tus datos.");
    });

    it.each(["whatsapp", "correo"] as const)("nunca dice que ya llegó (%s)", (canal) => {
        const todo = Object.values(textosNoGuardada({ plan: null, canal })).join(" ").toLowerCase();
        for (const falso of ["recibida", "recibimos", "en la lista", "te escribimos", "listo", "✓"]) {
            expect(todo).not.toContain(falso);
        }
    });
});

describe("el mensaje sale del mismo cuerpo que va al servidor", () => {
    it("con textos, no claves: perfil, interés y país legibles; WhatsApp agrupado", () => {
        const armado = armarCuerpoDemo({
            nombre: "Juan Pérez",
            email: "obra@ejemplo.mx",
            whatsapp: "55 1234 5678",
            pais: "MX",
            perfil: "supervision",
            obras_activas: "",
            interes_compra: "investigando",
            plan: "plus",
        });
        expect(armado.ok).toBe(true);
        if (!armado.ok) return;
        expect(datosDelMensaje(armado.cuerpo, PLUS)).toEqual({
            nombre: "Juan Pérez",
            email: "obra@ejemplo.mx",
            whatsapp: "+52 55 1234 5678",
            perfil: "Supervisión o DRO (director responsable de obra)",
            obras_activas: null,
            interes_compra: "Solo investigando — no estoy en el mercado ahora",
            pais: "México",
            plan: PLUS,
        });
    });

    it("número de otro país: con + y sus dígitos", () => {
        const armado = armarCuerpoDemo({
            nombre: "Ana Ruiz",
            email: "ana@ejemplo.co",
            whatsapp: "+57 300 123 4567",
            pais: "CO",
            perfil: "otro",
            obras_activas: "2",
            interes_compra: "curioso",
        });
        expect(armado.ok && datosDelMensaje(armado.cuerpo, null)).toMatchObject({
            whatsapp: "+573001234567",
            pais: "Colombia",
            obras_activas: 2,
            plan: null,
        });
    });
});

describe("la marca nueva del navegador", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("tiene otro nombre que la vieja y solo guarda la fecha", () => {
        expect(DEMO_RECIBIDA_FLAG).not.toBe(REGISTERED_FLAG);
        const guardado: Record<string, string> = {};
        vi.stubGlobal("localStorage", { setItem: (k: string, v: string) => { guardado[k] = v; } });
        marcarSolicitudRecibida(new Date("2026-11-13T18:00:00Z"));
        expect(guardado).toEqual({ [DEMO_RECIBIDA_FLAG]: "2026-11-13T18:00:00.000Z" });
    });

    it("si el navegador no deja guardar, no truena", () => {
        vi.stubGlobal("localStorage", { setItem: () => { throw new Error("modo privado"); } });
        expect(() => marcarSolicitudRecibida()).not.toThrow();
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
