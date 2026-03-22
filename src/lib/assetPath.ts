/**
 * Prefijo de ruta para assets estáticos en public/.
 * En producción (Vercel), la app se sirve bajo /plataforma,
 * así que los archivos de public/ viven en /plataforma/images/...
 * En desarrollo (localhost), no hay prefijo.
 *
 * Usar: <Image src={assetPath("/images/logo.webp")} ... />
 */

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/plataforma' : '';

export function assetPath(path: string): string {
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${BASE_PATH}${path}`;
}

export default BASE_PATH;
