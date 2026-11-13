"use client";

/* ══════════════════════════════════════════════════════════════════════
   Verificacion — el recuadro de "no robot" de la solicitud de demo
   ──────────────────────────────────────────────────────────────────────
   2026-11-13 (Luis, tanda 4 del plan registro_filtro). Equivale al de la
   app (frontend-bitacoria, src/components/auth/TurnstileWidget.tsx) con la
   acción "demo": el servidor solo acepta esa acción en esta ruta.

   Solo se monta si hay llave del sitio y servidor configurado. Avisa a la
   hoja:
     - onToken(token) cuando hay token; onToken(null) cuando vence o se pide
       otro (el recuadro renueva solo el vencido);
     - onInteractiva() si el recuadro pide que la persona lo marque;
     - onFallo() si el script no carga, el recuadro truena, el navegador no
       lo soporta o no está listo en un tiempo razonable. La hoja pasa
       entonces al modo de WhatsApp directo SIN decir nada: se sabe antes de
       enviar.
   reset() (por ref) pide un token nuevo: cada token sirve UNA vez.

   El recuadro trae la marca y los textos del proveedor dentro de su propio
   marco; NUESTRO texto nunca lo nombra.
   ══════════════════════════════════════════════════════════════════════ */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { ACCION_VERIFICACION, TIEMPO_RAZONABLE_VERIFICACION_MS } from "@/lib/demoServidor";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface OpcionesRecuadro {
    sitekey: string;
    action?: string;
    language?: string;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "flexible" | "compact";
    callback?: (token: string) => void;
    "expired-callback"?: () => void;
    "timeout-callback"?: () => void;
    "error-callback"?: (codigo?: string) => boolean | void;
    "unsupported-callback"?: () => void;
    "before-interactive-callback"?: () => void;
}

interface ApiRecuadro {
    render: (contenedor: HTMLElement, opciones: OpcionesRecuadro) => string | null | undefined;
    reset: (id?: string) => void;
    remove: (id?: string) => void;
}

declare global {
    interface Window {
        turnstile?: ApiRecuadro;
    }
}

export interface VerificacionHandle {
    reset: () => void;
}

interface VerificacionProps {
    llave: string;
    onToken: (token: string | null) => void;
    onInteractiva: () => void;
    onFallo: () => void;
}

let cargaEnCurso: Promise<ApiRecuadro> | null = null;

function cargarScript(): Promise<ApiRecuadro> {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (cargaEnCurso) return cargaEnCurso;
    cargaEnCurso = new Promise<ApiRecuadro>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        let limite: number | undefined;
        const fallar = (motivo: string) => {
            window.clearTimeout(limite);
            cargaEnCurso = null;
            script.remove();
            reject(new Error(motivo));
        };
        limite = window.setTimeout(() => fallar("tiempo agotado"), TIEMPO_RAZONABLE_VERIFICACION_MS);
        script.onload = () => {
            window.clearTimeout(limite);
            if (window.turnstile) resolve(window.turnstile);
            else fallar("sin interfaz");
        };
        script.onerror = () => fallar("no cargó");
        document.head.appendChild(script);
    });
    return cargaEnCurso;
}

const Verificacion = forwardRef<VerificacionHandle, VerificacionProps>(function Verificacion(
    { llave, onToken, onInteractiva, onFallo },
    ref,
) {
    const contenedor = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    // Los avisos del recuadro se registran una vez; leen siempre los vigentes.
    const avisos = useRef({ onToken, onInteractiva, onFallo });
    avisos.current = { onToken, onInteractiva, onFallo };

    useEffect(() => {
        let vivo = true;
        let respondio = false;
        // Si en un tiempo razonable no hay token ni pide que lo marquen, se da por
        // caído: la hoja pasa a WhatsApp directo antes de que la persona envíe.
        const reloj = window.setTimeout(() => {
            if (vivo && !respondio) avisos.current.onFallo();
        }, TIEMPO_RAZONABLE_VERIFICACION_MS);
        const fallo = () => {
            window.clearTimeout(reloj);
            if (vivo) avisos.current.onFallo();
        };

        cargarScript()
            .then((api) => {
                if (!vivo || !contenedor.current) return;
                try {
                    const id = api.render(contenedor.current, {
                        sitekey: llave,
                        action: ACCION_VERIFICACION,
                        language: "es",
                        theme: "dark",
                        size: "flexible",
                        callback: (token) => {
                            respondio = true;
                            window.clearTimeout(reloj);
                            avisos.current.onToken(token);
                        },
                        "expired-callback": () => avisos.current.onToken(null),
                        "timeout-callback": () => avisos.current.onToken(null),
                        "before-interactive-callback": () => {
                            respondio = true;
                            window.clearTimeout(reloj);
                            avisos.current.onInteractiva();
                        },
                        "unsupported-callback": () => fallo(),
                        "error-callback": () => {
                            avisos.current.onToken(null);
                            fallo();
                            // Atendido aquí: el recuadro no lo relanza en la consola.
                            return true;
                        },
                    });
                    widgetId.current = id ?? null;
                    if (!id) fallo();
                } catch {
                    fallo();
                }
            })
            .catch(() => fallo());

        return () => {
            vivo = false;
            window.clearTimeout(reloj);
            const id = widgetId.current;
            widgetId.current = null;
            if (id && window.turnstile) {
                try {
                    window.turnstile.remove(id);
                } catch {
                    // El recuadro ya no existe: nada que quitar.
                }
            }
        };
    }, [llave]);

    useImperativeHandle(
        ref,
        () => ({
            reset: () => {
                avisos.current.onToken(null);
                const id = widgetId.current;
                if (id && window.turnstile) {
                    try {
                        window.turnstile.reset(id);
                    } catch {
                        // Si no se puede reiniciar, la hoja espera un token y, si no
                        // llega, dice "No pudimos guardar" con el botón de WhatsApp.
                    }
                }
            },
        }),
        [],
    );

    // Bloque a todo el ancho de la hoja (con size "flexible" el recuadro lo toma).
    return <div ref={contenedor} className="min-h-[65px] w-full" />;
});

export default Verificacion;
