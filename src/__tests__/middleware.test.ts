import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CUENTA_COOKIE, VER_SITIO_COOKIE, VER_SITIO_MAX_AGE, codificarCuenta } from "../lib/cuenta";

/**
 * src/middleware.ts: con cuenta abierta, bitacoria.com lleva al tablero.
 * Se importa en cada prueba (resetModules) para que APP_URL salga de la
 * variable que fija cada una.
 */

const CUENTA = codificarCuenta({ nombre: "Juan Carlos Díaz", iniciales: "JC" });

function peticion(ruta: string, opciones: { cookies?: Record<string, string>; headers?: Record<string, string> } = {}) {
    const headers = new Headers(opciones.headers);
    const cookies = Object.entries(opciones.cookies ?? {});
    if (cookies.length) headers.set("cookie", cookies.map(([k, v]) => `${k}=${v}`).join("; "));
    return new NextRequest(new URL(ruta, "https://www.bitacoria.com"), { headers });
}

async function cargar(appUrl = "") {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", appUrl);
    return import("../middleware");
}

/** NextResponse.next() no redirige: sin Location y con la cabecera de "sigue". */
function sigue(res: Response) {
    return res.headers.get("location") === null && res.headers.get("x-middleware-next") === "1";
}

beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
});

describe("middleware de la home", () => {
    it('con cuenta abierta, "/" manda al tablero de la app (307, sin caché compartida)', async () => {
        const { middleware } = await cargar();
        const res = middleware(peticion("/", { cookies: { [CUENTA_COOKIE]: CUENTA } }));
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe("https://app.bitacoria.com/dashboard");
        expect(res.headers.get("cache-control")).toBe("private, no-store");
    });

    it("entrar tecleando la dirección (Sec-Fetch-Site: none) también redirige", async () => {
        const { middleware } = await cargar();
        const res = middleware(
            peticion("/", { cookies: { [CUENTA_COOKIE]: CUENTA }, headers: { "sec-fetch-site": "none" } }),
        );
        expect(res.headers.get("location")).toBe("https://app.bitacoria.com/dashboard");
    });

    it("en local va a la app de NEXT_PUBLIC_APP_URL", async () => {
        const { middleware } = await cargar("http://localhost:3000");
        const res = middleware(peticion("/", { cookies: { [CUENTA_COOKIE]: CUENTA } }));
        expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
    });

    it("sin cookie de cuenta, la landing de siempre", async () => {
        const { middleware } = await cargar();
        expect(sigue(middleware(peticion("/")))).toBe(true);
    });

    it("con la cookie corrupta, la landing de siempre", async () => {
        const { middleware } = await cargar();
        expect(sigue(middleware(peticion("/", { cookies: { [CUENTA_COOKIE]: "basura!" } })))).toBe(true);
    });

    it('con "?sitio=1" no redirige y pone bitacoria_ver_sitio durante 30 minutos', async () => {
        const { middleware } = await cargar();
        const res = middleware(peticion("/?sitio=1", { cookies: { [CUENTA_COOKIE]: CUENTA } }));
        expect(sigue(res)).toBe(true);
        const setCookie = res.headers.get("set-cookie") ?? "";
        expect(setCookie).toContain(`${VER_SITIO_COOKIE}=1`);
        expect(setCookie).toMatch(/Path=\//i);
        expect(setCookie).toMatch(/HttpOnly/i);
        expect(setCookie).toMatch(/SameSite=Lax/i);
        expect(setCookie).toMatch(/Secure/i);
        // 30 minutos (Max-Age=1800), no cookie de sesión del navegador: esas las
        // conservan días los navegadores que restauran pestañas.
        expect(VER_SITIO_MAX_AGE).toBe(1800);
        expect(setCookie).toMatch(/Max-Age=1800(;|$)/i);
        // Next añade Expires a juego (ahora + 30 min) para navegadores viejos.
        const expira = setCookie.match(/Expires=([^;]+)/i)?.[1];
        if (expira) {
            const resta = Date.parse(expira) - Date.now();
            expect(resta).toBeGreaterThan(29 * 60 * 1000);
            expect(resta).toBeLessThanOrEqual(30 * 60 * 1000 + 1000);
        }
    });

    it("en http (local) la cookie de ver sitio no lleva Secure", async () => {
        const { middleware } = await cargar();
        const req = new NextRequest("http://localhost:3002/?sitio=1");
        const setCookie = middleware(req).headers.get("set-cookie") ?? "";
        expect(setCookie).toContain(`${VER_SITIO_COOKIE}=1`);
        expect(setCookie).not.toMatch(/Secure/i);
    });

    it("con bitacoria_ver_sitio (pidió ver el sitio hace menos de 30 min) no redirige", async () => {
        const { middleware } = await cargar();
        const res = middleware(peticion("/", { cookies: { [CUENTA_COOKIE]: CUENTA, [VER_SITIO_COOKIE]: "1" } }));
        expect(sigue(res)).toBe(true);
    });

    it("navegando a la home desde otra página del sitio no redirige", async () => {
        const { middleware } = await cargar();
        const cookies = { [CUENTA_COOKIE]: CUENTA };
        const internas: Record<string, string>[] = [
            { "sec-fetch-site": "same-origin" },
            { rsc: "1" },
            { "next-router-prefetch": "1" },
        ];
        for (const headers of internas) {
            expect(sigue(middleware(peticion("/", { cookies, headers })))).toBe(true);
        }
    });

    it("desde la app (Sec-Fetch-Site: same-site) sí redirige: no es navegación interna de www", async () => {
        const { middleware } = await cargar();
        const res = middleware(
            peticion("/", { cookies: { [CUENTA_COOKIE]: CUENTA }, headers: { "sec-fetch-site": "same-site" } }),
        );
        expect(res.status).toBe(307);
    });

    it('el enlace antiguo "/?registro=1" no lo toca (lo resuelve next.config.mjs antes)', async () => {
        const { middleware } = await cargar();
        const res = middleware(peticion("/?registro=1", { cookies: { [CUENTA_COOKIE]: CUENTA } }));
        expect(sigue(res)).toBe(true);
    });
});

describe("alcance del middleware", () => {
    it('el matcher es solo "/": /planes y el resto del sitio nunca pasan por aquí', async () => {
        const { config } = await cargar();
        expect(config.matcher).toEqual(["/"]);
    });

    it("y aunque se ampliara el matcher, /planes y los módulos no redirigen", async () => {
        const { middleware } = await cargar();
        const cookies = { [CUENTA_COOKIE]: CUENTA };
        for (const ruta of ["/planes", "/smart-log", "/nosotros", "/registro"]) {
            expect(sigue(middleware(peticion(ruta, { cookies })))).toBe(true);
        }
    });

    it('next.config.mjs sigue mandando "/?registro" a /registro sin chocar con el middleware', async () => {
        const nextConfig = (await import("../../next.config.mjs")).default as unknown as {
            redirects: () => Promise<{ source: string; has?: { type: string; key: string }[]; destination: string }[]>;
        };
        const redirects = await nextConfig.redirects();
        const registro = redirects.find((r) => r.source === "/" && r.has?.some((h) => h.key === "registro"));
        expect(registro?.destination).toBe("/registro");
        // Ningún redirect de next.config manda "/" (sin query) a otro sitio: eso
        // lo decide ahora el middleware.
        expect(redirects.filter((r) => r.source === "/" && !r.has)).toEqual([]);
    });
});
