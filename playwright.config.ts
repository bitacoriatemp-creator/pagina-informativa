import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright del www (tests/e2e/www). Fuera del CI de `main` a proposito:
 * las specs son de solo lectura contra la pagina publicada y corren en
 * `.github/workflows/ataque-www.yml` (a mano o programado), no en `quality`.
 *
 * Correr:
 *   npx playwright install chromium        # una vez
 *   npm run test:e2e                       # contra http://localhost:3000 (npm run dev aparte)
 *   npm run test:e2e:prod                  # contra https://www.bitacoria.com, un worker
 *
 * Dos proyectos: escritorio (Chromium 1440x900) y movil (Pixel 5). Un solo
 * worker y un reintento porque el objetivo es una pagina publicada, no un
 * servidor local: nada de paralelismo contra produccion.
 */
export default defineConfig({
    testDir: "./tests/e2e",
    timeout: 60_000,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 1,
    workers: 1,
    reporter: [
        ["list"],
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/www/reporte.json" }],
    ],
    use: {
        baseURL: process.env.WWW_BASE_URL ?? "http://localhost:3000",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "www-desktop",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: "www-mobile",
            use: { ...devices["Pixel 5"] },
        },
    ],
});
