"use client";

import React from "react";
import Image from "next/image";
import { X, Check } from "lucide-react";
import { useThemeVars } from "@/hooks/useThemeVars";

// Helper for basePath support in production
const getImagePath = (path: string) => {
    return process.env.NODE_ENV === "production" ? `/plataforma${path}` : path;
};

interface PlanManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlanManagementModal({ isOpen, onClose }: PlanManagementModalProps) {
    const { mounted } = useThemeVars();

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 sm:p-6 pb-8 sm:pb-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-[1300px] max-h-[90vh] bg-[#050505] border border-white/5 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center relative z-20">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-wide">
                            Actualizar Suscripción
                        </h2>
                        <p className="text-sm text-white/50 mt-1">
                            Selecciona el plan que mejor se adapte a las necesidades de tu equipo y obras.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-10 pt-4 min-h-0" data-lenis-prevent>

                    {/* Grid wrapper */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">

                        {/* 1. DRAFT */}
                        <PlanCard
                            title="DRAFT"
                            subtitle="Para Estudiantes y Pruebas."
                            price="$0"
                            period="MXN"
                            imageSrc={getImagePath("/images/plan_free.webp")}
                            buttonText="Empezar Gratis"
                            features={[
                                { title: "Licencia de Aprendizaje", desc: "Ideal para estudiantes y primeros pasos en la metodología BIM." },
                                { title: "1 Bitácora Activa", desc: "Un slot único para gestionar tu proyecto de prueba." },
                                { title: "Protocolo de Reinicio", desc: "Borra el historial completo para iniciar un proyecto nuevo cuando lo necesites." },
                                { title: "Marca de Agua", desc: "Exportaciones en PDF con el branding oficial de BitacorIA." },
                                { title: "Single User", desc: "Experiencia individual para dominar la plataforma sin distracciones." }
                            ]}
                        />

                        {/* 2. THE RESIDENT */}
                        <PlanCard
                            title="THE RESIDENT"
                            subtitle="Para Arquitectos e Ingenieros Independientes."
                            price="$2,499"
                            period="MXN / MES"
                            imageSrc={getImagePath("/images/plan_theresident.webp")}
                            buttonText="Cámbiate a este Plan"
                            features={[
                                { title: "2 Bitácoras Activas", desc: "Gestiona dos obras de forma simultánea con control total." },
                                { title: "Múltiples Frentes", desc: "Organiza tu obra por zonas, niveles o etapas constructivas." },
                                { title: "Single User Pro", desc: "Acceso exclusivo y centralizado para el ingeniero residente." },
                                { title: "Smart Calendar & Concepts", desc: "Desbloquea la IA predictiva para cronogramas y catálogos de conceptos." },
                                { title: "Reportes Profesionales", desc: "Exportación de PDFs limpios, listos para firmar, sin marcas de agua." }
                            ]}
                        />

                        {/* 3. THE SITE MANAGER */}
                        <PlanCard
                            title="THE SITE MANAGER"
                            subtitle="El estándar para Constructores y PyMES."
                            price="$3,899"
                            period="MXN / mes"
                            imageSrc="/images/sitemanager.webp"
                            buttonText="Comenzar"
                            isRecommended={true}
                            extraContent={
                                <div className="mt-4 pt-4 border-t border-[#C39767]/20 flex flex-col gap-1">
                                    <p className="text-[10px] text-[#C39767]/70 italic">¿Pago por obra?</p>
                                    <p className="font-display font-bold text-[#C39767] text-sm tracking-widest uppercase">Licencia Única de Proyecto</p>
                                    <p className="text-xs text-[#C39767]/80">$8,999 MXN · Pago único · 12 meses · 1 obra.</p>
                                </div>
                            }
                            features={[
                                { title: "5 Bitácoras Activas", desc: "Capacidad robusta diseñada para constructoras y PyMES." },
                                { title: "Team Work (3 Usuarios)", desc: "Colaboración en tiempo real entre residente, supervisor y director." },
                                { title: "Smart BIM Sync", desc: "Conecta tu modelo 3D con la realidad física, tiempo y costos de la obra." },
                                { title: "Módulo Predictivo Completo", desc: "Smart Calendar y Smart Concepts trabajando en conjunto." },
                                { title: "Soporte Prioritario", desc: "Canal directo de atención para resolver dudas técnicas de tu equipo en obra." }
                            ]}
                        />

                        {/* 4. EXECUTIVE PLAN */}
                        <PlanCard
                            title="EXECUTIVE PLAN"
                            subtitle="Control total y escala ilimitada."
                            price="$12,999"
                            period="MXN / MES"
                            imageSrc={getImagePath("/images/executive_plan.webp")}
                            isPurple={true}
                            buttonText="Plan Actual"
                            features={[
                                { title: "Volumen Corporativo", desc: "Despliegues desde 10 bitácoras con capacidad de escalar a nivel Enterprise." },
                                { title: "Frentes Ilimitados", desc: "Controla megaproyectos y desarrollos complejos sin restricciones." },
                                { title: "Colaboración Masiva", desc: "Cuentas centralizadas para toda tu plantilla administrativa y de campo." },
                                { title: "Marca Blanca (White Label)", desc: "Personaliza la plataforma y los reportes con el logo y colores de tu empresa." },
                                { title: "Audit Ready", desc: "Preparación automática para auditorías con trazabilidad inmutable y BIM Sync total." }
                            ]}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}

// Interfaz e implementación de cada tarjeta
interface PlanCardProps {
    title: string;
    subtitle: string;
    price: string;
    period: string;
    imageSrc: string;
    buttonText: string;
    actualPlan?: boolean;
    secondaryButtonText?: string;
    features: { title: string, desc: string }[];
    isRecommended?: boolean;
    isPurple?: boolean;
    extraContent?: React.ReactNode;
}

function PlanCard({ title, subtitle, price, period, imageSrc, buttonText, secondaryButtonText, features, isRecommended, isPurple, extraContent, actualPlan }: PlanCardProps) {
    const borderColor = isRecommended ? "border-[#C39767]/50" : "border-white/10";
    const bgGlow = isRecommended ? "bg-[#3A2B1C]/30" : "bg-[#111111]/80";
    const shadowClass = isRecommended ? "shadow-[0_0_40px_rgba(195,151,103,0.15)]" : "shadow-xl";

    return (
        <div className={`relative w-full rounded-3xl border ${borderColor} ${bgGlow} ${shadowClass} flex flex-col pt-8 pb-6 px-6 transition-transform duration-300 hover:-translate-y-1`}>

            {/* Background Container for Image to prevent corners bleeding */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-x-0 bottom-0 h-64 lg:h-[60%] z-0 overflow-hidden mix-blend-screen opacity-15 lg:opacity-60 pointer-events-none fade-in mask-image-bottom">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0a0a0a]/80 to-transparent z-10" />
                    <Image src={imageSrc} alt={title} fill className="object-cover lg:object-contain object-bottom sm:object-right-bottom translate-y-4 sm:translate-y-0" unoptimized />
                    <div className="absolute inset-0 bg-black/60 mix-blend-overlay z-10" />
                </div>
            </div>

            {/* Pill Recomendado */}
            {isRecommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1612] border border-[#C39767] text-[#C39767] text-[10px] font-mono tracking-widest uppercase px-4 py-1 rounded-full z-20 shadow-[0_0_15px_rgba(195,151,103,0.4)]">
                    Recomendado
                </div>
            )}

            {/* Encabezado */}
            <div className="relative z-20 mb-8">
                <h3 className="text-xl font-display font-bold text-white tracking-widest uppercase mb-1">{title}</h3>
                <p className="text-xs text-white/60 mb-6">{subtitle}</p>

                <div className="flex text-white items-baseline">
                    <span className="text-4xl font-display font-bold tracking-tight">{price}</span>
                    <span className="text-xs font-medium ml-1 text-white/70 uppercase">{period}</span>
                </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-4 relative z-20 flex-1 mb-8">
                {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Check size={14} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${isPurple ? 'text-purple-500' : isRecommended ? 'text-[#C39767]' : 'text-white/40'}`} />
                        <div>
                            <p className="text-sm font-semibold text-white/90 leading-snug">{f.title}</p>
                            <p className="text-xs text-white/50 leading-relaxed mt-0.5">{f.desc}</p>
                        </div>
                    </div>
                ))}

                {extraContent && (
                    <div className="mt-auto">
                        {extraContent}
                    </div>
                )}
            </div>

            {/* Acción */}
            <div className="relative z-20 flex items-center justify-between gap-3 w-full mt-auto pt-2">
                {actualPlan ? (
                    <button className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold flex items-center justify-center gap-2 shadow-inner pointer-events-none">
                        <Check size={18} />
                        Plan Actual
                    </button>
                ) : isPurple ? (
                    <>
                        <button className="flex-1 py-3.5 rounded-xl bg-purple-600/20 border border-purple-500/50 hover:bg-purple-600/40 text-white text-sm font-medium transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                            {buttonText}
                        </button>
                        {secondaryButtonText && (
                            <button className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                                {secondaryButtonText}
                            </button>
                        )}
                    </>
                ) : isRecommended ? (
                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8a6845] to-[#4a3a2a] hover:from-[#9c7852] hover:to-[#5e4b37] border border-[#C39767]/30 text-white text-sm font-medium transition-colors shadow-[0_0_20px_rgba(195,151,103,0.2)]">
                        {buttonText}
                    </button>
                ) : (
                    <button className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 text-white/90 text-sm font-medium transition-colors">
                        {buttonText}
                    </button>
                )}
            </div>

        </div>
    );
}
