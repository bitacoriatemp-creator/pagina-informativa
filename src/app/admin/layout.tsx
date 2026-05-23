import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Admin layout — SOLO permitido en desarrollo (npm run dev).
 *
 * En cualquier build de producción (NODE_ENV === 'production') este layout
 * devuelve 404 para que la ruta /admin no exista en Vercel. Garantiza que
 * el dashboard interno con datos sensibles nunca se expone públicamente.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    if (process.env.NODE_ENV === "production") {
        notFound();
    }
    return (
        <div className="min-h-screen bg-[#08080a] text-zinc-100">
            {children}
        </div>
    );
}

export const metadata = {
    title: "Admin · BitacorIA",
    robots: { index: false, follow: false },
};
