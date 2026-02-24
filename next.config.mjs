/** @type {import('next').NextConfig} */
const nextConfig = {
    // basePath removido: causa que next/image genere URLs /plataforma/_next/image
    // que dan 404 en Vercel cuando la app está en la raíz del dominio.
    // images.unoptimized evita el proxy de optimización y sirve las imágenes
    // directamente desde /public — más robusto para multi-zone deployments.
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
