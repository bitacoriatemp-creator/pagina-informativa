/** @type {import('next').NextConfig} */
const nextConfig = {
    // La landing se sirve en la raíz del dominio: bitacoria.com
    // (el registro vive en /registro, deploy aparte)
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
