"use client";

/* ══════════════════════════════════════════════════════════════════════
   Formulario — la solicitud de demo, a página entera
   ──────────────────────────────────────────────────────────────────────
   Sustituye al antiguo RegistroModal. Pide los mismos seis datos.

   2026-11-13 (Luis, tanda 0 del plan registro_filtro): antes los mandaba
   a la base vieja del sitio, que ya no existe, y a todos les salía "Sin
   conexión" en rojo. Ahora no manda nada a ninguna base: arma el mensaje
   y abre WhatsApp en el mismo clic (o el correo, si no hay número). Como
   nada queda guardado hasta que la persona envíe ese mensaje, la pantalla
   siguiente dice "Falta un paso", nunca "Solicitud recibida". Guardar en
   el servidor llega con la tanda 4.
   ══════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Facebook, Instagram } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { getStoredAccount } from "@/lib/account";
import { buildWhatsAppUrl, hasWhatsApp, numeroWhatsAppVisible, type LeadDatos } from "@/lib/whatsapp";
import { HANDOFF_EMAIL, leerPlanDeInteres, type PlanDeInteres } from "@/lib/registro";
import {
    abrirEnPestanaNueva,
    buildCorreoUrl,
    cabeceraFormulario,
    datosPrellenados,
    pasosDespues,
    textosFaltaUnPaso,
    type Canal,
} from "@/lib/solicitudDemo";
import { registerUrl } from "@/lib/appUrl";
import { botonCrema, botonVerde } from "./botones";

const PAISES: [string, string][] = [
    ["MX", "México"], ["US", "Estados Unidos"], ["GT", "Guatemala"], ["CO", "Colombia"],
    ["EC", "Ecuador"], ["PE", "Perú"], ["BO", "Bolivia"], ["PY", "Paraguay"],
    ["AR", "Argentina"], ["BR", "Brasil"], ["CL", "Chile"], ["CR", "Costa Rica"], ["CU", "Cuba"],
    ["DO", "República Dominicana"], ["SV", "El Salvador"], ["HN", "Honduras"], ["NI", "Nicaragua"],
    ["PA", "Panamá"], ["PR", "Puerto Rico"], ["UY", "Uruguay"], ["VE", "Venezuela"],
    ["ES", "España"], ["CA", "Canadá"], ["OT", "Otro / No listado"],
];

const PERFILES = [
    "Constructora PyME",
    "Residente independiente",
    "Despacho técnico",
    "Desarrollador",
    "Estudiante/academia",
];

const INTERESES: [string, string][] = [
    ["Listo para comprar", "Listo para comprar — solo espero el lanzamiento"],
    ["Muy probable", "Muy probable — estoy evaluando seriamente"],
    ["Probable", "Probable — depende de lo que vea en la demo"],
    ["Curioso", "Curioso — vine a explorar"],
    ["Investigando", "Solo investigando — no estoy en el mercado ahora"],
];

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

/* Lista "qué pasa después" — se pinta dos veces: en la columna izquierda a
   partir de lg, y bajo el formulario en móvil, donde primero va aquello a
   lo que se vino. Los textos salen de pasosDespues() (src/lib/solicitudDemo.ts).
   2026-11-13: el renglón 2 decía "Te escribimos por WhatsApp"; hoy quien
   escribe es la persona, con el mensaje ya armado. */
function QuePasaDespues({ canal, className = "" }: { canal: Canal; className?: string }) {
    return (
        <ul className={`divide-y divide-white/[0.06] border-t border-white/[0.06] ${className}`}>
            {pasosDespues(canal).map(([titulo, detalle]) => (
                <li key={titulo} className="flex gap-4 py-4">
                    {/* Un guion de bronce, no un número: los folios 01-05 ya numeran
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

/* Lee la hoja tal como está: textos legibles (nombre del país, interés
   completo), no los códigos internos, porque esto es lo que lee el equipo en
   el mensaje. */
function leerDatos(form: HTMLFormElement, planInteres: PlanDeInteres | null): LeadDatos {
    const fd = new FormData(form);
    const pais = (fd.get("pais") || "").toString().trim().toUpperCase();
    const interes = (fd.get("interes_compra") || "").toString().trim();
    const datos: LeadDatos = {
        nombre: (fd.get("nombre") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim().toLowerCase(),
        perfil: (fd.get("perfil") || "").toString().trim(),
        obras_activas: (fd.get("obras_activas") || "").toString().trim() || null,
        interes_compra: INTERESES.find(([v]) => v === interes)?.[1] ?? interes,
        pais: PAISES.find(([v]) => v === pais)?.[1] ?? pais,
        plan: planInteres,
    };
    return datos;
}

export default function Formulario() {
    /* null = la hoja; con datos = "Falta un paso". No hay estado de "enviando"
       ni de error: no se manda nada a ningún servidor. */
    const [enviado, setEnviado] = useState<LeadDatos | null>(null);
    const [showOtras, setShowOtras] = useState(false);
    const [prefill, setPrefill] = useState<{ nombre?: string; email?: string }>({});
    /* Plan que trae la URL desde la tarjeta de la página (?plan=plus). null =
       el formulario de siempre (demo). */
    const [planInteres, setPlanInteres] = useState<PlanDeInteres | null>(null);

    const paisRef = useRef<HTMLSelectElement>(null);
    const tituloRef = useRef<HTMLHeadingElement>(null);

    /* Sin número configurado no hay WhatsApp: el correo pasa a ser el camino
       principal. Es una constante del build, igual en servidor y navegador. */
    const canal: Canal = hasWhatsApp() ? "whatsapp" : "correo";

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
            if (sel.querySelector(`option[value="${code}"]`)) sel.value = code;
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

    /* Al pasar a "Falta un paso" el foco va al titular: en teléfono la
       persona estaba al fondo de la hoja, y el lector de pantalla anuncia el
       cambio. */
    useEffect(() => {
        if (enviado) tituloRef.current?.focus();
    }, [enviado]);

    /* ── Envío ──
       NO es async y no lleva ningún await: WhatsApp se abre dentro del mismo
       clic. Tras cualquier espera el navegador ya no lo cuenta como clic y
       bloquea la ventana. La validación es la nativa del navegador (required,
       type=email): si algo falta, este manejador ni se llama. */
    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const datos = leerDatos(e.currentTarget, planInteres);
        const wa = buildWhatsAppUrl(datos);
        if (wa) abrirEnPestanaNueva(wa, window);
        setEnviado(datos);
    }

    const waUrl = enviado ? buildWhatsAppUrl(enviado) : null;
    const correoUrl = enviado ? buildCorreoUrl(enviado) : null;
    const numeroVisible = numeroWhatsAppVisible();
    const falta = enviado ? textosFaltaUnPaso({ nombre: enviado.nombre, plan: planInteres, canal }) : null;

    /* El titular grande vive SIEMPRE en la columna izquierda y cambia con el
       estado. La derecha se queda con la acción: la hoja, o el botón para
       mandar el mensaje. Con ?plan=plus, mientras llena la hoja el titular
       dice qué pidió. No promete fechas ni límites: Plus todavía se activa a
       mano (2026-11-13, Luis). */
    const cabecera = falta ?? cabeceraFormulario(planInteres, canal);

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
                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/45">
                        {cabecera.entrada}
                    </p>

                    {/* La demo es opcional: quien no quiera esperar puede crear su
                        cuenta gratis en la app ahora mismo. Se ofrece en los dos
                        estados. */}
                    <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/45">
                        ¿Prefieres empezar ahora?{" "}
                        <a href={registerUrl("draft")} rel="noopener" className={enlaceBronce}>
                            Crea tu cuenta gratis
                        </a>
                    </p>

                    <QuePasaDespues canal={canal} className="mt-9 hidden lg:block" />
                </motion.div>

                {/* ══ Columna derecha: la hoja ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full lg:max-w-[440px] lg:justify-self-end"
                >
                    {/* ── Falta un paso ──
                        Sin palomita y sin "recibida": nada se guardó. El botón
                        principal manda el mensaje ya escrito; debajo, el mismo
                        mensaje por correo y el número, para quien está en una
                        computadora sin WhatsApp. */}
                    {enviado && falta && (
                        <div className="lg:pt-6">
                            {canal === "whatsapp" && waUrl ? (
                                <>
                                    <WhatsAppCTA href={waUrl}>{falta.boton}</WhatsAppCTA>
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
                                        {falta.boton}
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

                    {!enviado && (
                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                />
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
                                />
                            </div>

                            <div>
                                <Renglon n="03" htmlFor="reg-perfil">¿A qué te dedicas?</Renglon>
                                <div className="relative">
                                    <select id="reg-perfil" name="perfil" required defaultValue="" className={selectCls}>
                                        <option value="" disabled>Elige una opción</option>
                                        {PERFILES.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <Galon />
                                </div>
                            </div>

                            <div>
                                <Renglon n="04" htmlFor="reg-obras" nota="opcional">Obras activas</Renglon>
                                <input id="reg-obras" name="obras_activas" type="number" min="0" className={campoCls} />
                            </div>

                            <div>
                                <Renglon n="05" htmlFor="reg-interes">¿Qué tan listo estás?</Renglon>
                                <div className="relative">
                                    <select id="reg-interes" name="interes_compra" required defaultValue="" className={selectCls}>
                                        <option value="" disabled>Elige una opción</option>
                                        {INTERESES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <Galon />
                                </div>
                            </div>

                            {/* El país se autodetecta por IP, así que no es una pregunta:
                                va como metadato al pie. Sigue siendo un select visible
                                —no oculto— porque un `required` invisible bloquea el
                                envío sin poder mostrar su aviso. */}
                            <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
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
                                    >
                                        <option value="" disabled>Elige tu país</option>
                                        {PAISES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <Galon />
                                </div>
                            </div>

                            {/* Único elemento relleno de la pantalla: el mismo botón que
                                el "Continuar" del hero. */}
                            <button type="submit" className={`mt-1 ${botonCrema}`}>
                                {planInteres ? `Comenzar con ${planInteres.nombre}` : "Solicitar demo"}
                            </button>

                            {/* target="_blank": los campos no son controlados, así que
                                salir a leer el aviso borraba los cinco datos escritos. */}
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

                    <QuePasaDespues canal={canal} className="mt-10 lg:hidden" />
                </motion.div>
            </main>
        </div>
        </MotionConfig>
    );
}
