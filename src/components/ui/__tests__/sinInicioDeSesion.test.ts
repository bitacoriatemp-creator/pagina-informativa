import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * La landing no tiene "Iniciar sesión" y la barra no enlaza a la app
 * (docs/DECISIONES.md, 2026-09-12).
 *
 * El 9 de septiembre de 2026 se colaron "Iniciar sesión" y "Empezar gratis" en
 * la barra del hero dentro de un PR de "enlaces a la app", y llegaron a
 * producción sin que Luis viera el resultado. Este test es la parte mecánica
 * de la regla: ningún componente importa `loginUrl` ni escribe "Iniciar sesión"
 * como texto visible, y la barra (GlobalNavbar, LogoMenu) no enlaza a la app.
 * `loginUrl()` sigue existiendo en src/lib/appUrl.ts por si la decisión cambia;
 * lo que se prohíbe es usarlo desde la UI.
 *
 * Única excepción (2026-09-23, pedido de JC, pendiente del ok de Luis): con una
 * sesión ya abierta en la app (cookie de aviso `bitacoria_cuenta`), la barra
 * muestra la cuenta (CuentaSesion.tsx): el botón "Acceder" y el círculo con la
 * foto o las iniciales, cuyo menú lleva "Cerrar sesión"; y la caja de alta del
 * hero (HeroHybrid.tsx) se cambia por la de la cuenta: el círculo, "Acceder" y
 * "Cerrar sesión". Son los dos únicos sitios que usan `dashboardUrl` y
 * `salirUrl`. Sigue sin haber entrada para quien no tiene sesión: ni "Iniciar
 * sesión" ni "Empezar gratis" en la barra, y sin sesión el hero sigue con su
 * alta.
 */
const RAIZ = resolve(__dirname, "../../..");
const COMPONENTES = join(RAIZ, "components");
const APP = join(RAIZ, "app");

function archivosTsx(dir: string): string[] {
    const salida: string[] = [];
    for (const nombre of readdirSync(dir)) {
        const ruta = join(dir, nombre);
        if (statSync(ruta).isDirectory()) {
            if (nombre === "__tests__") continue;
            // src/app/dashboard es una maqueta muerta: next.config.mjs la redirige
            // entera a la app (307), asi que nada de lo que diga llega a un cliente.
            if (ruta === join(APP, "dashboard")) continue;
            salida.push(...archivosTsx(ruta));
        } else if (ruta.endsWith(".tsx")) {
            salida.push(ruta);
        }
    }
    return salida;
}

/** Texto sin comentarios: la explicación de la decisión sí puede nombrarla. */
function sinComentarios(fuente: string): string {
    return fuente
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
}

describe("la landing no ofrece inicio de sesión", () => {
    const archivos = [...archivosTsx(COMPONENTES), ...archivosTsx(APP)];

    it("encuentra los componentes (el test no está mirando una carpeta vacía)", () => {
        expect(archivos.length).toBeGreaterThan(10);
        expect(archivos.some((a) => a.endsWith("GlobalNavbar.tsx"))).toBe(true);
        expect(archivos.some((a) => a.endsWith("LogoMenu.tsx"))).toBe(true);
    });

    it("ningún componente importa loginUrl", () => {
        const culpables = archivos.filter((a) => /\bloginUrl\b/.test(sinComentarios(readFileSync(a, "utf8"))));
        expect(culpables.map((a) => a.slice(RAIZ.length + 1))).toEqual([]);
    });

    it('ningún componente muestra "Iniciar sesión"', () => {
        // Con mayúscula: es la etiqueta de un control. La prosa ("...al iniciar
        // sesión desde otro dispositivo") no es un punto de entrada.
        const culpables = archivos.filter((a) => /Iniciar sesi[oó]n/.test(sinComentarios(readFileSync(a, "utf8"))));
        expect(culpables.map((a) => a.slice(RAIZ.length + 1))).toEqual([]);
    });

    it("la barra solo enlaza a la app desde la cuenta abierta: Acceder y Cerrar sesión", () => {
        // Luis quitó también "Empezar gratis" de la barra (2026-09-12): el embudo
        // vive en el hero y en los planes, no en un botón suelto arriba a la derecha.
        // La cuenta de la barra (2026-09-23: botón "Acceder" + círculo con su
        // menú) solo sale con sesión abierta y solo usa dashboardUrl ("Acceder")
        // y salirUrl ("Cerrar sesión"). GlobalNavbar y LogoMenu siguen sin tocar
        // appUrl.
        const barra = archivos.filter((a) => /GlobalNavbar\.tsx$|LogoMenu\.tsx$|CuentaSesion\.tsx$/.test(a));
        expect(barra).toHaveLength(3);
        const culpables: string[] = [];
        for (const a of barra) {
            const nombre = a.slice(RAIZ.length + 1);
            const fuente = sinComentarios(readFileSync(a, "utf8"));
            if (/app\.bitacoria\.com|\/auth|Empezar gratis|registerUrl/.test(fuente)) culpables.push(nombre);
            if (!/@\/lib\/appUrl/.test(fuente)) continue;
            if (!a.endsWith("CuentaSesion.tsx")) {
                culpables.push(`${nombre}: importa appUrl`);
                continue;
            }
            const imports = Array.from(fuente.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/appUrl["']/g));
            const nombres = imports.flatMap((m) => m[1].split(",").map((n) => n.trim()).filter(Boolean)).sort();
            if (imports.length !== 1 || nombres.join(",") !== "dashboardUrl,salirUrl") {
                culpables.push(`${nombre}: importa ${nombres.join(", ") || "appUrl sin nombres"}`);
            }
        }
        expect(culpables).toEqual([]);
    });

    it("Acceder y Cerrar sesión (dashboardUrl, salirUrl) solo desde la cuenta abierta: CuentaSesion y el hero", () => {
        // 2026-09-23: con sesión abierta, el hero (HeroHybrid) cambia su caja de
        // alta por la de la cuenta, con "Acceder" y "Cerrar sesión". Ningún otro
        // componente enlaza al tablero ni al cierre de sesión.
        const permitidos = /(?:^|[\\/])(?:CuentaSesion|HeroHybrid)\.tsx$/;
        const usan = archivos.filter((a) => /\b(?:dashboardUrl|salirUrl)\b/.test(sinComentarios(readFileSync(a, "utf8"))));
        const culpables = usan.filter((a) => !permitidos.test(a));
        expect(culpables.map((a) => a.slice(RAIZ.length + 1))).toEqual([]);
    });

    it("el hero solo toma de appUrl el alta y, con cuenta, Acceder y Cerrar sesión", () => {
        const [hero] = archivos.filter((a) => a.endsWith("HeroHybrid.tsx"));
        expect(hero).toBeDefined();
        const fuente = sinComentarios(readFileSync(hero, "utf8"));
        const imports = Array.from(fuente.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/appUrl["']/g));
        const nombres = imports.flatMap((m) => m[1].split(",").map((n) => n.trim()).filter(Boolean)).sort();
        expect(imports).toHaveLength(1);
        expect(nombres).toEqual(["dashboardUrl", "registerUrl", "salirUrl"]);
        expect(fuente).not.toMatch(/app\.bitacoria\.com|Empezar gratis/);
    });

    it("ningún componente enlaza a /auth sin mode=register", () => {
        const culpables: string[] = [];
        for (const a of archivos) {
            const fuente = sinComentarios(readFileSync(a, "utf8"));
            // Array.from: el target del tsconfig no itera iteradores con for...of.
            for (const m of Array.from(fuente.matchAll(/["'`][^"'`]*\/auth(\?[^"'`]*)?["'`]/g))) {
                const query = m[1] ?? "";
                if (!/mode=register/.test(query)) culpables.push(`${a.slice(RAIZ.length + 1)}: ${m[0]}`);
            }
        }
        expect(culpables).toEqual([]);
    });
});
