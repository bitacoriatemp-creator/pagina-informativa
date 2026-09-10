// La app (cuenta, pago, producto). Misma variable que src/lib/appUrl.ts; aquí
// se lee en build porque los redirects se resuelven en el servidor.
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.bitacoria.com").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Única página activa: la landing, servida en la raíz (bitacoria.com).
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            // /registro ya es una página real (el alta completa), así que aquí
            // no lleva redirect. Lo que sí sigue vivo es el enlace antiguo
            // ?registro=1, que abría el modal: ahora va a la página.
            { source: "/", has: [{ type: "query", key: "registro" }], destination: "/registro", permanent: false },
            // /esia dado de baja (la conferencia ya pasó) → manda a la landing.
            { source: "/esia", destination: "/", permanent: false },
            { source: "/esia/:path*", destination: "/", permanent: false },
            // /plataforma ya no existe (la landing está en raíz) → a la landing.
            { source: "/plataforma", destination: "/", permanent: false },
            { source: "/plataforma/:path*", destination: "/", permanent: false },
            // /planes es la página propia de precios; /pricing, su alias en inglés (308).
            { source: "/pricing", destination: "/planes", permanent: true },
            // Cuenta y producto viven en la app: el sitio solo vende y enlaza (307).
            { source: "/login", destination: `${APP_URL}/auth`, permanent: false },
            { source: "/app", destination: APP_URL, permanent: false },
            // El /dashboard de este repo es una maqueta con datos de prueba que
            // respondía 200 en producción. Redirigir mata la maqueta sin romper
            // enlaces guardados; borrar ese código queda para un PR posterior.
            { source: "/dashboard/:path*", destination: `${APP_URL}/dashboard/:path*`, permanent: false },
        ];
    },
};

export default nextConfig;
