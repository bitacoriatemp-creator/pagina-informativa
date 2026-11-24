import { describe, expect, it } from "vitest";
import { CIFRAS, COMPARATIVA, COMPETIDORES, DEPENDENCIAS, NOTA_COMPARATIVA, SIN_DATO } from "../basePrecios";

/* La comparativa es publicidad: cada dato de la competencia tiene que poder
   comprobarse en su propio sitio (Ley Federal de Protección al Consumidor,
   art. 32: veraz y comprobable). */

describe("comparativa con otros programas", () => {
    it("cada celda de la competencia es SIN_DATO o trae la página de SU sitio oficial", () => {
        for (const fila of COMPARATIVA) {
            for (const c of COMPETIDORES) {
                const celda = fila.competencia[c.clave];
                if (celda.texto === SIN_DATO) continue;
                expect(celda.fuente, `${fila.concepto} / ${c.nombre}`).toBeTruthy();
                const host = new URL(celda.fuente as string).hostname.replace(/^www\./, "");
                expect(host, `${fila.concepto} / ${c.nombre}`).toBe(c.sitio);
            }
        }
    });

    it("solo filas donde BitacorIA tiene el dato (lo que ganamos)", () => {
        for (const fila of COMPARATIVA) {
            expect(fila.bitacoria.trim()).not.toBe("");
            expect(fila.bitacoria).not.toBe(SIN_DATO);
        }
    });

    it("nunca afirma que la competencia no tiene algo: solo lo que dice o no dice su sitio", () => {
        const textos = COMPARATIVA.flatMap((f) => COMPETIDORES.map((c) => f.competencia[c.clave].texto));
        for (const t of textos) expect(t).not.toMatch(/\b(no tiene|no incluye|sin |nada)\b/i);
        expect(NOTA_COMPARATIVA).toContain("No aparece en su sitio oficial");
    });
});

describe("cifras de la base", () => {
    it("lleva lo que pidió Luis: +20,000 de distintas dependencias y 396 paramétricos oficiales", () => {
        const oficiales = CIFRAS.find((c) => c.titulo === "Precios oficiales de gobierno");
        expect(oficiales?.valor).toBe("+20,000");
        for (const d of ["CDMX", "SICT", "CONAGUA"]) expect(oficiales?.detalle).toContain(d);
        const parametricos = CIFRAS.find((c) => c.valor === "396");
        expect(parametricos?.titulo).toBe("Costos paramétricos oficiales");
        expect(parametricos?.detalle).toBeUndefined();
    });

    it("las dependencias van como nombre en texto", () => {
        for (const d of ["CDMX", "SICT", "CONAGUA"]) expect(DEPENDENCIAS).toContain(d);
        for (const d of DEPENDENCIAS) expect(d).not.toMatch(/\.(png|svg|jpe?g|webp)$/i);
    });
});
