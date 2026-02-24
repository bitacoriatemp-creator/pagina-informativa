/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath requerido: la app se sirve en bitacoria.com/plataforma
    basePath: process.env.NODE_ENV === 'production' ? '/plataforma' : '',
    // Con basePath, el optimizador de next/image usa /plataforma/_next/image
    // que SÍ funciona en Vercel. NO usar unoptimized:true con basePath porque
    // eso genera /plataforma/images/*.webp que da 404 (public/ sirve desde raíz).
    images: {
        remotePatterns: [],
    },
};

export default nextConfig;
