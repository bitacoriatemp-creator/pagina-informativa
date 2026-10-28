/* Datos de los Términos y del Aviso de Privacidad (Fase 6, versión 2026-10-19).
   Los textos están en src/components/ui/TextosLegales.tsx.

   - `VERSION_LEGAL` debe ser igual a TERMINOS_VERSION_2026_10 y
     AVISO_VERSION_2026_10 del servidor (app/core/config.py): es la versión que
     el servidor anota cuando alguien acepta. Si se publica otro día, se cambian
     los dos lados en el mismo envío.
   - Lo que falta de Luis va con `valor: null` y la página lo muestra como
     “[Pendiente: …]”. No se publica a main mientras quede alguno
     (src/lib/__tests__/planes.test.ts falla hasta que no quede ninguno).
   - 2026-10-18: Luis contestó 10 datos (soporte, Soporte Pro, devoluciones,
     aviso de cambios y plazos), redactados de tú sin cambiar su contenido.
     Faltan responsable, RFC, domicilio y correo de privacidad.
   - 2026-10-27: Luis aclaró que los 10 días hábiles de la licencia única son
     el plazo para pedir la devolución (el pago va aparte, en `plazoDevolucion`). */

export const VERSION_LEGAL = "2026-10-19";
export const FECHA_LEGAL = "19 de octubre de 2026";

export type DatoLegal = { valor: string | null; falta: string };

export const DATOS_LEGALES = {
    responsable: { valor: null, falta: "razón social o nombre completo de quien opera BitacorIA" },
    rfc: { valor: null, falta: "RFC" },
    domicilio: { valor: null, falta: "domicilio (calle, número, colonia, código postal, alcaldía o municipio y estado)" },
    correoPrivacidad: { valor: null, falta: "correo para temas de privacidad" },
    respuestaSoporte: { valor: "1 día hábil", falta: "tiempo de respuesta (propuesta: 1 día hábil)" },
    horarioSoporte: { valor: "lunes a viernes, de 9:00 a 19:00, hora del centro de México", falta: "horario de soporte (propuesta: lunes a viernes de 9:00 a 19:00, hora del centro de México)" },
    soporteSiteManager: { valor: "WhatsApp prioritario; te respondemos el mismo día hábil si escribes antes de las 15:00", falta: "canal y horario del canal prioritario (propuesta: WhatsApp prioritario, respuesta el mismo día hábil si escribes antes de las 15:00)" },
    soporteExecutive: { valor: "una persona asignada y una revisión de seguimiento al mes", falta: "qué incluye la atención dedicada (propuesta: una persona asignada y una revisión de seguimiento al mes)" },
    devolucionAnual: { valor: "en proporción los meses completos que no hayas usado", falta: "cómo se calcula la devolución del plan anual" },
    devolucionLicencia: { valor: "puedes pedir la devolución completa dentro de los 10 días hábiles siguientes a la compra, si todavía no la activaste en una obra; pasado ese plazo, o ya activada, no tiene devolución", falta: "si la licencia única tiene devolución" },
    plazoDevolucion: { valor: "10 días hábiles", falta: "plazo para devolver (propuesta: 10 días hábiles)" },
    avisoCambios: { valor: "30 días", falta: "días de aviso antes de un cambio (15 o 30)" },
    plazoRegistrosServidor: { valor: "30 días", falta: "plazo de los registros técnicos (propuesta: 30 días)" },
    plazoProspectos: { valor: "12 meses sin respuesta", falta: "plazo de las solicitudes de demo (propuesta: 12 meses sin respuesta)" },
} satisfies Record<string, DatoLegal>;

export type ClaveLegal = keyof typeof DATOS_LEGALES;

/** Claves de `DATOS_LEGALES` que siguen sin valor. */
export const PENDIENTES_LEGALES: ClaveLegal[] = (Object.entries(DATOS_LEGALES) as [ClaveLegal, DatoLegal][])
    .filter(([, d]) => !d.valor)
    .map(([clave]) => clave);
