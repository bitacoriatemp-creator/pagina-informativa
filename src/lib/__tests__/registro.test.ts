import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { botonCrema, botonVerde } from "../../app/registro/botones";
import { leerPlanDeInteres, solicitudPlanUrl } from "../registro";
import { armarMensaje, buildWhatsAppUrl } from "../whatsapp";

/**
 * El formulario de /registro (2026-11-13, Luis).
 *
 * Plus se anuncia en la página pero todavía no existe en la app: su botón trae
 * al formulario con ?plan=plus&billing=... El formulario lo marca y lo pone en
 * el mensaje de WhatsApp.
 *
 * Tanda 0 del plan registro_filtro: el formulario ya no manda nada a ninguna
 * base (la vieja ya no existe). Abre WhatsApp con el mensaje escrito dentro del
 * mismo clic y la pantalla dice "Falta un paso". Estas pruebas vigilan que no
 * vuelva el envío al destino muerto y que el mensaje lleve los datos de siempre.
 */

const FORM = readFileSync(resolve(process.cwd(), "src/app/registro/Formulario.tsx"), "utf8");

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
        perfil: "Residente independiente",
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

    it("con todo: nombre, correo, perfil, plan, obras, interés y país", () => {
        const msg = armarMensaje({
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            perfil: "Residente independiente",
            obras_activas: "3",
            interes_compra: "Probable",
            pais: "México",
            plan: leerPlanDeInteres("?plan=plus&billing=annual"),
        });
        expect(etiquetas(msg)).toEqual(["Nombre", "Correo", "Perfil", "Plan", "Obras activas", "Interés", "País"]);
    });

    it("sin plan y sin obras: no deja renglones vacíos", () => {
        const msg = armarMensaje({
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            perfil: "Residente independiente",
            obras_activas: null,
            interes_compra: "Probable",
            pais: "México",
        });
        expect(etiquetas(msg)).toEqual(["Nombre", "Correo", "Perfil", "Interés", "País"]);
    });

    it("el enlace de WhatsApp lleva exactamente ese mensaje", () => {
        const datos = {
            nombre: "SMOKE Prueba",
            email: "prueba@example.com",
            perfil: "Despacho técnico",
            interes_compra: "Curioso",
            pais: "Colombia",
        };
        const url = buildWhatsAppUrl(datos) ?? "";
        expect(url.startsWith("https://wa.me/")).toBe(true);
        expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(armarMensaje(datos));
    });

    it("la hoja arma el mensaje con los seis datos de siempre y el plan", () => {
        const cuerpo = cuerpoDe(FORM, "function leerDatos(");
        const inicio = cuerpo.indexOf("const datos: LeadDatos = {");
        expect(inicio).toBeGreaterThan(-1);
        const bloque = cuerpo.slice(inicio, cuerpo.indexOf("};", inicio));
        const claves = bloque.match(/^\s*(\w+):/gm)?.map((c) => c.trim().replace(":", "")) ?? [];
        expect(claves).toEqual(["nombre", "email", "perfil", "obras_activas", "interes_compra", "pais", "plan"]);
    });
});

describe("la hoja ya no manda nada a la base vieja", () => {
    it("Formulario.tsx no apunta a ningún proyecto de Supabase", () => {
        // El destino viejo (functions/v1/register-participant) ya no existe: a
        // todos les salía "Sin conexión". Que no vuelva por copiar y pegar.
        expect(FORM).not.toContain("supabase.co");
        expect(FORM).not.toContain("/functions/v1/");
    });

    it("el envío no es async, no espera nada y no llama a la red", () => {
        // WhatsApp se abre dentro del mismo clic: tras un await el navegador ya
        // no lo cuenta como clic y bloquea la ventana.
        expect(FORM).not.toMatch(/async\s+function\s+handleSubmit/);
        expect(FORM).not.toMatch(/handleSubmit\s*=\s*async/);
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        for (const prohibido of ["await", "fetch(", "setTimeout(", ".then(", "AbortController"]) {
            expect(envio, `el envío no debe usar ${prohibido}`).not.toContain(prohibido);
        }
    });

    it("abre WhatsApp antes de cambiar la pantalla, con la ventana del navegador", () => {
        const envio = cuerpoDe(FORM, "function handleSubmit(");
        const abre = envio.indexOf("abrirEnPestanaNueva(wa, window)");
        expect(abre).toBeGreaterThan(-1);
        expect(abre).toBeLessThan(envio.indexOf("setEnviado("));
    });

    it("la validación sigue siendo la del navegador", () => {
        expect(FORM).toContain("onSubmit={handleSubmit}");
        expect(FORM).not.toContain("noValidate");
    });

    it("no deja la marca vieja ni guarda la cuenta: nada quedó guardado", () => {
        expect(FORM).not.toContain("REGISTERED_FLAG");
        expect(FORM).not.toContain("bitacoria_registered");
        expect(FORM).not.toContain("setStoredAccount");
        expect(FORM).not.toContain("localStorage.setItem");
    });

    it("la marca vieja ya no tapa la hoja: se prellenan nombre y correo guardados", () => {
        expect(FORM).toContain("datosPrellenados(correoDelHero, getStoredAccount())");
        expect(FORM).not.toContain("yaDentro");
        expect(FORM).toContain("{!enviado && (");
    });
});

describe("la pantalla no dice que algo llegó si no llegó", () => {
    const VISIBLE = textoVisible(FORM);
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
        expect(VISIBLE).toContain("<WhatsAppCTA href={waUrl}>{falta.boton}</WhatsAppCTA>");
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
        expect(VISIBLE.indexOf("Otras opciones")).toBeGreaterThan(VISIBLE.indexOf("{falta.boton}"));
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
