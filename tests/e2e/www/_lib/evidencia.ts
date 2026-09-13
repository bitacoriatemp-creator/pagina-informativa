import path from "path";
import type { Browser, Page, TestInfo } from "@playwright/test";

/**
 * Evidencia por spec: captura de pantalla completa, errores de consola,
 * respuestas 4xx/5xx y hosts externos a los que la pagina pidio algo.
 *
 * Uso:
 *   const ev = registrarEvidencia(page, testInfo);
 *   await page.goto("/planes");
 *   await ev.capturar("planes");
 *   ev.adjuntar();          // deja consola/red en el reporte (html + json)
 *   expect(ev.errores5xx()).toEqual([]);
 *
 * Solo lectura: no toca la pagina, solo escucha.
 */

export type RespuestaRota = { url: string; status: number; metodo: string };
export type MensajeConsola = { tipo: string; texto: string };

export type Evidencia = {
    capturar: (nombre: string) => Promise<string>;
    consola: () => MensajeConsola[];
    erroresConsola: () => MensajeConsola[];
    respuestasRotas: () => RespuestaRota[];
    errores5xx: () => RespuestaRota[];
    hostsExternos: () => string[];
    adjuntar: () => void;
    resumen: () => string;
};

const DIR_CAPTURAS = path.resolve(__dirname, "../../../../test-results/www/capturas");

function hostDe(url: string): string | null {
    try {
        return new URL(url).host;
    } catch {
        return null;
    }
}

export function registrarEvidencia(page: Page, testInfo: TestInfo): Evidencia {
    const consola: MensajeConsola[] = [];
    const rotas: RespuestaRota[] = [];
    const hosts = new Set<string>();
    const hostBase = hostDe(testInfo.project.use.baseURL ?? "http://localhost:3000");

    page.on("console", (msg) => {
        consola.push({ tipo: msg.type(), texto: msg.text() });
    });
    page.on("pageerror", (err) => {
        consola.push({ tipo: "pageerror", texto: err.message });
    });
    page.on("response", (res) => {
        const status = res.status();
        if (status >= 400) {
            rotas.push({ url: res.url(), status, metodo: res.request().method() });
        }
        const host = hostDe(res.url());
        if (host && host !== hostBase) hosts.add(host);
    });

    const proyecto = testInfo.project.name;

    return {
        async capturar(nombre) {
            const archivo = path.join(DIR_CAPTURAS, proyecto, `${nombre}.png`);
            await page.screenshot({ path: archivo, fullPage: true }).catch(() => {});
            await testInfo.attach(`captura-${nombre}`, { path: archivo, contentType: "image/png" }).catch(() => {});
            return archivo;
        },
        consola: () => [...consola],
        erroresConsola: () => consola.filter((m) => m.tipo === "error" || m.tipo === "pageerror"),
        respuestasRotas: () => [...rotas],
        errores5xx: () => rotas.filter((r) => r.status >= 500),
        hostsExternos: () => [...hosts].sort(),
        adjuntar() {
            const cuerpo = {
                consola,
                respuestasRotas: rotas,
                hostsExternos: [...hosts].sort(),
            };
            void testInfo.attach("evidencia", {
                body: JSON.stringify(cuerpo, null, 2),
                contentType: "application/json",
            });
        },
        resumen() {
            const errores = consola.filter((m) => m.tipo === "error" || m.tipo === "pageerror").length;
            return `consola: ${errores} errores | red: ${rotas.length} respuestas >=400 | hosts externos: ${[...hosts].sort().join(", ") || "ninguno"}`;
        },
    };
}

/**
 * Pagina compartida por un describe (una sola carga por ruta y proyecto).
 * `browser.newPage()` a secas ignora el dispositivo del proyecto, asi que se
 * copian del `use` del proyecto las opciones de contexto que importan.
 */
export async function abrirPaginaDelProyecto(browser: Browser, testInfo: TestInfo): Promise<Page> {
    const u = testInfo.project.use;
    return browser.newPage({
        baseURL: u.baseURL,
        viewport: u.viewport ?? undefined,
        userAgent: u.userAgent,
        deviceScaleFactor: u.deviceScaleFactor,
        isMobile: u.isMobile,
        hasTouch: u.hasTouch,
        locale: u.locale,
        ignoreHTTPSErrors: u.ignoreHTTPSErrors,
    });
}
