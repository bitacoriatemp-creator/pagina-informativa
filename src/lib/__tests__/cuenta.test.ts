import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    CUENTA_COOKIE,
    CUENTA_MAX_BYTES,
    FOTO_MAX_CARACTERES,
    codificarCuenta,
    decodificarCuenta,
    fotoValida,
    leerCuenta,
    leerCuentaDelNavegador,
    mismaCuenta,
} from "../cuenta";

/**
 * Cookie de aviso `bitacoria_cuenta`: la escribe la app (JSON {n, i, f?} en
 * base64url) y www solo la lee para decidir "/" y pintar la cuenta en la barra.
 * Lo que importa aquí: ida y vuelta con acentos, que nada raro lance ni se
 * cuele (correo, ids, valores enormes) y que la foto solo pase si es https de
 * un host permitido.
 */

/** Lo que haría la app con un objeto cualquiera (para meter campos de más). */
function base64url(objeto: unknown): string {
    return Buffer.from(JSON.stringify(objeto), "utf8").toString("base64url");
}

describe("decodificarCuenta", () => {
    it("ida y vuelta con acentos y eñes", () => {
        const cuenta = { nombre: "José Ñúñez Díaz", iniciales: "JÑ" };
        const valor = codificarCuenta(cuenta);
        expect(valor).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(decodificarCuenta(valor)).toEqual(cuenta);
    });

    it("lee el formato de la app: JSON UTF-8 en base64url, con o sin relleno", () => {
        const valor = base64url({ n: "Ana López", i: "AL" });
        expect(decodificarCuenta(valor)).toEqual({ nombre: "Ana López", iniciales: "AL" });
        const conRelleno = Buffer.from(JSON.stringify({ n: "Ana", i: "AN" }), "utf8").toString("base64");
        expect(decodificarCuenta(conRelleno.replace(/\+/g, "-").replace(/\//g, "_"))).toEqual({
            nombre: "Ana",
            iniciales: "AN",
        });
        // Si algo la codificó para URL (%3D del relleno), también.
        expect(decodificarCuenta(encodeURIComponent(conRelleno))).toEqual({ nombre: "Ana", iniciales: "AN" });
    });

    it("solo devuelve nombre e iniciales: campos de más (correo, ids) se ignoran", () => {
        const valor = base64url({ n: "Luis Pérez", i: "LP", e: "luis@bitacoria.com", id: "4f2c-uuid", sub: 42 });
        const cuenta = decodificarCuenta(valor);
        expect(cuenta).toEqual({ nombre: "Luis Pérez", iniciales: "LP" });
        expect(Object.keys(cuenta ?? {}).sort()).toEqual(["iniciales", "nombre"]);
    });

    it("un correo como nombre se queda en la parte de antes de la arroba", () => {
        expect(decodificarCuenta(base64url({ n: "obra.norte@empresa.mx", i: "OB" }))).toEqual({
            nombre: "obra.norte",
            iniciales: "OB",
        });
    });

    it("sin iniciales válidas, las saca del nombre como el tablero", () => {
        expect(decodificarCuenta(base64url({ n: "Juan Carlos Díaz" }))?.iniciales).toBe("JC");
        expect(decodificarCuenta(base64url({ n: "Ana", i: "" }))?.iniciales).toBe("AN");
        expect(decodificarCuenta(base64url({ n: "Ana Ruiz", i: "demasiadas" }))?.iniciales).toBe("AR");
        expect(decodificarCuenta(base64url({ n: "Ana Ruiz", i: 7 }))?.iniciales).toBe("AR");
    });

    it("limpia espacios y caracteres de control del nombre", () => {
        expect(decodificarCuenta(base64url({ n: "  Juan\u0000\n  Carlos ", i: "jc" }))).toEqual({
            nombre: "Juan Carlos",
            iniciales: "JC",
        });
    });

    it.each([
        ["vacío", ""],
        ["undefined", undefined],
        ["null", null],
        ["no es base64url", "no es base64!"],
        ["base64 que no es JSON", Buffer.from("hola", "utf8").toString("base64url")],
        ["JSON que no es objeto", base64url(["Ana", "AN"])],
        ["JSON con null", base64url(null)],
        ["sin nombre", base64url({ i: "AN" })],
        ["nombre vacío", base64url({ n: "   ", i: "AN" })],
        ["nombre que no es texto", base64url({ n: 123, i: "AN" })],
        ["UTF-8 inválido", Buffer.from([0xff, 0xfe, 0xfd]).toString("base64url")],
        ["porcentaje roto", "%E0%A4%A"],
        ["más de 700 bytes", base64url({ n: "x".repeat(600), i: "XX" })],
    ])("%s → null sin lanzar", (_caso, valor) => {
        expect(() => decodificarCuenta(valor)).not.toThrow();
        expect(decodificarCuenta(valor)).toBeNull();
    });

    it("el tope es de 700 bytes: lo que antes pasaba de 200 ya se lee", () => {
        expect(CUENTA_MAX_BYTES).toBe(700);
        const largo = base64url({ n: `Juan ${"x".repeat(200)}`, i: "JX" });
        expect(largo.length).toBeGreaterThan(200);
        expect(largo.length).toBeLessThanOrEqual(700);
        expect(decodificarCuenta(largo)?.iniciales).toBe("JX");
    });
});

describe("foto de la cuenta (campo f)", () => {
    const FOTO = "https://lh3.googleusercontent.com/a/ACg8ocJ-foto=s96-c";

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("una foto de Google en https se conserva", () => {
        expect(decodificarCuenta(base64url({ n: "Ana Ruiz", i: "AR", f: FOTO }))).toEqual({
            nombre: "Ana Ruiz",
            iniciales: "AR",
            foto: FOTO,
        });
        // Cualquier subdominio de googleusercontent.com, y el host se normaliza.
        expect(fotoValida("https://LH5.GoogleUserContent.com/a/x")).toBe("https://lh5.googleusercontent.com/a/x");
    });

    it("mismo filtro que la app: 300 caracteres justos pasan y los espacios de los extremos se quitan", () => {
        const justa = `https://lh3.googleusercontent.com/${"a".repeat(FOTO_MAX_CARACTERES - 34)}`;
        expect(justa.length).toBe(FOTO_MAX_CARACTERES);
        expect(fotoValida(justa)).toBe(justa);
        expect(fotoValida(`  ${FOTO}\n`)).toBe(FOTO);
    });

    it("sin f, la cuenta no trae la clave foto (y el valor es el de siempre)", () => {
        const cuenta = decodificarCuenta(base64url({ n: "Ana Ruiz", i: "AR" }));
        expect(cuenta).toEqual({ nombre: "Ana Ruiz", iniciales: "AR" });
        expect(Object.keys(cuenta ?? {}).sort()).toEqual(["iniciales", "nombre"]);
    });

    it.each([
        ["http", "http://lh3.googleusercontent.com/a/x"],
        ["javascript:", "javascript:alert(1)"],
        ["data:", "data:image/png;base64,iVBORw0KGgo="],
        ["protocolo relativo", "//lh3.googleusercontent.com/a/x"],
        ["ruta relativa", "/images/yo.png"],
        ["otro host", "https://evil.example.com/yo.png"],
        ["host que solo empieza igual", "https://lh3.googleusercontent.com.evil.com/a/x"],
        ["host que solo acaba igual", "https://evilgoogleusercontent.com/a/x"],
        ["el dominio pelado", "https://googleusercontent.com/a/x"],
        ["con usuario", "https://yo@lh3.googleusercontent.com/a/x"],
        ["usuario que esconde el host", "https://lh3.googleusercontent.com@evil.com/a/x"],
        ["barra invertida", String.raw`https://evil.com\@lh3.googleusercontent.com/a/x`],
        ["con puerto", "https://lh3.googleusercontent.com:8443/a/x"],
        ["con espacios", "https://lh3.googleusercontent.com/a/x y"],
        ["con salto de línea", "https://lh3.googleusercontent.com/a/x\ny"],
        ["con comillas", 'https://lh3.googleusercontent.com/a/"x'],
        ["con comilla simple", "https://lh3.googleusercontent.com/a/'x"],
        ["con ángulos", "https://lh3.googleusercontent.com/a/<x>"],
        ["con backtick", "https://lh3.googleusercontent.com/a/`x"],
        ["un carácter más que el tope de la app", `https://lh3.googleusercontent.com/${"a".repeat(FOTO_MAX_CARACTERES - 33)}`],
        ["vacía", ""],
        ["solo espacios", "   "],
        ["número", 42],
        ["objeto", { url: FOTO }],
        ["enorme", `https://lh3.googleusercontent.com/${"a".repeat(800)}`],
    ])("f %s se descarta y la cuenta sigue valiendo", (_caso, f) => {
        expect(fotoValida(f)).toBeNull();
        const cuenta = decodificarCuenta(base64url({ n: "Ana Ruiz", i: "AR", f }));
        if (typeof f === "string" && f.length > 600) {
            // Tan larga que la cookie entera pasa del tope: no es de la app.
            expect(cuenta).toBeNull();
            return;
        }
        expect(cuenta).toEqual({ nombre: "Ana Ruiz", iniciales: "AR" });
    });

    it("al escribir también se filtra: una foto no válida no llega a la cookie", () => {
        const sinFoto = codificarCuenta({ nombre: "Juan", iniciales: "JU" });
        expect(codificarCuenta({ nombre: "Juan", iniciales: "JU", foto: "http://lh3.googleusercontent.com/a/x" })).toBe(sinFoto);
        expect(codificarCuenta({ nombre: "Juan", iniciales: "JU", foto: "https://evil.example.com/x" })).toBe(sinFoto);
        const conFoto = codificarCuenta({ nombre: "Juan", iniciales: "JU", foto: FOTO });
        expect(decodificarCuenta(conFoto)).toEqual({ nombre: "Juan", iniciales: "JU", foto: FOTO });
    });

    it("NEXT_PUBLIC_AVATAR_HOSTS suma hosts (exactos o *.dominio), separados por comas", () => {
        expect(fotoValida("https://cdn.bitacoria.com/avatar/1.webp")).toBeNull();
        vi.stubEnv("NEXT_PUBLIC_AVATAR_HOSTS", " cdn.bitacoria.com , *.fotos.example.com,,");
        expect(fotoValida("https://cdn.bitacoria.com/avatar/1.webp")).toBe("https://cdn.bitacoria.com/avatar/1.webp");
        expect(fotoValida("https://a.fotos.example.com/1.jpg")).toBe("https://a.fotos.example.com/1.jpg");
        // El comodín no cubre el dominio pelado ni hosts vecinos.
        expect(fotoValida("https://fotos.example.com/1.jpg")).toBeNull();
        expect(fotoValida("https://sub.cdn.bitacoria.com/1.jpg")).toBeNull();
        // Y sigue exigiendo https.
        expect(fotoValida("http://cdn.bitacoria.com/avatar/1.webp")).toBeNull();
    });

    it("un comodín sin dominio de verdad (*.com, *) no abre la puerta a todo", () => {
        vi.stubEnv("NEXT_PUBLIC_AVATAR_HOSTS", "*.com,*,*.");
        expect(fotoValida("https://evil.com/x.png")).toBeNull();
        expect(fotoValida("https://a.evil.com/x.png")).toBeNull();
    });
});

describe("lectura de la cookie", () => {
    const valor = base64url({ n: "Juan Carlos Díaz", i: "JC" });

    it("servidor: request.cookies del middleware", () => {
        const cookies = new Map([[CUENTA_COOKIE, { value: valor }]]);
        expect(leerCuenta(cookies)).toEqual({ nombre: "Juan Carlos Díaz", iniciales: "JC" });
        expect(leerCuenta(new Map())).toBeNull();
    });

    it("servidor: un lector que lanza cuenta como sin cuenta", () => {
        const roto = { get: () => { throw new Error("cookies no disponibles"); } };
        expect(leerCuenta(roto)).toBeNull();
    });

    it("navegador: encuentra la cookie entre otras", () => {
        const cadena = `_ga=GA1.1.123; ${CUENTA_COOKIE}=${valor}; otra=1`;
        expect(leerCuentaDelNavegador(cadena)).toEqual({ nombre: "Juan Carlos Díaz", iniciales: "JC" });
    });

    it("navegador: no confunde un nombre que solo empieza igual", () => {
        expect(leerCuentaDelNavegador(`${CUENTA_COOKIE}_vieja=${valor}`)).toBeNull();
    });

    it("navegador: sin cookie, o sin document (servidor), null", () => {
        expect(leerCuentaDelNavegador("")).toBeNull();
        expect(typeof document).toBe("undefined");
        expect(leerCuentaDelNavegador()).toBeNull();
    });

    it("navegador: la foto viaja con la cuenta", () => {
        const conFoto = base64url({ n: "Juan", i: "JU", f: "https://lh3.googleusercontent.com/a/yo" });
        expect(leerCuentaDelNavegador(`${CUENTA_COOKIE}=${conFoto}`)?.foto).toBe("https://lh3.googleusercontent.com/a/yo");
    });

    it("mismaCuenta compara nombre, iniciales y foto (la barra solo se repinta si cambian)", () => {
        const a = { nombre: "Juan", iniciales: "JU" };
        expect(mismaCuenta(a, { ...a })).toBe(true);
        expect(mismaCuenta(a, { ...a, foto: "https://lh3.googleusercontent.com/a/yo" })).toBe(false);
        expect(mismaCuenta(a, { ...a, nombre: "Juana" })).toBe(false);
        expect(mismaCuenta(null, null)).toBe(true);
        expect(mismaCuenta(a, null)).toBe(false);
    });
});

describe("enlaces de la cuenta hacia la app", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("Acceder va al tablero y Cerrar sesión a /auth/salir con el origen de www", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
        const { dashboardUrl, salirUrl } = await import("../appUrl");
        expect(dashboardUrl()).toBe("https://app.bitacoria.com/dashboard");
        expect(salirUrl("https://www.bitacoria.com")).toBe(
            "https://app.bitacoria.com/auth/salir?volver=https%3A%2F%2Fwww.bitacoria.com",
        );
        expect(salirUrl()).toBe("https://app.bitacoria.com/auth/salir");
    });

    it("en local respeta NEXT_PUBLIC_APP_URL", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000/");
        const { dashboardUrl, salirUrl } = await import("../appUrl");
        expect(dashboardUrl()).toBe("http://localhost:3000/dashboard");
        expect(salirUrl("http://localhost:3002")).toBe(
            "http://localhost:3000/auth/salir?volver=http%3A%2F%2Flocalhost%3A3002",
        );
    });
});
