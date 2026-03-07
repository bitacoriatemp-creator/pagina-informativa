"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Home,
    CalendarDays,
    FolderGit2,
    Users,
    User,
    Settings,
    LifeBuoy,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HardHat,
    Menu,
    Bell,
    Plus,
    CircleDot,
    Clock,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Wrench,
    FileText,
    X,
    Filter
} from "lucide-react";

/* ════════════════════════════════════════════════
   TIPOS Y DATOS MOCK
   ════════════════════════════════════════════════ */

type EventCategory = "inspeccion" | "entrega" | "reunion" | "inicio" | "vencimiento" | "hito";

interface CalEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time?: string;
    category: EventCategory;
    project: string;
    projectColor: string;
    location?: string;
    priority: "alta" | "media" | "baja";
    description?: string;
}

const CATEGORY_META: Record<EventCategory, { label: string; icon: React.ElementType; accent: string }> = {
    inspeccion: { label: "Inspección", icon: HardHat, accent: "#f59e0b" },
    entrega: { label: "Entrega", icon: CheckCircle2, accent: "#34d399" },
    reunion: { label: "Reunión", icon: Users, accent: "#60a5fa" },
    inicio: { label: "Inicio", icon: CircleDot, accent: "#C39767" },
    vencimiento: { label: "Vencimiento", icon: AlertTriangle, accent: "#f87171" },
    hito: { label: "Hito", icon: FileText, accent: "#a78bfa" },
};

const TODAY = new Date(2026, 2, 1); // Marzo 2026 (current local time context)

const MOCK_EVENTS: CalEvent[] = [
    {
        id: "e1",
        title: "Inicio de Obra — Cimientos",
        date: "2026-03-03",
        time: "08:00",
        category: "inicio",
        project: "Torre Reforma",
        projectColor: "#C39767",
        location: "Paseo de la Reforma 295, CDMX",
        priority: "alta",
        description: "Arranque oficial de excavación y trazo de cimentación."
    },
    {
        id: "e2",
        title: "Revisión de Planos v3",
        date: "2026-03-05",
        time: "10:00",
        category: "reunion",
        project: "Torre Reforma",
        projectColor: "#C39767",
        location: "Sala BIM, Oficina Central",
        priority: "media",
        description: "Revisión de última actualización de plantas arquitectónicas."
    },
    {
        id: "e3",
        title: "Inspección IMSS — Seguridad",
        date: "2026-03-10",
        time: "09:30",
        category: "inspeccion",
        project: "Residencial Pedregal",
        projectColor: "#60a5fa",
        location: "Pedregal de San Ángel, CDMX",
        priority: "alta",
        description: "Inspección oficial de condiciones de seguridad e higiene."
    },
    {
        id: "e4",
        title: "Entrega de Catálogo de Materiales",
        date: "2026-03-12",
        time: "17:00",
        category: "entrega",
        project: "Torre Reforma",
        projectColor: "#C39767",
        priority: "media",
        description: "Subir al portal el catálogo final de especificaciones de materiales."
    },
    {
        id: "e5",
        title: "Hito: Estructura a Nivel +5",
        date: "2026-03-15",
        category: "hito",
        project: "Torre Reforma",
        projectColor: "#C39767",
        priority: "alta",
        description: "La estructura metálica debe alcanzar el piso 5."
    },
    {
        id: "e6",
        title: "Reunión de Avance con Cliente",
        date: "2026-03-17",
        time: "12:00",
        category: "reunion",
        project: "Residencial Pedregal",
        projectColor: "#60a5fa",
        location: "Videoconferencia",
        priority: "alta",
        description: "Presentación de avance de obra al cliente y aprobación de modificaciones."
    },
    {
        id: "e7",
        title: "Vencimiento: Póliza de Seguro de Obra",
        date: "2026-03-20",
        category: "vencimiento",
        project: "Residencial Pedregal",
        projectColor: "#60a5fa",
        priority: "alta",
        description: "Renovar póliza antes de esta fecha para no incurrir en responsabilidad."
    },
    {
        id: "e8",
        title: "Inspección de Obra Civil",
        date: "2026-03-22",
        time: "10:00",
        category: "inspeccion",
        project: "Torre Reforma",
        projectColor: "#C39767",
        location: "Paseo de la Reforma 295",
        priority: "media",
        description: "Revisión técnica de muros, colados y armado."
    },
    {
        id: "e9",
        title: "Entrega Parcial — Sótanos",
        date: "2026-03-26",
        time: "08:00",
        category: "entrega",
        project: "Torre Reforma",
        projectColor: "#C39767",
        priority: "alta",
        description: "Recepción y firma de entrega del nivel de sótanos S1 y S2."
    },
    {
        id: "e10",
        title: "Taller: Uso de BitacorIA IA",
        date: "2026-03-28",
        time: "16:00",
        category: "reunion",
        project: "General",
        projectColor: "#a78bfa",
        location: "Zoom / Online",
        priority: "baja",
        description: "Capacitación al equipo residente sobre el uso del módulo de análisis fotográfico."
    },
];

/* ════════════════════════════════════════════════
   UTILIDADES
   ════════════════════════════════════════════════ */
const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    // 0=Sun → convert to Mon=0
    const d = new Date(year, month, 1).getDay();
    return (d + 6) % 7;
}
function toDateStr(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════ */
export default function CalendarioGlobal() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth()); // 2 = Marzo
    const [currentYear, setCurrentYear] = useState(TODAY.getFullYear()); // 2026
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
    const [filterProject, setFilterProject] = useState<string>("Todos");

    const projects = useMemo(() => ["Todos", ...Array.from(new Set(MOCK_EVENTS.map(e => e.project)))], []);

    const filteredEvents = useMemo(() =>
        MOCK_EVENTS.filter(e => filterProject === "Todos" || e.project === filterProject),
        [filterProject]);

    const eventsForMonth = useMemo(() =>
        filteredEvents.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        }).sort((a, b) => a.date.localeCompare(b.date)),
        [filteredEvents, currentYear, currentMonth]);

    const eventsForDay = useMemo(() =>
        selectedDate ? filteredEvents.filter(e => e.date === selectedDate) : [],
        [filteredEvents, selectedDate]);

    const eventMap = useMemo(() => {
        const map: Record<string, CalEvent[]> = {};
        filteredEvents.forEach(ev => {
            if (!map[ev.date]) map[ev.date] = [];
            map[ev.date].push(ev);
        });
        return map;
    }, [filteredEvents]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayStr = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-${String(TODAY.getDate()).padStart(2, "0")}`;

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
        setSelectedDate(null);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
        setSelectedDate(null);
    };

    /* ── SIDEBAR COMPARTIDO ── */
    const Sidebar = () => (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#080808]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="h-20 flex items-center px-5 border-b border-white/[0.06] relative">
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C39767]/40 to-transparent" />
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative w-48 h-14 flex items-center justify-center flex-shrink-0">
                        <Image src="/images/logo_horizontal-removebg-preview.png" alt="BitacorIA" width={192} height={56}
                            className="object-contain w-full h-full drop-shadow-[0_0_14px_rgba(195,151,103,0.5)] group-hover:drop-shadow-[0_0_22px_rgba(195,151,103,0.7)] transition-all duration-300" />
                    </div>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-6 flex flex-col custom-scrollbar">
                <div className="px-3 space-y-0.5 mb-6">
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/[0.04] hover:text-white/90 transition-colors">
                        <Home size={18} strokeWidth={1.5} />
                        <span className="text-sm">Inicio</span>
                    </Link>
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767] font-medium cursor-default">
                        <CalendarDays size={18} strokeWidth={2} />
                        <span className="text-sm">Calendario Global</span>
                    </div>
                </div>
                <div className="px-3 mb-6">
                    <div className="px-3 mb-2 flex items-center gap-2 text-white/30">
                        <FolderGit2 size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Mis Obras</span>
                    </div>
                    <div className="px-3 text-xs text-white/30 italic">Torre Reforma</div>
                </div>
                <div className="px-3 mb-6">
                    <div className="px-3 mb-2 flex items-center gap-2 text-white/30">
                        <Users size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Compartidas</span>
                    </div>
                    <div className="px-3 text-xs text-white/30 italic">No tienes invitaciones</div>
                </div>
                <div className="mt-auto px-3 border-t border-white/[0.05] pt-4 space-y-0.5 pb-4">
                    {[{ icon: User, label: "Mi Perfil" }, { icon: Settings, label: "Configuración" }, { icon: LifeBuoy, label: "Centro de Ayuda" }].map(({ icon: Icon, label }) => (
                        <button key={label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:bg-white/[0.04] hover:text-white/80 transition-colors">
                            <Icon size={16} /><span className="text-sm">{label}</span>
                        </button>
                    ))}
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-colors mt-1">
                        <LogOut size={16} /><span className="text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-[#060606] text-white font-sans overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)", backgroundSize: "32px 32px" }}>

            <Sidebar />

            {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

            {/* MAIN */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <header className="h-14 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl flex items-center justify-between px-5 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="p-1.5 text-white/60 hover:text-white md:hidden" onClick={() => setIsSidebarOpen(true)}><Menu size={22} /></button>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="font-mono text-[11px] text-white/30 uppercase tracking-widest">BIT —</span>
                            <h1 className="text-base font-display font-medium tracking-widest uppercase text-white/80">Calendario Global</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Filtro de Proyecto */}
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5">
                            <Filter size={14} className="text-white/40" />
                            <select
                                value={filterProject}
                                onChange={e => setFilterProject(e.target.value)}
                                className="bg-transparent text-white/70 text-xs font-mono focus:outline-none cursor-pointer"
                            >
                                {projects.map(p => <option key={p} value={p} className="bg-[#111]">{p}</option>)}
                            </select>
                        </div>
                        <button className="relative p-2 text-white/60 hover:text-white rounded-full hover:bg-white/5 transition-colors"><Bell size={18} /></button>
                        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C39767] to-amber-600 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white/10">EM</button>
                    </div>
                </header>

                {/* BODY */}
                <div className="flex-1 flex min-h-0">
                    {/* ── CALENDAR MAIN ── */}
                    <div className="flex-1 flex flex-col p-5 overflow-hidden">
                        {/* Month Nav */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <button onClick={prevMonth} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-colors">
                                    <ChevronLeft size={18} className="text-white/70" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-display font-semibold text-white tracking-wide">{MONTHS_ES[currentMonth]}</h2>
                                    <span className="font-mono text-[11px] text-white/30">{currentYear}</span>
                                </div>
                                <button onClick={nextMonth} className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-colors">
                                    <ChevronRight size={18} className="text-white/70" />
                                </button>
                            </div>
                            <button
                                onClick={() => { setCurrentMonth(TODAY.getMonth()); setCurrentYear(TODAY.getFullYear()); setSelectedDate(todayStr); }}
                                className="font-mono text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-lg bg-[#C39767]/10 border border-[#C39767]/20 text-[#C39767] hover:bg-[#C39767]/20 transition-colors"
                            >
                                HOY
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS_ES.map(d => (
                                <div key={d} className="text-center py-2 font-mono text-[10px] uppercase tracking-widest text-white/30">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 flex-1">
                            {/* Empty cells before first day */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="rounded-lg" />
                            ))}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = toDateStr(currentYear, currentMonth, day);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                const dayEvents = eventMap[dateStr] || [];
                                const hasHighPriority = dayEvents.some(e => e.priority === "alta");

                                return (
                                    <div
                                        key={day}
                                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                        className={`
                                            relative rounded-xl p-2 flex flex-col cursor-pointer transition-all duration-200 min-h-[72px] border
                                            ${isSelected ? "bg-[#C39767]/10 border-[#C39767]/30 shadow-[0_0_20px_rgba(195,151,103,0.1)]" : "border-white/[0.05] hover:bg-white/[0.03] hover:border-white/[0.1]"}
                                            ${isToday && !isSelected ? "border-[#C39767]/30 bg-[#C39767]/5" : ""}
                                        `}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-mono text-sm leading-none ${isToday ? "text-[#C39767] font-bold" : "text-white/60"
                                                }`}>
                                                {day}
                                            </span>
                                            {hasHighPriority && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                            )}
                                        </div>

                                        {/* Event dots / pills */}
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {dayEvents.slice(0, 3).map(ev => {
                                                const meta = CATEGORY_META[ev.category];
                                                return (
                                                    <div
                                                        key={ev.id}
                                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: meta.accent }}
                                                        title={ev.title}
                                                    />
                                                );
                                            })}
                                            {dayEvents.length > 3 && (
                                                <span className="font-mono text-[9px] text-white/30">+{dayEvents.length - 3}</span>
                                            )}
                                        </div>

                                        {/* Today line */}
                                        {isToday && (
                                            <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-[#C39767]/70 to-transparent" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 pt-3 mt-2 border-t border-white/[0.05]">
                            {Object.entries(CATEGORY_META).map(([key, meta]) => (
                                <div key={key} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.accent }} />
                                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">{meta.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="w-80 border-l border-white/[0.06] flex flex-col overflow-hidden bg-[#080808]/60 backdrop-blur-sm hidden lg:flex">
                        {/* Panel Header */}
                        <div className="px-5 py-4 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-1">
                                        {selectedDate ? new Date(selectedDate + "T12:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" }) : `${MONTHS_ES[currentMonth]} ${currentYear}`}
                                    </p>
                                    <h3 className="text-sm font-display font-medium text-white/90">
                                        {selectedDate
                                            ? eventsForDay.length > 0 ? `${eventsForDay.length} evento${eventsForDay.length > 1 ? "s" : ""}` : "Sin eventos"
                                            : `${eventsForMonth.length} eventos este mes`
                                        }
                                    </h3>
                                </div>
                                {selectedDate && (
                                    <button onClick={() => setSelectedDate(null)} className="text-white/30 hover:text-white p-1 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar py-3">
                            {(selectedDate ? eventsForDay : eventsForMonth).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <CalendarDays size={28} className="text-white/15 mb-3" />
                                    <p className="text-xs text-white/30 font-mono uppercase tracking-wider">Sin eventos registrados</p>
                                </div>
                            ) : (
                                <div className="space-y-2 px-3">
                                    {(selectedDate ? eventsForDay : eventsForMonth).map(ev => {
                                        const meta = CATEGORY_META[ev.category];
                                        const Icon = meta.icon;
                                        return (
                                            <div
                                                key={ev.id}
                                                onClick={() => setSelectedEvent(ev)}
                                                className="p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group relative overflow-hidden"
                                            >
                                                {/* Left accent bar */}
                                                <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ backgroundColor: meta.accent }} />

                                                <div className="pl-2">
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <span className="text-xs font-medium text-white/90 leading-tight line-clamp-2">{ev.title}</span>
                                                        <Icon size={14} className="flex-shrink-0 mt-0.5" style={{ color: meta.accent }} />
                                                    </div>
                                                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                                        {!selectedDate && (
                                                            <span className="font-mono text-[10px] text-white/40">
                                                                {new Date(ev.date + "T12:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                                                            </span>
                                                        )}
                                                        {ev.time && (
                                                            <span className="font-mono text-[10px] text-white/40 flex items-center gap-1">
                                                                <Clock size={10} /> {ev.time}
                                                            </span>
                                                        )}
                                                        <span className="inline-block font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${ev.projectColor}20`, color: ev.projectColor }}>
                                                            {ev.project}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── EVENT DETAIL MODAL ── */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
                    <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">
                        {/* Modal top accent */}
                        <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${CATEGORY_META[selectedEvent.category].accent}80, transparent)` }} />

                        <div className="p-6">
                            {/* Category chip */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                                    style={{ color: CATEGORY_META[selectedEvent.category].accent, borderColor: `${CATEGORY_META[selectedEvent.category].accent}40`, backgroundColor: `${CATEGORY_META[selectedEvent.category].accent}10` }}>
                                    {(() => { const Icon = CATEGORY_META[selectedEvent.category].icon; return <Icon size={12} />; })()}
                                    {CATEGORY_META[selectedEvent.category].label}
                                </span>
                                <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
                            </div>

                            <h2 className="text-lg font-display font-semibold text-white mb-1 leading-snug">{selectedEvent.title}</h2>

                            {selectedEvent.description && (
                                <p className="text-sm text-white/50 mb-5 leading-relaxed">{selectedEvent.description}</p>
                            )}

                            <div className="space-y-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <CalendarDays size={14} className="text-white/40 flex-shrink-0" />
                                    <span className="font-mono text-xs text-white/70">
                                        {new Date(selectedEvent.date + "T12:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                        {selectedEvent.time && <span className="text-white/40 ml-2">· {selectedEvent.time} hrs</span>}
                                    </span>
                                </div>
                                {selectedEvent.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={14} className="text-white/40 flex-shrink-0" />
                                        <span className="font-mono text-xs text-white/70">{selectedEvent.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <HardHat size={14} className="text-white/40 flex-shrink-0" />
                                    <span className="font-mono text-xs text-white/70" style={{ color: selectedEvent.projectColor }}>{selectedEvent.project}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={14} className={selectedEvent.priority === "alta" ? "text-red-400" : selectedEvent.priority === "media" ? "text-amber-400" : "text-white/30"} />
                                    <span className={`font-mono text-xs uppercase tracking-wider ${selectedEvent.priority === "alta" ? "text-red-400" : selectedEvent.priority === "media" ? "text-amber-400" : "text-white/40"}`}>
                                        Prioridad {selectedEvent.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.08); border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.15); }
                .color-scheme-dark { color-scheme: dark; }
                select option { background-color: #111; }
            `}</style>
        </div>
    );
}
