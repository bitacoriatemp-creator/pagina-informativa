/**
 * Cliente Supabase con service_role — SOLO usar en Server Components y
 * Route Handlers. NUNCA importar desde un Client Component porque expondría
 * el service_role key al browser.
 *
 * Service role bypassa RLS, así que puede leer la tabla `participantes`
 * (cuya RLS está bloqueada para anon/authenticated en producción).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (cached) return cached;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
        throw new Error(
            "Falta NEXT_PUBLIC_SUPABASE_URL en .env.local — copia .env.local.example y rellena."
        );
    }
    if (!serviceKey || serviceKey === "PEGAR_AQUI_EL_SERVICE_ROLE_KEY") {
        throw new Error(
            "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local. Conseguirlo en " +
            "Supabase Dashboard → Project Settings → API → service_role (reveal)."
        );
    }

    cached = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
}

/** Fila de la tabla `participantes`. */
export interface Participante {
    id?: number;
    nombre: string | null;
    email: string;
    perfil: string | null;
    obras_activas: number | null;
    interes_compra: string | null;
    created_at: string | null;
}

/** Fila de la tabla `esia_registros`. */
export interface EsiaRegistro {
    id: number;
    tipo: "alumno" | "profesor" | "externo";
    nombre: string;
    email: string;
    sesion: "matutino" | "vespertino";
    modalidad: "asiento" | "de_pie";
    numero_asiento: number | null;
    merch: "playera" | "lapicero" | "ninguno";
    talla: "CH" | "M" | "G" | "XG" | null;
    genero: "hombre" | "mujer" | "no_especifica";
    created_at: string;
}
