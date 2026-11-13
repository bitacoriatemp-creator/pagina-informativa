import { afterEach, describe, expect, it, vi } from "vitest";

import { MENSAJES, type CuerpoDemo, type CuerpoDemoConVerificacion } from "../demoContrato";
import {
    ACCION_VERIFICACION,
    TIEMPO_MAXIMO_ENVIO_MS,
    decidirEnvio,
    enviarConReintento,
    enviarSolicitudDemo,
    leerRespuesta,
    llaveVerificacion,
    urlSolicitudDemo,
    type ResultadoEnvio,
} from "../demoServidor";

/**
 * Mandar la solicitud de demo al servidor (2026-11-13, Luis, tanda 4 del plan
 * registro_filtro). Sin red: el fetch es de mentira.
 */

const CUERPO: CuerpoDemoConVerificacion = {
    nombre: "Juan Pérez",
    email: "obra@ejemplo.mx",
    whatsapp: "+525512345678",
    pais: "MX",
    perfil: "constructora",
    obras_activas: 8,
    interes_compra: "muy_probable",
    plan: "plus",
    captcha_token: "token-de-prueba",
};

const URL_PRUEBA = "https://api.ejemplo.test/api/v1/public/demo-requests";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
});

describe("a dónde se manda", () => {
    it("a {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/demo-requests", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.ejemplo.test");
        expect(urlSolicitudDemo()).toBe(URL_PRUEBA);
    });

    it("tolera la barra final y espacios", () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "  https://api.ejemplo.test/// ");
        expect(urlSolicitudDemo()).toBe(URL_PRUEBA);
    });

    it.each(["", "   ", "api.ejemplo.test", "ftp://api.ejemplo.test", "undefined"])(
        "sin variable o con un valor raro (%j) no hay servidor",
        (valor) => {
            vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", valor);
            expect(urlSolicitudDemo()).toBeNull();
        },
    );

    it("la llave de la verificación se lee tal cual, sin espacios", () => {
        vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", " 1x00000000000000000000AA ");
        expect(llaveVerificacion()).toBe("1x00000000000000000000AA");
        vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
        expect(llaveVerificacion()).toBe("");
    });

    it("la acción de la verificación es demo (el registro de la app usa otra)", () => {
        expect(ACCION_VERIFICACION).toBe("demo");
    });
});

describe("qué hace el botón en el momento del clic", () => {
    const base = { url: URL_PRUEBA, llave: "llave", verificacion: "lista" as const, hayToken: true };

    it("con todo listo, al servidor", () => {
        expect(decidirEnvio(base)).toBe("servidor");
    });

    it("sin servidor o sin llave: WhatsApp directo, como en la tanda 0", () => {
        expect(decidirEnvio({ ...base, url: null })).toBe("whatsapp");
        expect(decidirEnvio({ ...base, llave: "" })).toBe("whatsapp");
    });

    it("si el recuadro no cargó: WhatsApp directo (se sabe antes de enviar)", () => {
        expect(decidirEnvio({ ...base, verificacion: "fallo", hayToken: false })).toBe("whatsapp");
        expect(decidirEnvio({ ...base, verificacion: "fallo", hayToken: true })).toBe("whatsapp");
    });

    it("si el recuadro pide que lo marquen y no hay token: se le pide a la persona", () => {
        expect(decidirEnvio({ ...base, verificacion: "interactiva", hayToken: false })).toBe("completar_verificacion");
        expect(decidirEnvio({ ...base, verificacion: "interactiva", hayToken: true })).toBe("servidor");
    });

    it("si el token aún no llega: al servidor, esperándolo (si no llega, No pudimos guardar)", () => {
        expect(decidirEnvio({ ...base, verificacion: "cargando", hayToken: false })).toBe("servidor");
    });
});

describe("qué dice la respuesta", () => {
    it.each([200, 201, 202, 204])("%i: recibida", (status) => {
        expect(leerRespuesta(status, { ok: true }, "MX")).toEqual({ tipo: "recibida" });
    });

    it("400 con campo: el aviso de la página para ese campo, no el texto del servidor", () => {
        expect(leerRespuesta(400, { code: "DEMO_INVALIDA", campo: "nombre", message: "nombre: invalid" }, "MX")).toEqual({
            tipo: "campo",
            campo: "nombre",
            mensaje: MENSAJES.nombre,
        });
    });

    it("400 con campo dentro de detail (forma de FastAPI)", () => {
        expect(leerRespuesta(400, { detail: { code: "DEMO_INVALIDA", campo: "email", message: "x" } }, "MX")).toEqual({
            tipo: "campo",
            campo: "email",
            mensaje: MENSAJES.email,
        });
    });

    it("el aviso del WhatsApp depende del país", () => {
        expect(leerRespuesta(400, { campo: "whatsapp" }, "MX")).toMatchObject({ mensaje: MENSAJES.whatsapp });
        expect(leerRespuesta(400, { campo: "whatsapp" }, "CO")).toMatchObject({ mensaje: MENSAJES.whatsapp_otro_pais });
    });

    it("verificación vencida o inválida", () => {
        expect(leerRespuesta(400, { code: "CAPTCHA_INVALIDO" }, "MX")).toEqual({ tipo: "verificacion" });
        expect(leerRespuesta(400, { detail: { code: "CAPTCHA_INVALIDO", message: "x" } }, "MX")).toEqual({ tipo: "verificacion" });
    });

    it.each([
        [400, { campo: "captcha_token" }],
        [400, { campo: "plan" }],
        [400, { code: "OTRA_COSA" }],
        [400, null],
        [400, "texto"],
        [404, { detail: "Not Found" }],
        [413, null],
        [422, { detail: [{ loc: ["body", "nombre"] }] }],
        [429, { detail: "Too many" }],
        [500, null],
        [503, { detail: "x" }],
        [301, null],
    ] as const)("%i %j: no se guardó", (status, cuerpo) => {
        expect(leerRespuesta(status, cuerpo, "MX")).toEqual({ tipo: "fallo" });
    });
});

/** Un fetch de mentira que anota la petición y contesta lo que se le diga. */
function fetchFalso(responder: (init: RequestInit) => Promise<{ status: number; json: () => Promise<unknown> }>) {
    const llamadas: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (url: string, init: RequestInit) => {
        llamadas.push({ url, init });
        return responder(init);
    };
    return { fetchImpl, llamadas };
}

const respuesta = (status: number, cuerpo: unknown) =>
    Promise.resolve({ status, json: () => Promise.resolve(cuerpo) });

describe("el envío", () => {
    it("manda el cuerpo tal cual por POST en JSON, sin cookies", async () => {
        const { fetchImpl, llamadas } = fetchFalso(() => respuesta(200, { ok: true }));
        expect(await enviarSolicitudDemo(URL_PRUEBA, CUERPO, { fetchImpl })).toEqual({ tipo: "recibida" });
        expect(llamadas).toHaveLength(1);
        const { url, init } = llamadas[0];
        expect(url).toBe(URL_PRUEBA);
        expect(init.method).toBe("POST");
        expect(init.headers).toEqual({ "Content-Type": "application/json" });
        expect(init.credentials).toBe("omit");
        expect(JSON.parse(String(init.body))).toEqual(CUERPO);
        expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it("el cuerpo cabe de sobra en los 8 KB del servidor, aun con el token más largo", () => {
        const largo = JSON.stringify({ ...CUERPO, nombre: "A".repeat(120), email: `${"a".repeat(240)}@x.mx`, captcha_token: "t".repeat(2048) });
        expect(new TextEncoder().encode(largo).length).toBeLessThan(8192);
    });

    it("respuesta 2xx sin cuerpo legible: igual se guardó", async () => {
        const { fetchImpl } = fetchFalso(() => Promise.resolve({ status: 200, json: () => Promise.reject(new Error("sin json")) }));
        expect(await enviarSolicitudDemo(URL_PRUEBA, CUERPO, { fetchImpl })).toEqual({ tipo: "recibida" });
    });

    it("400 con campo", async () => {
        const { fetchImpl } = fetchFalso(() => respuesta(400, { code: "DEMO_INVALIDA", campo: "whatsapp", message: "x" }));
        expect(await enviarSolicitudDemo(URL_PRUEBA, CUERPO, { fetchImpl })).toEqual({
            tipo: "campo",
            campo: "whatsapp",
            mensaje: MENSAJES.whatsapp,
        });
    });

    it("sin red (el navegador lanza): no se guardó, sin tronar", async () => {
        const { fetchImpl } = fetchFalso(() => Promise.reject(new TypeError("Failed to fetch")));
        expect(await enviarSolicitudDemo(URL_PRUEBA, CUERPO, { fetchImpl })).toEqual({ tipo: "fallo" });
    });

    it("más de 15 s: se corta y no se guardó", async () => {
        vi.useFakeTimers();
        const { fetchImpl } = fetchFalso(
            (init) =>
                new Promise((_, rechazar) => {
                    init.signal?.addEventListener("abort", () => rechazar(new DOMException("abortado", "AbortError")));
                }),
        );
        const enCurso = enviarSolicitudDemo(URL_PRUEBA, CUERPO, { fetchImpl });
        await vi.advanceTimersByTimeAsync(TIEMPO_MAXIMO_ENVIO_MS - 1);
        let terminado = false;
        void enCurso.then(() => { terminado = true; });
        await Promise.resolve();
        expect(terminado).toBe(false);
        await vi.advanceTimersByTimeAsync(2);
        expect(await enCurso).toEqual({ tipo: "fallo" });
        expect(TIEMPO_MAXIMO_ENVIO_MS).toBe(15_000);
    });
});

describe("verificación vencida: se pide otra y se reintenta UNA vez", () => {
    const { captcha_token: _sinToken, ...SIN_TOKEN } = CUERPO;
    const cuerpo: CuerpoDemo = SIN_TOKEN;

    /** Tokens en fila y respuestas en fila; anota qué se mandó y cuántas veces se pidió otro token. */
    function escenario(tokens: (string | null)[], respuestas: ResultadoEnvio[]) {
        const enviados: CuerpoDemoConVerificacion[] = [];
        let pedidos = 0;
        const p = {
            url: URL_PRUEBA,
            cuerpo,
            esperarToken: () => Promise.resolve(tokens.length ? tokens.shift() ?? null : null),
            pedirOtroToken: () => { pedidos++; },
            enviar: (_url: string, c: CuerpoDemoConVerificacion) => {
                enviados.push(c);
                return Promise.resolve(respuestas.shift() ?? { tipo: "fallo" as const });
            },
        };
        return { p, enviados, pedidos: () => pedidos };
    }

    it("a la primera: recibida, un solo envío, sin pedir otro token", async () => {
        const e = escenario(["t1"], [{ tipo: "recibida" }]);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "recibida" });
        expect(e.enviados.map((c) => c.captcha_token)).toEqual(["t1"]);
        expect(e.pedidos()).toBe(0);
    });

    it("vencida y luego bien: dos envíos con tokens distintos", async () => {
        const e = escenario(["t1", "t2"], [{ tipo: "verificacion" }, { tipo: "recibida" }]);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "recibida" });
        expect(e.enviados.map((c) => c.captcha_token)).toEqual(["t1", "t2"]);
        expect(e.pedidos()).toBe(1);
    });

    it("vencida dos veces: no hay tercer intento y no se guardó", async () => {
        const e = escenario(["t1", "t2", "t3"], [{ tipo: "verificacion" }, { tipo: "verificacion" }, { tipo: "recibida" }]);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "fallo" });
        expect(e.enviados).toHaveLength(2);
    });

    it("vencida y el token nuevo no llega a tiempo: no se guardó", async () => {
        const e = escenario(["t1", null], [{ tipo: "verificacion" }]);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "fallo" });
        expect(e.enviados).toHaveLength(1);
    });

    it("sin token desde el principio: no se manda nada", async () => {
        const e = escenario([null], []);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "fallo" });
        expect(e.enviados).toHaveLength(0);
    });

    it("un campo rechazado: se devuelve tal cual, sin reintentar, y se pide token nuevo para el próximo envío", async () => {
        const campo = { tipo: "campo", campo: "nombre", mensaje: MENSAJES.nombre } as const;
        const e = escenario(["t1", "t2"], [campo]);
        expect(await enviarConReintento(e.p)).toEqual(campo);
        expect(e.enviados).toHaveLength(1);
        expect(e.pedidos()).toBe(1);
    });

    it("cualquier otro fallo: sin reintentar", async () => {
        const e = escenario(["t1", "t2"], [{ tipo: "fallo" }]);
        expect(await enviarConReintento(e.p)).toEqual({ tipo: "fallo" });
        expect(e.enviados).toHaveLength(1);
    });

    it("lo que se manda es el cuerpo revisado con el token al final", async () => {
        const e = escenario(["token-de-prueba"], [{ tipo: "recibida" }]);
        await enviarConReintento(e.p);
        expect(e.enviados[0]).toEqual(CUERPO);
        expect(Object.keys(e.enviados[0]).at(-1)).toBe("captcha_token");
    });
});
