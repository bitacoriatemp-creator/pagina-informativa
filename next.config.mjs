/** @type {import('next').NextConfig} */
const nextConfig = {
    // Única página activa: la landing, servida en la raíz (bitacoria.com).
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            // /esia dado de baja (la conferencia ya pasó) → manda a la landing.
            { source: "/esia", destination: "/", permanent: false },
            { source: "/esia/:path*", destination: "/", permanent: false },
            // /plataforma ya no existe (la landing está en raíz) → a la landing.
            { source: "/plataforma", destination: "/", permanent: false },
            { source: "/plataforma/:path*", destination: "/", permanent: false },
        ];
    },
};

export default nextConfig;
