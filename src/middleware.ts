import { NextResponse, type NextRequest } from "next/server";
import { dashboardUrl } from "@/lib/appUrl";
import { leerCuenta, VER_SITIO_COOKIE, VER_SITIO_MAX_AGE } from "@/lib/cuenta";

/* ══════════════════════════════════════════════════════════════
   middleware — con cuenta abierta, bitacoria.com lleva al tablero
   ──────────────────────────────────────────────────────────────
   Solo la home ("/"). Si en este navegador hay una cuenta abierta de la
   app (cookie de aviso `bitacoria_cuenta`, ver src/lib/cuenta.ts), entrar
   a bitacoria.com manda al tablero con un 307. Se ve la landing, con la
   cuenta en la barra, cuando:

     · se llega con "/?sitio=1" ("Ver sitio" del tablero): además se pone
       `bitacoria_ver_sitio`, que dura 30 minutos, y mientras viva la home
       ya no rebota. No es cookie de sesión del navegador: los navegadores
       que restauran pestañas la guardan días, y bitacoria.com dejaba de
       llevar al tablero mucho después de aquella visita;
     · se navega a "/" desde otra página del sitio (Sec-Fetch-Site:
       same-origin, o una petición del router de Next): quien ya está
       leyendo el sitio y pulsa el logo o "Planes y precios" quiere la
       landing, no que lo saquen a la app;
     · la cookie falta o no es válida.

   Las demás páginas (/planes, módulos, legales…) no pasan por aquí.
   El redirect de "/?registro" de next.config.mjs corre ANTES que el
   middleware (orden de Next: headers → redirects → middleware), así que
   ese enlace antiguo sigue yendo a /registro; la guarda de abajo solo lo
   deja explícito.
   ══════════════════════════════════════════════════════════════ */

export function middleware(request: NextRequest) {
    const { pathname, searchParams, protocol } = request.nextUrl;

    // El matcher ya lo limita a "/"; esto evita sorpresas si alguien lo amplía.
    if (pathname !== "/") return NextResponse.next();
    if (searchParams.has("registro")) return NextResponse.next();

    if (searchParams.get("sitio") === "1") {
        const respuesta = NextResponse.next();
        respuesta.cookies.set(VER_SITIO_COOKIE, "1", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: protocol === "https:",
            // 30 minutos: lo que dura una visita a la landing (ver cuenta.ts).
            maxAge: VER_SITIO_MAX_AGE,
        });
        return respuesta;
    }

    if (request.cookies.has(VER_SITIO_COOKIE)) return NextResponse.next();

    const navegacionInterna =
        request.headers.get("sec-fetch-site") === "same-origin" ||
        request.headers.has("rsc") ||
        request.headers.has("next-router-prefetch");
    if (navegacionInterna) return NextResponse.next();

    if (!leerCuenta(request.cookies)) return NextResponse.next();

    const respuesta = NextResponse.redirect(dashboardUrl(), 307);
    // Depende de una cookie: que ninguna caché compartida lo guarde.
    respuesta.headers.set("Cache-Control", "private, no-store");
    return respuesta;
}

export const config = {
    matcher: ["/"],
};
