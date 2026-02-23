"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Facebook, Instagram, Linkedin, ArrowRight, X } from "lucide-react";
import Image from "next/image";

/* ══════════════════════════════════════════════════════════════
   FooterSection — Contacto y Legal (con Modales)
   ──────────────────────────────────────────────────────────────
   Dark mode, ultra-premium corporativo. Amplio padding, grid
   responsive y modales integrados para contenido legal.
   ══════════════════════════════════════════════════════════════ */

const BRONZE = "#C39767";

type LegalDocument = "faq" | "terms" | "privacy" | null;

const LEGAL_CONTENT = {
    faq: {
        title: "Preguntas Frecuentes",
        body: (
            <div className="space-y-6 text-[13px] leading-relaxed text-white/70">
                <div>
                    <h5 className="font-bold text-white mb-1">¿Qué es BitacorIA y cómo beneficia a mi constructora?</h5>
                    <p>BitacorIA es la primera plataforma de gestión inteligente diseñada específicamente para el sector de la construcción en América Latina. Moderniza el control de obra tradicional reemplazando el papel por procesos digitales ágiles, integrando firma electrónica avanzada (respaldada por la NOM-151) y procesamiento de lenguaje natural (IA) para detectar anomalías antes de que cuesten dinero.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Mi información de obra está segura y es legalmente vinculante?</h5>
                    <p>Absolutamente. Toda la información, desde los reportes fotográficos hasta los presupuestos, está encriptada de extremo a extremo y alojada en servidores con redundancia geográfica. Las bitácoras firmadas digitalmente tienen pleno sustento legal en México de acuerdo a la Ley de Firma Electrónica Avanzada y la NOM-151, generando sellos de tiempo y constancias de conservación irrefutables ante peritajes.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Cómo funciona la lectura predictiva de la Inteligencia Artificial?</h5>
                    <p>Nuestra IA, conocida como &quot;Smart Concepts&quot;, lee diariamente las entradas de los residentes de obra. Su base de conocimiento está entrenada con miles de parámetros de construcción. Es capaz de correlacionar retrasos en suministros climáticos con la ruta crítica del cronograma, y enviar alertas automáticas a los directores de proyecto si detecta patrones de riesgo (ej. vaciados de concreto fuera de norma). El usuario controla qué nivel de intervención tiene la IA.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Puedo invitar a subcontratistas y al cliente final a la misma bitácora?</h5>
                    <p>Sí. Nuestra arquitectura &quot;Team Work&quot; permite establecer roles granulares. El residente (constructor) captura la información bruta, el supervisor la valida, y el cliente puede tener un rol de solo lectura (View-Only) para dar seguimiento visual sin poder alterar los reportes, manteniendo la transparencia total del proyecto.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿De qué trata el protocolo &quot;Smart BIM Sync&quot;?</h5>
                    <p>Smart BIM Sync es nuestro protocolo insignia para empresas avanzadas. Permite enlazar las entradas de la bitácora física directamente con elementos de modelos 3D (Revit, Navisworks o IFC). Si se reporta una desviación estructural en campo, el modelo digital se actualiza visualmente en rojo para los coordinadores VDC en la oficina, acortando la brecha entre el modelo teórico y la realidad construida.</p>
                </div>
                <div>
                    <h5 className="font-bold text-white mb-1">¿Qué pasa con mis datos si decido cancelar la suscripción?</h5>
                    <p>Tu información te pertenece. Contamos con un protocolo de &quot;Offboarding Seguro&quot;. Tras la cancelación, tienes 30 días para descargar toda tu base de datos y un empaquetado final de todas las bitácoras en formato PDF con sus respectivos sellos criptográficos. Pasado este periodo de gracia, los datos son purgados permanentemente de nuestros servidores corporativos.</p>
                </div>
            </div>
        ),
    },
    terms: {
        title: "Términos y Condiciones",
        body: (
            <div className="space-y-6 text-[13px] leading-relaxed text-white/70">
                <p><strong className="text-white">Última actualización:</strong> Octubre 2026</p>
                <p>Bienvenido a BitacorIA (&quot;La Plataforma&quot;). Estos Términos y Condiciones (&quot;Términos&quot;) constituyen un contrato legalmente vinculante entre el usuario (y su empresa constructora) y Moltbook S.A.P.I de C.V., desarrolladora de BitacorIA. Al crear una cuenta, usted declara tener la autoridad legal para comprometer a la entidad que representa. Si no acepta estos Términos, abandone el uso de la Plataforma inmediatamente.</p>

                <div>
                    <h5 className="font-bold text-white mb-1">1. Objeto del Servicio y Licenciamiento</h5>
                    <p>Moltbook otorga al cliente una licencia limitada, no exclusiva, intransferible y revocable, bajo la modalidad de Software como Servicio (SaaS), para acceder remotamente a la plataforma BitacorIA y utilizar sus herramientas de administración, captura fotográfica estructural, bitácoras normativas e integración BIM, exclusivamente para la duración de su plan de facturación activo.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">2. Disposiciones de Firmas Electrónicas (NOM-151)</h5>
                    <p>La Plataforma proporciona infraestructura técnica e integraciones API con Proveedores de Certificación Autorizados (PSC) en México para generar sellos de tiempo y recabar Firmas Electrónicas Avanzadas (FIEL/e.firma). El cliente asume total responsabilidad sobre el resguardo de sus claves privadas y la designación formal (ante notario si aplica) de los residentes de obra autorizados a asentar firmas. BitacorIA no actúa como perito ni certificador directo.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">3. Confidencialidad y Propiedad Intelectual</h5>
                    <p>Toda la información capturada por el cliente (planos, presupuestos, manuales) sigue siendo de su absoluta y exclusiva propiedad. BitacorIA solo obtiene el derecho de procesarlos temporalmente para garantizar la operatividad funcional de la Plataforma. Por nuestra parte, el código fuente, la lógica algorítmica de la Inteligencia Artificial (Smart Concepts), el diseño de interfaz y la marca BitacorIA están protegidos bajo normas internacionales de propiedad intelectual y no pueden ser decodificados bajo ningún motivo por usuarios ni terceros.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">4. Garantías de Disponibilidad (SLA)</h5>
                    <p>Nos comprometemos, dentro del marco tecnológico posible, a un &quot;uptime&quot; del 99.5% estandarizado, en servidores dedicados. No obstante, al tratarse de herramientas operativas en la nube que dependen de las redes de los operadores de internet local y del clima de obra, la empresa desarrolladora queda indemne respecto a demoras en cargas cuando esto dependa de agentes o compañías de conectividad externas.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">5. Usos Prohibidos y Suspensión de Cuentas</h5>
                    <p>El cliente se abstendrá de (a) aplicar ingeniería inversa, manipular o atacar los protocolos criptográficos de la plataforma; (b) proporcionar contraseñas o compartir asientos adquiridos a empresas que no estén dentro de su holding; (c) usar el servicio para subir datos clasificados que caigan en prohibiciones de seguridad nacional. Cualquier infracción da el derecho a Moltbook a la suspensión unilateral o cierre sistemático del proyecto infractor remitiendo notificación oportuna.</p>
                </div>
            </div>
        ),
    },
    privacy: {
        title: "Aviso de Privacidad",
        body: (
            <div className="space-y-6 text-[13px] leading-relaxed text-white/70">
                <p><strong className="text-white">Última actualización:</strong> Octubre 2026</p>
                <p>En cumplimiento a lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (en adelante, &quot;La Ley&quot;) y su Reglamento, BitacorIA (&quot;Nosotros&quot;, Moltbook S.A.P.I. de C.V.) hace de su conocimiento la presente normativa sobre cómo es tratada, protegida y almacenada su información como contratista, residente o supervisor de obra al operar en nuestra infraestructura global.</p>

                <div>
                    <h5 className="font-bold text-white mb-1">I. Datos que Recabamos</h5>
                    <p>Para la plena ejecución del aplicativo constructivo, recabamos los siguientes datos personales y corporativos: (a) Datos de Identificación (Nombre completo, CURP, RFC de representantes legales para contratos), (b) Datos de Contacto (correos electrónicos, extensiones telefónicas de control), (c) Credenciales de Autenticación, (d) Datos Biométricos, exclusivamente huellas dactilares si su corporativo adopta controles de acceso con terminales en terreno operados internamente; y (e) Posición de geolocalización de las entradas fotográficas realizadas vía aplicación móvil en obra remota, para auditar la ejecución de trabajos in-situ.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">II. Finalidades del Tratamiento</h5>
                    <p>Los datos arriba mencionados son catalogados de tratamiento primario y necesarios para la obligación y existencia del servicio de BitacorIA; utilizados específicamente para: habilitar acceso al dashboard administrativo, facturación y cobro automático, envío de notificaciones de desviación estructural y retrasos, auditorías internas del flujo de construcción y correlaciones criptográficas en casos de arbitraje legar con sus propios clientes o instancias gubernamentales.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">III. Tratamiento Interno por Inteligencia Artificial</h5>
                    <p>Los reportes de progreso (&quot;smart concepts&quot;) creados por los usuarios pasan por canalizaciones encriptadas de procesamiento de lenguaje natural de nuestra Inteligencia Artificial, que asiste buscando discrepancias (como faltantes de volúmenes de concreto o acero contra nómina). Estos motores LLMs son instancias internas, en contenedores privados &quot;Zero-Trust&quot;; ninguna IA externa de terceros está entrenando sus redes públicas a expensas de la propiedad intelectual ni de los parámetros privados de su empresa.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">IV. Transferencias a Terceros</h5>
                    <p>Solo bajo obligación procesal dictaminada y con orden ejecutoria BitacorIA transferirá paquetes de archivos al Poder Judicial de la Federación o fiscalías competentes. Asimismo, para el cumplimiento técnico (facturación y notariado digital) trabajaremos con PACs y Prestadores de Certificación avalados bajo convenio riguroso de no diseminación.</p>
                </div>

                <div>
                    <h5 className="font-bold text-white mb-1">V. Ejercicio de los Derechos ARCO</h5>
                    <p>Usted, o quien funja como Delegado de Privacidad dentro de la empresa cliente, tendrá siempre el derecho al Acceso, Rectificación, Cancelación u Oposición del manejo de estos datos (solicitando portabilidad total si fuera el caso). Deberá iniciar contacto formal con el oficial de datos de BitacorIA apuntando al buzón administrativo en `privacidad@bitacoria.com`, presentando evidencia documentaria legal representativa para que la solicitud surta efecto en no más de veinte días hábiles.</p>
                </div>
            </div>
        ),
    },
};

export default function FooterSection() {
    const [activeModal, setActiveModal] = useState<LegalDocument>(null);

    // Scroll lock implementation correctly placed inside useEffect
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Grab current html/body attributes if we were tracking strict resets,
        // but for standard scrolling with Lenis, overflow hidden on body is sufficient
        if (activeModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        // Cleanup on unmount or on modal change
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [activeModal]);

    return (
        <section
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
                                src="/plataforma/images/LOGO-BITACORIA-IMPI-TRANSPARENTE-PNG-01.webp"
                                alt="BitacorIA"
                                width={240}
                                height={96}
                                className="h-24 w-auto object-contain object-left opacity-90"
                            />
                        </div>
                        <p className="mb-6 text-[13px] leading-relaxed text-white/40">
                            Suscríbete para recibir actualizaciones de la plataforma.
                        </p>

                        {/* Newsletter Input */}
                        <form className="relative flex w-full max-w-sm items-center" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full rounded-xl bg-white/5 py-3 pl-4 pr-12 text-[13px] text-white/90 placeholder-white/30 outline-none transition-colors focus:bg-white/[0.07] focus:ring-1 focus:ring-[#C39767]/50"
                                style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
                            />
                            <button
                                type="submit"
                                aria-label="Suscribirse"
                                className="absolute right-1.5 top-1.5 bottom-1.5 flex w-9 items-center justify-center rounded-lg bg-white/10 text-white/50 transition-colors hover:bg-[#C39767]/20 hover:text-[#e8b97a]"
                            >
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>

                    {/* 2. Columna de Contacto */}
                    <div className="flex flex-col">
                        <h4 className="mb-6 font-display text-xs font-bold uppercase tracking-widest text-[#C39767]">
                            Contacto
                        </h4>
                        <ul className="flex flex-col gap-4 text-[13px] text-white/60">
                            <li>
                                <a
                                    href="mailto:contacto@bitacoria.com"
                                    className="transition-colors hover:text-[#e8b97a]"
                                >
                                    contacto@bitacoria.com
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
                            <a
                                href="#"
                                aria-label="LinkedIn"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all duration-300 hover:border-[#C39767]/40 hover:bg-[#C39767]/10 hover:text-[#e8b97a]"
                            >
                                <Linkedin size={15} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* 3. Columna Legal / Soporte */}
                    <div className="flex flex-col">
                        <h4 className="mb-6 font-display text-xs font-bold uppercase tracking-widest text-[#C39767]">
                            Legal & Soporte
                        </h4>
                        <ul className="flex flex-col gap-4 text-[13px] text-white/50 items-start">
                            <li>
                                <button
                                    onClick={() => setActiveModal("faq")}
                                    className="transition-colors hover:text-white"
                                >
                                    Preguntas Frecuentes (FAQ)
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveModal("terms")}
                                    className="transition-colors hover:text-white"
                                >
                                    Términos y Condiciones
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveModal("privacy")}
                                    className="transition-colors hover:text-white"
                                >
                                    Aviso de Privacidad
                                </button>
                            </li>
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
                        © 2026 BitacorIA S.A.S. Todos los derechos reservados.
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/20">
                        Diseñado con <span className="text-[#C39767]/50">♥</span> en México
                    </p>
                </div>
            </div>

            {/* ── MODALES LEGALES (Portal virtual dentro del layout) ── */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                        }}
                        onClick={() => setActiveModal(null)}
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative flex w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#0c0604] shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
                            style={{
                                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px rgba(0,0,0,0.5)",
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 shrink-0">
                                <h3 className="font-display text-lg font-bold tracking-wide text-white">
                                    {LEGAL_CONTENT[activeModal].title}
                                </h3>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white flex-shrink-0"
                                    aria-label="Cerrar modal"
                                >
                                    <X size={16} strokeWidth={2} />
                                </button>
                            </div>

                            {/* Scrollable Body - FIX INSTALLED (max-h restricted) */}
                            <div className="overflow-y-auto px-6 py-8 pb-12 custom-scrollbar max-h-[70vh]">
                                {LEGAL_CONTENT[activeModal].body}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
        </section>
    );
}
