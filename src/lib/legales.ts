/* Datos de los Términos y del Aviso de Privacidad (Fase 6, versión 2026-10-19).
   Los textos están en src/components/ui/TextosLegales.tsx.

   - `VERSION_LEGAL` debe ser igual a TERMINOS_VERSION_2026_10 y
     AVISO_VERSION_2026_10 del servidor (app/core/config.py): es la versión que
     el servidor anota cuando alguien acepta. Si se publica otro día, se cambian
     los dos lados en el mismo envío.
   - Lo que falta de Luis va con `valor: null` y la página lo muestra como
     “[Pendiente: …]”. No se publica a main mientras quede alguno
     (src/lib/__tests__/planes.test.ts lo vigila). */

export const VERSION_LEGAL = "2026-10-19";
export const FECHA_LEGAL = "19 de octubre de 2026";

export type DatoLegal = { valor: string | null; falta: string };

export const DATOS_LEGALES = {
    responsable: { valor: null, falta: "razón social o nombre completo de quien opera BitacorIA" },
    rfc: { valor: null, falta: "RFC" },
    domicilio: { valor: null, falta: "domicilio (calle, número, colonia, código postal, alcaldía o municipio y estado)" },
    correoPrivacidad: { valor: null, falta: "correo para temas de privacidad" },
    respuestaSoporte: { valor: null, falta: "tiempo de respuesta (propuesta: 1 día hábil)" },
    horarioSoporte: { valor: null, falta: "horario de soporte (propuesta: lunes a viernes de 9:00 a 19:00, hora del centro de México)" },
    soporteSiteManager: { valor: null, falta: "canal y horario del canal prioritario (propuesta: WhatsApp prioritario, respuesta el mismo día hábil si escribes antes de las 15:00)" },
    soporteExecutive: { valor: null, falta: "qué incluye la atención dedicada (propuesta: una persona asignada y una revisión de seguimiento al mes)" },
    devolucionAnual: { valor: null, falta: "cómo se calcula la devolución del plan anual" },
    devolucionLicencia: { valor: null, falta: "si la licencia única tiene devolución" },
    plazoDevolucion: { valor: null, falta: "plazo para devolver (propuesta: 10 días hábiles)" },
    avisoCambios: { valor: null, falta: "días de aviso antes de un cambio (15 o 30)" },
    plazoRegistrosServidor: { valor: null, falta: "plazo de los registros técnicos (propuesta: 30 días)" },
    plazoProspectos: { valor: null, falta: "plazo de los prospectos (propuesta: 12 meses sin respuesta)" },
} satisfies Record<string, DatoLegal>;

export type ClaveLegal = keyof typeof DATOS_LEGALES;

/** Claves de `DATOS_LEGALES` que siguen sin valor. */
export const PENDIENTES_LEGALES: ClaveLegal[] = (Object.entries(DATOS_LEGALES) as [ClaveLegal, DatoLegal][])
    .filter(([, d]) => !d.valor)
    .map(([clave]) => clave);
