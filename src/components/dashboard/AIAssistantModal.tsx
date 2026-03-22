"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Terminal, Settings } from "lucide-react";
import { useThemeVars } from "@/hooks/useThemeVars";
import dynamic from "next/dynamic";

const PlanManagementModal = dynamic(() => import("./PlanManagementModal"), { ssr: false });

// Types
interface Message {
    role: 'ai' | 'user';
    content: string;
    suggestions?: string[];
}

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const KNOWLEDGE_BASE = [
    {
        keywords: ["foto", "imagen", "subo", "subir", "camara", "evidencia", "fotografico"],
        response: "Al subir una foto a la bitácora, la IA de BitacorIA la analiza inmediatamente:\n1. Identifica a qué concepto constructivo pertenece.\n2. Detecta el nivel de avance físico visible.\n3. Compara la imagen con tu catálogo de conceptos para avisarte si hay anomalías en el material o mano de obra.\n4. Si hay discrepancias, levanta una alerta preventiva en Smart Concepts y Smart Calendar.",
        suggestions: ["¿Qué es Smart Concepts?", "¿Y qué pasa con los retrasos?"]
    },
    {
        keywords: ["bitacoria", "que haces", "para que sirves", "funciones", "capacidades", "que puedes hacer", "hacer", "sirve", "explicar", "plataforma", "funciona"],
        response: "Soy el Asistente de BitacorIA, el 'cerebro' detrás de tu obra.\n\nMi función es conectar todos tus módulos:\n- **Bitácora**: Registro con IA y firmas válidas.\n- **Smart Concepts**: Análisis de precios y catálogos.\n- **Smart Calendar**: Control de tiempos y ruta crítica.\n\nAnalizo la información cruzada entre ellos para darte predicciones de riesgos y reportes automáticos. Todo lo que haces en un módulo afecta a los demás.",
        suggestions: ["Explícame Smart Calendar", "¿Qué pasa al subir una foto?"]
    },
    {
        keywords: ["calendario", "cronograma", "smart calendar", "fechas", "tiempo", "retraso", "atraso"],
        response: "Smart Calendar no es solo un diagrama de Gantt. Es un cronograma conectado que se alimenta de la Bitácora a tiempo real.\n\nSi un concepto no reporta el avance esperado en la bitácora, Smart Calendar genera una alerta de posible retraso en la ruta crítica y cruza la información con Smart Concepts para calcular el impacto financiero del desfase.",
        suggestions: ["¿Cómo se calcula el impacto financiero?", "Ver tablero de riesgos"]
    },
    {
        keywords: ["contactos", "directorio", "usuarios", "invitar", "ingenieros", "roles", "permisos", "equipo", "residente"],
        response: "El módulo de Contactos te permite gestionar a todos los involucrados en tu obra.\n\nPuedes invitar usuarios y asignar roles (Owner, Editor, Viewer, Residente). Estos roles definen quién puede firmar la bitácora o aprobar estimaciones en Smart Concepts.",
        suggestions: ["¿Cómo añado un nuevo Residente?", "Ver Planes de Suscripción"]
    },
    {
        keywords: ["plan", "planes", "facturacion", "cobro", "pago", "pagar", "limite", "limites", "upgrade", "suscripcion", "precio", "precios", "comprar", "barato", "costo"],
        response: "La facturación en BitacorIA se maneja por workspaces. Cada plan te otorga un límite de Obras Activas (Proyectos), capacidad de almacenamiento para modelos BIM y un número de asientos de usuario.\n\nPara ver un comparativo exacto de nuestros planes (Draft, The Resident, The Site Manager y Executive), haz clic en el botón de abajo.",
        suggestions: ["⭐ Ver Planes V.I.P.", "Hablar con asesor V.I.P."]
    },
    {
        keywords: ["ahorro", "dinero", "costo", "inversion", "rentable", "roi", "beneficio"],
        response: "BitacorIA no es un gasto, es una protección de inversión. Al predecir retrasos en la ruta crítica, evitas penalizaciones por entregas tardías. Además, al cruzar la bitácora con Smart Concepts, detectamos cobros indebidos o uso de materiales no especificados antes de que apruebes una estimación.",
        suggestions: ["Explícame Smart Concepts", "Predecir riesgos"]
    },
    {
        keywords: ["ia", "inteligencia artificial", "prediccion", "analisis", "algoritmo"],
        response: "Mi motor de Inteligencia Artificial procesa el lenguaje natural de tus notas y el avance físico. Luego, comparo esa realidad con las proyecciones teóricas de tu calendario y presupuesto. Si la velocidad de avance no concuerda con el tiempo restante, emito alertas preventivas de Desviación de Ruta Crítica.",
        suggestions: ["¿Qué es Smart Calendar?"]
    },
    {
        keywords: ["catalogo", "conceptos", "importar", "precios unitarios", "smart concepts"],
        response: "El panel 'Smart Concepts' es donde administras el catálogo de tu obra.\n\nDesde ahí puedes importar un catálogo de precios unitarios (Excel o conectar tu ERP). Cuando subes evidencia a la bitácora, yo me encargo de analizar la foto y buscar en este catálogo qué estás construyendo y si el material es acorde al precio unitario especificado.",
        suggestions: ["¿Qué pasa si la foto muestra un material distinto?"]
    },
    {
        keywords: ["riesgos", "predictivo", "retraso", "cimentacion", "alerta", "anomalia"],
        response: "Mi motor predictivo analiza la curva S física de la bitácora y Smart Calendar contra la financiera de Smart Concepts.\n\nAl cruzar estos 3 módulos, puedo decirte con semanas de anticipación si una actividad de cimentación va a generar un retraso legal o un sobrecosto no presupuestado.",
        suggestions: ["Forzar análisis predictivo ahora", "Configurar alertas tempranas"]
    },
    {
        keywords: ["firma", "pdf", "reporte", "digital", "legal", "nom", "nom-151", "firmar", "exportar"],
        response: "Las firmas de los residentes y supervisores tienen validez legal amparada por blockchain (NOM-151).\n\nCualquier movimiento en el Calendario o Bitácora queda sellado. Para exportar reportes firmados, usa el botón 'Descargar' en el panel principal de registros.",
        suggestions: ["Regenerar firmas de un reporte cerrado"]
    },
    {
        keywords: ["hola", "buenos dias", "ayuda", "menu", "saludos", "hi"],
        response: "¡Hola! Soy BitacorIA, el Sistema de Inteligencia Operativa de tu construcción.\n\nConecto tu bitácora, cronograma (Calendar) y precios (Concepts) de forma automática para predecir riesgos y automatizar reportes.\n\n¿Tienes alguna duda sobre qué puede hacer la plataforma?",
        suggestions: ["¿Qué pasa al subir una foto a la bitácora?", "Explícame qué haces por mí", "Cerrar Asistente"]
    },
    {
        keywords: ["humano", "ticket", "soporte", "ingeniero", "error grave"],
        response: "Si requieres asistencia humana para configuraciones críticas o posibles problemas del servidor, puedes levantar un Ticket de Soporte directo.\n\nSimplemente cierra mi ventana haciendo clic en la [X] superior o en el fondo oscuro, y selecciona 'Soporte Técnico Especializado' en la tarjeta principal.",
        suggestions: ["Cerrar Asistente de IA"]
    },
    {
        keywords: ["otras personas", "demas personas", "compañeros", "equipo", "veran", "ver", "fuente de verdad", "compartido", "todos los registros"],
        response: "Sí, ya que BitacorIA está pensada para que sea la única fuente de verdad absoluta en las obras, de modo que los compañeros de trabajo puedan ver todos los registros y modificaciones que se hayan hecho.",
        suggestions: ["Asignar roles a mi equipo", "¿Qué pasa al subir una foto?"]
    },
    {
        keywords: ["contraseña", "password", "olvide", "recuperar", "cambiar", "acceso"],
        response: "Para cambiar tu contraseña, dirígete al menú de 'Configuración' y selecciona la pestaña 'Seguridad y Accesos'. Ahí podrás actualizar tus credenciales de forma segura.",
        suggestions: ["Cerrar Asistente de IA"]
    },
    {
        keywords: ["pdf", "excel", "exportar", "descargar", "reporte", "imprimir"],
        response: "Puedes exportar tu bitácora o reportes en PDF/Excel desde el panel principal usando el botón de 'Descargar' o 'Exportar'. Todos los documentos exportados conservarán la validez de las firmas digitales.",
        suggestions: ["Validez legal de las firmas"]
    },
    {
        keywords: ["offline", "sin internet", "conexion", "campo", "datos", "sincronizar"],
        response: "BitacorIA está diseñada para el trabajo de campo. Si te quedas sin internet, puedes seguir haciendo tus anotaciones y subiendo fotos. La aplicación las guardará localmente y se sincronizará automáticamente apenas recuperes la conexión.",
        suggestions: ["¿Qué pasa al subir una foto?"]
    }
];

const DEFAULT_RESPONSE = {
    response: "Esa es una duda muy específica sobre tu proyecto o configuración. Para darte la mejor solución, te sugiero contactarnos directamente levantando un Ticket de Soporte Humano para que un ingeniero especialista revise tu caso a detalle.",
    suggestions: ["Crear Ticket Humano", "Planes, Facturación y Upgrades"]
};

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
    const { isDark } = useThemeVars();
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'ai', 
            content: 'Asistente BitacorIA v2.4 listo.\n\n¿En qué puedo ayudarte hoy?',
            suggestions: [
                "¿Cómo genero un catálogo de conceptos?",
                "¿Cómo predices retrasos en la obra?", 
                "No se muestran los riesgos de retraso", 
                "Regenerar firma digital en PDF"
            ]
        }
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    if (!isOpen) return null;

    const findResponse = (query: string): { response: string, suggestions?: string[] } => {
        const lowerQuery = query.toLowerCase();
        
        // Remove accents for better matching
        const normalizedQuery = lowerQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Find best matching knowledge base entry
        for (const entry of KNOWLEDGE_BASE) {
            if (entry.keywords.some(kw => normalizedQuery.includes(kw))) {
                return { response: entry.response, suggestions: entry.suggestions };
            }
        }
        
        return DEFAULT_RESPONSE;
    };

    const processMessage = (userText: string) => {
        if (!userText.trim()) return;

        // 1. Add user message
        setMessages(prev => [...prev, { role: 'user', content: userText }]);
        setMessage("");
        setIsTyping(true);

        // 2. Simulate AI Processing
        setTimeout(() => {
            const result = findResponse(userText);
            
            setMessages(prev => [...prev, {
                role: 'ai',
                content: result.response,
                suggestions: result.suggestions
            }]);
            
            setIsTyping(false);
        }, 1200 + Math.random() * 800); // Realistic typing delay (1.2s to 2s)
    };

    const handleSend = () => {
        processMessage(message);
    };

    const handleSuggestionClick = (suggestionText: string) => {
        if (suggestionText === "Cerrar Asistente de IA") {
            onClose();
            return;
        }
        if (suggestionText === "Crear Ticket Humano") {
            onClose();
            // In a real app we would trigger the TicketModal here via context or prop
            return;
        }
        if (suggestionText === "⭐ Ver Planes V.I.P." || suggestionText === "Ver Planes de Suscripción") {
            setIsPlansModalOpen(true);
            return;
        }
        processMessage(suggestionText);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={`w-full max-w-2xl flex flex-col h-[600px] max-h-[90vh] rounded-[24px] border ${isDark ? 'border-[#C39767]/20' : 'border-[#C39767]/30'} shadow-2xl relative z-10 overflow-hidden ${isDark ? 'bg-[#0f0a05]' : 'bg-[#FAFAFA]'}`}
                style={{
                    animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                {/* Header terminal-style */}
                <div className={`shrink-0 h-16 border-b ${isDark ? 'border-white/5' : 'border-black/5'} bg-[#0f0a05] px-6 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-[#C39767]" />
                        <span className="font-mono text-sm font-bold tracking-wide text-white">
                            terminal@bitacoria:~
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-white/40 hover:text-white transition-colors">
                            <Settings size={18} />
                        </button>
                        <div className="w-px h-4 bg-white/10" />
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 text-[13px] leading-relaxed space-y-6 bg-[#080604] custom-scrollbar">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${
                                msg.role === 'ai' 
                                ? 'bg-[#C39767]/20 text-[#C39767] border border-[#C39767]/20' 
                                : 'bg-white/10 text-white/50'
                            }`}>
                                {msg.role === 'ai' ? 'IA' : 'TÚ'}
                            </div>
                            
                            {/* Message Content */}
                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                <div className={`whitespace-pre-wrap text-[13px] leading-[1.7] ${
                                    msg.role === 'user' 
                                    ? 'bg-[#1c1611] border border-[#C39767]/15 text-[#e6d8cc] px-5 py-3 rounded-2xl rounded-tr-md' 
                                    : 'bg-[#111] border border-white/5 text-[#d4ccc0] px-5 py-3 rounded-2xl rounded-tl-md'
                                }`}>
                                    {msg.content}
                                </div>
                                
                                {/* Suggestions Bubbles */}
                                {msg.role === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {msg.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="text-left px-4 py-2 border border-white/10 bg-white/[0.03] hover:bg-[#C39767]/10 hover:border-[#C39767]/30 text-white/60 hover:text-[#e6d8cc] rounded-full text-[11px] font-medium transition-all"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-3 flex-row">
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase bg-[#C39767]/20 text-[#C39767] border border-[#C39767]/20">
                                IA
                            </div>
                            <div className="bg-[#111] border border-white/5 px-5 py-3 rounded-2xl rounded-tl-md">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-[#C39767]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-[#C39767]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-[#C39767]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={bottomRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className={`shrink-0 p-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'} bg-[#0a0704]`}>
                    <div className="relative flex items-center gap-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                            placeholder={isTyping ? "Procesando..." : "Escribe tu pregunta aquí..."}
                            disabled={isTyping}
                            className={`w-full bg-[#151010] border border-white/5 rounded-2xl py-3.5 px-5 text-[13px] text-[#e6d8cc] placeholder:text-white/25 focus:outline-none ${isTyping ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#C39767]/30'} transition-colors`}
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isTyping}
                            className={`shrink-0 p-3 rounded-2xl transition-all ${!message.trim() || isTyping ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-[#C39767] text-black hover:brightness-110'}`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
            
            {/* VIP Plans Modal triggered from within the chat */}
            <PlanManagementModal 
                isOpen={isPlansModalOpen} 
                onClose={() => setIsPlansModalOpen(false)} 
            />
        </div>
    );
}
