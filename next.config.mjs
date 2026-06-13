/** @type {import('next').NextConfig} */
const nextConfig = {
    // Única página activa: la landing, servida en la raíz (bitacoria.com).
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            // /registro no es una ruta real (el modal intercepta los clics);
            // este redirect salva clics pre-hidratación, ctrl+click y pestañas
            // nuevas: vuelven a la landing con el modal abierto (?registro=1).
            { source: "/registro", destination: "/?registro=1", permanent: false },
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
