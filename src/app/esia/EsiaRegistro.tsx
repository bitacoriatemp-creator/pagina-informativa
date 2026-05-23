"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap, Users, Briefcase, ArrowRight, Mail, User,
    Sun, Moon, Shirt, PenTool, X as XIcon, Check, MapPin, Calendar,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   EsiaRegistro — Funnel de registro para Conferencia ESIA Zacatenco
   ──────────────────────────────────────────────────────────────────────
   Steps:  intro → type → identity → session → gender → merch
           → submitting → confirmed
   ══════════════════════════════════════════════════════════════════════ */

const ENDPOINT = "https://epjfqcndxoyrtrmasuvt.supabase.co/functions/v1/register-conferencia";

type Step = "intro" | "type" | "identity" | "session" | "gender" | "merch" | "submitting" | "confirmed" | "error";
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
    const [merchSel, setMerchSel] = useState<MerchSel | null>(null);
    const [talla, setTalla] = useState<Talla | null>(null);
    const [inventario, setInventario] = useState<Inventario | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    /* ── Fetch inventario en vivo (al cargar y al volver a 'session'/'merch') ── */
    useEffect(() => {
        if (step !== "intro" && step !== "session" && step !== "merch") return;
        fetch(`${ENDPOINT}/inventario`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d && d.ok !== false) setInventario(d as Inventario);
            })
            .catch(() => { /* silencio */ });
    }, [step]);

    /* ── Submit ── */
    const submit = async () => {
        setStep("submitting");
        try {
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo,
                    nombre: nombre.trim(),
                    email: email.trim().toLowerCase(),
                    sesion,
                    genero,
                    merch: merchSel ?? "ninguno",
                    talla: merchSel === "playera" ? talla : null,
                }),
            });
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
            setStep("confirmed");
        } catch (e) {
            setErrorMsg("No pudimos completar tu registro. Revisa tu conexión.");
            setStep("error");
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#08080a] text-zinc-100">
            {/* ── Background layers ── */}
            <BackgroundDeco />

            {/* ── Header (sticky, minimal) ── */}
            <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-500/80 leading-none">
                    BITACORIA
                </div>
                <div className="hidden md:flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>02 · 06 · 2026</span>
                    <span className="opacity-30">/</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ESIA · Zacatenco</span>
                </div>
            </header>

            {/* ── Funnel ── */}
            <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-8 md:py-16">
                <AnimatePresence mode="wait">
                    {step === "intro"      && <Intro key="intro" onStart={() => setStep("type")} inventario={inventario} />}
                    {step === "type"       && <StepType key="type" value={tipo} onChange={(v) => { setTipo(v); setStep("identity"); }} />}
                    {step === "identity"   && <StepIdentity key="identity" nombre={nombre} email={email} setNombre={setNombre} setEmail={setEmail} onNext={() => setStep("session")} onBack={() => setStep("type")} />}
                    {step === "session"    && <StepSession key="session" inventario={inventario} value={sesion} onChange={(v) => { setSesion(v); setStep("gender"); }} onBack={() => setStep("identity")} />}
                    {step === "gender"     && <StepGender key="gender" value={genero} onChange={(v) => { setGenero(v); setStep("merch"); }} onBack={() => setStep("session")} />}
                    {step === "merch"      && <StepMerch key="merch" inventario={inventario} merchSel={merchSel} setMerchSel={setMerchSel} talla={talla} setTalla={setTalla} onSubmit={submit} onBack={() => setStep("gender")} />}
                    {step === "submitting" && <Submitting key="submitting" />}
                    {step === "confirmed"  && result && <Confirmed key="confirmed" result={result} nombre={nombre} />}
                    {step === "error"      && <ErrorScreen key="error" msg={errorMsg} onRetry={() => setStep("intro")} />}
                </AnimatePresence>
            </main>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Background — particles + gradient orbs
   ══════════════════════════════════════════════════════════════════════ */
function BackgroundDeco() {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Grid sutil */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: [
                        "repeating-linear-gradient(to right, rgba(195,151,103,0.045) 0 1px, transparent 1px 80px)",
                        "repeating-linear-gradient(to bottom, rgba(195,151,103,0.045) 0 1px, transparent 1px 80px)",
                    ].join(", "),
                }}
            />
            {/* Orbe café — top left */}
            <motion.div
                className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(195,151,103,0.18), transparent 70%)",
                    filter: "blur(40px)",
                }}
                animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Orbe — bottom right */}
            <motion.div
                className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(212,168,120,0.12), transparent 70%)",
                    filter: "blur(50px)",
                }}
                animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
                transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Partículas café (12) */}
            {CAFE_PARTICLES.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: p.x, top: p.y,
                        width: p.size, height: p.size,
                        background: p.color,
                        boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
                        opacity: 0.6,
                    }}
                    animate={{ x: [0, p.dx, 0], y: [0, p.dy, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(8,8,10,0.6) 100%)",
                }}
            />
        </div>
    );
}

const CAFE_PARTICLES = [
    { x: "10%", y: "18%", size: 2.2, color: "#C39767", dur: 22, dx: 30, dy: -20 },
    { x: "72%", y: "14%", size: 1.8, color: "#A87B4C", dur: 28, dx: -25, dy: 15 },
    { x: "88%", y: "70%", size: 2,   color: "#D4A878", dur: 25, dx: -20, dy: -25 },
    { x: "20%", y: "78%", size: 1.5, color: "#8B5C3B", dur: 30, dx: 35, dy: -15 },
    { x: "48%", y: "8%",  size: 1.8, color: "#C39767", dur: 26, dx: -15, dy: 30 },
    { x: "62%", y: "88%", size: 1.5, color: "#A87B4C", dur: 24, dx: 20, dy: -30 },
    { x: "32%", y: "42%", size: 1.6, color: "#D4A878", dur: 32, dx: -18, dy: 22 },
    { x: "82%", y: "38%", size: 1.4, color: "#C39767", dur: 27, dx: 15, dy: -18 },
    { x: "6%",  y: "55%", size: 1.7, color: "#A87B4C", dur: 29, dx: 22, dy: 18 },
    { x: "94%", y: "26%", size: 1.5, color: "#8B5C3B", dur: 31, dx: -28, dy: 20 },
    { x: "52%", y: "65%", size: 1.6, color: "#D4A878", dur: 23, dx: 18, dy: -22 },
    { x: "16%", y: "92%", size: 1.4, color: "#C39767", dur: 33, dx: 24, dy: -16 },
] as const;

/* ══════════════════════════════════════════════════════════════════════
   Step components
   ══════════════════════════════════════════════════════════════════════ */
const stepVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.4, 0, 0.6, 1] as const } },
};

function StepWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
        >
            {children}
        </motion.div>
    );
}

/* ── Intro ─────────────────────────────────────────────────────────────── */
function Intro({ onStart, inventario }: { onStart: () => void; inventario: Inventario | null }) {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center pt-8 md:pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="mb-8 inline-flex items-center gap-3 rounded-full border border-amber-900/40 bg-amber-950/20 px-5 py-2"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300/80">
                        Conferencia Exclusiva
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-[0.95] text-white"
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
                    transition={{ duration: 1, delay: 1, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="mt-8 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed"
                >
                    Conferencia BitacorIA en la ESIA Zacatenco.
                    <br />
                    Inteligencia de campo · IA generativa · auditoría automatizada.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4, ease: [0.25, 0.4, 0.25, 1] as const }}
                    onClick={onStart}
                    className="group mt-12 inline-flex items-center gap-3 rounded-full border border-amber-700/40 bg-gradient-to-b from-amber-900/30 to-amber-950/30 px-10 py-5 font-display text-sm uppercase tracking-[0.25em] text-amber-200 backdrop-blur-md transition-all hover:border-amber-600/60 hover:from-amber-800/40 hover:to-amber-900/40 hover:shadow-[0_0_30px_rgba(195,151,103,0.3)]"
                >
                    Reserva tu asiento
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                {/* Inventario en vivo */}
                {inventario && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] uppercase tracking-widest"
                    >
                        <Stat label="Matutino · libres" value={inventario.asientos_matutino_libres} of={270} />
                        <Stat label="Vespertino · libres" value={inventario.asientos_vespertino_libres} of={270} />
                        <Stat label="Playeras" value={inventario.playeras_libres} of={10} />
                        <Stat label="Lapiceros" value={inventario.lapiceros_libres} of={50} />
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 2.5 }}
                    className="mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600"
                >
                    Tarda menos de 60 segundos
                </motion.div>
            </div>
        </StepWrapper>
    );
}

function Stat({ label, value, of }: { label: string; value: number; of: number }) {
    const pct = of > 0 ? (value / of) * 100 : 0;
    const lowStock = pct < 25;
    return (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2.5">
            <div className="text-zinc-600 mb-1">{label}</div>
            <div className={`font-mono text-lg font-bold ${lowStock ? "text-red-300" : "text-amber-300"}`}>
                {value} <span className="text-zinc-700 text-xs font-normal">/ {of}</span>
            </div>
        </div>
    );
}

/* ── Step Type ─────────────────────────────────────────────────────────── */
function StepType({ value, onChange }: { value: Tipo | null; onChange: (v: Tipo) => void }) {
    const opts: { id: Tipo; label: string; icon: typeof GraduationCap; desc: string }[] = [
        { id: "alumno", label: "Alumno", icon: GraduationCap, desc: "ESIA / IPN / Otra escuela" },
        { id: "profesor", label: "Profesor", icon: Briefcase, desc: "Docente / Investigador" },
        { id: "externo", label: "Externo", icon: Users, desc: "Industria / Profesional" },
    ];
    return (
        <StepWrapper>
            <StepHeader idx={1} total={5} title="¿Quién eres?" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                {opts.map((o, i) => {
                    const Icon = o.icon;
                    const active = value === o.id;
                    return (
                        <motion.button
                            key={o.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            onClick={() => onChange(o.id)}
                            className={`group flex flex-col items-center text-center rounded-2xl border ${active ? "border-amber-500/60 bg-amber-950/30" : "border-zinc-800 bg-zinc-950/40 hover:border-amber-700/40 hover:bg-zinc-900/40"} p-6 transition-all duration-300`}
                        >
                            <Icon className={`w-10 h-10 mb-4 ${active ? "text-amber-400" : "text-amber-500/70 group-hover:text-amber-400"}`} />
                            <div className={`font-display text-lg uppercase tracking-wider ${active ? "text-amber-200" : "text-white"}`}>
                                {o.label}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">{o.desc}</div>
                        </motion.button>
                    );
                })}
            </div>
        </StepWrapper>
    );
}

/* ── Step Identity (nombre + email) ────────────────────────────────────── */
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
            <StepHeader idx={2} total={5} title="Tus datos" subtitle="Solo lo esencial." onBack={onBack} />
            <div className="mt-10 space-y-4 max-w-xl mx-auto">
                <InputField
                    icon={User}
                    placeholder="Nombre completo"
                    value={nombre}
                    onChange={setNombre}
                    inputRef={inputRef}
                />
                <InputField
                    icon={Mail}
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={setEmail}
                    type="email"
                />
                <div className="pt-6">
                    <button
                        disabled={!canNext}
                        onClick={onNext}
                        className={`w-full inline-flex items-center justify-center gap-3 rounded-full border px-8 py-4 font-display text-sm uppercase tracking-[0.25em] transition-all ${canNext ? "border-amber-700/60 bg-gradient-to-b from-amber-900/40 to-amber-950/40 text-amber-200 hover:border-amber-600/80 hover:shadow-[0_0_30px_rgba(195,151,103,0.3)]" : "border-zinc-800 bg-zinc-950/40 text-zinc-700 cursor-not-allowed"}`}
                    >
                        Continuar
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </StepWrapper>
    );
}

function InputField({
    icon: Icon, placeholder, value, onChange, type = "text", inputRef,
}: {
    icon: typeof Mail;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}) {
    return (
        <div className="relative">
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            <input
                ref={inputRef}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-14 pr-5 py-4 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-600/60 focus:bg-zinc-950/80 transition"
            />
        </div>
    );
}

/* ── Step Session ──────────────────────────────────────────────────────── */
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
            <StepHeader idx={3} total={5} title="¿Qué sesión?" subtitle="Ambas son la misma conferencia." onBack={onBack} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                {opts.map((o, i) => {
                    const Icon = o.icon;
                    const active = value === o.id;
                    const full = o.libres !== null && o.libres <= 0;
                    return (
                        <motion.button
                            key={o.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.15 }}
                            onClick={() => onChange(o.id)}
                            className={`group relative overflow-hidden rounded-2xl border ${active ? "border-amber-500/60 bg-amber-950/30" : "border-zinc-800 bg-zinc-950/40 hover:border-amber-700/40 hover:bg-zinc-900/40"} p-8 text-left transition-all`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Icon className={`w-9 h-9 ${active ? "text-amber-400" : "text-amber-500/70 group-hover:text-amber-400"}`} />
                                {full && (
                                    <span className="text-[10px] uppercase tracking-widest text-red-400 font-mono">Sin asiento · de pie</span>
                                )}
                            </div>
                            <div className={`font-display text-2xl uppercase tracking-tight ${active ? "text-amber-200" : "text-white"}`}>
                                {o.label}
                            </div>
                            <div className="font-mono text-sm text-zinc-400 mt-1">{o.time}</div>
                            {o.libres !== null && (
                                <div className="mt-6 flex items-center gap-3">
                                    <div className="h-1 flex-1 rounded-full bg-zinc-900 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${full ? "bg-red-700" : o.libres < 50 ? "bg-amber-500" : "bg-amber-700"}`}
                                            style={{ width: `${Math.max(2, (o.libres / 270) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs font-mono text-zinc-500 shrink-0">
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

/* ── Step Gender ───────────────────────────────────────────────────────── */
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
            <StepHeader idx={4} total={5} title="¿Cómo te identificas?" subtitle="Para elegir bien la talla / merch." onBack={onBack} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                {opts.map((o, i) => (
                    <motion.button
                        key={o.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        onClick={() => onChange(o.id)}
                        className={`rounded-2xl border ${value === o.id ? "border-amber-500/60 bg-amber-950/30 text-amber-200" : "border-zinc-800 bg-zinc-950/40 text-white hover:border-amber-700/40 hover:bg-zinc-900/40"} px-6 py-5 font-display text-base uppercase tracking-wider transition`}
                    >
                        {o.label}
                    </motion.button>
                ))}
            </div>
        </StepWrapper>
    );
}

/* ── Step Merch ────────────────────────────────────────────────────────── */
function StepMerch({
    inventario, merchSel, setMerchSel, talla, setTalla, onSubmit, onBack,
}: {
    inventario: Inventario | null;
    merchSel: MerchSel | null;
    setMerchSel: (v: MerchSel) => void;
    talla: Talla | null;
    setTalla: (v: Talla) => void;
    onSubmit: () => void;
    onBack: () => void;
}) {
    const playerasOff = (inventario?.playeras_libres ?? 1) <= 0;
    const lapicerosOff = (inventario?.lapiceros_libres ?? 1) <= 0;
    const allOff = playerasOff && lapicerosOff;

    const canSubmit = merchSel !== null && (merchSel !== "playera" || talla !== null);

    return (
        <StepWrapper>
            <StepHeader idx={5} total={5} title="Llévate algo" subtitle="Cortesía BitacorIA. Hay poco, decide rápido." onBack={onBack} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                <MerchCard
                    icon={Shirt}
                    label="Playera"
                    sub="CH / M / G / XG"
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
                    libres={null}
                    of={null}
                    active={merchSel === "ninguno"}
                    disabled={false}
                    onClick={() => setMerchSel("ninguno")}
                />
            </div>

            {allOff && (
                <div className="mt-4 text-xs text-amber-300/70 text-center font-mono">
                    Lo sentimos, la merch se agotó. Te esperamos en el evento de todos modos. 💪
                </div>
            )}

            {/* Talla selector (solo si eligió playera) */}
            <AnimatePresence>
                {merchSel === "playera" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6"
                    >
                        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 text-center mb-3">
                            Tu talla
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                            {(["CH", "M", "G", "XG"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTalla(t)}
                                    className={`rounded-xl border py-3 font-display text-base font-bold transition ${talla === t ? "border-amber-500/60 bg-amber-950/30 text-amber-200" : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-amber-700/40"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-10 max-w-xl mx-auto">
                <button
                    disabled={!canSubmit}
                    onClick={onSubmit}
                    className={`w-full inline-flex items-center justify-center gap-3 rounded-full border px-8 py-4 font-display text-sm uppercase tracking-[0.25em] transition-all ${canSubmit ? "border-amber-700/60 bg-gradient-to-b from-amber-900/40 to-amber-950/40 text-amber-200 hover:border-amber-600/80 hover:shadow-[0_0_40px_rgba(195,151,103,0.4)]" : "border-zinc-800 bg-zinc-950/40 text-zinc-700 cursor-not-allowed"}`}
                >
                    Confirmar mi lugar
                    <Check className="w-4 h-4" />
                </button>
            </div>
        </StepWrapper>
    );
}

function MerchCard({
    icon: Icon, label, sub, libres, of, active, disabled, onClick,
}: {
    icon: typeof Shirt; label: string; sub: string;
    libres: number | null; of: number | null;
    active: boolean; disabled: boolean; onClick: () => void;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`group relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all ${disabled ? "border-zinc-900 bg-zinc-950/30 opacity-40 cursor-not-allowed" : active ? "border-amber-500/60 bg-amber-950/30" : "border-zinc-800 bg-zinc-950/40 hover:border-amber-700/40 hover:bg-zinc-900/40"}`}
        >
            <Icon className={`w-9 h-9 mb-3 ${active ? "text-amber-400" : "text-amber-500/70 group-hover:text-amber-400"}`} />
            <div className={`font-display text-base uppercase tracking-wider ${active ? "text-amber-200" : "text-white"}`}>{label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
            {libres !== null && of !== null && (
                <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    {libres > 0 ? `${libres} / ${of}` : "AGOTADO"}
                </div>
            )}
        </button>
    );
}

/* ── Submitting ────────────────────────────────────────────────────────── */
function Submitting() {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center justify-center text-center py-32">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-amber-400 mb-8"
                />
                <div className="font-display text-2xl uppercase tracking-wider text-white">
                    Reservando tu lugar
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 mt-3">
                    Asignando asiento atómicamente…
                </div>
            </div>
        </StepWrapper>
    );
}

/* ── Confirmed (slot machine seat reveal) ──────────────────────────────── */
function Confirmed({ result, nombre }: { result: Result; nombre: string }) {
    const sesionLabel = result.sesion === "matutino" ? "Matutino · 11:30" : "Vespertino · 15:00";

    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center py-8 md:py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-5 py-2"
                >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300">
                        Confirmado
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
                >
                    Te esperamos,
                    <br />
                    <span className="text-gradient-bronze">{nombre.split(" ")[0] || nombre}.</span>
                </motion.h1>

                {/* Seat reveal */}
                <div className="mt-12">
                    {result.modalidad === "asiento" && result.numero_asiento !== null ? (
                        <>
                            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-amber-500/70 mb-4">
                                Tu asiento
                            </div>
                            <SeatNumberReveal num={result.numero_asiento} />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-amber-300"
                        >
                            Asistencia de pie
                            <div className="mt-3 text-sm text-zinc-400 font-sans normal-case font-normal tracking-normal">
                                Esta sesión se llenó. Llega y entra al fondo del auditorio.
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Detalles */}
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
                    className="mt-12 max-w-md text-sm text-zinc-400 leading-relaxed"
                >
                    Te mandamos un correo de confirmación. Muéstralo en la entrada el
                    día del evento. Si eres del IPN, trae tu tarjetón.
                </motion.div>
            </div>
        </StepWrapper>
    );
}

function SeatNumberReveal({ num }: { num: number }) {
    const digits = String(num).padStart(3, "0").split("");
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            <span className="font-display text-7xl md:text-9xl font-extrabold text-amber-400/40 leading-none">#</span>
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
            if (now < startAt) {
                requestAnimationFrame(tick);
                return;
            }
            const elapsed = now - startAt;
            if (elapsed >= duration) {
                setCurrent(target);
                return;
            }
            // Easeout: roll fast then slow
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
                background: "linear-gradient(180deg, #f4d4a0 0%, #c39767 60%, #8b5c3b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 40px rgba(195, 151, 103, 0.4)",
            }}
        >
            {current}
        </span>
    );
}

function DetailCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Sun }) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-left">
            <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{label}</span>
                <Icon className="w-3.5 h-3.5 text-amber-500/70" />
            </div>
            <div className="text-sm text-zinc-200">{value}</div>
        </div>
    );
}

/* ── Error ─────────────────────────────────────────────────────────────── */
function ErrorScreen({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return (
        <StepWrapper>
            <div className="flex flex-col items-center text-center py-24">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/30 px-5 py-2">
                    <XIcon className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-red-300">Error</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white max-w-md">
                    {msg}
                </h1>
                <button
                    onClick={onRetry}
                    className="mt-10 inline-flex items-center gap-3 rounded-full border border-amber-700/60 bg-amber-950/30 px-8 py-3 font-display text-sm uppercase tracking-[0.25em] text-amber-200 hover:border-amber-600/80 transition"
                >
                    Volver al inicio
                </button>
            </div>
        </StepWrapper>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Step header (shared)
   ══════════════════════════════════════════════════════════════════════ */
function StepHeader({ idx, total, title, subtitle, onBack }: {
    idx: number; total: number; title: string; subtitle?: string; onBack?: () => void;
}) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="text-zinc-600 hover:text-amber-400 transition font-mono text-[10px] uppercase tracking-widest"
                    >
                        ← atrás
                    </button>
                )}
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-500/70">
                    Paso {idx} de {total}
                </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                {title}
            </h1>
            {subtitle && (
                <p className="mt-3 text-sm md:text-base text-zinc-500">{subtitle}</p>
            )}
        </div>
    );
}
