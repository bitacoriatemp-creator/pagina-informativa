"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Building2, Layers, Users, FileText,
    CalendarDays, Table, Box, ShieldCheck,
    PenTool, Headset, Palette, ArrowRight, Gauge
} from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import { registerUrl, type BillingCycle } from "@/lib/appUrl";
import { solicitudPlanUrl } from "@/lib/registro";

/* ══════════════════════════════════════════════════════════════
   PlanesSection — Compact Premium Dark Pricing Grid
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";
const PURPLE = "#A855F7";
const GOLD = "#C5A880";   // muted crema/dorado — subtle premium accent
/* Plus (2026-11-13): arena clara entre el blanco de Draft y el bronce de Pro,
   y la etiqueta "Nuevo" en coral (Luis 2026-11-13: el esmeralda no le gustó):
   cálido, llama la atención sin pelear con el bronce, el dorado ni el morado. */
const ARENA = "#E8D5B7";
const CORAL = "#FF8A73";

const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.09, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

/* `planKey` es la clave que entiende la app al dar de alta (ver appUrl.ts):
   DRAFT → draft, PRO → resident, MAX → manager, ULTRA → executive. Las claves
   no cambian aunque cambie el nombre que ve el cliente (2026-11-13, Luis:
   The Resident → Pro, The Site Manager → Max, Executive Plan → Ultra).
   PLUS → "plus" es la excepción: la app todavía no lo conoce, así que su botón
   va al formulario de /registro y no al alta (ver planes.ts).
   `id` sigue siendo solo la key de React. `isNew` pone la etiqueta "Nuevo".
   El renglón "SIN LÍMITE DIARIO" (Luis 2026-11-13) va en las cinco tarjetas:
   en color en Pro, Max y Ultra, que no tienen tope por día (el uso de la IA se
   cuida por semana), y en gris en Draft y Plus, que sí lo tienen (sin números
   hasta que los límites existan en el sistema). */
const PLANS = [
    /* ─── 1. DRAFT ─────────────────────────────────────────── */
    {
        id: "draft",
        planKey: "draft",
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
        isNew: false,
        image: assetPath("/images/plan_free.webp"),
        imageFilter: null,
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "1 proyecto de prueba", included: true },
            { icon: Layers, title: "FRENTES", desc: "Frente único", included: true },
            { icon: Users, title: "USUARIOS", desc: "Licencia individual", included: true },
            { icon: Gauge, title: "SIN LÍMITE DIARIO", desc: "Con límite de uso diario", included: false },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Incluido en la prueba", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Incluido en la prueba", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Incluido en la prueba", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Firma en reportes PDF", included: false },
            { icon: Headset, title: "SOPORTE PRIORITARIO", desc: "Canal prioritario", included: false },
            { icon: Palette, title: "WHITE LABEL", desc: "Sin marcas de agua", included: false },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Empezar Gratis",
        note: null,
        dualCta: false,
    },

    /* ─── 2. PLUS (NUEVO) ──────────────────────────────────────
       2026-11-13 (Luis): una obra y una persona, con la bitácora en PDF (con la
       marca de BitacorIA) y catálogo y cronograma como en el plan gratis.
       Todavía no existe en la app ni en el servidor: se anuncia aquí y se
       contrata por el formulario de /registro. Imagen provisional: la del plan
       gratis con otro color, mientras JC hace la definitiva. */
    {
        id: "plus",
        planKey: "plus",
        title: "PLUS",
        subtitle: "Para tu primera obra.",
        priceMonthly: "699",
        priceAnnual: "549",
        annualTotal: "6,588",
        priceSuffix: "MXN / mes",
        accentColor: `${ARENA}70`,
        glowColor: `${ARENA}14`,
        checkColor: ARENA,
        featured: false,
        isNew: true,
        image: assetPath("/images/plan_free.webp"),
        imageFilter: "hue-rotate(105deg) saturate(0.8)",
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "1 obra", included: true },
            { icon: Layers, title: "FRENTES", desc: "Frente único", included: true },
            { icon: Users, title: "USUARIOS", desc: "Licencia individual", included: true },
            { icon: Gauge, title: "SIN LÍMITE DIARIO", desc: "Con límite de uso diario", included: false },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora con PDF", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Como en el plan gratis", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Como en el plan gratis", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Incluido, versión básica", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Firma en reportes PDF", included: true },
            { icon: Headset, title: "SOPORTE PRIORITARIO", desc: "Canal prioritario", included: false },
            { icon: Palette, title: "WHITE LABEL", desc: "Con marca de BitacorIA", included: false },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Comenzar",
        note: null,
        dualCta: false,
    },

    /* ─── 3. PRO (antes The Resident) ──────────────────────── */
    {
        id: "resident",
        planKey: "resident",
        title: "PRO",
        subtitle: "Para Arquitectos e Ingenieros Independientes.",
        priceMonthly: "2,499",
        priceAnnual: "1,999",
        annualTotal: "23,988",
        priceSuffix: "MXN / mes",
        accentColor: `${BRONZE}70`,
        glowColor: `${BRONZE}14`,
        checkColor: BRONZE,
        featured: false,
        isNew: false,
        image: assetPath("/images/plan_theresident.webp"),
        imageFilter: null,
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "5 obras simultáneas", included: true },
            { icon: Layers, title: "FRENTES", desc: "Múltiples frentes y zonas", included: true },
            { icon: Users, title: "USUARIOS", desc: "Licencia individual", included: true },
            { icon: Gauge, title: "SIN LÍMITE DIARIO", desc: "Usa la app sin tope por día", included: true },
            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma con avance real", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Firma en reportes PDF", included: true },
            { icon: Headset, title: "SOPORTE PRIORITARIO", desc: "Canal prioritario", included: false },
            { icon: Palette, title: "WHITE LABEL", desc: "Sin marcas de agua", included: false },
            { icon: ShieldCheck, title: "AUDIT READY", desc: "Trazabilidad inmutable", included: false },
        ],
        cta: "Comenzar",
        note: null,
        dualCta: false,
    },

    /* ─── 4. MAX (antes The Site Manager; ⭐ FEATURED) ──────── */
    {
        id: "site-manager",
        planKey: "manager",
        title: "MAX",
        subtitle: "El estándar para Constructores y PyMES.",
        priceMonthly: "3,899",
        priceAnnual: "3,199",
        annualTotal: "38,388",
        priceSuffix: "MXN / mes",
        accentColor: `${GOLD}55`,   // low-opacity border — elegant, not neon
        glowColor: `rgba(197,168,128,0.14)`,
        checkColor: `${GOLD}CC`,
        featured: true,
        isNew: false,
        image: assetPath("/images/sitemanager.webp"),
        imageFilter: null,
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "10 obras simultáneas", included: true },
            { icon: Layers, title: "FRENTES", desc: "Múltiples frentes y zonas", included: true },
            { icon: Users, title: "USUARIOS", desc: "3 usuarios", included: true },
            { icon: Gauge, title: "SIN LÍMITE DIARIO", desc: "Usa la app sin tope por día", included: true },

            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma con avance real", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Firma en reportes PDF", included: true },
            { icon: Headset, title: "SOPORTE PRIORITARIO", desc: "Canal prioritario", included: true },
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

    /* ─── 5. ULTRA (antes Executive Plan) ───────────────────── */
    {
        id: "executive",
        planKey: "executive",
        title: "ULTRA",
        subtitle: "Control total y escala ilimitada.",
        priceMonthly: "12,999",
        priceAnnual: "10,399",
        annualTotal: "124,788",
        priceSuffix: "MXN / mes",
        accentColor: `${PURPLE}90`,
        glowColor: `${PURPLE}14`,
        checkColor: PURPLE,
        featured: false,
        isNew: false,
        image: assetPath("/images/executive_plan.webp"),
        imageFilter: null,
        features: [
            { icon: Building2, title: "OBRAS ACTIVAS", desc: "Panel Multi-Empresa Global", included: true },
            { icon: Layers, title: "FRENTES", desc: "Gobernanza y Permisos", included: true },
            { icon: Users, title: "USUARIOS", desc: "Usuarios ilimitados", included: true },
            { icon: Gauge, title: "SIN LÍMITE DIARIO", desc: "Usa la app sin tope por día", included: true },

            { icon: FileText, title: "SMART LOG", desc: "Bitácora inteligente", included: true },
            { icon: CalendarDays, title: "SMART CALENDAR", desc: "Cronograma con avance real", included: true },
            { icon: Table, title: "SMART CONCEPTS", desc: "Catálogo con IA", included: true },
            { icon: Box, title: "SMART BIM SYNC", desc: "Ecosistema conectado", included: true },
            { icon: PenTool, title: "FIRMAS DIGITALES", desc: "Firma en reportes PDF", included: true },
            { icon: Headset, title: "SOPORTE PRIORITARIO", desc: "Atención dedicada", included: true },
            { icon: Palette, title: "WHITE LABEL", desc: "Tu logo y nombre en los PDF", included: true },
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
    "SIN LÍMITE DIARIO": "Usar la app todos los días sin un tope por día.",
    "SMART LOG": "Interfaz central de bitácoras y registros.",
    "SMART CALENDAR": "Diagramas de Gantt impulsados por IA.",
    "SMART CONCEPTS": "Catálogo inteligente de construcción.",
    "SMART BIM SYNC": "Catálogo y cronograma conectados: el avance que confirmas actualiza lo ejecutado.",
    "FIRMAS DIGITALES": "Firma tus reportes desde la app.",
    "SOPORTE PRIORITARIO": "Atención técnica con prioridad.",
    "WHITE LABEL": "Tu logo y el nombre de tu empresa en los documentos.",
    "AUDIT READY": "Registro inmutable de cambios: quién, qué y cuándo."
};

/* ── PLAN CARD ──
   JC 2026-10-26: mismo lenguaje que el hero. Vidrio tenue con borde fino en vez de
   bloques grises; un solo botón relleno (crema) en el plan recomendado y contorno
   (.auth-field) en los demás; precio limpio y lo incluido en filas alineadas a la
   izquierda, con lo que no incluye atenuado y dicho. Los datos no cambian. */
const CREMA = "#f5f0e8";
const TINTA = "#1a120c";

/* Fondo opaco de la cabecera fija: el color de la parte alta de la tarjeta
   (vidrio sobre #060302), para que las filas no se vean pasar por debajo. */
const CABECERA_FIJA = "#110e0d";
const CABECERA_FIJA_RECOMENDADO = "#19120c";

const PlanCard = React.memo(function PlanCard({ plan, index, isAnnual }: { plan: typeof PLANS[number]; index: number; isAnnual: boolean }) {
    const [hovered, setHovered] = useState(false);
    /* El ciclo viaja con el enlace: lo que marque el conmutador Mensual/Anual
       de la sección es lo que la app llevará al pago. */
    const billing: BillingCycle = isAnnual ? "annual" : "monthly";
    const conDescuento = isAnnual && plan.id !== "draft";

    return (
        <div className="relative h-full pt-4">
            {/* Recomendado — fuera de la tarjeta, montado sobre el borde */}
            {plan.featured && (
                <div
                    className="absolute left-1/2 top-[5px] z-20 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 font-sans text-[11px] font-semibold leading-none"
                    style={{ background: CABECERA_FIJA_RECOMENDADO, border: `1px solid ${BRONZE}66`, color: BRONZE }}
                >
                    Recomendado
                </div>
            )}

            {/* Nuevo (Plus, 2026-11-13) — mismo lugar que "Recomendado", en coral con
                un fondo tenue para que llame la atención (Luis 2026-11-13). */}
            {plan.isNew && (
                <div
                    className="absolute left-1/2 top-[5px] z-20 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 font-sans text-[11px] font-semibold leading-none"
                    style={{ background: `color-mix(in srgb, ${CORAL} 14%, ${CABECERA_FIJA})`, border: `1px solid ${CORAL}99`, color: CORAL }}
                >
                    Nuevo
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
                className="relative flex h-full flex-col rounded-2xl p-6 font-sans"
                style={{
                    background: plan.featured
                        ? `linear-gradient(180deg, ${BRONZE}1a 0%, ${BRONZE}08 40%, rgba(255,255,255,0.015) 100%)`
                        : "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
                    border: `1px solid ${plan.featured ? `${BRONZE}59` : hovered ? "rgba(245,240,232,0.18)" : "rgba(245,240,232,0.08)"}`,
                    boxShadow: plan.featured
                        ? `0 30px 80px -36px ${BRONZE}55`
                        : hovered ? "0 24px 60px -28px rgba(0,0,0,0.9)" : "none",
                    transform: hovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                }}
            >
                {/* Ilustración del plan, al fondo y desvanecida hacia arriba */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 z-0 h-48 max-h-[70%] w-full overflow-hidden rounded-b-2xl mix-blend-normal md:mix-blend-screen"
                    style={{
                        maskImage: "linear-gradient(to top, white 30%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to top, white 30%, transparent 100%)",
                        opacity: 0.3,
                        transform: "translateZ(0)",
                    }}
                >
                    <Image
                        src={plan.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                        className="object-cover object-bottom"
                        style={plan.imageFilter ? { filter: plan.imageFilter } : undefined}
                    />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                    {/* CABECERA (nombre, precio y botón): fija en escritorio para comparar
                        filas sin perder de qué plan es cada una. top-14 = alto exacto de la
                        barra delgada (56 px, con su borde): ni la tapa ni deja rendija. En
                        móvil es estática para evitar saltos al desplazar. En Plus el
                        pb-6 lo ocupa el enlace "o empieza gratis". */}
                    <div
                        className={`relative z-30 -mx-6 -mt-6 rounded-t-2xl px-6 pt-6 md:sticky md:top-14 ${plan.planKey === "plus" ? "pb-0" : "pb-6"}`}
                        style={{
                            backgroundColor: plan.featured ? CABECERA_FIJA_RECOMENDADO : CABECERA_FIJA,
                            borderBottom: "1px solid rgba(245,240,232,0.06)",
                        }}
                    >
                        <h3 className="font-display text-[15px] font-extrabold uppercase leading-tight tracking-tight" style={{ color: CREMA }}>
                            {plan.title}
                        </h3>
                        {/* Frase del plan: el mismo alto mínimo (dos renglones) en las cinco
                            tarjetas para que precios, botones y filas sigan alineados. */}
                        <p className="mt-1 min-h-[2.6em] text-[12px] leading-snug text-white/45 line-clamp-2">{plan.subtitle}</p>

                        {/* Precio: el anterior tachado arriba (reserva su alto aunque no
                            aparezca, para que los cinco precios queden en la misma línea). */}
                        <div className="mt-4">
                            <p className="h-4 text-[12px] leading-none text-white/30 line-through decoration-white/30">
                                {conDescuento ? `$${plan.priceMonthly}` : null}
                            </p>
                            <p className="flex items-baseline gap-1.5">
                                <span className="text-[32px] font-semibold leading-none tracking-tight" style={{ color: CREMA }}>
                                    ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                                </span>
                                <span className="text-[12px] text-white/45">{plan.priceSuffix}</span>
                            </p>
                            {/* "Precio sin IVA" (2026-11-22): los enlaces de pago de Mercado Pago ya
                                cobran el 16 %; la marca evita la sorpresa al pagar. En Draft el renglón
                                queda vacío pero reserva su alto, para que las cinco tarjetas sigan
                                alineadas. */}
                            <p className="mt-1.5 h-4 text-[11px] leading-4 text-white/40">
                                {plan.id !== "draft" ? "Precio sin IVA" : null}
                            </p>
                            <p className="mt-0.5 h-4 text-[11.5px] text-white/40">
                                {conDescuento ? (
                                    <>Facturado <span className="text-white/70">${plan.annualTotal}</span> al año</>
                                ) : null}
                            </p>
                        </div>

                        {/* CTA — "Empezar Gratis" y los "Comenzar" abren el alta en la
                            app con el plan y el ciclo ya elegidos; "Contactar" y el
                            "Comenzar" de Plus van a la encuesta de /registro, que es
                            ventas. Los de la app son <a> y no <Link> porque cruzan de
                            origen: misma pestaña, sin prefetch.
                            Un solo botón relleno en toda la fila: el del recomendado. */}
                        <div className="mt-5">
                            {plan.planKey === "plus" ? (
                                /* Plus todavía no existe en la app: mandar al alta con
                                   plan=plus caería en un alta sin plan. El botón lleva al
                                   formulario con Plus y el ciclo ya marcados y, debajo,
                                   la salida al plan gratis. El renglón del enlace (mt-1 +
                                   h-5 = 24 px) ocupa lo que en las demás tarjetas es el
                                   pb-6 de la cabecera (ver abajo): así los cinco botones y
                                   las filas de abajo siguen a la misma altura. */
                                <>
                                    <Link
                                        href={solicitudPlanUrl("plus", billing)}
                                        className="auth-field flex w-full items-center justify-center text-center text-[14px] font-medium"
                                        style={{ height: 44 }}
                                    >
                                        {plan.cta}
                                    </Link>
                                    <div className="mt-1 flex h-5 items-center justify-center">
                                        <a
                                            href={registerUrl("draft")}
                                            rel="noopener"
                                            className="px-2 py-1 text-[12px] leading-none text-white/55 underline-offset-4 transition-colors duration-200 hover:text-white/90 hover:underline"
                                        >
                                            o empieza gratis
                                        </a>
                                    </div>
                                </>
                            ) : plan.dualCta ? (
                                <div className="flex gap-2">
                                    <a
                                        href={registerUrl(plan.planKey, billing)}
                                        rel="noopener"
                                        className="auth-field flex flex-1 items-center justify-center text-center text-[14px] font-medium"
                                        style={{ height: 44 }}
                                    >
                                        Comenzar
                                    </a>
                                    <Link
                                        href="/registro"
                                        className="auth-field flex flex-1 items-center justify-center text-center text-[14px] font-medium"
                                        style={{ height: 44 }}
                                    >
                                        Contactar
                                    </Link>
                                </div>
                            ) : plan.featured ? (
                                <a
                                    href={registerUrl(plan.planKey, billing)}
                                    rel="noopener"
                                    className="flex h-11 w-full items-center justify-center rounded-xl text-center text-[14px] font-semibold transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060302]"
                                    style={{ backgroundColor: CREMA, color: TINTA }}
                                >
                                    {plan.cta}
                                </a>
                            ) : (
                                <a
                                    href={registerUrl(plan.planKey, billing)}
                                    rel="noopener"
                                    className="auth-field flex w-full items-center justify-center text-center text-[14px] font-medium"
                                    style={{ height: 44 }}
                                >
                                    {plan.cta}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Lo que incluye: una fila por concepto, a la izquierda. Mismo alto
                        mínimo en las cinco tarjetas para comparar fila contra fila. Con
                        las cinco en fila (xl) las columnas son angostas y una frase
                        que ocupa dos renglones descuadraba las filas de esa tarjeta:
                        el mínimo sube para que quepan dos renglones de frase. */}
                    <ul className="mb-6 mt-2 flex flex-col divide-y divide-white/[0.06]">
                        {plan.features.map((f, idx) => (
                            <li key={idx} className={`flex min-h-[88px] gap-3 py-4 xl:min-h-[124px] ${f.included ? "" : "opacity-45"}`}>
                                <f.icon
                                    size={18}
                                    strokeWidth={1.6}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: f.included ? plan.checkColor : "rgba(255,255,255,0.35)" }}
                                />
                                <div className="min-w-0">
                                    <p className="flex flex-wrap items-baseline gap-x-2 font-ui text-[13px] uppercase leading-none tracking-[0.16em] text-white/85">
                                        {f.title}
                                        {!f.included && (
                                            <span className="font-sans text-[11px] normal-case tracking-normal text-white/55">No incluido</span>
                                        )}
                                    </p>
                                    <p className="mt-1.5 text-[13px] leading-snug text-white/75">{f.desc}</p>
                                    <p className="mt-1 text-[11.5px] leading-snug text-white/35">{FEATURE_EXPLANATIONS[f.title]}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Licencia única ("los alcances de Max") — solo en Max, al pie */}
                    {plan.note && (
                        <div
                            className="relative z-20 mb-2 mt-auto rounded-xl p-4"
                            style={{ background: `${BRONZE}0f`, border: `1px solid ${BRONZE}33` }}
                        >
                            <p className="font-ui text-[12px] uppercase leading-none tracking-[0.2em] text-white/40">{plan.note.label}</p>
                            <p className="mt-2 font-ui text-[14px] uppercase leading-none tracking-[0.16em]" style={{ color: BRONZE }}>
                                {plan.note.pill}
                            </p>
                            <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">{plan.note.detail}</p>
                            {/* La licencia también se compra sola: alta en la app con
                                plan=project_license (pago único, sin ciclo). */}
                            <a
                                href={registerUrl("project_license")}
                                rel="noopener"
                                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#c39767] underline-offset-4 transition-colors duration-200 hover:text-[#d9b088] hover:underline"
                            >
                                Comprar licencia
                                <ArrowRight size={13} strokeWidth={2} />
                            </a>
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
            className="w-full flex flex-col md:min-h-screen md:justify-center shrink-0 relative overflow-x-clip scroll-mt-24"
            style={{
                // Mismo negro cálido del hero (HeroLiquidGlass), sin línea arriba:
                // hero y planes se leen como una sola superficie (JC 2026-10-26).
                backgroundColor: "#060302",
                isolation: "isolate",
            }}
        >
            {/* Ambient glow. Sin el halo dorado pegado arriba: marcaba la orilla
                con el hero. */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(ellipse 35% 25% at 85% 65%, ${PURPLE}06, transparent 70%)`,
                }}
            />

            {/* w-full es la defensa: sin ancho explícito, mx-auto dentro de un
                flex-col hace que el contenedor se mida por su contenido. Si algo
                vuelve a ser más ancho que la pantalla, se saldrá ESE elemento —y
                overflow-x-clip lo recorta— pero el resto seguirá centrado. */}
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-12 xl:max-w-[88rem] xl:px-8">

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
                        {/* JC 2026-09-25: mismo valor que el sobre-título de reseñas (AA sobre #080808). */}
                        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: `${BRONZE}D9` }}>
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
                    <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-white/45">
                        Desde estudiantes hasta constructoras. El nivel exacto para tu escala.
                    </p>
                </motion.div>

                {/* Toggle Switch — JC 2026-10-26: como los botones del hero. Contorno
                    fino y la opción activa en crema (el botón relleno de la página). */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-14 flex justify-center"
                >
                    {/* Los botones se miden por su texto (padding), no con anchos
                        fijos: con w-32 + w-56 el conmutador pedía 362px y en un
                        celular de 375 no cabía. Como el contenedor de la sección
                        lleva mx-auto dentro de un flex-col, ese ancho mínimo lo
                        dimensionaba por contenido y descentraba TODA la sección. */}
                    <div
                        className="relative flex items-center rounded-xl p-1 font-sans"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,240,232,0.12)" }}
                    >
                        {/* Botón Mensual */}
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`relative whitespace-nowrap rounded-lg px-6 py-2.5 text-[14px] font-semibold transition-colors duration-300 sm:px-9 ${!isAnnual ? "text-[#1a120c]" : "text-white/55 hover:text-white/85"}`}
                        >
                            {/* La pastilla vive DENTRO del botón activo y viaja con
                                layoutId: siempre mide lo que mide el botón, sin rems
                                fijos que resincronizar en cada breakpoint. */}
                            {!isAnnual && (
                                <motion.span
                                    layoutId="planes-toggle-pill"
                                    className="absolute inset-0 rounded-lg"
                                    style={{ background: "#f5f0e8" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">Mensual</span>
                        </button>

                        {/* Botón Anual */}
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`relative flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-colors duration-300 sm:px-6 ${isAnnual ? "text-[#1a120c]" : "text-white/55 hover:text-white/85"}`}
                        >
                            {isAnnual && (
                                <motion.span
                                    layoutId="planes-toggle-pill"
                                    className="absolute inset-0 rounded-lg"
                                    style={{ background: "#f5f0e8" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">Anual</span>
                            <span
                                className="relative z-10 inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold"
                                style={{
                                    background: isAnnual ? "rgba(140,105,54,0.14)" : "transparent",
                                    color: isAnnual ? "#7a5a2c" : BRONZE,
                                    border: `1px solid ${isAnnual ? "rgba(140,105,54,0.35)" : `${BRONZE}4d`}`,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {/* En pantallas chicas la etiqueta larga es lo que más
                                    ensancha el conmutador: se acorta, no se recorta. */}
                                <span className="sm:hidden">2 meses</span>
                                <span className="hidden sm:inline">2 meses gratis</span>
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Rejilla de cinco tarjetas (2026-11-13, llega Plus): 1 columna en
                    celular, 2 en tableta, 3 + 2 en laptop y las cinco en fila desde
                    1280 px, donde el contenedor se ensancha (xl:max-w / xl:px)
                    para que ninguna tarjeta quede aplastada. */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                    className="mt-10 text-center text-[12px] text-white/35"
                >
                    Todos los precios en MXN · IVA no incluido · Pago por transferencia o Mercado Pago · Sin permanencia
                </motion.p>
            </div>
        </section>
    );
}
