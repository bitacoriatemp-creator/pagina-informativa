"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   PlanesSection — Compact Premium Dark Pricing Grid
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";
const PURPLE = "#A855F7";

const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.09, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

const PLANS = [
    {
        id: "draft",
        title: "DRAFT",
        subtitle: "Para Estudiantes y Pruebas.",
        price: "$0",
        priceSuffix: "MXN",
        accentColor: "rgba(255,255,255,0.22)",
        glowColor: "rgba(255,255,255,0.06)",
        featured: false,
        image: "/images/plan_free.webp",
        features: [
            { title: "Licencia de Aprendizaje", desc: "Ideal para estudiantes y primeros pasos en la metodología BIM." },
            { title: "1 Bitácora Activa", desc: "Un slot único para gestionar tu proyecto de prueba." },
            { title: "Protocolo de Reinicio", desc: "Borra el historial completo para iniciar un proyecto nuevo cuando lo necesites." },
            { title: "Marca de Agua", desc: "Exportaciones en PDF con el branding oficial de BitacorIA." },
            { title: "Single User", desc: "Experiencia individual para dominar la plataforma sin distracciones." },
        ],
        cta: "Empezar Gratis",
        note: null,
    },
    {
        id: "resident",
        title: "THE RESIDENT",
        subtitle: "Para Arquitectos e Ingenieros Independientes.",
        price: "$1,699",
        priceSuffix: "MXN / mes",
        accentColor: `${BRONZE}70`,
        glowColor: `${BRONZE}14`,
        featured: false,
        image: "/images/plan_theresident.webp",
        features: [
            { title: "2 Bitácoras Activas", desc: "Gestiona dos obras de forma simultánea con control total." },
            { title: "Múltiples Frentes", desc: "Organiza tu obra por zonas, niveles o etapas constructivas." },
            { title: "Single User Pro", desc: "Acceso exclusivo y centralizado para el ingeniero residente." },
            { title: "Smart Calendar & Concepts", desc: "Desbloquea la IA predictiva para cronogramas y catálogos de conceptos." },
            { title: "Reportes Profesionales", desc: "Exportación de PDFs limpios, listos para firma y sin marcas de agua." },
        ],
        cta: "Comenzar",
        note: null,
    },
    {
        id: "site-manager",
        title: "THE SITE MANAGER",
        subtitle: "El estándar para Constructores y PyMES.",
        price: "$2,299",
        priceSuffix: "MXN / mes",
        accentColor: BRONZE,
        glowColor: `${BRONZE}20`,
        featured: true,
        image: "/images/sitemanager.webp",
        features: [
            { title: "5 Bitácoras Activas", desc: "Capacidad robusta diseñada para constructoras y PyMES." },
            { title: "Team Work (3 Usuarios)", desc: "Colaboración en tiempo real entre residente, supervisor y director." },
            { title: "Smart BIM Sync", desc: "Conecta tu modelo 3D con la realidad física, tiempo y costos de la obra." },
            { title: "Módulo Predictivo Completo", desc: "Smart Calendar y Smart Concepts trabajando en conjunto." },
            { title: "Soporte Prioritario", desc: "Canal directo de atención para resolver dudas técnicas de tu equipo en obra." },
        ],
        cta: "Comenzar",
        note: {
            label: "¿Pagar por obra?",
            pill: "LICENCIA ÚNICA DE PROYECTO",
            detail: "$5,499 MXN · Pago único · 12 meses · 1 obra.",
        },
    },
    {
        id: "executive",
        title: "EXECUTIVE PLAN",
        subtitle: "Control total y escala ilimitada.",
        price: "$8,999",
        priceSuffix: "MXN / mes",
        accentColor: `${PURPLE}90`,
        glowColor: `${PURPLE}14`,
        featured: false,
        image: "/images/executive_plan.webp",
        features: [
            { title: "Volumen Corporativo", desc: "Despliegues desde 10 bitácoras con capacidad de escalar a nivel Enterprise." },
            { title: "Frentes Ilimitados", desc: "Controla megaproyectos y desarrollos complejos sin restricciones." },
            { title: "Colaboración Masiva", desc: "Cuentas centralizadas para toda tu plantilla administrativa y de campo." },
            { title: "Marca Blanca (White Label)", desc: "Personaliza la plataforma y los reportes con el logo y colores de tu empresa." },
            { title: "Audit Ready", desc: "Preparación automática para auditorías con trazabilidad inmutable y BIM Sync total." },
        ],
        cta: "Contactar",
        note: null,
    },
] as const;

/* ── PLAN CARD ── */
function PlanCard({ plan, index }: { plan: typeof PLANS[number]; index: number }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative pt-4">
            {/* Featured badge — sibling of card, outside overflow-hidden */}
            {plan.featured && (
                <div
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full px-3 py-[3px] text-[9px] font-bold uppercase tracking-[0.22em]"
                    style={{
                        background: "#151515",
                        border: `1px solid ${BRONZE}55`,
                        color: BRONZE,
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
                className="relative overflow-hidden flex flex-col rounded-2xl p-5 min-h-[520px]"
                style={{
                    backgroundColor: plan.featured ? "#151515" : "#0f0f0f",
                    border: (hovered || plan.featured)
                        ? `1px solid ${plan.accentColor}`
                        : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: hovered
                        ? `0 0 28px ${plan.glowColor}, 0 16px 48px rgba(0,0,0,0.6)`
                        : plan.featured
                            ? `0 0 18px ${plan.glowColor}, 0 12px 40px rgba(0,0,0,0.5)`
                            : "0 6px 24px rgba(0,0,0,0.4)",
                    transform: hovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                }}
            >
                {/* Artwork — z-0 sits above card bg, below z-10 text; mask fades leftward */}
                <img
                    src={plan.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 w-full h-auto max-h-[70%] object-cover object-bottom mix-blend-screen opacity-40 z-0 pointer-events-none"
                    style={{
                        maskImage: "linear-gradient(to top, white 40%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to top, white 40%, transparent 100%)",
                    }}
                />

                {/* All text content above image + gradient */}
                <div className="relative z-10 flex flex-col h-full">

                    {/* Title */}
                    <h3
                        className="mb-0.5 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-white/90"
                    >
                        {plan.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="mb-4 text-[10.5px] leading-snug text-white/32">{plan.subtitle}</p>

                    {/* Price */}
                    <div
                        className="mb-4 border-b pb-4"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    >
                        <span className="font-display text-2xl font-extrabold tracking-tight text-white/92">
                            {plan.price}
                        </span>
                        <span className="ml-1 text-[10px] text-white/28">{plan.priceSuffix}</span>
                    </div>

                    {/* Features */}
                    <ul className="mb-4 flex flex-col gap-0 space-y-4">
                        {plan.features.map((f) => (
                            <li key={f.title} className="flex items-start gap-2.5">
                                <Check
                                    size={12}
                                    strokeWidth={2.5}
                                    className="mt-[2px] shrink-0"
                                    style={{ color: plan.accentColor }}
                                />
                                <div>
                                    <p className="text-[11.5px] font-semibold leading-snug text-white/80">{f.title}</p>
                                    <p className="mt-0.5 text-[10px] leading-snug text-white/35">{f.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="flex-1" />

                    {/* Bottom-anchored wrapper — note + CTA always at card base */}
                    <div className="mt-auto">

                        {/* Note box (card 3 only) */}
                        {plan.note && (
                            <div
                                className="mb-4 rounded-lg p-3"
                                style={{
                                    background: `${BRONZE}08`,
                                    border: `1px solid ${BRONZE}22`,
                                }}
                            >
                                <p className="mb-0.5 text-[9px] text-white/25">{plan.note.label}</p>
                                <p className="mb-0.5 text-[9.5px] font-bold uppercase tracking-widest" style={{ color: `${BRONZE}BB` }}>
                                    {plan.note.pill}
                                </p>
                                <p className="text-[9.5px] leading-snug text-white/32">{plan.note.detail}</p>
                            </div>
                        )}

                        {/* CTA */}
                        <button
                            className={
                                plan.featured
                                    ? "w-full py-3 mt-auto rounded-lg bg-amber-950/40 border border-amber-700/50 text-amber-500 font-bold shadow-[0_0_15px_rgba(120,53,15,0.3)] hover:bg-amber-900/60 hover:border-amber-500 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(180,83,9,0.4)] hover:scale-[1.02] transition-all duration-300 z-20"
                                    : "w-full py-3 mt-auto rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 font-semibold hover:bg-amber-950/20 hover:border-amber-800/50 hover:text-amber-600 transition-all duration-300 z-20"
                            }
                        >
                            {plan.cta}
                        </button>
                    </div> {/* end mt-auto */}

                </div> {/* end z-10 text wrapper */}
            </motion.div>
        </div>
    );
}

/* ── MAIN SECTION ── */
export default function PlanesSection() {
    return (
        <section
            id="soluciones"
            className="w-full min-h-screen flex flex-col justify-center md:snap-center md:snap-always shrink-0 relative overflow-hidden scroll-mt-24"
            style={{
                backgroundColor: "#080808",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                /* isolation: new stacking context so z-20 sticky island doesn't bleed in */
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
                    className="mb-12 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-2.5">
                        <span className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${BRONZE}50)` }} />
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: `${BRONZE}65` }}>
                            Planes & Precios
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
                        Desde estudiantes hasta constructoras. El nivel exact para tu escala.
                    </p>
                </motion.div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {PLANS.map((plan, i) => (
                        <PlanCard key={plan.id} plan={plan} index={i} />
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
