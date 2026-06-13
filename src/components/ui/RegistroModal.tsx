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

const inputCls =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-[#c39767]/70";
const selectCls = inputCls + " appearance-none cursor-pointer";

type OpenOpts = { perfil?: string; interes?: string; email?: string; nombre?: string };
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
            openModal({ email: user.email, nombre });
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
    const paisRef = useRef<HTMLSelectElement>(null);

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
        try {
            const res = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            // 200 = nuevo, 409 = ya registrado → ambos cuentan como éxito
            if (res.ok || res.status === 409) {
                try { localStorage.setItem(REGISTERED_FLAG, "true"); } catch { /* */ }
                setStatus("success");
                return;
            }
            const detail = await res.json().catch(() => ({}));
            throw new Error((detail as { error?: string }).error || `status_${res.status}`);
        } catch (err) {
            setStatus("error");
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
            onClick={onClose}
            data-lenis-prevent
        >
            <div
                className="cream-glass relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl p-7 md:p-8"
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#f5f0e8]/[0.2] text-[#e8ddc9]/[0.7] transition-colors hover:border-[#e8ddc9]/[0.5] hover:text-[#f5f0e8]"
                >
                    ×
                </button>

                {status === "success" ? (
                    <div className="py-6 text-center">
                        <div
                            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-[#c39767]"
                            style={{ background: "rgba(195,151,103,0.14)", border: "1px solid rgba(195,151,103,0.4)" }}
                        >
                            ✓
                        </div>
                        <h2 className="mb-2 font-display text-2xl font-bold text-white">¡Estás dentro!</h2>
                        <p className="mb-6 text-sm text-zinc-400">
                            Recibimos tu solicitud. Te contactaremos muy pronto para coordinar tu demo —
                            revisa tu correo (incluida la carpeta de spam).
                        </p>
                        <button
                            onClick={onClose}
                            className="rounded-full border border-[#f5f0e8]/[0.25] px-6 py-2.5 font-ui text-xs uppercase tracking-widest text-[#e8ddc9] transition-colors hover:bg-[#f5f0e8]/[0.08]"
                        >
                            Cerrar
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

                        <form onSubmit={handleSubmit} className="space-y-3">
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

                            {errMsg && <p className="text-sm text-red-400">{errMsg}</p>}

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
    );
}
