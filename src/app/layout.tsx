import type { Metadata } from "next";
import { Kumbh_Sans, Orbitron, Teko, Roboto_Mono } from "next/font/google";
import LenisProvider from "@/components/ui/LenisProvider";
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
  title: "BitacorIA — Inteligencia de Campo para Construcción",
  description:
    "Plataforma de Field Intelligence que digitaliza y automatiza la gestión de bitácoras de obra con IA. Control total de tu operación en campo.",
  keywords: [
    "bitácora de obra",
    "inteligencia artificial",
    "construcción",
    "field intelligence",
    "gestión de obra",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark scroll-smooth ${kumbhSans.variable} ${orbitron.variable} ${teko.variable} ${robotoMono.variable}`}
    >
      <body className="font-sans antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
