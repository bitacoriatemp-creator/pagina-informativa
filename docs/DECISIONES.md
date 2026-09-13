# Decisiones del sitio (www.bitacoria.com)

Registro corto de decisiones de producto sobre la landing. Cada entrada dice qué se decidió,
qué pasó antes y qué regla queda. Se lee antes de tocar cualquier elemento visible del sitio.

## 2026-09-12 — La landing no tiene "Iniciar sesión"

**Decisión (Luis).** El sitio vende y enlaza; no autentica ni ofrece entrada a la app a quien ya
tiene cuenta. El único acceso hacia la app desde la landing es **Empezar gratis** (alta con plan
Draft) y los botones de cada plan. Quien ya tiene cuenta entra por `app.bitacoria.com`.

**Qué había y cómo llegó ahí.**

- Hasta el 5 de septiembre la barra tenía un único "Acceder" que abría la encuesta de `/registro`.
- El 9 de septiembre (`37ca4e9`, trabajo del embudo www → app) ese "Acceder" se reemplazó por dos
  botones, **Iniciar sesión** (→ `/auth`) y **Empezar gratis** (→ `/auth?mode=register&plan=draft`),
  en cuatro sitios del mismo componente: barra *pill* del hero, barra delgada al hacer scroll, menú
  hamburguesa y panel del logo (`GlobalNavbar.tsx`, `LogoMenu.tsx`).
- Llegó a `main` el 10 de septiembre con el PR #1 ("Enlaces a la app y pie de precios"), y de ahí a
  producción por Vercel.
- El 12 de septiembre Luis lo vio en producción, arriba a la derecha del hero, y lo quitó.

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
2. La landing **no enlaza a `/auth` sin `mode=register`**. `loginUrl()` sigue existiendo en
   `src/lib/appUrl.ts` por si algún día cambia la decisión, pero ningún componente lo usa. El test
   `src/components/ui/__tests__/sinInicioDeSesion.test.ts` revienta si alguien lo vuelve a importar
   o escribe "Iniciar sesión" en un componente.
3. Antes de un despliegue, se mira la página **como la ve un cliente**, en producción, no solo el
   CI. El CI verde de este repo no cubre lo que se ve.
