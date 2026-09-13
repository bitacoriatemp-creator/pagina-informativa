import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * La landing no tiene "Iniciar sesión" (docs/DECISIONES.md, 2026-09-12).
 *
 * El 9 de septiembre de 2026 se coló un enlace de inicio de sesión en la barra
 * del hero dentro de un PR de "enlaces a la app", y llegó a producción sin que
 * Luis viera el resultado. Este test es la parte mecánica de la regla: ningún
 * componente importa `loginUrl` ni escribe "Iniciar sesión" como texto visible.
 * `loginUrl()` sigue existiendo en src/lib/appUrl.ts por si la decisión cambia;
 * lo que se prohíbe es usarlo desde la UI.
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
