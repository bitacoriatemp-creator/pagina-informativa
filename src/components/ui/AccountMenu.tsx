"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import type { Account } from "@/lib/account";

function firstNameOf(account: Account) {
    return (account.nombre?.trim() || account.email).split(/[\s@]/)[0];
}

function Avatar({ account, size }: { account: Account; size: string }) {
    if (account.avatar) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={account.avatar}
                alt={account.nombre || account.email}
                referrerPolicy="no-referrer"
                className={`${size} shrink-0 rounded-full object-cover`}
                style={{ border: "1px solid rgba(195,151,103,0.5)" }}
            />
        );
    }
    const initial = (account.nombre || account.email).trim().charAt(0).toUpperCase();
    return (
        <span
            className={`${size} flex shrink-0 items-center justify-center rounded-full font-semibold`}
            style={{ background: "rgba(195,151,103,0.18)", border: "1px solid rgba(195,151,103,0.45)", color: "#e8c9a0" }}
        >
            {initial}
        </span>
    );
}

/** Avatar + menú desplegable (correo + cerrar sesión) — para el navbar de escritorio. */
export default function AccountMenu({
    account,
    onSignOut,
    variant = "pill",
}: {
    account: Account;
    onSignOut: () => void;
    variant?: "pill" | "slim";
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const size = variant === "slim" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs";

    /* Mismo corte que el resto de la pill (lg): en tablet el acceso vive
       dentro del menú hamburguesa, no suelto en la barra. */
    return (
        <div ref={ref} className="relative hidden shrink-0 lg:block">
            <button
                onClick={() => setOpen((o) => !o)}
                title={account.email}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:brightness-110"
                style={{ background: "rgba(195,151,103,0.1)", border: "1px solid rgba(195,151,103,0.3)" }}
            >
                <Avatar account={account} size={size} />
                <span className="hidden max-w-[88px] truncate text-[12px] text-white/80 lg:inline">
                    {firstNameOf(account)}
                </span>
            </button>

            {open && (
                <div
                    className="absolute right-0 z-[60] mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl"
                    style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
                >
                    <div className="flex items-center gap-3 px-3.5 py-3">
                        <Avatar account={account} size="h-9 w-9 text-sm" />
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-white">
                                {account.nombre?.trim() || firstNameOf(account)}
                            </p>
                            <p className="truncate text-[11px] text-white/45">{account.email}</p>
                        </div>
                    </div>
                    <div className="h-px bg-white/[0.08]" />
                    <button
                        onClick={() => { setOpen(false); onSignOut(); }}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12px] text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <LogOut size={14} /> Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}

/** Bloque de cuenta para el menú hamburguesa (móvil). */
export function AccountRowMobile({ account, onSignOut }: { account: Account; onSignOut: () => void }) {
    return (
        <div className="flex flex-col gap-3 px-5 py-4" style={{ background: "rgba(195,151,103,0.06)" }}>
            <div className="flex items-center gap-3">
                <Avatar account={account} size="h-9 w-9 text-sm" />
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white">
                        {account.nombre?.trim() || firstNameOf(account)}
                    </p>
                    <p className="truncate text-[11px] text-white/45">{account.email}</p>
                </div>
            </div>
            <button onClick={onSignOut} className="flex items-center gap-2 text-[12px] text-white/60 transition-colors hover:text-white">
                <LogOut size={13} /> Cerrar sesión
            </button>
        </div>
    );
}
