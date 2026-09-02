/* Eventos globales de la landing.
   Piezas que viven en componentes distintos se hablan por `window` en vez
   de subir estado hasta la página: el hero lleva al aviso legal que vive en
   el pie, y la isla cambia el demo que vive en el hero. */

export type DocumentoLegal = "faq" | "terms" | "privacy";

export const EVENTO_IR_LEGAL = "bitacoria:ir-legal";
export const EVENTO_DEMO = "bitacoria:demo";

/** Baja al enlace legal del pie y lo resalta un momento al llegar. */
export function irALegal(doc: DocumentoLegal) {
    window.dispatchEvent(new CustomEvent<DocumentoLegal>(EVENTO_IR_LEGAL, { detail: doc }));
}

/** Cambia el demo activo del hero: 0 Smart Concepts · 1 Bitácora · 2 Smart Calendar. */
export function mostrarDemo(indice: number) {
    window.dispatchEvent(new CustomEvent<number>(EVENTO_DEMO, { detail: indice }));
}
