/** @type {import('next').NextConfig} */
const nextConfig = {
    // La app se sirve en bitacoria.com/plataforma
    basePath: process.env.NODE_ENV === 'production' ? '/plataforma' : '',
    // En Next.js 14, public/ TAMBIÉN se sirve bajo el basePath.
    // unoptimized:true hace que <Image src="/images/x.webp"> genere
    // <img src="/plataforma/images/x.webp"> — ruta correcta en producción.
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/plataforma',
                basePath: false,
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
