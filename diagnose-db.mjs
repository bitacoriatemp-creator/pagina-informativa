// Diagnóstico de DB v2 — listar TODAS las tablas del schema public
// directamente desde information_schema vía PostgREST RPC.

import { readFileSync } from "node:fs";

const raw = readFileSync("./.env.local", "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith("#") || !line.trim()) continue;
    const m = line.match(/^\s*([A-Z_]+)\s*=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`URL: ${url}`);
console.log(`Key terminates in: ...${key.slice(-4)} (len ${key.length})`);
console.log("─".repeat(70));

// Decodificar el JWT (no es secreto — el header.payload son b64 públicos)
try {
    const [headerB64, payloadB64] = key.split(".");
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    console.log("JWT header:", JSON.stringify(header));
    console.log("JWT payload:", JSON.stringify(payload, null, 2));
} catch (e) {
    console.log("No se pudo decodificar JWT:", e.message);
}

console.log("─".repeat(70));

// Listar todas las tablas del schema public usando PostgREST con select directo
async function fetchRest(path, extra = {}) {
    const res = await fetch(`${url}/rest/v1/${path}`, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            ...extra,
        },
    });
    return { status: res.status, text: await res.text() };
}

// Probamos cada tabla con un HEAD-style count
const candidates = [
    "participantes",
    "inventario",
    "leads",
    "registros",
    "registrations",
    "users",
    "usuarios",
    "subscribers",
    "demo_signups",
    "participants",
    "lead",
];

console.log("Probando tablas individuales con conteo HEAD:");
for (const tbl of candidates) {
    const r = await fetch(`${url}/rest/v1/${tbl}?select=*`, {
        method: "HEAD",
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Prefer: "count=exact",
        },
    });
    const range = r.headers.get("content-range");
    const total = range ? range.split("/")[1] : "?";
    console.log(`  ${tbl.padEnd(20)} status=${r.status}  count=${total}`);
}
