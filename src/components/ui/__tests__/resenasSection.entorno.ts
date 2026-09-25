import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import ts from "typescript";
import { vi } from "vitest";

import * as resenasFormato from "../../../lib/resenasFormato";
import type { Resenas } from "../../../lib/resenasFormato";
// OJO al subir (JC 2026-09-25): heroDemoShowcase.entorno.ts es del trabajo del
// video móvil y va en su propio commit. Este archivo y resenasSection.test.ts
// lo importan, así que el commit de reseñas debe ir DESPUÉS (o junto) al del
// video; si sube solo, vitest no encuentra el helper y los tests de la cinta
// revientan en CI. Queda anotado también en docs/DECISIONES.md.
import { DocumentoFalso, ElementoFalso, EventoFalso, NodoFalso, ObjetivoFalso } from "./heroDemoShowcase.entorno";

/**
 * Entorno mínimo para montar ResenasSection en vitest (JC 2026-09-25).
 *
 * Reutiliza el DOM falso de heroDemoShowcase.entorno.ts (nodos, atributos,
 * eventos con captura y burbuja) sin tocarlo: aquí solo se añade lo que la
 * cinta usa y el hero no —scrollLeft/scrollWidth/clientWidth y scrollBy en
 * los elementos, matchMedia con "Reducir movimiento" en la ventana, y un
 * reloj con requestAnimationFrame que el test avanza a mano— y el mapa de
 * módulos propio del componente. framer-motion y lucide se sustituyen por
 * etiquetas simples: se prueba la cinta, no la animación de entrada.
 */

/** Un cuadro a 60 Hz, lo que dura un cuadro si el test no dice otra cosa. */
export const CUADRO_MS = 1000 / 60;

const requerir = createRequire(import.meta.url);
type ReactModulo = typeof import("react");
type ReactDomCliente = typeof import("react-dom/client");

const HTML = "http://www.w3.org/1999/xhtml";

/**
 * Elemento con lo que la cinta lee y mueve al desplazarse. Además, como un
 * navegador de verdad, los atributos HTML no distinguen mayúsculas: React
 * hace setAttribute("referrerPolicy") y el test pregunta por "referrerpolicy".
 */
export class ElementoDesplazable extends ElementoFalso {
    scrollLeft = 0;
    scrollWidth = 0;
    clientWidth = 0;

    scrollBy = vi.fn((opciones: { left?: number; behavior?: string }) => {
        this.scrollLeft += opciones.left ?? 0;
    });

    /* Opciones con que se registró cada tipo de oyente (JC 2026-09-25). El DOM
       base descarta `passive` y su preventDefault funciona siempre; así el test
       puede comprobar que la rueda NO es pasiva: en Chrome, un oyente pasivo
       ignora el preventDefault y el scroll nativo, a saltos, vuelve a mezclarse
       con el animador. */
    private readonly opcionesOyente = new Map<string, unknown>();

    addEventListener(...args: Parameters<ElementoFalso["addEventListener"]>) {
        this.opcionesOyente.set(args[0], args[2]);
        super.addEventListener(...args);
    }

    opcionesDe(tipo: string) {
        return this.opcionesOyente.get(tipo);
    }

    /* Captura del puntero con estado real (JC 2026-09-25): en el DOM base no hace
       nada y hasPointerCapture da siempre false, así que ningún test veía si el
       arrastre la tomaba y la soltaba. Sin ella, un arrastre que sale de la cinta
       deja de recibir pointerup y se queda pegado. */
    readonly capturas = new Set<number>();

    setPointerCapture(id?: number) {
        if (id !== undefined) this.capturas.add(id);
    }

    releasePointerCapture(id?: number) {
        if (id !== undefined) this.capturas.delete(id);
    }

    hasPointerCapture(id?: number) {
        return id !== undefined && this.capturas.has(id);
    }

    private clave(nombre: string) {
        return this.namespaceURI === HTML ? nombre.toLowerCase() : nombre;
    }

    setAttribute(nombre: string, valor: unknown) {
        super.setAttribute(this.clave(nombre), valor);
    }

    getAttribute(nombre: string) {
        return super.getAttribute(this.clave(nombre));
    }

    hasAttribute(nombre: string) {
        return super.hasAttribute(this.clave(nombre));
    }

    removeAttribute(nombre: string) {
        super.removeAttribute(this.clave(nombre));
    }
}

class DocumentoCinta extends DocumentoFalso {
    createElement(etiqueta: string): ElementoFalso {
        return new ElementoDesplazable(etiqueta.toLowerCase(), HTML, this);
    }
}

class VentanaFalsa extends ObjetivoFalso {
    event: unknown = undefined;
    location = { protocol: "http:" };
    HTMLIFrameElement = class {};

    /* Animador de la cinta (JC 2026-09-25): el reloj solo avanza cuando el test
       lo pide y los cuadros solo corren cuando el test los pinta. Va en la
       ventana y no en globalThis para no mover el reloj con el que el
       scheduler de React mide sus tiempos. */
    reloj = 0;
    private siguienteCuadro = 1;
    readonly cuadrosPendientes = new Map<number, (t: number) => void>();
    readonly performance = { now: () => this.reloj };

    requestAnimationFrame(fn: (t: number) => void) {
        const id = this.siguienteCuadro++;
        this.cuadrosPendientes.set(id, fn);
        return id;
    }

    cancelAnimationFrame(id: number) {
        this.cuadrosPendientes.delete(id);
    }

    /** Un cuadro: adelanta el reloj y corre lo que estaba pedido hasta ahora
     *  (lo que se pida durante el cuadro va al siguiente, como en el navegador). */
    pintarCuadro(ms: number) {
        this.reloj += ms;
        const pendientes = Array.from(this.cuadrosPendientes.values());
        this.cuadrosPendientes.clear();
        for (const fn of pendientes) fn(this.reloj);
    }

    constructor(
        readonly document: DocumentoFalso,
        private readonly movimientoReducido: boolean
    ) {
        super();
    }

    /** El componente pregunta por "(prefers-reduced-motion: reduce)". */
    matchMedia(consulta: string) {
        return {
            matches: /prefers-reduced-motion/.test(consulta) && this.movimientoReducido,
            media: consulta,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
        };
    }
}

/* ── Carga del componente ── */

type Props = { resenas: Resenas };
let componente: import("react").ComponentType<Props> | null = null;

/* Props de framer-motion que un <div> normal no entiende. */
const PROPS_MOTION = ["initial", "animate", "whileInView", "viewport", "transition", "variants", "custom", "layoutId", "exit"];

function cargarResenasSection(React: ReactModulo) {
    if (componente) return componente;
    const ruta = join(__dirname, "..", "ResenasSection.tsx");
    const { outputText } = ts.transpileModule(readFileSync(ruta, "utf8"), {
        fileName: ruta,
        compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
    });

    /* motion.div, motion.p… → la etiqueta a secas, sin las props de animación. */
    const motion = new Proxy({} as Record<string, unknown>, {
        get: (_objetivo, etiqueta: string) => {
            const SinAnimacion = (props: Record<string, unknown>) => {
                const limpias: Record<string, unknown> = {};
                for (const [clave, valor] of Object.entries(props)) {
                    if (PROPS_MOTION.indexOf(clave) < 0) limpias[clave] = valor;
                }
                return React.createElement(etiqueta, limpias);
            };
            SinAnimacion.displayName = `motion.${etiqueta}`;
            return SinAnimacion;
        },
    });
    const icono = (nombre: string) => {
        const Icono = (props: Record<string, unknown>) => {
            const { size, strokeWidth, fill, ...resto } = props;
            void size;
            void strokeWidth;
            void fill;
            return React.createElement("svg", { "data-icono": nombre, ...resto });
        };
        Icono.displayName = nombre;
        return Icono;
    };

    const modulos: Record<string, unknown> = {
        react: React,
        "react/jsx-runtime": requerir("react/jsx-runtime"),
        "framer-motion": { motion },
        "lucide-react": {
            BadgeCheck: icono("BadgeCheck"),
            ChevronLeft: icono("ChevronLeft"),
            ChevronRight: icono("ChevronRight"),
            Star: icono("Star"),
        },
        "@/lib/resenasFormato": resenasFormato,
    };
    const requireDelComponente = (id: string) => {
        if (!(id in modulos)) throw new Error(`ResenasSection importa "${id}": añádelo al entorno de prueba`);
        return modulos[id];
    };

    const modulo = { exports: {} as Record<string, unknown> };
    new Function("require", "module", "exports", outputText)(requireDelComponente, modulo, modulo.exports);
    componente = modulo.exports.default as import("react").ComponentType<Props>;
    return componente;
}

/* ── Montaje ── */

export type Montado = Awaited<ReturnType<typeof montarResenasSection>>;

/**
 * Instala el navegador falso, monta la sección con esas reseñas y devuelve
 * atajos para buscar nodos y disparar gestos dentro de act().
 */
export async function montarResenasSection(resenas: Resenas, { movimientoReducido = false } = {}) {
    const documento = new DocumentoCinta();
    const ventana = new VentanaFalsa(documento, movimientoReducido);

    const global = globalThis as Record<string, unknown>;
    const previos = {
        window: global.window,
        document: global.document,
        IS_REACT_ACT_ENVIRONMENT: global.IS_REACT_ACT_ENVIRONMENT,
    };
    global.window = ventana;
    global.document = documento;
    global.IS_REACT_ACT_ENVIRONMENT = true;

    // react-dom se carga DESPUÉS de instalar window/document: decide al cargar
    // si hay DOM y, sin él, no escucharía eventos.
    const React = requerir("react") as ReactModulo;
    const { createRoot } = requerir("react-dom/client") as ReactDomCliente;
    const Seccion = cargarResenasSection(React);

    const contenedor = documento.body.appendChild(documento.createElement("div")) as ElementoDesplazable;
    const raiz = createRoot(contenedor as unknown as Element);
    await React.act(async () => {
        raiz.render(React.createElement(Seccion, { resenas }));
    });

    /* ElementoFalso y no ElementoDesplazable: los <svg> de los iconos nacen
       con createElementNS y son del tipo base. */
    const elementos = (): ElementoFalso[] => {
        const salida: ElementoFalso[] = [];
        const visitar = (n: NodoFalso) => {
            for (const hijo of n.childNodes) {
                if (hijo instanceof ElementoFalso) {
                    salida.push(hijo);
                    visitar(hijo);
                }
            }
        };
        visitar(contenedor);
        return salida;
    };
    const porEtiqueta = (etiqueta: string) => elementos().filter((e) => e.tagName === etiqueta.toUpperCase());
    const porAtributo = (nombre: string, valor: string) => elementos().filter((e) => e.getAttribute(nombre) === valor);
    const cinta = () => porAtributo("role", "region")[0] as ElementoDesplazable;
    const tarjetas = () => porEtiqueta("article");
    const flecha = (etiqueta: string) => porAtributo("aria-label", etiqueta)[0] ?? null;

    const disparar = async (objetivo: ObjetivoFalso, evento: EventoFalso) => {
        let resultado = true;
        await React.act(async () => {
            resultado = objetivo.dispatchEvent(evento);
        });
        return resultado;
    };

    /** Evento de puntero de ratón (el DOM falso trae "touch" por defecto). */
    const puntero = (tipo: string, clientX: number, pointerType: "mouse" | "touch" = "mouse") => {
        const e = new EventoFalso(tipo, { clientX, clientY: 100 });
        e.pointerType = pointerType;
        return e;
    };

    return {
        documento,
        contenedor,
        elementos,
        porEtiqueta,
        porAtributo,
        cinta,
        tarjetas,
        flecha,
        act: React.act,
        disparar,
        tocar: (el: ObjetivoFalso) => disparar(el, new EventoFalso("click")),
        /** Cambia las medidas de la cinta y avisa con un scroll (no burbujea, como el real). */
        medirCinta: async (medidas: { scrollLeft?: number; scrollWidth?: number; clientWidth?: number }) => {
            Object.assign(cinta(), medidas);
            await disparar(cinta(), new EventoFalso("scroll", { bubbles: false }));
        },
        /** Arrastre con el ratón: baja en x0, se mueve hasta x1 y suelta. */
        arrastrar: async (x0: number, x1: number, pointerType: "mouse" | "touch" = "mouse") => {
            const el = cinta();
            await disparar(el, puntero("pointerdown", x0, pointerType));
            await disparar(el, puntero("pointermove", x1, pointerType));
            await disparar(el, puntero("pointerup", x1, pointerType));
        },
        puntero,
        /** Adelanta el reloj sin pintar cuadros (el tiempo entre dos movimientos del ratón). */
        esperar: (ms: number) => {
            ventana.reloj += ms;
        },
        /** Pinta n cuadros de `ms` cada uno (60 Hz por defecto) dentro de act(). */
        cuadros: async (n = 1, ms = CUADRO_MS) => {
            for (let i = 0; i < n; i++) {
                await React.act(async () => {
                    ventana.pintarCuadro(ms);
                });
            }
        },
        /** Cuántos requestAnimationFrame hay sin correr (0 = la cinta está quieta). */
        cuadrosPendientes: () => ventana.cuadrosPendientes.size,
        desmontar: async () => {
            await React.act(async () => {
                raiz.unmount();
            });
            for (const [clave, valor] of Object.entries(previos)) {
                if (valor === undefined) delete global[clave];
                else global[clave] = valor;
            }
        },
    };
}
