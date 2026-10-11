/* ══════════════════════════════════════════════════════════════
   resenasDemo — DATOS DE EJEMPLO para ver la cinta sin backend (JC 2026-09-25)
   ──────────────────────────────────────────────────────────────
   Solo con RESENAS_DEMO=true y fuera de producción (ver resenas.ts).
   No son clientes: nombres de pila comunes con inicial, ciudades
   grandes, textos cortos y variados, con una de 3 y dos de 4 con
   respuesta del equipo, que es como se verá la cinta de verdad. Sin
   fotos a propósito: no se inventan URLs de Google; el círculo de
   iniciales es el camino que se ejercita aquí.
   ══════════════════════════════════════════════════════════════ */

import type { Resena, Resenas } from "./resenasFormato";
import { NOMBRE_ANONIMO, promedio } from "./resenasFormato";

const RESENAS: Resena[] = [
    {
        id: "demo-1",
        nombre: "Andrés G.",
        foto_url: null,
        rol: "residente",
        tipo_obra: "vivienda",
        ciudad: "Querétaro",
        modulo: "smart_log",
        estrellas: 5,
        texto: "La bitácora del día la dicto desde la camioneta y queda con foto y hora. Antes la pasaba en limpio en la noche.",
        respuesta_equipo: null,
        publicada_at: "2026-09-18T15:20:00Z",
    },
    {
        id: "demo-2",
        nombre: "Paola R.",
        foto_url: null,
        rol: "contratista",
        tipo_obra: "plaza_comercial",
        ciudad: "León",
        modulo: "smart_concepts",
        estrellas: 4,
        texto: "El catálogo de conceptos salió en una tarde en vez de una semana. Me gustaría poder agrupar partidas por frente.",
        respuesta_equipo: "Gracias, Paola. Anotamos lo de agrupar partidas por frente para revisarlo con el equipo.",
        publicada_at: "2026-09-12T09:05:00Z",
    },
    {
        id: "demo-3",
        nombre: "Jorge H.",
        foto_url: null,
        rol: "supervisor",
        tipo_obra: "edificio",
        ciudad: "Monterrey",
        modulo: "smart_calendar",
        estrellas: 5,
        texto: "El cronograma me marca qué partida viene atrasada antes de la junta semanal. Con eso ya me alcanza.",
        respuesta_equipo: null,
        publicada_at: "2026-09-08T18:40:00Z",
    },
    {
        id: "demo-4",
        nombre: "Mariana S.",
        foto_url: null,
        rol: "independiente",
        tipo_obra: "remodelacion",
        ciudad: "Ciudad de México",
        modulo: "smart_log",
        estrellas: 5,
        texto: "Llevo tres remodelaciones a la vez y el cliente ve el avance sin que le mande fotos por mensaje.",
        respuesta_equipo: null,
        publicada_at: "2026-09-02T12:00:00Z",
    },
    {
        id: "demo-5",
        nombre: NOMBRE_ANONIMO,
        foto_url: null,
        rol: "residente",
        tipo_obra: "nave_industrial",
        ciudad: null,
        modulo: "smart_concepts",
        estrellas: 4,
        texto: "Buen catálogo, aunque tuve que corregir varios precios de acero a mano.",
        respuesta_equipo: "Gracias por el detalle. Tomamos nota de los precios de acero para revisarlos.",
        publicada_at: "2026-08-27T16:30:00Z",
    },
    {
        id: "demo-6",
        nombre: "Daniel C.",
        foto_url: null,
        rol: "director",
        tipo_obra: "infraestructura",
        ciudad: "Guadalajara",
        modulo: "smart_calendar",
        estrellas: 3,
        texto: "Sirve bien para obra chica. En un tramo carretero con cuatro frentes se me quedó corto el cronograma.",
        respuesta_equipo: "Tienes razón, Daniel: un tramo con varios frentes pide más de lo que hoy damos. Lo anotamos.",
        publicada_at: "2026-08-20T10:15:00Z",
    },
    {
        id: "demo-7",
        nombre: "Fernanda L.",
        foto_url: null,
        rol: "residente",
        tipo_obra: "vivienda",
        ciudad: "Puebla",
        modulo: "smart_log",
        estrellas: 5,
        texto: "Las notas de obra con foto y firma en el PDF me quitaron el pleito con el contratista por lo que sí se hizo.",
        respuesta_equipo: null,
        publicada_at: "2026-08-14T13:50:00Z",
    },
    {
        id: "demo-8",
        nombre: "Héctor V.",
        foto_url: null,
        rol: "contratista",
        tipo_obra: "edificio",
        ciudad: "Mérida",
        modulo: "smart_concepts",
        estrellas: 5,
        texto: "Cotizo con el catálogo y el cliente tiene el presupuesto el mismo día.",
        respuesta_equipo: null,
        publicada_at: "2026-08-05T19:10:00Z",
    },
    {
        id: "demo-9",
        nombre: "Sofía P.",
        foto_url: null,
        rol: "supervisor",
        tipo_obra: "plaza_comercial",
        ciudad: "Querétaro",
        modulo: "smart_log",
        estrellas: 4,
        texto: "Fácil de usar en campo. Me falta buscar más rápido en las bitácoras de meses anteriores.",
        respuesta_equipo: null,
        publicada_at: "2026-07-29T08:45:00Z",
    },
];

export const RESENAS_DEMO: Resenas = {
    resumen: { promedio: promedio(RESENAS.map((r) => r.estrellas)), total: RESENAS.length },
    resenas: RESENAS,
};
