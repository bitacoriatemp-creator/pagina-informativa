"use client";

/* ══════════════════════════════════════════════════════════════════════
   Formulario — el alta completa, a página entera
   ──────────────────────────────────────────────────────────────────────
   Sustituye al antiguo RegistroModal. Mismos seis datos, mismo Edge
   Function (register-participant → INSERT en `participantes` + correos
   vía Resend) y el mismo proceso de emergencia por WhatsApp si la base
   falla. Lo que cambia es el continente: ya no hay cristal ni panel
   flotante, porque a pantalla completa una tarjeta se lee como una caja
   sin motivo — justo lo que se le quitó al hero.
   ══════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, Facebook, Instagram } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { getSessionUser } from "@/lib/socialAuth";
import { getStoredAccount, setStoredAccount, type Account } from "@/lib/account";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { HANDOFF_EMAIL, REGISTERED_FLAG } from "@/lib/registro";

const REGISTER_ENDPOINT =
    "https://epjfqcndxoyrtrmasuvt.supabase.co/functions/v1/register-participant";

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

/* Lo que pasa DESPUÉS de enviar. Va en la columna izquierda y se queda en
   los tres estados: al enviar deja de ser una promesa y pasa a ser,
   literalmente, lo que sigue. */
const DESPUES: [string, string][] = [
    ["Revisamos tu caso", "Cuántas obras llevas y qué módulo te sirve primero."],
    ["Te escribimos por WhatsApp", "Sin centro de llamadas: contesta alguien del equipo."],
    ["Demo en vivo sobre tu obra", "Veinte minutos, con tus propios datos si quieres."],
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

/** CTA de WhatsApp — mismo acabado en la pantalla de éxito y en la de error. */
function WhatsAppCTA({
    href,
    compact = false,
    children,
    onClick,
}: {
    href: string;
    compact?: boolean;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
    return (
        <a
            href={href}
            onClick={onClick}
            target="_blank"
            rel="noopener noreferrer"
            className={
                "btn-premium-shine group flex w-full items-center justify-center gap-3 rounded-full font-ui font-semibold tracking-tight transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 active:translate-y-0 " +
                (compact ? "py-3 text-[14px]" : "py-3.5 text-[15px]")
            }
            style={{
                /* Esmeralda profundo, no el verde neón de WhatsApp: convive con
                   el chocolate en vez de gritar sobre él. */
                background: "linear-gradient(180deg,#1f7a4d 0%,#146039 55%,#0d4529 100%)",
                color: "#f5f0e8",
                border: "1px solid rgba(245,240,232,0.16)",
                boxShadow: [
                    "inset 0 1px 0 rgba(255,255,255,0.20)",
                    "inset 0 -12px 22px rgba(0,0,0,0.22)",
                    "0 14px 30px -12px rgba(0,0,0,0.65)",
                    "0 4px 12px -6px rgba(20,96,57,0.45)",
                ].join(", "),
            }}
        >
            <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-[rgba(245,240,232,0.22)]"
                style={{ background: "rgba(245,240,232,0.14)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)" }}
            >
                <WhatsAppIcon />
            </span>
            <span>{children}</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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
   lo que se vino. */
function QuePasaDespues({ className = "" }: { className?: string }) {
    return (
        <ul className={`divide-y divide-white/[0.06] border-t border-white/[0.06] ${className}`}>
            {DESPUES.map(([titulo, detalle]) => (
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

const botonCrema =
    "flex h-12 w-full items-center justify-center rounded-xl bg-[#f5f0e8] text-[15px] font-semibold text-[#1a120c] transition-colors duration-200 hover:bg-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0604]";

export default function Formulario() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errMsg, setErrMsg] = useState("");
    const [doneName, setDoneName] = useState("");
    const [waUrl, setWaUrl] = useState<string | null>(null);
    const [showOtras, setShowOtras] = useState(false);
    /* undefined = todavía sin comprobar (el servidor no puede leer
       localStorage). Mientras tanto se pinta el formulario, que es el caso
       mayoritario y evita que la página aparezca vacía. */
    const [yaDentro, setYaDentro] = useState<Account | null | undefined>(undefined);
    const [otraPersona, setOtraPersona] = useState(false);
    const [prefill, setPrefill] = useState<{ nombre?: string; email?: string }>({});

    const paisRef = useRef<HTMLSelectElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    /* ── Prellenado y estado de la persona ──
       1. El correo que se tecleó en el hero (sessionStorage, un solo uso).
       2. La sesión de Google, si alguien volvió de OAuth.
       Y de paso, si ya se dio de alta desde este navegador, se le saluda en
       vez de volver a pedirle los seis datos. */
    useEffect(() => {
        let vivo = true;
        let email: string | undefined;
        try {
            email = sessionStorage.getItem(HANDOFF_EMAIL) || undefined;
            if (email) sessionStorage.removeItem(HANDOFF_EMAIL);
        } catch { /* */ }
        if (email) setPrefill((p) => ({ ...p, email }));

        let registrado = false;
        try { registrado = localStorage.getItem(REGISTERED_FLAG) === "true"; } catch { /* */ }
        setYaDentro(registrado ? getStoredAccount() ?? { email: "" } : null);

        getSessionUser()
            .then((u) => {
                if (!vivo || !u?.email) return;
                const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
                setPrefill((p) => ({
                    email: p.email ?? u.email,
                    nombre: p.nombre ?? ((meta.full_name || meta.name || "") as string),
                }));
            })
            .catch(() => { /* sin sesión, sin problema */ });

        return () => { vivo = false; };
    }, []);

    /* Auto-detección de país por IP (silenciosa, solo pre-selecciona).
       Depende de yaDentro/otraPersona porque el select no existe en el DOM
       mientras se muestra la pantalla de "ya estás en la lista". */
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
    }, [yaDentro, otraPersona]);

    /* Arma el enlace de WhatsApp leyendo el formulario TAL COMO ESTÁ AHORA.
       En el bloque de error el usuario sigue editando los mismos campos; si el
       enlace se quedara con el snapshot del envío fallido, corregir el correo y
       pulsar WhatsApp mandaría el dato viejo — y ahí ese mensaje es la única
       captura del lead, porque la base ya falló. */
    const urlWhatsAppActual = () => {
        const form = formRef.current;
        if (!form) return null;
        const fd = new FormData(form);
        const pais = (fd.get("pais") || "").toString().trim().toUpperCase();
        const interes = (fd.get("interes_compra") || "").toString().trim();
        return buildWhatsAppUrl({
            nombre: (fd.get("nombre") || "").toString().trim(),
            email: (fd.get("email") || "").toString().trim().toLowerCase(),
            perfil: (fd.get("perfil") || "").toString().trim(),
            obras_activas: (fd.get("obras_activas") as string) || null,
            interes_compra: INTERESES.find(([v]) => v === interes)?.[1] ?? interes,
            pais: PAISES.find(([v]) => v === pais)?.[1] ?? pais,
        });
    };

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrMsg("");
        const fd = new FormData(e.currentTarget);
        const payload = {
            nombre: (fd.get("nombre") || "").toString().trim(),
            email: (fd.get("email") || "").toString().trim().toLowerCase(),
            pais: (fd.get("pais") || "").toString().trim().toUpperCase(),
            perfil: (fd.get("perfil") || "").toString().trim(),
            obras_activas: fd.get("obras_activas") || null,
            interes_compra: (fd.get("interes_compra") || "").toString().trim(),
        };
        setStatus("submitting");

        /* Etiqueta larga del interés y nombre del país: en el mensaje de
           WhatsApp queremos texto legible, no el código interno. */
        const paisLegible = PAISES.find(([v]) => v === payload.pais)?.[1] ?? payload.pais;
        const interesLegible =
            INTERESES.find(([v]) => v === payload.interes_compra)?.[1] ?? payload.interes_compra;
        const enlace = () =>
            buildWhatsAppUrl({
                ...payload,
                pais: paisLegible,
                interes_compra: interesLegible,
                obras_activas: payload.obras_activas as string | number | null,
            });

        try {
            const res = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            // 200 = nuevo, 409 = ya registrado → ambos cuentan como éxito
            if (res.ok || res.status === 409) {
                try { localStorage.setItem(REGISTERED_FLAG, "true"); } catch { /* */ }
                setStoredAccount({ email: payload.email, nombre: payload.nombre });
                setDoneName(payload.nombre.split(" ")[0]);
                setWaUrl(enlace());
                setStatus("success");
                return;
            }
            const detail = await res.json().catch(() => ({}));
            throw new Error((detail as { error?: string }).error || `status_${res.status}`);
        } catch (err) {
            setStatus("error");
            // Si nuestra base falla no bloqueamos al lead: le ofrecemos WhatsApp
            // igual, que es justo el canal donde queremos que acabe.
            setWaUrl(enlace());
            // fetch lanza TypeError en fallo de red — frecuente en obra con señal débil
            setErrMsg(
                err instanceof TypeError
                    ? "Sin conexión. Verifica tu señal e intenta de nuevo."
                    : "No pudimos completar tu registro. Revisa los datos e intenta de nuevo."
            );
        }
    }

    /* Enlace de WhatsApp para quien ya está registrado: no hay formulario que
       leer, así que se arma con lo poco que guardamos de él. */
    const waYaDentro = yaDentro
        ? buildWhatsAppUrl({
            nombre: yaDentro.nombre || "",
            email: yaDentro.email || "",
            perfil: "",
            interes_compra: "Ya registrado — quiero agendar la demo",
            pais: "",
        })
        : null;

    const mostrarFormulario = status !== "success" && (yaDentro === undefined || yaDentro === null || otraPersona);
    const mostrarYaDentro = status !== "success" && !!yaDentro && !otraPersona;

    /* El titular grande vive SIEMPRE en la columna izquierda y cambia con el
       estado: dos titulares a la vez —"Solicita tu demo" a la izquierda y
       "Listo, Ana" a la derecha— se contradicen y compiten. La derecha se
       queda con la acción: la hoja, o el botón de WhatsApp.
       La lista de "qué pasa después" no se toca en ningún estado; tras enviar
       es, literalmente, lo que pasa después. */
    const primerNombre = (yaDentro?.nombre || "").split(" ")[0];
    const encabezado =
        status === "success"
            ? {
                antetitulo: "Solicitud recibida",
                titulo: doneName ? `Listo, ${doneName}` : "Estás dentro",
                entrada: <>Quedaste en la lista de acceso anticipado. Esto es lo que sigue.</>,
            }
            : mostrarYaDentro
                ? {
                    antetitulo: "Registro encontrado",
                    titulo: primerNombre ? `Ya estás en la lista, ${primerNombre}` : "Ya estás en la lista",
                    entrada: yaDentro?.email
                        ? <>Tenemos tu solicitud a nombre de <span className="text-white/70">{yaDentro.email}</span>.</>
                        : <>Tenemos tu solicitud y seguimos el proceso de siempre.</>,
                }
                : {
                    antetitulo: "Acceso anticipado",
                    titulo: "Solicita tu demo",
                    entrada: <>Seis datos. Con ellos preparamos una demo sobre tu obra, no una presentación genérica.</>,
                };

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
                        {encabezado.antetitulo}
                    </p>
                    <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.03] tracking-tight text-white/92 sm:text-5xl lg:text-[clamp(2.75rem,3.8vw,3.5rem)]">
                        {encabezado.titulo}
                    </h1>
                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/45">
                        {encabezado.entrada}
                    </p>

                    <QuePasaDespues className="mt-9 hidden lg:block" />
                </motion.div>

                {/* ══ Columna derecha: la hoja ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full lg:max-w-[440px] lg:justify-self-end"
                >
                    {status === "success" && (
                        <div className="lg:pt-6">
                            {/* Sin aro exterior y sin rebote: el aro es un halo, y el
                                muelle es la celebración de cualquier SaaS. Entra por
                                opacidad y ya. */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.16 }}
                                className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                                style={{
                                    background: "rgba(195,151,103,0.16)",
                                    border: "1px solid rgba(195,151,103,0.5)",
                                }}
                            >
                                <Check size={32} strokeWidth={2.6} style={{ color: "#e8c9a0" }} />
                            </motion.div>
                            <p className="mb-6 text-[15px] leading-relaxed text-white/55">
                                {waUrl
                                    ? "Sigue la conversación por WhatsApp y agendamos tu demo hoy mismo. El mensaje ya lleva tus datos."
                                    : "Te escribimos muy pronto para coordinar tu demo en vivo — revisa tu correo, y la carpeta de spam."}
                            </p>
                            {waUrl && (
                                <div className="mb-3">
                                    <WhatsAppCTA href={waUrl}>Continuar en WhatsApp</WhatsAppCTA>
                                </div>
                            )}
                            <Link
                                href="/"
                                className="flex w-full items-center justify-center py-2.5 text-[14px] text-white/50 transition-colors hover:text-[#f5f0e8]"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    )}

                    {/* ── Ya se dio de alta desde este navegador ──
                        Volver a pedirle los seis datos a quien ya está en la lista
                        es la forma más rápida de perderlo. */}
                    {mostrarYaDentro && (
                        <div className="lg:pt-6">
                            <p className="mb-6 text-[15px] leading-relaxed text-white/55">
                                No hace falta que la llenes otra vez. Si quieres adelantar la
                                demo, escríbenos y la agendamos hoy mismo.
                            </p>
                            {waYaDentro && (
                                <div className="mb-3">
                                    <WhatsAppCTA href={waYaDentro}>Escríbenos por WhatsApp</WhatsAppCTA>
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4 text-[13px]">
                                <Link href="/" className="text-white/50 transition-colors hover:text-[#f5f0e8]">
                                    Volver al inicio
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setOtraPersona(true)}
                                    className="text-white/35 transition-colors hover:text-white/70"
                                >
                                    Registrar a otra persona
                                </button>
                            </div>
                        </div>
                    )}

                    {mostrarFormulario && (
                        <form onSubmit={handleSubmit} ref={formRef} className="space-y-5">
                            <div>
                                <Renglon n="01" htmlFor="reg-nombre">Nombre completo</Renglon>
                                <input
                                    id="reg-nombre"
                                    name="nombre"
                                    required
                                    autoComplete="name"
                                    /* key: defaultValue solo se aplica al montar, y el
                                       prellenado llega después (sessionStorage/OAuth). */
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
                            <button type="submit" disabled={status === "submitting"} className={`mt-1 ${botonCrema}`}>
                                {status === "submitting" ? "Procesando…" : "Solicitar demo"}
                            </button>

                            {errMsg && (
                                <div className="space-y-3">
                                    <p className="text-sm text-red-400">{errMsg}</p>

                                    {/* ── PROCESO DE EMERGENCIA ──
                                        Si el registro falla, el lead no se pierde: le damos
                                        canales directos con sus datos ya escritos. WhatsApp
                                        es el principal; el resto queda plegado. */}
                                    {waUrl && (
                                        <div
                                            className="rounded-2xl p-4"
                                            style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.10)" }}
                                        >
                                            <p className="mb-3 text-[13px] leading-relaxed text-white/55">
                                                No te quedes fuera: escríbenos y te damos acceso a mano. Tus
                                                datos ya van en el mensaje.
                                            </p>
                                            {/* Relee el formulario justo al pulsar: si el usuario
                                                corrigió un campo tras el fallo, el mensaje sale con
                                                el dato bueno. */}
                                            <WhatsAppCTA
                                                href={waUrl}
                                                compact
                                                onClick={(e) => {
                                                    const fresca = urlWhatsAppActual();
                                                    if (fresca) e.currentTarget.href = fresca;
                                                }}
                                            >
                                                Escríbenos por WhatsApp
                                            </WhatsAppCTA>
                                            <button
                                                type="button"
                                                onClick={() => setShowOtras((v) => !v)}
                                                aria-expanded={showOtras}
                                                className="mt-3 flex w-full items-center justify-center gap-1.5 text-[12px] font-medium text-[#e8ddc9]/60 transition-colors hover:text-[#f5f0e8]"
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
                                        </div>
                                    )}
                                </div>
                            )}

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

                    <QuePasaDespues className="mt-10 lg:hidden" />
                </motion.div>
            </main>
        </div>
        </MotionConfig>
    );
}
