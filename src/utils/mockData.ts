import { Project } from "@/types/project";

export const APPEARANCES = [
    { id: "solid-1", class: "from-slate-800 to-slate-950", name: "Gris Pizarra" },
    { id: "solid-2", class: "from-emerald-900 to-emerald-950", name: "Esmeralda Oscuro" },
    { id: "solid-3", class: "from-blue-900 to-slate-950", name: "Azul Noche" },
    { id: "text-1", class: "from-[#222] to-[#111] bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]", name: "Acero / Grid" },
    { id: "text-2", class: "from-[#2A231E] to-[#14120F]", name: "Madera" },
    { id: "text-3", class: "from-[#1e2022] to-[#0f1115]", name: "Concreto" }
];

export const RECENT_ENGINEERS = [
    { id: 1, name: "Luis (Ing. Supervisor)" },
    { id: 2, name: "Diego (Ing. Supervisor)" },
    { id: 3, name: "Erick (Cliente)" }
];

export const DEFAULT_PROJECTS: Project[] = [
    {
        id: "1",
        title: "Torre Reforma",
        subtitle: "CDMX",
        role: "Owner",
        gradient: "from-slate-800 to-slate-950",
        ownerInitials: "EM",
        lastUpdated: "5 Mar, 10:42 AM",
        lastEntry: "5 Mar, 10:38 AM — Colado de losa nivel 8",
        team: [
            { initials: "EM", name: "Ernesto Molina", role: "Owner", color: "bg-[#C39767]", lastActivity: "5 Mar, 10:42 AM" },
            { initials: "AR", name: "Ana Ríos", role: "Editor", color: "bg-blue-500", lastActivity: "5 Mar, 09:15 AM" },
            { initials: "LP", name: "Luis Paredes", role: "Viewer", color: "bg-emerald-500", lastActivity: "4 Mar, 02:30 PM" },
            { initials: "MG", name: "María González", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 11:00 AM" },
            { initials: "RV", name: "Ricardo Vega", role: "Viewer", color: "bg-emerald-500", lastActivity: "3 Mar, 04:00 PM" },
            { initials: "TS", name: "Tomás Santos", role: "Editor", color: "bg-blue-500", lastActivity: "3 Mar, 10:15 AM" }
        ]
    },
    {
        id: "2",
        title: "C.C. Oasis",
        subtitle: "Guadalajara",
        role: "Owner",
        gradient: "from-[#2A231E] to-[#14120F]",
        ownerInitials: "JN",
        lastUpdated: "4 Mar, 04:15 PM",
        lastEntry: "4 Mar, 03:50 PM — Revisión de fachada",
        team: [
            { initials: "JN", name: "Javier Nájera", role: "Owner", color: "bg-[#C39767]", lastActivity: "4 Mar, 04:20 PM" },
            { initials: "EM", name: "Ernesto Molina", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 04:15 PM" },
            { initials: "SC", name: "Sara Castillo", role: "Viewer", color: "bg-emerald-500", lastActivity: "3 Mar, 09:00 AM" }
        ]
    }
];
