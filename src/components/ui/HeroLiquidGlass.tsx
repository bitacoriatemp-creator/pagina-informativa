"use client";

import { useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   HeroLiquidGlass — fondo del Hero
   ──────────────────────────────────────────────────────────────
   Capas (de atrás hacia adelante):
     1. Base oscura
     2. Blobs de color a la deriva, muy desenfocados  → lo "líquido"
     3. Luz que sigue al cursor; su tinte cambia según la zona
        por la que pasa (verde → arena → azul → morado, los mismos
        acentos de los módulos)
     4. Lámina de vidrio: blur + brillo diagonal
     5. Viñeta

   Rendimiento: el mousemove NO provoca renders de React — la posición
   y el color viajan como CSS custom properties actualizadas dentro de
   un rAF con lerp. En touch el seguimiento se apaga y queda solo el
   fondo estático.
   ══════════════════════════════════════════════════════════════ */

/* Acentos de los 4 módulos — la luz interpola entre ellos según la X */
const ACCENTS: ReadonlyArray<readonly [number, number, number]> = [
    [0, 210, 106],   // Smart Concepts
    [195, 151, 103], // Bitácora (color de marca)
    [59, 130, 246],  // Smart Calendar
    [168, 85, 247],  // Smart BIM
];

/** Color de la luz para una posición horizontal normalizada (0 → 1). */
function lightAt(t: number): string {
    const clamped = Math.min(1, Math.max(0, t));
    const span = 1 / (ACCENTS.length - 1);
    const i = Math.min(ACCENTS.length - 2, Math.floor(clamped / span));
    const f = (clamped - i * span) / span;
    const a = ACCENTS[i];
    const b = ACCENTS[i + 1];
    return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
    ].join(", ");
}

export default function HeroLiquidGlass() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        // Sin cursor (touch) no hay nada que seguir: fondo estático y ni
        // listeners ni rAF corriendo en balde.
        const noPointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
        if (noPointer) return;

        // Con "reducir movimiento" la luz sigue existiendo —es respuesta
        // directa al puntero, no animación autónoma— pero sin arrastre:
        // pega al cursor en vez de perseguirlo. (La deriva de los blobs sí
        // queda congelada por la regla global de globals.css.)
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ease = reduced ? 1 : 0.12;
        const fade = reduced ? 1 : 0.08;

        let targetX = 0.5;
        let targetY = 0.4;
        let x = 0.5;
        let y = 0.4;
        let glow = 0;          // 0 = luz apagada, 1 = encendida
        let targetGlow = 0;
        let frame = 0;
        let running = false;

        const handleMove = (e: MouseEvent) => {
            const r = root.getBoundingClientRect();
            targetX = (e.clientX - r.left) / r.width;
            targetY = (e.clientY - r.top) / r.height;
            // Solo encendemos la luz mientras el cursor está sobre el hero.
            targetGlow = targetY >= -0.15 && targetY <= 1.15 ? 1 : 0;
        };

        /* Al salir el puntero hacia el cromo del navegador (barra de direcciones,
           pestañas) el rAF se estrangula y el fundido se quedaba a medias: una
           luz "rota" fija en pantalla. Apagamos de inmediato escribiendo la
           variable, sin depender de que el bucle siga corriendo. */
        const handleLeave = () => {
            targetGlow = 0;
            glow = 0;
            root.style.setProperty("--lg-glow", "0");
        };

        const render = () => {
            x += (targetX - x) * ease;
            y += (targetY - y) * ease;
            glow += (targetGlow - glow) * fade;

            root.style.setProperty("--lg-x", `${(x * 100).toFixed(2)}%`);
            root.style.setProperty("--lg-y", `${(y * 100).toFixed(2)}%`);
            root.style.setProperty("--lg-rgb", lightAt(x));
            root.style.setProperty("--lg-glow", glow.toFixed(3));

            frame = requestAnimationFrame(render);
        };

        // El rAF solo gira mientras el hero está a la vista.
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !running) {
                running = true;
                frame = requestAnimationFrame(render);
            } else if (!entry.isIntersecting && running) {
                running = false;
                cancelAnimationFrame(frame);
            }
        });
        io.observe(root);

        window.addEventListener("mousemove", handleMove, { passive: true });
        document.addEventListener("mouseleave", handleLeave);
        // La ventana pierde el foco al ir a la barra de direcciones: mismo apagado.
        window.addEventListener("blur", handleLeave);

        return () => {
            io.disconnect();
            cancelAnimationFrame(frame);
            window.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseleave", handleLeave);
            window.removeEventListener("blur", handleLeave);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={
                {
                    backgroundColor: "#060302",
                    "--lg-x": "50%",
                    "--lg-y": "40%",
                    "--lg-rgb": "195, 151, 103",
                    "--lg-glow": "0",
                } as React.CSSProperties
            }
        >
            {/* ── 2. Blobs líquidos a la deriva ── */}
            <div className="lg-blobs absolute inset-0">
                <span className="lg-blob lg-blob--a" />
                <span className="lg-blob lg-blob--b" />
                <span className="lg-blob lg-blob--c" />
            </div>

            {/* ── 3. Luz del cursor (tinte según la zona) — apenas un susurro ──
                Sin mix-blend-mode ni filter: combinados con el backdrop-filter
                de la lámina, Chrome recompone la capa contra un backdrop
                recortado y deja costuras rectangulares visibles (se disparaba,
                p. ej., al abrir el desplegable de la barra de direcciones).
                Un degradado con alfa plano da el mismo resultado sin el bug. */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(420px circle at var(--lg-x) var(--lg-y), rgba(var(--lg-rgb), 0.14) 0%, rgba(var(--lg-rgb), 0.06) 40%, transparent 72%)",
                    opacity: "var(--lg-glow)",
                }}
            />

            {/* ── 4. Lámina de vidrio: difumina lo de atrás y añade brillo ── */}
            <div className="lg-sheet absolute inset-0" />

            {/* Halo del cursor sobre el vidrio — el reflejo que "moja" la superficie */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(240px circle at var(--lg-x) var(--lg-y), rgba(255,255,255,0.018) 0%, transparent 68%)",
                    opacity: "var(--lg-glow)",
                }}
            />

            {/* ── 5. Viñeta ── */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 70% at 35% 50%, rgba(6,3,2,0.25) 0%, rgba(6,3,2,0.88) 100%)",
                }}
            />
        </div>
    );
}
