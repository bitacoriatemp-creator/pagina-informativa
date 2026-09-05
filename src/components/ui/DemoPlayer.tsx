"use client";

import { useEffect, useRef } from "react";

type DemoPlayerProps = {
    src: string;
    poster: string;
    /* Ya no se pinta: se conserva para el nombre accesible del <video>. */
    label: string;
};

/**
 * Reproductor de demo ambiental.
 * Arranca solo —MUDO, en loop, SIN controles— cuando la sección entra al
 * viewport, y se pausa al salir (ahorra CPU/batería). No descarga el video
 * hasta que está por verse: preload="none" + play() disparado por el
 * IntersectionObserver, así la carga inicial de la landing sigue ligera.
 */
export default function DemoPlayer({ src, poster, label }: DemoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        // React no siempre refleja el atributo `muted`; lo forzamos para que
        // el navegador permita el autoplay (autoplay con sonido está bloqueado).
        v.muted = true;

        let inView = false;
        // Solo reproduce si la sección está a la vista Y la pestaña está visible
        // (Chrome pausa media muda "en segundo plano" para ahorrar energía).
        const tryPlay = () => {
            if (inView && document.visibilityState === "visible") {
                v.play().catch(() => {});
            }
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                if (inView) tryPlay();
                else v.pause();
            },
            { threshold: 0.35 }
        );
        io.observe(v);
        document.addEventListener("visibilitychange", tryPlay);

        return () => {
            io.disconnect();
            document.removeEventListener("visibilitychange", tryPlay);
        };
    }, []);

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                muted
                loop
                playsInline
                preload="none"
                aria-label={`Demo: ${label}`}
                className="aspect-video w-full bg-black"
            />
        </div>
    );
}
