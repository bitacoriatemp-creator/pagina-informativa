import type { Metadata } from "next";
import Formulario from "./Formulario";

/* /registro — el alta, a página entera.
   No usa MarketingShell a propósito: esta página no lleva barra de navegación
   ni pie de FAQ. Lo único que puede hacer aquí una persona es darse de alta o
   volver al inicio; cualquier otra salida es una fuga. */

export const metadata: Metadata = {
    title: "Solicita tu demo — BitacorIA",
    description:
        "Déjanos tus datos y preparamos una demo en vivo de BitacorIA sobre tu propia obra. Acceso anticipado a la plataforma de gestión de obra con IA.",
    alternates: { canonical: "/registro" },
    openGraph: {
        title: "Solicita tu demo — BitacorIA",
        description:
            "Acceso anticipado a BitacorIA. Seis datos y agendamos una demo en vivo sobre tu obra.",
        url: "https://bitacoria.com/registro",
        type: "website",
    },
};

export default function RegistroPage() {
    return <Formulario />;
}
