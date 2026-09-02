"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { assetPath } from "@/lib/assetPath";
import { useLenis } from "@/components/ui/LenisProvider";
import { EVENTO_IR_LEGAL, type DocumentoLegal } from "@/lib/eventos";

/* ══════════════════════════════════════════════════════════════
   FooterSection — Contacto y Legal (con Modales)
   ──────────────────────────────────────────────────────────────
   Dark mode, ultra-premium corporativo. Amplio padding, grid
   responsive y modales integrados para contenido legal.
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";

type LegalDocument = DocumentoLegal | null;
type SubscribeStatus = "idle" | "loading" | "success" | "error";

const LEGAL_CONTENT = {
    faq: {
        title: "Preguntas Frecuentes",
        body: (
            <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-white/70">
                <div>
                    <h5 className="font-bold text-white mb-1">¿Qué es BitacorIA y cómo beneficia a mi constructora?</h5>
                    <p>BitacorIA es la primera plataforma de gestión estructurada diseñada específicamente para el sector de la construcción en América Latina. Moderniza el control de obra tradicional reemplazando el papel por procesos digitales ágiles, con flujos de aprobación y firmado diseñados para alinearse a la normativa mexicana (NOM-151), optimizando el tiempo de captura de los residentes de obra.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Mi información de obra está segura?</h5>
                    <p>Sí. Toda la información, desde los reportes fotográficos hasta los presupuestos, viaja y se almacena cifrada en infraestructura en la nube con respaldos automáticos. Nuestros flujos de firmado y conservación de bitácoras están diseñados para alinearse a la Ley de Firma Electrónica Avanzada y a la NOM-151, de modo que tus registros mantengan trazabilidad e integridad verificable.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿BitacorIA utiliza Inteligencia Artificial generativa?</h5>
                    <p>Sí, pero de forma estructurada y guiada, no como un chat abierto de propósito general. El asistente de obra te acompaña en la captura (chatea, adjunta fotos), y tecnologías como &quot;Smart Concepts&quot; funcionan con configuradores guiados que recomiendan los catálogos y conceptos correctos para cada etapa de tu obra. Todo resultado queda en formatos estructurados, editables y validables por ti — la IA propone, tú siempre tienes el control final.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Puedo invitar a subcontratistas y al cliente final a la misma bitácora?</h5>
                    <p>Sí. Nuestra arquitectura &quot;Team Work&quot; permite establecer roles granulares. El residente (constructor) captura la información bruta, el supervisor la valida, y el cliente puede tener un rol de solo lectura (View-Only) para dar seguimiento visual sin poder alterar los reportes, manteniendo la transparencia total del proyecto.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿De qué trata el protocolo &quot;Smart BIM Sync&quot;?</h5>
                    <p>Smart BIM Sync es nuestro ecosistema avanzado de sincronización de proyectos. En lugar de limitarse a modelos 3D, nuestra tecnología conecta el avance físico real de la obra (registrado en la bitácora) directamente con el presupuesto y el cronograma financiero del proyecto. Esto permite a los gerentes de proyecto y supervisores comparar la planeación teórica contra la realidad ejecutada en tiempo récord, evitando sobrecostos y desviaciones de cronograma de forma predictiva.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Qué pasa con mis datos si decido cancelar la suscripción?</h5>
                    <p>Tu información te pertenece. Contamos con un protocolo de &quot;Offboarding Seguro&quot;. Tras la cancelación, tienes 30 días para descargar toda tu base de datos y un empaquetado final de todas las bitácoras en formato PDF con sus respectivos sellos criptográficos. Pasado este periodo de gracia, los datos son purgados permanentemente de nuestros servidores.</p>
                </div>
            </div>
        ),
    },
    terms: {
        title: "Términos y Condiciones",
        body: (
            <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-white/70">
                <div>
                    <p><strong className="text-white">Última actualización:</strong> Junio 2026</p>
                    <p className="mt-2">Bienvenido a BitacorIA (&quot;La Plataforma&quot;). Estos Términos y Condiciones (&quot;Términos&quot;) constituyen un contrato legalmente vinculante entre el usuario (y su empresa constructora) y BitacorIA. Al crear una cuenta, usted declara tener la autoridad legal para comprometer a la entidad que representa. Si no acepta estos Términos, absténgase de utilizar la Plataforma.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">1. Objeto del Servicio y Licenciamiento</h5>
                    <p>BitacorIA otorga al cliente una licencia limitada, no exclusiva, intransferible y revocable, bajo la modalidad de Software como Servicio (SaaS), para acceder a la plataforma y utilizar sus herramientas de administración de obra, control de costos, cronogramas y asistencia por Inteligencia Artificial, exclusivamente para la duración de su plan de facturación activo.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">2. Inteligencia Artificial, Privacidad y Entrenamiento de Modelos</h5>
                    <p>Nuestra plataforma utiliza motores de Inteligencia Artificial para el procesamiento de planos, catálogos en PDF y análisis fotográfico. Toda la información capturada por el cliente sigue siendo de su propiedad. Al utilizar el servicio, el cliente otorga a BitacorIA una licencia técnica para procesar y, de forma anonimizada y agregada, utilizar estos datos con el fin de <strong className="text-white">refinar y mejorar nuestros algoritmos y funciones</strong> (como Smart Concepts y Smart Calendar). Para operar estas funciones podemos apoyarnos en proveedores de servicios de IA e infraestructura en la nube, bajo acuerdos que prohíben el uso de su información para entrenar modelos públicos. Su información confidencial <strong className="text-white">nunca</strong> será vendida a terceros.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">3. Disposiciones de Firmas Electrónicas (NOM-151)</h5>
                    <p>La Plataforma proporciona infraestructura técnica e integraciones para generar sellos de tiempo y recabar Firmas Electrónicas Avanzadas (FIEL/e.firma). El cliente asume total responsabilidad sobre el resguardo de sus claves privadas y la designación formal (ante notario si aplica) de los residentes de obra autorizados a asentar firmas. BitacorIA actúa como proveedor tecnológico, no como perito ni certificador directo.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">4. Disponibilidad del Sistema y Respaldos</h5>
                    <p>BitacorIA se esfuerza por mantener la mayor disponibilidad posible del servicio, sin que ello constituya una garantía contractual de tiempo de actividad. Toda la información y documentos generados en el ecosistema &quot;Smart BIM Sync&quot; cuentan con respaldos en la nube para prevenir pérdida de datos, cuidando que su fuente única de verdad esté disponible.</p>
                </div>
            </div>
        ),
    },
    privacy: {
        title: "Aviso de Privacidad",
        body: (
            <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-white/70">
                <div>
                    <p><strong className="text-white">Última actualización:</strong> Junio 2026</p>
                    <p className="mt-2">En cumplimiento a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, &quot;La Ley&quot;) y su Reglamento, <strong className="text-white">BitacorIA</strong> (&quot;Nosotros&quot; o &quot;La Plataforma&quot;) hace de su conocimiento la presente normativa sobre cómo es tratada, protegida y almacenada su información como contratista, residente, supervisor o director de obra al operar en nuestra infraestructura.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">I. Datos que Recabamos</h5>
                    <p>Para la plena ejecución del aplicativo constructivo, recabamos los siguientes datos personales y corporativos: (a) Datos de Identificación (Nombre completo, cargo, RFC de representantes legales para contratos de suscripción), (b) Datos de Contacto (correos electrónicos institucionales, teléfonos), (c) Credenciales de Autenticación, y (d) <strong className="text-white">Metadatos y Geolocalización</strong>, provenientes exclusivamente de las fotografías y evidencias cargadas a la Bitácora para auditar la ejecución de trabajos in-situ. No recabamos datos biométricos.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">II. Finalidades del Tratamiento</h5>
                    <p>Los datos arriba mencionados son de tratamiento primario y necesarios para la prestación del servicio de BitacorIA. Se utilizan específicamente para: habilitar el acceso al ecosistema &quot;Smart BIM Sync&quot;, facturación y cobro de planes (Draft, Resident, Site Manager, Executive), envío de alertas automáticas sobre desviaciones o retrasos en el cronograma, y la generación de reportes en PDF listos para procesos de auditoría y firma.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">III. Tratamiento por Inteligencia Artificial</h5>
                    <p>La información ingresada a la plataforma (reportes fotográficos, catálogos de conceptos, interacciones en el chat) es procesada por motores de Inteligencia Artificial para automatizar la gestión de obra. Al utilizar BitacorIA, el usuario acepta que estos datos sean utilizados, de forma anonimizada y agregada, para <strong className="text-white">refinar y mejorar nuestros algoritmos y funciones</strong> (Smart Concepts y Smart Calendar). Para estas funciones podemos apoyarnos en proveedores de servicios de IA e infraestructura en la nube, bajo acuerdos que <strong className="text-white">prohíben el uso de su información para entrenar modelos públicos</strong>. Su propiedad intelectual no se vende ni se comparte para fines ajenos a la prestación del servicio.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">IV. Transferencias a Terceros</h5>
                    <p>BitacorIA solo transferirá información bajo obligación procesal dictaminada y con orden ejecutoria a las autoridades competentes. Asimismo, para el cumplimiento técnico y fiscal, podremos trabajar con Proveedores Autorizados de Certificación (PACs) y servicios de sellado de tiempo (NOM-151) bajo estrictos convenios de confidencialidad y no diseminación.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">V. Ejercicio de los Derechos ARCO</h5>
                    <p>Usted, o quien funja como responsable dentro de la empresa cliente, tendrá siempre el derecho al Acceso, Rectificación, Cancelación u Oposición del manejo de estos datos. Deberá iniciar contacto formal con el responsable de datos de BitacorIA escribiendo a <strong className="text-white">bitacoria.temp@gmail.com</strong>, presentando acreditación de identidad o representación legal para que la solicitud sea procesada en los plazos que marca La Ley.</p>
                </div>
            </div>
        ),
    },
};

export default function FooterSection() {
    const [activeModal, setActiveModal] = useState<LegalDocument>(null);
    const lenisRef = useLenis();

    // Enlace legal señalado tras llegar desde el hero (ver efecto más abajo).
    const refsLegal = useRef<Partial<Record<DocumentoLegal, HTMLButtonElement | null>>>({});
    const apagar = useRef<ReturnType<typeof setTimeout> | null>(null);
    const respaldo = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* El modal se monta en <body>: este <footer> lleva isolation:isolate, que
       lo encerraba en un contexto de apilamiento propio a nivel 0 — por debajo
       del hero (z-20) y de la navbar (z-50). Su z-[200] no podía ganar y el
       aviso salía por detrás del video. */
    const [montado, setMontado] = useState(false);
    useEffect(() => setMontado(true), []);

    // ── NEWSLETTER STATE ──
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<SubscribeStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("loading");
        setErrorMessage("");

        // Import perezoso: supabase-js solo se descarga si alguien se suscribe.
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase
            .from("newsletter")
            .insert([{ email: email.trim().toLowerCase() }]);

        if (error) {
            // Postgres unique constraint violation = code 23505
            if (error.code === "23505" || error.message?.includes("duplicate")) {
                setErrorMessage("Este correo ya está registrado.");
            } else {
                setErrorMessage("Hubo un error al suscribirte. Inténtalo de nuevo.");
            }
            setStatus("error");
        } else {
            setEmail("");
            setStatus("success");
        }
    };

    // ── Llegada desde el hero: bajar al enlace y resaltarlo ──
    //    El resalte espera a que termine el scroll; si latiera durante el
    //    viaje, el usuario llegaría cuando ya se apagó. Ver src/lib/eventos.ts.
    useEffect(() => {
        const alPedir = (e: Event) => {
            const doc = (e as CustomEvent<DocumentoLegal>).detail;
            const el = refsLegal.current[doc];
            if (!el) return;

            let yaEncendido = false;
            const encender = () => {
                if (yaEncendido) return;
                yaEncendido = true;
                /* La clase se pone a mano, no por estado: reiniciar una animación
                   CSS exige quitarla, forzar un reflow y volver a ponerla — con
                   estado de React el reinicio depende de rAF, que el navegador
                   congela en pestañas de segundo plano. React no reescribe este
                   className porque su propio valor no cambia entre renders. */
                el.classList.remove("legal-resaltado");
                void el.offsetWidth;
                el.classList.add("legal-resaltado");
                if (apagar.current) clearTimeout(apagar.current);
                apagar.current = setTimeout(() => el.classList.remove("legal-resaltado"), 2100);
            };

            const lenis = lenisRef.current;
            if (lenis) {
                // Centrar el enlace; Lenis recorta al final de la página, que es
                // donde acaba quedando por estar el pie al fondo.
                const offset = -(window.innerHeight - el.offsetHeight) / 2;
                lenis.scrollTo(el, { offset, onComplete: encender });
            } else {
                // Móvil/touch: scroll nativo, sin callback de fin.
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            /* Respaldo: onComplete de Lenis va sobre requestAnimationFrame, que
               el navegador congela si la pestaña pasa a segundo plano a media
               bajada. Sin esto el resalte no llegaría nunca. Se ignora si el
               scroll terminó bien (encender solo actúa una vez). */
            if (respaldo.current) clearTimeout(respaldo.current);
            respaldo.current = setTimeout(encender, 2200);
        };
        window.addEventListener(EVENTO_IR_LEGAL, alPedir);
        return () => {
            window.removeEventListener(EVENTO_IR_LEGAL, alPedir);
            if (apagar.current) clearTimeout(apagar.current);
            if (respaldo.current) clearTimeout(respaldo.current);
        };
    }, [lenisRef]);

    // ── SCROLL LOCK: Freeze Lenis + body overflow when any modal is open ──
    useEffect(() => {
        if (typeof window === "undefined") return;
        // Copy ref to local variable so the cleanup always references the same instance
        const lenis = lenisRef.current;

        if (activeModal) {
            // 1. Stop Lenis so it doesn't swallow wheel/touch events
            lenis?.stop();
            // 2. Also lock native body scroll as a fallback
            document.body.style.overflow = "hidden";
        } else {
            // 1. Re-enable Lenis smooth scrolling
            lenis?.start();
            // 2. Restore native body scroll
            document.body.style.overflow = "unset";
        }

        // Cleanup on unmount or on modal change
        return () => {
            lenis?.start();
            document.body.style.overflow = "unset";
        };
    }, [activeModal, lenisRef]);

    return (
        <footer
            id="contacto"
            className="relative w-full overflow-hidden"
            style={{
                backgroundColor: "#080808", // Slightly darker to anchor the page bottom
                borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                isolation: "isolate",
            }}
        >
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-24">

                {/* ── GRID PRINCIPAL DE 4 COLUMNAS EN DESKTOP ── */}
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

                    {/* 1. Marca y Newsletter */}
                    <div className="flex flex-col">
                        <div className="mb-6 flex items-center">
                            {/* ENLARGED LOGO (changed h-10 to h-24 with dynamic width wrapper) */}
                            <Image
                                src={assetPath("/images/logo-bitacoria.webp")}
                                alt="BitacorIA"
                                width={96}
                                height={96}
                                className="h-24 w-auto object-contain object-left opacity-90"
                            />
                        </div>
                        <p className="mb-6 text-[13px] leading-relaxed text-white/40">
                            Suscríbete para recibir actualizaciones de la plataforma.
                        </p>

                        {/* Newsletter Form */}
                        {status === "success" ? (
                            <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                                <span className="text-green-400 text-lg">✓</span>
                                <p className="text-[13px] text-green-400 font-medium">
                                    ¡Gracias por suscribirte a las actualizaciones!
                                </p>
                            </div>
                        ) : (
                            <div>
                                <form
                                    className="relative flex w-full max-w-sm items-center"
                                    onSubmit={handleSubscribe}
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        required
                                        disabled={status === "loading"}
                                        className="w-full rounded-xl bg-white/5 py-3 pl-4 pr-12 text-[13px] text-white/90 placeholder-white/30 outline-none transition-colors focus:bg-white/[0.07] focus:ring-1 focus:ring-[#C39767]/50 disabled:opacity-50"
                                        style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        aria-label="Suscribirse"
                                        className="absolute right-1.5 top-1.5 bottom-1.5 flex w-9 items-center justify-center rounded-lg bg-white/10 text-white/50 transition-colors hover:bg-[#C39767]/20 hover:text-[#e8b97a] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === "loading" ? (
                                            <svg
                                                className="animate-spin h-3.5 w-3.5 text-white/40"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <ArrowRight size={14} strokeWidth={2.5} />
                                        )}
                                    </button>
                                </form>
                                {status === "error" && (
                                    <p className="mt-2 text-[12px] text-red-400">{errorMessage}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Columna de Contacto */}
                    <div className="flex flex-col">
                        <h4 className="mb-6 font-display text-xs font-bold uppercase tracking-widest text-[#C39767]">
                            Contacto
                        </h4>
                        <ul className="flex flex-col gap-4 text-[13px] text-white/60">
                            <li>
                                <a
                                    href="mailto:bitacoria.temp@gmail.com"
                                    className="transition-colors hover:text-[#e8b97a]"
                                >
                                    bitacoria.temp@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+522712396353"
                                    className="transition-colors hover:text-[#e8b97a]"
                                >
                                    +52 271 239 6353
                                </a>
                            </li>
                            <li className="text-white/40">Sede: México</li>
                        </ul>

                        {/* Redes Sociales */}
                        <div className="mt-8 flex items-center gap-4">
                            <a
                                href="https://www.facebook.com/profile.php?id=61587078702990"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all duration-300 hover:border-[#C39767]/40 hover:bg-[#C39767]/10 hover:text-[#e8b97a]"
                            >
                                <Facebook size={15} strokeWidth={1.5} />
                            </a>
                            <a
                                href="https://www.instagram.com/bitacor_ia/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all duration-300 hover:border-[#C39767]/40 hover:bg-[#C39767]/10 hover:text-[#e8b97a]"
                            >
                                <Instagram size={15} strokeWidth={1.5} />
                            </a>
                            {/* LinkedIn: oculto hasta tener URL real del perfil (href="#" era un enlace muerto) */}
                        </div>
                    </div>

                    {/* 3. Columna Legal / Soporte */}
                    <div className="flex flex-col">
                        <h4 className="mb-6 font-display text-xs font-bold uppercase tracking-widest text-[#C39767]">
                            Legal & Soporte
                        </h4>
                        {/* -mx-2 px-2: el resalte necesita algo de caja alrededor del
                            texto; los márgenes negativos lo compensan para que la
                            columna siga alineada con las demás. */}
                        <ul className="flex flex-col gap-4 text-[13px] text-white/50 items-start">
                            {([
                                { key: "faq", texto: "Preguntas Frecuentes (FAQ)" },
                                { key: "terms", texto: "Términos y Condiciones" },
                                { key: "privacy", texto: "Aviso de Privacidad" },
                            ] as const).map(({ key, texto }) => (
                                <li key={key}>
                                    <button
                                        ref={(el) => { refsLegal.current[key] = el; }}
                                        onClick={() => setActiveModal(key)}
                                        className="-mx-2 rounded-md px-2 py-1 text-left transition-colors hover:text-white"
                                    >
                                        {texto}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Columna de Espacio o extra features (optional balance in 4 cols) */}
                    <div className="flex flex-col justify-between rounded-xl bg-white/[0.02] border border-white/[0.03] p-6 lg:p-8">
                        <div>
                            <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-widest text-white/30">
                                Estado del Sistema
                            </p>
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-20"></span>
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
                                </span>
                                <span className="text-[12px] text-white/60">Todos los sistemas operativos</span>
                            </div>
                        </div>
                        <div className="mt-8">
                            <p className="text-[11px] leading-relaxed text-white/30">
                                Asegurando el futuro de la construcción en la nube, todos los días.
                            </p>
                        </div>
                    </div>

                </div>

                {/* ── FOOTER BOTTOM (Copyright) ── */}
                <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 sm:flex-row">
                    <p className="text-[11px] font-medium tracking-wide text-white/30">
                        © 2026 BitacorIA. Todos los derechos reservados.
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/20">
                        Diseñado con <span className="text-[#C39767]/50">♥</span> en México
                    </p>
                </div>
            </div>

            {/* ── MODALES LEGALES (montados en <body>, ver `montado` arriba) ── */}
            {montado && createPortal(
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        /* z-[200] como los otros modales de la landing: con z-50 la isla
                           flotante (z-[100]) quedaba por encima del aviso. */
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
                        onClick={() => setActiveModal(null)}
                    >
                        {/* 2. VENTANA DEL MODAL (Aquí está la magia del scroll interno) */}
                        {/* DEBE TENER: max-h-[85vh] y overflow-y-auto */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="cream-glass relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:p-10 overscroll-contain"
                            onClick={(e) => e.stopPropagation()}
                            data-lenis-prevent
                        >
                            {/* Botón de cerrar absoluto arriba a la derecha */}
                            <button
                                onClick={() => setActiveModal(null)}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                                aria-label="Cerrar modal"
                            >
                                <X size={16} strokeWidth={2} />
                            </button>

                            {/* Título */}
                            <h3 className="font-display text-xl font-bold tracking-wide text-white mb-6 border-b border-white/10 pb-4">
                                {LEGAL_CONTENT[activeModal].title}
                            </h3>

                            {/* 3. CONTENIDO (Preguntas y respuestas) */}
                            <div className="flex flex-col gap-8 mt-4">
                                {LEGAL_CONTENT[activeModal].body}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body)}

            {/* Simple local style for a clean scrollbar inside the modal */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </footer>
    );
}
