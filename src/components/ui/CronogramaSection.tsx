"use client";

import { motion, type Variants } from "framer-motion";
import { RefreshCw, GanttChartSquare, HardHat } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import DemoPlayer from "./DemoPlayer";

const ACCENT = "#3B82F6";

const FEATURES = [
    { Icon: RefreshCw, title: "Sincronización BIM y Bitácora", body: "Si la bitácora reporta un retraso por lluvia, el cronograma completo recalcula las dependencias automáticamente. Adiós a los Excels rotos." },
    { Icon: GanttChartSquare, title: "Visualización clara", body: "Controla tareas programadas, completadas y retrasadas en una interfaz fluida y moderna que todo tu equipo puede entender de un vistazo." },
    { Icon: HardHat, title: "Staging & Producción", body: "Juega con escenarios en modo 'Borrador' antes de hacer Commit y afectar la línea base de tu obra real." },
];

const fade: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function CronogramaSection() {
    return (
        <section
            id="smart-calendar"
            className="relative w-full overflow-x-clip border-t border-white/5 bg-[#050505] py-24 md:py-32"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-2/3"
                style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${ACCENT}10 0%, transparent 70%)` }}
            />

            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                {/* Header */}
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
                            Smart Calendar
                        </span>
                    </div>
                    <h2
                        className="font-display text-3xl font-extrabold uppercase leading-[1.04] tracking-tight text-white/92 md:text-4xl lg:text-5xl"
                        style={{ textShadow: "0 0 60px rgba(59,130,246,0.09), 0 4px 40px rgba(0,0,0,0.95)" }}
                    >
                        Cronograma <span style={{ color: ACCENT }}>vivo.</span>
                    </h2>
                    <p className="max-w-xl text-[15px] leading-relaxed text-white/45">
                        Gantt inteligente que se ajusta solo.{" "}
                        <span className="font-medium text-white/65">Cuando algo cambia en obra, el calendario lo sabe antes que tú.</span>
                    </p>
                </motion.div>

                {/* Demo real */}
                <motion.div
                    variants={fade}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mt-10 md:mt-12"
                >
                    <DemoPlayer
                        src={assetPath("/videos/demo-calendar.mp4")}
                        poster={assetPath("/videos/demo-calendar-poster.jpg")}
                        label="Smart Calendar"
                        accent={ACCENT}
                    />
                </motion.div>

                {/* Features */}
                <div className="mt-12 grid gap-8 sm:grid-cols-3">
                    {FEATURES.map(({ Icon, title, body }) => (
                        <div key={title} className="flex flex-col gap-3">
                            <span
                                className="flex h-10 w-10 items-center justify-center rounded-full"
                                style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}35` }}
                            >
                                <Icon size={16} style={{ color: ACCENT }} strokeWidth={2.2} />
                            </span>
                            <p className="text-[14px] font-semibold text-white/85">{title}</p>
                            <p className="text-[13px] leading-relaxed text-white/40">{body}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 flex justify-center">
                    <a
                        href="#bim-sync"
                        className="group inline-flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: `${ACCENT}99` }}
                    >
                        Ver siguiente módulo
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
