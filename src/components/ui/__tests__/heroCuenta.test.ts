import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { decodificarCuenta, type Cuenta } from "@/lib/cuenta";
import { Avatar, AvatarVista } from "../CuentaSesion";
import HeroHybrid, { CajaCuenta } from "../HeroHybrid";

/**
 * La caja del hero con y sin sesión abierta en la app (2026-09-23, pedido de
 * JC).
 *
 * Sin la cookie de aviso, la caja es el alta de siempre: "Continuar con
 * Google", el correo y "Continuar", y nada de la cuenta. Con ella, la misma
 * caja lleva la cuenta en lugar del alta: el círculo (la foto, o las iniciales
 * si no hay o no carga), "Sesión abierta como <nombre>", "Acceder" (tablero)
 * con el mismo botón relleno del alta y "Cerrar sesión" (/auth/salir con
 * vuelta a www). Nada del alta, ni "Iniciar sesión", ni correo ni ids.
 *
 * Se renderiza en el servidor (sin navegador), como las pruebas de la barra
 * (cuentaSesion.test.ts): `useCuenta` se sustituye por la cuenta de cada
 * prueba.
 */

let cuentaSimulada: Cuenta | null = null;
vi.mock("@/hooks/useCuenta", () => ({ useCuenta: () => cuentaSimulada }));

const APP = "https://app.bitacoria.com";
const WWW = "https://www.bitacoria.com";
const DASHBOARD = `${APP}/dashboard`;
const SALIR = `${APP}/auth/salir?volver=${encodeURIComponent(WWW)}`;
const FOTO = "https://lh3.googleusercontent.com/a/foto-de-prueba";

/* La cuenta sale de la cookie que escribiría la app, con campos de más que
   nunca deben llegar a la pantalla. */
const CORREO = "juan.carlos@constructora.mx";
const ID = "7d1c9e2a-5b3f-4e8a-9c0d-2f6b1a4e8c7d";
const base64url = (objeto: unknown) => Buffer.from(JSON.stringify(objeto), "utf8").toString("base64url");
const CUENTA = decodificarCuenta(base64url({ n: "Juan Carlos Díaz", i: "JC", e: CORREO, id: ID })) as Cuenta;
const CUENTA_CON_FOTO = decodificarCuenta(
    base64url({ n: "Juan Carlos Díaz", i: "JC", f: FOTO, e: CORREO, id: ID }),
) as Cuenta;

/* Lo que es del alta y no debe verse con sesión abierta. */
const DEL_ALTA = [
    "Continuar con Google",
    "Continuar con Apple",
    "Correo electrónico",
    'id="hero-email"',
    ">Continuar<",
    "Te lo volveremos a pedir",
    "Al continuar, aceptas",
    "Aviso de Privacidad",
];

function hrefs(html: string): string[] {
    return Array.from(html.matchAll(/href="([^"]*)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));
}

/** Las <img> de la foto de perfil. */
function fotos(html: string): string[] {
    return Array.from(html.matchAll(/<img[^>]*>/g))
        .map((m) => m[0])
        .filter((img) => img.includes(`src="${FOTO}"`));
}

/** La caja del hero (hero-area-cta), sin el resto de la sección. */
function cajaDelHero(html: string): string {
    const inicio = html.search(/<div[^>]*class="hero-area-cta\b/);
    expect(inicio).toBeGreaterThan(-1);
    const fin = html.indexOf('<div class="absolute bottom-8', inicio);
    return html.slice(inicio, fin === -1 ? undefined : fin);
}

/** Clases de la etiqueta de apertura que casa con `patron`. */
function clasesDe(html: string, patron: RegExp): string[] {
    return (html.match(patron)?.[1] ?? "").split(" ").filter(Boolean).sort();
}

/** Busca en el árbol de elementos el primero del tipo dado. */
function buscar(nodo: ReactNode, tipo: unknown): ReactElement<Record<string, unknown>> | null {
    if (Array.isArray(nodo)) {
        for (const hijo of nodo) {
            const hallado = buscar(hijo, tipo);
            if (hallado) return hallado;
        }
        return null;
    }
    if (!isValidElement<{ children?: ReactNode }>(nodo)) return null;
    if (nodo.type === tipo) return nodo as ReactElement<Record<string, unknown>>;
    return buscar(nodo.props.children, tipo);
}

beforeEach(() => {
    cuentaSimulada = null;
});

describe("hero sin cuenta: el alta de siempre", () => {
    it('sigue "Continuar con Google", el correo y "Continuar", sin nada de la cuenta', () => {
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        const caja = cajaDelHero(html);
        expect(caja).toContain("Continuar con Google");
        expect(caja).toContain("Correo electrónico");
        expect(caja).toMatch(/<input[^>]*id="hero-email"[^>]*type="email"/);
        expect(caja).toMatch(/<button type="submit"[^>]*>Continuar<\/button>/);
        expect(caja).toContain("Aviso de Privacidad");
        expect(html).not.toContain("Acceder");
        expect(html).not.toContain("Cerrar sesión");
        expect(html).not.toContain("Sesión abierta");
        expect(html).not.toContain("Iniciar sesión");
        expect(hrefs(html).filter((h) => h.startsWith(APP))).toEqual([]);
    });

    it("la caja no reserva alto ni cambia de estilo: es la de hoy", () => {
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        const apertura = html.match(/<div[^>]*class="hero-area-cta\b[^>]*>/)?.[0] ?? "";
        expect(apertura).toContain('class="hero-area-cta pointer-events-auto w-full max-w-[400px] font-sans"');
        expect(apertura).not.toContain("min-height");
    });
});

describe("hero con cuenta sin foto", () => {
    it('la caja lleva la cuenta: nombre, iniciales, "Acceder" y "Cerrar sesión"', () => {
        cuentaSimulada = CUENTA;
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        const caja = cajaDelHero(html);
        expect(caja).toContain("Sesión abierta como");
        expect(caja).toContain("Juan Carlos Díaz");
        expect(caja).toContain(">JC<");
        expect(caja).toMatch(new RegExp(`<a href="${DASHBOARD}"[^>]*>Acceder</a>`));
        expect(caja).toContain("Cerrar sesión");
        // En el servidor aún no se sabe el origen (se lee al montar, como en la
        // barra): "Cerrar sesión" va a /auth/salir; con origen, ver CajaCuenta.
        expect(hrefs(caja)).toEqual([DASHBOARD, `${APP}/auth/salir`]);
        expect(fotos(html)).toEqual([]);
    });

    it("nada del alta, ni Iniciar sesión ni Empezar gratis", () => {
        cuentaSimulada = CUENTA;
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        for (const texto of DEL_ALTA) expect(html).not.toContain(texto);
        expect(html).not.toContain("<form");
        expect(html).not.toContain("Iniciar sesión");
        expect(html).not.toContain("Empezar gratis");
        // Lo único hacia la app: el tablero y el cierre de sesión.
        for (const h of hrefs(html).filter((x) => x.startsWith(APP))) {
            expect(h === DASHBOARD || h.startsWith(`${APP}/auth/salir`)).toBe(true);
        }
    });

    it("sin correo ni ids", () => {
        cuentaSimulada = CUENTA;
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        expect(cajaDelHero(html)).not.toContain("@");
        expect(html).not.toContain(CORREO);
        expect(html).not.toContain(ID);
    });

    it('"Acceder" es el mismo botón relleno que "Continuar" del alta, a lo ancho', () => {
        const sin = cajaDelHero(renderToStaticMarkup(createElement(HeroHybrid)));
        cuentaSimulada = CUENTA;
        const con = cajaDelHero(renderToStaticMarkup(createElement(HeroHybrid)));
        const continuar = clasesDe(sin, /<button type="submit" class="([^"]*)"/).filter((c) => c !== "mt-4");
        const acceder = clasesDe(con, new RegExp(`<a href="${DASHBOARD}" class="([^"]*)"`));
        expect(continuar.length).toBeGreaterThan(5);
        expect(acceder).toEqual(continuar);
        expect(acceder).toContain("w-full");
    });

    it("la misma caja: mismo ancho, sin fondo ni borde propios", () => {
        cuentaSimulada = CUENTA;
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        const apertura = html.match(/<div[^>]*class="hero-area-cta\b[^>]*>/)?.[0] ?? "";
        expect(apertura).toContain('class="hero-area-cta pointer-events-auto w-full max-w-[400px] font-sans"');
    });
});

describe("CajaCuenta", () => {
    it('"Cerrar sesión" vuelve a www; "Acceder" va al tablero', () => {
        const html = renderToStaticMarkup(createElement(CajaCuenta, { cuenta: CUENTA, volver: WWW }));
        expect(hrefs(html)).toEqual([DASHBOARD, SALIR]);
        expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    });

    it("el círculo es el Avatar de la barra, en grande (56 px)", () => {
        const arbol = CajaCuenta({ cuenta: CUENTA_CON_FOTO, volver: WWW });
        const avatar = buscar(arbol, Avatar);
        expect(avatar).not.toBeNull();
        expect(avatar?.props.cuenta).toBe(CUENTA_CON_FOTO);
        expect(avatar?.props.lado).toBe(56);
        expect(String(avatar?.props.clase)).toContain("h-14 w-14");
    });
});

describe("hero con cuenta con foto", () => {
    it("la foto en el círculo: decorativa, sin referrer, 56 px y recortada; sin iniciales", () => {
        cuentaSimulada = CUENTA_CON_FOTO;
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        const imgs = fotos(html);
        expect(imgs).toHaveLength(1);
        const [img] = imgs;
        expect(img).toContain('alt=""');
        expect(img).toMatch(/referrerpolicy="no-referrer"/i);
        expect(img).toContain('width="56"');
        expect(img).toContain('height="56"');
        expect(img).toContain("object-cover");
        expect(html).not.toContain(">JC<");
        expect(html).toContain("Juan Carlos Díaz");
        for (const texto of DEL_ALTA) expect(html).not.toContain(texto);
    });

    it("una foto que no pasa el filtro ni llega al hero: iniciales", () => {
        cuentaSimulada = decodificarCuenta(base64url({ n: "Juan", i: "JU", f: "https://evil.example.com/yo.png" }));
        const html = renderToStaticMarkup(createElement(HeroHybrid));
        expect(html).not.toContain("evil.example.com");
        expect(html).toContain(">JU<");
    });
});

describe("si la foto del hero falla al cargar, el círculo cae a las iniciales", () => {
    /* El Avatar recuerda la URL que falló (estado) y se la pasa a AvatarVista;
       sin navegador se prueba AvatarVista con lo mismo que le da el hero. */
    const avatar = buscar(CajaCuenta({ cuenta: CUENTA_CON_FOTO, volver: WWW }), Avatar);
    const props = {
        cuenta: CUENTA_CON_FOTO,
        lado: avatar?.props.lado as number,
        texto: avatar?.props.texto as string,
    };

    it("el onError de la foto avisa con la URL que falló", () => {
        const onFallo = vi.fn();
        const el = AvatarVista({ ...props, fotoFallida: null, onFallo }) as ReactElement<{ onError: () => void; src: string }>;
        expect(el.type).toBe("img");
        expect(el.props.src).toBe(FOTO);
        el.props.onError();
        expect(onFallo).toHaveBeenCalledWith(FOTO);
    });

    it("con la foto rota, las iniciales a tamaño del hero y sin <img>", () => {
        const html = renderToStaticMarkup(createElement(AvatarVista, { ...props, fotoFallida: FOTO, onFallo: () => {} }));
        expect(html).not.toContain("<img");
        expect(html).toContain(">JC<");
        expect(html).toContain(props.texto);
    });
});
