"use client";

import dynamic from "next/dynamic";

/**
 * EsiaClient — wrapper que carga EsiaRegistro con ssr:false.
 *
 * Justificación:
 *   El funnel tiene varios componentes (CountdownTimer, useReducedMotion,
 *   navigator.onLine, etc.) que dependen del estado del browser. SSR los
 *   evalúa con valores distintos a los del cliente (null vs boolean,
 *   undefined vs Date.now()) y eso provoca hydration mismatch.
 *
 *   En lugar de jugar whack-a-mole con cada source de mismatch, mejor
 *   evitamos el SSR entero del funnel. El page.tsx queda como Server
 *   Component (para exportar metadata + viewport), y este wrapper hace
 *   el dynamic import.
 *
 *   Trade-off: el primer paint del server es un skeleton (~3KB) en vez
 *   del HTML completo del funnel. A cambio, cero hydration warnings y
 *   render predecible. Para un formulario de registro (no SEO-critical),
 *   es el trade-off correcto.
 */

const EsiaRegistro = dynamic(() => import("./EsiaRegistro"), {
    ssr: false,
    loading: () => <EsiaSkeleton />,
});

function EsiaSkeleton() {
    return (
        <div
            className="relative w-full text-stone-900"
            style={{
                minHeight: "100dvh",
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                background: "linear-gradient(180deg, #f6efe1 0%, #ece2cd 60%, #e2d4b8 100%)",
            }}
        >
            {/* Grid sutil estática (no animada) */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: [
                        "repeating-linear-gradient(to right, rgba(139,92,59,0.05) 0 1px, transparent 1px 80px)",
                        "repeating-linear-gradient(to bottom, rgba(139,92,59,0.05) 0 1px, transparent 1px 80px)",
                    ].join(", "),
                }}
            />

            <header className="relative z-10 flex items-center justify-between px-5 py-3 md:px-10 md:py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-stone-700 leading-none">
                    BITACORIA
                </div>
                <div className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-stone-500">
                    02 · 06 · 2026 · ESIA Zacatenco
                </div>
            </header>

            <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
                <div
                    className="w-10 h-10 rounded-full border-2 border-amber-700/20 border-t-amber-700 animate-spin"
                    aria-label="Cargando registro"
                    role="status"
                />
                <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">
                    Cargando registro…
                </div>
            </div>
        </div>
    );
}

export default function EsiaClient() {
    return <EsiaRegistro />;
}
