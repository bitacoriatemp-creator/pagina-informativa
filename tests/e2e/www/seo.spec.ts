import { test, expect, type Page } from "@playwright/test";
import { abrirPaginaDelProyecto, registrarEvidencia } from "./_lib/evidencia";

/**
 * SEO del www, solo lectura: el sitemap que publica el sitio y, por cada URL
 * que lista, la pagina responde 200, tiene exactamente un <h1> en el DOM, su
 * og:image responde 200 y declara canonical. robots.txt sirve.
 *
 * Las rutas se fijan aqui (espejo de src/app/sitemap.ts) porque Playwright
 * necesita los titulos de los tests al recoger el archivo; el primer test
 * descarga /sitemap.xml del baseURL y revienta si la lista publicada dejo de
 * coincidir con esta.
 *
 * Hallazgos conocidos (2026-09-12, contra www.bitacoria.com): 7 paginas sin
 * <h1> y /registro sin og:image. Van marcados con test.fail() para que la
 * spec quede verde hoy y reviente (XPASS) cuando W2 los arregle (h1 con el
 * patron de src/app/planes/page.tsx:52, og:image con el de planes/page.tsx:27).
 */

const RUTAS_SITEMAP = [
    "/",
    "/registro",
    "/planes",
    "/nosotros",
    "/smart-concepts",
    "/smart-log",
    "/smart-calendar",
    "/smart-bim",
    "/smart-island",
    "/el-problema",
    "/alcance-global",
] as const;

type Ruta = (typeof RUTAS_SITEMAP)[number];

/** Paginas sin <h1>: vacio desde W2 (2026-09-13). Las 7 paginas de modulo recibieron
 *  un <h1 className="sr-only"> en su page.tsx (mismo patron que planes/page.tsx:52), asi
 *  que la spec ya afirma el h1 en positivo en todas. Si vuelve a faltar en alguna, este
 *  dict es donde se anota el hallazgo con su archivo:linea. */
const SIN_H1: Partial<Record<Ruta, string>> = {};

/** Paginas sin og:image hoy: `openGraph` declarado sin `images` pisa el default del layout. */
const SIN_OG_IMAGE: Partial<Record<Ruta, string>> = {
    "/registro": "src/app/registro/page.tsx:14 (openGraph sin images; mismo hallazgo que src/app/planes/page.tsx:21, ya arreglado ahi)",
};

/** Lee un atributo sin auto-espera: si el nodo no existe devuelve null al instante. */
function atributo(page: Page, selector: string, nombre: string): Promise<string | null> {
    return page.evaluate(
        ([sel, attr]) => document.querySelector(sel)?.getAttribute(attr) ?? null,
        [selector, nombre] as const,
    );
}

function rutaDe(url: string): string {
    const { pathname } = new URL(url);
    return pathname === "" ? "/" : pathname;
}

test.describe("sitemap y robots", () => {
    test("/sitemap.xml sirve y lista exactamente las rutas esperadas", async ({ request, baseURL }) => {
        const res = await request.get("/sitemap.xml");
        expect(res.status(), `GET ${baseURL}/sitemap.xml`).toBe(200);
        expect(res.headers()["content-type"] ?? "").toMatch(/xml/);
        const xml = await res.text();
        const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
        expect(locs.length, "el sitemap trae al menos una <loc>").toBeGreaterThan(0);
        const rutas = locs.map(rutaDe).sort();
        expect(rutas).toEqual([...RUTAS_SITEMAP].sort());
        // Cada <loc> es una URL absoluta y https.
        for (const loc of locs) expect(loc, `<loc> absoluta: ${loc}`).toMatch(/^https:\/\//);
    });

    test("/robots.txt sirve y apunta al sitemap", async ({ request, baseURL }) => {
        const res = await request.get("/robots.txt");
        expect(res.status(), `GET ${baseURL}/robots.txt`).toBe(200);
        const cuerpo = await res.text();
        expect(cuerpo).toMatch(/^User-agent:/im);
        expect(cuerpo).toMatch(/^Sitemap:\s*https?:\/\/\S+\/sitemap\.xml/im);
    });
});

for (const ruta of RUTAS_SITEMAP) {
    test.describe(`pagina ${ruta}`, () => {
        let page: Page;
        let status = 0;

        test.beforeAll(async ({ browser }, testInfo) => {
            page = await abrirPaginaDelProyecto(browser, testInfo);
            const ev = registrarEvidencia(page, testInfo);
            const res = await page.goto(ruta, { waitUntil: "load" });
            status = res?.status() ?? 0;
            await ev.capturar(ruta === "/" ? "home" : ruta.slice(1));
            ev.adjuntar();
        });

        test.afterAll(async () => {
            await page?.close();
        });

        test("GET responde 200", async () => {
            expect(status, `GET ${ruta}`).toBe(200);
        });

        test("exactamente un <h1> en el DOM", async () => {
            const culpable = SIN_H1[ruta];
            if (culpable) {
                const hallazgo = `Hallazgo W2 (sin <h1>): ${culpable}. Patron a copiar: src/app/planes/page.tsx:52`;
                test.info().annotations.push({ type: "hallazgo", description: hallazgo });
                test.fail(true, hallazgo);
            }
            const h1s = page.locator("h1");
            const n = await h1s.count();
            const textos = await h1s.allTextContents();
            expect(n, `${ruta}: <h1> encontrados = ${n} ${JSON.stringify(textos)}`).toBe(1);
        });

        test("og:image declarado y responde 200", async ({ request }) => {
            const culpable = SIN_OG_IMAGE[ruta];
            if (culpable) {
                const hallazgo = `Hallazgo W2 (sin og:image): ${culpable}`;
                test.info().annotations.push({ type: "hallazgo", description: hallazgo });
                test.fail(true, hallazgo);
            }
            const og = await atributo(page, 'meta[property="og:image"]', "content");
            expect(og, `${ruta}: meta og:image`).toBeTruthy();
            const url = new URL(og as string, page.url()).toString();
            const res = await request.get(url);
            expect(res.status(), `GET og:image ${url}`).toBe(200);
            expect(res.headers()["content-type"] ?? "", `content-type de ${url}`).toMatch(/^image\//);
        });

        test("canonical presente y apunta a esta ruta", async () => {
            const href = await atributo(page, 'link[rel="canonical"]', "href");
            expect(href, `${ruta}: link rel=canonical`).toBeTruthy();
            const canonical = new URL(href as string, page.url());
            expect(canonical.protocol).toBe("https:");
            expect(rutaDe(canonical.toString()), `canonical de ${ruta}`).toBe(ruta);
        });
    });
}
