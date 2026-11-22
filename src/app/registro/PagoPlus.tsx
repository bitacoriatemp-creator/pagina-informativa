"use client";

import { ExternalLink } from "lucide-react";
import type { PagoEnLinea } from "@/lib/pagoMercadoPago";
import { botonCrema } from "./botones";

/* "Último paso" de la hoja de Plus (2026-11-22): con la solicitud ya guardada,
   ofrece pagar en Mercado Pago. Se abre en una pestaña nueva para que esta
   página, con lo que sigue, se quede a la vista. Vive en src/app para que
   Tailwind genere sus clases. */
export default function PagoPlus({ pago }: { pago: PagoEnLinea }) {
    return (
        <div className="mb-6 rounded-2xl border border-[#c39767]/25 bg-white/[0.03] p-5" data-pago="plus">
            <p className="font-ui text-[11px] uppercase tracking-[0.3em] text-[#c39767]">Último paso</p>
            <p className="mt-2 text-[17px] font-semibold text-white/90">Plan Plus · {pago.total}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Pagas con tarjeta de crédito o débito en Mercado Pago, sin crear cuenta. Se abre en una pestaña
                nueva; después te escribimos para dejar lista tu cuenta.
            </p>
            <a href={pago.url} target="_blank" rel="noopener noreferrer" className={`mt-4 gap-2 ${botonCrema}`}>
                <ExternalLink size={16} strokeWidth={2} aria-hidden />
                Pagar Plus con Mercado Pago
            </a>
        </div>
    );
}
