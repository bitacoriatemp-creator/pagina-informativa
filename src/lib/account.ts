import { useEffect, useState } from "react";
import { getSessionUser, onAuthChange } from "./socialAuth";

/* ══════════════════════════════════════════════════════════════
   account — "quién está dentro" para el navbar
   ──────────────────────────────────────────────────────────────
   Dos fuentes, en orden de preferencia:
     1. Sesión OAuth de Supabase (Google) → trae foto, nombre y correo.
     2. Registro guardado localmente (correo) → muestra inicial.
   Reactivo vía evento propio + cambios de sesión de Supabase.
   ══════════════════════════════════════════════════════════════ */

export type Account = { email: string; nombre?: string; avatar?: string };

const KEY = "bitacoria_account";
const EVT = "bitacoria:account";

export function getStoredAccount(): Account | null {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Account) : null;
    } catch {
        return null;
    }
}

export function setStoredAccount(acc: Account) {
    try { localStorage.setItem(KEY, JSON.stringify(acc)); } catch { /* */ }
    try { window.dispatchEvent(new CustomEvent(EVT)); } catch { /* */ }
}

export function clearStoredAccount() {
    try { localStorage.removeItem(KEY); } catch { /* */ }
    try { localStorage.removeItem("bitacoria_registered"); } catch { /* */ }
    try { window.dispatchEvent(new CustomEvent(EVT)); } catch { /* */ }
}

/** Hook reactivo con la cuenta actual (o null si nadie está dentro). */
export function useAccount(): Account | null {
    const [account, setAccount] = useState<Account | null>(null);

    useEffect(() => {
        let alive = true;
        const refresh = () => {
            getSessionUser()
                .then((u) => {
                    if (!alive) return;
                    if (u?.email) {
                        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
                        setAccount({
                            email: u.email,
                            nombre: (meta.full_name || meta.name || "") as string,
                            avatar: (meta.avatar_url || meta.picture || "") as string,
                        });
                    } else {
                        setAccount(getStoredAccount());
                    }
                })
                .catch(() => { if (alive) setAccount(getStoredAccount()); });
        };
        refresh();
        const onEvt = () => refresh();
        window.addEventListener(EVT, onEvt);
        window.addEventListener("storage", onEvt); // cross-tab
        const unsubAuth = onAuthChange(onEvt);
        return () => {
            alive = false;
            window.removeEventListener(EVT, onEvt);
            window.removeEventListener("storage", onEvt);
            unsubAuth();
        };
    }, []);

    return account;
}
