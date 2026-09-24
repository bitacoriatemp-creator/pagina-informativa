import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest solo recoge las pruebas unitarias de `src/**\/__tests__`.
 *
 * Sin este `include`, vitest usa su patron por defecto (`**\/*.{test,spec}.?(c|m)[jt]s?(x)`)
 * y se traga los `*.spec.ts` de Playwright en `tests/e2e/`, que importan
 * `@playwright/test` y revientan fuera del runner de Playwright.
 *
 * El alias "@" es el mismo de tsconfig.json (paths): las pruebas de la barra
 * importan componentes que a su vez importan "@/lib/...".
 */
export default defineConfig({
    resolve: {
        alias: { "@": resolve(__dirname, "src") },
    },
    // tsconfig.json dice jsx: "preserve" (lo compila Next); aqui el JSX de los
    // componentes se transforma con el runtime automatico de React.
    oxc: {
        jsx: { runtime: "automatic", importSource: "react" },
    },
    test: {
        include: ["src/**/__tests__/**/*.test.ts"],
        exclude: ["tests/**", "node_modules/**"],
    },
});
