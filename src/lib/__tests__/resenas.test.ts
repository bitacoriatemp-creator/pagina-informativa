import { afterEach, describe, expect, it, vi } from "vitest";

import {
    MINIMO_RESENAS,
    NOMBRE_ANONIMO,
    esFotoDeGoogle,
    fechaRelativa,
    formatearPromedio,
    iniciales,
    lineaDeObra,
    nombreCorto,
    obtenerResenas,
    promedio,
    validarResenas,
} from "../resenas";
import { RESENAS_DEMO } from "../resenasDemo";

/**
 * Reseñas reales en la portada (JC 2026-09-25).
 *
 * La portada lee GET /api/v1/public/reviews del lado del servidor y solo
 * pinta la sección cuando lo que llega cumple el contrato y hay al menos
 * una publicada. Estos tests fijan esa regla y las funciones puras de la
 * tarjeta: nombre abreviado, iniciales, fecha relativa y promedio.
 *
 * JC 2026-10-02: cada reseña se publica sola al enviarse y la caja aparece
 * desde la primera (antes pedía cinco); la caché bajó de una hora a 5 min.
 */

const AHORA = new Date("2026-09-25T12:00:00Z");

function resena(cambios: Record<string, unknown> = {}) {
    return {
        id: "r1",
        nombre: "Ricardo M.",
        foto_url: null,
        rol: "residente",
        tipo_obra: "vivienda",
        ciudad: "Querétaro",
        modulo: "smart_log",
        estrellas: 5,
        texto: "El catálogo quedó en 20 minutos y el PDF salió el mismo día.",
        respuesta_equipo: null,
        publicada_at: "2026-09-01T12:00:00Z",
        ...cambios,
    };
}

function cuerpo(n: number, total = n) {
    return {
        resumen: { promedio: 4.7, total },
        resenas: Array.from({ length: n }, (_, i) => resena({ id: `r${i}` })),
    };
}

function respuestaOk(json: unknown) {
    return { ok: true, status: 200, json: async () => json };
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe("obtenerResenas", () => {
    it("sin RESENAS_API_URL devuelve null y no toca la red", async () => {
        vi.stubEnv("RESENAS_API_URL", "");
        vi.stubEnv("RESENAS_DEMO", "");
        const fetchFalso = vi.fn();
        vi.stubGlobal("fetch", fetchFalso);

        expect(await obtenerResenas()).toBeNull();
        expect(fetchFalso).not.toHaveBeenCalled();
    });

    it("pide /api/v1/public/reviews?limit=30 con caché de 5 minutos y tiempo límite", async () => {
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test/");
        vi.stubEnv("RESENAS_DEMO", "");
        const fetchFalso = vi.fn(async () => respuestaOk(cuerpo(6, 12)));
        vi.stubGlobal("fetch", fetchFalso);

        const resultado = await obtenerResenas();

        expect(fetchFalso).toHaveBeenCalledTimes(1);
        const [url, init] = fetchFalso.mock.calls[0] as unknown as [string, RequestInit & { next?: { revalidate?: number } }];
        expect(url).toBe("https://api.ejemplo.test/api/v1/public/reviews?limit=30");
        // JC 2026-10-02: 300 s (antes 3600) para que una reseña nueva salga en minutos.
        expect(init.next?.revalidate).toBe(300);
        expect(init.signal).toBeInstanceOf(AbortSignal);
        expect(resultado?.resumen).toEqual({ promedio: 4.7, total: 12 });
        expect(resultado?.resenas).toHaveLength(6);
    });

    // JC 2026-10-02: la caja aparece desde la primera reseña publicada (antes cinco).
    it("el mínimo es una reseña publicada", () => {
        expect(MINIMO_RESENAS).toBe(1);
    });

    it("con una sola publicada ya devuelve la reseña", async () => {
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        vi.stubEnv("RESENAS_DEMO", "");
        vi.stubGlobal("fetch", vi.fn(async () => respuestaOk(cuerpo(1))));

        const resultado = await obtenerResenas();
        expect(resultado?.resumen).toEqual({ promedio: 4.7, total: 1 });
        expect(resultado?.resenas).toHaveLength(1);
    });

    it("con 0 publicadas devuelve null, aunque lleguen tarjetas o la lista venga vacía", async () => {
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        vi.stubEnv("RESENAS_DEMO", "");

        vi.stubGlobal("fetch", vi.fn(async () => respuestaOk(cuerpo(0))));
        expect(await obtenerResenas()).toBeNull();

        vi.stubGlobal("fetch", vi.fn(async () => respuestaOk(cuerpo(2, 0))));
        expect(await obtenerResenas()).toBeNull();
    });

    it("en next build, si la red falla, la respuesta no es 2xx o el JSON está roto, devuelve null (no tumba el despliegue)", async () => {
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        vi.stubEnv("RESENAS_DEMO", "");
        vi.stubEnv("NEXT_PHASE", "phase-production-build");

        vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("tiempo agotado"); }));
        expect(await obtenerResenas()).toBeNull();

        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })));
        expect(await obtenerResenas()).toBeNull();

        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("json"); } })));
        expect(await obtenerResenas()).toBeNull();
    });

    it("al regenerar la página, un fallo del backend se lanza para que Next conserve la última portada buena", async () => {
        // JC 2026-10-03: devolver null borraba la sección 5 minutos cada vez que la VM tardaba.
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        vi.stubEnv("RESENAS_DEMO", "");
        vi.stubEnv("NEXT_PHASE", "");

        vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("tiempo agotado"); }));
        await expect(obtenerResenas()).rejects.toThrow("tiempo agotado");

        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503, json: async () => ({}) })));
        await expect(obtenerResenas()).rejects.toThrow("503");

        vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("json"); } })));
        await expect(obtenerResenas()).rejects.toThrow(SyntaxError);
    });

    it("una respuesta válida sin publicadas no es un fallo: devuelve null y la sección no existe", async () => {
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        vi.stubEnv("RESENAS_DEMO", "");
        vi.stubEnv("NEXT_PHASE", "");
        vi.stubGlobal("fetch", vi.fn(async () => respuestaOk(cuerpo(0))));
        expect(await obtenerResenas()).toBeNull();
    });

    it("RESENAS_DEMO=true fuera de producción devuelve los datos de ejemplo sin red", async () => {
        vi.stubEnv("RESENAS_DEMO", "true");
        vi.stubEnv("RESENAS_API_URL", "https://api.ejemplo.test");
        const fetchFalso = vi.fn();
        vi.stubGlobal("fetch", fetchFalso);

        expect(await obtenerResenas()).toBe(RESENAS_DEMO);
        expect(fetchFalso).not.toHaveBeenCalled();
    });

    it("en producción RESENAS_DEMO se ignora", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("RESENAS_DEMO", "true");
        vi.stubEnv("RESENAS_API_URL", "");
        vi.stubGlobal("fetch", vi.fn());

        expect(await obtenerResenas()).toBeNull();
    });
});

describe("validarResenas", () => {
    it("descarta lo que no cumple: estrellas fuera de rango, texto vacío, nombre con @, basura", () => {
        const resultado = validarResenas({
            resumen: { promedio: 4.2, total: 9 },
            resenas: [
                resena({ id: "buena" }),
                resena({ id: "seis", estrellas: 6 }),
                resena({ id: "cero", estrellas: 0 }),
                resena({ id: "media", estrellas: 4.5 }),
                resena({ id: "vacia", texto: "   " }),
                resena({ id: "correo", nombre: "ricardo@ejemplo.test" }),
                "no soy un objeto",
                null,
            ],
        });

        expect(resultado?.resenas.map((r) => r.id)).toEqual(["buena"]);
        expect(resultado?.resumen).toEqual({ promedio: 4.2, total: 9 });
    });

    it("la foto de otro host se descarta (quedan las iniciales); la de Google se conserva", () => {
        const resultado = validarResenas({
            resumen: { total: 5 },
            resenas: [
                resena({ id: "google", foto_url: "https://lh3.googleusercontent.com/a/abc123=s96-c" }),
                resena({ id: "otro", foto_url: "https://imgur.com/foto.png" }),
                resena({ id: "http", foto_url: "http://lh3.googleusercontent.com/a/abc" }),
                resena({ id: "disfraz", foto_url: "https://googleusercontent.com.malo.test/a/abc" }),
                resena({ id: "numero", foto_url: 42 }),
            ],
        });

        const fotos = Object.fromEntries(resultado!.resenas.map((r) => [r.id, r.foto_url]));
        expect(fotos).toEqual({
            google: "https://lh3.googleusercontent.com/a/abc123=s96-c",
            otro: null,
            http: null,
            disfraz: null,
            numero: null,
        });
    });

    it("vuelve a abreviar el nombre por si el backend mandara uno completo", () => {
        const resultado = validarResenas({ resumen: { total: 5 }, resenas: [resena({ nombre: "Ricardo Martínez López" })] });
        expect(resultado?.resenas[0].nombre).toBe("Ricardo M.");
    });

    it("sin promedio del backend lo calcula con lo que llegó; sin total usa la cuenta", () => {
        const resultado = validarResenas({
            resenas: [resena({ estrellas: 5 }), resena({ estrellas: 4 }), resena({ estrellas: 5 }), resena({ estrellas: 3 }), resena({ estrellas: 5 })],
        });
        expect(resultado?.resumen).toEqual({ promedio: 4.4, total: 5 });
    });

    it("corrige en vez de tirar: fecha ilegible → sin fecha, ciudad y respuesta vacías → null", () => {
        const resultado = validarResenas({
            resumen: { total: 5 },
            resenas: [resena({ publicada_at: "ayer", ciudad: "  ", respuesta_equipo: "", modulo: "" })],
        });
        expect(resultado?.resenas[0]).toMatchObject({ publicada_at: "", ciudad: null, respuesta_equipo: null, modulo: null });
    });

    it("sin ninguna reseña válida, o sin lista, devuelve null", () => {
        expect(validarResenas({ resumen: { total: 10 }, resenas: [resena({ estrellas: 9 })] })).toBeNull();
        expect(validarResenas({ resumen: { total: 10 } })).toBeNull();
        expect(validarResenas("hola")).toBeNull();
        expect(validarResenas(null)).toBeNull();
    });
});

describe("nombreCorto", () => {
    it("primer nombre e inicial del primer apellido, con punto", () => {
        expect(nombreCorto("Ricardo Martínez López")).toBe("Ricardo M.");
        expect(nombreCorto("  María   José  Ruiz ")).toBe("María J.");
        expect(nombreCorto("Juan de la Cruz Pérez")).toBe("Juan C.");
        // Misma regla que la vista previa de la app y el contrato (JC 2026-09-25):
        // con dos nombres de pila la inicial es de la segunda palabra.
        expect(nombreCorto("Juan Carlos Díaz")).toBe("Juan C.");
    });

    it("lo que ya viene abreviado o es un solo nombre se queda igual", () => {
        expect(nombreCorto("Ricardo M.")).toBe("Ricardo M.");
        expect(nombreCorto("Ana")).toBe("Ana");
    });

    it("el anónimo del contrato no se toca, y el vacío se vuelve anónimo", () => {
        expect(nombreCorto(NOMBRE_ANONIMO)).toBe(NOMBRE_ANONIMO);
        expect(nombreCorto("")).toBe(NOMBRE_ANONIMO);
        expect(nombreCorto("   ")).toBe(NOMBRE_ANONIMO);
    });
});

describe("iniciales", () => {
    it("hasta dos letras para el círculo", () => {
        expect(iniciales("Ricardo M.")).toBe("RM");
        expect(iniciales("Ana")).toBe("A");
        expect(iniciales(NOMBRE_ANONIMO)).toBe("UB");
        expect(iniciales("Ricardo Martínez López")).toBe("RM");
    });
});

describe("fechaRelativa", () => {
    const hace = (dias: number) => new Date(AHORA.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();

    it("hoy, ayer, días, semanas, meses y años en español", () => {
        expect(fechaRelativa(hace(0), AHORA)).toBe("hoy");
        expect(fechaRelativa(hace(1), AHORA)).toBe("ayer");
        expect(fechaRelativa(hace(3), AHORA)).toBe("hace 3 días");
        expect(fechaRelativa(hace(7), AHORA)).toBe("hace 1 semana");
        expect(fechaRelativa(hace(21), AHORA)).toBe("hace 3 semanas");
        expect(fechaRelativa(hace(45), AHORA)).toBe("hace 1 mes");
        expect(fechaRelativa(hace(200), AHORA)).toBe("hace 6 meses");
        expect(fechaRelativa(hace(400), AHORA)).toBe("hace 1 año");
        expect(fechaRelativa(hace(800), AHORA)).toBe("hace 2 años");
    });

    it("una fecha del futuro (reloj adelantado) es hoy; una ilegible, nada", () => {
        expect(fechaRelativa(hace(-2), AHORA)).toBe("hoy");
        expect(fechaRelativa("ayer", AHORA)).toBe("");
        expect(fechaRelativa("", AHORA)).toBe("");
    });
});

describe("promedio y etiquetas", () => {
    it("promedio con un decimal", () => {
        expect(promedio([5, 4, 5, 5, 4, 3])).toBe(4.3);
        expect(promedio([5, 5])).toBe(5);
        expect(promedio([])).toBe(0);
        expect(formatearPromedio(5)).toBe("5.0");
        expect(formatearPromedio(4.66)).toBe("4.7");
    });

    it("lineaDeObra: rol · tipo de obra, ciudad; 'otro' no se pinta", () => {
        expect(lineaDeObra({ rol: "residente", tipo_obra: "vivienda", ciudad: "Querétaro" })).toBe("Residente · Vivienda, Querétaro");
        expect(lineaDeObra({ rol: "contratista", tipo_obra: "plaza_comercial", ciudad: null })).toBe("Contratista · Plaza comercial");
        expect(lineaDeObra({ rol: "otro", tipo_obra: "otro", ciudad: "León" })).toBe("León");
        expect(lineaDeObra({ rol: "otro", tipo_obra: "otro", ciudad: null })).toBe("");
        expect(lineaDeObra({ rol: "director", tipo_obra: "remodelacion", ciudad: "" })).toBe("Director de obra · Remodelación");
    });

    it("esFotoDeGoogle: solo https de *.googleusercontent.com", () => {
        expect(esFotoDeGoogle("https://lh3.googleusercontent.com/a/abc")).toBe(true);
        expect(esFotoDeGoogle("https://googleusercontent.com/a/abc")).toBe(true);
        expect(esFotoDeGoogle("http://lh3.googleusercontent.com/a/abc")).toBe(false);
        expect(esFotoDeGoogle("https://lh3.googleusercontent.com.evil.test/a")).toBe(false);
        expect(esFotoDeGoogle("https://lh3.googleusercontent.com")).toBe(false);
        expect(esFotoDeGoogle(null)).toBe(false);
    });
});

describe("datos de ejemplo (RESENAS_DEMO)", () => {
    it("pasan la misma validación que una respuesta real y alcanzan el mínimo", () => {
        const validadas = validarResenas(RESENAS_DEMO);
        expect(validadas).not.toBeNull();
        expect(validadas!.resenas).toHaveLength(RESENAS_DEMO.resenas.length);
        expect(RESENAS_DEMO.resumen.total).toBeGreaterThanOrEqual(MINIMO_RESENAS);
        expect(RESENAS_DEMO.resumen.promedio).toBe(promedio(RESENAS_DEMO.resenas.map((r) => r.estrellas)));
    });

    it("se ven como las reales: no todas de 5, con respuesta del equipo y una anónima", () => {
        const estrellas = RESENAS_DEMO.resenas.map((r) => r.estrellas);
        expect(estrellas.some((e) => e < 5)).toBe(true);
        expect(estrellas.some((e) => e === 5)).toBe(true);
        expect(RESENAS_DEMO.resenas.some((r) => r.respuesta_equipo && r.estrellas < 5)).toBe(true);
        expect(RESENAS_DEMO.resenas.some((r) => r.nombre === NOMBRE_ANONIMO)).toBe(true);
    });

    it("no inventan clientes: nombre de pila con inicial, sin correos ni fotos", () => {
        for (const r of RESENAS_DEMO.resenas) {
            expect(r.nombre === NOMBRE_ANONIMO || /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ]\.$/.test(r.nombre)).toBe(true);
            expect(r.texto).not.toContain("@");
            expect(r.respuesta_equipo ?? "").not.toContain("@");
            expect(r.foto_url).toBeNull();
            expect(r.texto.length).toBeGreaterThanOrEqual(20);
            expect(r.texto.length).toBeLessThanOrEqual(400);
        }
    });
});
