import type { ReactNode } from "react";

import { DATOS_LEGALES, FECHA_LEGAL, VERSION_LEGAL, type ClaveLegal } from "@/lib/legales";

/* ══════════════════════════════════════════════════════════════
   Términos y Condiciones y Aviso de Privacidad (versión 2026-10-19)
   ──────────────────────────────────────────────────────────────
   Fase 6 del lanzamiento. Reemplazan los textos de junio de 2026. El
   borrador completo, con las notas para el abogado, está fuera del repo
   (Backend-Bit/_contexto/legal/terminos_y_aviso_2026-10-19.md).

   - La versión, la fecha y los datos que faltan de Luis están en
     src/lib/legales.ts; lo que falta se ve en la página como “[Pendiente: …]”.
   - Trato de tú en los dos textos (decisión de Luis del 2026-10-11).
   ══════════════════════════════════════════════════════════════ */

function D({ k }: { k: ClaveLegal }) {
    const dato: { valor: string | null; falta: string } = DATOS_LEGALES[k];
    if (dato.valor) return <>{dato.valor}</>;
    return <span className="rounded bg-amber-400/15 px-1 text-amber-200">[Pendiente: {dato.falta}]</span>;
}

const CONTENEDOR =
    "divide-y divide-white/[0.07] text-[15px] leading-relaxed text-white/60 [&>*]:py-6 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <div>
            <h5 className="mb-2 text-[15px] font-semibold text-[#f5f0e8]">{titulo}</h5>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Lista({ children }: { children: ReactNode }) {
    return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}

function B({ children }: { children: ReactNode }) {
    return <strong className="text-white">{children}</strong>;
}

function Encabezado() {
    return (
        <div>
            <p>
                <B>Última actualización:</B> {FECHA_LEGAL}. Versión {VERSION_LEGAL}.
            </p>
        </div>
    );
}

/* ────────────────────────── TÉRMINOS ────────────────────────── */

export function TerminosCuerpo() {
    return (
        <div className={CONTENEDOR}>
            <Encabezado />

            <Seccion titulo="1. Quiénes somos y cómo aceptas">
                <p>
                    1.1 BitacorIA es una plataforma en línea operada por <D k="responsable" />, con RFC <D k="rfc" /> y
                    domicilio en <D k="domicilio" /> (“BitacorIA” o “nosotros”).
                </p>
                <p>
                    1.2 Estos Términos son el contrato entre BitacorIA y quien crea una cuenta (“tú”). Si creas la cuenta
                    para una empresa, declaras que puedes obligarla y la empresa queda obligada por estos Términos.
                </p>
                <p>
                    1.3 Aceptas estos Términos y el Aviso de Privacidad al crear tu cuenta, con tu correo, con Google o al
                    aceptar una invitación. Desde octubre de 2026, al crear tu cuenta guardamos qué versión aceptaste y
                    cuándo. Debes ser mayor de 18 años.
                </p>
            </Seccion>

            <Seccion titulo="2. Palabras que usamos">
                <Lista>
                    <li><B>Empresa:</B> la cuenta de tu organización en BitacorIA.</li>
                    <li><B>Usuario:</B> cada persona con acceso.</li>
                    <li><B>Obra:</B> cada proyecto que das de alta.</li>
                    <li>
                        <B>Tu contenido:</B> todo lo que tú o tu equipo capturan o suben: datos de la obra, catálogos,
                        precios, cronogramas, notas, fotos, documentos y mensajes.
                    </li>
                    <li><B>Plan:</B> el nivel de servicio contratado (Anexo A).</li>
                </Lista>
            </Seccion>

            <Seccion titulo="3. El servicio">
                <p>
                    3.1 BitacorIA ayuda a llevar obras de construcción con tres módulos y un asistente con inteligencia
                    artificial: Smart Concepts (catálogo de conceptos y precios), Smart Calendar (cronograma) y Smart
                    Log (bitácora diaria y reportes).
                </p>
                <p>3.2 El servicio está hecho para obras en México y trabaja con su normativa (cláusula 12.2).</p>
                <p>
                    3.3 Las funciones y límites de cada Plan son los de la tabla de planes vigente al contratar (Anexo A).
                    El servicio mejora y cambia. Si quitamos una función esencial de un Plan de pago durante un periodo
                    ya pagado, te avisamos y puedes pedir la devolución proporcional de ese periodo.
                </p>
            </Seccion>

            <Seccion titulo="4. Tu cuenta">
                <p>
                    4.1 Los datos de tu cuenta deben ser verdaderos. Cuida tu contraseña: lo que se haga con tu cuenta es
                    tu responsabilidad.
                </p>
                <p>
                    4.2 El administrador de la empresa decide quién entra y con qué rol (administrador o miembro), y
                    responde por las personas que invita. <B>Todas las personas de tu empresa ven y trabajan todas sus
                    obras:</B> todavía no hay acceso por obra, así que invita solo a quien deba verlas todas.
                </p>
                <p>
                    4.3 Para proteger la plataforma limitamos cuántas cuentas gratis nuevas se abren al día, podemos
                    pedirte una verificación contra programas automáticos al registrarte y limitamos los intentos de
                    acceso.
                </p>
                <p>4.4 Si crees que alguien usa tu cuenta sin permiso, avísanos de inmediato.</p>
            </Seccion>

            <Seccion titulo="5. Plan gratis (Draft)">
                <p>
                    5.1 Draft es gratis y es para probar BitacorIA. Incluye 1 obra, 1 usuario y una prueba guiada con
                    inteligencia artificial que <B>no se renueva</B>:
                </p>
                <Lista>
                    <li>2 consultas al asistente en total (un mensaje con hasta 2 fotos cuenta como una consulta);</li>
                    <li>
                        1 catálogo de prueba: uno generado con IA, de hasta 30 conceptos, o uno importado de tu archivo,
                        completo;
                    </li>
                    <li>1 cronograma de prueba;</li>
                    <li>1 nota del día con fotos analizadas por la IA;</li>
                    <li>hasta 2 fotos por hoja del día en la bitácora.</li>
                </Lista>
                <p>
                    No incluye descarga de PDF, dictado por voz ni envío de documentos al asistente.
                </p>
                <p>
                    5.2 Confirmar o cancelar lo que propone el asistente y registrar el avance del día no gastan
                    consultas.
                </p>
                <p>
                    5.3 La prueba con IA tiene su propio tope diario y puede pausarse por el resto del día cuando el gasto
                    de IA de toda la plataforma pasa de cierto nivel ese día; lo demás sigue funcionando.
                </p>
                <p>
                    5.4 Si nuestro equipo te abrió una cuenta de prueba con fecha de fin, al terminar puedes seguir viendo
                    y descargando tu información, pero ya no capturar, hasta que contrates un Plan.
                </p>
                <p>
                    5.5 Podemos cambiar los límites de Draft o suspender cuentas gratis que se usen para abusar del
                    servicio. Draft se ofrece “tal como está”, sin compromiso de soporte ni de disponibilidad.
                </p>
            </Seccion>

            <Seccion titulo="6. Planes de pago y cobro">
                <p>
                    6.1 Pides el Plan en la app; te mandamos un enlace de pago de Mercado Pago o los datos para una
                    transferencia, a tu correo (y a tu WhatsApp si nos lo das), y al confirmar tu pago activamos el Plan
                    el mismo día.
                </p>
                <p>6.2 Los precios son los de la tabla vigente al pagar, en pesos mexicanos, más IVA.</p>
                <p>6.3 Emitimos factura electrónica (CFDI) si nos das tus datos fiscales.</p>
                <p>
                    6.4 No recibimos ni guardamos datos de tu tarjeta ni de tu cuenta bancaria: el pago lo procesa
                    Mercado Pago o tu banco, con sus propias condiciones.
                </p>
                <p>6.5 Las comisiones de tu banco o de Mercado Pago del lado de quien paga corren por tu cuenta.</p>
            </Seccion>

            <Seccion titulo="7. Vigencia, renovación y devoluciones">
                <p>7.1 Plan mensual: un mes desde que se activa.</p>
                <p>
                    7.2 Plan anual: doce meses desde que se activa, pagados por adelantado, al precio mensual de la
                    columna “anual”.
                </p>
                <p>7.3 Licencia única de proyecto: doce meses para una obra, con los alcances del Anexo A.</p>
                <p>
                    7.4 <B>No hay renovación automática ni cargos recurrentes.</B> Para renovar, pides el siguiente
                    periodo y lo pagas.
                </p>
                <p>7.5 Devoluciones:</p>
                <Lista>
                    <li>Plan mensual: sin devolución del mes en curso; puedes no renovarlo.</li>
                    <li>
                        Plan anual: puedes cancelar cuando quieras y te devolvemos <D k="devolucionAnual" />.
                    </li>
                    <li>Licencia única: <D k="devolucionLicencia" />.</li>
                    <li>
                        La devolución se hace por el mismo medio de pago en un máximo de <D k="plazoDevolucion" />.
                    </li>
                </Lista>
            </Seccion>

            <Seccion titulo="8. Si tu plan vence o no lo renuevas">
                <p>8.1 Te avisamos por correo unos 7 días antes de que venza tu Plan.</p>
                <p>
                    8.2 Durante <B>30 días</B> después del fin de tu periodo, tu empresa queda en <B>solo lectura</B>: tú
                    y tu equipo pueden ver sus obras y descargar en PDF sus bitácoras y reportes, pero no capturar, usar
                    la IA, crear obras, invitar ni borrar. Te avisamos en la app y por correo, con los días que quedan, y
                    puedes renovar en cualquier momento.
                </p>
                <p>
                    8.3 Pasados los 30 días, tu cuenta pasa al plan gratis. Tus obras siguen ahí, y lo nuevo sigue los
                    límites del plan gratis: sin PDF, sin obras nuevas, sin invitar y con lo que quede de la prueba
                    guiada.
                </p>
                <p>
                    8.4 Si cancelas y te devolvemos dinero (cláusula 7.5), o si un pago no se confirma, damos de baja el
                    Plan al momento y tu cuenta pasa al plan gratis sin los 30 días de solo lectura: antes de pedir la
                    devolución, descarga tus PDF.
                </p>
                <p>
                    8.5 <B>Nada se borra solo.</B> Tu información sigue guardada después de vencer o cancelar, salvo que
                    nos pidas borrarla.
                </p>
                <p>
                    8.6 Borrado a petición: el titular del Plan o un administrador de tu empresa puede pedirnos, desde
                    Ayuda en la app o desde el correo de la cuenta, que borremos toda la información de la empresa. Te lo
                    confirmamos por correo y lo hacemos en un máximo de 5 días hábiles. Te decimos qué se borró, qué
                    conservamos (los datos de facturación que pide la ley y el registro de quién hizo cada cambio y de
                    uso de la IA, que no se borra) y cuándo vencen las copias de respaldo que todavía la contengan. El
                    borrado no se puede deshacer: descarga antes lo que necesites.
                </p>
                <p>
                    8.7 Hoy puedes descargar tu información en PDF (y algunos reportes en Word, CSV o Excel). No
                    ofrecemos la exportación completa de la base de datos.
                </p>
            </Seccion>

            <Seccion titulo="9. Tu información es tuya">
                <p>9.1 Tu contenido es de tu empresa.</p>
                <p>
                    9.2 Nos das permiso, mientras tu información esté guardada con nosotros y para prestarte el servicio,
                    de guardarla, respaldarla, procesarla (también con inteligencia artificial, cláusula 11) y
                    mostrarla a las personas de tu empresa.
                </p>
                <p>9.3 No vendemos tu contenido ni lo usamos para otra cosa.</p>
                <p>
                    9.4 La plataforma, su código, sus catálogos de referencia, sus marcas y sus diseños son de BitacorIA.
                    Si nos mandas sugerencias, podemos usarlas sin pagarte por ellas.
                </p>
            </Seccion>

            <Seccion titulo="10. Datos de otras personas en tu contenido">
                <p>
                    10.1 Si tu contenido incluye datos de otras personas (por ejemplo, trabajadores en fotos o en
                    incidencias), tú eres responsable de poder capturarlos y de informarles. BitacorIA los trata solo por
                    tu cuenta y para prestarte el servicio.
                </p>
                <p>
                    10.2 No registres datos de salud u otros datos sensibles salvo que sean necesarios para la bitácora.
                </p>
            </Seccion>

            <Seccion titulo="11. Inteligencia artificial">
                <p>11.1 Varias funciones usan inteligencia artificial de Google (Vertex AI).</p>
                <p>
                    11.2 <B>El asistente propone y tú decides.</B> El asistente no anota nada en tu obra (bitácora,
                    incidencias, materiales, catálogo, cronograma) sin que lo confirmes con “Sí”. Lo que capturas tú
                    directamente en las pantallas se guarda al guardarlo, y los PDF que pides se generan al pedirlos.
                </p>
                <p>
                    11.3 <B>La IA puede equivocarse.</B> Conceptos, cantidades, precios, cronogramas, lecturas de fotos y
                    documentos, transcripciones, citas de normativa y respuestas del asistente son propuestas:
                    revísalas antes de usarlas, firmarlas o presentarlas a alguien.
                </p>
                <p>
                    11.4 <B>Límites de uso de IA.</B> Cada Plan incluye el uso de la IA con un tope diario para tu
                    empresa, más alto en cada plan (Anexo A); además, para evitar abusos, hay un límite de usos al día.
                    En los planes de pago la app te muestra cuánto llevas del tope. Al llegar a un límite, las funciones
                    de IA se pausan hasta que se renueve; el tope de tu empresa se renueva a la medianoche, hora del
                    centro de México. Lo demás (ver, capturar en las pantallas, descargar tus PDF) sigue funcionando.
                    Además, para proteger el servicio, la plataforma tiene un tope diario general de gasto en IA: si se
                    alcanza, o si falla el sistema que lo mide, la IA se pausa para todos hasta el día siguiente o hasta
                    que se restablezca.
                </p>
            </Seccion>

            <Seccion titulo="12. Lo que BitacorIA no es">
                <p>
                    12.1 BitacorIA no sustituye al Director Responsable de Obra, a los corresponsables, a los peritos, a
                    los proyectistas ni a la autoridad. Las decisiones técnicas, la responsiva y las firmas oficiales son
                    tuyas y de esos profesionales.
                </p>
                <p>
                    12.2 La asesoría normativa se basa en el Reglamento de Construcciones para el Distrito Federal y sus
                    Normas Técnicas Complementarias (Ciudad de México), en las Normas Oficiales Mexicanas federales y,
                    cuando los tenemos, en reglamentos locales. Fuera de lo que tenemos cargado, la reglamentación de tu
                    estado o municipio puede ser distinta: verificarla y aplicarla te toca a ti.
                </p>
                <p>
                    12.3 Los registros y PDF de BitacorIA te apoyan en el control de tu obra. <B>No sustituyen la
                    bitácora oficial</B> que exijan la autoridad o tu contrato. Los PDF de la bitácora lo dicen en su pie.
                </p>
                <p>
                    12.4 La firma que dibujas en un reporte es una imagen dentro del PDF. No es una firma electrónica con
                    certificado del SAT ni lleva sello de tiempo ni constancia de conservación.
                </p>
                <p>
                    12.5 Los precios, cantidades y duraciones son estimaciones con base en la información que nos das y
                    en referencias de mercado; revísalos antes de cotizar o contratar.
                </p>
            </Seccion>

            <Seccion titulo="13. Disponibilidad y respaldos">
                <p>
                    13.1 Hacemos lo razonable para que el servicio esté disponible, pero no garantizamos un tiempo mínimo
                    de disponibilidad. Puede haber mantenimientos o fallas.
                </p>
                <p>
                    {/* Si antes de publicar ya corre la copia semanal de fotos (Fase 3) y su aviso, se cambia la
                        segunda frase por la que diga cada cuánto y cuánto se guarda. */}
                    13.2 Respaldamos la base de datos todos los días; cada copia se borra a los 14 días y queda 7 días
                    más en la papelera del proveedor. Las fotos y los archivos todavía no tienen copia de respaldo propia.
                </p>
                <p>13.3 Te recomendamos descargar tus PDF de vez en cuando.</p>
            </Seccion>

            <Seccion titulo="14. Soporte">
                <p>14.1 Todos los planes: ayuda dentro de la app y por correo o WhatsApp.</p>
                <p>
                    14.2 Planes de pago: te contestamos en <D k="respuestaSoporte" />, de <D k="horarioSoporte" />, sin
                    contar días festivos.
                </p>
                <p>14.3 Soporte Pro en The Site Manager (canal prioritario): <D k="soporteSiteManager" />.</p>
                <p>14.4 Soporte Pro en Executive (atención dedicada): <D k="soporteExecutive" />.</p>
                <p>14.5 Fuera de horario atendemos solo fallas generales del servicio, en la medida de lo posible.</p>
            </Seccion>

            <Seccion titulo="15. Uso aceptable">
                <p>No puedes:</p>
                <Lista>
                    <li>usar la plataforma para algo ilegal;</li>
                    <li>intentar entrar a la información de otras empresas;</li>
                    <li>crear cuentas en masa ni automatizar el uso de la IA;</li>
                    <li>revender el servicio;</li>
                    <li>subir programas maliciosos ni contenido que viole derechos de otras personas.</li>
                </Lista>
                <p>Si lo haces, podemos suspender o cerrar la cuenta. Si se puede, te avisamos antes.</p>
            </Seccion>

            <Seccion titulo="16. Límite de responsabilidad">
                <p>
                    16.1 En la medida que la ley lo permita, la responsabilidad total de BitacorIA frente a ti se limita a
                    lo que pagaste en los 12 meses anteriores al hecho que la originó, y BitacorIA no responde por
                    ganancias perdidas, daños indirectos, decisiones técnicas o económicas tomadas con propuestas de la IA
                    sin revisarlas, ni por fallas de proveedores fuera de su control.
                </p>
                <p>16.2 Esto no aplica cuando haya dolo ni en lo que la ley no permite limitar.</p>
            </Seccion>

            <Seccion titulo="17. Tu responsabilidad">
                <p>
                    Respondes si tu contenido o el uso de tu cuenta violan derechos de otras personas o la ley, y nos
                    sacas en paz de las reclamaciones que salgan de eso.
                </p>
            </Seccion>

            <Seccion titulo="18. Cambios a estos Términos">
                <p>
                    Podemos cambiar estos Términos. Si el cambio te afecta, te avisamos por correo o dentro de la app con
                    al menos <D k="avisoCambios" /> de anticipación. Si no estás de acuerdo, puedes cancelar antes de que
                    aplique y pedir la devolución que corresponda según la cláusula 7. Seguir usando el servicio después
                    significa que aceptas.
                </p>
            </Seccion>

            <Seccion titulo="19. Avisos, ley y contacto">
                <p>
                    Te escribimos al correo de tu cuenta; tú nos escribes a <D k="correoPrivacidad" />. Estos Términos se
                    rigen por las leyes federales de México.
                </p>
            </Seccion>

            <Seccion titulo="Anexo A. Planes (tabla vigente al 19 de octubre de 2026)">
                <Lista>
                    <li>
                        <B>Draft:</B> $0. 1 obra, 1 usuario. Prueba guiada con IA que no se renueva (2 consultas al
                        asistente, 1 catálogo, 1 cronograma y 1 nota con fotos), con tope diario. Sin PDF ni dictado por
                        voz.
                    </li>
                    <li>
                        <B>The Resident:</B> $2,499 al mes, o $1,999 al mes pagando un año por adelantado. 3 obras, 1
                        usuario. Uso de la IA incluido cada día, con tope diario para tu empresa. PDF y dictado por voz.
                    </li>
                    <li>
                        <B>The Site Manager:</B> $3,899 al mes, o $3,199 al mes pagando un año por adelantado. 5 obras, 3
                        usuarios. Uso de la IA incluido cada día, con un tope diario mayor. PDF, dictado por voz y
                        Soporte Pro con canal prioritario.
                    </li>
                    <li>
                        <B>Executive:</B> $12,999 al mes, o $10,399 al mes pagando un año por adelantado. Obras y usuarios
                        sin límite. Uso de la IA incluido cada día, con el tope diario más alto. PDF, dictado por voz y
                        Soporte Pro con atención dedicada.
                    </li>
                    <li>
                        <B>Licencia única de proyecto:</B> $10,999, pago único, 12 meses, 1 obra. Comprada sola, trae los
                        alcances de The Site Manager con un tope diario de IA como el de The Resident; si ya tienes un
                        plan, le suma una obra.
                    </li>
                </Lista>
                <p>Precios en pesos mexicanos, más IVA.</p>
            </Seccion>
        </div>
    );
}

/* ─────────────────────────── AVISO ─────────────────────────── */

export function AvisoCuerpo() {
    return (
        <div className={CONTENEDOR}>
            <Encabezado />

            <Seccion titulo="1. Quién es responsable de tus datos">
                <p>
                    <D k="responsable" />, que opera BitacorIA (“BitacorIA” o “nosotros”), con domicilio en{" "}
                    <D k="domicilio" />, es responsable del uso y la protección de tus datos personales, conforme a la
                    Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                </p>
                <p>
                    Para cualquier tema de privacidad escríbenos a <D k="correoPrivacidad" />. Es el medio para ejercer
                    los derechos de este aviso.
                </p>
            </Seccion>

            <Seccion titulo="2. A quién aplica">
                <p>
                    A quien usa la app (constructoras, residentes, supervisores y personas invitadas), a quien deja sus
                    datos en www.bitacoria.com (solicitud de demo o boletín), a quien pide un plan o soporte y
                    a quien publica una reseña.
                </p>
            </Seccion>

            <Seccion titulo="3. Qué datos tratamos">
                <p>
                    <B>3.1 Al crear tu cuenta o entrar.</B> Nombre, correo, contraseña y nombre de tu empresa. La
                    contraseña se guarda de forma que nadie puede leerla. Si entras con Google, recibimos tu nombre, tu
                    correo y tu foto de perfil; nunca tu contraseña de Google. Desde octubre de 2026 guardamos qué
                    versión de estos textos aceptaste y cuándo.
                </p>
                <p>
                    <B>3.2 Al usar la plataforma.</B> Dirección IP, tipo de navegador, fecha y hora de entrada, el
                    registro de las acciones que haces en la plataforma y cuánto usas la inteligencia artificial.
                </p>
                <p>
                    <B>3.3 De tu equipo.</B> El correo y el rol de las personas que invitas. Si invitas a alguien,
                    infórmale antes de este aviso.
                </p>
                <p>
                    <B>3.4 De tus obras.</B> Lo que capturas: datos de la obra (nombre, ciudad, estado, superficie,
                    fechas), catálogos, precios, cronogramas, notas e incidencias de la bitácora, fotos, documentos,
                    mensajes al asistente (y lo que el asistente guarda de ellos para recordar el contexto de tu obra)
                    y la firma que dibujes en un reporte.
                </p>
                <Lista>
                    <li>
                        <B>Ubicación de la obra:</B> solo si presionas “Activar geolocalización”. Guardamos la ubicación
                        de tu dispositivo en ese momento como ubicación de la obra, con unos 10 metros de precisión: úsalo
                        estando en la obra. La usamos para el clima y el ajuste de precios por zona. Para llenar la
                        ciudad y el estado, tu navegador manda esa ubicación a OpenStreetMap. Para quitarla después de
                        guardar la obra, escríbenos.
                    </li>
                    <li>
                        {/* P8 (revisar si la foto se tomó cerca de la obra) no salió: la app solo lee la fecha
                            (fotoFecha.ts, con gps: false) y el servidor no guarda nada de dónde se tomó. Si P8 sale,
                            la frase vuelve aquí en el mismo envío (2026-10-27). */}
                        <B>Fotos:</B> desde el 16 de septiembre de 2026, antes de enviar una foto tu dispositivo le
                        quita la ubicación (GPS) y los datos ocultos (las fotos subidas antes pueden conservarla; si
                        quieres que se la quitemos, escríbenos). Antes de quitarlos, la app lee en tu dispositivo la
                        fecha en que se tomó la foto y la usa para proponer la fecha de la nota.
                        Las coordenadas de la foto no salen de tu dispositivo.
                    </li>
                    <li>
                        <B>Documentos:</B> la inteligencia artificial lee el contenido de los documentos que subes (PDF,
                        Excel, Word) y guardamos su texto para que el asistente lo pueda consultar.
                    </li>
                    <li>
                        <B>Voz:</B> si dictas (solo en planes de pago), mientras grabas mandamos el audio a nuestro
                        proveedor de inteligencia artificial (Google Vertex AI) para convertirlo en texto. Además, tu
                        navegador puede hacerlo con su propio servicio (Google en Chrome, Apple en Safari), con sus
                        condiciones. No guardamos el audio, solo el texto.
                    </li>
                </Lista>
                <p>
                    <B>3.5 Datos de otras personas.</B> Tus fotos, notas e incidencias pueden mostrar o mencionar a
                    trabajadores, subcontratistas u otras personas. Esos datos los tratamos solo por cuenta de tu empresa
                    y para prestarle el servicio (Términos, cláusula 10).
                </p>
                <p>
                    <B>3.6 Pagos y facturación.</B> El plan que pides, el periodo, tu correo, tu WhatsApp si nos lo das,
                    la nota que nos dejes y la referencia del pago. No recibimos ni guardamos datos de tu tarjeta ni de tu
                    cuenta bancaria. Para facturar te pedimos tu Constancia de Situación Fiscal o tu RFC, nombre o razón
                    social, régimen fiscal, código postal fiscal y uso del CFDI.
                </p>
                <p><B>3.7 Soporte.</B> Tu mensaje y tus datos de contacto.</p>
                <p>
                    <B>3.8 Reseñas.</B> Texto, calificación, rol, tipo de obra y ciudad. La reseña se publica en
                    www.bitacoria.com en cuanto la envías. Si dejas marcada la opción “Mostrar mi nombre y mi foto de
                    Google”, se ven tu nombre corto y tu foto; si la desmarcas, sale como anónima. Para retirarla,
                    escríbenos.
                </p>
                <p><B>3.9 En www.bitacoria.com.</B></p>
                <Lista>
                    <li>
                        Si llenas el formulario para pedir una demo: nombre, correo, país, perfil, obras activas e
                        interés de compra.
                    </li>
                    <li>Si te suscribes al boletín: tu correo.</li>
                    <li>
                        Si pides que te avisemos cuando haya lugar para una cuenta gratis: tu correo y tu nombre.
                    </li>
                    <li>
                        Para preseleccionar tu país, la página de registro consulta tu país aproximado en el servicio
                        ipapi.co, que recibe tu dirección IP. Nosotros no la guardamos.
                    </li>
                    <li>
                        Las fotos de perfil de las reseñas se cargan desde los servidores de Google, que reciben la
                        dirección IP de quien visita la página.
                    </li>
                </Lista>
                <p>
                    <B>3.10 Datos sensibles.</B> No te pedimos datos sensibles. No reconocemos rostros ni voces ni usamos
                    datos biométricos. Pero una incidencia de obra puede describir un accidente o el estado de salud de
                    una persona: registra solo lo necesario para la bitácora.
                </p>
                <p><B>3.11 Menores de edad.</B> BitacorIA es solo para mayores de 18 años.</p>
            </Seccion>

            <Seccion titulo="4. Para qué usamos tus datos">
                <p><B>4.1 Para darte el servicio:</B></p>
                <Lista>
                    <li>Crear y administrar tu cuenta y la de tu empresa, y darte acceso a tus obras y a tu equipo.</li>
                    <li>Prestar las funciones de la plataforma: catálogo, cronograma, bitácora, asistente, reportes y PDF.</li>
                    <li>Procesar con inteligencia artificial lo que nos pides (sección 5).</li>
                    <li>Guardar el historial de tus obras y el registro de quién hizo cada cambio.</li>
                    <li>
                        Proteger la plataforma: límites de intentos, topes de uso de IA, verificación contra programas
                        automáticos y prevención de abusos.
                    </li>
                    <li>Cobrar, activar y renovar planes, avisarte de vencimientos y emitir facturas.</li>
                    <li>Mandarte los correos del servicio: bienvenida, contraseña, invitaciones, plan, vencimiento y soporte.</li>
                    <li>Atender tus solicitudes de soporte.</li>
                    <li>Hacer respaldos y recuperar la información ante una falla.</li>
                    <li>Cumplir obligaciones legales y requerimientos de autoridad.</li>
                    <li>Si pediste una demo: contactarte para prepararla.</li>
                </Lista>
                <p><B>4.2 Adicionales, que puedes rechazar sin perder el servicio:</B></p>
                <Lista>
                    <li>Mandarte el boletín y novedades de BitacorIA.</li>
                    <li>Publicar tu reseña en www.bitacoria.com (solo si la envías).</li>
                    <li>Invitarte a encuestas de satisfacción.</li>
                </Lista>
                <p>
                    Para negarte, escribe a <D k="correoPrivacidad" /> con el asunto “No acepto finalidades adicionales”
                    y di cuáles.
                </p>
            </Seccion>

            <Seccion titulo="5. Inteligencia artificial">
                <Lista>
                    <li>
                        Varias funciones se procesan con Google Vertex AI (Google Cloud), que trabaja por nuestra cuenta:
                        el chat, la lectura de fotos y documentos, la generación de catálogos y cronogramas, el reporte
                        con IA, la transcripción de voz y la búsqueda de normativa y de tus documentos.
                    </li>
                    <li>Sus condiciones prohíben a Google usar tus datos para entrenar sus modelos.</li>
                    <li>Google puede procesar la información en distintos países donde tiene infraestructura.</li>
                    <li>BitacorIA no entrena modelos de lenguaje propios con tu información.</li>
                    <li>No usamos otro proveedor de IA. Si algún día lo hacemos, actualizamos este aviso antes.</li>
                    <li>La IA propone y tú decides: el asistente no anota nada en tu obra sin tu sí.</li>
                </Lista>
            </Seccion>

            <Seccion titulo="6. Con quién compartimos tus datos">
                <p>
                    <B>6.1 Proveedores que trabajan por nuestra cuenta</B> y solo pueden usar tus datos para darnos su
                    servicio:
                </p>
                <Lista>
                    <li>Supabase: base de datos y archivos de la app (Estados Unidos) y formularios del sitio.</li>
                    <li>
                        Google Cloud: servidor, respaldos, inteligencia artificial e inicio de sesión con Google (Estados
                        Unidos y otros países donde Google tiene infraestructura).
                    </li>
                    <li>Vercel: alojamiento de la app y del sitio.</li>
                    <li>Resend: envío de los correos del servicio.</li>
                    <li>
                        Google (Gmail): el buzón del equipo, que recibe las solicitudes de plan, de soporte y de aviso
                        cuando haya lugar.
                    </li>
                    <li>
                        Sentry: registro de errores técnicos del servidor. Está configurado para reducir al mínimo los
                        datos personales, pero ante un error puede recibir fragmentos de lo que se estaba procesando.
                    </li>
                    <li>Cloudflare: comprobar, al registrarte con correo, que no eres un programa automático.</li>
                    <li>
                        OpenStreetMap: ciudad y estado a partir de la ubicación de la obra, solo si activas la
                        geolocalización.
                    </li>
                    <li>ipapi.co: país aproximado en la página de registro del sitio.</li>
                </Lista>
                <p>
                    <B>6.2 Otros.</B> Mercado Pago procesa tu pago con su propio aviso de privacidad. Si nos escribes por
                    WhatsApp o por correo, esos servicios (Meta y Google) procesan el mensaje.
                </p>
                <p>
                    <B>6.3 Dentro de tu empresa.</B> Lo que capturas en una obra lo pueden ver todas las personas de tu
                    empresa que tienen cuenta en BitacorIA.
                </p>
                <p>
                    <B>6.4 Autoridades.</B> Solo compartimos datos con autoridades cuando la ley lo exige o lo ordenan.
                </p>
                <p><B>6.5 No vendemos ni rentamos tus datos.</B></p>
            </Seccion>

            <Seccion titulo="7. Cuánto tiempo los guardamos">
                <Lista>
                    <li>
                        Cuenta, empresa y obras: mientras exista tu cuenta. <B>Nada se borra solo</B>: al vencer o cancelar
                        sigue lo que dicen los Términos (cláusula 8), y se borra si lo pides.
                    </li>
                    <li>
                        Registro de quién hizo cada cambio y de uso de la IA: lo conservamos aunque pidas borrar tu
                        cuenta; puede incluir nombres, correos o partes de lo que capturaste.
                    </li>
                    <li>Pagos y facturas: el plazo que pidan las leyes fiscales.</li>
                    <li>
                        Respaldos: la copia diaria de la base de datos se borra a los 14 días y queda 7 días más en la
                        papelera del proveedor; las copias diarias del disco del servidor se borran a los 7 días.
                    </li>
                    <li>Registros técnicos del servidor: <D k="plazoRegistrosServidor" />.</li>
                    <li>Boletín: hasta que te des de baja.</li>
                    <li>Solicitudes de demo: <D k="plazoProspectos" />.</li>
                    <li>Reseñas: hasta que nos pidas retirarla o la retiremos.</li>
                </Lista>
            </Seccion>

            <Seccion titulo="8. Cómo protegemos tus datos">
                <Lista>
                    <li>La información viaja cifrada (HTTPS) y nuestros proveedores la guardan cifrada.</li>
                    <li>Las contraseñas se guardan de forma que nadie puede leerlas.</li>
                    <li>Registramos quién hace cada cambio.</li>
                    <li>Respaldamos la base de datos todos los días.</li>
                </Lista>
                <p>
                    Ningún sistema es infalible. Si ocurre una vulneración de seguridad que afecte de forma importante tus
                    derechos, te avisamos sin demora.
                </p>
            </Seccion>

            <Seccion titulo="9. Tus derechos (ARCO) y cómo revocar tu consentimiento">
                <p>
                    Puedes pedir acceso a tus datos, su rectificación, su cancelación u oponerte a un uso. También puedes
                    revocar tu consentimiento.
                </p>
                <p>
                    Escribe a <D k="correoPrivacidad" /> desde el correo de tu cuenta con tu nombre, qué pides y sobre qué
                    datos, y en una rectificación el dato correcto. Si escribes desde otro correo o en nombre de otra
                    persona, te pedimos una identificación o el documento que acredite la representación; solo la usamos
                    para verificar tu identidad.
                </p>
                <p>
                    {/* Plazos de la ley de 2010; el abogado los confirma contra la ley de 2025 (borrador en
                        Backend-Bit/_contexto/legal/). Lo mismo la autoridad de la sección 14. */}
                    Te respondemos en un máximo de 20 días hábiles desde que recibimos la solicitud completa y, si
                    procede, la hacemos efectiva en los 15 días hábiles siguientes. Si formas parte de una empresa
                    cliente, parte de la información de las obras es de esa empresa: coordinamos tu solicitud con su
                    administrador.
                </p>
            </Seccion>

            <Seccion titulo="10. Cómo limitar el uso de tus datos">
                <Lista>
                    <li>Darte de baja del boletín.</li>
                    <li>Publicar tu reseña como anónima o pedirnos que la retiremos.</li>
                    <li>No activar la geolocalización de la obra.</li>
                    <li>No usar el dictado por voz.</li>
                    <li>Escribirnos a <D k="correoPrivacidad" />.</li>
                </Lista>
            </Seccion>

            <Seccion titulo="11. Cookies y almacenamiento en tu navegador">
                <Lista>
                    <li>
                        App: una cookie de sesión necesaria para mantenerte dentro (el código de la página no puede
                        leerla; dura hasta 30 días, pero tu sesión se cierra si pasas 7 días sin usar la app) y una
                        cookie que comparten la app y www.bitacoria.com con tu nombre, tus iniciales y la dirección de
                        tu foto, que el sitio puede leer para reconocer que ya tienes cuenta (30 días).
                        También tus preferencias (tema, recorridos y avisos que ya viste) y, mientras la pestaña está
                        abierta, una copia temporal de parte de tus obras y mensajes.
                    </li>
                    <li>
                        Al registrarte con correo, Cloudflare puede usar cookies o señales de tu navegador para comprobar
                        que no eres un programa automático.
                    </li>
                    <li>
                        Sitio: guardamos en tu navegador tu nombre y correo para reconocer que ya te registraste, y tu
                        tema; mientras dura la visita, tu país aproximado y el correo que escribiste en la portada.
                    </li>
                    <li>No usamos cookies publicitarias ni herramientas de analítica de terceros.</li>
                    <li>Si bloqueas la cookie de sesión, no podrás usar la app.</li>
                </Lista>
            </Seccion>

            <Seccion titulo="12. Cambios a este aviso">
                <p>
                    Publicamos cualquier cambio en www.bitacoria.com con su fecha. Si el cambio es importante, también te
                    avisamos por correo o dentro de la app antes de que aplique.
                </p>
            </Seccion>

            <Seccion titulo="13. Cómo aceptas este aviso">
                <p>
                    Al crear tu cuenta (con tu correo, con Google o al aceptar una invitación) confirmas que leíste este
                    aviso. Guardamos qué versión aceptaste y cuándo.
                </p>
            </Seccion>

            <Seccion titulo="14. Autoridad">
                <p>
                    Si consideras que tus derechos no fueron atendidos, puedes acudir a la autoridad de protección de
                    datos personales que señale la ley.
                </p>
            </Seccion>
        </div>
    );
}
