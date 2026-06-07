"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { assetPath } from "@/lib/assetPath";

/* ══════════════════════════════════════════════════════════════
   WorldAdaptiveSection — Alcance Global
   ──────────────────────────────────────────────────────────────
   Layout: sticky-track 160vh (scroll retention) + sticky inner
   h-screen con todo el contenido cabiendo en un viewport.
   Globe wireframe 3D con fronteras REALES de países, los 8
   activos iluminados con fill + glow border + dot pulsante.
   Background: particles café drift en canvas separado.
   ══════════════════════════════════════════════════════════════ */

interface Country {
    code: string;
    name: string;
    flag: string;
    isoNumeric: string;
}

const ACTIVE_COUNTRIES: Country[] = [
    { code: "us", name: "Estados Unidos", flag: "🇺🇸", isoNumeric: "840" },
    { code: "mx", name: "México",         flag: "🇲🇽", isoNumeric: "484" },
    { code: "gt", name: "Guatemala",      flag: "🇬🇹", isoNumeric: "320" },
    { code: "co", name: "Colombia",       flag: "🇨🇴", isoNumeric: "170" },
    { code: "ec", name: "Ecuador",        flag: "🇪🇨", isoNumeric: "218" },
    { code: "pe", name: "Perú",           flag: "🇵🇪", isoNumeric: "604" },
    { code: "bo", name: "Bolivia",        flag: "🇧🇴", isoNumeric: "068" },
    { code: "py", name: "Paraguay",       flag: "🇵🇾", isoNumeric: "600" },
];

const ACTIVE_IDS = new Set(ACTIVE_COUNTRIES.map((c) => c.isoNumeric));

const ACTIVE_DOTS: { lat: number; lng: number; idx: number }[] = [
    { lat: 38,  lng: -98,  idx: 0 },
    { lat: 23,  lng: -102, idx: 1 },
    { lat: 15,  lng: -90,  idx: 2 },
    { lat: 4,   lng: -74,  idx: 3 },
    { lat: -2,  lng: -78,  idx: 4 },
    { lat: -10, lng: -76,  idx: 5 },
    { lat: -16, lng: -65,  idx: 6 },
    { lat: -23, lng: -58,  idx: 7 },
];

/* ── Types for decoded TopoJSON ── */
type LngLat = [number, number];
interface CountryPolygon {
    id: string;
    name: string;
    rings: LngLat[][];
}
interface TopoJSON {
    type: "Topology";
    arcs: number[][][];
    transform: { scale: [number, number]; translate: [number, number] };
    objects: {
        countries: {
            type: "GeometryCollection";
            geometries: Array<{
                type: "Polygon" | "MultiPolygon";
                arcs: number[][] | number[][][];
                id?: string;
                properties?: { name?: string };
            }>;
        };
    };
}

function decodeTopo(topo: TopoJSON): CountryPolygon[] {
    const [sx, sy] = topo.transform.scale;
    const [tx, ty] = topo.transform.translate;

    const arcs: LngLat[][] = topo.arcs.map((arc) => {
        let x = 0;
        let y = 0;
        return arc.map(([dx, dy]) => {
            x += dx;
            y += dy;
            return [x * sx + tx, y * sy + ty] as LngLat;
        });
    });

    const flattenArcs = (arcRefs: number[]): LngLat[] => {
        const coords: LngLat[] = [];
        for (const ref of arcRefs) {
            const reversed = ref < 0;
            const idx = reversed ? ~ref : ref;
            const arc = arcs[idx];
            if (!arc) continue;
            const points = reversed ? arc.slice().reverse() : arc;
            const start = coords.length > 0 ? 1 : 0;
            for (let i = start; i < points.length; i++) coords.push(points[i]);
        }
        return coords;
    };

    const out: CountryPolygon[] = [];
    for (const geom of topo.objects.countries.geometries) {
        const id = geom.id ?? "";
        const name = geom.properties?.name ?? "";

        if (geom.type === "Polygon") {
            const rings = (geom.arcs as number[][]).map((arcRefs) => flattenArcs(arcRefs));
            out.push({ id, name, rings });
        } else if (geom.type === "MultiPolygon") {
            for (const poly of geom.arcs as number[][][]) {
                const rings = poly.map((arcRefs) => flattenArcs(arcRefs));
                out.push({ id, name, rings });
            }
        }
    }
    return out;
}

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
    }),
};

/* ── Atmospheric micro-particles (café palette, drift via framer-motion) ──
   Pattern copiado de SmartBimSyncSection: divs absolutos + boxShadow + animate
   con x/y/opacity loops largos (22-32s). Densidad ~12 partículas para llenar
   el viewport completo. */
const CAFE_PARTICLES = [
    { x: "10%", y: "18%", size: 2.2, color: "#C39767", dur: 22, dx: 30, dy: -20 },
    { x: "72%", y: "14%", size: 1.8, color: "#A87B4C", dur: 28, dx: -25, dy: 15 },
    { x: "88%", y: "70%", size: 2,   color: "#D4A878", dur: 25, dx: -20, dy: -25 },
    { x: "20%", y: "78%", size: 1.5, color: "#8B5C3B", dur: 30, dx: 35, dy: -15 },
    { x: "48%", y: "8%",  size: 1.8, color: "#C39767", dur: 26, dx: -15, dy: 30 },
    { x: "62%", y: "88%", size: 1.5, color: "#A87B4C", dur: 24, dx: 20, dy: -30 },
    { x: "32%", y: "42%", size: 1.6, color: "#D4A878", dur: 32, dx: -18, dy: 22 },
    { x: "82%", y: "38%", size: 1.4, color: "#C39767", dur: 27, dx: 15, dy: -18 },
    { x: "6%",  y: "55%", size: 1.7, color: "#A87B4C", dur: 29, dx: 22, dy: 18 },
    { x: "94%", y: "26%", size: 1.5, color: "#8B5C3B", dur: 31, dx: -28, dy: 20 },
    { x: "52%", y: "65%", size: 1.6, color: "#D4A878", dur: 23, dx: 18, dy: -22 },
    { x: "16%", y: "92%", size: 1.4, color: "#C39767", dur: 33, dx: 24, dy: -16 },
] as const;

export default function WorldAdaptiveSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const globeCanvasRef = useRef<HTMLCanvasElement>(null);
    const globeContainerRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2 });

    const [worldData, setWorldData] = useState<CountryPolygon[] | null>(null);

    /* ── Fetch + decode TopoJSON ── */
    useEffect(() => {
        let cancelled = false;
        fetch(assetPath("/world-borders.json"))
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status} fetching world-borders.json`);
                return res.json();
            })
            .then((topo: TopoJSON) => {
                if (cancelled) return;
                setWorldData(decodeTopo(topo));
            })
            .catch((err) => console.error("WorldAdaptiveSection: failed borders", err));
        return () => { cancelled = true; };
    }, []);

    /* ══════════════════════════════════════════════
       GLOBE CANVAS — fronteras reales + dots pulsantes
       ══════════════════════════════════════════════ */
    useEffect(() => {
        const canvas = globeCanvasRef.current;
        const container = globeContainerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let W = 0;
        let H = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let rafId: number | null = null;
        let rotation = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const newW = rect.width;
            const newH = rect.height;
            if (newW <= 0 || newH <= 0) return;
            if (newW === W && newH === H) return;
            W = newW;
            H = newH;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener("resize", resize);
        const ro = new ResizeObserver(() => resize());
        ro.observe(container);

        const project = (lat: number, lng: number, cx: number, cy: number, radius: number) => {
            const latRad = (lat * Math.PI) / 180;
            const lngRad = (lng * Math.PI) / 180 + rotation;
            const cosLat = Math.cos(latRad);
            const x = cosLat * Math.sin(lngRad);
            const y = -Math.sin(latRad);
            const z = cosLat * Math.cos(lngRad);
            return { x: cx + x * radius, y: cy + y * radius, z };
        };

        const drawRing = (ring: LngLat[], cx: number, cy: number, radius: number) => {
            let started = false;
            for (let i = 0; i < ring.length; i++) {
                const [lng, lat] = ring[i];
                const p = project(lat, lng, cx, cy, radius);
                if (p.z > 0) {
                    if (started) ctx.lineTo(p.x, p.y);
                    else { ctx.moveTo(p.x, p.y); started = true; }
                } else {
                    started = false;
                }
            }
        };

        let lastTime = performance.now();
        const tick = () => {
            const now = performance.now();
            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;
            rotation += dt * 0.13;

            ctx.clearRect(0, 0, W, H);

            const cx = W / 2;
            const cy = H / 2;
            const radius = Math.min(W, H) * 0.38;

            // ── LAT/LONG GRID sutil ──
            ctx.strokeStyle = "rgba(195, 151, 103, 0.10)";
            ctx.lineWidth = 1;
            for (let lat = -75; lat <= 75; lat += 15) {
                ctx.beginPath();
                let started = false;
                for (let lng = -180; lng <= 180; lng += 4) {
                    const p = project(lat, lng, cx, cy, radius);
                    if (p.z > 0) {
                        if (started) ctx.lineTo(p.x, p.y);
                        else { ctx.moveTo(p.x, p.y); started = true; }
                    } else {
                        if (started) ctx.stroke();
                        started = false;
                        ctx.beginPath();
                    }
                }
                if (started) ctx.stroke();
            }
            for (let lng = -180; lng <= 180; lng += 15) {
                ctx.beginPath();
                let started = false;
                for (let lat = -90; lat <= 90; lat += 4) {
                    const p = project(lat, lng, cx, cy, radius);
                    if (p.z > 0) {
                        if (started) ctx.lineTo(p.x, p.y);
                        else { ctx.moveTo(p.x, p.y); started = true; }
                    } else {
                        if (started) ctx.stroke();
                        started = false;
                        ctx.beginPath();
                    }
                }
                if (started) ctx.stroke();
            }

            // ── COUNTRY BORDERS ──
            if (worldData) {
                ctx.strokeStyle = "rgba(195, 151, 103, 0.38)";
                ctx.lineWidth = 0.8;
                for (const country of worldData) {
                    if (ACTIVE_IDS.has(country.id)) continue;
                    for (const ring of country.rings) {
                        ctx.beginPath();
                        drawRing(ring, cx, cy, radius);
                        ctx.stroke();
                    }
                }

                // Active countries — fill + glow border
                for (const country of worldData) {
                    if (!ACTIVE_IDS.has(country.id)) continue;
                    for (const ring of country.rings) {
                        ctx.fillStyle = "rgba(220, 180, 130, 0.22)";
                        ctx.beginPath();
                        drawRing(ring, cx, cy, radius);
                        ctx.closePath();
                        ctx.fill();

                        ctx.shadowColor = "rgba(255, 210, 140, 0.6)";
                        ctx.shadowBlur = 8;
                        ctx.strokeStyle = "rgba(255, 220, 170, 0.95)";
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        drawRing(ring, cx, cy, radius);
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // ── EQUATOR OUTLINE ──
            ctx.strokeStyle = "rgba(195, 151, 103, 0.45)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // ── PULSE DOTS ──
            const time = now / 1000;
            for (const dot of ACTIVE_DOTS) {
                const p = project(dot.lat, dot.lng, cx, cy, radius);
                if (p.z > 0.05) {
                    const pulse = 0.7 + 0.3 * Math.sin(time * 2 + dot.idx * 0.7);
                    const visibility = Math.min(1, p.z * 3);

                    const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20);
                    halo.addColorStop(0,   `rgba(255, 220, 150, ${0.6 * pulse * visibility})`);
                    halo.addColorStop(0.4, `rgba(220, 180, 130, ${0.25 * pulse * visibility})`);
                    halo.addColorStop(1,   "rgba(195, 151, 103, 0)");
                    ctx.fillStyle = halo;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = `rgba(255, 240, 210, ${0.95 * pulse * visibility})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = `rgba(255, 250, 230, ${0.9 * visibility})`;
                    ctx.beginPath();
                    ctx.arc(p.x - 0.8, p.y - 0.8, 1.1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // ── WHIRL ARCS ──
            const whirl1Radius = radius * 1.14;
            const whirl1Phase = -rotation * 2.5;
            ctx.strokeStyle = "rgba(195, 151, 103, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, whirl1Radius, whirl1Phase, whirl1Phase + Math.PI * 0.65);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, whirl1Radius, whirl1Phase + Math.PI * 0.9, whirl1Phase + Math.PI * 1.55);
            ctx.stroke();

            const whirl2Radius = radius * 1.28;
            const whirl2Phase = rotation * 1.7 + Math.PI / 3;
            ctx.strokeStyle = "rgba(220, 180, 130, 0.18)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, whirl2Radius, whirl2Phase, whirl2Phase + Math.PI * 0.45);
            ctx.stroke();

            const whirl3Radius = radius * 1.44;
            const whirl3Phase = -rotation * 0.9;
            ctx.strokeStyle = "rgba(195, 151, 103, 0.10)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(cx, cy, whirl3Radius, whirl3Phase, whirl3Phase + Math.PI * 0.35);
            ctx.stroke();

            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("resize", resize);
            ro.disconnect();
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [worldData]);

    return (
        <section
            ref={sectionRef}
            id="alcance-global"
            className="relative w-full"
            style={{
                backgroundColor: "#0a0503",
                height: "160vh", // Scroll retention track — el imán de scroll
            }}
        >
            {/* ── STICKY WRAPPER — fija contenido al viewport durante el track ──
                Convertido en motion.div para fade-in elegante de toda la sección
                cuando entra en viewport (sin "salir precargada"). */}
            <motion.div
                ref={stickyRef}
                className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.25, 0.4, 0.25, 1] as const }}
            >
                {/* ── LAYER 1: Atmospheric particles café (drift via framer-motion) ──
                    Mismo patrón que SmartBimSyncSection: divs absolutos con boxShadow
                    glow + animate x/y/opacity en loops largos. Paleta café/bronze. */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                    {CAFE_PARTICLES.map((p, i) => (
                        <motion.div
                            key={`p${i}`}
                            className="absolute rounded-full"
                            style={{
                                left: p.x,
                                top: p.y,
                                width: p.size,
                                height: p.size,
                                background: p.color,
                                boxShadow: `0 0 8px ${p.color}`,
                            }}
                            animate={{
                                x: [0, p.dx, 0],
                                y: [0, p.dy, 0],
                                opacity: [0.15, 0.45, 0.15],
                            }}
                            transition={{
                                duration: p.dur,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* ── LAYER 2: Tech grid sutil ── */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: [
                            "repeating-linear-gradient(to right, rgba(195,151,103,0.03) 0 1px, transparent 1px 80px)",
                            "repeating-linear-gradient(to bottom, rgba(195,151,103,0.03) 0 1px, transparent 1px 80px)",
                        ].join(","),
                    }}
                />

                {/* ── LAYER 3: Vignette central ── */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 55% at 50% 55%, rgba(195,151,103,0.05) 0%, transparent 65%)",
                    }}
                />

                {/* ── CONTENT — compacto, todo cabe en 100vh ── */}
                <div className="relative z-10 mx-auto w-full max-w-5xl px-6 flex flex-col items-center text-center">
                    {/* Eyebrow */}
                    <motion.p
                        custom={0}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-3 font-ui text-[10px] uppercase tracking-[0.35em]"
                        style={{ color: "rgba(195,151,103,0.6)" }}
                    >
                        Alcance Global
                    </motion.p>

                    {/* Headline */}
                    <motion.h2
                        custom={1}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-5 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white/90 sm:text-4xl lg:text-5xl"
                    >
                        Habla la{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, #C39767 0%, #E8D5B7 50%, #C39767 100%)",
                            }}
                        >
                            normativa
                        </span>
                        <br />
                        de cada país.
                    </motion.h2>

                    {/* Globe */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
                        transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] as const }}
                        ref={globeContainerRef}
                        className="relative mb-5"
                        style={{
                            width: "min(420px, 52vh)",
                            height: "min(420px, 52vh)",
                        }}
                    >
                        <canvas
                            ref={globeCanvasRef}
                            className="absolute inset-0 w-full h-full"
                        />

                        {/* Tag flotante "Sincronizando normativas" */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: 1.4, duration: 0.8 }}
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 font-ui text-[9px] uppercase tracking-[0.25em] whitespace-nowrap"
                            style={{
                                background: "rgba(12, 6, 4, 0.7)",
                                border: "1px solid rgba(195, 151, 103, 0.25)",
                                color: "rgba(195, 151, 103, 0.85)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                            }}
                        >
                            <span
                                className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                                style={{ background: "#c39767", boxShadow: "0 0 8px #c39767" }}
                            />
                            Sincronizando normativas locales
                        </motion.div>
                    </motion.div>

                    {/* Sub-text "8 países activos hoy" */}
                    <motion.p
                        custom={2}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-4 text-xs uppercase tracking-[0.2em] md:text-sm"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                        8 países con normativas activas —{" "}
                        <span style={{ color: "rgba(195,151,103,0.85)" }}>El mapa sigue creciendo.</span>
                    </motion.p>

                    {/* Country Chips — wrapper w-full + justify-center para centrado uniforme */}
                    <motion.div
                        custom={3}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="mb-5 w-full flex flex-wrap items-center justify-center gap-1.5"
                    >
                        {ACTIVE_COUNTRIES.map((c, i) => (
                            <motion.span
                                key={c.code}
                                initial={{ opacity: 0, y: 6 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                                transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                                className="inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 text-[11px] md:text-[12px] leading-none"
                                style={{
                                    background: "rgba(195, 151, 103, 0.08)",
                                    border: "1px solid rgba(195, 151, 103, 0.18)",
                                    color: "rgba(255, 255, 255, 0.78)",
                                }}
                            >
                                <span
                                    className="uppercase tracking-wider leading-none"
                                    style={{ color: "rgba(195, 151, 103, 0.7)" }}
                                >
                                    {c.code}
                                </span>
                                <span className="leading-none">{c.name}</span>
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* CTA — envuelto en div w-full justify-center para alineación
                        idéntica a las chips (ambos como filas full-width centradas) */}
                    <motion.div
                        custom={4}
                        variants={fadeUp}
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        className="w-full flex justify-center"
                    >
                        <a
                            href="/registro"
                            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-ui text-[11px] uppercase tracking-[0.25em] transition-all duration-300"
                            style={{
                                background: "rgba(195, 151, 103, 0.08)",
                                border: "1px solid rgba(195, 151, 103, 0.35)",
                                color: "#c39767",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.18)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.6)";
                                e.currentTarget.style.color = "#f0d9b5";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(195, 151, 103, 0.08)";
                                e.currentTarget.style.borderColor = "rgba(195, 151, 103, 0.35)";
                                e.currentTarget.style.color = "#c39767";
                            }}
                        >
                            <span className="leading-none">¿Construyes en otro país? Lo agregamos</span>
                            <ArrowRight
                                className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                                strokeWidth={2.2}
                            />
                        </a>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
