# Decisiones del sitio (www.bitacoria.com)

Registro corto de decisiones de producto sobre la landing. Cada entrada dice qué se decidió,
qué pasó antes y qué regla queda. Se lee antes de tocar cualquier elemento visible del sitio.

## 2026-09-12 — La barra es solo el logo: ni "Iniciar sesión" ni "Empezar gratis"

**Decisión (Luis).** El sitio vende y enlaza; no autentica ni ofrece entrada a la app a quien ya
tiene cuenta. La barra superior es el logo y su menú, nada más. El embudo hacia la app vive donde
el visitante ya está leyendo: el hero ("Continuar con Google" y el correo abren el alta) y el botón
de cada plan. Quien ya tiene cuenta entra por `app.bitacoria.com`.

**Qué había y cómo llegó ahí.**

- Hasta el 5 de septiembre la barra tenía un único "Acceder" que abría la encuesta de `/registro`.
- El 9 de septiembre (`37ca4e9`, trabajo del embudo www → app) ese "Acceder" se reemplazó por dos
  botones, **Iniciar sesión** (→ `/auth`) y **Empezar gratis** (→ `/auth?mode=register&plan=draft`),
  en cuatro sitios del mismo componente: barra *pill* del hero, barra delgada al hacer scroll, menú
  hamburguesa y panel del logo (`GlobalNavbar.tsx`, `LogoMenu.tsx`).
- Llegó a `main` el 10 de septiembre con el PR #1 ("Enlaces a la app y pie de precios"), y de ahí a
  producción por Vercel.
- El 12 de septiembre Luis los vio en producción, arriba a la derecha del hero, y los quitó los
  dos: primero "Iniciar sesión" y, al ver el Preview, también "Empezar gratis".

**Cuál fue el error.** No fue de código: el enlace funcionaba. Fue de proceso. Un cambio de
*qué ofrece la landing* — un punto de entrada nuevo, visible en el hero — se coló dentro de un PR
cuyo título hablaba de enlaces y precios, y se mergeó sin que Luis viera el resultado en pantalla.
La landing es la cara comercial y su diseño es de Luis; agregar controles ahí es una decisión de
producto, no un detalle de implementación. Además, un "login" en la landing contradice la premisa
del hero ("Continuar con Google" abre el *alta* en la app; el sitio nunca autentica) y confunde a
quién va dirigida la página: prospectos, no usuarios.

**Regla que queda.**

1. En el www, un PR que agregue, quite o mueva **cualquier control visible** (botón, enlace,
   formulario, menú) lo describe en el título y **espera el ok de Luis sobre el Preview de Vercel**
   antes del merge. Copy y precios ya tenían esa regla; ahora también la tiene la UI.
2. La landing **no enlaza a `/auth` sin `mode=register`**, y **la barra (`GlobalNavbar`,
   `LogoMenu`) no enlaza a la app en absoluto**. `loginUrl()` sigue existiendo en
   `src/lib/appUrl.ts` por si algún día cambia la decisión, pero ningún componente lo usa. El test
   `src/components/ui/__tests__/sinInicioDeSesion.test.ts` revienta si alguien vuelve a importarlo,
   escribe "Iniciar sesión" en un componente, o mete `appUrl`/`app.bitacoria.com` en la barra.
3. Antes de un despliegue, se mira la página **como la ve un cliente**, en producción, no solo el
   CI. El CI verde de este repo no cubre lo que se ve.

## 2026-09-25 — Reseñas reales en la portada

**Decisión (JC; espera el ok de Luis en el Preview).** La portada muestra, entre el hero y los
planes, una cinta horizontal ("cinta de obra", `ResenasSection`) con reseñas reales de usuarios de
la app: foto de Google o iniciales, nombre abreviado ("Ricardo M."), rol y tipo de obra, estrellas,
el texto tal cual, la respuesta del equipo cuando la hay y el conteo honesto ("4.7 · 12 reseñas").
La reseña **se pide dentro de la app**, después de la prueba gratis; el sitio solo la muestra.
Contrato del backend: `_kit_socio/docs/PARA_LUIS_RESENAS_CONTRATO_2026-09-25.md`.

**Por qué así.** Un bloque de testimonios inventados es lo primero que un residente huele; una
cinta con puras cinco estrellas, lo segundo. Por eso las reseñas salen del backend con cuenta de
Google verificada, se publican también las de 1 a 3 estrellas (con respuesta del equipo; la
moderación solo retira spam, abuso o datos personales) y la sección no aparece hasta tener cinco.

**Regla que queda.**

1. **La sección no enlaza a la app** ni tiene botón de "Deja tu reseña": el sitio no autentica
   (regla del 12 de septiembre) y solo puede opinar quien ya tiene cuenta. La única referencia es
   la nota al pie ("Las reseñas se escriben desde la app, con cuenta de Google verificada").
2. **Con menos de 5 reseñas publicadas la sección no existe en el HTML** (`obtenerResenas()`
   devuelve `null`). Lo mismo si falta `RESENAS_API_URL`, si el backend no responde en 4 s o si la
   respuesta no cumple el contrato. Mejor nada que tres reseñas.
3. **Los datos se leen en el servidor.** `src/app/page.tsx` es componente de servidor: lee la API
   con caché de una hora (`RESENAS_API_URL`, variable de servidor en Vercel) y pasa el resultado a
   `LandingHome`. El navegador nunca habla con la API; la foto solo se acepta si es `https` de
   `*.googleusercontent.com`, y el nombre se vuelve a abreviar aquí por si llegara uno completo.
4. **Es un control visible nuevo**: por la regla 1 del 12 de septiembre, el PR lo describe en el
   título y **espera el ok de Luis sobre el Preview de Vercel** antes del merge. Hasta que el
   backend exponga `GET /api/v1/public/reviews`, la variable no se pone y la portada se ve igual
   que hoy. Para verla en local: `RESENAS_DEMO=true` (datos de ejemplo, nunca en producción).

**Tests.** `src/lib/__tests__/resenas.test.ts` (validación, umbral de 5, red caída, nombre y fecha)
y `src/components/ui/__tests__/resenasSection.test.ts` (render con 5 y no con 4, sin enlaces a la
app, respuesta del equipo, foto o iniciales, flechas y arrastre). Los tests de la cinta reutilizan
el DOM falso de `heroDemoShowcase.entorno.ts`, que pertenece al commit del video móvil: **el commit
de reseñas se sube después (o junto) al del video**; si sube solo, vitest no encuentra el helper y
el CI queda en rojo aunque el código esté bien.
