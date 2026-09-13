/**
 * Detectores de "internals filtrados" en la superficie que ve el visitante del
 * www: uuids, emojis e ingles. Mismo espiritu que los LEAK_PATTERNS de la app
 * (central_flow.spec.ts): si algo de esto aparece en el texto visible, rompe
 * la sensacion de producto. Puro: recibe texto, devuelve hallazgos.
 */

export type Fuga = { tipo: "uuid" | "emoji" | "ingles"; muestra: string };

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

// Pictogramas y emojis con presentacion de emoji. Se dejan fuera los simbolos
// tipograficos (flechas, vinetas, marcas) que el diseno usa a proposito.
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

// Palabras/frases en ingles que se cuelan desde el codigo o de plantillas.
// Lista corta y de alta precision: cada entrada es un termino que no tiene
// lugar en una landing en espanol. Se compara por palabra completa.
const INGLES: readonly string[] = [
    "loading",
    "submit",
    "error",
    "undefined",
    "null",
    "not found",
    "something went wrong",
    "sign in",
    "sign up",
    "log in",
    "login",
    "logout",
    "get started",
    "learn more",
    "read more",
    "coming soon",
    "click here",
    "welcome",
];

const INGLES_RE = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${INGLES.map((t) => t.replace(/\s+/g, "\\s+")).join("|")})(?![\\p{L}\\p{N}_])`,
    "giu",
);

// Terminos que en el www son marca o nombre propio, no ingles filtrado.
const PERMITIDOS_INGLES = new Set([
    "smart concepts",
    "smart log",
    "smart calendar",
    "smart bim",
    "smart island",
    "bim sync",
    "the resident",
    "the site manager",
    "executive plan",
    "draft",
    "audit ready",
    "white label",
]);

function esMarca(muestra: string): boolean {
    return PERMITIDOS_INGLES.has(muestra.trim().toLowerCase());
}

/** Devuelve las fugas encontradas en un texto visible (vacio = limpio). */
export function detectarFugas(texto: string): Fuga[] {
    const fugas: Fuga[] = [];
    for (const m of texto.matchAll(UUID_RE)) fugas.push({ tipo: "uuid", muestra: m[0] });
    for (const m of texto.matchAll(EMOJI_RE)) fugas.push({ tipo: "emoji", muestra: m[0] });
    for (const m of texto.matchAll(INGLES_RE)) {
        if (!esMarca(m[0])) fugas.push({ tipo: "ingles", muestra: m[0] });
    }
    return fugas;
}

/** Resumen legible para el mensaje del expect. */
export function describirFugas(fugas: Fuga[]): string {
    if (fugas.length === 0) return "sin fugas";
    const porTipo = new Map<string, string[]>();
    for (const f of fugas) {
        const lista = porTipo.get(f.tipo) ?? [];
        if (!lista.includes(f.muestra)) lista.push(f.muestra);
        porTipo.set(f.tipo, lista);
    }
    return [...porTipo.entries()].map(([tipo, muestras]) => `${tipo}: ${muestras.slice(0, 5).join(", ")}`).join(" | ");
}
