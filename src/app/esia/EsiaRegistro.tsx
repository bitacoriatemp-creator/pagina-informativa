"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    GraduationCap, Users, Briefcase, ArrowRight, Mail, User,
    Sun, Moon, Shirt, PenTool, X as XIcon, Check, MapPin, Calendar, Sparkles,
    HelpCircle, CheckCircle2, Layers, WifiOff, Loader2,
} from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ══════════════════════════════════════════════════════════════════════
   EsiaRegistro — Funnel de registro · Conferencia ESIA Zacatenco
   Theme: Beige claro premium (palette tipo Hermès/Aesop)
   Tokens del skill ui-ux-pro-max (Modern Light · Editorial)
   ══════════════════════════════════════════════════════════════════════ */

const ENDPOINT = "https://epjfqcndxoyrtrmasuvt.supabase.co/functions/v1/register-conferencia";
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const PRESS_TAP = { scale: 0.97 };

/* ── Fechas configurables ──
   EVENT_DATE = conferencia actual (ESIA Zacatenco)
   NEXT_EVENT_DATE = siguiente conferencia (placeholder — actualizar)
   Si EVENT_DATE ya pasó, el countdown salta a NEXT_EVENT_DATE.
   ─────────────────────── */
const EVENT_DATE = new Date("2026-06-02T11:30:00-06:00").getTime();
const NEXT_EVENT_DATE = new Date("2026-12-02T11:30:00-06:00").getTime();
const NEXT_EVENT_LABEL = "Próxima conferencia · Diciembre 2026";

function buzz(pattern: number | number[]) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(pattern); } catch (_) { /* no-op */ }
    }
}

/* ── Fetch resiliente para redes lentas/intermitentes (ESIA WiFi) ──
   - AbortController con timeout
   - Retry con backoff exponencial (500/1500/3000ms)
   - Reintenta solo en errores de red (fetch throw) y HTTP 5xx
   - 4xx no retry (validación inválida)
*/
async function fetchWithRetry(
    url: string,
    init: RequestInit = {},
    opts: { timeoutMs?: number; maxAttempts?: number } = {},
): Promise<Response> {
    const timeoutMs = opts.timeoutMs ?? 8000;
    const maxAttempts = opts.maxAttempts ?? 3;
    const backoffs = [500, 1500, 3000];

    let lastErr: unknown = null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            const res = await fetch(url, { ...init, signal: ctrl.signal });
            clearTimeout(timer);
            // 4xx → no retry (input del usuario)
            if (res.status >= 400 && res.status < 500) return res;
            // 5xx → retry
            if (res.status >= 500 && attempt < maxAttempts - 1) {
                await new Promise((r) => setTimeout(r, backoffs[attempt]));
                continue;
            }
            return res;
        } catch (err) {
            clearTimeout(timer);
            lastErr = err;
            if (attempt < maxAttempts - 1) {
                await new Promise((r) => setTimeout(r, backoffs[attempt]));
                continue;
            }
        }
    }
    throw lastErr ?? new Error("network_failed");
}

type Step = "intro" | "type" | "identity" | "session" | "gender" | "asistencia" | "merch" | "submitting" | "confirmed" | "tentativo" | "error";
type Asistencia = "si" | "no_seguro";
type Tipo = "alumno" | "profesor" | "externo";
type Sesion = "matutino" | "vespertino";
type Genero = "hombre" | "mujer" | "no_especifica";
type MerchSel = "playera" | "lapicero" | "ninguno";
type Talla = "CH" | "M" | "G" | "XG";

interface Inventario {
    asientos_matutino_libres: number;
    asientos_vespertino_libres: number;
    playeras_libres: number;
    lapiceros_libres: number;
}

interface Result {
    numero_asiento: number | null;
    modalidad: "asiento" | "de_pie";
    merch: MerchSel;
    talla: Talla | null;
    sesion: Sesion;
}

export default function EsiaRegistro() {
    const [step, setStep] = useState<Step>("intro");
    const [tipo, setTipo] = useState<Tipo | null>(null);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [sesion, setSesion] = useState<Sesion | null>(null);
    const [genero, setGenero] = useState<Genero | null>(null);
    const [asistencia, setAsistencia] = useState<Asistencia | null>(null);
    const [merchSel, setMerchSel] = useState<MerchSel | null>(null);
    const [talla, setTalla] = useState<Talla | null>(null);
    const [inventario, setInventario] = useState<Inventario | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const reducedMotion = useReducedMotion();

    /* Detección online/offline — banner visible si no hay red */
    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const sync = () => setIsOnline(navigator.onLine);
        sync();
        window.addEventListener("online", sync);
        window.addEventListener("offline", sync);
        return () => {
            window.removeEventListener("online", sync);
            window.removeEventListener("offline", sync);
        };
    }, []);

    /* Inventario en vivo — con timeout corto, NO bloquea UI si falla */
    useEffect(() => {
        if (step !== "intro" && step !== "session" && step !== "merch") return;
        let cancelled = false;
        fetchWithRetry(`${ENDPOINT}/inventario`, { cache: "no-store" }, { timeoutMs: 4000, maxAttempts: 2 })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (cancelled) return;
                if (d && d.ok !== false) setInventario(d as Inventario);
            })
            .catch(() => { /* sin inventario, la UI sigue funcionando */ });
        return () => { cancelled = true; };
    }, [step]);

    const submit = async (overrideMerch?: MerchSel) => {
        buzz(10);
        setStep("submitting");
        const finalMerch: MerchSel = overrideMerch ?? merchSel ?? "ninguno";
        try {
            /* Retry agresivo en submit: 3 intentos con backoff hasta 8s timeout.
               Si la red de ESIA da tumbos, no perdemos el registro. */
            const res = await fetchWithRetry(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo, nombre: nombre.trim(), email: email.trim().toLowerCase(),
                    sesion, genero, merch: finalMerch,
                    talla: finalMerch === "playera" ? talla : null,
                }),
            }, { timeoutMs: 12000, maxAttempts: 3 });

            if (res.status === 409) {
                setErrorMsg("Ya estás registrado con ese correo. Revisa tu bandeja.");
                setStep("error");
                return;
            }
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                setErrorMsg(`Error: ${detail.error ?? `HTTP ${res.status}`}`);
                setStep("error");
                return;
            }
            const data = (await res.json()) as Result & { ok: boolean };
            setResult(data);
            buzz([20, 60, 30]);
            setStep("confirmed");
        } catch (e) {
            setErrorMsg(
                isOnline
                    ? "La red está lenta o tardó demasiado. Intenta de nuevo."
                    : "Sin conexión. Reconecta el WiFi o datos móviles y vuelve a intentar."
            );
            setStep("error");
        }
    };

    const stepIdx =
        step === "type" ? 1 :
        step === "identity" ? 2 :
        step === "session" ? 3 :
        step === "gender" ? 4 :
        step === "asistencia" ? 5 :
        step === "merch" ? 6 : 0;
    const totalSteps = asistencia === "no_seguro" ? 5 : 6;
    const showProgress = stepIdx > 0 && step !== "submitting" && step !== "confirmed" && step !== "error";

    const onStepChange = (next: () => void) => { buzz(8); next(); };

    return (
        <div
            className="relative w-full overflow-x-hidden text-stone-900"
            style={{
                minHeight: "100dvh",
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                background: "linear-gradient(180deg, #f6efe1 0%, #ece2cd 60%, #e2d4b8 100%)",
            }}
        >
            <BackgroundDeco reducedMotion={!!reducedMotion} />

            {/* ── Banner offline (slim, sticky bajo el header) ── */}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        key="offline-banner"
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EXPO_OUT }}
                        role="status"
                        aria-live="polite"
                        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 py-2 text-amber-50 font-mono text-[11px] uppercase tracking-widest"
                        style={{ background: "linear-gradient(180deg, #8b5c3b, #6d4426)" }}
                    >
                        <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                        Sin conexión — el registro se enviará al recuperar señal
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Preload de imágenes merch (cuando entras a un step intermedio) ── */}
            {(step === "session" || step === "gender" || step === "asistencia") && (
                <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetPath("/images/esia-playera.webp")} alt="" loading="eager" decoding="async" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetPath("/images/esia-lapicero.webp")} alt="" loading="eager" decoding="async" />
                </div>
            )}

            {/* ── Header sticky con logo ── */}
            <header
                className="sticky top-0 z-30 flex items-center justify-between gap-3 px-5 py-3 md:px-10 md:py-4"
                style={{
                    backgroundColor: "rgba(246, 239, 225, 0.78)",
                    backdropFilter: "blur(20px) saturate(140%)",
                    WebkitBackdropFilter: "blur(20px) saturate(140%)",
                    borderBottom: "1px solid rgba(139, 92, 59, 0.10)",
                }}
            >
                <div className="flex items-center gap-2.5">
                    <Image
                        src={assetPath("/images/logo_solo_dibujo.png")}
                        alt="BitacorIA"
                        width={28}
                        height={28}
                        className="object-contain"
                        priority
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-stone-700 leading-none hidden sm:inline">
                        BITACORIA
                    </span>
                </div>

                {showProgress && (
                    <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={stepIdx}>
                        {Array.from({ length: totalSteps }, (_, k) => k + 1).map((i) => (
                            <span
                                key={i}
                                className={`block h-1 rounded-full transition-all duration-300 ${
                                    i < stepIdx ? "w-3 bg-amber-700"
                                    : i === stepIdx ? "w-6 bg-amber-600"
                                    : "w-3 bg-stone-300"
                                }`}
                            />
                        ))}
                    </div>
                )}

                <div className="hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-stone-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>02 · 06 · 2026</span>
                    <span className="opacity-30">/</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ESIA · Zacatenco</span>
                </div>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-6 md:py-12 md:px-6">
                <AnimatePresence mode="wait">
                    {step === "intro"      && <Intro key="intro" onStart={() => onStepChange(() => setStep("type"))} inventario={inventario} reducedMotion={!!reducedMotion} />}
                    {step === "type"       && <StepType key="type" value={tipo} onChange={(v) => { setTipo(v); onStepChange(() => setStep("identity")); }} />}
                    {step === "identity"   && <StepIdentity key="identity" nombre={nombre} email={email} setNombre={setNombre} setEmail={setEmail} onNext={() => onStepChange(() => setStep("session"))} onBack={() => setStep("type")} />}
                    {step === "session"    && <StepSession key="session" inventario={inventario} value={sesion} onChange={(v) => { setSesion(v); onStepChange(() => setStep("gender")); }} onBack={() => setStep("identity")} />}
                    {step === "gender"     && <StepGender key="gender" value={genero} onChange={(v) => { setGenero(v); onStepChange(() => setStep("asistencia")); }} onBack={() => setStep("session")} />}
                    {step === "asistencia" && <StepAsistencia key="asistencia" value={asistencia} totalSteps={totalSteps} onChange={(v) => {
                        setAsistencia(v);
                        if (v === "no_seguro") {
                            /* NO enviamos al server — no consumimos asiento ni inventario.
                               El usuario verá una pantalla amigable y, si cambia de opinión,
                               puede volver y elegir "Sí asistiré" sin haber quemado el email. */
                            buzz(8);
                            setStep("tentativo");
                        } else {
                            onStepChange(() => setStep("merch"));
                        }
                    }} onBack={() => setStep("gender")} />}
                    {step === "merch"      && <StepMerch key="merch" inventario={inventario} merchSel={merchSel} setMerchSel={setMerchSel} talla={talla} setTalla={setTalla} onSubmit={() => submit()} onBack={() => setStep("asistencia")} totalSteps={totalSteps} />}
                    {step === "submitting" && <Submitting key="submitting" />}
                    {step === "confirmed"  && result && <Confirmed key="confirmed" result={result} nombre={nombre} />}
                    {step === "tentativo"  && <Tentativo key="tentativo" onReconsider={() => { setAsistencia(null); setStep("asistencia"); }} />}
                    {step === "error"      && <ErrorScreen key="error" msg={errorMsg} onRetry={() => setStep("intro")} />}
                </AnimatePresence>
            </main>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   BackgroundDeco — beige claro con ambient blobs bronce
   ══════════════════════════════════════════════════════════════════════ */
function BackgroundDeco({ reducedMotion }: { reducedMotion: boolean }) {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* Grid sutil bronce sobre beige */}
            <div
                className="absolute inset-0 opacity-30 md:opacity-40"
                style={{
                    backgroundImage: [
                        "repeating-linear-gradient(to right, rgba(139,92,59,0.05) 0 1px, transparent 1px 80px)",
                        "repeating-linear-gradient(to bottom, rgba(139,92,59,0.05) 0 1px, transparent 1px 80px)",
                    ].join(", "),
                }}
            />
            {/* Ambient blob top-left */}
            <motion.div
                className="absolute -top-40 -left-40 w-[420px] h-[420px] md:w-[600px] md:h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(195,151,103,0.35), transparent 70%)",
                    filter: "blur(45px)",
                }}
                animate={reducedMotion ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
                transition={reducedMotion ? undefined : { duration: 24, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Ambient blob bottom-right */}
            <motion.div
                className="absolute -bottom-40 -right-40 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(212,168,120,0.28), transparent 70%)",
                    filter: "blur(55px)",
                }}
                animate={reducedMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
                transition={reducedMotion ? undefined : { duration: 30, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Vignette warm */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, rgba(226, 212, 184, 0.5) 100%)",
                }}
            />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Step variants
   ══════════════════════════════════════════════════════════════════════ */
const stepVariants = {
    enter: { opacity: 0, y: 24 },
    center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EXPO_OUT } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.32, ease: [0.4, 0, 0.6, 1] as const } },
};

function StepWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div variants={stepVariants} initial="enter" animate="center" exit="exit" className="w-full">
            {children}
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   LandingLink — CTA reutilizable que va a /plataforma con UX correcta
   ──────────────────────────────────────────────────────────────────────
   - Prefetch del landing al montar (warm la ruta antes del click)
   - Loading state inmediato en el click (feedback < 100ms)
   - Disabled durante la navegación para evitar doble-click
   ══════════════════════════════════════════════════════════════════════ */
function LandingLink({ style = "secondary", className = "" }: { style?: "primary" | "secondary"; className?: string }) {
    const router = useRouter();
    const [navigating, setNavigating] = useState(false);

    /* Prefetch eager — descarga el bundle/datos del landing en background
       para que cuando el usuario haga click, ya esté listo. */
    useEffect(() => {
        try { router.prefetch("/"); } catch (_) { /* no-op si falla */ }
    }, [router]);

    const handleClick = () => {
        if (navigating) return;
        setNavigating(true);
        buzz(8);
        router.push("/");
    };

    if (style === "primary") {
        return (
            <button
                disabled={navigating}
                onClick={handleClick}
                className={`btn-premium-shine w-full inline-flex items-center justify-center gap-3 rounded-full px-8 font-display text-sm uppercase tracking-[0.25em] text-amber-50 transition ${className}`}
                style={{
                    background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                    boxShadow:
                        "0 10px 28px rgba(139, 92, 59, 0.30), " +
                        "inset 0 1px 0 rgba(255, 255, 255, 0.25), " +
                        "inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                    minHeight: "56px",
                }}
            >
                {navigating ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando plataforma…
                    </>
                ) : (
                    <>
                        <Layers className="w-4 h-4" />
                        Conoce la plataforma
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </button>
        );
    }

    /* Secondary (outline) */
    return (
        <button
            disabled={navigating}
            onClick={handleClick}
            className={`group w-full inline-flex items-center justify-center gap-3 rounded-full border-2 border-amber-700/30 bg-white/50 px-8 font-display text-sm uppercase tracking-[0.25em] text-amber-900 hover:border-amber-700/60 hover:bg-amber-50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait transition-all duration-200 backdrop-blur-sm ${className}`}
            style={{ minHeight: "56px" }}
        >
            {navigating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando plataforma…
                </>
            ) : (
                <>
                    <Layers className="w-4 h-4" />
                    Conoce la plataforma
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
            )}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Intro
   ══════════════════════════════════════════════════════════════════════ */
function Intro({ onStart, inventario, reducedMotion }: { onStart: () => void; inventario: Inventario | null; reducedMotion: boolean }) {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center pt-4 md:pt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: EXPO_OUT }}
                    className="lq-glass-chip mb-6 md:mb-8 inline-flex items-center gap-3 rounded-full px-4 py-1.5 md:px-5 md:py-2"
                >
                    <span className="relative flex h-2 w-2">
                        {!reducedMotion && <span className="absolute inset-0 animate-ping rounded-full bg-amber-600 opacity-75" />}
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-700" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-900/90">
                        Conferencia Exclusiva
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EXPO_OUT }}
                    className="font-display text-[2.6rem] leading-[0.95] md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-stone-900"
                >
                    El futuro
                    <br />
                    de la <span className="text-gradient-bronze">obra</span>
                    <br />
                    se construye
                    <br />
                    <span className="text-gradient-bronze">aquí.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.45, ease: EXPO_OUT }}
                    className="mt-6 md:mt-8 max-w-xl text-sm md:text-lg text-stone-700 leading-relaxed px-2"
                >
                    Conferencia BitacorIA en la ESIA Zacatenco.
                    <br className="hidden md:inline" />
                    <span className="block md:inline mt-1 md:mt-0"> Inteligencia de campo · IA generativa · auditoría automatizada.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.6, ease: EXPO_OUT }}
                    className="mt-8 md:mt-10"
                >
                    <CountdownTimer />
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.75, ease: EXPO_OUT }}
                    whileTap={PRESS_TAP}
                    onClick={onStart}
                    className="btn-premium-shine shine-once group mt-8 md:mt-12 w-full max-w-md inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 md:py-5 font-display text-sm uppercase tracking-[0.25em] text-amber-50 transition-all"
                    style={{
                        background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                        boxShadow:
                            "0 12px 32px rgba(139, 92, 59, 0.35), " +
                            "inset 0 1px 0 rgba(255, 255, 255, 0.28), " +
                            "inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                        minHeight: "56px",
                    }}
                    aria-label="Reservar mi asiento ahora"
                >
                    Reserva tu asiento
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.55 }}
                    transition={{ delay: 1.0 }}
                    className="mt-10 md:mt-14 font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500"
                >
                    Tarda menos de 60 segundos
                </motion.div>
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   CountdownTimer — tick por segundo + fallback a próxima conferencia
   ══════════════════════════════════════════════════════════════════════ */
function CountdownTimer() {
    /* Mounted pattern para evitar hydration mismatch:
       el server renderiza placeholder estable; el client toma el reloj real
       después del primer mount. */
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    /* Placeholder durante SSR + primer paint para evitar mismatch */
    if (now === null) {
        return (
            <div className="inline-flex items-center gap-1.5 md:gap-3" aria-hidden="true">
                <CountUnit value={0} label="DÍAS" />
                <Sep />
                <CountUnit value={0} label="HRS" />
                <Sep />
                <CountUnit value={0} label="MIN" />
                <Sep />
                <CountUnit value={0} label="SEG" />
            </div>
        );
    }

    /* Si el evento actual ya pasó, switch a NEXT_EVENT */
    const eventActive = EVENT_DATE - now > 0;
    const targetDate = eventActive ? EVENT_DATE : NEXT_EVENT_DATE;
    const nextEventOver = !eventActive && NEXT_EVENT_DATE - now <= 0;

    const ms = Math.max(0, targetDate - now);
    const diff = {
        days: Math.floor(ms / 86_400_000),
        hours: Math.floor((ms % 86_400_000) / 3_600_000),
        mins: Math.floor((ms % 3_600_000) / 60_000),
        secs: Math.floor((ms % 60_000) / 1000),
    };

    if (nextEventOver) {
        return (
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-900">
                Mantente atento al anuncio de la próxima conferencia.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {!eventActive && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EXPO_OUT }}
                    className="lq-glass-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-900">
                        {NEXT_EVENT_LABEL}
                    </span>
                </motion.div>
            )}
            <div className="inline-flex items-center gap-1.5 md:gap-3">
                <CountUnit value={diff.days}  label="DÍAS" />
                <Sep />
                <CountUnit value={diff.hours} label="HRS" />
                <Sep />
                <CountUnit value={diff.mins}  label="MIN" />
                <Sep />
                <CountUnit value={diff.secs}  label="SEG" pulse />
            </div>
            {!eventActive && (
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mt-1">
                    La conferencia ESIA terminó. ¡Te esperamos en la siguiente!
                </div>
            )}
        </div>
    );
}

function Sep() {
    return <span className="text-amber-700/40 font-display text-2xl leading-none">·</span>;
}

function CountUnit({ value, label, pulse }: { value: number; label: string; pulse?: boolean }) {
    return (
        <div className="flex flex-col items-center min-w-[48px] md:min-w-[64px]">
            <motion.div
                /* En segundos: micro-pulse en cada cambio de número */
                key={pulse ? value : undefined}
                initial={pulse ? { scale: 1.08, opacity: 0.85 } : false}
                animate={pulse ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.25, ease: EXPO_OUT }}
                className="font-display font-extrabold tabular-nums leading-none text-2xl md:text-4xl"
                style={{
                    background: "linear-gradient(180deg, #c39767 0%, #8b5c3b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {String(value).padStart(2, "0")}
            </motion.div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-stone-500 mt-1.5">{label}</div>
        </div>
    );
}

function Stat({ label, value, of }: { label: string; value: number; of: number }) {
    const pct = of > 0 ? (value / of) * 100 : 0;
    const lowStock = pct < 25;
    return (
        <div className="rounded-lg border border-stone-300/70 bg-white/40 backdrop-blur-sm px-3 py-2.5">
            <div className="text-stone-600 mb-1">{label}</div>
            <div className={`font-mono text-lg font-bold ${lowStock ? "text-red-700" : "text-amber-800"}`}>
                {value} <span className="text-stone-400 text-xs font-normal">/ {of}</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepType
   ══════════════════════════════════════════════════════════════════════ */
function StepType({ value, onChange }: { value: Tipo | null; onChange: (v: Tipo) => void }) {
    const opts: { id: Tipo; label: string; icon: typeof GraduationCap; desc: string }[] = [
        { id: "alumno", label: "Alumno", icon: GraduationCap, desc: "ESIA / IPN / Otra escuela" },
        { id: "profesor", label: "Profesor", icon: Briefcase, desc: "Docente / Investigador" },
        { id: "externo", label: "Externo", icon: Users, desc: "Industria / Profesional" },
    ];
    return (
        <StepWrapper>
            <StepHeader idx={1} total={6} title="¿Quién eres?" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 md:mt-10">
                {opts.map((o, i) => {
                    const Icon = o.icon;
                    const active = value === o.id;
                    return (
                        <motion.button
                            key={o.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EXPO_OUT }}
                            whileTap={PRESS_TAP}
                            onClick={() => onChange(o.id)}
                            className={`group flex flex-col items-center text-center rounded-2xl border p-5 md:p-6 transition-colors duration-200 ${active ? "border-amber-700/60 bg-amber-50" : "border-stone-300/70 bg-white/60 hover:border-amber-700/40 hover:bg-amber-50/60 active:border-amber-700/50"}`}
                            style={{ minHeight: "120px", boxShadow: active ? "0 4px 20px rgba(139,92,59,0.12)" : "0 1px 4px rgba(139,92,59,0.05)" }}
                            aria-pressed={active}
                        >
                            <Icon className={`w-9 h-9 md:w-10 md:h-10 mb-3 md:mb-4 ${active ? "text-amber-800" : "text-amber-700/80 group-hover:text-amber-800"}`} aria-hidden="true" />
                            <div className={`font-display text-base md:text-lg uppercase tracking-wider ${active ? "text-amber-900" : "text-stone-900"}`}>
                                {o.label}
                            </div>
                            <div className="mt-1 text-xs text-stone-500">{o.desc}</div>
                        </motion.button>
                    );
                })}
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepIdentity
   ══════════════════════════════════════════════════════════════════════ */
function StepIdentity({
    nombre, email, setNombre, setEmail, onNext, onBack,
}: {
    nombre: string; email: string;
    setNombre: (v: string) => void; setEmail: (v: string) => void;
    onNext: () => void; onBack: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputRef.current?.focus(); }, []);

    const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    const canNext = nombre.trim().length >= 2 && validEmail;

    return (
        <StepWrapper>
            <StepHeader idx={2} total={6} title="Tus datos" subtitle="Solo lo esencial." onBack={onBack} />
            <div className="mt-8 md:mt-10 space-y-4 max-w-xl mx-auto">
                <InputField
                    id="reg-nombre"
                    icon={User}
                    label="Nombre completo"
                    placeholder="¿Cómo te llamas?"
                    value={nombre}
                    onChange={setNombre}
                    inputRef={inputRef}
                    autoComplete="name"
                    enterKeyHint="next"
                />
                <InputField
                    id="reg-email"
                    icon={Mail}
                    label="Correo electrónico"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={setEmail}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="done"
                    onEnter={canNext ? onNext : undefined}
                />
                <div className="pt-4 md:pt-6">
                    <motion.button
                        whileTap={canNext ? PRESS_TAP : undefined}
                        disabled={!canNext}
                        onClick={onNext}
                        className={`${canNext ? "btn-premium-shine" : ""} w-full inline-flex items-center justify-center gap-3 rounded-full font-display text-sm uppercase tracking-[0.25em] px-8 transition-all ${canNext ? "text-amber-50" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
                        style={canNext ? {
                            background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                            boxShadow:
                                "0 10px 28px rgba(139, 92, 59, 0.30), " +
                                "inset 0 1px 0 rgba(255, 255, 255, 0.28), " +
                                "inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                            minHeight: "56px",
                        } : { minHeight: "56px" }}
                    >
                        Continuar
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </StepWrapper>
    );
}

function InputField({
    id, icon: Icon, label, placeholder, value, onChange, type = "text",
    inputRef, autoComplete, inputMode, enterKeyHint, onEnter,
}: {
    id: string;
    icon: typeof Mail;
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
    autoComplete?: string;
    inputMode?: "text" | "email" | "numeric" | "tel" | "search" | "url" | "decimal" | "none";
    enterKeyHint?: "enter" | "done" | "go" | "next" | "search" | "send";
    onEnter?: () => void;
}) {
    return (
        <div>
            <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.25em] text-stone-600 mb-1.5 ml-1">
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" aria-hidden="true" />
                <input
                    ref={inputRef}
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    enterKeyHint={enterKeyHint}
                    autoCapitalize={type === "email" ? "off" : "words"}
                    spellCheck={type === "email" ? false : true}
                    className="w-full bg-white/70 border border-stone-300 rounded-xl pl-14 pr-5 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700/60 focus:bg-white transition"
                    style={{ minHeight: "56px", fontSize: "16px" }}
                />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepSession
   ══════════════════════════════════════════════════════════════════════ */
function StepSession({
    inventario, value, onChange, onBack,
}: {
    inventario: Inventario | null;
    value: Sesion | null;
    onChange: (v: Sesion) => void;
    onBack: () => void;
}) {
    const opts: { id: Sesion; label: string; time: string; icon: typeof Sun; libres: number | null }[] = [
        { id: "matutino", label: "Matutino", time: "11:30 – 13:00", icon: Sun, libres: inventario?.asientos_matutino_libres ?? null },
        { id: "vespertino", label: "Vespertino", time: "15:00 – 16:30", icon: Moon, libres: inventario?.asientos_vespertino_libres ?? null },
    ];
    return (
        <StepWrapper>
            <StepHeader idx={3} total={6} title="¿Qué sesión?" subtitle="Ambas son la misma conferencia." onBack={onBack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 md:mt-10">
                {opts.map((o, i) => {
                    const Icon = o.icon;
                    const active = value === o.id;
                    const full = o.libres !== null && o.libres <= 0;
                    return (
                        <motion.button
                            key={o.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: EXPO_OUT }}
                            whileTap={PRESS_TAP}
                            onClick={() => onChange(o.id)}
                            className={`group relative overflow-hidden rounded-2xl border ${active ? "border-amber-700/60 bg-amber-50" : "border-stone-300/70 bg-white/60 hover:border-amber-700/40 hover:bg-amber-50/60 active:border-amber-700/50"} p-6 md:p-8 text-left transition-colors duration-200`}
                            style={{ minHeight: "160px", boxShadow: active ? "0 4px 20px rgba(139,92,59,0.12)" : "0 1px 4px rgba(139,92,59,0.05)" }}
                            aria-pressed={active}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Icon className={`w-9 h-9 ${active ? "text-amber-800" : "text-amber-700/80 group-hover:text-amber-800"}`} aria-hidden="true" />
                                {full && (
                                    <span className="text-[10px] uppercase tracking-widest text-red-700 font-mono">Sin asiento · de pie</span>
                                )}
                            </div>
                            <div className={`font-display text-2xl uppercase tracking-tight ${active ? "text-amber-900" : "text-stone-900"}`}>
                                {o.label}
                            </div>
                            <div className="font-mono text-sm text-stone-600 mt-1">{o.time}</div>
                            {o.libres !== null && (
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="h-1 flex-1 rounded-full bg-stone-200 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${full ? "bg-red-700" : o.libres < 50 ? "bg-amber-600" : "bg-amber-700"}`}
                                            style={{ width: `${Math.max(2, (o.libres / 270) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-stone-500 shrink-0">
                                        {o.libres} / 270
                                    </div>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepGender
   ══════════════════════════════════════════════════════════════════════ */
function StepGender({
    value, onChange, onBack,
}: {
    value: Genero | null;
    onChange: (v: Genero) => void;
    onBack: () => void;
}) {
    const opts: { id: Genero; label: string }[] = [
        { id: "hombre", label: "Hombre" },
        { id: "mujer", label: "Mujer" },
        { id: "no_especifica", label: "Prefiero no decir" },
    ];
    return (
        <StepWrapper>
            <StepHeader idx={4} total={6} title="¿Cómo te identificas?" subtitle="Para elegir bien la talla / merch." onBack={onBack} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 md:mt-10">
                {opts.map((o, i) => (
                    <motion.button
                        key={o.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EXPO_OUT }}
                        whileTap={PRESS_TAP}
                        onClick={() => onChange(o.id)}
                        className={`rounded-2xl border ${value === o.id ? "border-amber-700/60 bg-amber-50 text-amber-900" : "border-stone-300/70 bg-white/60 text-stone-900 hover:border-amber-700/40 hover:bg-amber-50/60 active:border-amber-700/50"} px-6 font-display text-base uppercase tracking-wider transition-colors duration-200`}
                        style={{
                            minHeight: "64px",
                            boxShadow: value === o.id ? "0 4px 20px rgba(139,92,59,0.12)" : "0 1px 4px rgba(139,92,59,0.05)",
                        }}
                        aria-pressed={value === o.id}
                    >
                        {o.label}
                    </motion.button>
                ))}
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepAsistencia — filtro previo al merch
   ──────────────────────────────────────────────────────────────────────
   Pregunta de calificación de lead: si no asistirá presencialmente,
   skip directo a submit con merch="ninguno" para no consumir merch
   limitada en gente que no llegará.
   ══════════════════════════════════════════════════════════════════════ */
function StepAsistencia({
    value, totalSteps, onChange, onBack,
}: {
    value: Asistencia | null;
    totalSteps: number;
    onChange: (v: Asistencia) => void;
    onBack: () => void;
}) {
    const opts: { id: Asistencia; label: string; sub: string; icon: typeof CheckCircle2; emphasis: "primary" | "neutral" }[] = [
        {
            id: "si",
            label: "Sí, asistiré seguro",
            sub: "Confirmo mi presencia el 02 de junio",
            icon: CheckCircle2,
            emphasis: "primary",
        },
        {
            id: "no_seguro",
            label: "No estoy seguro",
            sub: "Me registro pero quizás no llegue (sin merch)",
            icon: HelpCircle,
            emphasis: "neutral",
        },
    ];

    return (
        <StepWrapper>
            <StepHeader idx={5} total={totalSteps} title="¿Asistirás presencialmente?" subtitle="Tenemos cupo limitado y poca merch — solo confirmados se la llevan." onBack={onBack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 md:mt-10">
                {opts.map((o, i) => {
                    const Icon = o.icon;
                    const active = value === o.id;
                    const isPrimary = o.emphasis === "primary";
                    return (
                        <motion.button
                            key={o.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: EXPO_OUT }}
                            whileTap={PRESS_TAP}
                            onClick={() => onChange(o.id)}
                            className={`group relative flex flex-col items-start text-left rounded-2xl border p-6 md:p-7 transition-colors duration-200 ${
                                active
                                    ? isPrimary
                                        ? "border-emerald-600/60 bg-emerald-50"
                                        : "border-amber-700/60 bg-amber-50"
                                    : isPrimary
                                        ? "border-stone-300/70 bg-white/60 hover:border-emerald-600/40 hover:bg-emerald-50/40 active:border-emerald-600/50"
                                        : "border-stone-300/70 bg-white/60 hover:border-amber-700/40 hover:bg-amber-50/60 active:border-amber-700/50"
                            }`}
                            style={{
                                minHeight: "140px",
                                boxShadow: active ? "0 4px 20px rgba(139,92,59,0.12)" : "0 1px 4px rgba(139,92,59,0.05)",
                            }}
                            aria-pressed={active}
                        >
                            <Icon
                                className={`w-9 h-9 md:w-10 md:h-10 mb-3 md:mb-4 ${
                                    active
                                        ? (isPrimary ? "text-emerald-700" : "text-amber-800")
                                        : (isPrimary ? "text-emerald-700/80 group-hover:text-emerald-700" : "text-amber-700/80 group-hover:text-amber-800")
                                }`}
                                aria-hidden="true"
                            />
                            <div className={`font-display text-base md:text-lg uppercase tracking-wider leading-tight ${
                                active
                                    ? (isPrimary ? "text-emerald-900" : "text-amber-900")
                                    : "text-stone-900"
                            }`}>
                                {o.label}
                            </div>
                            <div className="mt-1.5 text-xs md:text-sm text-stone-600 leading-relaxed">
                                {o.sub}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepMerch — con imágenes reales de playera y lapicero
   ══════════════════════════════════════════════════════════════════════ */
function StepMerch({
    inventario, merchSel, setMerchSel, talla, setTalla, onSubmit, onBack, totalSteps,
}: {
    inventario: Inventario | null;
    merchSel: MerchSel | null;
    setMerchSel: (v: MerchSel) => void;
    talla: Talla | null;
    setTalla: (v: Talla) => void;
    onSubmit: () => void;
    onBack: () => void;
    totalSteps: number;
}) {
    const playerasOff = (inventario?.playeras_libres ?? 1) <= 0;
    const lapicerosOff = (inventario?.lapiceros_libres ?? 1) <= 0;
    const allOff = playerasOff && lapicerosOff;

    const canSubmit = merchSel !== null && (merchSel !== "playera" || talla !== null);

    return (
        <StepWrapper>
            <StepHeader idx={6} total={totalSteps} title="Llévate algo" subtitle="Cortesía BitacorIA. Hay poco, decide rápido." onBack={onBack} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 md:mt-10">
                <MerchCard
                    icon={Shirt}
                    label="Playera"
                    sub="CH / M / G / XG"
                    imageSrc={assetPath("/images/esia-playera.webp")}
                    libres={inventario?.playeras_libres ?? null}
                    of={10}
                    active={merchSel === "playera"}
                    disabled={playerasOff}
                    onClick={() => setMerchSel("playera")}
                />
                <MerchCard
                    icon={PenTool}
                    label="Lapicero"
                    sub="BitacorIA Edition"
                    imageSrc={assetPath("/images/esia-lapicero.webp")}
                    libres={inventario?.lapiceros_libres ?? null}
                    of={50}
                    active={merchSel === "lapicero"}
                    disabled={lapicerosOff}
                    onClick={() => setMerchSel("lapicero")}
                />
                <MerchCard
                    icon={XIcon}
                    label="Sin merch"
                    sub="Solo vengo a la conferencia"
                    imageSrc={null}
                    libres={null}
                    of={null}
                    active={merchSel === "ninguno"}
                    disabled={false}
                    onClick={() => setMerchSel("ninguno")}
                />
            </div>

            {allOff && (
                <div className="mt-4 text-xs text-amber-900/80 text-center font-mono">
                    Lo sentimos, la merch se agotó. Te esperamos en el evento de todos modos. 💪
                </div>
            )}

            <AnimatePresence>
                {merchSel === "playera" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6"
                    >
                        <div className="font-mono text-[10px] uppercase tracking-widest text-stone-600 text-center mb-3">
                            Tu talla
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                            {(["CH", "M", "G", "XG"] as const).map((t) => (
                                <motion.button
                                    key={t}
                                    whileTap={PRESS_TAP}
                                    onClick={() => setTalla(t)}
                                    className={`rounded-xl border font-display text-base font-bold transition-colors duration-200 ${talla === t ? "border-amber-700/60 bg-amber-50 text-amber-900" : "border-stone-300/70 bg-white/60 text-stone-700 hover:border-amber-700/40 active:border-amber-700/50"}`}
                                    style={{
                                        minHeight: "52px",
                                        boxShadow: talla === t ? "0 4px 20px rgba(139,92,59,0.12)" : "0 1px 4px rgba(139,92,59,0.05)",
                                    }}
                                    aria-pressed={talla === t}
                                    aria-label={`Talla ${t}`}
                                >
                                    {t}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="mt-8 md:mt-10 max-w-xl mx-auto w-full md:static sticky bottom-4 z-20"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                <motion.button
                    whileTap={canSubmit ? PRESS_TAP : undefined}
                    disabled={!canSubmit}
                    onClick={onSubmit}
                    className={`${canSubmit ? "btn-premium-shine" : ""} w-full inline-flex items-center justify-center gap-3 rounded-full font-display text-sm uppercase tracking-[0.25em] px-8 transition-all ${canSubmit ? "text-amber-50" : "bg-stone-200 text-stone-400 cursor-not-allowed"}`}
                    style={canSubmit ? {
                        background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                        boxShadow:
                            "0 12px 32px rgba(139, 92, 59, 0.35), " +
                            "inset 0 1px 0 rgba(255, 255, 255, 0.30), " +
                            "inset 0 -1px 0 rgba(0, 0, 0, 0.14)",
                        minHeight: "60px",
                    } : { minHeight: "60px" }}
                >
                    Confirmar mi lugar
                    <Check className="w-4 h-4" />
                </motion.button>
            </div>
        </StepWrapper>
    );
}

function MerchCard({
    icon: Icon, label, sub, imageSrc, libres, of, active, disabled, onClick,
}: {
    icon: typeof Shirt; label: string; sub: string;
    imageSrc: string | null;
    libres: number | null; of: number | null;
    active: boolean; disabled: boolean; onClick: () => void;
}) {
    const lowStock = libres !== null && of !== null && libres > 0 && libres < of * 0.3;
    const soldOut = libres !== null && libres <= 0;

    return (
        <motion.button
            whileTap={!disabled ? PRESS_TAP : undefined}
            disabled={disabled}
            onClick={onClick}
            className={`group relative flex flex-col items-center rounded-2xl border p-4 md:p-5 text-center transition-colors duration-200 overflow-hidden ${disabled ? "border-stone-200 bg-white/30 opacity-40 cursor-not-allowed" : active ? "border-amber-700/60 bg-amber-50" : "border-stone-300/70 bg-white/60 hover:border-amber-700/40 hover:bg-amber-50/60 active:border-amber-700/50"}`}
            style={{
                minHeight: imageSrc ? "300px" : "200px",
                boxShadow: active ? "0 4px 20px rgba(139,92,59,0.18)" : "0 1px 4px rgba(139,92,59,0.05)",
            }}
            aria-pressed={active}
            aria-disabled={disabled}
        >
            {/* Stock badge en esquina superior derecha — siempre visible */}
            {libres !== null && of !== null && (
                <div
                    className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest font-bold ${
                        soldOut
                            ? "bg-stone-200 text-stone-500"
                            : lowStock
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                >
                    {soldOut ? "AGOTADO" : `${libres}/${of}`}
                </div>
            )}

            {imageSrc ? (
                <div
                    className="relative w-full mb-3 mt-2"
                    style={{ aspectRatio: "1 / 1", maxWidth: "200px" }}
                >
                    <Image
                        src={imageSrc}
                        alt={label}
                        fill
                        sizes="(max-width: 768px) 50vw, 200px"
                        className="object-contain"
                    />
                </div>
            ) : (
                <Icon className={`w-9 h-9 md:w-10 md:h-10 mb-3 mt-4 ${active ? "text-amber-800" : "text-amber-700/80 group-hover:text-amber-800"}`} aria-hidden="true" />
            )}

            <div className={`font-display text-base uppercase tracking-wider ${active ? "text-amber-900" : "text-stone-900"}`}>
                {label}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">{sub}</div>

            {/* Barra de stock visual debajo del nombre */}
            {libres !== null && of !== null && !soldOut && (
                <div className="mt-3 flex flex-col items-center gap-1 w-full">
                    <div className="h-1.5 w-24 rounded-full bg-stone-200 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(libres / of) * 100}%` }}
                            transition={{ duration: 0.8, ease: EXPO_OUT }}
                            className={`h-full ${lowStock ? "bg-red-600" : "bg-amber-600"}`}
                        />
                    </div>
                    <div className={`font-mono text-[10px] uppercase tracking-widest ${lowStock ? "text-red-700 font-bold" : "text-stone-500"}`}>
                        {lowStock ? "¡Quedan pocas!" : "En stock"}
                    </div>
                </div>
            )}
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Submitting
   ══════════════════════════════════════════════════════════════════════ */
function Submitting() {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center justify-center text-center py-32">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-stone-300 border-t-amber-700 mb-8"
                />
                <div className="font-display text-2xl uppercase tracking-wider text-stone-900">
                    Reservando tu lugar
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-stone-500 mt-3">
                    Asignando asiento atómicamente…
                </div>
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Confirmed — slot machine seat reveal
   ══════════════════════════════════════════════════════════════════════ */
function Confirmed({ result, nombre }: { result: Result; nombre: string }) {
    const sesionLabel = result.sesion === "matutino" ? "Matutino · 11:30" : "Vespertino · 15:00";

    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center py-8 md:py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: EXPO_OUT }}
                    className="lq-glass-chip-success mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2"
                >
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-800">
                        Confirmado
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-stone-900"
                >
                    Te esperamos,
                    <br />
                    <span className="text-gradient-bronze">{nombre.split(" ")[0] || nombre}.</span>
                </motion.h1>

                <div className="mt-12">
                    {result.modalidad === "asiento" && result.numero_asiento !== null ? (
                        <>
                            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-800/70 mb-4">
                                Tu asiento
                            </div>
                            <SeatNumberReveal num={result.numero_asiento} />
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4, duration: 0.5, ease: EXPO_OUT }}
                                className="mt-4 font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-stone-500"
                            >
                                Asiento <span className="text-amber-800 font-bold">{result.numero_asiento}</span> de <span className="text-stone-700 font-bold">270</span> totales
                            </motion.div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-amber-800"
                        >
                            Asistencia de pie
                            <div className="mt-3 text-sm text-stone-600 font-sans normal-case font-normal tracking-normal">
                                Esta sesión se llenó. Llega y entra al fondo del auditorio.
                            </div>
                        </motion.div>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl w-full"
                >
                    <DetailCard label="Sesión" value={sesionLabel} icon={result.sesion === "matutino" ? Sun : Moon} />
                    <DetailCard label="Fecha" value="02 Jun 2026" icon={Calendar} />
                    <DetailCard
                        label="Merch"
                        value={
                            result.merch === "playera" ? `Playera (${result.talla})` :
                            result.merch === "lapicero" ? "Lapicero" :
                            "—"
                        }
                        icon={result.merch === "playera" ? Shirt : result.merch === "lapicero" ? PenTool : XIcon}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    className="mt-12 max-w-md text-sm text-stone-600 leading-relaxed"
                >
                    Te mandamos un correo de confirmación. Muéstralo en la entrada el
                    día del evento. Si eres del IPN, trae tu tarjetón.
                </motion.div>

                {/* ── Secondary CTA: explorar la plataforma ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.6, ease: EXPO_OUT }}
                    className="mt-10 md:mt-14 w-full max-w-md flex flex-col items-center"
                >
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">
                        Mientras esperas al evento
                    </div>
                    <LandingLink style="secondary" />
                </motion.div>
            </div>
        </StepWrapper>
    );
}

function SeatNumberReveal({ num }: { num: number }) {
    const digits = String(num).padStart(3, "0").split("");
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            <span className="font-display text-7xl md:text-9xl font-extrabold text-amber-700/40 leading-none">#</span>
            {digits.map((d, i) => (
                <DigitSlot key={i} target={parseInt(d, 10)} delay={i * 0.25} />
            ))}
        </div>
    );
}

function DigitSlot({ target, delay }: { target: number; delay: number }) {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
        let cancelled = false;
        const startAt = performance.now() + delay * 1000;
        const duration = 1200 + delay * 200;
        const tick = () => {
            if (cancelled) return;
            const now = performance.now();
            if (now < startAt) { requestAnimationFrame(tick); return; }
            const elapsed = now - startAt;
            if (elapsed >= duration) { setCurrent(target); return; }
            const t = elapsed / duration;
            const speed = (1 - t) * 60 + 8;
            setCurrent(Math.floor(Math.random() * 10));
            setTimeout(() => requestAnimationFrame(tick), 1000 / speed);
        };
        requestAnimationFrame(tick);
        return () => { cancelled = true; };
    }, [target, delay]);
    return (
        <span
            className="font-display text-7xl md:text-9xl font-extrabold leading-none tabular-nums"
            style={{
                background: "linear-gradient(180deg, #c39767 0%, #8b5c3b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 6px 24px rgba(195, 151, 103, 0.35)",
            }}
        >
            {current}
        </span>
    );
}

function DetailCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sun }) {
    return (
        <div className="rounded-xl border border-stone-300/70 bg-white/60 backdrop-blur-sm px-4 py-3 text-left">
            <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">{label}</span>
                <Icon className="w-3.5 h-3.5 text-amber-700/80" />
            </div>
            <div className="text-sm text-stone-900">{value}</div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Tentativo — no asistirá seguro, no se asigna asiento, no toca DB
   ══════════════════════════════════════════════════════════════════════ */
function Tentativo({ onReconsider }: { onReconsider: () => void }) {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: EXPO_OUT }}
                    className="lq-glass-chip mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2"
                >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-900">
                        Sin compromiso
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: EXPO_OUT }}
                    className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-stone-900 leading-tight"
                >
                    Sin problema.
                    <br />
                    <span className="text-gradient-bronze">Te entendemos.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: EXPO_OUT }}
                    className="mt-6 md:mt-8 max-w-lg text-sm md:text-base text-stone-700 leading-relaxed"
                >
                    No apartamos asiento ni merch para no quitarle el lugar a alguien que sí va a ir.
                    <br /><br />
                    <span className="text-stone-600">
                        Si después decides asistir, vuelve a este link y elige <strong className="text-amber-900">&ldquo;Sí, asistiré seguro&rdquo;</strong> en el paso 5 — todavía habrá asientos disponibles.
                    </span>
                </motion.p>

                {/* CTA — reconsiderar */}
                <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.7, ease: EXPO_OUT }}
                    whileTap={PRESS_TAP}
                    onClick={onReconsider}
                    className="btn-premium-shine mt-10 md:mt-12 w-full max-w-md inline-flex items-center justify-center gap-3 rounded-full px-8 font-display text-sm uppercase tracking-[0.25em] text-amber-50 transition"
                    style={{
                        background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                        boxShadow:
                            "0 10px 28px rgba(139, 92, 59, 0.30), " +
                            "inset 0 1px 0 rgba(255, 255, 255, 0.25), " +
                            "inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                        minHeight: "56px",
                    }}
                >
                    Sí asistiré, apártame lugar
                    <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Secondary CTA — landing */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.9, ease: EXPO_OUT }}
                    className="mt-6 w-full max-w-md"
                >
                    <LandingLink style="secondary" />
                </motion.div>
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Error
   ══════════════════════════════════════════════════════════════════════ */
function ErrorScreen({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center py-24">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-5 py-2">
                    <XIcon className="w-3.5 h-3.5 text-red-700" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-red-700">Error</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-stone-900 max-w-md">
                    {msg}
                </h1>
                <motion.button
                    whileTap={PRESS_TAP}
                    onClick={onRetry}
                    className="btn-premium-shine mt-10 inline-flex items-center justify-center gap-3 rounded-full px-8 font-display text-sm uppercase tracking-[0.25em] text-amber-50 transition"
                    style={{
                        background: "linear-gradient(180deg, #c39767 0%, #b07a4d 55%, #8b5c3b 100%)",
                        boxShadow:
                            "0 10px 28px rgba(139, 92, 59, 0.30), " +
                            "inset 0 1px 0 rgba(255, 255, 255, 0.25), " +
                            "inset 0 -1px 0 rgba(0, 0, 0, 0.12)",
                        minHeight: "52px",
                    }}
                >
                    Volver al inicio
                </motion.button>
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   StepHeader
   ══════════════════════════════════════════════════════════════════════ */
function StepHeader({ idx, total, title, subtitle, onBack }: {
    idx: number; total: number; title: string; subtitle?: string; onBack?: () => void;
}) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
                {onBack && (
                    <motion.button
                        whileTap={PRESS_TAP}
                        onClick={onBack}
                        className="text-stone-600 hover:text-amber-800 active:text-amber-900 transition font-mono text-[10px] uppercase tracking-widest inline-flex items-center justify-center"
                        style={{ minWidth: "44px", minHeight: "44px" }}
                        aria-label="Volver al paso anterior"
                    >
                        ← atrás
                    </motion.button>
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-800/70">
                    Paso {idx} de {total}
                </span>
            </div>
            <h1 className="font-display text-2xl md:text-5xl font-extrabold uppercase tracking-tight text-stone-900 leading-tight">
                {title}
            </h1>
            {subtitle && (
                <p className="mt-2 md:mt-3 text-sm md:text-base text-stone-600">{subtitle}</p>
            )}
        </div>
    );
}
