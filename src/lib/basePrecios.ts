/* ══════════════════════════════════════════════════════════════
   basePrecios — cifras de la base de precios y comparativa con otros
   programas de precios unitarios (Luis, 2026-11-24).

   Reglas que no se rompen (las vigila basePrecios.test.ts):
   - Las cifras de BitacorIA salen de la base de precios
     (`_contexto/base_local/CIFRAS.md`, 2026-11-24). Si cambian, se cambian aquí.
   - Lo que se dice de OPUS y de Neodata sale de SU sitio oficial, con la
     página exacta. Si su sitio no lo dice, la celda lleva SIN_DATO y la nota
     lo explica: nunca se escribe que "no lo tienen".
   - Solo van filas donde BitacorIA gana con datos que se pueden comprobar
     (Luis: "solo con lo que ganamos"). Por eso no hay fila de IA ni de
     "funciona en la nube": los dos ya anuncian IA y Neodata trabaja en la nube.
   - Sin logotipos de dependencias: muchos llevan el Escudo Nacional, que no
     se usa en publicidad, y un logo hace creer que la dependencia nos
     respalda. Van sus nombres en texto.
   ══════════════════════════════════════════════════════════════ */

export type Cifra = { valor: string; titulo: string; detalle?: string };

/* Paramétricos sin decir de qué dependencia ni de qué tipo de obra son (Luis 2026-11-24: "solo deja 396 oficiales"). */
export const CIFRAS: readonly Cifra[] = [
    {
        valor: "+20,000",
        titulo: "Precios oficiales de gobierno",
        detalle: "De distintas dependencias: CDMX, SICT, CONAGUA y más.",
    },
    { valor: "396", titulo: "Costos paramétricos oficiales" },
    {
        valor: "262",
        titulo: "Equipos con costo horario oficial",
        detalle: "Por hora activa, en espera y en reserva.",
    },
    {
        valor: "32",
        titulo: "Estados con costo real de mano de obra",
        detalle: "Salario mínimo 2026 y factor de salario real.",
    },
];

export const VIGENCIA = { destacado: "Vigentes 2024–2026", resto: "la edición más reciente de cada dependencia, con su fecha" };

/* Nombres en texto, sin logos. */
export const DEPENDENCIAS: readonly string[] = ["CDMX", "SICT", "CONAGUA", "CONASAMI", "Guanajuato", "Chiapas", "Veracruz"];

export const NOTA_DEPENDENCIAS = "Tomados de documentos públicos de cada dependencia. BitacorIA no está afiliada a ellas.";

export const COMPETIDORES = [
    { clave: "opus", nombre: "OPUS", sitio: "opus.mx" },
    { clave: "neodata", nombre: "Neodata", sitio: "neodata.mx" },
] as const;

export type ClaveCompetidor = (typeof COMPETIDORES)[number]["clave"];

/** La celda de un competidor: lo que dice su sitio (con la página de donde sale) o SIN_DATO. */
export type Celda = { texto: string; fuente?: string };

export type Fila = { concepto: string; bitacoria: string; competencia: Record<ClaveCompetidor, Celda> };

export const SIN_DATO = "—";

const sinDato: Celda = { texto: SIN_DATO };

export const COMPARATIVA: readonly Fila[] = [
    {
        concepto: "Precios oficiales de gobierno",
        bitacoria: "+20,000",
        competencia: {
            /* "ECOSTOS WEB se define como la base de precios unitarios más grande de México" */
            opus: { texto: "Base propia", fuente: "https://opus.mx/opus/base-de-datos-para-precios-unitarios/" },
            /* "presupuestos maestros que Neodata pone a disposición" (ConstruBase) */
            neodata: { texto: "Base propia", fuente: "https://www.neodata.mx/construbase" },
        },
    },
    {
        concepto: "Vigentes, con documento y fecha en cada precio",
        bitacoria: "Sí",
        competencia: { opus: sinDato, neodata: sinDato },
    },
    {
        concepto: "Costos paramétricos oficiales",
        bitacoria: "396",
        competencia: { opus: sinDato, neodata: sinDato },
    },
    {
        concepto: "Equipos con costo horario oficial",
        bitacoria: "262",
        competencia: { opus: sinDato, neodata: sinDato },
    },
];

export const REVISADO = "24 de noviembre de 2026";

export const NOTA_COMPARATIVA =
    `${SIN_DATO} No aparece en su sitio oficial. Información de opus.mx y neodata.mx revisada el ${REVISADO}. ` +
    "OPUS y Neodata son marcas de sus respectivos dueños.";
