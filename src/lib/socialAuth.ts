/* ══════════════════════════════════════════════════════════════
   socialAuth — Login social vía Supabase Auth (Google; Apple después)
   ──────────────────────────────────────────────────────────────
   Diseñado para degradar con gracia: si falta el anon key o el
   proveedor no está habilitado en Supabase, devuelve false y el
   caller abre el formulario de registro normal (sin romper nada).
   ══════════════════════════════════════════════════════════════ */

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/* Import perezoso: supabase-js (~30kB gz) no entra al bundle inicial;
   se descarga en background la primera vez que se necesita. */
async function getClient() {
    const { supabase } = await import("./supabase");
    return supabase;
}

/** ¿Hay anon key real configurada? (los JWT de Supabase miden >100 chars) */
const hasRealAnonKey = () => ANON_KEY.length > 60;

/** Consulta a Supabase si el proveedor está habilitado (no rompe si falla). */
async function isProviderEnabled(provider: "google" | "apple"): Promise<boolean> {
    if (!SUPA_URL || !hasRealAnonKey()) return false;
    try {
        const res = await fetch(`${SUPA_URL}/auth/v1/settings`, {
            headers: { apikey: ANON_KEY },
        });
        if (!res.ok) return false;
        const j = await res.json();
        return !!j?.external?.[provider];
    } catch {
        return false;
    }
}

/**
 * Inicia el login con Google. Devuelve `false` si no se pudo iniciar
 * (sin anon key / proveedor deshabilitado / error) para que el caller
 * haga fallback al formulario. Si devuelve `true`, el navegador ya
 * está redirigiendo a Google.
 */
export async function signInWithGoogle(): Promise<boolean> {
    if (!(await isProviderEnabled("google"))) return false;
    const supabase = await getClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
    });
    return !error;
}

/** Sesión activa (si la hay) tras volver del OAuth. Local, no rompe sin red. */
export async function getSessionUser() {
    try {
        // Sin anon key real no hay sesiones OAuth posibles: evita siquiera
        // descargar supabase-js en ese caso.
        if (!hasRealAnonKey()) return null;
        const supabase = await getClient();
        const { data } = await supabase.auth.getSession();
        return data.session?.user ?? null;
    } catch {
        return null;
    }
}

/** Suscripción a cambios de sesión (p.ej. SIGNED_IN al volver de Google). */
export function onAuthChange(cb: (user: { email?: string; user_metadata?: Record<string, unknown> } | null) => void) {
    if (!hasRealAnonKey()) return () => {};
    let cleanup = () => {};
    import("./supabase")
        .then(({ supabase }) => {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                cb(session?.user ?? null);
            });
            cleanup = () => data.subscription.unsubscribe();
        })
        .catch(() => { /* sin supabase, sin auth social */ });
    return () => cleanup();
}
