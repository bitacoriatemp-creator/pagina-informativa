"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
    Building2, Layers, Users, FileText, 
    CalendarDays, Table, Box, ShieldCheck,
    PenTool, Headset, Palette
} from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ══════════════════════════════════════════════════════════════
   PlanesSection — Compact Premium Dark Pricing Grid
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";
const PURPLE = "#A855F7";
const GOLD = "#C5A880";   // muted crema/dorado — subtle premium accent

const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.09, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

const PLANS = [
    /* ─── 1. DRAFT ─────────────────────────────────────────── */
    {
        id: "draft",
        title: "DRAFT",
        subtitle: "Para Estudiantes y Pruebas.",
        priceMonthly: "0",
        priceAnnual: "0",
        annualTotal: "0",
        priceSuffix: "MXN",
        accentColor: "rgba(255,255,255,0.22)",
        glowColor: "rgba(255,255,255,0.06)",
        checkColor: "rgba(255,255,255,0.6)",
        featured: false,
        image: assetPath("/images/plan_free.webp"),
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "1 proyecto de prueba", included: true },
            { icon: Layers, title: "FRENTES", desc: "Frente único", included: true },
            { icon: Users, title: "USUARIOS", desc: "Licencia individual", included: true },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma predictivo", included: false },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: false },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: false },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Aprobación automatizada", included: false },
            { icon: Headset, title: "SOPORTE PRO", desc: "Canal prioritario", included: false },
            { icon: Palette, title: "WHITE LABEL", desc: "Sin marcas de agua", included: false },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Empezar Gratis",
        note: null,
        dualCta: false,
    },

    /* ─── 2. THE RESIDENT ───────────────────────────────────── */
    {
        id: "resident",
        title: "THE RESIDENT",
        subtitle: "Para Arquitectos e Ingenieros Independientes.",
        priceMonthly: "2,499",
        priceAnnual: "1,999",
        annualTotal: "23,988",
        priceSuffix: "MXN / mes",
        accentColor: `${BRONZE}70`,
        glowColor: `${BRONZE}14`,
        checkColor: BRONZE,
        featured: false,
        image: assetPath("/images/plan_theresident.webp"),
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "3 obras simultáneas", included: true },
            { icon: Layers, title: "FRENTES", desc: "Múltiples frentes y zonas", included: true },
            { icon: Users, title: "USUARIOS", desc: "Licencia individual", included: true },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma predictivo", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Aprobación automatizada", included: true },
            { icon: Headset, title: "SOPORTE PRO", desc: "Canal prioritario", included: false },
            { icon: Palette, title: "WHITE LABEL", desc: "Sin marcas de agua", included: false },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Comenzar",
        note: null,
        dualCta: false,
    },

    /* ─── 3. THE SITE MANAGER (⭐ FEATURED) ─────────────────── */
    {
        id: "site-manager",
        title: "THE SITE MANAGER",
        subtitle: "El estándar para Constructores y PyMES.",
        priceMonthly: "3,899",
        priceAnnual: "3,199",
        annualTotal: "38,388",
        priceSuffix: "MXN / mes",
        accentColor: `${GOLD}55`,   // low-opacity border — elegant, not neon
        glowColor: `rgba(197,168,128,0.14)`,
        checkColor: `${GOLD}CC`,
        featured: true,
        image: assetPath("/images/sitemanager.webp"),
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "5 obras simultáneas", included: true },
            { icon: Layers, title: "FRENTES", desc: "Múltiples frentes y zonas", included: true },
            { icon: Users, title: "USUARIOS", desc: "3 base (+$299/extra)", included: true },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma predictivo", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Aprobación automatizada", included: true },
            { icon: Headset, title: "SOPORTE PRO", desc: "Canal prioritario", included: true },
            { icon: Palette, title: "WHITE LABEL", desc: "Sin marcas de agua", included: true },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Comenzar",
        note: {
            label: "¿Pago por obra?",
            pill: "LICENCIA ÚNICA DE PROYECTO",
            detail: "$10,999 MXN · Pago único · 12 meses · 1 obra.",
        },
        dualCta: false,
    },

    /* ─── 4. EXECUTIVE PLAN ─────────────────────────────────── */
    {
        id: "executive",
        title: "EXECUTIVE PLAN",
        subtitle: "Control total y escala ilimitada.",
        priceMonthly: "12,999",
        priceAnnual: "10,399",
        annualTotal: "124,788",
        priceSuffix: "MXN / mes",
        accentColor: `${PURPLE}90`,
        glowColor: `${PURPLE}14`,
        checkColor: PURPLE,
        featured: false,
        image: assetPath("/images/executive_plan.webp"),
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "Panel Multi-Empresa Global", included: true },
            { icon: Layers, title: "FRENTES", desc: "Gobernanza y Permisos", included: true },
            { icon: Users, title: "USUARIOS", desc: "Single Sign-On (SSO)", included: true },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma predictivo", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Aprobación automatizada", included: true },
            { icon: Headset, title: "SOPORTE PRO", desc: "Atención dedicada", included: true },
            { icon: Palette, title: "WHITE LABEL", desc: "Colores de tu empresa", included: true },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: true },
        ],
        cta: "Contactar",
        note: null,
        dualCta: true,  // shows "Comprar" + "Contactar"
    },
] as const;

const FEATURE_EXPLANATIONS: Record<string, string> = {
    "OBRAS ACTIVAS": "Proyectos en ejecución simultánea.",
    "FRENTES": "Subdivisiones por nivel o zona de obra.",
    "USUARIOS": "Miembros bajo la misma licencia.",
    "SMART LOG": "Interfaz central de bitácoras y registros.",
    "SMART CALENDAR": "Diagramas de Gantt impulsados por IA.",
    "SMART CONCEPTS": "Catálogo inteligente de construcción.",
    "SMART BIM SYNC": "Conexión en tiempo real de tus datos.",
    "FIRMAS DIGITALES": "Aprobación de documentos con un clic.",
    "SOPORTE PRO": "Atención técnica y soporte prioritario.",
    "WHITE LABEL": "Personalización con logo de tu constructora.",
    "AUDIT READY": "Respaldo y recuperación de emergencia."
};

/* ── PLAN CARD ── */
const PlanCard = React.memo(function PlanCard({ plan, index, isAnnual }: { plan: typeof PLANS[number]; index: number; isAnnual: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative pt-4">
            {/* Featured badge — peer of card, outside overflow-hidden */}
            {plan.featured && (
                <div
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full px-3 py-[3px] text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{
                        background: "#141210",
                        border: `1px solid ${GOLD}40`,
                        color: `${GOLD}CC`,   // pastel/crema — not electric
                    }}
                >
                    Recomendado
                </div>
            )}

            <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative flex flex-col rounded-2xl p-5 min-h-[520px]"
                style={{
                    backgroundColor: plan.featured ? "#121008" : "#0f0f0f",
                    border: (hovered || plan.featured)
                        ? `1px solid ${plan.accentColor}`
                        : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: hovered
                        ? `0 0 28px ${plan.glowColor}, 0 16px 48px rgba(0,0,0,0.6)`
                        : plan.featured
                            ? `0 0 22px ${plan.glowColor}, 0 12px 40px rgba(0,0,0,0.5)`
                            : "0 6px 24px rgba(0,0,0,0.4)",
                    transform: hovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                }}
            >
                {/* Background artwork */}
                <div
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 w-full max-h-[70%] h-48 z-0 pointer-events-none overflow-hidden rounded-b-2xl"
                    style={{
                        maskImage: "linear-gradient(to top, white 40%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to top, white 40%, transparent 100%)",
                        opacity: 0.4,
                        mixBlendMode: "screen",
                    }}
                >
                    <Image src={plan.image} alt="" fill className="object-cover object-bottom" />
                </div>

                {/* All content above image */}
                <div className="relative z-10 flex flex-col h-full">

                    {/* STICKY HEADER (Title, Price, CTA) */}
                    <div 
                        className="sticky top-0 z-30 pt-5 pb-5 -mx-5 px-5 -mt-5"
                        style={{ 
                            backgroundColor: plan.featured ? "#121008" : "#0f0f0f",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            boxShadow: "0 10px 20px -10px rgba(0,0,0,0.6)"
                        }}
                    >
                        {/* Title & Price Container (Fixed Height for Alignment) */}
                        <div className="h-[120px] flex flex-col">
                            {/* Title */}
                            <h3 className="mb-0.5 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-white/90">
                                {plan.title}
                            </h3>

                            {/* Subtitle */}
                            <p className="mb-3 text-[10.5px] leading-snug text-white/32 line-clamp-2">
                                {plan.subtitle}
                            </p>

                            {/* Price */}
                            <div className="relative mt-auto">
                                {/* Old Price Strike-through */}
                                {isAnnual && plan.id !== "draft" && (
                                    <div className="absolute top-[-14px] left-0 text-[11px] font-bold tracking-wider text-white/20 line-through decoration-red-500/50 decoration-2">
                                        ${plan.priceMonthly}
                                    </div>
                                )}
                                <span
                                    className="font-display text-2xl font-extrabold tracking-tight transition-all duration-300"
                                    style={{ color: "rgba(255,255,255,0.92)" }}
                                >
                                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                                </span>
                                <span className="ml-1 text-[10px] text-white/28">{plan.priceSuffix}</span>
                                
                                {/* Subtexto Anual */}
                                <div className="h-4 mt-0.5">
                                    {isAnnual && plan.id !== "draft" ? (
                                        <p className="text-[9.5px] font-medium text-white/30 tracking-wide">
                                            Facturado <span className="text-white/60">${plan.annualTotal}</span> al año
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-4">
                            {plan.dualCta ? (
                                /* Dual buttons — Executive Plan */
                                <div className="flex gap-2">
                                    <a
                                        href="https://www.bitacoria.com/"
                                        className="relative flex-1 py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center justify-center text-center"
                                        style={{
                                            background: "linear-gradient(180deg, #442485 0%, #201140 100%)",
                                            border: `1px solid ${PURPLE}90`,
                                            color: "#f3e8ff",
                                            boxShadow: `inset 0 1px 1px rgba(255,255,255,0.2), 0 6px 15px rgba(168,85,247,0.25)`,
                                        }}
                                    >
                                        Comenzar
                                    </a>
                                    <a
                                        href="#contacto"
                                        className="relative flex-1 py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:brightness-125 active:scale-95 flex items-center justify-center text-center"
                                        style={{
                                            background: "linear-gradient(180deg, #2a2a2a 0%, #151515 100%)",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            color: "rgba(255,255,255,0.85)",
                                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 6px 15px rgba(0,0,0,0.5)",
                                        }}
                                    >
                                        Contactar
                                    </a>
                                </div>
                            ) : (
                                /* Single CTA */
                                <a
                                    href="https://www.bitacoria.com/"
                                    className="relative w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center justify-center text-center"
                                    style={plan.featured ? {
                                        background: "linear-gradient(180deg, #322511 0%, #181208 100%)",
                                        border: `1px solid ${GOLD}90`,
                                        color: GOLD,
                                        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.15), 0 6px 20px rgba(197,168,128,0.25)`,
                                    } : {
                                        background: "linear-gradient(180deg, #2a2a2a 0%, #151515 100%)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        color: "rgba(255,255,255,0.85)",
                                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 6px 15px rgba(0,0,0,0.6)",
                                    }}
                                >
                                    {plan.cta}
                                </a>
                            )}
                        </div>

                    </div>

                    {/* Features (Apple Comparison Style) */}
                    <ul className="mb-8 flex flex-col gap-6 pt-2">
                        {plan.features.map((f, idx) => (
                            <li key={idx} className="flex flex-col items-center text-center">
                                <f.icon
                                    size={28}
                                    strokeWidth={1.2}
                                    className="mb-2"
                                    style={{ 
                                        color: f.included ? plan.checkColor : "rgba(255,255,255,0.15)",
                                        filter: f.included ? "none" : "grayscale(100%) brightness(0.5)"
                                    }}
                                />
                                <p className={`text-[11px] font-bold tracking-wide uppercase leading-tight ${f.included ? "text-white/90" : "text-white/20"}`}>
                                    {f.title}
                                </p>
                                {/* Explanation */}
                                <p
                                    className="text-[9px] mt-0.5 mb-1.5 max-w-[90%] leading-tight"
                                    style={{ color: f.included ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)" }}
                                >
                                    {FEATURE_EXPLANATIONS[f.title]}
                                </p>
                                <p className={`mt-0.5 text-[10px] leading-snug max-w-[160px] font-medium ${f.included ? "text-white/60" : "text-white/10"}`}>
                                    {f.desc}
                                </p>
                            </li>
                        ))}
                    </ul>

                    {/* Licencia Única note — Site Manager only (Moved to bottom) */}
                    {plan.note && (
                        <div
                            className="mt-auto mb-4 rounded-lg p-4 relative z-20"
                            style={{
                                background: "rgba(197,168,128,0.05)",
                                border: "1px solid rgba(197,168,128,0.15)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                            }}
                        >
                            <p className="mb-1 text-[9px] text-white/25 uppercase tracking-wider">{plan.note.label}</p>
                            <p
                                className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                                style={{ color: `${GOLD}DD` }}
                            >
                                {plan.note.pill}
                            </p>
                            <p className="text-[10px] leading-relaxed text-white/40">{plan.note.detail}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

/* ── MAIN SECTION ── */
export default function PlanesSection() {
    const [isAnnual, setIsAnnual] = useState(true); // Default to Annual for the psychological hook

    return (
        <section
            id="soluciones"
            className="w-full min-h-screen flex flex-col justify-center md:snap-center md:snap-always shrink-0 relative overflow-x-clip scroll-mt-24"
            style={{
                backgroundColor: "#080808",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                isolation: "isolate",
            }}
        >
            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 55% 35% at 50% 0%, ${BRONZE}07, transparent 60%),
                        radial-gradient(ellipse 35% 25% at 85% 65%, ${PURPLE}06, transparent 70%)
                    `,
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-12">

                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, ease: [0.25, 0.4, 0.25, 1] as const }}
                    className="mb-10 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-2.5">
                        <span className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${BRONZE}50)` }} />
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: `${BRONZE}65` }}>
                            Planes &amp; Precios
                        </span>
                        <span className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${BRONZE}50)` }} />
                    </div>
                    <h2 className="font-display text-4xl font-extrabold uppercase leading-tight tracking-tight text-white/92 sm:text-5xl">
                        El plan para{" "}
                        <span style={{
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundImage: `linear-gradient(135deg, ${BRONZE}, #e8b97a 50%, ${BRONZE}aa)`,
                            backgroundClip: "text",
                        }}>
                            cada obra.
                        </span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-white/32">
                        Desde estudiantes hasta constructoras. El nivel exacto para tu escala.
                    </p>
                </motion.div>

                {/* Toggle Switch */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-14 flex justify-center"
                >
                    <div 
                        className="relative flex items-center p-1 rounded-full border border-white/10"
                        style={{ background: "rgba(10,10,10,0.8)" }}
                    >
                        {/* Fondo Deslizante */}
                        <motion.div
                            className="absolute inset-1 rounded-full z-0"
                            style={{ 
                                background: "linear-gradient(180deg, #2a2a2a 0%, #151515 100%)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                width: isAnnual ? "14rem" : "8rem",
                            }}
                            initial={false}
                            animate={{
                                x: isAnnual ? "8rem" : "0", 
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />

                        {/* Botón Mensual */}
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`relative z-10 w-32 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-colors duration-300 ${!isAnnual ? "text-white" : "text-white/40 hover:text-white/70"}`}
                        >
                            Mensual
                        </button>

                        {/* Botón Anual */}
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`relative z-10 w-56 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-colors duration-300 ${isAnnual ? "text-white" : "text-white/40 hover:text-white/70"}`}
                        >
                            Anual 
                            <span 
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-widest" 
                                style={{ 
                                    background: isAnnual ? `${GOLD}20` : "transparent", 
                                    color: isAnnual ? GOLD : "rgba(255,255,255,0.3)",
                                    border: isAnnual ? `1px solid ${GOLD}40` : "1px solid transparent",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                2 MESES GRATIS
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* 4-column card grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {PLANS.map((plan, i) => (
                        <PlanCard key={plan.id} plan={plan} index={i} isAnnual={isAnnual} />
                    ))}
                </div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="mt-10 text-center text-[10.5px] text-white/18"
                >
                    Todos los precios en MXN · IVA no incluido · Cancelación en cualquier momento
                </motion.p>
            </div>
        </section>
    );
}
