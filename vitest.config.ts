import { defineConfig } from "vitest/config";

/**
 * Vitest solo recoge las pruebas unitarias de `src/**\/__tests__`.
 *
 * Sin este `include`, vitest usa su patron por defecto (`**\/*.{test,spec}.?(c|m)[jt]s?(x)`)
 * y se traga los `*.spec.ts` de Playwright en `tests/e2e/`, que importan
 * `@playwright/test` y revientan fuera del runner de Playwright.
 */
export default defineConfig({
    test: {
        include: ["src/**/__tests__/**/*.test.ts"],
        exclude: ["tests/**", "node_modules/**"],
    },
});
