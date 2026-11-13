/* ══════════════════════════════════════════════════════════════
   demoContrato — la solicitud de demo tal como la recibe el servidor
   ──────────────────────────────────────────────────────────────
   2026-11-13 (Luis, tanda 4 del plan registro_filtro). El contrato común
   de la página, la app y el servidor vive en
   src/lib/__tests__/fixtures/contrato_cuestionario.json (copia TAL CUAL
   del plan; el servidor tiene la misma). Las pruebas de
   demoContrato.test.ts lo leen: si aquí cambia una clave, una regla o un
   mensaje sin cambiar el contrato, se rompen.

   Aquí no hay pantalla ni red: las opciones (clave interna → texto que ve
   la persona), la limpieza del nombre, del correo y del WhatsApp, y el
   cuerpo exacto que viaja a POST /api/v1/public/demo-requests.

   La clave es contrato con el servidor y no cambia; el texto sí puede.
   ══════════════════════════════════════════════════════════════ */

/** ¿A qué te dedicas? Mismas claves y textos que el cuestionario de la app. */
export const PERFILES: readonly (readonly [string, string])[] = [
    ["residente", "Residente o superintendente de obra"],
    ["constructora", "Constructora o contratista"],
    ["independiente", "Arquitecto o ingeniero independiente"],
    ["supervision", "Supervisión o DRO (director responsable de obra)"],
    ["desarrollador", "Desarrollador o dueño de la obra"],
    ["estudiante", "Estudiante o docente"],
    ["otro", "Otro"],
];

/** ¿Qué tan listo estás? La clave es la del contrato; el texto largo es el de
    siempre en la página (el corto del contrato es el que lee el panel). */
export const INTERESES: readonly (readonly [string, string])[] = [
    ["listo", "Listo para comprar — solo espero el lanzamiento"],
    ["muy_probable", "Muy probable — estoy evaluando seriamente"],
    ["probable", "Probable — depende de lo que vea en la demo"],
    ["curioso", "Curioso — vine a explorar"],
    ["investigando", "Solo investigando — no estoy en el mercado ahora"],
];

/** País: código de 2 letras (OT = otro o no listado). */
export const PAISES: readonly (readonly [string, string])[] = [
    ["MX", "México"], ["US", "Estados Unidos"], ["GT", "Guatemala"], ["CO", "Colombia"],
    ["EC", "Ecuador"], ["PE", "Perú"], ["BO", "Bolivia"], ["PY", "Paraguay"],
    ["AR", "Argentina"], ["BR", "Brasil"], ["CL", "Chile"], ["CR", "Costa Rica"], ["CU", "Cuba"],
    ["DO", "República Dominicana"], ["SV", "El Salvador"], ["HN", "Honduras"], ["NI", "Nicaragua"],
    ["PA", "Panamá"], ["PR", "Puerto Rico"], ["UY", "Uruguay"], ["VE", "Venezuela"],
    ["ES", "España"], ["CA", "Canadá"], ["OT", "Otro / No listado"],
];

/** Los campos que la persona ve y que pueden llevar un aviso junto. */
export type CampoDemo =
    | "nombre"
    | "email"
    | "whatsapp"
    | "pais"
    | "perfil"
    | "obras_activas"
    | "interes_compra";

export const CAMPOS_DEMO: readonly CampoDemo[] = [
    "nombre",
    "email",
    "whatsapp",
    "perfil",
    "obras_activas",
    "interes_compra",
    "pais",
];

/** Avisos junto a cada campo: los del contrato (mensajes y demo.mensajes_extra).
    Nunca el nombre interno del campo. */
export const MENSAJES: Record<CampoDemo | "whatsapp_otro_pais", string> = {
    nombre: "Escribe tu nombre y apellido.",
    email: "Escribe un correo válido.",
    whatsapp: "Escribe tu WhatsApp a 10 dígitos, por ejemplo 55 1234 5678.",
    whatsapp_otro_pais: "Escribe tu número con lada del país, de 8 a 15 dígitos.",
    pais: "Elige tu país.",
    perfil: "Elige a qué te dedicas.",
    obras_activas: "Escribe cuántas obras llevas, de 0 a 999.",
    interes_compra: "Elige qué tan listo estás.",
};

/** El aviso del WhatsApp depende del país elegido. */
export function mensajeWhatsApp(pais: string): string {
    return pais.trim().toUpperCase() === "MX" ? MENSAJES.whatsapp : MENSAJES.whatsapp_otro_pais;
}

/* ── WhatsApp ───────────────────────────────────────────────────── */

/**
 * Número de México → `+52` y 10 dígitos, o null. Se quita todo lo que no sea
 * dígito y los prefijos 521 (13 dígitos), 52 (12) y 01 (12). Quedan 10
 * dígitos, el primero de 2 a 9 y no todos iguales.
 */
export function normalizarWhatsAppMx(entrada: string | null | undefined): string | null {
    let d = (entrada ?? "").replace(/\D/g, "");
    if (d.length === 13 && d.startsWith("521")) d = d.slice(3);
    else if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
    else if (d.length === 12 && d.startsWith("01")) d = d.slice(2);
    if (d.length !== 10) return null;
    if (!/^[2-9]/.test(d)) return null;
    if (/^(\d)\1{9}$/.test(d)) return null;
    return `+52${d}`;
}

/**
 * Número de otro país → `+` y sus dígitos, o null. Tiene que empezar con `+`
 * (la lada); de 8 a 15 dígitos, el primero de 1 a 9. Si la lada es 52, es de
 * México y se aplica esa regla.
 */
export function normalizarWhatsAppOtroPais(entrada: string | null | undefined): string | null {
    const t = (entrada ?? "").trim();
    if (!t.startsWith("+")) return null;
    const d = t.replace(/\D/g, "");
    if (d.startsWith("52")) return normalizarWhatsAppMx(t);
    if (d.length < 8 || d.length > 15) return null;
    if (d.startsWith("0")) return null;
    return `+${d}`;
}

/**
 * La regla según el país elegido: México, 10 dígitos; cualquier otro (también
 * "Otro / No listado"), con lada. Con otro país NO se aceptan 10 dígitos
 * sueltos: un número de Estados Unidos o de Colombia también tiene 10 y
 * quedaría guardado como si fuera de México.
 */
export function normalizarWhatsApp(entrada: string | null | undefined, pais: string): string | null {
    return pais.trim().toUpperCase() === "MX" ? normalizarWhatsAppMx(entrada) : normalizarWhatsAppOtroPais(entrada);
}

/* ── Nombre ─────────────────────────────────────────────────────── */

/** ¿Trae caracteres de control (tabulador, salto de línea, etc.)? */
function tieneControl(texto: string): boolean {
    for (const letra of texto) {
        const c = letra.codePointAt(0) ?? 0;
        if (c < 0x20 || (c >= 0x7f && c <= 0x9f)) return true;
    }
    return false;
}

const SOLO_PERMITIDOS = /^[\p{L}\p{M} .'-]+$/u;
const LETRA = /\p{L}/gu;

/**
 * Nombre completo limpio, o null. Sin caracteres de control (tabuladores,
 * saltos de línea); espacios de los lados fuera y los de en medio juntos; solo
 * letras (con acentos y ñ), espacios, punto, apóstrofo y guion; al menos dos
 * palabras de 2 letras o más (puede haber iniciales); de 5 a 120 caracteres.
 * No cambia mayúsculas.
 *
 * Además de la regla del contrato: los acentos se juntan a su letra (NFC) y el
 * apóstrofo curvo que pone el teclado del iPhone (’) pasa a ser el recto ('),
 * para que "O’Connor" no se rechace por cómo lo escribió el teléfono.
 */
export function limpiarNombre(entrada: string | null | undefined): string | null {
    if (typeof entrada !== "string") return null;
    const crudo = entrada.normalize("NFC").replace(/[‘’ʼ]/g, "'");
    if (tieneControl(crudo)) return null;
    const limpio = crudo.trim().replace(/\s+/g, " ");
    if (limpio.length < 5 || limpio.length > 120) return null;
    if (!SOLO_PERMITIDOS.test(limpio)) return null;
    const palabras = limpio.split(" ").filter((p) => (p.match(LETRA) ?? []).length >= 2);
    return palabras.length >= 2 ? limpio : null;
}

/* ── Correo ─────────────────────────────────────────────────────── */

/**
 * Correo en minúsculas, o null. El servidor manda (email_validator, sin
 * consultar DNS); aquí solo se atrapa lo evidente para avisar sin esperar:
 * algo@dominio.algo, sin espacios, hasta 254 caracteres.
 */
export function limpiarCorreo(entrada: string | null | undefined): string | null {
    const c = (entrada ?? "").trim().toLowerCase();
    if (!c || c.length > 254) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return null;
    return c;
}

/* ── El cuerpo ──────────────────────────────────────────────────── */

/** Lo que trae la hoja, tal cual se escribió. */
export type HojaDemo = {
    nombre: string;
    email: string;
    whatsapp: string;
    pais: string;
    perfil: string;
    obras_activas: string;
    interes_compra: string;
    /** Clave del plan que trae la URL (hoy solo "plus"); vacío o null = demo. */
    plan?: string | null;
};

/** Lo que viaja al servidor, en el orden del contrato, sin la verificación. */
export type CuerpoDemo = {
    nombre: string;
    email: string;
    whatsapp: string;
    pais: string;
    perfil: string;
    obras_activas: number | null;
    interes_compra: string;
    plan?: string;
};

export type CuerpoDemoConVerificacion = CuerpoDemo & { captcha_token: string };

export type ErroresDemo = Partial<Record<CampoDemo, string>>;

const esClaveDe = (lista: readonly (readonly [string, string])[], clave: string) =>
    lista.some(([c]) => c === clave);

/**
 * Revisa y limpia la hoja. Devuelve el cuerpo listo (sin la verificación) o
 * TODOS los avisos a la vez, para marcar cada campo. Es la misma revisión con
 * servidor o sin él (cuando el mensaje se manda por WhatsApp).
 */
export function armarCuerpoDemo(hoja: HojaDemo): { ok: true; cuerpo: CuerpoDemo } | { ok: false; errores: ErroresDemo } {
    const errores: ErroresDemo = {};

    const nombre = limpiarNombre(hoja.nombre);
    if (!nombre) errores.nombre = MENSAJES.nombre;

    const email = limpiarCorreo(hoja.email);
    if (!email) errores.email = MENSAJES.email;

    const pais = (hoja.pais ?? "").trim().toUpperCase();
    if (!esClaveDe(PAISES, pais)) errores.pais = MENSAJES.pais;

    // Sin país no se sabe qué regla aplicar: se avisa en el país, no aquí.
    const whatsapp = errores.pais ? null : normalizarWhatsApp(hoja.whatsapp, pais);
    if (!errores.pais && !whatsapp) errores.whatsapp = mensajeWhatsApp(pais);

    const perfil = (hoja.perfil ?? "").trim();
    if (!esClaveDe(PERFILES, perfil)) errores.perfil = MENSAJES.perfil;

    const obrasTexto = (hoja.obras_activas ?? "").trim();
    let obras_activas: number | null = null;
    if (obrasTexto) {
        if (/^\d{1,3}$/.test(obrasTexto)) obras_activas = Number(obrasTexto);
        else errores.obras_activas = MENSAJES.obras_activas;
    }

    const interes_compra = (hoja.interes_compra ?? "").trim();
    if (!esClaveDe(INTERESES, interes_compra)) errores.interes_compra = MENSAJES.interes_compra;

    if (Object.keys(errores).length > 0 || !nombre || !email || !whatsapp) {
        return { ok: false, errores };
    }

    const cuerpo: CuerpoDemo = { nombre, email, whatsapp, pais, perfil, obras_activas, interes_compra };
    const plan = (hoja.plan ?? "").trim();
    if (plan) cuerpo.plan = plan.slice(0, 30);
    return { ok: true, cuerpo };
}

/** El cuerpo exacto que se manda: el revisado y, al final, la verificación. */
export function cuerpoParaEnviar(cuerpo: CuerpoDemo, captchaToken: string): CuerpoDemoConVerificacion {
    return { ...cuerpo, captcha_token: captchaToken };
}

/** Texto visible de una clave (para el mensaje de WhatsApp y el correo). */
export function textoDe(lista: readonly (readonly [string, string])[], clave: string): string {
    return lista.find(([c]) => c === clave)?.[1] ?? clave;
}
