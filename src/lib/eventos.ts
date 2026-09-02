/* Eventos globales de la landing.
   Piezas que viven en componentes distintos se hablan por `window` en vez
   de subir estado hasta la página: el hero abre el aviso legal que vive en
   el footer, y la isla cambia el demo que vive en el hero. */

export type DocumentoLegal = "faq" | "terms" | "privacy";

export const EVENTO_LEGAL = "bitacoria:legal";
export const EVENTO_DEMO = "bitacoria:demo";

/** Abre uno de los modales legales del footer desde cualquier parte. */
export function abrirLegal(doc: DocumentoLegal) {
    window.dispatchEvent(new CustomEvent<DocumentoLegal>(EVENTO_LEGAL, { detail: doc }));
}

/** Cambia el demo activo del hero: 0 Smart Concepts · 1 Bitácora · 2 Smart Calendar. */
export function mostrarDemo(indice: number) {
    window.dispatchEvent(new CustomEvent<number>(EVENTO_DEMO, { detail: indice }));
}
