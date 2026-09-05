"use client";

import { motion, type Variants } from "framer-motion";
import { MessageSquare, Paperclip, FileText } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import DemoPlayer from "./DemoPlayer";

const ACCENT = "#C4A484";

const FEATURES = [
    { Icon: MessageSquare, title: "Habla con tu obra", body: "Escribe o dicta desde campo. La IA redacta el registro técnico por ti al instante." },
    { Icon: Paperclip, title: "Análisis multimodal", body: "Sube fotos o PDFs. El sistema entiende estimaciones y planos automáticamente." },
    { Icon: FileText, title: "Reportes en un clic", body: "Exporta resúmenes diarios estructurados y listos para firma electrónica." },
];

const fade: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function BitacoraSection() {
    return (
        <section
            id="bitacora"
            className="relative w-full overflow-x-clip border-t border-white/5 bg-[#080504] py-24 md:py-32"
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
                            Bitácora
                        </span>
                    </div>
                    <h2
                        className="font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/92 sm:text-4xl md:text-5xl"
                        style={{ textShadow: "0 0 60px rgba(196,164,132,0.09), 0 4px 40px rgba(0,0,0,0.95)" }}
                    >
                        La bitácora que <span style={{ color: ACCENT }}>se escribe sola.</span>
                    </h2>
                    <p className="max-w-xl text-[15px] leading-relaxed text-white/45">
                        Tu asistente de obra disponible 24/7. Olvídate de llenar formatos a mano al final del día; chatea, adjunta fotos y deja que la IA organice tu bitácora.
                    </p>
                </motion.div>

                {/* Demo del módulo */}
                <motion.div
                    variants={fade}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mt-10 md:mt-12"
                >
                    <DemoPlayer
                        src={assetPath("/videos/demo-bitacora.mp4")}
                        poster={assetPath("/videos/demo-bitacora-poster.jpg")}
                        label="Smart Log"
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
                        href="#smart-calendar"
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
