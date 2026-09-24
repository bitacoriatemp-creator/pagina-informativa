import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CUENTA_MAX_BYTES, codificarCuenta, decodificarCuenta, type Cuenta } from "@/lib/cuenta";
import { AvatarVista, BotonAcceder, CuentaBarra, CuentaCirculo, CuentaFilaMovil } from "../CuentaSesion";
import GlobalNavbar from "../GlobalNavbar";

/**
 * La barra con y sin sesión abierta en la app.
 *
 * Sin la cookie de aviso, la barra es la de siempre: nada de la app. Con ella,
 * la barra lleva un botón "Acceder" (tablero) a la vista y un círculo de cuenta
 * (la foto, o las iniciales si no hay foto o no carga) cuyo menú dice "Sesión
 * abierta como <nombre>" y ofrece "Cerrar sesión" (/auth/salir con vuelta a
 * www). Nada de "Iniciar sesión" ni "Empezar gratis", y ni correo ni ids.
 *
 * Se renderiza en el servidor (sin navegador): la cookie se lee tras montar,
 * así que para la barra entera se sustituye `useCuenta` por la cuenta de cada
 * prueba, y `usePathname` por la ruta (la home coloca la cuenta distinto).
 */

let cuentaSimulada: Cuenta | null = null;
vi.mock("@/hooks/useCuenta", () => ({ useCuenta: () => cuentaSimulada }));

let rutaSimulada = "/planes";
vi.mock("next/navigation", () => ({ usePathname: () => rutaSimulada }));

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

function hrefs(html: string): string[] {
    return Array.from(html.matchAll(/href="([^"]*)"/g)).map((m) => m[1].replace(/&amp;/g, "&"));
}

/** Contenido de cada role="menu" (sus opciones no llevan <div> dentro). */
function menus(html: string): string[] {
    return Array.from(html.matchAll(/<div[^>]*role="menu"[^>]*>([\s\S]*?)<\/div>/g)).map((m) => m[1]);
}

/** Las <img> de la foto de perfil (el logo también es <img>, pero no de Google). */
function fotos(html: string): string[] {
    return Array.from(html.matchAll(/<img[^>]*>/g))
        .map((m) => m[0])
        .filter((img) => img.includes(`src="${FOTO}"`));
}

const desescapar = (html: string) => html.replace(/&amp;/g, "&");

/** Las clases de cada enlace "Acceder" (al tablero). */
function clasesAcceder(html: string): string[][] {
    return Array.from(html.matchAll(new RegExp(`<a href="${DASHBOARD}" class="([^"]*)"`, "g"))).map((m) =>
        m[1].split(" "),
    );
}

/** Clase que esconde en algún ancho: hidden, invisible o sr-only, con o sin
    variante (max-sm:hidden, max-[639px]:invisible...). */
const esconde = (clase: string) => /(^|:)(hidden|invisible|sr-only)$/.test(clase);

/** Clases de la fila de cada barra (el primer <div> de cada <nav>) y del logo. */
function barras(html: string): { fila: string[]; logo: string[] }[] {
    return html
        .split("<nav")
        .slice(1)
        .filter((t) => t.includes('aria-label="BitacorIA'))
        .map((t) => ({
            fila: t.match(/<div class="([^"]*)"/)?.[1].split(" ") ?? [],
            logo: t.match(/<img[^>]*alt="BitacorIA"[^>]*class="([^"]*)"/)?.[1].split(" ") ?? [],
        }));
}

/** Los dos menús hamburguesa (hero y barra delgada) en el código de la barra. */
function menusHamburguesa(): string[] {
    const fuente = readFileSync(join(__dirname, "..", "GlobalNavbar.tsx"), "utf8");
    return fuente.split(/\{\/\* MOBILE DROPDOWN/).slice(1).map((t) => t.split("</motion.nav>")[0]);
}

beforeEach(() => {
    cuentaSimulada = null;
    rutaSimulada = "/planes";
});

describe("CuentaCirculo sin foto", () => {
    const html = renderToStaticMarkup(createElement(CuentaCirculo, { cuenta: CUENTA, volver: WWW }));

    it("las iniciales en el círculo, sin <img>", () => {
        expect(html).toContain(">JC<");
        expect(html).not.toContain("<img");
    });

    it("botón de menú accesible que etiqueta al menú", () => {
        expect(html).toMatch(/<button[^>]*aria-haspopup="menu"/);
        expect(html).toMatch(/<button[^>]*aria-expanded="false"/);
        expect(html).toMatch(/<button[^>]*aria-label="Cuenta de Juan Carlos Díaz"/);
        const idBoton = html.match(/<button[^>]*\bid="([^"]+)"/)?.[1];
        const controla = html.match(/<button[^>]*aria-controls="([^"]+)"/)?.[1];
        expect(idBoton).toBeTruthy();
        expect(html).toMatch(new RegExp(`<div[^>]*id="${controla}"[^>]*role="menu"[^>]*aria-labelledby="${idBoton}"`));
    });

    it('menú pequeño: "Sesión abierta como <nombre>" y una sola opción, Cerrar sesión', () => {
        expect(html).toContain("Sesión abierta como");
        expect(html).toContain("Juan Carlos Díaz");
        const [menu] = menus(html);
        expect(Array.from(menu.matchAll(/role="menuitem"/g))).toHaveLength(1);
        expect(menu).toContain("Cerrar sesión");
        expect(hrefs(menu)).toEqual([SALIR]);
        // "Acceder" no vive en el menú: es el botón de la barra.
        expect(html).not.toContain("Acceder");
        expect(hrefs(html)).toEqual([SALIR]);
    });

    it("cerrado, el menú está apagado (invisible) y no se enfoca", () => {
        expect(html).toMatch(/class="[^"]*\binvisible\b[^"]*"/);
        expect(html).toMatch(/role="menuitem" tabindex="-1"/);
    });

    it("iniciales en blanco sobre café oscuro (4.8:1), no sobre el café claro (2.6:1)", () => {
        const circulo = html.match(/<span[^>]*aria-hidden="true"[^>]*>JC<\/span>/)?.[0] ?? "";
        expect(circulo).toContain("text-white");
        expect(circulo.toLowerCase()).toContain("background:#8b6d3f");
        expect(circulo).not.toContain("bg-[#c39767]");
    });

    it("sin correo ni ids", () => {
        expect(html).not.toContain("@");
        expect(html).not.toContain(CORREO);
        expect(html).not.toContain(ID);
    });
});

describe("CuentaCirculo con foto", () => {
    it("la foto en el círculo: decorativa, sin referrer, de tamaño fijo y recortada", () => {
        const html = renderToStaticMarkup(createElement(CuentaCirculo, { cuenta: CUENTA_CON_FOTO, volver: WWW }));
        const [img] = fotos(html);
        expect(img).toBeDefined();
        expect(img).toContain('alt=""');
        expect(img).toMatch(/referrerpolicy="no-referrer"/i);
        expect(img).toContain('width="36"');
        expect(img).toContain('height="36"');
        expect(img).toContain("object-cover");
        // Con foto no se pintan las iniciales, y el nombre sigue en el botón.
        expect(html).not.toContain(">JC<");
        expect(html).toMatch(/<button[^>]*aria-label="Cuenta de Juan Carlos Díaz"/);
    });

    it("en la barra delgada, 32 px", () => {
        const html = renderToStaticMarkup(
            createElement(CuentaCirculo, { cuenta: CUENTA_CON_FOTO, volver: WWW, variant: "slim" }),
        );
        expect(fotos(html)[0]).toContain('width="32"');
    });

    it("una foto que no es https de un host permitido ni llega a la barra", () => {
        const cuenta = decodificarCuenta(base64url({ n: "Juan", i: "JU", f: "https://evil.example.com/yo.png" })) as Cuenta;
        const html = renderToStaticMarkup(createElement(CuentaCirculo, { cuenta, volver: WWW }));
        expect(html).not.toContain("<img");
        expect(html).not.toContain("evil.example.com");
        expect(html).toContain(">JU<");
    });
});

describe("si la foto falla al cargar, el círculo cae a las iniciales", () => {
    const base = { cuenta: CUENTA_CON_FOTO, lado: 36, texto: "text-[12px]" };

    it("el onError de la <img> avisa con la URL que falló", () => {
        const onFallo = vi.fn();
        const el = AvatarVista({ ...base, fotoFallida: null, onFallo }) as ReactElement<{ onError: () => void; src: string }>;
        expect(isValidElement(el)).toBe(true);
        expect(el.type).toBe("img");
        expect(el.props.src).toBe(FOTO);
        el.props.onError();
        expect(onFallo).toHaveBeenCalledWith(FOTO);
    });

    it("con esa URL marcada como fallida, pinta las iniciales y no vuelve a pedirla", () => {
        const html = renderToStaticMarkup(createElement(AvatarVista, { ...base, fotoFallida: FOTO, onFallo: () => {} }));
        expect(html).not.toContain("<img");
        expect(html).toContain(">JC<");
    });

    it("si la cookie trae otra foto, se intenta con la nueva", () => {
        const html = renderToStaticMarkup(
            createElement(AvatarVista, { ...base, fotoFallida: "https://lh3.googleusercontent.com/a/vieja", onFallo: () => {} }),
        );
        expect(fotos(html)).toHaveLength(1);
    });
});

describe("BotonAcceder", () => {
    const html = renderToStaticMarkup(createElement(BotonAcceder));

    it("va al tablero y es el botón primario de la barra (café de marca)", () => {
        expect(hrefs(html)).toEqual([DASHBOARD]);
        expect(html).toContain(">Acceder<");
        expect(html.toLowerCase()).toContain("background:#c39767");
        expect(html.toLowerCase()).toContain("color:#1a120c");
        expect(html).toContain("rounded-full");
    });
});

describe("CuentaBarra", () => {
    const html = renderToStaticMarkup(createElement(CuentaBarra, { cuenta: CUENTA, volver: WWW }));

    it('"Acceder" a la vista, fuera del menú, y antes del círculo', () => {
        const acceder = html.indexOf(`href="${DASHBOARD}"`);
        const circulo = html.indexOf('aria-label="Cuenta de Juan Carlos Díaz"');
        expect(acceder).toBeGreaterThan(-1);
        expect(acceder).toBeLessThan(circulo);
        for (const menu of menus(html)) expect(menu).not.toContain(DASHBOARD);
    });

    it('en teléfonos "Acceder" también está en la barra: compacto, no escondido', () => {
        for (const variant of ["pill", "slim"] as const) {
            const barra = renderToStaticMarkup(createElement(CuentaBarra, { cuenta: CUENTA, volver: WWW, variant }));
            const acceder = clasesAcceder(barra);
            expect(acceder).toHaveLength(1);
            const [clases] = acceder;
            expect(clases).toContain("inline-flex");
            expect(clases.filter(esconde)).toEqual([]);
            expect(clases.some((c) => c.startsWith("sm:inline"))).toBe(false);
            // Compacto por debajo de sm: 32 px de alto, menos relleno y 11 px de letra.
            expect(clases).toEqual(expect.arrayContaining(["h-8", "px-3", "text-[11px]", "sm:text-xs"]));
            // El par tampoco se esconde, y en teléfonos va más junto.
            const par = barra.match(/^<div class="([^"]*)"/)?.[1].split(" ") ?? [];
            expect(par.filter(esconde)).toEqual([]);
            expect(par).toEqual(expect.arrayContaining(["gap-2", "sm:gap-2.5"]));
        }
        // De sm en adelante, el tamaño de siempre.
        expect(clasesAcceder(html)[0]).toEqual(expect.arrayContaining(["sm:h-9", "sm:px-4"]));
    });

    it("en teléfonos el círculo del hero baja a 32 px (el de la barra delgada ya lo es)", () => {
        const boton = (variant: "pill" | "slim") =>
            renderToStaticMarkup(createElement(CuentaBarra, { cuenta: CUENTA, volver: WWW, variant }))
                .match(/<button[^>]*class="([^"]*)"/)?.[1].split(" ") ?? [];
        expect(boton("pill")).toEqual(expect.arrayContaining(["h-8", "w-8", "sm:h-9", "sm:w-9"]));
        expect(boton("slim")).toEqual(expect.arrayContaining(["h-8", "w-8"]));
        expect(boton("slim")).not.toContain("sm:h-9");
    });

    it("Cerrar sesión solo dentro del menú del círculo", () => {
        expect(hrefs(html).filter((h) => h.includes("/auth/salir"))).toEqual([SALIR]);
        expect(hrefs(menus(html).join(""))).toEqual([SALIR]);
    });
});

describe("CuentaFilaMovil", () => {
    it('cabecera con el círculo y "Sesión abierta como", y Cerrar sesión; Acceder no se repite', () => {
        const html = renderToStaticMarkup(createElement(CuentaFilaMovil, { cuenta: CUENTA, volver: WWW }));
        expect(html).toContain("Sesión abierta como");
        expect(html).toContain("Juan Carlos Díaz");
        expect(html).toContain(">JC<");
        expect(html).toContain("Cerrar sesión");
        expect(hrefs(html)).toEqual([SALIR]);
        // "Acceder" ya está en la barra, junto a la hamburguesa, en todos los anchos.
        expect(html).not.toContain("Acceder");
        expect(html).not.toContain(DASHBOARD);
        expect(html).not.toContain(CORREO);
        expect(html).not.toContain(ID);
    });

    it("el círculo del menú no se compacta: 36 px en todos los anchos", () => {
        const html = renderToStaticMarkup(createElement(CuentaFilaMovil, { cuenta: CUENTA_CON_FOTO, volver: WWW }));
        expect(fotos(html)[0]).toContain('width="36"');
        const circulo = html.match(/<span class="([^"]*\brounded-full\b[^"]*)"/)?.[1].split(" ") ?? [];
        expect(circulo).toEqual(expect.arrayContaining(["h-9", "w-9"]));
        expect(circulo).not.toContain("h-8");
    });

    it("con foto, la foto en la cabecera", () => {
        const html = renderToStaticMarkup(createElement(CuentaFilaMovil, { cuenta: CUENTA_CON_FOTO, volver: WWW }));
        expect(fotos(html)).toHaveLength(1);
        expect(fotos(html)[0]).toContain('alt=""');
        expect(html).not.toContain(">JC<");
    });

    it("el margen lateral va en cada fila, no en el contenedor: las líneas cruzan el panel", () => {
        const movil = renderToStaticMarkup(createElement(CuentaFilaMovil, { cuenta: CUENTA, volver: WWW, px: "px-5" }));
        const contenedor = movil.match(/^<div class="([^"]*)"/)?.[1].split(" ") ?? [];
        expect(contenedor).not.toContain("px-5");
        const salir = movil.match(/<a href="[^"]*\/auth\/salir[^"]*" class="([^"]*)"/)?.[1].split(" ") ?? [];
        expect(salir).toContain("px-5");
        const filas = Array.from(movil.matchAll(/<div class="([^"]*)"/g)).slice(1).map((m) => m[1].split(" "));
        expect(filas).toHaveLength(1);
        for (const clases of filas) expect(clases).toContain("px-5");
    });

    /* El menú hamburguesa solo se pinta abierto (tras un clic) y aquí no hay
       navegador: se comprueba en el código que los dos menús (hero y barra
       delgada) llevan este bloque con la cuenta, y arriba, lo que pinta. */
    it("los dos menús hamburguesa, con cuenta, llevan este bloque (y con él Cerrar sesión)", () => {
        const menusH = menusHamburguesa();
        expect(menusH).toHaveLength(2);
        for (const menu of menusH) {
            expect(menu).toMatch(/\{cuenta && <CuentaFilaMovil cuenta=\{cuenta\} volver=\{origen\}/);
            expect(menu).not.toContain("BotonAcceder");
            expect(menu).not.toContain("dashboardUrl");
        }
    });
});

describe("GlobalNavbar", () => {
    it("sin cuenta: ni círculo, ni Acceder, ni enlaces a la app", () => {
        const html = renderToStaticMarkup(createElement(GlobalNavbar));
        expect(html).not.toContain("Acceder");
        expect(html).not.toContain("Cerrar sesión");
        expect(html).not.toContain("Sesión abierta");
        expect(html).not.toContain('aria-haspopup="menu"');
        expect(hrefs(html).filter((h) => h.startsWith(APP))).toEqual([]);
        expect(html).not.toContain("Iniciar sesión");
        expect(html).not.toContain("Empezar gratis");
    });

    it("sin cuenta, la barra queda exactamente como antes: mismo hueco y mismo logo en todos los anchos", () => {
        for (const ruta of ["/", "/planes"]) {
            rutaSimulada = ruta;
            const [hero, slim] = barras(renderToStaticMarkup(createElement(GlobalNavbar)));
            expect(hero.fila).toContain("gap-3");
            expect(hero.fila).not.toContain("gap-2");
            expect(hero.fila.some((c) => c.startsWith("sm:gap"))).toBe(false);
            expect(hero.logo.filter((c) => c.startsWith("w-") || c.includes(":w-"))).toEqual(["w-36", "lg:w-44"]);
            expect(slim.fila).toContain("gap-3");
            expect(slim.logo.filter((c) => c.startsWith("w-") || c.includes(":w-"))).toEqual(["w-20", "lg:w-24"]);
        }
    });

    it('con cuenta, en teléfonos "Acceder" está en las dos barras (no escondido) y va al tablero', () => {
        cuentaSimulada = CUENTA;
        for (const ruta of ["/", "/planes"]) {
            rutaSimulada = ruta;
            const html = renderToStaticMarkup(createElement(GlobalNavbar));
            const acceder = clasesAcceder(html);
            expect(acceder).toHaveLength(2);
            for (const clases of acceder) {
                expect(clases).toContain("inline-flex");
                expect(clases.filter(esconde)).toEqual([]);
                expect(clases.some((c) => c.startsWith("sm:inline"))).toBe(false);
                expect(clases).toEqual(expect.arrayContaining(["h-8", "text-[11px]"]));
            }
            // Ni el par que lo envuelve se esconde en teléfonos.
            const pares = Array.from(html.matchAll(new RegExp(`<div class="([^"]*)"><a href="${DASHBOARD}"`, "g")));
            expect(pares).toHaveLength(2);
            for (const [, clases] of pares) expect(clases.split(" ").filter(esconde)).toEqual([]);
        }
    });

    it("con cuenta, en teléfonos la fila se junta y el logo del hero baja a 96 px solo por debajo de 360 px", () => {
        cuentaSimulada = CUENTA;
        for (const ruta of ["/", "/planes"]) {
            rutaSimulada = ruta;
            const [hero, slim] = barras(renderToStaticMarkup(createElement(GlobalNavbar)));
            expect(hero.fila).toEqual(expect.arrayContaining(["gap-2", "sm:gap-3"]));
            expect(hero.logo).toEqual(expect.arrayContaining(["w-36", "lg:w-44", "max-[359px]:w-24"]));
            // La barra delgada ya cabe con su logo de 80 px: no cambia.
            expect(slim.logo.filter((c) => c.startsWith("w-") || c.includes(":w-"))).toEqual(["w-20", "lg:w-24"]);
            expect(slim.fila).toContain("gap-3");
        }
    });

    it("con cuenta sin foto: Acceder y el círculo con iniciales en las dos barras", () => {
        cuentaSimulada = CUENTA;
        const html = renderToStaticMarkup(createElement(GlobalNavbar));
        // Las dos barras (hero y delgada) llevan su círculo y su Acceder.
        expect(Array.from(html.matchAll(/aria-label="Cuenta de Juan Carlos Díaz"/g))).toHaveLength(2);
        expect(Array.from(html.matchAll(/>JC</g))).toHaveLength(2);
        expect(fotos(html)).toEqual([]);
        expect(hrefs(html).filter((h) => h === DASHBOARD)).toHaveLength(2);
        // Cerrar sesión, solo dentro del menú de cada círculo.
        const salidas = hrefs(html).filter((h) => h.startsWith(`${APP}/auth/salir`));
        expect(salidas).toHaveLength(2);
        expect(hrefs(menus(html).join("")).filter((h) => h.startsWith(`${APP}/auth/salir`))).toHaveLength(2);
        // El nombre ya no va en la barra (va en el menú del círculo).
        expect(html).not.toContain(">Juan<");
    });

    it("con cuenta con foto: la foto en las dos barras, sin iniciales a la vista", () => {
        cuentaSimulada = CUENTA_CON_FOTO;
        const html = renderToStaticMarkup(createElement(GlobalNavbar));
        const imgs = fotos(html);
        expect(imgs).toHaveLength(2);
        for (const img of imgs) {
            expect(img).toContain('alt=""');
            expect(img).toMatch(/referrerpolicy="no-referrer"/i);
        }
        expect(html).not.toContain(">JC<");
        expect(hrefs(html).filter((h) => h === DASHBOARD)).toHaveLength(2);
    });

    it("con cuenta, lo único hacia la app es Acceder y Cerrar sesión; nada de Iniciar sesión ni Empezar gratis", () => {
        for (const cuenta of [CUENTA, CUENTA_CON_FOTO]) {
            for (const ruta of ["/", "/planes"]) {
                cuentaSimulada = cuenta;
                rutaSimulada = ruta;
                const html = renderToStaticMarkup(createElement(GlobalNavbar));
                const haciaLaApp = hrefs(html).filter((h) => h.startsWith(APP));
                expect(haciaLaApp.length).toBeGreaterThan(0);
                for (const h of haciaLaApp) {
                    expect(h === DASHBOARD || h.startsWith(`${APP}/auth/salir`)).toBe(true);
                }
                expect(html).not.toContain("Iniciar sesión");
                expect(html).not.toContain("Empezar gratis");
                expect(html).not.toContain(CORREO);
                expect(html).not.toContain(ID);
            }
        }
    });

    it("en la home la cuenta va a la izquierda del logo, algo separada de él", () => {
        cuentaSimulada = CUENTA;
        rutaSimulada = "/";
        const html = desescapar(renderToStaticMarkup(createElement(GlobalNavbar)));
        const [heroBar] = html.split("<nav").filter((t) => t.includes("aria-label=\"BitacorIA"));
        const acceder = heroBar.indexOf(`href="${DASHBOARD}"`);
        const logo = heroBar.indexOf('aria-label="BitacorIA');
        expect(acceder).toBeGreaterThan(-1);
        expect(acceder).toBeLessThan(logo);
        expect(heroBar).toMatch(/<div class="[^"]*\blg:mr-3\b[^"]*"><a href="https:\/\/app\.bitacoria\.com\/dashboard"/);
    });

    it("en las demás páginas va al otro extremo, después del logo", () => {
        cuentaSimulada = CUENTA;
        rutaSimulada = "/planes";
        const html = desescapar(renderToStaticMarkup(createElement(GlobalNavbar)));
        const [heroBar] = html.split("<nav").filter((t) => t.includes("aria-label=\"BitacorIA"));
        expect(heroBar.indexOf('aria-label="BitacorIA')).toBeLessThan(heroBar.indexOf(`href="${DASHBOARD}"`));
        expect(heroBar).toMatch(/<div class="[^"]*\bml-auto\b[^"]*"><a href="https:\/\/app\.bitacoria\.com\/dashboard"/);
    });

    /* Contrato con la app: estos literales son exactamente lo que escribe su
       codificarCuenta (frontend-bitacoria fija los MISMOS en
       src/lib/__tests__/cuentaCookie.test.ts, con el mismo tope de 700 bytes).
       Si uno de los dos lados cambia el formato, falla aquí o allí. */
    it("el tope de la cookie es el mismo de la app: 700 bytes", () => {
        expect(CUENTA_MAX_BYTES).toBe(700);
    });

    it.each([
        ["eyJuIjoiSnVhbiIsImkiOiJKVSJ9", { nombre: "Juan", iniciales: "JU" }],
        ["eyJuIjoiSm9zw6kgUMOpcmV6IE7DusOxZXoiLCJpIjoiSlAifQ", { nombre: "José Pérez Núñez", iniciales: "JP" }],
        [
            "eyJuIjoiSnVhbiIsImkiOiJKVSIsImYiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9mb3RvLWRlLXBydWViYSJ9",
            { nombre: "Juan", iniciales: "JU", foto: "https://lh3.googleusercontent.com/a/foto-de-prueba" },
        ],
        [
            // {"n":"Ana Ruiz","i":"AR","f":"https://lh3.googleusercontent.com/a/ACg8ocJ-BitacorIA_prueba=s96-c"}
            "eyJuIjoiQW5hIFJ1aXoiLCJpIjoiQVIiLCJmIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSi1CaXRhY29ySUFfcHJ1ZWJhPXM5Ni1jIn0",
            { nombre: "Ana Ruiz", iniciales: "AR", foto: "https://lh3.googleusercontent.com/a/ACg8ocJ-BitacorIA_prueba=s96-c" },
        ],
    ])("lee el valor literal que escribe la app: %s", (literal, cuenta) => {
        expect(decodificarCuenta(literal)).toStrictEqual(cuenta);
        expect(codificarCuenta(cuenta)).toBe(literal);
    });

    it("una foto de un host no permitido se descarta: al leer queda la cuenta sin foto y al escribir no viaja", () => {
        // {"n":"Ana Ruiz","i":"AR","f":"https://cdn.evil.example/ana.png"}
        const falsificada =
            "eyJuIjoiQW5hIFJ1aXoiLCJpIjoiQVIiLCJmIjoiaHR0cHM6Ly9jZG4uZXZpbC5leGFtcGxlL2FuYS5wbmcifQ";
        expect(decodificarCuenta(falsificada)).toStrictEqual({ nombre: "Ana Ruiz", iniciales: "AR" });

        // {"n":"Ana Ruiz","i":"AR"}
        expect(codificarCuenta({ nombre: "Ana Ruiz", iniciales: "AR", foto: "https://cdn.evil.example/ana.png" })).toBe(
            "eyJuIjoiQW5hIFJ1aXoiLCJpIjoiQVIifQ",
        );
    });
});
