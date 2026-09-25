import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { Resena, Resenas } from "../../../lib/resenasFormato";
import { RESENAS_DEMO } from "../../../lib/resenasDemo";
import { EventoFalso } from "./heroDemoShowcase.entorno";
import { CUADRO_MS, ElementoDesplazable, montarResenasSection, type Montado } from "./resenasSection.entorno";

/**
 * Cinta de reseñas de la portada (JC 2026-09-25).
 *
 * Lo que JC pidió y no puede perderse en un refactor: se pinta solo con cinco
 * o más reseñas, con foto de Google o iniciales, nombre abreviado, rol y tipo
 * de obra, estrellas tal cual, respuesta del equipo y conteo honesto; sin
 * ningún enlace a la app (la reseña se pide dentro de la app); flechas en
 * escritorio que desaparecen cuando no hay más, arrastre con el ratón que no
 * roba el clic, y el dedo en móvil.
 *
 * Y el scroll horizontal fluido (JC 2026-09-25: "se clava de golpe, como si
 * hubiera un límite por cada scroll"): sin snap, y rueda, trackpad, flechas e
 * inercia del arrastre por un solo animador que frena suave, se deja cortar
 * sin brincos y respeta "Reducir movimiento".
 */

const DIA_MS = 24 * 60 * 60 * 1000;
const hace = (dias: number) => new Date(Date.now() - dias * DIA_MS).toISOString();

function resena(cambios: Partial<Resena> = {}): Resena {
    return {
        id: "r1",
        nombre: "Ricardo M.",
        foto_url: null,
        rol: "residente",
        tipo_obra: "vivienda",
        ciudad: "Querétaro",
        modulo: "smart_log",
        estrellas: 5,
        texto: "La bitácora del día queda con foto y hora desde la camioneta.",
        respuesta_equipo: null,
        publicada_at: hace(21),
        ...cambios,
    };
}

function cinco(total = 12): Resenas {
    return {
        resumen: { promedio: 4.7, total },
        resenas: [
            resena({ id: "a", foto_url: "https://lh3.googleusercontent.com/a/abc123=s96-c" }),
            resena({
                id: "b",
                nombre: "Paola R.",
                rol: "contratista",
                tipo_obra: "plaza_comercial",
                ciudad: "León",
                estrellas: 4,
                texto: "El catálogo salió en una tarde. Me falta agrupar partidas por frente.",
                respuesta_equipo: "Gracias, Paola. Lo anotamos para revisarlo con el equipo.",
                publicada_at: hace(3),
            }),
            resena({ id: "c", nombre: "Usuario de BitacorIA", ciudad: null, rol: "otro", tipo_obra: "otro", estrellas: 3 }),
            resena({ id: "d", nombre: "Jorge H.", publicada_at: hace(0) }),
            resena({ id: "e", nombre: "Ana", publicada_at: "" }),
        ],
    };
}

let montado: Montado | null = null;

async function montar(resenas: Resenas, opciones?: { movimientoReducido?: boolean }) {
    montado = await montarResenasSection(resenas, opciones);
    return montado;
}

afterEach(async () => {
    await montado?.desmontar();
    montado = null;
});

describe("ResenasSection: cuándo existe", () => {
    it("con cinco reseñas se pinta: cabecera, promedio, conteo y una tarjeta por reseña", async () => {
        const m = await montar(cinco());
        const texto = m.contenedor.textContent;

        expect(m.porAtributo("id", "resenas")).toHaveLength(1);
        expect(texto).toMatch(/lo que dicen en obra/i);
        expect(texto).toContain("Reseñas de quienes ya la usan");
        expect(texto).toContain("4.7");
        expect(texto).toContain("12 reseñas · solo usuarios con cuenta en BitacorIA");
        expect(m.tarjetas()).toHaveLength(5);
        expect(texto).toContain("Las reseñas se escriben desde la app, con cuenta de Google verificada. Publicamos todas salvo spam o abuso.");
    });

    it("con menos de cinco publicadas no pinta nada, aunque lleguen tarjetas", async () => {
        const m = await montar(cinco(4));
        expect(m.contenedor.childNodes).toHaveLength(0);
    });

    it("con la lista vacía tampoco, aunque el total diga cinco", async () => {
        const m = await montar({ resumen: { promedio: 5, total: 5 }, resenas: [] });
        expect(m.contenedor.childNodes).toHaveLength(0);
    });

    it("los datos de ejemplo se pintan enteros, con sus respuestas del equipo", async () => {
        const m = await montar(RESENAS_DEMO);
        expect(m.tarjetas()).toHaveLength(RESENAS_DEMO.resenas.length);
        const conRespuesta = RESENAS_DEMO.resenas.filter((r) => r.respuesta_equipo).length;
        expect(m.contenedor.textContent.split("Equipo BitacorIA:")).toHaveLength(conRespuesta + 1);
    });
});

describe("ResenasSection: sin puerta a la app", () => {
    it("no hay ningún enlace ni texto que mande a la app o a iniciar sesión", async () => {
        const m = await montar(cinco());

        expect(m.porEtiqueta("a")).toHaveLength(0);
        expect(m.contenedor.textContent).not.toMatch(/iniciar sesi[oó]n|deja tu rese|app\.bitacoria\.com|\/auth/i);
        for (const el of m.elementos()) {
            for (const valor of Array.from(el.atributos.values())) {
                expect(valor).not.toMatch(/app\.bitacoria\.com|\/auth/);
            }
        }
        // Los únicos botones son las flechas, y al montar (sin desbordamiento) no hay ninguna.
        expect(m.porEtiqueta("button")).toHaveLength(0);
    });

    it("el código fuente tampoco importa appUrl ni escribe un href", () => {
        const fuente = readFileSync(join(__dirname, "..", "ResenasSection.tsx"), "utf8")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/^\s*\/\/.*$/gm, "");
        expect(fuente).not.toMatch(/@\/lib\/appUrl|href=|<a\b|<Link\b|Deja tu reseña/);
    });
});

describe("ResenasSection: la tarjeta", () => {
    it("foto de Google: <img> perezosa, sin referrer, sin alt y sin arrastre nativo", async () => {
        const m = await montar(cinco());
        const [img] = m.porEtiqueta("img");

        expect(m.porEtiqueta("img")).toHaveLength(1);
        expect(img.getAttribute("src")).toBe("https://lh3.googleusercontent.com/a/abc123=s96-c");
        expect(img.getAttribute("loading")).toBe("lazy");
        expect(img.getAttribute("referrerpolicy")).toBe("no-referrer");
        expect(img.getAttribute("alt")).toBe("");
        expect(img.getAttribute("draggable")).toBe("false");
    });

    it("si la foto no carga, pasa a iniciales en vez de dejar el icono roto", async () => {
        const m = await montar(cinco());
        const [img] = m.porEtiqueta("img");

        await m.disparar(img, new EventoFalso("error", { bubbles: false }));

        expect(m.porEtiqueta("img")).toHaveLength(0);
        expect(m.tarjetas()[0].textContent).toContain("RM");
    });

    it("sin foto: iniciales en bronce; el anónimo del contrato también", async () => {
        const m = await montar(cinco());
        const [, paola, anonimo, , ana] = m.tarjetas();

        expect(paola.textContent).toContain("PR");
        expect(anonimo.textContent).toContain("Usuario de BitacorIA");
        expect(anonimo.textContent).toContain("UB");
        expect(ana.textContent).toContain("Ana");
    });

    it("nombre abreviado, rol · tipo de obra y ciudad; con 'otro' y sin ciudad la línea no aparece", async () => {
        const m = await montar(cinco());
        const [ricardo, paola, anonimo] = m.tarjetas();

        expect(ricardo.textContent).toContain("Ricardo M.");
        expect(ricardo.textContent).toContain("Residente · Vivienda, Querétaro");
        expect(paola.textContent).toContain("Contratista · Plaza comercial, León");
        expect(anonimo.textContent).not.toContain("·");
    });

    it("la línea de obra envuelve (sin truncate) para que la ciudad no desaparezca; el nombre sí se recorta", async () => {
        // JC 2026-09-25: con "Director de obra · Infraestructura, Guadalajara" el
        // truncate se comía la ciudad en 188 px. El nombre cabe en un renglón.
        const m = await montar(cinco());
        const parrafos = m.porEtiqueta("p");
        const obra = parrafos.find((p) => p.textContent === "Contratista · Plaza comercial, León");
        const nombre = parrafos.find((p) => p.textContent === "Paola R.");

        expect(obra).toBeDefined();
        expect(nombre).toBeDefined();
        expect(obra!.className.split(/\s+/)).not.toContain("truncate");
        expect(nombre!.className.split(/\s+/)).toContain("truncate");
    });

    it("cada tarjeta mide lo suyo: la cinta va con items-start y el pie no se empuja al fondo", async () => {
        // JC 2026-09-25: sin items-start flex estira las 30 tarjetas a la más alta y
        // una reseña corta queda con un hueco enorme entre el texto y el pie.
        const m = await montar(cinco());
        expect(m.cinta().className.split(/\s+/)).toContain("items-start");
        for (const pie of m.porEtiqueta("footer")) {
            expect(pie.className.split(/\s+/)).not.toContain("mt-auto");
        }
    });

    it("las estrellas se leen: 'N de 5 estrellas', y no se redondean a cinco", async () => {
        const m = await montar(cinco());
        const etiquetas = m.porAtributo("role", "img").map((e) => e.getAttribute("aria-label"));

        expect(etiquetas).toEqual([
            "Promedio de 4.7 de 5 estrellas",
            "5 de 5 estrellas",
            "4 de 5 estrellas",
            "3 de 5 estrellas",
            "5 de 5 estrellas",
            "5 de 5 estrellas",
        ]);
        // La fila rellena del promedio se recorta al 94 %: 4.7 se ve como 4.7.
        const [promedio] = m.porAtributo("role", "img");
        const relleno = promedio.childNodes[1] as typeof promedio;
        expect(relleno.style.width).toBe("94%");
    });

    it("texto tal cual, sello 'Cuenta verificada' y fecha relativa; sin fecha no hay <time>", async () => {
        const datos = cinco();
        const m = await montar(datos);
        const tarjetas = m.tarjetas();

        expect(tarjetas[0].textContent).toContain("La bitácora del día queda con foto y hora desde la camioneta.");
        for (const t of tarjetas) expect(t.textContent).toContain("Cuenta verificada");
        expect(m.porAtributo("data-icono", "BadgeCheck")).toHaveLength(5);

        // a (hace 21 días), b (hace 3), c (hace 21, la anónima), d (hoy); e no trae fecha.
        const tiempos = m.porEtiqueta("time");
        expect(tiempos).toHaveLength(4);
        expect(tiempos.map((t) => t.textContent)).toEqual(["hace 3 semanas", "hace 3 días", "hace 3 semanas", "hoy"]);
        expect(tiempos[0].getAttribute("datetime")).toBe(datos.resenas[0].publicada_at);
    });

    it("la respuesta del equipo va en su bloque, solo donde existe", async () => {
        const m = await montar(cinco());
        const [ricardo, paola] = m.tarjetas();

        expect(paola.textContent).toContain("Equipo BitacorIA: Gracias, Paola. Lo anotamos para revisarlo con el equipo.");
        expect(ricardo.textContent).not.toContain("Equipo BitacorIA");
    });
});

/* ── Rueda y cuadros del animador de la cinta (JC 2026-09-25) ── */

type Rueda = EventoFalso & {
    deltaX: number;
    deltaY: number;
    deltaMode: number;
    shiftKey: boolean;
    ctrlKey: boolean;
    lenisStopPropagation?: boolean;
};

const rueda = (init: Partial<Pick<Rueda, "deltaX" | "deltaY" | "deltaMode" | "shiftKey" | "ctrlKey">>) =>
    Object.assign(new EventoFalso("wheel"), { deltaX: 0, deltaY: 0, deltaMode: 0, shiftKey: false, ctrlKey: false, ...init }) as Rueda;

/** Pinta cuadros de 60 Hz hasta que la cinta se queda quieta y devuelve scrollLeft tras cada uno. */
async function recorrido(m: Montado, maximo = 600) {
    const posiciones: number[] = [];
    while (m.cuadrosPendientes() > 0 && posiciones.length < maximo) {
        await m.cuadros(1);
        posiciones.push(m.cinta().scrollLeft);
    }
    expect(m.cuadrosPendientes()).toBe(0);
    return posiciones;
}

/** Frena como Lenis: cada cuadro avanza hacia el mismo lado y menos que el anterior,
 *  sin tope ni rebote. El último cuadro es el ajuste (menos de medio píxel) al destino
 *  exacto, por eso queda fuera de la comparación. */
function esperarFrenado(pasos: number[], desde: number) {
    const avances = pasos.map((p, i) => p - (i === 0 ? desde : pasos[i - 1]));
    const sentido = Math.sign(avances[0]);
    expect(sentido).not.toBe(0);
    for (const a of avances) expect(a * sentido).toBeGreaterThan(0);
    for (let i = 1; i < avances.length - 1; i++) expect(Math.abs(avances[i])).toBeLessThan(Math.abs(avances[i - 1]));
    expect(Math.abs(avances[avances.length - 1])).toBeLessThan(0.6);
}

describe("ResenasSection: la cinta", () => {
    /* Clases que imantan la cinta a una tarjeta (JC 2026-09-25): "se clava de
       golpe, como si hubiera un límite por cada scroll". No debe quedar ninguna. */
    const esImán = (clase: string) => /^(?:[\w-]+:)*(?:snap-|scroll-p[xlrse]?-)/.test(clase);

    it("es una región con nombre, enfocable, con barra oculta y SIN imán de scroll", async () => {
        const m = await montar(cinco());
        const cinta = m.cinta();
        const clases = cinta.className.split(/\s+/);

        expect(cinta.getAttribute("aria-label")).toBe("Reseñas de usuarios");
        expect(cinta.getAttribute("tabindex")).toBe("0");
        expect(clases).toEqual(
            expect.arrayContaining(["overflow-x-auto", "overscroll-x-contain", "scrollbar-hide", "items-start", "px-6", "lg:px-12", "lg:cursor-grab"])
        );
        expect(clases.filter(esImán)).toEqual([]);
        for (const t of m.tarjetas()) {
            const c = t.className.split(/\s+/);
            expect(c).toEqual(expect.arrayContaining(["shrink-0", "w-[280px]", "sm:w-[300px]"]));
            expect(c.filter(esImán)).toEqual([]);
        }
    });

    it("el código fuente no trae ningún snap ni scroll-padding (tampoco al arrastrar)", () => {
        const fuente = readFileSync(join(__dirname, "..", "ResenasSection.tsx"), "utf8")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/^\s*\/\/.*$/gm, "");
        expect(fuente).not.toMatch(/\bsnap-|scroll-p[xlrse]?-/);
    });

    describe("rueda y trackpad: animador propio, suave (JC 2026-09-25)", () => {
        // Antes la cinta llevaba data-lenis-prevent-wheel y le quitaba a Lenis también
        // la rueda vertical: a media página el scroll se volvía nativo y brincaba.
        // Después, el gesto horizontal iba nativo y con snap: a saltos y clavado.
        const MEDIDAS = { scrollLeft: 0, scrollWidth: 2000, clientWidth: 800 };

        it("ya no aparta a Lenis de toda la rueda: sin data-lenis-prevent-wheel", async () => {
            const m = await montar(cinco());
            expect(m.cinta().hasAttribute("data-lenis-prevent-wheel")).toBe(false);
            expect(m.cinta().hasAttribute("data-lenis-prevent")).toBe(false);
        });

        it("el oyente de rueda no es pasivo: si lo fuera, Chrome ignoraría el preventDefault", async () => {
            // JC 2026-09-25: con un oyente pasivo el scroll nativo (a saltos) se mezclaría
            // con el animador en cada gesto horizontal y la cinta volvería a ir a tirones.
            // El DOM falso no distingue pasivo de no pasivo al cancelar; por eso se mira aquí.
            const m = await montar(cinco());
            const envoltura = m.cinta().parentNode as ElementoDesplazable;
            expect(envoltura.opcionesDe("wheel")).toMatchObject({ passive: false });
        });

        it("con el cursor sobre una flecha la rueda horizontal también mueve la cinta", async () => {
            // JC 2026-09-25: las flechas son hermanas de la cinta y la tapan; con el oyente
            // solo en la cinta quedaba ahí un punto muerto de 40x40.
            const m = await montar(cinco());
            await m.medirCinta(MEDIDAS);
            const flecha = m.flecha("Ver más reseñas")!;

            const e = rueda({ deltaX: 100 });
            await m.disparar(flecha, e);
            expect(e.defaultPrevented).toBe(true);
            expect(e.lenisStopPropagation).toBe(true);
            expect(m.cuadrosPendientes()).toBe(1);
            await recorrido(m);
            expect(m.cinta().scrollLeft).toBe(100);
        });

        it("la rueda vertical sobre la cinta sigue siendo de Lenis: ni se marca, ni se cancela, ni anima", async () => {
            const m = await montar(cinco());
            await m.medirCinta(MEDIDAS);

            for (const e of [rueda({ deltaY: 120 }), rueda({ deltaX: 10, deltaY: 60 })]) {
                await m.disparar(m.cinta(), e);
                expect(e.lenisStopPropagation).toBeUndefined();
                expect(e.defaultPrevented).toBe(false);
            }
            expect(m.cuadrosPendientes()).toBe(0);
            expect(m.cinta().scrollLeft).toBe(0);
        });

        it("el gesto horizontal se queda en la cinta: cancela el nativo, aparta a Lenis y avanza suave en varios cuadros", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta(MEDIDAS);

            const e = rueda({ deltaX: 300, deltaY: 6 });
            await m.disparar(cinta, e);
            expect(e.defaultPrevented).toBe(true);
            expect(e.lenisStopPropagation).toBe(true);
            // Nada se mueve de golpe: la rueda solo fija el destino.
            expect(cinta.scrollLeft).toBe(0);

            const pasos = await recorrido(m);
            // Primer cuadro: el 12 % del camino; luego frena, no se clava.
            expect(pasos[0]).toBeCloseTo(36, 6);
            esperarFrenado(pasos, 0);
            expect(pasos.length).toBeGreaterThan(20);
            expect(pasos[pasos.length - 1]).toBe(300);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("el paso depende del tiempo y no de los cuadros: a 120 Hz llega igual que a 60 Hz", async () => {
            const posicionesA = async (cuadrosPorPaso: number) => {
                const m = await montar(cinco());
                await m.medirCinta(MEDIDAS);
                await m.disparar(m.cinta(), rueda({ deltaX: 300 }));
                await m.cuadros(1);
                const salida: number[] = [];
                for (let i = 0; i < 4; i++) {
                    await m.cuadros(cuadrosPorPaso, CUADRO_MS / cuadrosPorPaso);
                    salida.push(m.cinta().scrollLeft);
                }
                await montado?.desmontar();
                montado = null;
                return salida;
            };
            const a60 = await posicionesA(1);
            const a120 = await posicionesA(2);
            a60.forEach((p, i) => expect(a120[i]).toBeCloseTo(p, 6));
        });

        it("Shift + rueda cuenta como horizontal", async () => {
            const m = await montar(cinco());
            await m.medirCinta(MEDIDAS);

            const e = rueda({ deltaY: 100, shiftKey: true });
            await m.disparar(m.cinta(), e);

            expect(e.lenisStopPropagation).toBe(true);
            expect(e.defaultPrevented).toBe(true);
            await recorrido(m);
            expect(m.cinta().scrollLeft).toBe(100);
        });

        it("Ctrl + rueda es zoom (o pellizco del trackpad): no se toca", async () => {
            const m = await montar(cinco());
            await m.medirCinta(MEDIDAS);

            const e = rueda({ deltaX: 80, ctrlKey: true });
            await m.disparar(m.cinta(), e);

            expect(e.lenisStopPropagation).toBeUndefined();
            expect(e.defaultPrevented).toBe(false);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("normaliza la rueda por líneas (×16) y por páginas (×ancho visible)", async () => {
            const m = await montar(cinco());
            await m.medirCinta({ scrollLeft: 0, scrollWidth: 3000, clientWidth: 800 });

            await m.disparar(m.cinta(), rueda({ deltaX: 3, deltaMode: 1 }));
            await recorrido(m);
            expect(m.cinta().scrollLeft).toBe(48);

            await m.disparar(m.cinta(), rueda({ deltaX: 1, deltaMode: 2 }));
            await recorrido(m);
            expect(m.cinta().scrollLeft).toBe(848);
        });

        it("en el extremo no se toca: la cinta ya no avanza hacia ese lado", async () => {
            const m = await montar(cinco());
            await m.medirCinta({ scrollLeft: 1200, scrollWidth: 2000, clientWidth: 800 });
            const alFinal = rueda({ deltaX: 40 });
            await m.disparar(m.cinta(), alFinal);
            expect(alFinal.lenisStopPropagation).toBeUndefined();
            expect(alFinal.defaultPrevented).toBe(false);

            await m.medirCinta({ scrollLeft: 0, scrollWidth: 2000, clientWidth: 800 });
            const alInicio = rueda({ deltaX: -40 });
            await m.disparar(m.cinta(), alInicio);
            expect(alInicio.lenisStopPropagation).toBeUndefined();
            expect(alInicio.defaultPrevented).toBe(false);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("el destino queda acotado: ni un rodillazo la lleva más allá del final ni antes del inicio", async () => {
            const m = await montar(cinco());
            await m.medirCinta(MEDIDAS);

            await m.disparar(m.cinta(), rueda({ deltaX: 5000 }));
            const ida = await recorrido(m);
            expect(Math.max(...ida)).toBeLessThanOrEqual(1200);
            expect(ida[ida.length - 1]).toBe(1200);

            await m.disparar(m.cinta(), rueda({ deltaX: -9000 }));
            const vuelta = await recorrido(m);
            expect(Math.min(...vuelta)).toBeGreaterThanOrEqual(0);
            expect(vuelta[vuelta.length - 1]).toBe(0);
        });

        it("rodar otra vez a media animación suma al destino y sigue desde donde va, sin brinco", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta(MEDIDAS);

            await m.disparar(cinta, rueda({ deltaX: 300 }));
            await m.cuadros(3);
            const antes = cinta.scrollLeft;
            const e = rueda({ deltaX: 300 });
            await m.disparar(cinta, e);
            expect(e.defaultPrevented).toBe(true);
            expect(cinta.scrollLeft).toBe(antes);

            await m.cuadros(1);
            expect(cinta.scrollLeft - antes).toBeCloseTo((600 - antes) * 0.12, 6);
            const resto = await recorrido(m);
            expect(resto[resto.length - 1]).toBe(600);
        });

        it("la posición vive en memoria: aunque el navegador redondee scrollLeft y avise con scroll, llega sin estancarse", async () => {
            // Leer scrollLeft en cada cuadro (o resincronizar en onScroll a media
            // animación) deja la cinta a ~8 px del destino: con pasos de menos de un
            // píxel, el redondeo se come el avance.
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta(MEDIDAS);
            let real = 0;
            Object.defineProperty(cinta, "scrollLeft", {
                configurable: true,
                get: () => real,
                set: (v: number) => {
                    real = Math.floor(v);
                },
            });

            await m.disparar(cinta, rueda({ deltaX: 100 }));
            let cuadros = 0;
            while (m.cuadrosPendientes() > 0 && cuadros < 600) {
                await m.cuadros(1);
                await m.disparar(cinta, new EventoFalso("scroll", { bubbles: false }));
                cuadros++;
            }

            expect(cuadros).toBeLessThan(600);
            expect(cinta.scrollLeft).toBe(100);
        });

        it("con 'Reducir movimiento' la rueda salta directo, sin animación", async () => {
            const m = await montar(cinco(), { movimientoReducido: true });
            await m.medirCinta(MEDIDAS);

            const e = rueda({ deltaX: 120 });
            await m.disparar(m.cinta(), e);

            expect(e.defaultPrevented).toBe(true);
            expect(e.lenisStopPropagation).toBe(true);
            expect(m.cinta().scrollLeft).toBe(120);
            expect(m.cuadrosPendientes()).toBe(0);
        });
    });

    it("los extremos se funden con una máscara de 24 px: la tarjeta asomada no se corta en seco", async () => {
        // JC 2026-09-25: el scrollport acaba en el borde del contenedor de 1280px, no de
        // la ventana. 24px no pasa del padding (px-6): en los extremos ninguna tarjeta se funde.
        const m = await montar(cinco());
        const estilo = m.cinta().style as unknown as Record<string, unknown>;
        const esperado = "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)";

        expect(estilo.maskImage).toBe(esperado);
        expect(estilo.WebkitMaskImage).toBe(esperado);
    });

    describe("flechas", () => {
        it("aparecen solo hacia donde hay más contenido, y mueven la cinta con el animador (no con scrollBy)", async () => {
            const m = await montar(cinco());
            expect(m.flecha("Ver más reseñas")).toBeNull();
            expect(m.flecha("Ver reseñas anteriores")).toBeNull();

            await m.medirCinta({ scrollWidth: 2000, clientWidth: 800, scrollLeft: 0 });
            expect(m.flecha("Ver más reseñas")).not.toBeNull();
            expect(m.flecha("Ver reseñas anteriores")).toBeNull();
            expect(m.flecha("Ver más reseñas")!.className.split(/\s+/)).toEqual(expect.arrayContaining(["hidden", "lg:flex"]));

            await m.tocar(m.flecha("Ver más reseñas")!);
            // El smooth nativo iba a su manera (y a saltos con ratón en Windows).
            expect(m.cinta().scrollBy).not.toHaveBeenCalled();
            expect(m.cinta().scrollLeft).toBe(0);
            const ida = await recorrido(m);
            expect(ida[0]).toBeCloseTo(640 * 0.12, 6);
            esperarFrenado(ida, 0);
            expect(ida.length).toBeGreaterThan(20);
            expect(m.cinta().scrollLeft).toBe(640);
            // Al terminar vuelve a medir: ya hay hacia los dos lados.
            expect(m.flecha("Ver más reseñas")).not.toBeNull();
            expect(m.flecha("Ver reseñas anteriores")).not.toBeNull();

            await m.medirCinta({ scrollLeft: 1200 });
            expect(m.flecha("Ver más reseñas")).toBeNull();
            expect(m.flecha("Ver reseñas anteriores")).not.toBeNull();

            await m.tocar(m.flecha("Ver reseñas anteriores")!);
            await recorrido(m);
            expect(m.cinta().scrollLeft).toBe(560);
            expect(m.cinta().scrollBy).not.toHaveBeenCalled();
        });

        it("dos clics seguidos se suman: el segundo parte del destino, no de donde va la cinta", async () => {
            const m = await montar(cinco());
            await m.medirCinta({ scrollWidth: 3000, clientWidth: 800, scrollLeft: 0 });

            await m.tocar(m.flecha("Ver más reseñas")!);
            await m.cuadros(2);
            await m.tocar(m.flecha("Ver más reseñas")!);
            await recorrido(m);

            expect(m.cinta().scrollLeft).toBe(1280);
        });

        it("el destino de la flecha también queda acotado al final de la cinta", async () => {
            const m = await montar(cinco());
            await m.medirCinta({ scrollWidth: 2000, clientWidth: 800, scrollLeft: 1000 });

            await m.tocar(m.flecha("Ver más reseñas")!);
            const pasos = await recorrido(m);

            expect(Math.max(...pasos)).toBeLessThanOrEqual(1200);
            expect(m.cinta().scrollLeft).toBe(1200);
            expect(m.flecha("Ver más reseñas")).toBeNull();
        });

        it("tras un scroll nativo (teclado, dedo) la flecha parte de donde quedó la cinta", async () => {
            const m = await montar(cinco());
            await m.medirCinta({ scrollWidth: 3000, clientWidth: 800, scrollLeft: 500 });

            await m.tocar(m.flecha("Ver más reseñas")!);
            await recorrido(m);

            expect(m.cinta().scrollLeft).toBe(1140);
        });

        it("con 'Reducir movimiento' el salto de las flechas es seco", async () => {
            const m = await montar(cinco(), { movimientoReducido: true });
            await m.medirCinta({ scrollWidth: 2000, clientWidth: 800, scrollLeft: 0 });

            await m.tocar(m.flecha("Ver más reseñas")!);

            expect(m.cinta().scrollLeft).toBe(640);
            expect(m.cuadrosPendientes()).toBe(0);
            expect(m.flecha("Ver reseñas anteriores")).not.toBeNull();
        });
    });

    describe("arrastre con el ratón", () => {
        /** Arrastre a velocidad constante: baja en x0 y se mueve `pasos` veces
         *  `dx` px cada `ms` ms, sin soltar. */
        const arrastrarSinSoltar = async (m: Montado, x0: number, dx: number, pasos: number, ms = 16) => {
            await m.disparar(m.cinta(), m.puntero("pointerdown", x0));
            let x = x0;
            for (let i = 0; i < pasos; i++) {
                m.esperar(ms);
                x += dx;
                await m.disparar(m.cinta(), m.puntero("pointermove", x));
            }
            return x;
        };

        it("desplaza la cinta 1:1, quita la selección mientras dura y se traga el clic que sigue", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            Object.assign(cinta, { scrollWidth: 2000, clientWidth: 800, scrollLeft: 100 });
            const capturar = vi.spyOn(cinta, "setPointerCapture");

            const bajada = m.puntero("pointerdown", 300);
            await m.disparar(cinta, bajada);
            // JC 2026-09-25: toma la captura del puntero para que un arrastre que sale de
            // la cinta siga recibiendo pointermove y pointerup (si no, se queda pegado).
            expect(capturar).toHaveBeenCalledWith(bajada.pointerId);
            expect(cinta.capturas.size).toBe(1);
            await m.disparar(cinta, m.puntero("pointermove", 180));
            expect(cinta.scrollLeft).toBe(220);
            expect(cinta.className.split(/\s+/)).toContain("select-none");
            expect(cinta.className.split(/\s+/).filter(esImán)).toEqual([]);
            expect(m.cuadrosPendientes()).toBe(0);

            await m.disparar(cinta, m.puntero("pointerup", 180));
            expect(cinta.capturas.size).toBe(0);
            expect(cinta.className.split(/\s+/)).not.toContain("select-none");
            expect(cinta.className.split(/\s+/).filter(esImán)).toEqual([]);
            // Sin tiempo entre muestras no hay velocidad: se queda donde se soltó.
            expect(cinta.scrollLeft).toBe(220);
            expect(m.cuadrosPendientes()).toBe(0);

            // El click que el navegador dispara al soltar no llega a nada; el siguiente, sí.
            expect(await m.disparar(cinta, new EventoFalso("click", { clientX: 180 }))).toBe(false);
            expect(await m.disparar(cinta, new EventoFalso("click", { clientX: 180 }))).toBe(true);
        });

        it("un clic sin arrastre (menos de 4 px) no cambia nada ni se traga", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            cinta.scrollLeft = 100;

            await m.arrastrar(300, 302);

            expect(cinta.scrollLeft).toBe(100);
            expect(m.cuadrosPendientes()).toBe(0);
            expect(await m.disparar(cinta, new EventoFalso("click", { clientX: 302 }))).toBe(true);
        });

        it("al soltar con velocidad sigue por inercia unos cuadros, arranca a la velocidad del ratón, frena y se detiene", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            // 20 px cada 16 ms = 1.25 px/ms de la cinta hacia la derecha.
            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            expect(cinta.scrollLeft).toBe(200);
            await m.disparar(cinta, m.puntero("pointerup", x));
            // Soltar no mueve nada por sí solo: la inercia va por cuadros.
            expect(cinta.scrollLeft).toBe(200);
            expect(m.cuadrosPendientes()).toBe(1);

            const pasos = await recorrido(m);
            // Sin empujón ni frenazo al soltar: el primer cuadro va a ~1.25 px/ms.
            expect((pasos[0] - 200) / CUADRO_MS).toBeCloseTo(1.25, 1);
            esperarFrenado(pasos, 200);
            expect(pasos.length).toBeGreaterThan(10);
            // Recorre velocidad × 300 ms y ahí se queda.
            expect(cinta.scrollLeft).toBeCloseTo(200 + 1.25 * 300, 6);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("si el ratón se quedó quieto antes de soltar, no hay inercia", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            m.esperar(150);
            await m.disparar(cinta, m.puntero("pointerup", x));

            expect(cinta.scrollLeft).toBe(200);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("la inercia también queda acotada al final de la cinta", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 2000, clientWidth: 800, scrollLeft: 1000 });

            const x = await arrastrarSinSoltar(m, 600, -40, 4);
            await m.disparar(cinta, m.puntero("pointerup", x));
            const pasos = await recorrido(m);

            expect(Math.max(...pasos)).toBeLessThanOrEqual(1200);
            expect(cinta.scrollLeft).toBe(1200);
        });

        it("soltar cerca del final no frena de golpe: el primer cuadro sigue a la velocidad del ratón y llega suave al borde", async () => {
            // JC 2026-09-25: con el destino acotado, el primer cuadro iba a un tercio de la
            // velocidad del ratón (11 px en vez de 33): el "se clava" al soltar.
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 2000, clientWidth: 800, scrollLeft: 840 });

            // 32 px cada 16 ms = 2 px/ms; se suelta en 1000, a 200 px del final (1200).
            const x = await arrastrarSinSoltar(m, 600, -32, 5);
            expect(cinta.scrollLeft).toBe(1000);
            await m.disparar(cinta, m.puntero("pointerup", x));
            const pasos = await recorrido(m);

            const velocidad = (pasos[0] - 1000) / CUADRO_MS;
            expect(velocidad).toBeGreaterThan(2 * 0.9);
            expect(velocidad).toBeLessThan(2 * 1.1);
            esperarFrenado(pasos, 1000);
            expect(Math.max(...pasos)).toBeLessThanOrEqual(1200);
            expect(cinta.scrollLeft).toBe(1200);
        });

        it("a 144 Hz el primer cuadro de la inercia usa el intervalo real, no uno de 60 Hz: sin empujón", async () => {
            // JC 2026-09-25: contar el primer cuadro como de 16.7 ms movía la cinta 2.3 veces
            // lo que se movía el ratón en un cuadro de 144 Hz.
            const HZ144 = 1000 / 144;
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 8000, clientWidth: 800, scrollLeft: 100 });

            const soltarYVer = async () => {
                // 16 px cada 16 ms = 1 px/ms.
                const x = await arrastrarSinSoltar(m, 600, -16, 5);
                const alSoltar = cinta.scrollLeft;
                await m.disparar(cinta, m.puntero("pointerup", x));
                const pasos: number[] = [];
                while (m.cuadrosPendientes() > 0 && pasos.length < 2000) {
                    await m.cuadros(1, HZ144);
                    pasos.push(cinta.scrollLeft);
                }
                expect(m.cuadrosPendientes()).toBe(0);
                return pasos[0] - alSoltar;
            };

            // La primera inercia enseña al animador cuánto dura un cuadro de esta pantalla.
            await soltarYVer();
            const primerPaso = await soltarYVer();
            expect(primerPaso / HZ144).toBeGreaterThan(0.95);
            expect(primerPaso / HZ144).toBeLessThan(1.05);
        });

        it("un clic a media inercia la frena en seco donde va, y el arrastre nuevo parte de ahí", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            await m.disparar(cinta, m.puntero("pointerup", x));
            await m.cuadros(5);
            const donde = cinta.scrollLeft;
            expect(donde).toBeGreaterThan(200);

            await m.disparar(cinta, m.puntero("pointerdown", 300));
            expect(m.cuadrosPendientes()).toBe(0);
            await m.cuadros(3);
            expect(cinta.scrollLeft).toBe(donde);

            await m.disparar(cinta, m.puntero("pointermove", 290));
            expect(cinta.scrollLeft).toBeCloseTo(donde + 10, 6);
            await m.disparar(cinta, m.puntero("pointerup", 290));
        });

        it("la rueda a media inercia parte de donde va la cinta, no del destino de la inercia", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            await m.disparar(cinta, m.puntero("pointerup", x));
            await m.cuadros(3);
            const donde = cinta.scrollLeft;

            const e = rueda({ deltaX: -100 });
            await m.disparar(cinta, e);
            expect(e.defaultPrevented).toBe(true);
            expect(cinta.scrollLeft).toBe(donde);
            await recorrido(m);

            expect(cinta.scrollLeft).toBeCloseTo(donde - 100, 6);
        });

        it("con 'Reducir movimiento' no hay inercia: se queda donde se soltó", async () => {
            const m = await montar(cinco(), { movimientoReducido: true });
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            await m.disparar(cinta, m.puntero("pointerup", x));

            expect(cinta.scrollLeft).toBe(200);
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("si el navegador cancela el puntero no hay inercia, pero el clic que sigue se traga", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollWidth: 4000, clientWidth: 800, scrollLeft: 100 });

            const x = await arrastrarSinSoltar(m, 600, -20, 5);
            expect(cinta.capturas.size).toBe(1);
            await m.disparar(cinta, m.puntero("pointercancel", x));

            // La captura también se suelta al cancelar (JC 2026-09-25).
            expect(cinta.capturas.size).toBe(0);
            expect(m.cuadrosPendientes()).toBe(0);
            expect(cinta.className.split(/\s+/)).not.toContain("select-none");
            expect(await m.disparar(cinta, new EventoFalso("click", { clientX: x }))).toBe(false);
        });
    });

    describe("con el dedo", () => {
        it("no interviene: el desplazamiento nativo manda y no se anima nada", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            cinta.scrollLeft = 100;

            await m.arrastrar(300, 100, "touch");

            expect(cinta.scrollLeft).toBe(100);
            expect(cinta.className.split(/\s+/)).not.toContain("select-none");
            expect(m.cuadrosPendientes()).toBe(0);
        });

        it("un toque a media animación la cancela y deja la cinta al dedo", async () => {
            const m = await montar(cinco());
            const cinta = m.cinta();
            await m.medirCinta({ scrollLeft: 0, scrollWidth: 2000, clientWidth: 800 });

            await m.disparar(cinta, rueda({ deltaX: 300 }));
            await m.cuadros(2);
            const donde = cinta.scrollLeft;

            await m.disparar(cinta, m.puntero("pointerdown", 300, "touch"));
            expect(m.cuadrosPendientes()).toBe(0);
            await m.cuadros(3);
            expect(cinta.scrollLeft).toBe(donde);

            // El dedo la mueve (scroll nativo): la próxima animación parte de ahí.
            await m.medirCinta({ scrollLeft: 700 });
            await m.disparar(cinta, rueda({ deltaX: 100 }));
            await recorrido(m);
            expect(cinta.scrollLeft).toBe(800);
        });
    });

    it("al desmontar cancela el cuadro pendiente y quita los oyentes de resize y de rueda", async () => {
        const m = await montar(cinco());
        const cinta = m.cinta();
        await m.medirCinta({ scrollLeft: 0, scrollWidth: 2000, clientWidth: 800 });
        await m.disparar(cinta, rueda({ deltaX: 300 }));
        await m.cuadros(2);
        expect(m.cuadrosPendientes()).toBe(1);

        const ventana = globalThis.window as unknown as { oyentesDe(tipo: string): number };
        // La rueda se escucha en la envoltura de la cinta y las flechas (JC 2026-09-25).
        const envoltura = cinta.parentNode as ElementoDesplazable;
        expect(ventana.oyentesDe("resize")).toBe(1);
        expect(envoltura.oyentesDe("wheel")).toBe(1);
        const donde = cinta.scrollLeft;

        await m.desmontar();
        montado = null;

        expect(m.cuadrosPendientes()).toBe(0);
        expect(ventana.oyentesDe("resize")).toBe(0);
        expect(envoltura.oyentesDe("wheel")).toBe(0);
        await m.cuadros(3);
        expect(cinta.scrollLeft).toBe(donde);
    });
});

describe("la portada monta la sección debajo de los planes (hero → planes → reseñas)", () => {
    const leer = (ruta: string) =>
        readFileSync(join(__dirname, "..", "..", "..", ruta), "utf8")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

    it("page.tsx es de servidor: sin 'use client', lee obtenerResenas y pinta LandingHome", () => {
        const pagina = leer("app/page.tsx");
        expect(pagina).not.toMatch(/["']use client["']/);
        expect(pagina).toMatch(/export default async function/);
        expect(pagina).toContain("await obtenerResenas()");
        expect(pagina).toContain("<LandingHome resenas={resenas} />");
    });

    it("LandingHome: hero, luego planes, luego reseñas solo si hay datos, luego el pie", () => {
        // JC 2026-09-25: JC pidió el orden hero → planes → reseñas.
        const home = leer("components/ui/LandingHome.tsx");
        const hero = home.indexOf("<HeroHybrid");
        const planes = home.indexOf("<PlanesSection");
        const resenas = home.indexOf("{resenas && <ResenasSection resenas={resenas} />}");
        const pie = home.indexOf("<FooterSection");

        expect(hero).toBeGreaterThan(-1);
        expect(planes).toBeGreaterThan(hero);
        expect(resenas).toBeGreaterThan(planes);
        expect(pie).toBeGreaterThan(resenas);
    });

    it("el sobre-título bronce de reseñas y el de planes van con la misma opacidad (D9, cumple AA)", () => {
        // JC 2026-09-25: son las dos únicas cabeceras con este patrón y quedan una debajo
        // de la otra; al 40 % (65) Planes no llegaba a AA sobre #080808.
        const token = (fuente: string, texto: string) => {
            const indice = fuente.indexOf(texto);
            expect(indice).toBeGreaterThan(-1);
            const previo = fuente.slice(Math.max(0, indice - 400), indice);
            return previo.match(/color: `\$\{BRONZE\}([0-9A-Fa-f]{2})`/g)?.pop() ?? null;
        };
        const resenas = token(leer("components/ui/ResenasSection.tsx"), "Lo que dicen en obra");
        const planes = token(leer("components/ui/PlanesSection.tsx"), "Planes &amp; Precios");

        expect(resenas).toBe("color: `${BRONZE}D9`");
        expect(planes).toBe(resenas);
    });
});
