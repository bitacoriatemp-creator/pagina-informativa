"use client";

import { useEffect, useState } from "react";
import { leerCuentaDelNavegador, mismaCuenta, type Cuenta } from "@/lib/cuenta";

/**
 * La cuenta de la app abierta en este navegador (cookie `bitacoria_cuenta`), o
 * `null`. Va aparte de src/lib/cuenta.ts porque aquel corre también en el
 * middleware y no debe arrastrar React.
 *
 * Se lee DESPUÉS de montar: la página se genera estática y el servidor no sabe
 * de nadie, así que el primer render (servidor y cliente) es siempre "sin
 * cuenta" y no hay desajuste de hidratación. Se vuelve a leer al regresar a la
 * pestaña o al restaurarla del historial (bfcache): si se cerró sesión en la
 * app, la cuenta desaparece de la barra sin recargar, y si cambió la foto o el
 * nombre, se repinta.
 */
export function useCuenta(): Cuenta | null {
    const [cuenta, setCuenta] = useState<Cuenta | null>(null);

    useEffect(() => {
        const releer = () => {
            const nueva = leerCuentaDelNavegador();
            setCuenta((actual) => (mismaCuenta(actual, nueva) ? actual : nueva));
        };
        const alVolver = () => {
            if (document.visibilityState === "visible") releer();
        };
        releer();
        window.addEventListener("focus", releer);
        window.addEventListener("pageshow", releer);
        document.addEventListener("visibilitychange", alVolver);
        return () => {
            window.removeEventListener("focus", releer);
            window.removeEventListener("pageshow", releer);
            document.removeEventListener("visibilitychange", alVolver);
        };
    }, []);

    return cuenta;
}
