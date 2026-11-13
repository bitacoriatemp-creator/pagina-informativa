import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { botonCrema, botonVerde } from "../../app/registro/botones";
import { armarCuerpoDemo, cuerpoParaEnviar, type HojaDemo } from "../demoContrato";
import { RUTA_SOLICITUD_DEMO, enviarSolicitudDemo, urlSolicitudDemo } from "../demoServidor";
import { leerPlanDeInteres, solicitudPlanUrl } from "../registro";
import { datosDelMensaje } from "../solicitudDemo";
import { armarMensaje, buildWhatsAppUrl } from "../whatsapp";

/**
 * El formulario de /registro (2026-11-13, Luis).
 *
 * Plus se anuncia en la página pero todavía no existe en la app: su botón trae
 * al formulario con ?plan=plus&billing=... El formulario lo marca y lo pone en
 * el mensaje de WhatsApp.
 *
 * Tanda 0 del plan registro_filtro: sin servidor el formulario no manda nada a
 * ninguna base (la vieja ya no existe). Abre WhatsApp con el mensaje escrito
 * dentro del mismo clic y la pantalla dice "Falta un paso".
 *
 * Tanda 4: con servidor, la hoja va a {NEXT_PUBLIC_API_BASE_URL}/api/v1/public/
 * demo-requests con el cuerpo del contrato (fixtures/contrato_cuestionario.json).
 * Estas pruebas vigilan el destino, las claves, que el cuerpo de ejemplo del
 * contrato salga de la misma función que arma el envío, que no vuelva el destino
 * muerto y que la pantalla no diga que llegó si no llegó.
 */

const FORM = readFileSync(resolve(process.cwd(), "src/app/registro/Formulario.tsx"), "utf8");
const CONTRATO = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/lib/__tests__/fixtures/contrato_cuestionario.json"), "utf8"),
) as { ejemplos: { demo_cuerpo: Record<string, unknown> }; demo: { _regla: string } };

/** La hoja escrita para obtener el cuerpo de ejemplo del contrato. */
const HOJA_DEL_EJEMPLO: HojaDemo = {
    nombre: "Juan Pérez",
    email: "obra@ejemplo.mx",
    whatsapp: "55 1234 5678",
    pais: "MX",
    perfil: "constructora",
    obras_activas: "8",
    interes_compra: "muy_probable",
    plan: "plus",
};

/** Lo que se ve, sin comentarios (en ellos se cuenta a propósito qué decía antes
    la pantalla). Igual que en planes.test.ts. */
function textoVisible(fuente: string): string {
    const SALTO = String.fromCharCode(10);
    return fuente
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split(SALTO)
        .filter((l) => !l.trim().startsWith("//"))
        .join(SALTO);
}

/** El cuerpo de una función del archivo, de su primera llave a la que la cierra. */
function cuerpoDe(fuente: string, firma: string): string {
    const inicio = fuente.indexOf(firma);
    expect(inicio, `no encontré ${firma}`).toBeGreaterThan(-1);
    const abre = fuente.indexOf("{", fuente.indexOf(")", inicio));
    let nivel = 0;
    for (let i = abre; i < fuente.length; i++) {
        if (fuente[i] === "{") nivel++;
        if (fuente[i] === "}") nivel--;
        if (nivel === 0) return fuente.slice(abre, i + 1);
    }
    throw new Error(`sin cierre para ${firma}`);
}

describe("enlace de la tarjeta al formulario", () => {
    it("lleva el plan y el ciclo que marcó el conmutador", () => {
        expect(solicitudPlanUrl("plus", "annual")).toBe("/registro?plan=plus&billing=annual");
        expect(solicitudPlanUrl("plus", "monthly")).toBe("/registro?plan=plus&billing=monthly");
    });
});

describe("el formulario lee el plan de la URL", () => {
    it("Plus anual con el precio de la tarjeta", () => {
        expect(leerPlanDeInteres("?plan=plus&billing=annual")).toEqual({
            clave: "plus",
            nombre: "Plus",
            ciclo: "annual",
            precio: "$549 al mes, pago anual",
        });
    });

    it("Plus mensual", () => {
        expect(leerPlanDeInteres("?plan=plus&billing=monthly")).toMatchObject({
            ciclo: "monthly",
            precio: "$699 al mes",
        });
    });

    it("sin ciclo o con uno raro asume anual, como la app y el conmutador", () => {
        expect(leerPlanDeInteres("?plan=plus")?.ciclo).toBe("annual");
        expect(leerPlanDeInteres("?plan=plus&billing=semanal")?.ciclo).toBe("annual");
    });

    it.each(["", "?plan=", "?plan=PLUS", "?plan=resident", "?plan=executive", "?plan=<script>", "?billing=annual"])(
        "ignora %j: el formulario queda como siempre",
        (search) => {
            expect(leerPlanDeInteres(search)).toBeNull();
        },
    );
});

describe("mensaje de WhatsApp", () => {
    const base = {
        nombre: "SMOKE Prueba",
        email: "prueba@example.com",
        whatsapp: "+52 55 1234 5678",
        perfil: "Residente o superintendente de obra",
        interes_compra: "Probable",
        pais: "México",
    };
    const texto = (url: string | null) => decodeURIComponent((url ?? "").split("?text=")[1] ?? "");

    it("sin plan, es el de siempre", () => {
        const msg = texto(buildWhatsAppUrl(base));
        expect(msg.startsWith("Hola, quiero una demo de BitacorIA.")).toBe(true);
        expect(msg).not.toContain("Plan:");
    });

    it("con Plus, dice el plan con su precio y ciclo", () => {
        const plan = leerPlanDeInteres("?plan=plus&billing=annual");
        const msg = texto(buildWhatsAppUrl({ ...base, plan }));
        expect(msg.startsWith("Hola, me interesa el plan Plus de BitacorIA.")).toBe(true);
        expect(msg).toContain("Plan: Plus ($549 al mes, pago anual)");
        expect(msg).toContain("Correo: prueba@example.com");
    });
});

describe("las claves del mensaje de WhatsApp", () => {
    // Sustituye a "lo que se manda a la base no cambia" (busca `const payload = {`):
    // hoy no hay envío a ninguna base y el mensaje es lo único que nos llega. Fija
    // qué datos lleva y en qué orden, para que el equipo siempre lea lo mismo.
    const SALTO = String.fromCharCode(10);
    const etiquetas = (msg: string) =>
        msg.split(SALTO).slice(2).map((l) => l.slice(0, l.indexOf(":")));

    it("con todo: nombre, correo, WhatsApp, perfil, plan, obras, interés y país", () => {
        const msg = armarMensaje({
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            whatsapp: "+52 55 1234 5678",
            perfil: "Residente o superintendente de obra",
            obras_activas: "3",
            interes_compra: "Probable",
            pais: "México",
            plan: leerPlanDeInteres("?plan=plus&billing=annual"),
        });
        expect(etiquetas(msg)).toEqual(["Nombre", "Correo", "WhatsApp", "Perfil", "Plan", "Obras activas", "Interés", "País"]);
        expect(msg).toContain("WhatsApp: +52 55 1234 5678");
    });

    it("sin plan y sin obras: no deja renglones vacíos", () => {
        const msg = armarMensaje({
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            whatsapp: "+52 55 1234 5678",
            perfil: "Residente o superintendente de obra",
            obras_activas: null,
            interes_compra: "Probable",
            pais: "México",
        });
        expect(etiquetas(msg)).toEqual(["Nombre", "Correo", "WhatsApp", "Perfil", "Interés", "País"]);
    });

    it("el enlace de WhatsApp lleva exactamente ese mensaje", () => {
        const datos = {
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            whatsapp: "+573001234567",
            perfil: "Arquitecto o ingeniero independiente",
            interes_compra: "Curioso",
            pais: "Colombia",
        };
        const url = buildWhatsAppUrl(datos) ?? "";
        expect(url.startsWith("https://wa.me/")).toBe(true);
        expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(armarMensaje(datos));
    });

    it("la hoja lee los siete datos y el plan", () => {
        const cuerpo = cuerpoDe(FORM, "function leerHoja(");
        const inicio = cuerpo.indexOf("return {");
        expect(inicio).toBeGreaterThan(-1);
        const bloque = cuerpo.slice(inicio, cuerpo.indexOf("};", inicio));
        const claves = bloque.match(/^\s*(\w+):/gm)?.map((c) => c.trim().replace(":", "")) ?? [];
        expect(claves).toEqual(["nombre", "email", "whatsapp", "pais", "perfil", "obras_activas", "interes_compra", "plan"]);
    });

    it("el mensaje sale del mismo cuerpo revisado que va al servidor", () => {
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        expect(envio).toContain("armarCuerpoDemo(leerHoja(e.currentTarget, planInteres))");
        expect(envio).toContain("datosDelMensaje(armado.cuerpo, planInteres)");
        const armado = armarCuerpoDemo(HOJA_DEL_EJEMPLO);
        expect(armado.ok).toBe(true);
        if (!armado.ok) return;
        const msg = armarMensaje(datosDelMensaje(armado.cuerpo, null));
        expect(msg).toContain("WhatsApp: +52 55 1234 5678");
        expect(msg).toContain("Perfil: Constructora o contratista");
        expect(msg).toContain("Interés: Muy probable — estoy evaluando seriamente");
        expect(msg).toContain("Obras activas: 8");
        expect(msg).toContain("País: México");
    });
});

describe("contrato con el servidor (tanda 4): destino y claves", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("el destino es la ruta del contrato bajo NEXT_PUBLIC_API_BASE_URL", () => {
        expect(CONTRATO.demo._regla.startsWith(`POST ${RUTA_SOLICITUD_DEMO}.`)).toBe(true);
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.ejemplo.test/");
        expect(urlSolicitudDemo()).toBe("https://api.ejemplo.test/api/v1/public/demo-requests");
    });

    it("las variables se leen escritas literal (Next solo así las pone en el navegador)", () => {
        const fuente = readFileSync(resolve(process.cwd(), "src/lib/demoServidor.ts"), "utf8");
        expect(fuente).toContain("process.env.NEXT_PUBLIC_API_BASE_URL");
        expect(fuente).toContain("process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY");
    });

    it("Formulario.tsx no escribe a mano ningún servidor: usa urlSolicitudDemo()", () => {
        expect(FORM).toContain("urlSolicitudDemo()");
        expect(FORM).not.toContain("demo-requests");
        expect(FORM).not.toMatch(/sslip|api\.bitacoria|localhost/);
    });

    it("el cuerpo de ejemplo del contrato sale de la misma función que arma el envío", () => {
        const armado = armarCuerpoDemo(HOJA_DEL_EJEMPLO);
        expect(armado.ok).toBe(true);
        if (!armado.ok) return;
        const cuerpo = cuerpoParaEnviar(armado.cuerpo, "token-de-prueba");
        expect(cuerpo).toEqual(CONTRATO.ejemplos.demo_cuerpo);
        expect(Object.keys(cuerpo)).toEqual([
            "nombre",
            "email",
            "whatsapp",
            "pais",
            "perfil",
            "obras_activas",
            "interes_compra",
            "plan",
            "captcha_token",
        ]);
        expect(Object.keys(cuerpo)).toEqual(Object.keys(CONTRATO.ejemplos.demo_cuerpo));
    });

    it("y es exactamente lo que viaja por la red", async () => {
        const armado = armarCuerpoDemo(HOJA_DEL_EJEMPLO);
        if (!armado.ok) throw new Error("la hoja del ejemplo no pasó");
        let enviado: unknown = null;
        await enviarSolicitudDemo(
            "https://api.ejemplo.test/api/v1/public/demo-requests",
            cuerpoParaEnviar(armado.cuerpo, "token-de-prueba"),
            {
                fetchImpl: (_url, init) => {
                    enviado = JSON.parse(String(init.body));
                    return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true }) });
                },
            },
        );
        expect(enviado).toEqual(CONTRATO.ejemplos.demo_cuerpo);
    });

    it("Formulario.tsx manda con esas mismas funciones", () => {
        const servidor = cuerpoDe(FORM, "async function enviarAlServidor(");
        expect(servidor).toContain("enviarConReintento({");
        const fuente = readFileSync(resolve(process.cwd(), "src/lib/demoServidor.ts"), "utf8").replace(/\r\n/g, "\n");
        const inicio = fuente.indexOf("export async function enviarConReintento(");
        expect(inicio).toBeGreaterThan(-1);
        const reintento = fuente.slice(inicio, fuente.indexOf("\n}\n", inicio));
        expect(reintento).toContain("enviar(p.url, cuerpoParaEnviar(p.cuerpo, token))");
        expect(reintento).toContain("enviarSolicitudDemo(url, cuerpo)");
    });

    it("las opciones de la hoja mandan la CLAVE y enseñan el texto", () => {
        expect(FORM).toContain("PERFILES.map(([clave, texto]) => <option key={clave} value={clave}>{texto}</option>)");
        expect(FORM).toContain("INTERESES.map(([clave, texto]) => <option key={clave} value={clave}>{texto}</option>)");
    });

    it("el WhatsApp es obligatorio, de teléfono y sin tope de largo", () => {
        const inicio = FORM.indexOf('id="reg-whatsapp"');
        expect(inicio).toBeGreaterThan(-1);
        const campo = FORM.slice(inicio, FORM.indexOf("/>", inicio));
        expect(campo).toContain('name="whatsapp"');
        expect(campo).toContain('type="tel"');
        expect(campo).toContain("required");
        expect(campo).not.toContain("maxLength");
    });
});

describe("la hoja ya no manda nada a la base vieja y el salto a WhatsApp va dentro del clic", () => {
    it("Formulario.tsx no apunta a ningún proyecto de Supabase", () => {
        // El destino viejo (functions/v1/register-participant) ya no existe: a
        // todos les salía "Sin conexión". Que no vuelva por copiar y pegar.
        expect(FORM).not.toContain("supabase.co");
        expect(FORM).not.toContain("/functions/v1/");
    });

    it("el clic no es async, no espera nada y no llama a la red", () => {
        // Sin servidor, WhatsApp se abre dentro del mismo clic: tras un await el
        // navegador ya no lo cuenta como clic y bloquea la ventana. El envío al
        // servidor (que sí espera) va aparte, en enviarAlServidor.
        expect(FORM).not.toMatch(/async\s+function\s+handleSubmit/);
        expect(FORM).not.toMatch(/handleSubmit\s*=\s*async/);
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        for (const prohibido of ["await", "fetch(", "setTimeout(", ".then(", "AbortController"]) {
            expect(envio, `el envío no debe usar ${prohibido}`).not.toContain(prohibido);
        }
    });

    it("sin servidor, abre WhatsApp antes de cambiar la pantalla, con la ventana del navegador", () => {
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        const abre = envio.indexOf("abrirEnPestanaNueva(wa, window)");
        expect(abre).toBeGreaterThan(-1);
        expect(abre).toBeLessThan(envio.indexOf('setPantalla({ tipo: "falta", datos })'));
    });

    it("el camino lo decide decidirEnvio en el clic, con lo que ya se sabe", () => {
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        expect(envio).toContain("decidirEnvio({");
        // Al servidor se va sin esperar dentro del clic.
        expect(envio).toContain("void enviarAlServidor(");
        expect(envio.indexOf("void enviarAlServidor(")).toBeLessThan(envio.indexOf("abrirEnPestanaNueva("));
    });

    it("tras esperar al servidor nunca se abre nada solo", () => {
        const servidor = cuerpoDe(FORM, "async function enviarAlServidor(");
        for (const prohibido of ["abrirEnPestanaNueva", "window.open", "location.assign", "location.href"]) {
            expect(servidor, `enviarAlServidor no debe usar ${prohibido}`).not.toContain(prohibido);
        }
    });

    it("Solicitud recibida solo con la respuesta 2xx del servidor", () => {
        const servidor = cuerpoDe(FORM, "async function enviarAlServidor(");
        const recibida = servidor.indexOf('if (resultado.tipo === "recibida")');
        expect(recibida).toBeGreaterThan(-1);
        expect(servidor.indexOf('setPantalla({ tipo: "recibida", datos })')).toBeGreaterThan(recibida);
        expect(FORM.match(/tipo: "recibida", datos/g) ?? []).toHaveLength(1);
        expect(servidor.indexOf("marcarSolicitudRecibida()")).toBeGreaterThan(recibida);
        expect(FORM.match(/marcarSolicitudRecibida\(\)/g) ?? []).toHaveLength(1);
    });

    it("la verificación vencida pide otro token (el reintento único se prueba en demoServidor.test.ts); lo demás va a No pudimos guardar", () => {
        const servidor = cuerpoDe(FORM, "async function enviarAlServidor(");
        expect(servidor).toContain("pedirOtroToken: () => verificacionRef.current?.reset()");
        expect(servidor).toContain("esperarToken: () => tomarToken(TIEMPO_MAXIMO_TOKEN_MS)");
        expect(servidor).toContain('setPantalla({ tipo: "no_guardada", datos })');
        // El token se consume al tomarlo: cada uno sirve una vez.
        expect(cuerpoDe(FORM, "async function tomarToken(")).toContain("tokenRef.current = null");
    });

    it("la validación sigue siendo la del navegador", () => {
        expect(FORM).toContain("onSubmit={handleSubmit}");
        expect(FORM).not.toContain("noValidate");
    });

    it("no deja la marca vieja ni guarda la cuenta local (la nueva vive en registro.ts)", () => {
        expect(FORM).not.toContain("REGISTERED_FLAG");
        expect(FORM).not.toContain("bitacoria_registered");
        expect(FORM).not.toContain("setStoredAccount");
        expect(FORM).not.toContain("localStorage.setItem");
    });

    it("la marca vieja ya no tapa la hoja: se prellenan nombre y correo guardados", () => {
        expect(FORM).toContain("datosPrellenados(correoDelHero, getStoredAccount())");
        expect(FORM).not.toContain("yaDentro");
        expect(FORM).toContain('{pantalla.tipo === "hoja" && (');
    });
});

describe("la pantalla no dice que algo llegó si no llegó", () => {
    const VISIBLE = textoVisible(FORM);
    // Formulario.tsx no los trae escritos. "Solicitud recibida" y "Te escribimos
    // por WhatsApp" existen desde la tanda 4, pero solo en textosRecibida y
    // pasosDespues(..., "servidor") de src/lib/solicitudDemo.ts, y solo se pintan
    // con la respuesta 2xx (ver arriba).
    const VIEJOS = [
        "Solicitud recibida",
        "Quedaste en la lista",
        "Ya estás en la lista",
        "Registro encontrado",
        "Tenemos tu solicitud",
        "Te escribimos muy pronto",
        "Te escribimos por WhatsApp",
        "Sin conexión",
        "El servidor tardó en responder",
        "No te quedes fuera",
        "Registrar a otra persona",
        "Procesando",
    ];

    it.each(VIEJOS)("Formulario.tsx ya no muestra %j", (frase) => {
        expect(VISIBLE).not.toContain(frase);
    });

    it("sin palomita grande ni letra roja", () => {
        expect(VISIBLE).not.toContain("Check size={32}");
        expect(VISIBLE).not.toContain("text-red-");
    });

    it("con WhatsApp: botón verde, correo con el mismo mensaje y el número a la vista", () => {
        expect(VISIBLE).toContain("<WhatsAppCTA href={waUrl}>{aviso.boton}</WhatsAppCTA>");
        expect(VISIBLE).toContain("¿Sin WhatsApp en este equipo?");
        expect(VISIBLE).toContain("Envíanos el mismo mensaje por correo");
        expect(VISIBLE).toContain("{numeroVisible}");
    });

    it("sin número de WhatsApp, el correo es el botón principal", () => {
        expect(VISIBLE).toContain('canal === "whatsapp" && waUrl ?');
        expect(VISIBLE).toContain("<a href={correoUrl} className={botonCrema}>");
    });

    it("Otras opciones (redes) se queda bajo el botón", () => {
        expect(VISIBLE).toContain("Otras opciones");
        expect(VISIBLE.indexOf("Otras opciones")).toBeGreaterThan(VISIBLE.indexOf("{aviso.boton}"));
    });

    it("recibida: el botón de WhatsApp es opcional y va debajo de su explicación", () => {
        expect(VISIBLE).toContain("{recibida.extra}");
        expect(VISIBLE).toContain("<WhatsAppCTA href={waUrl}>{recibida.boton}</WhatsAppCTA>");
        expect(VISIBLE.indexOf("{recibida.extra}")).toBeLessThan(VISIBLE.indexOf("{recibida.boton}"));
    });

    it("los avisos de campo y el de la verificación van en ámbar, nunca en rojo", () => {
        expect(VISIBLE).not.toMatch(/text-red|#f00\b|#ef4444|#dc2626/i);
        expect(VISIBLE).toContain("Completa la verificación de arriba y vuelve a pulsar el botón.");
    });

    it("siete datos: seis con folio y el país al pie", () => {
        for (const n of ["01", "02", "03", "04", "05", "06"]) expect(VISIBLE).toContain(`n="${n}"`);
        expect(VISIBLE).not.toContain('n="07"');
        expect(VISIBLE).toContain('htmlFor="reg-pais"');
        const pagina = readFileSync(resolve(process.cwd(), "src/app/registro/page.tsx"), "utf8");
        expect(pagina).toContain("Siete datos");
        expect(pagina).not.toContain("Seis datos");
        expect(VISIBLE).not.toContain("Seis datos");
    });
});

describe("botón de WhatsApp: hermano de Solicitar demo, en verde (opción B de Luis)", () => {
    const clases = (c: string) => new Set(c.split(/\s+/).filter(Boolean));
    const COLOR_CREMA = ["bg-[#f5f0e8]", "hover:bg-white"];
    const COLOR_VERDE = ["bg-[#25D366]", "hover:bg-[#3be07a]"];

    it("la misma forma que el crema, más el espacio del icono, sin la regla de deshabilitado", () => {
        const crema = clases(botonCrema);
        const verde = clases(botonVerde);
        const esperado = new Set(
            Array.from(crema).filter((c) => !COLOR_CREMA.includes(c) && !c.startsWith("disabled:")),
        );
        for (const c of [...COLOR_VERDE, "gap-2.5"]) esperado.add(c);
        expect(Array.from(verde).sort()).toEqual(Array.from(esperado).sort());
    });

    it("el crema conserva su forma de siempre", () => {
        expect(Array.from(clases(botonCrema)).sort()).toEqual(
            Array.from(
                clases(
                    "flex h-12 w-full items-center justify-center rounded-xl bg-[#f5f0e8] text-[15px] font-semibold text-[#1a120c] transition-colors duration-200 hover:bg-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0604]",
                ),
            ).sort(),
        );
    });

    it("verde de WhatsApp con letra oscura, no esmeralda con letra crema", () => {
        expect(botonVerde).toContain("bg-[#25D366]");
        expect(botonVerde).toContain("text-[#1a120c]");
        expect(botonVerde).toContain("hover:bg-[#3be07a]");
        expect(botonVerde).not.toContain("#1f7a4d");
        expect(botonVerde).not.toContain("text-[#f5f0e8]");
    });

    it("WhatsAppCTA es el icono y el texto; se fueron pastilla, Teko, degradado, sombras, brillo, burbuja y flecha", () => {
        const cta = cuerpoDe(FORM, "function WhatsAppCTA(");
        expect(cta).toContain("className={botonVerde}");
        expect(cta).toContain("<WhatsAppIcon />");
        for (const viejo of ["btn-premium-shine", "rounded-full", "font-ui", "linear-gradient", "boxShadow", "style=", "compact", "→", "translate"]) {
            expect(cta, `WhatsAppCTA no debe llevar ${viejo}`).not.toContain(viejo);
        }
        expect(FORM).not.toContain("compact");
    });

    it("globals.css conserva el brillo viejo: lo usa /esia", () => {
        const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
        expect(css).toContain(".btn-premium-shine");
    });
});
