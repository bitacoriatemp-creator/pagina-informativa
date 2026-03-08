"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useThemeVars } from "@/hooks/useThemeVars";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { useDashboard } from "@/context/DashboardContext";
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
    const { isSidebarOpen, setIsSidebarOpen } = useDashboard();
    const { isDark, cardBg, cardBorder, textMuted, textFaint, hoverBg, borderColor } = useThemeVars();
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

    return (
        <>
            <DashboardTopBar
                activePage="inicio" // Calendar falls under 'inicio' context conceptually, or just none if it's separate
                pageTitle="Calendario"
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                rightActions={
                    <div className="flex items-center gap-3">
                        {/* Filtro de Proyecto */}
                        <div className={`flex items-center gap-2 bg-white/[0.04] border ${borderColor} rounded-lg px-3 py-1.5`}>
                            <Filter size={14} className={textMuted} />
                            <select
                                value={filterProject}
                                onChange={e => setFilterProject(e.target.value)}
                                className="bg-transparent text-sm text-white/80 focus:outline-none appearance-none pr-4 cursor-pointer"
                            >
                                {projects.map(p => <option key={p} value={p} className={isDark ? "bg-[#111]" : "bg-white"}>{p}</option>)}
                            </select>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 bg-[#C39767] hover:bg-[#d4a878] text-black px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(195,151,103,0.3)]">
                            <Plus size={16} /> Nuevo
                        </button>
                    </div>
                }
            />

            {/* BODY */}
            <div className={`flex-1 flex min-h-0 relative ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
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
        </>
    );
}
