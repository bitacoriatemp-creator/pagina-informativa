"use client";

import { useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   COMPONENTE: GLOBAL LASER TRAIL
   ──────────────────────────────────────────────────────────────
   Dibuja una estela brillante (trail) que sigue al ratón por 
   toda la pantalla (fixed), al estilo de una tira LED de neón azul.
   ══════════════════════════════════════════════════════════════ */
export default function LaserTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // En móvil/touch no hay cursor: el canvas está oculto (hidden md:block)
        // pero el RAF + listeners de mousemove seguían corriendo 60fps inútilmente
        // y compitiendo con el scroll. Cortar de raíz en touch / reduced-motion.
        const noTrail = window.matchMedia(
            "(hover: none), (pointer: coarse), (max-width: 767px), (prefers-reduced-motion: reduce)"
        ).matches;
        if (noTrail) return;

        let points: { x: number; y: number; life: number }[] = [];
        let animationFrame: number;
        
        let mouseX = -100;
        let mouseY = -100;
        let trailX = -100;
        let trailY = -100;
        let isHovering = false;
        let firstMove = true;

        // Para anclar el dibujo a la página al hacer scroll
        let lastScrollY = window.scrollY;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isHovering = true;
            if (firstMove) {
                trailX = mouseX;
                trailY = mouseY;
                firstMove = false;
            }
        };

        const handleMouseOut = (e: MouseEvent) => {
            // FIX 1: Solo desactivar cuando el cursor REALMENTE sale de la ventana.
            if (e.relatedTarget === null) {
                isHovering = false;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseOut);

        const render = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Compensar el scroll de la página: Si scrolleamos, el rastro viejo debe subir o bajar
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            if (scrollDelta !== 0) {
                for (let i = 0; i < points.length; i++) {
                    points[i].y -= scrollDelta;
                }
            }

            // 2. Interpolación Lineal (Lerp) para la cabeza del láser
            if (isHovering) {
                trailX += (mouseX - trailX) * 0.15;
                trailY += (mouseY - trailY) * 0.15;
                
                const dist = Math.abs(mouseX - trailX) + Math.abs(mouseY - trailY);
                if (dist > 0.5 || points.length === 0) {
                    points.push({ x: trailX, y: trailY, life: 1.0 });
                }
                // Si estamos scrolleando sin mover el mouse, igual empujamos puntos para dibujar la línea
                else if (scrollDelta !== 0) {
                    points.push({ x: trailX, y: trailY, life: 1.0 });
                }
            }

            // 3. Filtrar puntos desvanecidos
            points = points.filter((p) => p.life > 0.02);

            if (points.length > 1) {
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                for (let i = 1; i < points.length; i++) {
                    const p1 = points[i - 1];
                    const p2 = points[i];

                    // FIX 2: Fusible cortacorriente — saltos > 100px = no dibujar
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    if (dx * dx + dy * dy > 10000) {
                        p2.life -= 0.04;
                        continue;
                    }

                    const alpha = p2.life * 0.4; 
                    
                    // CAPA 1: Glow exterior (efecto LED ámbar)
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(195, 151, 103, ${alpha * 0.3})`;
                    ctx.lineWidth = Math.max(1, p2.life * 8);
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = `rgba(195, 151, 103, ${Math.min(1, alpha * 2.5)})`;
                    ctx.stroke();

                    // CAPA 2: Núcleo sólido
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(195, 151, 103, ${alpha})`;
                    ctx.lineWidth = Math.max(0.1, p2.life * 2);
                    ctx.shadowBlur = 0;
                    ctx.stroke();

                    // Decaimiento rápido
                    p2.life -= 0.04; 
                }

                if (isHovering && points.length > 0) {
                    const head = points[points.length - 1];
                    ctx.beginPath();
                    ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "rgba(195, 151, 103, 0.8)";
                    ctx.fill();
                }
            }

            animationFrame = requestAnimationFrame(render);
        };
        
        render();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseOut);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return <canvas ref={canvasRef} className="hidden md:block fixed top-0 left-0 w-screen h-screen pointer-events-none z-[100]" />;
}
