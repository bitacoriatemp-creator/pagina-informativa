import { useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════════════
   account — "quién está dentro" para el navbar
   ──────────────────────────────────────────────────────────────
   Una sola fuente: el registro guardado localmente al pedir demo en
   /registro (correo y nombre). www no autentica a nadie: la sesión real
   vive en la app (app.bitacoria.com); esto es solo el saludo al lead que
   ya dejó sus datos en este navegador.
   Reactivo vía evento propio (misma pestaña) + `storage` (otras pestañas).
   ══════════════════════════════════════════════════════════════ */

/* `avatar` venía de la sesión de Google, que ya no existe en www; queda
   opcional para que AccountMenu siga compilando y lo trate como vacío. */
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
        const refresh = () => setAccount(getStoredAccount());
        refresh();
        window.addEventListener(EVT, refresh);
        window.addEventListener("storage", refresh); // cross-tab
        return () => {
            window.removeEventListener(EVT, refresh);
            window.removeEventListener("storage", refresh);
        };
    }, []);

    return account;
}
