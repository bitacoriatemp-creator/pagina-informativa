import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MarketingShell from "@/components/ui/MarketingShell";
import Revelar from "@/components/ui/Revelar";
import { assetPath } from "@/lib/assetPath";

/* Antes esto era un modal: no se indexaba, no se podía compartir por enlace
   y no salía en Google. Como página, las fotos pueden respirar. */
export const metadata: Metadata = {
    title: "Quiénes somos — BitacorIA",
    description:
        "Nacimos en obra, no en una oficina. Los fundadores de BitacorIA, la plataforma que digitaliza la bitácora de obra con IA.",
    alternates: { canonical: "/nosotros" },
    openGraph: {
        type: "profile",
        url: "https://bitacoria.com/nosotros",
        siteName: "BitacorIA",
        locale: "es_MX",
        title: "Quiénes somos — BitacorIA",
        description: "Nacimos en obra, no en una oficina. Somos ingenieros potenciando a ingenieros.",
        images: [{ url: "/images/nosotros/fundadores.webp", width: 2000, height: 2667, alt: "Los fundadores de BitacorIA" }],
    },
};

/* Las fotos van COMPLETAS: son verticales, y recortarlas a pantalla ancha
   cortaba a las personas.
   El alto se limita por el ANCHO del contenedor, no con max-h sobre la
   imagen: con `w-auto` el navegador da 0x0 a la imagen hasta que carga y la
   maqueta salta. Las tres son 3:4, así que un ancho de 0.75 × alto deseado
   deja exactamente la altura buscada y reserva el hueco desde el principio. */
const marcoFoto =
    "h-auto w-full rounded-2xl border border-white/[0.08] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]";

const FUNDADORES = [
    {
        n: "01",
        foto: "/images/nosotros/juan-carlos.webp",
        ancho: 1400,
        alto: 1867,
        nombre: "Juan Carlos Díaz López",
        titulo: "Ing. Civil",
        cargo: "Fundador y CEO",
        texto: "Puso la obra en la mesa: qué se documenta, qué se firma y qué no puede fallar cuando el concreto ya está colado.",
    },
    {
        n: "02",
        foto: "/images/nosotros/luis-felipe.webp",
        ancho: 821,
        alto: 1097,
        nombre: "Luis Felipe Ramírez Heredia",
        titulo: "Ing. en Comunicaciones y Electrónica",
        cargo: "Fundador y CTO",
        texto: "Convirtió esa obra en software: la IA que lee la foto, redacta la bitácora y cuadra el cronograma.",
    },
];

export default function NosotrosPage() {
    return (
        <MarketingShell>
            {/* ── Portada: la foto es el hero ─────────────────────────────── */}
            {/* En lg la sección mide justo una pantalla y la foto la llena de
                alto; el logo vive a la izquierda, así que puede llegar al borde
                superior sin taparlo. */}
            {/* lg:px-10, no px-16: el texto arranca más a la izquierda. La barra
                usa el mismo margen fuera de la home, así que logo y titular
                siguen a plomo. */}
            <section className="px-6 pb-20 pt-32 md:px-10 lg:px-10 lg:py-0">
                <div className="mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:min-h-[100dvh] lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)] lg:gap-14">
                    <Revelar>
                        <p className="mb-3 font-ui text-[12px] uppercase tracking-[0.3em] text-[#c39767]">
                            Nosotros
                        </p>
                        <h1 className="mb-6 font-display text-4xl font-extrabold uppercase leading-[1.06] tracking-tight text-[#f5f0e8] sm:text-5xl lg:text-6xl">
                            Nacimos en obra,
                            <br />
                            <span className="text-gradient">no en una oficina.</span>
                        </h1>
                        <p className="max-w-md text-[15px] leading-relaxed text-white/60 lg:text-base">
                            Somos dos ingenieros que se cansaron de ver la obra documentarse de
                            memoria, tarde y en la noche. BitacorIA es lo que construimos para
                            arreglarlo.
                        </p>
                    </Revelar>

                    {/* max-w-[75vh] = 100vh de alto en una imagen 3:4: llena la
                        pantalla sin recortar. El límite va al ANCHO y no con
                        max-h, para que el hueco quede reservado antes de que la
                        foto cargue y la maqueta no salte.
                        El degradado hacia la izquierda y la ausencia de marco
                        viven en .foto-portada (globals.css) y solo desde lg: en
                        una columna la máscara se comía al fundador de ese lado,
                        porque no hay titular con el que fundirse. La máscara no
                        recorta — la foto sigue entera. */}
                    <Revelar delay={0.12} className="mx-auto w-full max-w-[75vh]">
                        <Image
                            src={assetPath("/images/nosotros/fundadores.webp")}
                            alt="Juan Carlos Díaz López y Luis Felipe Ramírez Heredia tras el lanzamiento en ESIA Zacatenco, IPN"
                            width={2000}
                            height={2667}
                            priority
                            sizes="(max-width: 1024px) 92vw, 52vw"
                            className="foto-portada h-auto w-full rounded-2xl"
                        />
                    </Revelar>
                </div>
            </section>

            {/* ── Los fundadores: foto y texto entran juntos al scrollear ── */}
            {FUNDADORES.map(({ n, foto, ancho, alto, nombre, titulo, cargo, texto }, i) => (
                <section key={n} className="px-6 py-16 md:px-10 lg:px-16 lg:py-24">
                    <div
                        className={`mx-auto grid w-full max-w-[1600px] items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                            /* Alterna el lado para que las dos fichas no se lean
                               como la misma plantilla repetida. */
                            i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                        }`}
                    >
                        {/* max-w-[51vh] = 68vh de alto en 3:4. */}
                        <Revelar className="mx-auto w-full max-w-[51vh]">
                            <Image
                                src={assetPath(foto)}
                                alt={`${nombre}, ${cargo} de BitacorIA`}
                                width={ancho}
                                height={alto}
                                sizes="(max-width: 1024px) 92vw, 46vw"
                                className={marcoFoto}
                            />
                        </Revelar>

                        <Revelar delay={0.15}>
                            <div className="flex items-baseline gap-4">
                                <span className="font-mono text-[13px] tracking-[0.18em] text-[#c39767]/70">
                                    {n}
                                </span>
                                <div>
                                    <h2 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight text-[#f5f0e8] sm:text-3xl">
                                        {nombre}
                                    </h2>
                                    <p className="mt-2 text-[15px] text-white/55">
                                        {titulo} <span className="text-white/25">·</span>{" "}
                                        <span className="text-[#c39767]">{cargo}</span>
                                    </p>
                                    <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
                                        {texto}
                                    </p>
                                </div>
                            </div>
                        </Revelar>
                    </div>
                </section>
            ))}

            {/* ── Cierre ── */}
            <section className="px-6 py-24 md:px-10 lg:px-16 lg:py-32">
                <Revelar className="mx-auto max-w-2xl text-center">
                    <p className="mb-8 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-[#f5f0e8] sm:text-3xl">
                        Somos ingenieros
                        <br />
                        potenciando a ingenieros.
                    </p>
                    <p className="mb-10 text-[15px] leading-relaxed text-white/55">
                        La IA propone, el ingeniero firma. Nunca al revés.
                    </p>
                    <Link
                        href="/registro"
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-[#f5f0e8] px-8 text-[15px] font-semibold text-[#1a120c] transition-colors duration-200 hover:bg-white"
                    >
                        Solicitar demo
                    </Link>
                </Revelar>
            </section>
        </MarketingShell>
    );
}
