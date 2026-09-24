/* ══════════════════════════════════════════════════════════════
   cuenta — la cuenta de la app abierta en este navegador
   ──────────────────────────────────────────────────────────────
   La sesión real vive en la app (cookie `bitacoria_refresh`, HttpOnly y
   solo de app.bitacoria.com): www no la ve ni debe verla. Lo que sí ve es
   `bitacoria_cuenta`, una cookie de AVISO que escribe la app cuando tiene
   el perfil y borra al cerrar sesión. No es credencial: solo dice "en este
   navegador hay una cuenta abierta" y cómo pintarla.

     valor = base64url( JSON {"n": "<nombre>", "i": "<iniciales>", "f": "<foto>"} )

   `f` es opcional: la URL de la foto de perfil, solo si es https y de un
   host permitido (ver fotoValida). Hoy la app no tiene fotos (Google está
   apagado y el backend no guarda avatar), así que casi siempre falta y la
   barra pinta las iniciales. Sin correo ni ids, 700 bytes como mucho. Con
   ella:
     · src/middleware.ts manda "/" al tablero de la app.
     · GlobalNavbar muestra el círculo de cuenta y el botón "Acceder".

   Todo lo de aquí es puro (sin React) porque también corre en el
   middleware (Edge). Nada lanza: un valor raro, corrupto o demasiado
   largo cuenta como "sin cuenta", y una foto que no pasa el filtro se
   descarta sin tirar la cuenta.
   ══════════════════════════════════════════════════════════════ */

/** Cookie de aviso que escribe la app (Domain .bitacoria.com en producción). */
export const CUENTA_COOKIE = "bitacoria_cuenta";

/** Cookie que pone www al abrir "/?sitio=1"; dura VER_SITIO_MAX_AGE segundos. */
export const VER_SITIO_COOKIE = "bitacoria_ver_sitio";

/**
 * Vida de `bitacoria_ver_sitio`: 30 minutos, lo que dura una visita a la
 * landing. Antes era cookie de sesión del navegador, pero los navegadores que
 * restauran pestañas al abrir la conservan días: quien pulsó "Ver sitio" una
 * vez seguía viendo la landing al teclear bitacoria.com mucho después, en vez
 * de ir a su tablero.
 */
export const VER_SITIO_MAX_AGE = 60 * 30;

/**
 * Tope del valor de la cookie; lo que pase de aquí no lo escribió la app.
 * Subió de 200 a 700 bytes para que quepa la URL de la foto. La app usa el
 * MISMO tope (frontend-bitacoria, src/lib/cuentaCookie.ts): si cambia en un
 * lado, cambia en los dos.
 */
export const CUENTA_MAX_BYTES = 700;

/**
 * Hosts de los que se acepta la foto. `*.dominio` vale para cualquier
 * subdominio (no para el dominio pelado). Se suman los de la variable opcional
 * NEXT_PUBLIC_AVATAR_HOSTS, separados por comas.
 */
export const HOSTS_FOTO = ["lh3.googleusercontent.com", "*.googleusercontent.com"] as const;

/**
 * Largo máximo de la URL de la foto, antes y después de normalizarla. El mismo
 * que la app (FOTO_MAX_CARACTERES de src/lib/cuentaCookie.ts): una URL más
 * larga no es de Google ni de Storage.
 */
export const FOTO_MAX_CARACTERES = 300;

/* Lo que nunca va en la URL de la foto: espacios, controles, comillas,
   ángulos, barra invertida y backtick. Igual que en la app. */
const FOTO_PROHIBIDO = /[\s\u0000-\u001f\u007f"'<>\\`]/;

export type Cuenta = {
    /** Nombre para mostrar (el mismo que pinta el tablero). */
    nombre: string;
    /** Una a tres letras: lo que pinta el círculo si no hay foto. */
    iniciales: string;
    /** URL https de la foto, ya filtrada. Falta si no hay o no pasó el filtro. */
    foto?: string;
};

/** Lo mínimo de `request.cookies` (NextRequest) o de `cookies()` de next/headers. */
type LectorDeCookies = { get(nombre: string): { value: string } | undefined };

const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

/* Caracteres de control fuera: el nombre acaba en el DOM como texto. */
function limpiar(texto: string): string {
    return texto.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

/* Mismas reglas que las iniciales del tablero (src/lib/userDisplay.ts de la
   app): dos palabras, dos iniciales; una palabra, sus dos primeras letras. */
function inicialesDe(nombre: string): string {
    const palabras = nombre.split(" ").filter(Boolean);
    if (palabras.length === 0) return "";
    if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
    return (palabras[0].charAt(0) + palabras[1].charAt(0)).toUpperCase();
}

function base64urlABytes(valor: string): Uint8Array {
    const b64 = valor.replace(/=+$/, "").replace(/-/g, "+").replace(/_/g, "/");
    const binario = atob(b64 + "===".slice((b64.length + 3) % 4));
    const bytes = new Uint8Array(binario.length);
    for (let k = 0; k < binario.length; k++) bytes[k] = binario.charCodeAt(k);
    return bytes;
}

/* Lectura ESTÁTICA de la env (Next solo inlinea en el cliente y en el Edge
   las lecturas literales). Se lee en cada llamada para que los tests puedan
   cambiarla sin recargar el módulo. */
function hostsPermitidos(): string[] {
    let extra: string[] = [];
    try {
        extra = (process.env.NEXT_PUBLIC_AVATAR_HOSTS ?? "")
            .split(",")
            .map((h) => h.trim().toLowerCase())
            .filter(Boolean);
    } catch {
        extra = [];
    }
    return [...HOSTS_FOTO, ...extra];
}

function hostPermitido(host: string): boolean {
    return hostsPermitidos().some((permitido) => {
        if (permitido.startsWith("*.")) {
            const base = permitido.slice(2);
            // "*.com" o "*." no valen: el comodín necesita un dominio de verdad.
            return base.includes(".") && host.endsWith(`.${base}`);
        }
        return host === permitido;
    });
}

/**
 * URL de la foto → la misma URL normalizada, o `null` si no se puede pintar
 * sin riesgo: tiene que ser https, sin usuario, contraseña ni puerto, sin
 * espacios, controles, comillas, ángulos, barra invertida ni backtick, de un
 * host permitido y de FOTO_MAX_CARACTERES como mucho. Es el mismo filtro que
 * `fotoPermitida` de la app (espacios de los extremos fuera, como allí). Se
 * usa al leer la cookie y al escribirla (codificarCuenta). Nunca lanza.
 */
export function fotoValida(valor: unknown): string | null {
    try {
        if (typeof valor !== "string") return null;
        const texto = valor.trim();
        if (!texto || texto.length > FOTO_MAX_CARACTERES || FOTO_PROHIBIDO.test(texto)) return null;
        const url = new URL(texto);
        if (url.protocol !== "https:") return null;
        if (url.username || url.password || url.port) return null;
        if (!hostPermitido(url.hostname)) return null;
        return url.href.length <= FOTO_MAX_CARACTERES ? url.href : null;
    } catch {
        return null;
    }
}

/**
 * Valor de la cookie → cuenta, o `null` si falta o no es válido. Nunca lanza.
 */
export function decodificarCuenta(valor: string | null | undefined): Cuenta | null {
    try {
        if (!valor) return null;
        let crudo = valor.trim();
        if (crudo.includes("%")) crudo = decodeURIComponent(crudo);
        if (crudo.length === 0 || crudo.length > CUENTA_MAX_BYTES) return null;
        if (!BASE64URL.test(crudo)) return null;

        const texto = new TextDecoder("utf-8", { fatal: true }).decode(base64urlABytes(crudo));
        const datos: unknown = JSON.parse(texto);
        if (!datos || typeof datos !== "object" || Array.isArray(datos)) return null;
        const { n, i, f } = datos as { n?: unknown; i?: unknown; f?: unknown };
        if (typeof n !== "string") return null;

        /* Si algún día llegara un correo como nombre, se queda la parte de
           antes de la arroba: la barra no muestra correos. */
        const nombre = limpiar(n.split("@")[0]);
        if (!nombre) return null;

        const inicialesCrudas = typeof i === "string" ? limpiar(i).toUpperCase() : "";
        const iniciales =
            inicialesCrudas.length >= 1 && inicialesCrudas.length <= 3 && !/[\s@]/.test(inicialesCrudas)
                ? inicialesCrudas
                : inicialesDe(nombre);
        if (!iniciales) return null;

        // Una foto que no pasa el filtro se descarta; la cuenta sigue valiendo.
        const foto = fotoValida(f);
        return foto ? { nombre, iniciales, foto } : { nombre, iniciales };
    } catch {
        return null;
    }
}

/**
 * Cuenta → valor de la cookie (JSON en UTF-8, base64url sin relleno). Lo usan
 * los tests; en producción la escribe la app con el mismo formato. `f` va
 * después de `n` e `i` y solo si la foto pasa el filtro: sin foto, el valor es
 * idéntico al de antes de existir el campo.
 */
export function codificarCuenta(cuenta: Cuenta): string {
    const datos: { n: string; i: string; f?: string } = { n: cuenta.nombre, i: cuenta.iniciales };
    const foto = fotoValida(cuenta.foto);
    if (foto) datos.f = foto;
    const bytes = new TextEncoder().encode(JSON.stringify(datos));
    let binario = "";
    for (let k = 0; k < bytes.length; k++) binario += String.fromCharCode(bytes[k]);
    return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Servidor: `request.cookies` en el middleware, o `cookies()` de next/headers. */
export function leerCuenta(cookies: LectorDeCookies): Cuenta | null {
    try {
        return decodificarCuenta(cookies.get(CUENTA_COOKIE)?.value);
    } catch {
        return null;
    }
}

/**
 * Navegador: lee `document.cookie` (o la cadena que se le pase, para tests).
 * Fuera del navegador, o si el acceso a las cookies está bloqueado, `null`.
 */
export function leerCuentaDelNavegador(cadena?: string): Cuenta | null {
    try {
        const fuente = cadena ?? (typeof document !== "undefined" ? document.cookie : "");
        const prefijo = `${CUENTA_COOKIE}=`;
        const par = fuente.split(";").map((p) => p.trim()).find((p) => p.startsWith(prefijo));
        return par ? decodificarCuenta(par.slice(prefijo.length)) : null;
    } catch {
        return null;
    }
}

/** Misma cuenta a efectos de pintar la barra (nombre, iniciales y foto). */
export function mismaCuenta(a: Cuenta | null, b: Cuenta | null): boolean {
    if (a === null || b === null) return a === b;
    return a.nombre === b.nombre && a.iniciales === b.iniciales && a.foto === b.foto;
}
