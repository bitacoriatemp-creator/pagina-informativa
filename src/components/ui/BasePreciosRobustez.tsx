"use client";

import { motion, type Variants } from "framer-motion";
import { BadgeCheck, Check } from "lucide-react";
import {
    CIFRAS,
    COMPARATIVA,
    COMPETIDORES,
    DEPENDENCIAS,
    NOTA_COMPARATIVA,
    NOTA_DEPENDENCIAS,
    SIN_DATO,
    VIGENCIA,
} from "@/lib/basePrecios";

/* Bloque "La robustez que necesitas para tu constructora" dentro de Smart
   Concepts (Luis 2026-11-24): las cifras de la base de precios, de qué
   dependencias salen y la comparativa con OPUS y Neodata. Los textos y las
   fuentes viven en lib/basePrecios.ts. Mismo lenguaje visual de la sección:
   fondo negro, verde #00D26A, títulos en Orbitron. */

const ACCENT = "#00D26A";

const fade: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const tarjeta: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function BasePreciosRobustez() {
    return (
        <div className="mt-20 md:mt-28">
            {/* Encabezado */}
            <motion.div
                variants={fade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center"
            >
                <div className="inline-flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${ACCENT}88` }}>
                        Base de precios
                    </span>
                </div>
                <h3
                    className="font-display text-2xl font-extrabold uppercase leading-[1.08] tracking-tight text-white/92 md:text-3xl lg:text-4xl"
                    style={{ textShadow: "0 0 60px rgba(0,210,106,0.09), 0 4px 40px rgba(0,0,0,0.95)" }}
                >
                    La <span style={{ color: ACCENT }}>robustez</span> que necesitas para tu constructora.
                </h3>
                <p className="max-w-xl text-[15px] leading-relaxed text-white/45">
                    Precios oficiales y vigentes: cada uno dice de qué tabulador salió y de qué fecha es.{" "}
                    <span className="font-medium text-white/65">Tu presupuesto se defiende con documentos, no con suposiciones.</span>
                </p>
            </motion.div>

            {/* Cifras */}
            <div className="mt-10 grid grid-cols-2 gap-3 md:mt-12 md:grid-cols-4 md:gap-4">
                {CIFRAS.map((c, i) => (
                    <motion.div
                        key={c.titulo}
                        custom={i}
                        variants={tarjeta}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="flex flex-col rounded-2xl border p-4 md:p-6"
                        style={{
                            borderColor: `${ACCENT}26`,
                            background: `linear-gradient(180deg, ${ACCENT}12 0%, rgba(255,255,255,0.012) 100%)`,
                        }}
                    >
                        <p
                            className="font-display text-[1.45rem] font-extrabold leading-none tabular-nums sm:text-[1.7rem] md:text-4xl"
                            style={{ color: ACCENT, textShadow: `0 0 24px ${ACCENT}40` }}
                        >
                            {c.valor}
                        </p>
                        <p className="mt-3 text-[13px] font-semibold leading-snug text-white/85 md:text-[14px]">{c.titulo}</p>
                        {c.detalle && <p className="mt-1.5 text-[12px] leading-relaxed text-white/40">{c.detalle}</p>}
                    </motion.div>
                ))}
            </div>

            {/* Vigencia */}
            <div className="mt-5 flex justify-center">
                <p
                    className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-center text-[12px] leading-snug text-white/55 md:rounded-full"
                    style={{ borderColor: `${ACCENT}35`, background: `${ACCENT}0D` }}
                >
                    <BadgeCheck size={15} className="shrink-0" style={{ color: ACCENT }} strokeWidth={2.2} aria-hidden="true" />
                    <span>
                        <span className="font-semibold" style={{ color: ACCENT }}>
                            {VIGENCIA.destacado}:
                        </span>{" "}
                        {VIGENCIA.resto}
                    </span>
                </p>
            </div>

            {/* Dependencias: nombres en texto, sin logos */}
            <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">Datos oficiales de</p>
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-8 lg:gap-x-10">
                    {DEPENDENCIAS.map((d) => (
                        <li
                            key={d}
                            className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-white/35 md:text-[15px]"
                        >
                            {d}
                        </li>
                    ))}
                </ul>
                <p className="max-w-xl text-center text-[11px] leading-relaxed text-white/25">{NOTA_DEPENDENCIAS}</p>
            </div>

            {/* Comparativa */}
            <motion.div
                variants={fade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="mx-auto mt-16 max-w-3xl md:mt-20"
            >
                <div className="mb-6 flex flex-col items-center gap-2 text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: `${ACCENT}88` }}>
                        Comparativa
                    </span>
                    <h4 className="font-display text-xl font-extrabold uppercase tracking-tight text-white/90 md:text-2xl">
                        Lo que nos hace distintos
                    </h4>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
                    <table className="w-full table-fixed border-collapse text-left">
                        <caption className="sr-only">Comparativa de la base de precios de BitacorIA con OPUS y Neodata</caption>
                        <colgroup>
                            <col className="w-[37%] md:w-[43%]" />
                            <col />
                            <col />
                            <col />
                        </colgroup>
                        <thead>
                            <tr className="border-b border-white/[0.07]">
                                <th scope="col" className="px-3 py-4 md:px-6">
                                    <span className="sr-only">Concepto</span>
                                </th>
                                <th scope="col" className="px-1.5 py-4 text-center md:px-4" style={{ background: `${ACCENT}12` }}>
                                    <span className="text-[13px] font-bold md:font-display md:text-[15px]" style={{ color: ACCENT }}>
                                        BitacorIA
                                    </span>
                                </th>
                                {COMPETIDORES.map((c) => (
                                    <th
                                        key={c.clave}
                                        scope="col"
                                        className="px-1.5 py-4 text-center text-[13px] font-bold text-white/45 md:px-4 md:font-display md:text-[15px]"
                                    >
                                        {c.nombre}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COMPARATIVA.map((f) => (
                                <tr key={f.concepto} className="border-b border-white/[0.05] last:border-0">
                                    <th
                                        scope="row"
                                        className="px-3 py-4 text-[12px] font-medium leading-snug text-white/75 md:px-6 md:text-[14px]"
                                    >
                                        {f.concepto}
                                    </th>
                                    <td className="px-1.5 py-4 text-center md:px-4" style={{ background: `${ACCENT}0A` }}>
                                        <span
                                            className="inline-flex items-center justify-center gap-1.5 text-[14px] font-extrabold tabular-nums md:font-display md:text-base"
                                            style={{ color: ACCENT }}
                                        >
                                            <Check size={14} strokeWidth={2.6} className="hidden shrink-0 md:inline" aria-hidden="true" />
                                            {f.bitacoria}
                                        </span>
                                    </td>
                                    {COMPETIDORES.map((c) => {
                                        const celda = f.competencia[c.clave];
                                        const vacia = celda.texto === SIN_DATO;
                                        return (
                                            <td
                                                key={c.clave}
                                                className={`px-1.5 py-4 text-center leading-snug md:px-4 ${
                                                    vacia ? "text-[15px] text-white/20" : "text-[12px] text-white/40 md:text-[13px]"
                                                }`}
                                            >
                                                {celda.texto}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mx-auto mt-4 max-w-xl text-center text-[11px] leading-relaxed text-white/30">{NOTA_COMPARATIVA}</p>
            </motion.div>
        </div>
    );
}
