/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath solo en producción (Vercel multi-zone).
    // En desarrollo local, la app sirve en localhost:3000
    basePath: process.env.NODE_ENV === 'production' ? '/plataforma' : '',
};

export default nextConfig;
