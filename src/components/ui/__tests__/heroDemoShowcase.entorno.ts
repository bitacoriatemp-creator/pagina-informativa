import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import ts from "typescript";
import { vi } from "vitest";

import * as assetPath from "../../../lib/assetPath";
import * as eventos from "../../../lib/eventos";

/**
 * Entorno mínimo para montar HeroDemoShowcase en vitest (JC 2026-09-24).
 *
 * Por qué a mano y no jsdom + Testing Library: el repo no los trae y este
 * cambio no toca package.json. Y por qué se transpila el componente aquí: el
 * tsconfig tiene "jsx": "preserve" (lo pide Next), así que Vite no sabe
 * importar un .tsx desde un test; TypeScript sí está en devDependencies.
 *
 * Cubre solo lo que React DOM 18 y el componente usan: árbol de nodos,
 * atributos, estilos, eventos con captura y burbuja, <video> con sus
 * propiedades de reproducción, matchMedia, IntersectionObserver, visibilidad y
 * pantalla completa. framer-motion y lucide se sustituyen por etiquetas
 * simples: aquí se prueba el video, no la animación de los puntos.
 */

const requerir = createRequire(import.meta.url);
type ReactModulo = typeof import("react");
type ReactDomCliente = typeof import("react-dom/client");

const HTML = "http://www.w3.org/1999/xhtml";

type Manejador = (e: EventoFalso) => void;
type Oyente = { fn: Manejador; captura: boolean };

export class EventoFalso {
    type: string;
    bubbles = true;
    cancelable = true;
    target: ObjetivoFalso | null = null;
    currentTarget: ObjetivoFalso | null = null;
    defaultPrevented = false;
    eventPhase = 0;
    timeStamp = Date.now();
    isTrusted = true;
    button = 0;
    clientX = 0;
    clientY = 0;
    pointerId = 1;
    pointerType = "touch";
    isPrimary = true;
    key = "";
    detenido = false;
    detenidoDelTodo = false;

    constructor(type: string, init: Partial<Pick<EventoFalso, "bubbles" | "clientX" | "clientY" | "key">> = {}) {
        this.type = type;
        Object.assign(this, init);
    }

    preventDefault() {
        if (this.cancelable) this.defaultPrevented = true;
    }

    stopPropagation() {
        this.detenido = true;
    }

    stopImmediatePropagation() {
        this.detenido = true;
        this.detenidoDelTodo = true;
    }
}

export class ObjetivoFalso {
    private oyentes = new Map<string, Oyente[]>();

    addEventListener(tipo: string, fn: Manejador | null, opciones?: boolean | { capture?: boolean }) {
        if (!fn) return;
        const captura = typeof opciones === "boolean" ? opciones : !!opciones?.capture;
        const lista = this.oyentes.get(tipo) ?? [];
        if (!lista.some((o) => o.fn === fn && o.captura === captura)) lista.push({ fn, captura });
        this.oyentes.set(tipo, lista);
    }

    removeEventListener(tipo: string, fn: Manejador | null, opciones?: boolean | { capture?: boolean }) {
        const captura = typeof opciones === "boolean" ? opciones : !!opciones?.capture;
        const lista = this.oyentes.get(tipo) ?? [];
        this.oyentes.set(
            tipo,
            lista.filter((o) => !(o.fn === fn && o.captura === captura))
        );
    }

    /** Cuántos oyentes hay para un tipo (para comprobar que se limpian). */
    oyentesDe(tipo: string) {
        return this.oyentes.get(tipo)?.length ?? 0;
    }

    protected padre(): ObjetivoFalso | null {
        return null;
    }

    private invocar(e: EventoFalso, fase: "captura" | "objetivo" | "burbuja") {
        e.currentTarget = this;
        for (const o of [...(this.oyentes.get(e.type) ?? [])]) {
            if (fase === "captura" && !o.captura) continue;
            if (fase === "burbuja" && o.captura) continue;
            o.fn.call(this, e);
            if (e.detenidoDelTodo) return;
        }
        // Manejadores on<tipo> (el componente usa video.onended).
        if (fase !== "captura") {
            const propio = (this as unknown as Record<string, unknown>)["on" + e.type];
            if (typeof propio === "function") propio.call(this, e);
        }
    }

    dispatchEvent(e: EventoFalso): boolean {
        e.target = this;
        const ruta: ObjetivoFalso[] = [];
        for (let n = this.padre(); n; n = n.padre()) ruta.push(n);
        for (let k = ruta.length - 1; k >= 0 && !e.detenido; k--) {
            e.eventPhase = 1;
            ruta[k].invocar(e, "captura");
        }
        if (!e.detenido) {
            e.eventPhase = 2;
            this.invocar(e, "objetivo");
        }
        if (e.bubbles) {
            for (const n of ruta) {
                if (e.detenido) break;
                e.eventPhase = 3;
                n.invocar(e, "burbuja");
            }
        }
        e.eventPhase = 0;
        e.currentTarget = null;
        return !e.defaultPrevented;
    }
}

export class NodoFalso extends ObjetivoFalso {
    parentNode: NodoFalso | null = null;
    childNodes: NodoFalso[] = [];

    constructor(
        readonly nodeType: number,
        readonly nodeName: string,
        readonly ownerDocument: DocumentoFalso | null
    ) {
        super();
    }

    protected padre() {
        return this.parentNode;
    }

    get parentElement(): ElementoFalso | null {
        return this.parentNode instanceof ElementoFalso ? this.parentNode : null;
    }

    get firstChild() {
        return this.childNodes[0] ?? null;
    }

    get lastChild() {
        return this.childNodes[this.childNodes.length - 1] ?? null;
    }

    get nextSibling(): NodoFalso | null {
        if (!this.parentNode) return null;
        const hermanos = this.parentNode.childNodes;
        return hermanos[hermanos.indexOf(this) + 1] ?? null;
    }

    get previousSibling(): NodoFalso | null {
        if (!this.parentNode) return null;
        const hermanos = this.parentNode.childNodes;
        return hermanos[hermanos.indexOf(this) - 1] ?? null;
    }

    appendChild<T extends NodoFalso>(hijo: T): T {
        return this.insertBefore(hijo, null);
    }

    insertBefore<T extends NodoFalso>(hijo: T, referencia: NodoFalso | null): T {
        hijo.parentNode?.removeChild(hijo);
        if (referencia) {
            const i = this.childNodes.indexOf(referencia);
            if (i < 0) throw new Error("insertBefore: la referencia no es hija de este nodo");
            this.childNodes.splice(i, 0, hijo);
        } else {
            this.childNodes.push(hijo);
        }
        hijo.parentNode = this;
        return hijo;
    }

    removeChild<T extends NodoFalso>(hijo: T): T {
        const i = this.childNodes.indexOf(hijo);
        if (i < 0) throw new Error("removeChild: no es hijo de este nodo");
        this.childNodes.splice(i, 1);
        hijo.parentNode = null;
        return hijo;
    }

    contains(otro: NodoFalso | null): boolean {
        for (let n = otro; n; n = n.parentNode) if (n === this) return true;
        return false;
    }

    get textContent(): string {
        return this.childNodes.map((c) => c.textContent).join("");
    }

    set textContent(texto: string) {
        this.childNodes.forEach((c) => (c.parentNode = null));
        this.childNodes = [];
        if (texto) this.appendChild(new TextoFalso(String(texto), this.ownerDocument));
    }
}

export class TextoFalso extends NodoFalso {
    nodeValue: string;

    constructor(texto: string, documento: DocumentoFalso | null) {
        super(3, "#text", documento);
        this.nodeValue = texto;
    }

    get data() {
        return this.nodeValue;
    }

    get textContent(): string {
        return this.nodeValue;
    }

    set textContent(texto: string) {
        this.nodeValue = String(texto);
    }
}

export class EstiloFalso {
    [propiedad: string]: unknown;

    setProperty(nombre: string, valor: string) {
        this[nombre] = valor;
    }

    removeProperty(nombre: string) {
        delete this[nombre];
    }

    getPropertyValue(nombre: string) {
        return String(this[nombre] ?? "");
    }
}

export class ElementoFalso extends NodoFalso {
    readonly tagName: string;
    readonly namespaceURI: string;
    readonly atributos = new Map<string, string>();
    style = new EstiloFalso();
    onclick: unknown = null;

    constructor(etiqueta: string, espacio: string, documento: DocumentoFalso) {
        const nombre = espacio === HTML ? etiqueta.toUpperCase() : etiqueta;
        super(1, nombre, documento);
        this.tagName = nombre;
        this.namespaceURI = espacio;
    }

    setAttribute(nombre: string, valor: unknown) {
        this.atributos.set(nombre, String(valor));
    }

    setAttributeNS(_espacio: string | null, nombre: string, valor: unknown) {
        this.setAttribute(nombre, valor);
    }

    getAttribute(nombre: string) {
        return this.atributos.get(nombre) ?? null;
    }

    hasAttribute(nombre: string) {
        return this.atributos.has(nombre);
    }

    removeAttribute(nombre: string) {
        this.atributos.delete(nombre);
    }

    get className() {
        return this.getAttribute("class") ?? "";
    }

    focus() {}
    blur() {}
    setPointerCapture() {}
    releasePointerCapture() {}
    hasPointerCapture() {
        return false;
    }

    getBoundingClientRect() {
        return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 };
    }
}

/** <video> con lo que el componente toca: reproducción, sonido y pantalla completa. */
export class VideoFalso extends ElementoFalso {
    muted = false;
    volume = 1;
    playbackRate = 1;
    currentTime = 0;
    controls = false;
    ended = false;
    paused = true;
    preload = "";
    onended: Manejador | null = null;

    play = vi.fn(() => {
        this.paused = false;
        return Promise.resolve();
    });

    pause = vi.fn(() => {
        this.paused = true;
    });

    /** Como Chrome: entra, avisa con fullscreenchange y resuelve. */
    requestFullscreen: (() => Promise<void>) | undefined = vi.fn(() => {
        const documento = this.ownerDocument!;
        documento.fullscreenElement = this;
        documento.dispatchEvent(new EventoFalso("fullscreenchange"));
        return Promise.resolve();
    });

    /** El del iPhone: abre el reproductor nativo y avisa en el propio video. */
    webkitEnterFullscreen: (() => void) | undefined = vi.fn(() => {
        this.dispatchEvent(new EventoFalso("webkitbeginfullscreen", { bubbles: false }));
    });
}

export class DocumentoFalso extends NodoFalso {
    readonly documentElement: ElementoFalso;
    readonly head: ElementoFalso;
    readonly body: ElementoFalso;
    visibilityState: "visible" | "hidden" = "visible";
    fullscreenElement: ElementoFalso | null = null;

    constructor() {
        super(9, "#document", null);
        this.documentElement = this.appendChild(this.createElement("html"));
        this.head = this.documentElement.appendChild(this.createElement("head"));
        this.body = this.documentElement.appendChild(this.createElement("body"));
    }

    get activeElement() {
        return this.body;
    }

    createElement(etiqueta: string): ElementoFalso {
        const t = etiqueta.toLowerCase();
        return t === "video" ? new VideoFalso(t, HTML, this) : new ElementoFalso(t, HTML, this);
    }

    createElementNS(espacio: string, etiqueta: string) {
        return new ElementoFalso(etiqueta, espacio, this);
    }

    createTextNode(texto: string) {
        return new TextoFalso(texto, this);
    }
}

type Entrada = { isIntersecting: boolean };

export class ObservadorFalso {
    static instancias: ObservadorFalso[] = [];
    desconectado = false;

    constructor(private readonly alCambiar: (entradas: Entrada[]) => void) {
        ObservadorFalso.instancias.push(this);
    }

    observe() {}
    unobserve() {}
    disconnect() {
        this.desconectado = true;
    }

    /** Simula que la tarjeta entra o sale de la vista. */
    disparar(visible: boolean) {
        this.alCambiar([{ isIntersecting: visible }]);
    }
}

class VentanaFalsa extends ObjetivoFalso {
    event: unknown = undefined;
    location = { protocol: "http:" };
    HTMLIFrameElement = class {};

    constructor(
        readonly document: DocumentoFalso,
        private readonly tactil: boolean
    ) {
        super();
    }

    /** El componente pregunta por "(hover: none), (pointer: coarse)". */
    matchMedia(consulta: string) {
        return {
            matches: this.tactil,
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

let componente: import("react").ComponentType | null = null;

function cargarHeroDemoShowcase(React: ReactModulo) {
    if (componente) return componente;
    const ruta = join(__dirname, "..", "HeroDemoShowcase.tsx");
    const { outputText } = ts.transpileModule(readFileSync(ruta, "utf8"), {
        fileName: ruta,
        compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
    });

    const SpanSinAnimacion = ({ animate, transition, ...resto }: Record<string, unknown>) => {
        void animate;
        void transition;
        return React.createElement("span", resto);
    };
    const Volume2 = () => React.createElement("svg", { "data-icono": "Volume2" });
    const VolumeX = () => React.createElement("svg", { "data-icono": "VolumeX" });

    const modulos: Record<string, unknown> = {
        react: React,
        "react/jsx-runtime": requerir("react/jsx-runtime"),
        "framer-motion": { motion: { span: SpanSinAnimacion } },
        "lucide-react": { Volume2, VolumeX },
        "@/lib/assetPath": assetPath,
        "@/lib/eventos": eventos,
    };
    const requireDelComponente = (id: string) => {
        if (!(id in modulos)) throw new Error(`HeroDemoShowcase importa "${id}": añádelo al entorno de prueba`);
        return modulos[id];
    };

    const modulo = { exports: {} as Record<string, unknown> };
    new Function("require", "module", "exports", outputText)(requireDelComponente, modulo, modulo.exports);
    componente = modulo.exports.default as import("react").ComponentType;
    return componente;
}

/* ── Montaje ── */

export type Montado = Awaited<ReturnType<typeof montarHeroDemoShowcase>>;

/**
 * Instala el navegador falso (táctil o con ratón), monta el componente y
 * devuelve atajos para buscar nodos y disparar gestos dentro de act().
 */
export async function montarHeroDemoShowcase({ tactil }: { tactil: boolean }) {
    const documento = new DocumentoFalso();
    const ventana = new VentanaFalsa(documento, tactil);
    ObservadorFalso.instancias = [];

    const global = globalThis as Record<string, unknown>;
    const previos = {
        window: global.window,
        document: global.document,
        IntersectionObserver: global.IntersectionObserver,
        IS_REACT_ACT_ENVIRONMENT: global.IS_REACT_ACT_ENVIRONMENT,
    };
    global.window = ventana;
    global.document = documento;
    global.IntersectionObserver = ObservadorFalso;
    global.IS_REACT_ACT_ENVIRONMENT = true;
    // Node 20 (el del CI) no trae `navigator` global y Node 21+ sí (JC 2026-09-25).
    // react-dom en desarrollo lo lee al cargar si ve una `window` (el aviso de las
    // DevTools): sin esto, en CI revienta con "navigator is not defined". Solo se
    // pone si falta; en Node 21+ es un getter de solo lectura y no se toca.
    const poneNavigator = typeof global.navigator === "undefined";
    if (poneNavigator) global.navigator = { userAgent: "node" };

    // react-dom se carga DESPUÉS de instalar window/document: decide al cargar
    // si hay DOM y, sin él, no escucharía eventos.
    const React = requerir("react") as ReactModulo;
    const { createRoot } = requerir("react-dom/client") as ReactDomCliente;
    const Hero = cargarHeroDemoShowcase(React);

    const contenedor = documento.body.appendChild(documento.createElement("div"));
    const raiz = createRoot(contenedor as unknown as Element);
    await React.act(async () => {
        raiz.render(React.createElement(Hero));
    });

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
    const videos = () => elementos().filter((e): e is VideoFalso => e instanceof VideoFalso);
    const tarjeta = () => videos()[0].parentElement!;
    const puntos = () => elementos().filter((e) => e.getAttribute("aria-label")?.startsWith("Ver demo de"));
    /** Índice del demo activo según el punto marcado. */
    const activo = () => puntos().findIndex((p) => p.getAttribute("aria-current") === "true");

    const disparar = async (objetivo: ObjetivoFalso, evento: EventoFalso) => {
        await React.act(async () => {
            objetivo.dispatchEvent(evento);
        });
    };

    return {
        documento,
        contenedor,
        elementos,
        videos,
        tarjeta,
        puntos,
        activo,
        observador: () => ObservadorFalso.instancias[0],
        act: React.act,
        disparar,
        tocar: (el: ObjetivoFalso) => disparar(el, new EventoFalso("click")),
        tecla: (el: ObjetivoFalso, key: string) => disparar(el, new EventoFalso("keydown", { key })),
        /** Deslizamiento horizontal completo: pointerdown, pointerup y el click que puede seguirle. */
        deslizar: async (el: ObjetivoFalso, dx: number) => {
            await disparar(el, new EventoFalso("pointerdown", { clientX: 200, clientY: 100 }));
            await disparar(el, new EventoFalso("pointerup", { clientX: 200 + dx, clientY: 104 }));
            await disparar(el, new EventoFalso("click", { clientX: 200 + dx, clientY: 104 }));
        },
        /** Salida de la pantalla completa de Chrome (atrás o el botón de salir). */
        salirDePantallaCompleta: async () => {
            documento.fullscreenElement = null;
            await disparar(documento, new EventoFalso("fullscreenchange"));
        },
        desmontar: async () => {
            await React.act(async () => {
                raiz.unmount();
            });
            for (const [clave, valor] of Object.entries(previos)) {
                if (valor === undefined) delete global[clave];
                else global[clave] = valor;
            }
            if (poneNavigator) delete global.navigator;
        },
    };
}
