/**
 * Prefijo de ruta para assets estáticos en public/.
 * La app se sirve en la raíz del dominio (bitacoria.com), así que
 * los archivos de public/ viven en /images/... sin prefijo.
 *
 * Usar: <Image src={assetPath("/images/logo.webp")} ... />
 */

const BASE_PATH = '';

export function assetPath(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${BASE_PATH}${path}`;
}

export default BASE_PATH;
