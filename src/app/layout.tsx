import type { Metadata, Viewport } from "next";
import { Kumbh_Sans, Orbitron, Teko, Roboto_Mono } from "next/font/google";
import LenisProvider from "@/components/ui/LenisProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const kumbhSans = Kumbh_Sans({
  subsets: ["latin"],
  variable: "--font-kumbh",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-teko",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bitacoria.com"),
  title: "BitacorIA — Inteligencia de Campo para Construcción",
  description:
    "Plataforma de Field Intelligence que digitaliza y automatiza la gestión de bitácoras de obra con IA. Control total de tu operación en campo.",
  keywords: [
    "bitácora de obra",
    "inteligencia artificial",
    "construcción",
    "field intelligence",
    "gestión de obra",
    "precios unitarios",
    "catálogo de conceptos",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://bitacoria.com",
    siteName: "BitacorIA",
    locale: "es_MX",
    title: "BitacorIA — Inteligencia de Campo para Construcción",
    description:
      "Bitácoras, catálogos de conceptos y estimaciones de obra con IA. Regístrate y agenda tu demo.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BitacorIA — Auditoría inteligente para tu obra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BitacorIA — Inteligencia de Campo para Construcción",
    description:
      "Bitácoras, catálogos de conceptos y estimaciones de obra con IA.",
    images: ["/images/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark overflow-x-clip ${kumbhSans.variable} ${orbitron.variable} ${teko.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased overflow-x-clip" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BitacorIA",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://bitacoria.com",
              inLanguage: "es",
              description:
                "Plataforma de Field Intelligence que digitaliza y automatiza la gestión de bitácoras de obra con IA.",
            }),
          }}
        />
        <ThemeProvider>
          <LenisProvider>{children}</LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
