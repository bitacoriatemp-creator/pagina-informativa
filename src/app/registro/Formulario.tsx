"use client";

/* ══════════════════════════════════════════════════════════════════════
   Formulario — la solicitud de demo, a página entera
   ──────────────────────────────────────────────────────────────────────
   Sustituye al antiguo RegistroModal. Pide siete datos: nombre, correo,
   WhatsApp, a qué se dedica, obras activas, qué tan listo está y país.

   2026-11-13 (Luis, tanda 0 del plan registro_filtro): antes los mandaba
   a la base vieja del sitio, que ya no existe, y a todos les salía "Sin
   conexión" en rojo. La tanda 0 dejó de mandar nada: arma el mensaje y
   abre WhatsApp en el mismo clic, y la pantalla dice "Falta un paso".

   Tanda 4 (mismo plan): con el servidor configurado
   (NEXT_PUBLIC_API_BASE_URL y la verificación de Cloudflare,
   NEXT_PUBLIC_TURNSTILE_SITE_KEY) la hoja se guarda en el servidor de
   BitacorIA. Reglas y textos en src/lib/demoServidor.ts,
   src/lib/demoContrato.ts y src/lib/solicitudDemo.ts:
   - llegó (2xx): "Solicitud recibida" y, opcional, el botón de WhatsApp;
   - un dato que el servidor rechaza: el aviso junto a ese campo;
   - verificación vencida: se pide otra y se reintenta una vez;
   - falta una variable o el recuadro no carga (se sabe antes de enviar):
     como en la tanda 0, WhatsApp dentro del mismo clic;
   - cualquier otra cosa, sin red o más de 15 s: no se abre nada solo;
     "No pudimos guardar tu solicitud" con el botón de WhatsApp.
   Nunca la letra roja.
   ══════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Facebook, Instagram } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { getStoredAccount } from "@/lib/account";
import { buildWhatsAppUrl, hasWhatsApp, numeroWhatsAppVisible, type LeadDatos } from "@/lib/whatsapp";
import { HANDOFF_EMAIL, leerPlanDeInteres, marcarSolicitudRecibida, type PlanDeInteres } from "@/lib/registro";
import {
    abrirEnPestanaNueva,
    buildCorreoUrl,
    cabeceraFormulario,
    datosDelMensaje,
    datosPrellenados,
    pasosDespues,
    textosFaltaUnPaso,
    textosNoGuardada,
    textosRecibida,
    type Canal,
    type Modo,
} from "@/lib/solicitudDemo";
import {
    CAMPOS_DEMO,
    INTERESES,
    PAISES,
    PERFILES,
    armarCuerpoDemo,
    type CampoDemo,
    type CuerpoDemo,
    type ErroresDemo,
    type HojaDemo,
} from "@/lib/demoContrato";
import {
    TIEMPO_MAXIMO_TOKEN_MS,
    decidirEnvio,
    enviarConReintento,
    llaveVerificacion,
    urlSolicitudDemo,
    type EstadoVerificacion,
} from "@/lib/demoServidor";
import { registerUrl } from "@/lib/appUrl";
import { pagoPlus } from "@/lib/pagoMercadoPago";
import { botonCrema, botonVerde } from "./botones";
import PagoPlus from "./PagoPlus";
import Verificacion, { type VerificacionHandle } from "./Verificacion";

/* ── Glifos que lucide no trae ── */
const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
    </svg>
);

const DiscordIcon = ({ size = 15 }: { size?: number | string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.369a19.8 19.8 0 0 0-4.885-1.515.07.07 0 0 0-.079.036c-.21.375-.444.865-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.08.08 0 0 0-.079-.036A19.7 19.7 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057q.003.032.027.05a19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028 14 14 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13 13 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10 10 0 0 0 .372-.292.07.07 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .079.009q.18.15.372.293a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .028-.05c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028M8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419s.956-2.419 2.157-2.419c1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418" />
    </svg>
);

const SOCIALES: { label: string; href: string; Icon: React.ComponentType<{ size?: number | string }> }[] = [
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587078702990", Icon: Facebook },
    { label: "Instagram", href: "https://www.instagram.com/bitacor_ia/", Icon: Instagram },
    { label: "Discord", href: "https://discord.gg/2VNC8vhsSP", Icon: DiscordIcon },
];

/** Botón de WhatsApp: hermano de "Solicitar demo" (misma forma, en verde).
    Icono de 16 px y el texto; nada más. */
function WhatsAppCTA({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={botonVerde}>
            <WhatsAppIcon />
            <span>{children}</span>
        </a>
    );
}

/* 16px en móvil evita el zoom automático de iOS al enfocar. */
const campoCls = "campo-linea text-[16px] sm:text-[15px]";
const selectCls = `${campoCls} es-select`;

/* Galón mínimo, el mismo del menú del logo: sin él, un select sin control
   nativo se lee como un botón raro en medio del formulario. */
const Galon = () => (
    <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-0 top-1/2 h-[6px] w-[10px] -translate-y-1/2"
    >
        <path d="M1 1L5 5L9 1" fill="none" stroke="#c39767" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
);

/* Cabecera de cada dato: número en monoespaciada + la pregunta. La
   numeración es lo que da ritmo; sustituye a agrupar en bloques y hace que
   el formulario se lea como una entrada de bitácora. */
function Renglon({ n, htmlFor, children, nota }: { n: string; htmlFor: string; children: React.ReactNode; nota?: string }) {
    return (
        <div className="mb-1 flex items-baseline gap-2.5">
            <span className="font-mono text-[11px] tracking-[0.18em] text-[#c39767]/85">{n}</span>
            <label htmlFor={htmlFor} className="text-[13px] text-white/60">
                {children}
            </label>
            {nota && <span className="ml-auto text-[12px] text-white/45">{nota}</span>}
        </div>
    );
}

/* Id de cada campo de la hoja: el aviso de un campo va junto a él. */
const ID_DE: Record<CampoDemo, string> = {
    nombre: "reg-nombre",
    email: "reg-email",
    whatsapp: "reg-whatsapp",
    perfil: "reg-perfil",
    obras_activas: "reg-obras",
    interes_compra: "reg-interes",
    pais: "reg-pais",
};

/* Aviso de un campo: ámbar de la paleta, nunca rojo. El lector de pantalla lo
   lee al llegar el foco al campo (aria-describedby). */
function AvisoCampo({ campo, texto }: { campo: CampoDemo; texto?: string }) {
    if (!texto) return null;
    return (
        <p id={`${ID_DE[campo]}-aviso`} className="mt-1.5 text-[13px] leading-snug text-[#e8b97a]">
            {texto}
        </p>
    );
}

/* Lista "qué pasa después" — se pinta dos veces: en la columna izquierda a
   partir de lg, y bajo el formulario en móvil, donde primero va aquello a
   lo que se vino. Los textos salen de pasosDespues() (src/lib/solicitudDemo.ts):
   con servidor, "Te escribimos por WhatsApp"; sin él, quien escribe es la
   persona, con el mensaje ya armado. */
function QuePasaDespues({ canal, modo, className = "" }: { canal: Canal; modo: Modo; className?: string }) {
    return (
        <ul className={`divide-y divide-white/[0.06] border-t border-white/[0.06] ${className}`}>
            {pasosDespues(canal, modo).map(([titulo, detalle]) => (
                <li key={titulo} className="flex gap-4 py-4">
                    {/* Un guion de bronce, no un número: los folios 01-06 ya numeran
                        los campos, y repetir ese tratamiento aquí pone dos sistemas
                        de numeración idénticos en la misma pantalla. */}
                    <span aria-hidden className="mt-[11px] h-px w-4 shrink-0 bg-[#c39767]/45" />
                    <div>
                        <p className="text-[14px] text-white/80">{titulo}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-white/35">{detalle}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

const enlaceBronce =
    "text-[#c39767] underline decoration-[#c39767]/40 underline-offset-4 transition-colors hover:text-[#e8c9a0]";

/* Lee la hoja tal como está escrita. La limpieza y la revisión las hace
   armarCuerpoDemo (src/lib/demoContrato.ts), igual con servidor o sin él. */
function leerHoja(form: HTMLFormElement, planInteres: PlanDeInteres | null): HojaDemo {
    const fd = new FormData(form);
    const v = (campo: string) => (fd.get(campo) ?? "").toString();
    return {
        nombre: v("nombre"),
        email: v("email"),
        whatsapp: v("whatsapp"),
        pais: v("pais"),
        perfil: v("perfil"),
        obras_activas: v("obras_activas"),
        interes_compra: v("interes_compra"),
        plan: planInteres?.clave ?? null,
    };
}

/* Qué hay en la columna derecha. "falta" = tanda 0 (nada guardado: falta que
   la persona mande el mensaje); "recibida" = el servidor la guardó;
   "no_guardada" = el servidor no la guardó. */
type Pantalla =
    | { tipo: "hoja" }
    | { tipo: "falta"; datos: LeadDatos }
    | { tipo: "recibida"; datos: LeadDatos }
    | { tipo: "no_guardada"; datos: LeadDatos };

export default function Formulario() {
    const [pantalla, setPantalla] = useState<Pantalla>({ tipo: "hoja" });
    const [enviando, setEnviando] = useState(false);
    const [errores, setErrores] = useState<ErroresDemo>({});
    const [pais, setPais] = useState("");
    const [verificacion, setVerificacionVisible] = useState<EstadoVerificacion>("cargando");
    const [avisoVerificacion, setAvisoVerificacion] = useState(false);
    const [showOtras, setShowOtras] = useState(false);
    const [prefill, setPrefill] = useState<{ nombre?: string; email?: string }>({});
    /* Plan que trae la URL desde la tarjeta de la página (?plan=plus). null =
       el formulario de siempre (demo). */
    const [planInteres, setPlanInteres] = useState<PlanDeInteres | null>(null);

    const paisRef = useRef<HTMLSelectElement>(null);
    const tituloRef = useRef<HTMLHeadingElement>(null);
    const verificacionRef = useRef<VerificacionHandle>(null);
    /* El token y el estado del recuadro se leen dentro del clic y mientras se
       espera al servidor: van en refs para leer siempre el vigente. */
    const tokenRef = useRef<string | null>(null);
    const estadoVerificacionRef = useRef<EstadoVerificacion>("cargando");
    const esperandoToken = useRef<((token: string | null) => void)[]>([]);

    /* Sin número configurado no hay WhatsApp: el correo pasa a ser el camino
       principal. Es una constante del build, igual en servidor y navegador. */
    const canal: Canal = hasWhatsApp() ? "whatsapp" : "correo";

    /* Servidor de solicitudes: las dos variables públicas y un recuadro de
       verificación que sí cargó. Si falta algo, la hoja trabaja como en la
       tanda 0. */
    const urlServidor = urlSolicitudDemo();
    const llave = llaveVerificacion();
    const conServidor = Boolean(urlServidor && llave) && verificacion !== "fallo";

    /* ── Prellenado ──
       El correo que se tecleó en el hero (sessionStorage, un solo uso) y lo
       que guardó este navegador en una solicitud anterior. Ese registro viejo
       ya NO tapa la hoja con "Ya estás en la lista": esas solicitudes se
       perdieron con la base vieja, así que se vuelve a mostrar la hoja con el
       nombre y el correo ya escritos. www no autentica: no hay sesión que leer. */
    useEffect(() => {
        let correoDelHero: string | null = null;
        try {
            correoDelHero = sessionStorage.getItem(HANDOFF_EMAIL);
            if (correoDelHero) sessionStorage.removeItem(HANDOFF_EMAIL);
        } catch { /* */ }
        const datos = datosPrellenados(correoDelHero, getStoredAccount());
        if (datos.nombre || datos.email) setPrefill(datos);
    }, []);

    /* El plan se lee de la URL al montar y no con useSearchParams: así la
       página sigue siendo estática y no necesita un Suspense alrededor. */
    useEffect(() => {
        setPlanInteres(leerPlanDeInteres(window.location.search));
    }, []);

    /* Auto-detección de país por IP (silenciosa, solo pre-selecciona). */
    useEffect(() => {
        const sel = paisRef.current;
        if (!sel || sel.value) return;
        const apply = (code: string | null) => {
            if (!code || !sel || sel.value) return;
            if (sel.querySelector(`option[value="${code}"]`)) {
                sel.value = code;
                setPais(code);
            }
        };
        let cached: string | null = null;
        try { cached = sessionStorage.getItem("bitacoria_geo_country"); } catch { /* */ }
        if (cached) { apply(cached); return; }
        const t = setTimeout(() => {
            fetch("https://ipapi.co/json/", { cache: "no-store" })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                    const code = d && d.country_code ? String(d.country_code).toUpperCase() : null;
                    if (code) {
                        try { sessionStorage.setItem("bitacoria_geo_country", code); } catch { /* */ }
                        apply(code);
                    }
                })
                .catch(() => { /* sin red, sin problema */ });
        }, 600);
        return () => clearTimeout(t);
    }, []);

    /* Al cambiar de pantalla el foco va al titular: en teléfono la persona
       estaba al fondo de la hoja, y el lector de pantalla anuncia el cambio. */
    useEffect(() => {
        if (pantalla.tipo !== "hoja") tituloRef.current?.focus();
    }, [pantalla.tipo]);

    /* ── Recuadro de verificación ── */
    function setVerificacion(estado: EstadoVerificacion) {
        estadoVerificacionRef.current = estado;
        setVerificacionVisible(estado);
    }

    function soltarEsperas(token: string | null) {
        const pendientes = esperandoToken.current;
        esperandoToken.current = [];
        pendientes.forEach((avisar) => avisar(token));
    }

    function alToken(token: string | null) {
        if (estadoVerificacionRef.current === "fallo") return;
        tokenRef.current = token;
        if (token) {
            setVerificacion("lista");
            setAvisoVerificacion(false);
            soltarEsperas(token);
        }
    }

    function alInteractiva() {
        if (estadoVerificacionRef.current !== "fallo") setVerificacion("interactiva");
    }

    /* El recuadro no cargó: la hoja pasa a WhatsApp directo sin decir nada. */
    function alFallo() {
        tokenRef.current = null;
        setVerificacion("fallo");
        setAvisoVerificacion(false);
        soltarEsperas(null);
    }

    /** Un token para enviar: el que ya hay o el siguiente, hasta `ms`. Se
        consume: cada token sirve una vez. */
    async function tomarToken(ms: number): Promise<string | null> {
        const token = await esperarToken(ms);
        tokenRef.current = null;
        return token;
    }

    function esperarToken(ms: number): Promise<string | null> {
        if (tokenRef.current) return Promise.resolve(tokenRef.current);
        if (estadoVerificacionRef.current === "fallo") return Promise.resolve(null);
        return new Promise((resolve) => {
            const avisar = (token: string | null) => {
                window.clearTimeout(reloj);
                resolve(token);
            };
            const reloj = window.setTimeout(() => {
                esperandoToken.current = esperandoToken.current.filter((a) => a !== avisar);
                resolve(null);
            }, ms);
            esperandoToken.current.push(avisar);
        });
    }

    /* Avisos junto a cada campo; el foco va al primero, en el orden de la hoja. */
    function mostrarErrores(nuevos: ErroresDemo) {
        setErrores(nuevos);
        const primero = CAMPOS_DEMO.find((c) => nuevos[c]);
        if (primero) document.getElementById(ID_DE[primero])?.focus();
    }

    /* Al corregir un campo se quita su aviso. Cambiar de país también quita el
       del WhatsApp (la regla cambia con el país). */
    function alCambiar(e: FormEvent<HTMLFormElement>) {
        const objetivo = e.target as HTMLInputElement | HTMLSelectElement;
        const campo = objetivo.name;
        if (campo === "pais") setPais(objetivo.value);
        setErrores((antes) => {
            const quitar = campo === "pais" ? [campo, "whatsapp"] : [campo];
            if (!quitar.some((c) => c in antes)) return antes;
            const despues = { ...antes };
            for (const c of quitar) delete despues[c as CampoDemo];
            return despues;
        });
    }

    /* ── Envío al servidor ──
       Va APARTE del clic: aquí sí se espera. Por eso, si algo falla, nunca se
       abre WhatsApp solo (el navegador lo bloquearía): se pasa a "No pudimos
       guardar tu solicitud" con el botón. */
    async function enviarAlServidor(url: string, cuerpo: CuerpoDemo, datos: LeadDatos) {
        setEnviando(true);
        setAvisoVerificacion(false);
        // Verificación vencida: otro token y un solo reintento (enviarConReintento).
        const resultado = await enviarConReintento({
            url,
            cuerpo,
            esperarToken: () => tomarToken(TIEMPO_MAXIMO_TOKEN_MS),
            pedirOtroToken: () => verificacionRef.current?.reset(),
        });
        setEnviando(false);
        if (resultado.tipo === "recibida") {
            marcarSolicitudRecibida();
            setPantalla({ tipo: "recibida", datos });
            return;
        }
        if (resultado.tipo === "campo") {
            mostrarErrores({ [resultado.campo]: resultado.mensaje });
            return;
        }
        setPantalla({ tipo: "no_guardada", datos });
    }

    /* ── Envío ──
       NO es async y no lleva ningún await: si no hay servidor (o el recuadro
       no cargó), WhatsApp se abre dentro del mismo clic. Tras cualquier espera
       el navegador ya no lo cuenta como clic y bloquea la ventana. La
       validación de lo básico es la nativa del navegador (required,
       type=email); lo demás (nombre, WhatsApp) lo revisa armarCuerpoDemo. */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (enviando) return;
        const armado = armarCuerpoDemo(leerHoja(e.currentTarget, planInteres));
        if (!armado.ok) {
            mostrarErrores(armado.errores);
            return;
        }
        setErrores({});
        const datos = datosDelMensaje(armado.cuerpo, planInteres);
        const camino = decidirEnvio({
            url: urlServidor,
            llave,
            verificacion: estadoVerificacionRef.current,
            hayToken: Boolean(tokenRef.current),
        });
        if (camino === "servidor" && urlServidor) {
            void enviarAlServidor(urlServidor, armado.cuerpo, datos);
            return;
        }
        if (camino === "completar_verificacion") {
            setAvisoVerificacion(true);
            return;
        }
        const wa = buildWhatsAppUrl(datos);
        if (wa) abrirEnPestanaNueva(wa, window);
        setPantalla({ tipo: "falta", datos });
    }

    const datosPost = pantalla.tipo === "hoja" ? null : pantalla.datos;
    const waUrl = datosPost ? buildWhatsAppUrl(datosPost) : null;
    const correoUrl = datosPost ? buildCorreoUrl(datosPost) : null;
    const numeroVisible = numeroWhatsAppVisible();

    /* Textos de la pantalla después del botón. "aviso" = falta un paso o no se
       guardó (en los dos, el mensaje está listo para mandarse); "recibida" =
       el servidor la guardó. */
    const aviso =
        pantalla.tipo === "falta"
            ? textosFaltaUnPaso({ nombre: pantalla.datos.nombre, plan: planInteres, canal })
            : pantalla.tipo === "no_guardada"
                ? textosNoGuardada({ plan: planInteres, canal })
                : null;
    const recibida =
        pantalla.tipo === "recibida"
            ? textosRecibida({ nombre: pantalla.datos.nombre, plan: planInteres, whatsapp: pantalla.datos.whatsapp })
            : null;
    const modo: Modo =
        pantalla.tipo === "recibida" || (pantalla.tipo === "hoja" && conServidor) ? "servidor" : "directo";
    /* 2026-11-22: con la hoja de Plus ya guardada, el último paso es pagar (si ese ciclo
       ya tiene enlace de Mercado Pago). */
    const pago = recibida && planInteres?.clave === "plus" ? pagoPlus(planInteres.ciclo) : null;

    /* El titular grande vive SIEMPRE en la columna izquierda y cambia con el
       estado. La derecha se queda con la acción: la hoja, o el botón para
       mandar el mensaje. Con ?plan=plus, mientras llena la hoja el titular
       dice qué pidió. No promete fechas ni límites: Plus todavía se activa a
       mano (2026-11-13, Luis). */
    const cabecera = recibida ?? aviso ?? cabeceraFormulario(planInteres, canal, modo);

    /* aria-invalid y el aviso ligado, solo cuando ese campo trae aviso. */
    const ayuda = (campo: CampoDemo) =>
        errores[campo] ? { "aria-invalid": true, "aria-describedby": `${ID_DE[campo]}-aviso` } : {};
    const paisEsMexico = pais === "" || pais === "MX";

    return (
        <MotionConfig reducedMotion="user">
        <div className="relative min-h-[100dvh] overflow-x-clip bg-[#0c0604] text-white">
            {/* Sin halo de fondo a propósito: un resplandor cálido detrás del
                contenido es la firma visual de la página generada. Una sola
                tinta, y que el peso lo lleven las reglas y el botón. */}

            {/* ── Cabecera: solo marca y salida. Sin menú: esta página es el alta. ── */}
            <header className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-10 lg:px-14">
                <Link href="/" aria-label="Ir al inicio" className="block shrink-0 transition-opacity hover:opacity-80">
                    <Image
                        src={assetPath("/images/logo_horizontal-removebg-preview.png")}
                        alt="BitacorIA"
                        width={500}
                        height={191}
                        priority
                        className="h-auto w-24 lg:w-28"
                        // En blanco, con el mismo filtro del logo de la portada (LogoMenu), JC 2026-10-26.
                        style={{ filter: "brightness(0) invert(1) sepia(1) saturate(0.3) hue-rotate(350deg) brightness(0.85)" }}
                    />
                </Link>
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-[13px] text-white/45 transition-colors hover:text-white/80"
                >
                    <ArrowLeft size={14} strokeWidth={1.8} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    Volver
                </Link>
            </header>

            <main className="relative z-10 mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-y-10 px-6 pb-16 pt-10 md:px-10 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-x-20 lg:px-14 lg:pb-10 lg:pt-12">
                {/* ══ Columna izquierda: qué es esto y qué pasa después ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="lg:pt-2"
                >
                    <p className="mb-3 font-ui text-[11px] uppercase tracking-[0.35em] text-[#c39767]">
                        {cabecera.antetitulo}
                    </p>
                    {/* break-words: un nombre muy largo en "Falta un paso, …" se
                        parte en vez de salirse de la pantalla del teléfono. */}
                    <h1
                        ref={tituloRef}
                        tabIndex={-1}
                        className="break-words font-display text-4xl font-extrabold uppercase leading-[1.03] tracking-tight text-white/92 focus:outline-none sm:text-5xl lg:text-[clamp(2.75rem,3.8vw,3.5rem)]"
                    >
                        {cabecera.titulo}
                    </h1>
                    <p className="mt-4 max-w-sm break-words text-[15px] leading-relaxed text-white/45">
                        {cabecera.entrada}
                    </p>

                    {/* La demo es opcional: quien no quiera esperar puede crear su
                        cuenta gratis en la app ahora mismo. Se ofrece en todos
                        los estados. */}
                    <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/45">
                        ¿Prefieres empezar ahora?{" "}
                        <a href={registerUrl("draft")} rel="noopener" className={enlaceBronce}>
                            Crea tu cuenta gratis
                        </a>
                    </p>

                    <QuePasaDespues canal={canal} modo={modo} className="mt-9 hidden lg:block" />
                </motion.div>

                {/* ══ Columna derecha: la hoja ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full lg:max-w-[440px] lg:justify-self-end"
                >
                    {/* ── Solicitud recibida ──
                        El servidor la guardó. WhatsApp queda como opción, no como
                        paso pendiente. */}
                    {recibida && (
                        <div className="lg:pt-6">
                            {pago && <PagoPlus pago={pago} />}
                            {canal === "whatsapp" && waUrl && (
                                <>
                                    <p className="mb-4 text-center text-[13px] leading-relaxed text-white/50">
                                        {recibida.extra}
                                    </p>
                                    <WhatsAppCTA href={waUrl}>{recibida.boton}</WhatsAppCTA>
                                </>
                            )}
                            <Link
                                href="/"
                                className="mt-4 flex w-full items-center justify-center border-t border-white/[0.07] pt-4 text-[14px] text-white/50 transition-colors hover:text-[#f5f0e8]"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    )}

                    {/* ── Falta un paso / No pudimos guardar ──
                        Sin palomita y sin "recibida": nada se guardó. El botón
                        principal manda el mensaje ya escrito; debajo, el mismo
                        mensaje por correo y el número, para quien está en una
                        computadora sin WhatsApp. */}
                    {aviso && (
                        <div className="lg:pt-6">
                            {canal === "whatsapp" && waUrl ? (
                                <>
                                    <WhatsAppCTA href={waUrl}>{aviso.boton}</WhatsAppCTA>
                                    <p className="mt-4 text-center text-[13px] leading-relaxed text-white/50">
                                        ¿Sin WhatsApp en este equipo?{" "}
                                        {correoUrl && (
                                            <a href={correoUrl} className={enlaceBronce}>
                                                Envíanos el mismo mensaje por correo
                                            </a>
                                        )}
                                    </p>
                                    {numeroVisible && (
                                        <p className="mt-2 text-center text-[13px] text-white/45">
                                            Nuestro WhatsApp:{" "}
                                            <span className="whitespace-nowrap text-white/75">{numeroVisible}</span>
                                        </p>
                                    )}
                                </>
                            ) : (
                                correoUrl && (
                                    <a href={correoUrl} className={botonCrema}>
                                        {aviso.boton}
                                    </a>
                                )
                            )}

                            <button
                                type="button"
                                onClick={() => setShowOtras((v) => !v)}
                                aria-expanded={showOtras}
                                className="mt-5 flex w-full items-center justify-center gap-1.5 text-[12px] font-medium text-[#e8ddc9]/60 transition-colors hover:text-[#f5f0e8]"
                            >
                                Otras opciones
                                <ChevronDown
                                    size={14}
                                    className="transition-transform duration-300"
                                    style={{ transform: showOtras ? "rotate(180deg)" : "none" }}
                                />
                            </button>
                            {showOtras && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {SOCIALES.map(({ label, href, Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-[11px] font-medium text-white/50 transition-all duration-300 hover:border-[#C39767]/40 hover:bg-[#C39767]/10 hover:text-[#e8b97a]"
                                        >
                                            <Icon size={15} />
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            )}

                            <Link
                                href="/"
                                className="mt-4 flex w-full items-center justify-center border-t border-white/[0.07] pt-4 text-[14px] text-white/50 transition-colors hover:text-[#f5f0e8]"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    )}

                    {pantalla.tipo === "hoja" && (
                        <form onSubmit={handleSubmit} onChange={alCambiar} aria-busy={enviando} className="space-y-5">
                            {/* El plan que eligió en la página, ya marcado. Va como el
                                renglón del país: un metadato, no una pregunta más. */}
                            {planInteres && (
                                <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Plan</span>
                                    <span className="flex items-center gap-2 text-right text-[13px] text-white/70">
                                        <Check size={14} strokeWidth={2.2} aria-hidden className="shrink-0 text-[#c39767]" />
                                        <span>
                                            <span className="font-semibold text-[#f5f0e8]">{planInteres.nombre}</span>
                                            {" · "}
                                            {planInteres.precio}
                                        </span>
                                    </span>
                                </div>
                            )}

                            <div>
                                <Renglon n="01" htmlFor="reg-nombre">Nombre completo</Renglon>
                                <input
                                    id="reg-nombre"
                                    name="nombre"
                                    required
                                    autoComplete="name"
                                    /* key: defaultValue solo se aplica al montar, y el
                                       prellenado llega después (sessionStorage/localStorage). */
                                    key={`n-${prefill.nombre ?? ""}`}
                                    defaultValue={prefill.nombre ?? ""}
                                    className={campoCls}
                                    {...ayuda("nombre")}
                                />
                                <AvisoCampo campo="nombre" texto={errores.nombre} />
                            </div>

                            <div>
                                <Renglon n="02" htmlFor="reg-email">Correo</Renglon>
                                <input
                                    id="reg-email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    key={`e-${prefill.email ?? ""}`}
                                    defaultValue={prefill.email ?? ""}
                                    className={campoCls}
                                    {...ayuda("email")}
                                />
                                <AvisoCampo campo="email" texto={errores.email} />
                            </div>

                            {/* WhatsApp: obligatorio (la página promete escribir por ahí).
                                Sin tope de largo, para que pegar "+52 55 1234 5678"
                                funcione; la regla cambia con el país de abajo. */}
                            <div>
                                <Renglon
                                    n="03"
                                    htmlFor="reg-whatsapp"
                                    nota={paisEsMexico ? "10 dígitos" : "con lada del país"}
                                >
                                    WhatsApp
                                </Renglon>
                                <input
                                    id="reg-whatsapp"
                                    name="whatsapp"
                                    type="tel"
                                    inputMode="tel"
                                    required
                                    autoComplete="tel"
                                    className={campoCls}
                                    {...ayuda("whatsapp")}
                                />
                                <AvisoCampo campo="whatsapp" texto={errores.whatsapp} />
                            </div>

                            <div>
                                <Renglon n="04" htmlFor="reg-perfil">¿A qué te dedicas?</Renglon>
                                <div className="relative">
                                    <select
                                        id="reg-perfil"
                                        name="perfil"
                                        required
                                        defaultValue=""
                                        className={selectCls}
                                        {...ayuda("perfil")}
                                    >
                                        <option value="" disabled>Elige la que más se parezca</option>
                                        {PERFILES.map(([clave, texto]) => <option key={clave} value={clave}>{texto}</option>)}
                                    </select>
                                    <Galon />
                                </div>
                                <AvisoCampo campo="perfil" texto={errores.perfil} />
                            </div>

                            <div>
                                <Renglon n="05" htmlFor="reg-obras" nota="opcional">Obras activas</Renglon>
                                <input
                                    id="reg-obras"
                                    name="obras_activas"
                                    type="number"
                                    min="0"
                                    max="999"
                                    step="1"
                                    inputMode="numeric"
                                    className={campoCls}
                                    {...ayuda("obras_activas")}
                                />
                                <AvisoCampo campo="obras_activas" texto={errores.obras_activas} />
                            </div>

                            <div>
                                <Renglon n="06" htmlFor="reg-interes">¿Qué tan listo estás?</Renglon>
                                <div className="relative">
                                    <select
                                        id="reg-interes"
                                        name="interes_compra"
                                        required
                                        defaultValue=""
                                        className={selectCls}
                                        {...ayuda("interes_compra")}
                                    >
                                        <option value="" disabled>Elige una opción</option>
                                        {INTERESES.map(([clave, texto]) => <option key={clave} value={clave}>{texto}</option>)}
                                    </select>
                                    <Galon />
                                </div>
                                <AvisoCampo campo="interes_compra" texto={errores.interes_compra} />
                            </div>

                            {/* El país se autodetecta por IP, así que no es una pregunta:
                                va como metadato al pie. Sigue siendo un select visible
                                —no oculto— porque un `required` invisible bloquea el
                                envío sin poder mostrar su aviso. */}
                            <div className="border-t border-white/[0.07] pt-4">
                                <div className="flex items-center justify-between gap-4">
                                    <label htmlFor="reg-pais" className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                                        País
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="reg-pais"
                                            name="pais"
                                            ref={paisRef}
                                            required
                                            defaultValue=""
                                            className={`${selectCls} sin-regla py-0 text-right text-[13px] text-white/70`}
                                            {...ayuda("pais")}
                                        >
                                            <option value="" disabled>Elige tu país</option>
                                            {PAISES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </select>
                                        <Galon />
                                    </div>
                                </div>
                                <AvisoCampo campo="pais" texto={errores.pais} />
                            </div>

                            {/* Verificación de "no robot": solo con servidor. Si no carga,
                                desaparece y la hoja sigue por WhatsApp directo. */}
                            {conServidor && (
                                <div>
                                    <Verificacion
                                        ref={verificacionRef}
                                        llave={llave}
                                        onToken={alToken}
                                        onInteractiva={alInteractiva}
                                        onFallo={alFallo}
                                    />
                                    {avisoVerificacion && (
                                        <p role="status" className="mt-2 text-[13px] leading-snug text-[#e8b97a]">
                                            Completa la verificación de arriba y vuelve a pulsar el botón.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Único elemento relleno de la pantalla: el mismo botón que
                                el "Continuar" del hero. */}
                            <button type="submit" disabled={enviando} className={`mt-1 ${botonCrema}`}>
                                {enviando
                                    ? "Enviando…"
                                    : planInteres
                                        ? `Comenzar con ${planInteres.nombre}`
                                        : "Solicitar demo"}
                            </button>

                            {/* target="_blank": los campos no son controlados, así que
                                salir a leer el aviso borraba los datos escritos. */}
                            <p className="text-center text-[12px] leading-relaxed text-white/50">
                                Tus datos se usan solo para contactarte. Sin spam.{" "}
                                <a
                                    href="/?legal=privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                                >
                                    Aviso de Privacidad
                                </a>.
                            </p>
                        </form>
                    )}

                    <QuePasaDespues canal={canal} modo={modo} className="mt-10 lg:hidden" />
                </motion.div>
            </main>
        </div>
        </MotionConfig>
    );
}
