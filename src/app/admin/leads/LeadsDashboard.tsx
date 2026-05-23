"use client";

import { useMemo, useState } from "react";
import { Search, Mail, Users, Flame, Eye, Building2, GraduationCap, Briefcase, Code2, HardHat } from "lucide-react";
import type { Participante } from "@/lib/supabaseAdmin";

/* ══════════════════════════════════════════════════════════════════════
   LeadsDashboard — UI cliente del panel admin /admin/leads
   ──────────────────────────────────────────────────────────────────────
   Métricas:
     · Total registrados
     · Hot leads (Listo + Muy probable) / Warm / Cold
     · Distribución % por perfil profesional
     · Distribución % por intención de compra
     · Promedio de obras activas
     · Tabla buscable con todos los emails + filtros
   ════════════════════════════════════════════════════════════════════ */

const INTERES_ORDER = [
    "Listo para comprar",
    "Muy probable",
    "Probable",
    "Curioso",
    "Investigando",
] as const;

const INTERES_META: Record<string, { label: string; color: string; emoji: string; bar: string }> = {
    "Listo para comprar": { label: "Listo para comprar", color: "text-red-300",    emoji: "🔥", bar: "from-red-500/80 to-red-700/80" },
    "Muy probable":       { label: "Muy probable",       color: "text-orange-300", emoji: "⚡", bar: "from-orange-500/80 to-amber-600/80" },
    "Probable":           { label: "Probable",           color: "text-amber-300",  emoji: "✨", bar: "from-amber-400/80 to-yellow-600/80" },
    "Curioso":            { label: "Curioso",            color: "text-zinc-300",   emoji: "👀", bar: "from-zinc-400/70 to-zinc-600/70" },
    "Investigando":       { label: "Investigando",       color: "text-zinc-400",   emoji: "🔍", bar: "from-zinc-500/70 to-zinc-700/70" },
};

const PERFIL_ICON: Record<string, typeof Building2> = {
    "Constructora PyME":       Building2,
    "Residente independiente": HardHat,
    "Despacho técnico":        Briefcase,
    "Desarrollador":           Code2,
    "Estudiante/academia":     GraduationCap,
    "Estudiante / Academia":   GraduationCap,
};

function pct(n: number, total: number): string {
    if (total === 0) return "0%";
    return `${((n / total) * 100).toFixed(1)}%`;
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return d.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

export default function LeadsDashboard({ leads }: { leads: Participante[] }) {
    const [query, setQuery] = useState("");
    const [filterInteres, setFilterInteres] = useState<string | null>(null);
    const [filterPerfil, setFilterPerfil] = useState<string | null>(null);

    /* ── Agregaciones ── */
    const stats = useMemo(() => {
        const total = leads.length;
        const byPerfil: Record<string, number> = {};
        const byInteres: Record<string, number> = {};
        let sumObras = 0;
        let countObras = 0;
        let hot = 0;
        let warm = 0;
        let cold = 0;

        for (const l of leads) {
            const p = l.perfil || "(sin perfil)";
            byPerfil[p] = (byPerfil[p] || 0) + 1;

            const i = l.interes_compra || "(sin intención)";
            byInteres[i] = (byInteres[i] || 0) + 1;

            if (l.obras_activas != null) {
                sumObras += l.obras_activas;
                countObras += 1;
            }

            if (l.interes_compra === "Listo para comprar" || l.interes_compra === "Muy probable") hot += 1;
            else if (l.interes_compra === "Probable") warm += 1;
            else if (l.interes_compra === "Curioso" || l.interes_compra === "Investigando") cold += 1;
        }

        const avgObras = countObras > 0 ? sumObras / countObras : 0;

        return { total, byPerfil, byInteres, sumObras, countObras, avgObras, hot, warm, cold };
    }, [leads]);

    /* ── Filtrado de tabla ── */
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return leads.filter((l) => {
            if (filterInteres && l.interes_compra !== filterInteres) return false;
            if (filterPerfil && l.perfil !== filterPerfil) return false;
            if (!q) return true;
            return (
                (l.email || "").toLowerCase().includes(q) ||
                (l.nombre || "").toLowerCase().includes(q) ||
                (l.perfil || "").toLowerCase().includes(q)
            );
        });
    }, [leads, query, filterInteres, filterPerfil]);

    const perfilEntries = Object.entries(stats.byPerfil).sort((a, b) => b[1] - a[1]);
    const interesEntries = INTERES_ORDER
        .map((k) => [k, stats.byInteres[k] || 0] as [string, number])
        .concat(
            Object.entries(stats.byInteres).filter(([k]) => !INTERES_ORDER.includes(k as (typeof INTERES_ORDER)[number]))
        );

    return (
        <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
            {/* ── Header ── */}
            <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-500/70 mb-2">
                        Admin · BitacorIA
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white font-extrabold">
                        Dashboard de Leads
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        Datos en vivo de la tabla <code className="text-amber-400">participantes</code>.
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-3">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Última actualización</div>
                    <div className="text-sm text-zinc-300 mt-0.5 font-mono">
                        {new Date().toLocaleString("es-MX")}
                    </div>
                </div>
            </header>

            {/* ── KPI cards ── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                <KpiCard
                    icon={Users}
                    label="Total registrados"
                    value={stats.total.toLocaleString("es-MX")}
                    accent="amber"
                />
                <KpiCard
                    icon={Flame}
                    label="Hot leads"
                    value={stats.hot.toLocaleString("es-MX")}
                    sub={`${pct(stats.hot, stats.total)} del total`}
                    accent="red"
                />
                <KpiCard
                    icon={Eye}
                    label="Tibios / curiosos"
                    value={(stats.warm + stats.cold).toLocaleString("es-MX")}
                    sub={`${pct(stats.warm + stats.cold, stats.total)} del total`}
                    accent="zinc"
                />
                <KpiCard
                    icon={HardHat}
                    label="Promedio obras activas"
                    value={stats.avgObras > 0 ? stats.avgObras.toFixed(1) : "—"}
                    sub={`${stats.countObras} respondieron`}
                    accent="bronze"
                />
            </section>

            {/* ── 2 columnas: Perfil + Intención ── */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
                {/* Perfil profesional */}
                <Panel title="Perfil profesional" hint="Distribución % por tipo">
                    <ul className="space-y-3">
                        {perfilEntries.map(([perfil, count]) => {
                            const Icon = PERFIL_ICON[perfil] || Briefcase;
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            const active = filterPerfil === perfil;
                            return (
                                <li key={perfil}>
                                    <button
                                        onClick={() => setFilterPerfil(active ? null : perfil)}
                                        className={`w-full text-left group transition ${active ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-amber-400/80"}`} />
                                                <span className={`text-sm truncate ${active ? "text-amber-200" : "text-zinc-200"}`}>
                                                    {perfil}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                                                <span className="text-zinc-500">{count}</span>
                                                <span className={`min-w-[3.5rem] text-right ${active ? "text-amber-300" : "text-zinc-300"}`}>
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${active ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-amber-700/70 to-amber-500/70 group-hover:from-amber-600 group-hover:to-amber-400"}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                        {perfilEntries.length === 0 && (
                            <li className="text-sm text-zinc-600 italic">Sin datos.</li>
                        )}
                    </ul>
                    {filterPerfil && (
                        <button
                            onClick={() => setFilterPerfil(null)}
                            className="mt-4 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                        >
                            Limpiar filtro de perfil
                        </button>
                    )}
                </Panel>

                {/* Intención de compra */}
                <Panel title="Intención de compra" hint="Distribución % por nivel">
                    <ul className="space-y-3">
                        {interesEntries.map(([interes, count]) => {
                            const meta = INTERES_META[interes] || { label: interes, color: "text-zinc-300", emoji: "❓", bar: "from-zinc-600 to-zinc-800" };
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            const active = filterInteres === interes;
                            return (
                                <li key={interes}>
                                    <button
                                        onClick={() => setFilterInteres(active ? null : interes)}
                                        className={`w-full text-left group transition ${active ? "opacity-100" : "opacity-90 hover:opacity-100"}`}
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-base shrink-0 leading-none">{meta.emoji}</span>
                                                <span className={`text-sm truncate ${active ? meta.color : "text-zinc-200"}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                                                <span className="text-zinc-500">{count}</span>
                                                <span className={`min-w-[3.5rem] text-right ${active ? meta.color : "text-zinc-300"}`}>
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all bg-gradient-to-r ${meta.bar}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    {filterInteres && (
                        <button
                            onClick={() => setFilterInteres(null)}
                            className="mt-4 text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                        >
                            Limpiar filtro de intención
                        </button>
                    )}
                </Panel>
            </section>

            {/* ── Tabla de leads ── */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-900 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-amber-500/80" />
                        <h2 className="font-display text-sm uppercase tracking-wider text-white">
                            Leads ({filtered.length}{filtered.length !== stats.total ? ` de ${stats.total}` : ""})
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar email, nombre o perfil…"
                            className="bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-600/50 focus:bg-zinc-900 w-72 max-w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-zinc-950/80 text-[10px] uppercase tracking-wider text-zinc-500">
                                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                                <th className="text-left px-5 py-3 font-medium">Email</th>
                                <th className="text-left px-5 py-3 font-medium">Perfil</th>
                                <th className="text-right px-5 py-3 font-medium">Obras</th>
                                <th className="text-left px-5 py-3 font-medium">Intención</th>
                                <th className="text-right px-5 py-3 font-medium">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((l, idx) => {
                                const meta = INTERES_META[l.interes_compra || ""] || null;
                                return (
                                    <tr
                                        key={`${l.email}-${idx}`}
                                        className="border-t border-zinc-900/80 hover:bg-zinc-900/40 transition"
                                    >
                                        <td className="px-5 py-3 text-zinc-200">{l.nombre || "—"}</td>
                                        <td className="px-5 py-3">
                                            <a
                                                href={`mailto:${l.email}`}
                                                className="text-amber-300/90 hover:text-amber-200 transition font-mono text-xs"
                                            >
                                                {l.email}
                                            </a>
                                        </td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs">{l.perfil || "—"}</td>
                                        <td className="px-5 py-3 text-right font-mono text-zinc-300 text-xs">
                                            {l.obras_activas != null ? l.obras_activas : "—"}
                                        </td>
                                        <td className="px-5 py-3">
                                            {meta ? (
                                                <span className={`inline-flex items-center gap-1.5 text-xs ${meta.color}`}>
                                                    <span className="leading-none">{meta.emoji}</span>
                                                    <span>{meta.label}</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-xs text-zinc-500">
                                            {fmtDate(l.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-zinc-600 italic">
                                        {stats.total === 0
                                            ? "Aún no hay registros en la tabla."
                                            : "Sin resultados para los filtros actuales."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="mt-8 text-center text-[10px] uppercase tracking-widest text-zinc-700">
                Localhost only · datos sensibles · no compartir
            </footer>
        </main>
    );
}

/* ══════════════════════════════════════════════════════════════════════
   Subcomponents
   ══════════════════════════════════════════════════════════════════════ */

function KpiCard({
    icon: Icon,
    label,
    value,
    sub,
    accent,
}: {
    icon: typeof Users;
    label: string;
    value: string;
    sub?: string;
    accent: "amber" | "red" | "zinc" | "bronze";
}) {
    const accentClasses: Record<typeof accent, { border: string; icon: string; value: string }> = {
        amber:  { border: "border-amber-900/40 bg-gradient-to-br from-amber-950/30 to-zinc-950/60",   icon: "text-amber-400",  value: "text-amber-100" },
        red:    { border: "border-red-900/40 bg-gradient-to-br from-red-950/30 to-zinc-950/60",       icon: "text-red-400",    value: "text-red-100" },
        zinc:   { border: "border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-zinc-950/60",        icon: "text-zinc-400",   value: "text-zinc-100" },
        bronze: { border: "border-amber-900/40 bg-gradient-to-br from-zinc-900/40 to-zinc-950/60",    icon: "text-amber-500/80", value: "text-zinc-100" },
    };
    const a = accentClasses[accent];
    return (
        <div className={`rounded-2xl border ${a.border} px-5 py-4`}>
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
                <Icon className={`w-4 h-4 ${a.icon}`} />
            </div>
            <div className={`font-display text-3xl md:text-4xl font-extrabold ${a.value} leading-none`}>
                {value}
            </div>
            {sub && (
                <div className="mt-2 text-[11px] text-zinc-500">{sub}</div>
            )}
        </div>
    );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 md:p-6">
            <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-display text-sm uppercase tracking-wider text-white">{title}</h2>
                {hint && <span className="text-[10px] uppercase tracking-widest text-zinc-600">{hint}</span>}
            </div>
            {children}
        </div>
    );
}
