import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it, vi, beforeEach } from "vitest";

import { PLAN_PRICING, PROJECT_LICENSE, PRICING_FOOTER, PROMESAS_SIN_RESPALDO } from "../planes";

/**
 * Precios y enlaces del sitio: contrato congelado.
 *
 * El sitio es lo unico que ve un cliente antes de pagar. Si un precio cambia aqui
 * y no en la app (frontend-bitacoria/src/lib/plans.ts) ni en el backend
 * (TIER_QUOTAS), el usuario ve un numero en la landing y otro al solicitar el plan.
 * Estos tests no sincronizan nada: obligan a que el cambio sea consciente y en los
 * tres repos.
 *
 * La tarjeta (PlanesSection.tsx) todavia lleva los numeros inline; se leen del
 * archivo como texto hasta que esa seccion se refactorice para importar `planes.ts`.
 */

const SECTION = readFileSync(
    join(process.cwd(), "src/components/ui/PlanesSection.tsx"),
    "utf-8",
);

/**
 * Lo que se ve en pantalla, sin comentarios. En los comentarios se explica a
 * propósito qué decía antes un texto y por qué cambió: si las pruebas los
 * leyeran, una frase borrada de la pantalla seguiría "encontrándose" en su
 * comentario. Quita los bloques /* ... *\/ (también los {/* ... *\/} de JSX,
 * aunque ocupen varias líneas) y las líneas que empiezan con //.
 */
function textoVisible(fuente: string): string {
    const SALTO = String.fromCharCode(10);
    return fuente
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split(SALTO)
        .filter((l) => !l.trim().startsWith("//"))
        .join(SALTO);
}

describe("tabla de precios", () => {
    it("congela los cuatro planes con sus importes en MXN sin IVA", () => {
        expect(PLAN_PRICING).toEqual([
            { planKey: "draft", title: "DRAFT", priceMonthly: "0", priceAnnual: "0", annualTotal: "0", cta: "Empezar Gratis" },
            { planKey: "resident", title: "THE RESIDENT", priceMonthly: "2,499", priceAnnual: "1,999", annualTotal: "23,988", cta: "Comenzar" },
            { planKey: "manager", title: "THE SITE MANAGER", priceMonthly: "3,899", priceAnnual: "3,199", annualTotal: "38,388", cta: "Comenzar" },
            { planKey: "executive", title: "EXECUTIVE PLAN", priceMonthly: "12,999", priceAnnual: "10,399", annualTotal: "124,788", cta: "Contactar" },
        ]);
    });

    it("el anual facturado equivale a doce meses del precio anual", () => {
        const aNumero = (s: string) => Number(s.replace(/,/g, ""));
        for (const plan of PLAN_PRICING) {
            expect(aNumero(plan.annualTotal)).toBe(aNumero(plan.priceAnnual) * 12);
        }
    });

    it("la licencia de proyecto es pago unico de 12 meses por una obra", () => {
        expect(PROJECT_LICENSE.detail).toBe("$10,999 MXN · Pago único · 12 meses · 1 obra.");
    });

    it("el pie dice como se paga (transferencia o Mercado Pago, sin permanencia)", () => {
        expect(PRICING_FOOTER).toContain("IVA no incluido");
        expect(PRICING_FOOTER).toContain("transferencia o Mercado Pago");
        expect(PRICING_FOOTER).toContain("Sin permanencia");
        expect(PRICING_FOOTER).not.toContain("tarjeta");
    });
});

describe("la tarjeta de planes muestra los mismos numeros", () => {
    it.each(PLAN_PRICING)("$title", (plan) => {
        expect(SECTION).toContain(`title: "${plan.title}"`);
        expect(SECTION).toContain(`priceMonthly: "${plan.priceMonthly}"`);
        expect(SECTION).toContain(`priceAnnual: "${plan.priceAnnual}"`);
        expect(SECTION).toContain(`annualTotal: "${plan.annualTotal}"`);
        expect(SECTION).toContain(`planKey: "${plan.planKey}"`);
    });

    it("incluye la licencia unica de proyecto y el pie de precios", () => {
        expect(SECTION).toContain(PROJECT_LICENSE.detail);
        expect(SECTION).toContain(PRICING_FOOTER);
    });
});

describe("enlaces hacia la app", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllEnvs();
    });

    it("acceso e alta apuntan a app.bitacoria.com", async () => {
        const { loginUrl, registerUrl } = await import("../appUrl");
        expect(loginUrl()).toBe("https://app.bitacoria.com/auth");
        expect(registerUrl("resident", "annual")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=resident&billing=annual",
        );
    });

    it("el ciclo solo viaja con los planes de suscripcion", async () => {
        const { registerUrl } = await import("../appUrl");
        expect(registerUrl("draft", "monthly")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=draft",
        );
        expect(registerUrl("project_license", "annual")).toBe(
            "https://app.bitacoria.com/auth?mode=register&plan=project_license",
        );
    });

    it("respeta NEXT_PUBLIC_APP_URL y le recorta la diagonal final", async () => {
        vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.bitacoria.com/");
        const { loginUrl } = await import("../appUrl");
        expect(loginUrl()).toBe("https://staging.bitacoria.com/auth");
    });
});

describe("el copy no promete lo que no existe", () => {
    const SECCIONES = [
        "src/components/ui/PlanesSection.tsx",
        "src/components/ui/FooterSection.tsx",
        "src/components/ui/BitacoraSection.tsx",
        "src/components/ui/SmartConceptsSection.tsx",
        "src/components/ui/SmartBimSyncSection.tsx",
        "src/components/ui/CronogramaSection.tsx",
        "src/components/ui/WorldAdaptiveSection.tsx",
        "src/app/smart-bim/page.tsx",
        "src/app/smart-calendar/page.tsx",
        "src/app/alcance-global/page.tsx",
    ];

    it.each(SECCIONES)("%s no trae ninguna promesa sin respaldo", (ruta) => {
        // Sin comentarios: ahí se explica a propósito qué decía antes cada
        // promesa y por qué se quitó.
        const visible = textoVisible(readFileSync(resolve(process.cwd(), ruta), "utf8"));

        // Sin distinguir mayúsculas: "Alertas automáticas" o "firma electrónica
        // avanzada" en minúsculas tampoco deben pasar.
        const visibleMin = visible.toLowerCase();
        const encontradas = PROMESAS_SIN_RESPALDO.filter((p) => visibleMin.includes(p.toLowerCase()));
        expect(encontradas).toEqual([]);
    });
});

describe("la tarjeta del plan gratis dice lo que trae la prueba guiada", () => {
    // La prueba gratis trae 1 catálogo y 1 cronograma, y con los dos la isla se
    // pone morada (BIM Sync). Las tres filas van parejas: si solo BIM Sync
    // estuviera encendido, la tarjeta diría que conecta dos cosas que no trae.
    const inicio = SECTION.indexOf('id: "draft"');
    const fin = SECTION.indexOf('id: "resident"');
    const draft = SECTION.slice(inicio, fin);

    it.each(["SMART CALENDAR", "SMART CONCEPTS", "SMART BIM SYNC"])("%s va como incluido en la prueba", (modulo) => {
        expect(inicio).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(inicio);
        const fila = draft.split(String.fromCharCode(10)).find((l) => l.includes(`title: "${modulo}"`)) ?? "";
        expect(fila).toContain('desc: "Incluido en la prueba"');
        expect(fila).toContain("included: true");
    });
});

describe("las tarjetas de pago dicen lo que hace el cronograma", () => {
    // 2026-10-08 (Luis): "Cronograma predictivo" pasa a "Cronograma con avance
    // real" en los tres planes de pago.
    const inicio = SECTION.indexOf('id: "resident"');
    const fin = SECTION.indexOf("] as const;", inicio);
    const pago = SECTION.slice(inicio, fin);

    it("las tres filas de SMART CALENDAR dicen 'Cronograma con avance real'", () => {
        expect(inicio).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(inicio);
        const filas = pago.split(String.fromCharCode(10)).filter((l) => l.includes('title: "SMART CALENDAR"'));
        expect(filas).toHaveLength(3);
        for (const fila of filas) {
            expect(fila).toContain('desc: "Cronograma con avance real"');
            expect(fila).toContain("included: true");
        }
    });
});

describe("el pie dice lo que de verdad pasa", () => {
    // Solo el texto visible: en los comentarios del pie se cita a propósito lo
    // que decía antes y por qué cambió.
    const PIE = textoVisible(readFileSync(resolve(process.cwd(), "src/components/ui/FooterSection.tsx"), "utf8"));

    it("la pregunta del equipo explica que toda la empresa ve todas las obras", () => {
        // Desde el 2026-10-04 (Luis) toda persona de la empresa ve y trabaja todas
        // sus obras; el código por obra se quitó. Invitar al cliente final le
        // abriría todas las obras de la constructora.
        expect(PIE).toContain("todavía no hay acceso por obra");
    });

    it("al vencer o cancelar no se borra nada solo", () => {
        // Decisión de Luis 2026-10-07: 30 días en solo lectura con PDF; nada se
        // borra solo, solo si el cliente lo pide.
        expect(PIE).toContain("nada se borra");
        expect(PIE).toContain("solo lectura");
    });

    it("el aviso dice a dónde va la ubicación de la obra", () => {
        // El botón de geolocalización de la app manda la coordenada a
        // OpenStreetMap desde el navegador para llenar ciudad y estado.
        expect(PIE).toContain("OpenStreetMap");
    });

    it("los términos conservan la obligación del cliente de cuidar sus claves", () => {
        expect(PIE).toContain("resguardo de sus claves");
    });

    it("el aviso nombra a quién le llegan los datos", () => {
        // Sección IV: antes decía que solo se transfería por orden judicial y a
        // PACs. Lista del borrador del Aviso (cláusula 6).
        // El buzón del equipo (Gmail) recibe las solicitudes de plan y de soporte
        // que manda la app, y WhatsApp (Meta) los mensajes por ese canal: el
        // borrador lo trae en 6.2.
        for (const quien of [
            "Supabase",
            "Google Cloud",
            "Vercel",
            "Resend",
            "Sentry",
            "ipapi.co",
            "Mercado Pago",
            "portal del SAT",
            "Gmail",
            "solicitud de plan o de soporte",
            "WhatsApp",
            "Meta procesa el mensaje",
        ]) {
            expect(PIE).toContain(quien);
        }
        expect(PIE).toContain("No vendemos ni rentamos sus datos");
    });

    it("el aviso le habla de usted de principio a fin", () => {
        // El Aviso de hoy va de usted ("hace de su conocimiento", "Usted, o quien
        // funja..."). Las frases nuevas no deben mezclar el tú; la Fase 6 lo
        // reemplaza completo por el borrador.
        const inicio = PIE.indexOf('title: "Aviso de Privacidad"');
        const fin = PIE.indexOf("export default function FooterSection");
        expect(inicio).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(inicio);
        const aviso = PIE.slice(inicio, fin);
        const tuteo = aviso.match(/\b(tu|tus|te|ti|activas|subes|pagas|pides|escribes|mandas)\b/gi) ?? [];
        expect(tuteo).toEqual([]);
    });
});
