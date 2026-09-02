"use client";

/* ══════════════════════════════════════════════════════════════════════
   RegistroModal — Popup de captura de leads
   ──────────────────────────────────────────────────────────────────────
   • <RegistroModalProvider> envuelve la landing y monta el modal una vez.
   • Intercepta GLOBALMENTE cualquier clic en <a href="/registro"> y, en vez
     de navegar, abre el modal. Así los CTAs (Comenzar, Contactar, Solicitar
     Demo, Registrarse, Empezar Gratis) abren el popup sin editarlos uno a uno.
   • Al enviar, hace POST al MISMO Edge Function que el registro original
     (register-participant): INSERT en `participantes` + correos vía Resend
     (notificación al admin + confirmación al lead).
   ══════════════════════════════════════════════════════════════════════ */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    type ReactNode,
    type FormEvent,
} from "react";
import { getSessionUser, onAuthChange } from "@/lib/socialAuth";
import { setStoredAccount } from "@/lib/account";
import { motion } from "framer-motion";
import { Check, ChevronDown, Facebook, Instagram } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const REGISTERED_FLAG = "bitacoria_registered";

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

/* Glifo oficial de WhatsApp (monocromo, hereda currentColor) */
const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413" />
    </svg>
);

/* Glifo de Discord (lucide no lo trae) */
const DiscordIcon = ({ size = 15 }: { size?: number | string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.369a19.8 19.8 0 0 0-4.885-1.515.07.07 0 0 0-.079.036c-.21.375-.444.865-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.08.08 0 0 0-.079-.036A19.7 19.7 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057q.003.032.027.05a19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028 14 14 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13 13 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10 10 0 0 0 .372-.292.07.07 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .079.009q.18.15.372.293a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .028-.05c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028M8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419s.956-2.419 2.157-2.419c1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419s.955-2.419 2.157-2.419c1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418" />
    </svg>
);

/* Canales de respaldo si el registro falla. WhatsApp va aparte: es el
   principal y se muestra siempre primero, no dentro de "otras opciones". */
/* size acepta número o cadena: es la firma de los iconos de lucide, y
   restringirla a número rompía el typecheck de producción. */
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
            /* btn-premium-shine: pasada de luz al hacer hover, el mismo
               recurso que usan los demás CTA del sitio. */
            className={
                "btn-premium-shine group flex w-full items-center justify-center gap-3 rounded-full font-ui font-semibold tracking-tight transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 active:translate-y-0 " +
                (compact ? "py-3 text-[14px]" : "py-3.5 text-[15px]")
            }
            style={{
                /* Esmeralda profundo, no el verde neón de WhatsApp: convive con
                   el chocolate del modal en vez de gritar sobre él. */
                background: "linear-gradient(180deg,#1f7a4d 0%,#146039 55%,#0d4529 100%)",
                color: "#f5f0e8",
                border: "1px solid rgba(245,240,232,0.16)",
                boxShadow: [
                    "inset 0 1px 0 rgba(255,255,255,0.20)",   // labio de luz arriba
                    "inset 0 -12px 22px rgba(0,0,0,0.22)",    // hundido abajo → volumen
                    "0 14px 30px -12px rgba(0,0,0,0.65)",     // sombra profunda, no halo
                    "0 4px 12px -6px rgba(20,96,57,0.45)",    // verde apenas insinuado
                ].join(", "),
            }}
        >
            <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-[rgba(245,240,232,0.22)]"
                style={{
                    background: "rgba(245,240,232,0.14)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
                }}
            >
                <WhatsAppIcon />
            </span>
            <span>{children}</span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
            </span>
        </a>
    );
}

const inputCls =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-[#c39767]/70";
const selectCls = inputCls + " appearance-none cursor-pointer";

type OpenOpts = { perfil?: string; interes?: string; email?: string; nombre?: string; avatar?: string };
type Ctx = { openModal: (opts?: OpenOpts) => void; closeModal: () => void };

const RegistroModalContext = createContext<Ctx | null>(null);

export function useRegistroModal(): Ctx {
    const ctx = useContext(RegistroModalContext);
    if (!ctx) throw new Error("useRegistroModal debe usarse dentro de <RegistroModalProvider>");
    return ctx;
}

export function RegistroModalProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [hint, setHint] = useState<OpenOpts>({});

    const openModal = useCallback((opts?: OpenOpts) => {
        setHint(opts ?? {});
        setOpen(true);
    }, []);
    const closeModal = useCallback(() => setOpen(false), []);

    /* Intercepta clics en cualquier <a href="/registro"> y abre el modal
       en vez de navegar. Deja pasar clics con modificadores (cmd/ctrl/etc.). */
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            const anchor = target?.closest?.('a[href="/registro"]') as HTMLAnchorElement | null;
            if (!anchor) return;
            e.preventDefault();
            openModal();
        };
        document.addEventListener("click", onClick);
        // Aterrizaje vía /registro → /?registro=1 (clic pre-hidratación,
        // ctrl+click o pestaña nueva): abre el modal directamente.
        try {
            if (new URLSearchParams(window.location.search).has("registro")) {
                openModal();
            }
        } catch { /* */ }
        return () => document.removeEventListener("click", onClick);
    }, [openModal]);

    /* Al volver del login con Google (Supabase Auth), abre el modal con
       nombre y correo pre-llenados — solo si aún no se ha registrado. */
    useEffect(() => {
        let handled = false;
        const maybeOpen = (user: { email?: string; user_metadata?: Record<string, unknown> } | null) => {
            if (handled || !user?.email) return;
            try {
                if (localStorage.getItem(REGISTERED_FLAG) === "true") return;
            } catch { /* */ }
            handled = true;
            const meta = user.user_metadata ?? {};
            const nombre = (meta.full_name || meta.name || "") as string;
            const avatar = (meta.avatar_url || meta.picture || "") as string;
            openModal({ email: user.email, nombre, avatar });
        };
        getSessionUser().then(maybeOpen);
        const unsub = onAuthChange(maybeOpen);
        return unsub;
    }, [openModal]);

    return (
        <RegistroModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {open && <Modal hint={hint} onClose={closeModal} />}
        </RegistroModalContext.Provider>
    );
}

function Modal({ hint, onClose }: { hint: OpenOpts; onClose: () => void }) {
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [errMsg, setErrMsg] = useState("");
    const [doneName, setDoneName] = useState("");
    /* Enlace a WhatsApp con los datos del lead ya redactados. Se arma al
       enviar y se ofrece en la pantalla de éxito como botón (un <a> real:
       nunca lo bloquea el navegador, a diferencia de un window.open que
       ocurre después de esperar a la red). */
    const [waUrl, setWaUrl] = useState<string | null>(null);
    /* Canales secundarios plegados: WhatsApp no debe competir con ellos. */
    const [showOtras, setShowOtras] = useState(false);
    const paisRef = useRef<HTMLSelectElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    /* Para no cerrar el modal cuando el gesto empieza dentro del panel. */
    const fondoPulsado = useRef(false);

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

    /* Esc para cerrar */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    /* Auto-detección de país por IP (silenciosa, solo pre-selecciona) */
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

        try {
            const res = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            // 200 = nuevo, 409 = ya registrado → ambos cuentan como éxito
            if (res.ok || res.status === 409) {
                try { localStorage.setItem(REGISTERED_FLAG, "true"); } catch { /* */ }
                // Guarda la cuenta → el navbar muestra el avatar arriba al instante.
                setStoredAccount({ email: payload.email, nombre: payload.nombre, avatar: hint.avatar });
                setDoneName(payload.nombre.split(" ")[0]);
                setWaUrl(
                    buildWhatsAppUrl({
                        ...payload,
                        pais: paisLegible,
                        interes_compra: interesLegible,
                        obras_activas: payload.obras_activas as string | number | null,
                    })
                );
                setStatus("success");
                return;
            }
            const detail = await res.json().catch(() => ({}));
            throw new Error((detail as { error?: string }).error || `status_${res.status}`);
        } catch (err) {
            setStatus("error");
            // Si nuestra base falla no bloqueamos al lead: le ofrecemos WhatsApp
            // igual, que es justo el canal donde queremos que acabe.
            setWaUrl(
                buildWhatsAppUrl({
                    ...payload,
                    pais: paisLegible,
                    interes_compra: interesLegible,
                    obras_activas: payload.obras_activas as string | number | null,
                })
            );
            // fetch lanza TypeError en fallo de red — frecuente en obra con señal débil
            setErrMsg(
                err instanceof TypeError
                    ? "Sin conexión. Verifica tu señal e intenta de nuevo."
                    : "No pudimos completar tu registro. Revisa los datos e intenta de nuevo."
            );
        }
    }

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            /* Cerrar solo si el gesto EMPIEZA y TERMINA en el fondo. Con onClick a
               secas, arrastrar para seleccionar texto dentro de un campo y soltar
               fuera cerraba el modal y borraba los cinco datos ya escritos. */
            onPointerDown={(e) => { fondoPulsado.current = e.target === e.currentTarget; }}
            onClick={(e) => { if (e.target === e.currentTarget && fondoPulsado.current) onClose(); }}
            data-lenis-prevent
        >
            {/* El panel ya no scrollea: lo hace el div interior, para que la × no se
                vaya con el contenido (en el estado de error crece y superaba 90vh). */}
            <div
                className="cream-glass relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl p-7 md:p-8"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5f0e8]/[0.2] text-[#e8ddc9]/[0.7] transition-colors hover:border-[#e8ddc9]/[0.5] hover:text-[#f5f0e8]"
                >
                    ×
                </button>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>

                {status === "success" ? (
                    <div className="py-4 text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -25 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 240, damping: 14 }}
                            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                            style={{
                                background: "rgba(195,151,103,0.16)",
                                border: "1px solid rgba(195,151,103,0.5)",
                                boxShadow: "0 0 0 6px rgba(195,151,103,0.08)",
                            }}
                        >
                            <Check size={32} strokeWidth={2.6} style={{ color: "#e8c9a0" }} />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="mb-2 font-display text-2xl font-bold text-white"
                        >
                            {doneName ? `¡Listo, ${doneName}!` : "¡Estás dentro!"}
                        </motion.h2>
                        <p className="mb-5 text-sm leading-relaxed text-zinc-400">
                            {waUrl
                                ? "Quedaste en la lista de acceso anticipado. Sigue la conversación por WhatsApp y agendamos tu demo hoy mismo."
                                : "Quedaste en la lista de acceso anticipado. Te escribimos muy pronto para coordinar tu demo en vivo — revisa tu correo (y la carpeta de spam)."}
                        </p>
                        <div
                            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-[#e8c9a0]"
                            style={{ background: "rgba(195,151,103,0.1)", border: "1px solid rgba(195,151,103,0.3)" }}
                        >
                            {/* El avatar del navbar solo se pinta desde 1024px; por debajo
                                la cuenta vive dentro del menú. Decir "arriba" en móvil
                                mandaba al lead a mirar donde no hay nada, y justo en el
                                momento de conversión. */}
                            <span className="hidden lg:inline">Tu cuenta ya aparece arriba <span aria-hidden>↗</span></span>
                            <span className="lg:hidden">Tu cuenta ya está en el menú <span aria-hidden>☰</span></span>
                        </div>

                        {/* Salto a WhatsApp con el mensaje ya redactado. Es un <a>
                            real —no un window.open— para que ningún navegador lo
                            bloquee. Si no hay número configurado, no se muestra. */}
                        {waUrl && (
                            <div className="mb-3">
                                <WhatsAppCTA href={waUrl}>Continuar en WhatsApp</WhatsAppCTA>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className={
                                waUrl
                                    ? "w-full rounded-full py-2.5 font-ui text-xs font-semibold uppercase tracking-widest text-[#e8ddc9]/70 transition-colors hover:text-[#f5f0e8]"
                                    : "w-full rounded-full py-3 font-ui text-xs font-semibold uppercase tracking-widest text-amber-50 transition-all"
                            }
                            style={
                                waUrl
                                    ? undefined
                                    : {
                                          background: "linear-gradient(180deg,#c39767 0%,#b07a4d 55%,#8b5c3b 100%)",
                                          boxShadow: "0 8px 22px rgba(139,92,59,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                                      }
                            }
                        >
                            {waUrl ? "Ahora no" : "Entendido"}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-1 font-ui text-[11px] uppercase tracking-[0.35em] text-[#c39767]">
                            Acceso anticipado
                        </div>
                        <h2 className="mb-2 font-display text-2xl font-bold text-white">Solicita tu demo</h2>
                        <p className="mb-6 text-sm text-zinc-400">
                            Déjanos tus datos y te contactamos para mostrarte BitacorIA en vivo.
                        </p>

                        <form onSubmit={handleSubmit} ref={formRef} className="space-y-3">
                            <input name="nombre" required defaultValue={hint.nombre ?? ""} placeholder="Nombre completo" className={inputCls} />
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue={hint.email ?? ""}
                                placeholder="Correo (personal o de trabajo)"
                                className={inputCls}
                            />
                            <select name="perfil" required defaultValue={hint.perfil ?? ""} className={selectCls}>
                                <option value="" disabled>
                                    Selecciona tu perfil profesional…
                                </option>
                                {PERFILES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <input
                                name="obras_activas"
                                type="number"
                                min="0"
                                placeholder="¿Cuántas obras activas tienes? (opcional)"
                                className={inputCls}
                            />
                            <select name="interes_compra" required defaultValue={hint.interes ?? ""} className={selectCls}>
                                <option value="" disabled>
                                    ¿Qué tan listo estás?
                                </option>
                                {INTERESES.map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>
                            <select name="pais" ref={paisRef} required defaultValue="" className={selectCls}>
                                <option value="" disabled>
                                    ¿Desde qué país nos escribes?
                                </option>
                                {PAISES.map(([v, l]) => (
                                    <option key={v} value={v}>{l}</option>
                                ))}
                            </select>

                            {errMsg && (
                                <div className="space-y-3">
                                    <p className="text-sm text-red-400">{errMsg}</p>

                                    {/* ── PROCESO DE EMERGENCIA ──
                                        Si el registro falla, el lead no se pierde: le
                                        damos canales directos con sus datos ya escritos.
                                        WhatsApp es el principal; el resto queda plegado
                                        para no competir con él. */}
                                    {waUrl && (
                                        <div
                                            className="rounded-2xl p-4"
                                            style={{
                                                background: "rgba(245,240,232,0.04)",
                                                border: "1px solid rgba(245,240,232,0.10)",
                                            }}
                                        >
                                            <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">
                                                No te quedes fuera: escríbenos y te damos acceso
                                                a mano. Tus datos ya van en el mensaje.
                                            </p>

                                            {/* Relee el formulario justo al pulsar: si el
                                                usuario corrigió un campo tras el fallo, el
                                                mensaje sale con el dato bueno. */}
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

                            <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="w-full rounded-full py-3 font-ui text-xs font-semibold uppercase tracking-widest text-amber-50 transition-all disabled:opacity-60"
                                style={{
                                    background: "linear-gradient(180deg,#c39767 0%,#b07a4d 55%,#8b5c3b 100%)",
                                    boxShadow:
                                        "0 8px 22px rgba(139,92,59,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
                                }}
                            >
                                {status === "submitting" ? "Procesando…" : "Aplicar ahora →"}
                            </button>
                            <p className="text-center text-[11px] text-zinc-600">
                                Tus datos se usan solo para contactarte. Sin spam.
                            </p>
                        </form>
                    </>
                )}
                </div>
            </div>
        </div>
    );
}
