// Diagnóstico SEGURO de .env.local — NUNCA imprime el valor del secret.
// Carga manualmente el archivo (no usa dotenv) para evitar deps extra.
// Solo reporta booleans + checks de formato.

import { readFileSync } from "node:fs";

const path = "./.env.local";
const raw = readFileSync(path, "utf8");

const lines = raw.split(/\r?\n/);
const found = { count: 0, line: -1, value: "" };

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#") || !line.trim()) continue;
    const m = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=(.*)$/);
    if (m) {
        found.count++;
        found.line = i + 1;
        found.value = m[1]; // ❗ NO se imprime, solo se inspecciona
    }
}

const v = found.value;
const checks = {
    "1) Variable encontrada":          found.count === 1 ? "OK" : `FAIL (count=${found.count})`,
    "2) Línea donde aparece":          found.line > 0 ? `línea ${found.line}` : "n/a",
    "3) Valor NO vacío":               v.length > 0 ? "OK" : "FAIL (vacío)",
    "4) NO sigue siendo placeholder":  v !== "PEGAR_AQUI_EL_SERVICE_ROLE_KEY" ? "OK" : "FAIL (todavía es el placeholder)",
    "5) Sin comillas envolventes":     !/^["'].*["']$/.test(v) ? "OK" : "FAIL (tiene comillas — quítalas)",
    "6) Sin espacios al inicio/fin":   v === v.trim() ? "OK" : "FAIL (tiene whitespace — bórralo)",
    "7) Forma de JWT (3 partes b64)":  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v.trim())
                                            ? "OK (parece JWT válido)"
                                            : "FAIL (no parece JWT — ¿pegaste un sb_publishable o sb_secret en vez del JWT eyJ...?)",
    "8) Empieza con 'eyJ' (header b64)": v.trim().startsWith("eyJ") ? "OK" : "FAIL (un JWT debe empezar con eyJ)",
};

console.log("DIAGNÓSTICO .env.local — SUPABASE_SERVICE_ROLE_KEY");
console.log("=".repeat(55));
for (const [k, val] of Object.entries(checks)) {
    console.log(`  ${k.padEnd(38)} → ${val}`);
}
console.log("=".repeat(55));
console.log("Nota: el valor real NUNCA se imprime en este script.");
