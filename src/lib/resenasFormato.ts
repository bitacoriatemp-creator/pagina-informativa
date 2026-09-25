/* ══════════════════════════════════════════════════════════════
   resenasFormato — lo que comparten servidor y tarjeta (JC 2026-09-25)
   ──────────────────────────────────────────────────────────────
   Tipos del contrato público de reseñas y las reglas puras para
   pintarlas: nombre abreviado, iniciales, fecha relativa en español,
   promedio y las etiquetas de rol y tipo de obra.

   Sin fetch ni process.env a propósito: este archivo viaja al navegador
   con ResenasSection. La lectura del backend (y los datos de ejemplo)
   viven en resenas.ts, que solo corre en el servidor; así ni la URL de
   la API ni los textos de prueba llegan al cliente.

   Contrato: _kit_socio/docs/PARA_LUIS_RESENAS_CONTRATO_2026-09-25.md.
   ══════════════════════════════════════════════════════════════ */

/** Una reseña tal como la publica GET /api/v1/public/reviews. */
export interface Resena {
    id: string;
    /** Ya abreviado por el backend ("Ricardo M.") o NOMBRE_ANONIMO. */
    nombre: string;
    /** Foto de Google (https de *.googleusercontent.com) o null → iniciales. */
    foto_url: string | null;
    /** residente | supervisor | contratista | independiente | director | otro */
    rol: string;
    /** vivienda | edificio | plaza_comercial | nave_industrial | infraestructura | remodelacion | otro */
    tipo_obra: string;
    ciudad: string | null;
    /** smart_log | smart_concepts | smart_calendar | null */
    modulo: string | null;
    /** Entero de 1 a 5. */
    estrellas: number;
    texto: string;
    respuesta_equipo: string | null;
    /** ISO 8601; vacío si el backend mandó una fecha inválida. */
    publicada_at: string;
}

export interface ResumenResenas {
    /** Promedio con un decimal sobre TODAS las publicadas (no solo las 30 que llegan). */
    promedio: number;
    /** Publicadas en total. */
    total: number;
}

export interface Resenas {
    resumen: ResumenResenas;
    resenas: Resena[];
}

/* Con menos de esto la sección no existe: mejor nada que tres reseñas.
   Lo aplica obtenerResenas() y, por si acaso, la propia sección. */
export const MINIMO_RESENAS = 5;

/* Lo que manda el backend cuando el usuario apagó "Mostrar mi nombre". */
export const NOMBRE_ANONIMO = "Usuario de BitacorIA";

/* Etiquetas en español de obra. "otro" no se pinta: no dice nada. */
const ROL_ETIQUETA: Record<string, string> = {
    residente: "Residente",
    supervisor: "Supervisor",
    contratista: "Contratista",
    independiente: "Independiente",
    director: "Director de obra",
};

const TIPO_OBRA_ETIQUETA: Record<string, string> = {
    vivienda: "Vivienda",
    edificio: "Edificio",
    plaza_comercial: "Plaza comercial",
    nave_industrial: "Nave industrial",
    infraestructura: "Infraestructura",
    remodelacion: "Remodelación",
};

/** Partículas que no cuentan como apellido al abreviar ("Juan de la Cruz" → "Juan C."). */
const PARTICULAS = ["de", "del", "la", "las", "los", "y", "e", "da", "di", "van", "von"];

function palabras(nombre: string): string[] {
    return nombre.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}

/**
 * Primer nombre + inicial del primer apellido con punto. Misma regla que el
 * backend; se repite aquí como red de seguridad: si algún día llegara un
 * nombre completo, el sitio nunca lo pinta entero.
 */
export function nombreCorto(nombre: string): string {
    const partes = palabras(nombre);
    if (partes.length === 0 || partes.join(" ") === NOMBRE_ANONIMO) return NOMBRE_ANONIMO;
    const [primero, ...resto] = partes;
    const apellido = resto.find((p) => PARTICULAS.indexOf(p.toLowerCase()) < 0);
    if (!apellido) return primero;
    const inicial = apellido.replace(/[^A-Za-zÀ-ÿÑñ]/g, "").charAt(0).toUpperCase();
    return inicial ? `${primero} ${inicial}.` : primero;
}

/** Hasta dos letras para el círculo cuando no hay foto ("Ricardo M." → "RM"). */
export function iniciales(nombre: string): string {
    const partes = palabras(nombreCorto(nombre)).filter((p) => PARTICULAS.indexOf(p.toLowerCase()) < 0);
    if (partes.length === 0) return "";
    const primera = partes[0].charAt(0);
    const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
    return (primera + ultima).toUpperCase();
}

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * "hoy", "ayer", "hace 3 días", "hace 2 semanas", "hace 1 mes", "hace 2 años".
 * Grueso a propósito: en una reseña importa "reciente o vieja", no la hora.
 * Devuelve "" si la fecha no se entiende, y la tarjeta entonces no la pinta.
 */
export function fechaRelativa(iso: string, ahora: number | Date = Date.now()): string {
    const fecha = new Date(iso).getTime();
    if (!iso || Number.isNaN(fecha)) return "";
    const ahoraMs = typeof ahora === "number" ? ahora : ahora.getTime();
    const dias = Math.floor((ahoraMs - fecha) / DIA_MS);
    if (dias <= 0) return "hoy";
    if (dias === 1) return "ayer";
    if (dias < 7) return `hace ${dias} días`;
    if (dias < 30) {
        const semanas = Math.floor(dias / 7);
        return semanas === 1 ? "hace 1 semana" : `hace ${semanas} semanas`;
    }
    if (dias < 365) {
        const meses = Math.floor(dias / 30);
        return meses === 1 ? "hace 1 mes" : `hace ${meses} meses`;
    }
    const anos = Math.floor(dias / 365);
    return anos === 1 ? "hace 1 año" : `hace ${anos} años`;
}

/** Promedio con un decimal; 0 si no hay nada. */
export function promedio(estrellas: readonly number[]): number {
    if (estrellas.length === 0) return 0;
    const suma = estrellas.reduce((acumulado, n) => acumulado + n, 0);
    return Math.round((suma / estrellas.length) * 10) / 10;
}

/** "4.7" siempre con un decimal, también para 5 → "5.0". */
export function formatearPromedio(valor: number): string {
    return valor.toFixed(1);
}

/** "Residente · Vivienda, Querétaro". Vacío si no hay nada que decir. */
export function lineaDeObra(resena: Pick<Resena, "rol" | "tipo_obra" | "ciudad">): string {
    const partes = [ROL_ETIQUETA[resena.rol], TIPO_OBRA_ETIQUETA[resena.tipo_obra]].filter(Boolean);
    const base = partes.join(" · ");
    const ciudad = (resena.ciudad ?? "").trim();
    if (!ciudad) return base;
    return base ? `${base}, ${ciudad}` : ciudad;
}

/* Solo la foto de la cuenta de Google, por https. Cualquier otra cosa se
   pinta como iniciales: el sitio no carga imágenes de hosts arbitrarios. */
const HOST_FOTO_GOOGLE = /^https:\/\/([a-z0-9-]+\.)*googleusercontent\.com\/\S+$/i;

export function esFotoDeGoogle(url: unknown): url is string {
    return typeof url === "string" && HOST_FOTO_GOOGLE.test(url);
}
