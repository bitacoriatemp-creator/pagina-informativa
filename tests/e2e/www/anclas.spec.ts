import { test, expect } from "@playwright/test";
import { registrarEvidencia } from "./_lib/evidencia";

/**
 * Anclas internas de las paginas de modulo, solo lectura: cada <a href="#...">
 * de la pagina apunta a un id que existe EN ESA MISMA pagina. Un ancla a una
 * seccion que vive en otra ruta no lleva a ningun lado (el navegador no
 * cambia de pagina, solo deja al visitante donde estaba).
 *
 * Hallazgos conocidos (2026-09-12, contra www.bitacoria.com): los tres
 * "Ver siguiente modulo" apuntan a ids que ya no viven en su pagina desde que
 * cada modulo tiene ruta propia. Marcados con test.fail() para que la spec
 * quede verde hoy y reviente (XPASS) cuando W3 los arregle (decision de
 * producto: el enlace deberia ir a la pagina del modulo siguiente).
 */

const PAGINAS = ["/smart-concepts", "/smart-log", "/smart-calendar"] as const;

type Pagina = (typeof PAGINAS)[number];

/** Anclas rotas hoy: pagina -> href roto y archivo:linea culpable. */
const ANCLAS_ROTAS: Record<Pagina, string> = {
    "/smart-concepts":
        '"Ver siguiente modulo" href="#bitacora" en src/components/ui/SmartConceptsSection.tsx:105; id="bitacora" vive en src/components/ui/BitacoraSection.tsx:27 (/smart-log)',
    "/smart-log":
        '"Ver siguiente modulo" href="#smart-calendar" en src/components/ui/BitacoraSection.tsx:95; id="smart-calendar" vive en src/components/ui/CronogramaSection.tsx:24 (/smart-calendar)',
    "/smart-calendar":
        '"Ver siguiente modulo" href="#bim-sync" en src/components/ui/CronogramaSection.tsx:93; id="bim-sync" vive en src/components/ui/SmartBimSyncSection.tsx:268 (/smart-bim)',
};

for (const pagina of PAGINAS) {
    test(`${pagina}: cada <a href="#..."> apunta a un id de esta misma pagina`, async ({ page }, testInfo) => {
        const hallazgo = `Hallazgo W3 (ancla rota): ${ANCLAS_ROTAS[pagina]}`;
        testInfo.annotations.push({ type: "hallazgo", description: hallazgo });
        test.fail(true, hallazgo);

        const ev = registrarEvidencia(page, testInfo);
        const res = await page.goto(pagina, { waitUntil: "load" });
        expect(res?.status(), `GET ${pagina}`).toBe(200);

        const anclas = await page.locator('a[href^="#"]').evaluateAll((nodos) =>
            nodos.map((a) => ({
                href: a.getAttribute("href") ?? "",
                texto: (a.textContent ?? "").replace(/\s+/g, " ").trim(),
            })),
        );
        const ids = new Set(
            await page.locator("[id]").evaluateAll((nodos) => nodos.map((n) => n.id).filter(Boolean)),
        );

        const rotas = anclas.filter(({ href }) => !ids.has(decodeURIComponent(href.slice(1))));
        await ev.capturar(`anclas${pagina.replace(/\//g, "-")}`);
        ev.adjuntar();

        expect(
            rotas,
            `${pagina}: anclas sin destino en esta pagina -> ${rotas.map((r) => `${r.href} ("${r.texto}")`).join(", ") || "ninguna"}`,
        ).toEqual([]);
    });
}
