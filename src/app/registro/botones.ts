/* Los dos botones rellenos de /registro.
   ──────────────────────────────────────────────────────────────
   Viven aquí (y no en src/lib) porque Tailwind solo lee las clases de
   src/app y src/components: en src/lib no generaría el CSS.

   Comparten la forma: 48 px de alto, todo el ancho, esquinas rounded-xl,
   letra de 15 px seminegrita y el mismo anillo de foco. Solo cambia el
   color. 2026-11-13 (Luis, opción B): el de WhatsApp es el verde de la
   marca, #25D366, con letra oscura #1a120c (9.3 a 1) y, al pasar el
   cursor, se aclara a #3be07a, igual que el crema se aclara a blanco.
   Sin pastilla, sin degradado, sin sombras, sin brillo y sin flecha. */

const botonForma =
    "flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39767]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0604]";

/** "Solicitar demo" y el correo cuando no hay WhatsApp. */
export const botonCrema = `${botonForma} bg-[#f5f0e8] text-[#1a120c] hover:bg-white disabled:opacity-60`;

/** WhatsApp: la misma forma, con espacio para el icono. Es un enlace, así que
    no lleva la regla de deshabilitado. */
export const botonVerde = `${botonForma} gap-2.5 bg-[#25D366] text-[#1a120c] hover:bg-[#3be07a]`;
