import { Project } from "@/types/project";

export const APPEARANCES = [
    { id: "solid-1", class: "from-slate-800 to-slate-950", name: "Gris Pizarra" },
    { id: "solid-2", class: "from-emerald-900 to-emerald-950", name: "Esmeralda Oscuro" },
    { id: "solid-3", class: "from-blue-900 to-slate-950", name: "Azul Noche" },
    { id: "text-1", class: "from-[#222] to-[#111] bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]", name: "Acero / Grid" },
    { id: "text-2", class: "from-[#2A231E] to-[#14120F]", name: "Madera" },
    { id: "text-3", class: "from-[#1e2022] to-[#0f1115]", name: "Concreto" }
];

export type Category = "Estructurista" | "Residente" | "Coordinador BIM" | "Supervisor" | "Administración";

export interface Contact {
    id: string;
    name: string;
    role: string;
    category: Category;
    phone: string;
    email: string;
    projects: { name: string; color: string }[];
    avatarColor: string;
    status: "activo" | "ocupado" | "inactivo";
    avatarUrl?: string;
    coverUrl?: string;
}

export const MOCK_CONTACTS: Contact[] = [
    {
        id: "c1",
        name: "Diego Ramírez",
        role: "Ing. Residente de Obra",
        category: "Residente",
        phone: "+52 55 1234 5678",
        email: "d.ramirez@bitacoria.app",
        avatarColor: "from-[#C39767] to-amber-600",
        status: "activo",
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Residencial Pedregal", color: "#60a5fa" }],
        avatarUrl: "/images/contacts/avatar_diego.png",
        coverUrl: "/images/contacts/cover_diego.png"
    },
    {
        id: "c2",
        name: "Valeria Santillán",
        role: "Desarrollo BIM L3",
        category: "Coordinador BIM",
        phone: "+52 55 9876 5432",
        email: "v.santillan@bitacoria.app",
        avatarColor: "from-blue-500 to-indigo-600",
        status: "ocupado",
        projects: [{ name: "Torre Reforma", color: "#C39767" }],
        avatarUrl: "/images/contacts/avatar_valeria.png",
        coverUrl: "/images/contacts/cover_valeria.png"
    },
    {
        id: "c3",
        name: "Carlos Medina",
        role: "Cálculo Estructural",
        category: "Estructurista",
        phone: "+52 33 4455 6677",
        email: "c.medina@estructuras.inc",
        avatarColor: "from-red-500 to-rose-700",
        status: "activo",
        projects: [{ name: "Torre Reforma", color: "#C39767" }, { name: "Hospital Regional", color: "#34d399" }],
        avatarUrl: "/images/contacts/avatar_carlos.png",
        coverUrl: "/images/contacts/cover_carlos.png"
    },
    {
        id: "c4",
        name: "Fernanda López",
        role: "Supervisora SSHA",
        category: "Supervisor",
        phone: "+52 81 2233 4455",
        email: "f.lopez@bitacoria.app",
        avatarColor: "from-emerald-400 to-teal-600",
        status: "activo",
        projects: [{ name: "Residencial Pedregal", color: "#60a5fa" }],
        avatarUrl: "/images/contacts/avatar_fernanda.png",
        coverUrl: "/images/contacts/cover_fernanda.png"
    },
    {
        id: "c5",
        name: "Roberto Garza",
        role: "Gerente de Finanzas",
        category: "Administración",
        phone: "+52 55 1122 3344",
        email: "r.garza@bitacoria.app",
        avatarColor: "from-purple-500 to-fuchsia-600",
        status: "inactivo",
        projects: [],
        avatarUrl: "/images/contacts/avatar_roberto.png",
        coverUrl: "/images/contacts/cover_roberto.png"
    },
    {
        id: "c6",
        name: "Elena Torres",
        role: "Residente Junior",
        category: "Residente",
        phone: "+52 55 5566 7788",
        email: "e.torres@bitacoria.app",
        avatarColor: "from-amber-400 to-orange-500",
        status: "activo",
        projects: [{ name: "Hospital Regional", color: "#34d399" }],
        avatarUrl: "/images/contacts/avatar_elena.png",
        coverUrl: "/images/contacts/cover_elena.png"
    }
];

export const RECENT_ENGINEERS = MOCK_CONTACTS;

export const DEFAULT_PROJECTS: Project[] = [
    {
        id: "1",
        title: "Torre Reforma",
        subtitle: "CDMX",
        role: "Owner",
        gradient: "from-slate-800 to-slate-950",
        ownerInitials: "DR",
        lastUpdated: "5 Mar, 10:42 AM",
        lastEntry: "5 Mar, 10:38 AM — Colado de losa nivel 8",
        team: [
            { initials: "DR", name: "Diego Ramírez", role: "Owner", color: "bg-[#C39767]", lastActivity: "5 Mar, 10:42 AM", avatarUrl: "/images/contacts/avatar_diego.png" },
            { initials: "VS", name: "Valeria Santillán", role: "Editor", color: "bg-blue-500", lastActivity: "5 Mar, 09:15 AM", avatarUrl: "/images/contacts/avatar_valeria.png" },
            { initials: "CM", name: "Carlos Medina", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 11:00 AM", avatarUrl: "/images/contacts/avatar_carlos.png" }
        ]
    },
    {
        id: "2",
        title: "C.C. Oasis",
        subtitle: "Guadalajara",
        role: "Owner",
        gradient: "from-[#2A231E] to-[#14120F]",
        ownerInitials: "CM",
        lastUpdated: "4 Mar, 04:15 PM",
        lastEntry: "4 Mar, 03:50 PM — Revisión de fachada",
        team: [
            { initials: "CM", name: "Carlos Medina", role: "Owner", color: "bg-[#C39767]", lastActivity: "4 Mar, 04:20 PM", avatarUrl: "/images/contacts/avatar_carlos.png" },
            { initials: "ET", name: "Elena Torres", role: "Editor", color: "bg-blue-500", lastActivity: "4 Mar, 04:15 PM", avatarUrl: "/images/contacts/avatar_elena.png" },
            { initials: "FL", name: "Fernanda López", role: "Viewer", color: "bg-emerald-500", lastActivity: "3 Mar, 09:00 AM", avatarUrl: "/images/contacts/avatar_fernanda.png" }
        ]
    }
];
