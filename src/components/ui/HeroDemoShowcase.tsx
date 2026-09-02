"use client";

import { EVENTO_DEMO } from "@/lib/eventos";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ── Los 3 demos reales que antes vivían en secciones aparte
   (Smart Concepts, Bitácora, Smart Calendar) — ahora viven en el Hero.
   `focus` ajusta el object-position del recorte vertical en móvil, por si
   el contenido de alguna grabación no está perfectamente centrado. ── */
type Demo = {
    src: string;
    poster: string;
    label: string;
    accent: string;
    focus?: string;
};

const DEMOS: Demo[] = [
    {
        src: assetPath("/videos/demo-concepts.mp4"),
        poster: assetPath("/videos/demo-concepts-poster.jpg"),
        label: "Smart Concepts",
        accent: "#00D26A",
    },
    {
        src: assetPath("/videos/demo-bitacora.mp4"),
        poster: assetPath("/videos/demo-bitacora-poster.jpg"),
        label: "Bitácora",
        accent: "#C39767",
    },
    {
        src: assetPath("/videos/demo-calendar.mp4"),
        poster: assetPath("/videos/demo-calendar-poster.jpg"),
        label: "Smart Calendar",
        accent: "#3B82F6",
    },
];

/* En mudo los demos corren acelerados (se ven como un vistazo rápido); al
   activar el sonido volvemos a 1x para que la voz suene natural. */
const RATE_MUTED = 1.2;
const RATE_SOUND = 1;

/* Aparición del control de sonido: fundido puro de 0 a 100 en 1s, igual de
   lento al entrar que al salir. Icono y barra van a la vez —sin desfase y sin
   desplazamiento— para que se sienta como una sola pieza que se revela. */
const SOUND_REVEAL = "opacity 1000ms cubic-bezier(0.33,0,0.2,1)";

/**
 * HeroDemoShowcase — tarjeta de producto del Hero (estilo Claude: imagen
 * contenida a la derecha del copy, no fondo cinematográfico a sangre).
 * Reproduce los 3 demos reales en loop secuencial con crossfade.
 */
export default function HeroDemoShowcase() {
    const [active, setActive] = useState(0);
    /* Arranca SIEMPRE en mudo: es requisito del autoplay y además evita
       sonido no pedido al entrar a la landing. */
    const [muted, setMuted] = useState(true);
    const [hovering, setHovering] = useState(false);
    /* Punto bajo el cursor: muestra un adelanto del módulo antes de hacer clic. */
    const [preselected, setPreselected] = useState<number | null>(null);
    /* En touch los controles cambian de sitio: el sonido va sobre la tarjeta y
       aparece el gesto de ampliar. */
    const [coarsePointer, setCoarsePointer] = useState(false);
    /* Oculta la pista "Toca para ampliar" tras el primer uso. */
    const [yaAmplio, setYaAmplio] = useState(false);

    const videoRef0 = useRef<HTMLVideoElement>(null);
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);
    const videoRefs = [videoRef0, videoRef1, videoRef2];

    /* Nivel de volumen (0–1) del control vertical. */
    const [volume, setVolume] = useState(1);

    const cardRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef(0);
    const mutedRef = useRef(true);
    const volumeRef = useRef(1);

    /* Suscrito al media query, no leído una sola vez: una tablet que rota o un
       equipo híbrido (táctil + ratón) cambian de modo en caliente, y con una
       lectura única los controles se quedaban en el modo del primer render. */
    useEffect(() => {
        const mq = window.matchMedia("(hover: none), (pointer: coarse)");
        const sync = () => setCoarsePointer(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        const videos = videoRefs.map((r) => r.current);
        const card = cardRef.current;
        if (videos.some((v) => !v) || !card) return;

        // React no siempre refleja el atributo `muted` a tiempo para el
        // autoplay; lo forzamos como propiedad del DOM (mismo fix que DemoPlayer).
        videos.forEach((v) => {
            v!.muted = true;
            v!.playbackRate = RATE_MUTED;
            v!.volume = volumeRef.current;
        });

        // El showcase se pausa fuera de vista y con la pestaña en segundo
        // plano: ahorra CPU y, sobre todo, evita que siga sonando un demo
        // que nadie está viendo.
        let inView = true;

        const canPlay = () => inView && document.visibilityState === "visible";
        const pauseAll = () => videos.forEach((v) => v!.pause());

        const tryPlay = () => {
            if (canPlay()) videos[activeRef.current]!.play().catch(() => {});
        };

        /* Al terminar un demo encadena el siguiente (y del último vuelve al
           primero). El crossfade —y con él el punto de abajo— se dispara solo
           cuando el siguiente YA está reproduciendo: si arrancáramos el fundido
           antes, un clip aún sin buffer dejaría un hueco en negro a mitad de
           transición. */
        const playNext = (currentIdx: number) => {
            const nextIdx = (currentIdx + 1) % videos.length;
            const next = videos[nextIdx]!;

            next.currentTime = 0;
            // El sonido —y con él la velocidad— viajan con el usuario.
            next.muted = mutedRef.current;
            next.playbackRate = mutedRef.current ? RATE_MUTED : RATE_SOUND;

            const reveal = () => {
                videos[currentIdx]!.muted = true;
                activeRef.current = nextIdx;
                setActive(nextIdx);
                // Pre-calienta SOLO el que sigue: evita bajar los 3 clips de golpe.
                videos[(nextIdx + 1) % videos.length]!.preload = "auto";
            };

            // Si nadie está mirando no arrancamos nada: avanzamos el índice y
            // `tryPlay` reanudará este mismo clip al volver.
            if (!canPlay()) {
                reveal();
                return;
            }
            next.play().then(reveal, reveal);
        };

        videos.forEach((v, i) => {
            v!.onended = () => playNext(i);
        });

        const io = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting;
                if (inView) tryPlay();
                else pauseAll();
            },
            { threshold: 0.25 }
        );
        io.observe(card);

        // Con la pestaña oculta el navegador no entrega rAF ni callbacks del
        // IntersectionObserver, pero el video SÍ sigue sonando: por eso aquí
        // pausamos explícitamente en vez de solo reanudar.
        const handleVisibility = () => {
            if (document.visibilityState === "visible") tryPlay();
            else pauseAll();
        };

        tryPlay();
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            videos.forEach((v) => {
                if (v) v.onended = null;
            });
            io.disconnect();
            document.removeEventListener("visibilitychange", handleVisibility);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** Fuente única de verdad del audio: mute + velocidad van siempre juntos. */
    const setSoundEnabled = (enabled: boolean) => {
        const nextMuted = !enabled;
        mutedRef.current = nextMuted;
        setMuted(nextMuted);

        videoRefs.forEach((r, i) => {
            const v = r.current;
            if (!v) return;
            // Solo el visible puede sonar; los demás siempre en mudo.
            v.muted = nextMuted || i !== activeRef.current;
            v.playbackRate = nextMuted ? RATE_MUTED : RATE_SOUND;
        });

        // Desmutear cuenta como gesto del usuario: aprovechamos para asegurar
        // la reproducción por si el navegador la había pausado.
        if (enabled) videoRefs[activeRef.current].current?.play().catch(() => {});
    };

    const toggleSound = () => setSoundEnabled(mutedRef.current);

    /** Aplica un nivel de volumen (0–1) a los tres clips. */
    const applyVolume = (raw: number) => {
        const v = Math.min(1, Math.max(0, raw));
        volumeRef.current = v;
        setVolume(v);
        videoRefs.forEach((r) => {
            if (r.current) r.current.volume = v;
        });
        // Mover la barra es una petición explícita de oír: si estaba en mudo,
        // lo activamos (y al bajar a cero, silenciamos).
        if (v === 0 && !mutedRef.current) setSoundEnabled(false);
        else if (v > 0 && mutedRef.current) setSoundEnabled(true);
    };

    /** Traduce la posición del puntero sobre la barra a volumen (arriba = 100%). */
    const volumeFromPointer = (clientY: number) => {
        const track = trackRef.current;
        if (!track) return;
        const r = track.getBoundingClientRect();
        applyVolume(1 - (clientY - r.top) / r.height);
    };

    const goTo = (i: number) => {
        if (i === active) return;
        const prev = videoRefs[active].current;
        if (prev) {
            prev.pause();
            prev.muted = true;
        }
        activeRef.current = i;
        setActive(i);
        const v = videoRefs[i].current;
        if (v) {
            v.currentTime = 0;
            v.muted = mutedRef.current;
            v.playbackRate = mutedRef.current ? RATE_MUTED : RATE_SOUND;
            v.play().catch(() => {});
        }
    };

    /* La isla flotante pide un demo concreto ("Bitácora" → índice 1). goTo
       cambia en cada render, así que el listener lee la versión vigente por ref
       y se suscribe una sola vez. */
    const goToRef = useRef(goTo);
    goToRef.current = goTo;
    useEffect(() => {
        const alPedir = (e: Event) => {
            const i = (e as CustomEvent<number>).detail;
            if (Number.isInteger(i) && i >= 0 && i < DEMOS.length) goToRef.current(i);
        };
        window.addEventListener(EVENTO_DEMO, alPedir);
        return () => window.removeEventListener(EVENTO_DEMO, alPedir);
    }, []);

    /* ── Touch: ampliar a pantalla completa ──
       Recortada, la tarjeta enseña el detalle pero no la interfaz entera. Un
       toque la abre en fullscreen, donde el 16:9 original sí se lee: es la
       vista nativa del sistema, no hay UI que diseñar y el gesto ya se conoce.
       Aprovechamos que el toque es un gesto del usuario para activar el sonido. */
    const abrirPantallaCompleta = () => {
        const v = videoRefs[activeRef.current].current;
        if (!v) return;
        setYaAmplio(true);
        setSoundEnabled(true);

        type VideoIOS = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
        const vi = v as VideoIOS;
        if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
        // Safari de iPhone solo abre fullscreen sobre el <video>, no sobre un div.
        else if (vi.webkitEnterFullscreen) vi.webkitEnterFullscreen();
    };

    /* Al salir de pantalla completa devolvemos mudo y velocidad rápida: en el
       hero el demo es un vistazo ambiental, no una reproducción. */
    useEffect(() => {
        const alSalir = () => {
            if (!document.fullscreenElement) setSoundEnabled(false);
        };
        document.addEventListener("fullscreenchange", alSalir);
        const v0 = videoRefs[0].current;
        v0?.addEventListener("webkitendfullscreen", alSalir);
        return () => {
            document.removeEventListener("fullscreenchange", alSalir);
            v0?.removeEventListener("webkitendfullscreen", alSalir);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Touch: deslizar entre demos ──
       Mantiene la arquitectura de 3 videos con crossfade; solo traduce el gesto
       a goTo(). Solo cuenta si el movimiento es más horizontal que vertical,
       para no robarle el scroll a la página. */
    const swipe = useRef<{ x: number; y: number } | null>(null);

    const onSwipeStart = (e: React.PointerEvent) => {
        swipe.current = { x: e.clientX, y: e.clientY };
    };

    const onSwipeEnd = (e: React.PointerEvent) => {
        const ini = swipe.current;
        swipe.current = null;
        if (!ini) return;
        const dx = e.clientX - ini.x;
        const dy = e.clientY - ini.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;  // fue scroll
        e.stopPropagation();                                            // no abras fullscreen
        const n = DEMOS.length;
        goTo((activeRef.current + (dx < 0 ? 1 : n - 1)) % n);
    };

    /* El botón se revela al pasar el mouse; si el sonido está activo se queda
       visible para poder silenciar sin tener que buscarlo. */
    const soundVisible = hovering || !muted;

    return (
        <div
            className="relative mx-auto w-full max-w-4xl"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* Video + columna de sonido a su derecha. La columna ocupa sitio
                siempre (aunque esté oculta) para que revelarla no reacomode nada. */}
            <div className="flex items-center gap-3">
                <div
                    ref={cardRef}
                    onClick={coarsePointer ? abrirPantallaCompleta : undefined}
                    onPointerDown={coarsePointer ? onSwipeStart : undefined}
                    onPointerUp={coarsePointer ? onSwipeEnd : undefined}
                    /* Recorte, no escala: las grabaciones son de escritorio (16:9) y
                       a 300px de ancho su interfaz es ilegible. Con un ratio más alto
                       en móvil, object-cover recorta los lados y lo que queda —el
                       contenido, que está centrado— se ve ~1.7x más grande.
                       touch-pan-y deja pasar el scroll vertical; el swipe es horizontal. */
                    className={
                        "relative aspect-[4/5] min-w-0 flex-1 touch-pan-y overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:aspect-[4/3] lg:aspect-video" +
                        (coarsePointer ? " cursor-pointer" : "")
                    }
                >
                    {DEMOS.map((demo, i) => (
                        <video
                            key={demo.label}
                            ref={videoRefs[i]}
                            src={demo.src}
                            poster={demo.poster}
                            muted
                            playsInline
                            /* En datos móviles no bajamos un MP4 1080p entero de salida:
                               solo la cabecera, suficiente para pintar el primer cuadro. */
                            preload={i === 0 ? (coarsePointer ? "metadata" : "auto") : "none"}
                            className="absolute inset-0 h-full w-full object-cover"
                            style={{
                                objectPosition: demo.focus ?? "center",
                                opacity: active === i ? 1 : 0,
                                transition: "opacity 900ms cubic-bezier(0.4,0,0.2,1)",
                            }}
                        />
                    ))}

                    {/* En touch el control de sonido va sobre la tarjeta: la columna
                        lateral robaba 28px de un ancho de 375. Área de 44px (mínimo
                        táctil) aunque el icono mida 18. */}
                    {coarsePointer && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();   // no dispara el fullscreen de la tarjeta
                                toggleSound();
                            }}
                            aria-label={muted ? "Activar sonido del demo" : "Silenciar demo"}
                            aria-pressed={!muted}
                            /* lg:hidden además de coarsePointer: en un portátil táctil
                               (touch y >=1024) si no, saldrían el botón y la columna
                               lateral a la vez, duplicando el control. */
                            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
                            style={{
                                /* globals.css anula backdrop-filter bajo 768px, así que
                                   el fondo carga solo con la opacidad. */
                                background: "rgba(0,0,0,0.55)",
                                border: "1px solid rgba(255,255,255,0.18)",
                            }}
                        >
                            {muted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
                        </button>
                    )}

                    {/* Pista de que la tarjeta se puede ampliar. Se retira en cuanto
                        el usuario toca una vez: ya no hace falta. */}
                    {coarsePointer && !yaAmplio && (
                        <span
                            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 font-ui text-[11px] font-medium text-white/90 lg:hidden"
                            style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.14)" }}
                        >
                            Toca para ampliar
                        </span>
                    )}
                </div>

                {/* Sonido — al costado derecho del video, centrado en vertical */}
                {/* Columna de sonido solo con ratón: en un móvil el slider vertical
                    de 6px es inservible (el teléfono ya tiene botones de volumen) y
                    robaba 28px de un ancho de 375. En touch manda el botón sobre la
                    tarjeta. */}
                <div
                    className="hidden w-7 shrink-0 flex-col items-center gap-2 lg:flex"
                    style={{ pointerEvents: soundVisible ? "auto" : "none" }}
                >
                    {/* Barra vertical de volumen.
                        El div exterior solo añade área de clic a los lados
                        (px, sin py): así atinarle es fácil sin engordar la barra
                        ni descuadrar el cálculo de altura → volumen. */}
                    <div
                        role="slider"
                        tabIndex={0}
                        aria-label="Volumen"
                        aria-orientation="vertical"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(volume * 100)}
                        onFocus={() => setHovering(true)}
                        onBlur={() => setHovering(false)}
                        onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture(e.pointerId);
                            volumeFromPointer(e.clientY);
                        }}
                        onPointerMove={(e) => {
                            if (e.currentTarget.hasPointerCapture(e.pointerId)) volumeFromPointer(e.clientY);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                                e.preventDefault();
                                applyVolume(volumeRef.current + 0.05);
                            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                                e.preventDefault();
                                applyVolume(volumeRef.current - 0.05);
                            }
                        }}
                        className="group flex cursor-pointer touch-none items-center px-2 focus-visible:outline-none"
                        style={{
                            opacity: soundVisible ? 1 : 0,
                            transition: SOUND_REVEAL,
                        }}
                    >
                        <div
                            ref={trackRef}
                            className="relative h-12 w-[6px] rounded-full bg-white/25 transition-colors duration-200 group-hover:bg-white/35 group-focus-visible:ring-2 group-focus-visible:ring-white/50"
                        >
                            {/* Relleno: crece desde abajo */}
                            <div
                                className="absolute bottom-0 left-0 w-full rounded-full bg-white"
                                style={{
                                    height: `${(muted ? 0 : volume) * 100}%`,
                                    transition: "height 180ms cubic-bezier(0.22,1,0.36,1)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Icono suelto, sin círculo */}
                    <button
                        type="button"
                        onClick={toggleSound}
                        aria-label={muted ? "Activar sonido del demo" : "Silenciar demo"}
                        aria-pressed={!muted}
                        onFocus={() => setHovering(true)}
                        onBlur={() => setHovering(false)}
                        className="flex items-center justify-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        style={{
                            opacity: soundVisible ? 1 : 0,
                            transition: `${SOUND_REVEAL}, color 200ms ease`,
                        }}
                    >
                        {muted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
                    </button>
                </div>
            </div>

            {/* Selector de módulo. El ancho del video (flex-1) ya descuenta la
                columna de sonido, así que compensamos para centrar respecto al
                video y no respecto al bloque completo. */}
            <div className="mt-5 flex items-center justify-center pr-8">
                <div className="flex items-center gap-1">
                    {DEMOS.map((demo, i) => {
                        const isActive = active === i;
                        // Preselección: el punto bajo el cursor adelanta cómo se
                        // vería seleccionado (mismo color del módulo, a media tinta).
                        const isPreselected = preselected === i && !isActive;
                        return (
                            <button
                                key={demo.label}
                                type="button"
                                aria-label={`Ver demo de ${demo.label}`}
                                aria-current={isActive}
                                onClick={() => goTo(i)}
                                onMouseEnter={() => setPreselected(i)}
                                onMouseLeave={() => setPreselected(null)}
                                onFocus={() => {
                                    setHovering(true);
                                    setPreselected(i);
                                }}
                                onBlur={() => {
                                    setHovering(false);
                                    setPreselected(null);
                                }}
                                /* Área táctil de 44px (el mínimo recomendado) sin que
                                   el indicador visual crezca: el alto y el padding
                                   son mayores en touch, la píldora sigue igual. */
                                className="group flex h-11 items-center px-3 focus-visible:outline-none lg:h-5 lg:px-1.5"
                            >
                                <motion.span
                                    className="block h-1.5 rounded-full"
                                    animate={{
                                        width: isActive ? 30 : isPreselected ? 18 : 8,
                                        backgroundColor: isActive
                                            ? demo.accent
                                            : isPreselected
                                                ? `${demo.accent}99`
                                                : "rgba(255,255,255,0.18)",
                                    }}
                                    /* Muelle: el punto que sale se encoge mientras el
                                       que entra se estira, y los vecinos se reacomodan
                                       con la misma física. */
                                    transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
