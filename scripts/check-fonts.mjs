// Revisa, después de `next build`, que las letras de la página no salgan rotas (2026-11-13).
//
// Qué pasó: al publicar la tarjeta Plus, Vercel no pudo bajar Kumbh Sans de Google Fonts a media
// construcción. El HTML quedó pidiendo una versión de las letras (clase `__variable_f8bb54`) y el CSS
// definía otra (`__variable_90d4f6`). Sin la variable `--font-kumbh`, el navegador cayó a Times New
// Roman en toda la página, también en los botones de Google y de correo, y el error se quedó en la
// memoria de construcción de Vercel para las publicaciones siguientes.
//
// Esta revisión compara las clases `__variable_*` de cada página ya armada contra las que define el
// CSS. Si falta alguna, la construcción falla: Vercel no publica y www se queda con la versión
// anterior, que sí se ve bien. Para arreglarlo, se vuelve a publicar sin la memoria de construcción.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = ".next";

function archivos(dir, extension, salida = []) {
    if (!existsSync(dir)) return salida;
    for (const nombre of readdirSync(dir)) {
        const ruta = join(dir, nombre);
        if (statSync(ruta).isDirectory()) archivos(ruta, extension, salida);
        else if (ruta.endsWith(extension)) salida.push(ruta);
    }
    return salida;
}

const hojas = archivos(join(RAIZ, "static", "css"), ".css");
const paginas = archivos(join(RAIZ, "server", "app"), ".html");

if (hojas.length === 0 || paginas.length === 0) {
    console.error(`[letras] No encontré lo que tengo que revisar (CSS: ${hojas.length}, páginas: ${paginas.length}).`);
    process.exit(1);
}

const definidas = new Set();
for (const hoja of hojas) {
    for (const m of readFileSync(hoja, "utf8").matchAll(/\.(__variable_[a-f0-9]+)\s*\{/g)) definidas.add(m[1]);
}

const faltan = new Map();
for (const pagina of paginas) {
    for (const m of readFileSync(pagina, "utf8").matchAll(/__variable_[a-f0-9]+/g)) {
        if (!definidas.has(m[0]) && !faltan.has(m[0])) faltan.set(m[0], pagina);
    }
}

if (faltan.size > 0) {
    console.error("[letras] Las páginas piden letras que el CSS no define. No se publica (se verían en Times New Roman):");
    for (const [clase, pagina] of faltan) console.error(`  - ${clase} (por ejemplo en ${pagina})`);
    console.error("[letras] Causa común: Google Fonts no respondió durante la construcción, o la memoria de construcción");
    console.error("[letras] quedó con una versión vieja. Vuelve a publicar sin la memoria de construcción.");
    process.exit(1);
}

console.log(`[letras] OK: ${paginas.length} páginas y ${definidas.size} letras definidas en el CSS.`);
