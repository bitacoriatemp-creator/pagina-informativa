# Decisiones del sitio (www.bitacoria.com)

Registro corto de decisiones de producto sobre la landing. Cada entrada dice qué se decidió,
qué pasó antes y qué regla queda. Se lee antes de tocar cualquier elemento visible del sitio.

## 2026-09-23 — Con sesión abierta en la app, la barra y el hero muestran la cuenta (propuesta de JC, pendiente del ok de Luis)

**Qué cambia.** JC pidió que, con sesión ya abierta, entrar a `bitacoria.com` lleve directo al
tablero y que, si aun así quiere ver la landing, ya no le salga "Iniciar sesión" sino solo
**Acceder** o **Cerrar sesión**, con el círculo de su foto: en la barra y en el hero. Es una
excepción acotada a la regla 2 de abajo:

- La app escribe una cookie de aviso `bitacoria_cuenta` (no es credencial: nombre para mostrar,
  iniciales y, si la hay, la URL de la foto; sin correo ni ids; 700 bytes como mucho, el mismo
  tope en los dos repos) y la borra al cerrar sesión. Sin esa cookie, la barra es exactamente la
  de siempre y nadie sin sesión ve un punto de entrada nuevo.
- `src/middleware.ts` (solo `/`): con la cookie, `/` responde 307 a `<APP>/dashboard`. No redirige
  con `/?sitio=1` ("Ver sitio" del tablero, que además deja la cookie `bitacoria_ver_sitio`), ni al
  llegar a `/` desde otra página del propio sitio.
- `bitacoria_ver_sitio` dura **30 minutos** (`Max-Age=1800`), no la sesión del navegador: los
  navegadores que restauran pestañas guardan días las cookies de sesión, y quien pulsó "Ver sitio"
  una vez seguía viendo la landing al teclear `bitacoria.com` mucho después.
- **Diseño (24-09, JC).** En la barra, con sesión: el botón **Acceder** (→ tablero), a la vista
  y con el estilo de botón primario de la barra (café de marca, tinta oscura), y a su derecha el
  **círculo de cuenta**: la foto si la cookie trae una válida, si no las iniciales (blanco sobre
  café oscuro `#8B6D3F`, 4.8:1; sobre el café claro `#C39767` se quedaba en 2.6:1). El círculo
  abre un menú pequeño con "Sesión abierta como <nombre>" y **Cerrar sesión**. El nombre ya no va
  en la barra. En la home el par va a la izquierda del logo (la marca sigue a plomo con el borde
  del hero); en las demás páginas, al otro extremo. Sustituye a la píldora con nombre y flecha del
  23-09.
- **Acceder también en el teléfono (24-09, JC).** Por debajo de 640 px "Acceder" se escondía y
  vivía en el menú hamburguesa; ahora está en la barra en todos los anchos, en su versión
  compacta (32 px de alto, menos relleno, letra de 11 px, el mismo café con tinta oscura), con el
  círculo también a 32 px y 8 px entre piezas. Para que logo, Acceder, círculo y hamburguesa
  quepan en 320 px, por debajo de 360 px el logo del hero baja de 144 a 96 px (el mismo lockup:
  la barra no tiene isotipo propio; a 112 px, en 320 sobraban 1.6 px). El menú hamburguesa ya no repite "Acceder": deja el círculo
  con "Sesión abierta como <nombre>" y Cerrar sesión. Sin sesión, la barra no cambia en nada.
- **Foto.** Hoy nadie tiene foto (Google está apagado en producción y el backend no guarda
  avatar): queda preparado. Solo se acepta `https` de `lh3.googleusercontent.com` o cualquier
  `*.googleusercontent.com`, más los hosts de la variable opcional `NEXT_PUBLIC_AVATAR_HOSTS`;
  cualquier otra URL se descarta al escribir y al leer, y la cuenta sigue con las iniciales. La
  foto se pinta sin referrer y, si no carga, el círculo vuelve a las iniciales.
- **Hero (23-09, JC).** Con sesión, la caja de alta de la home (`HeroHybrid.tsx`: "Continuar con
  Google", el correo, "Continuar" y el aviso de privacidad) se cambia por la caja de la cuenta
  (`CajaCuenta`): arriba el círculo en grande (56 px, el mismo `Avatar` de la barra: foto con
  vuelta a las iniciales si no carga) con "Sesión abierta como <nombre>", debajo **Acceder**
  (→ tablero) a lo ancho, con el mismo botón relleno que "Continuar", y **Cerrar sesión** como
  enlace secundario (→ `/auth/salir` con vuelta a www). Nada del alta con sesión. Es la misma
  caja (mismo ancho, sin fondo ni borde, como el alta) y conserva el alto que tenía el alta: la
  cookie se lee al montar, así que el primer render es siempre el alta y el cambio no mueve lo de
  abajo. Sin sesión, el hero queda exactamente como estaba.
- La cuenta vive en `src/components/ui/CuentaSesion.tsx` y es lo único de la barra que enlaza a la
  app, y solo con `dashboardUrl()` y `salirUrl()`; fuera de ella, solo la caja de la cuenta del
  hero usa esas dos. Sigue prohibido "Iniciar sesión", `loginUrl`, "Empezar gratis" y
  `registerUrl` en la barra, y "Iniciar sesión" y `loginUrl` en cualquier componente; el test
  `sinInicioDeSesion.test.ts` lo vigila.

**Pendiente.** Por la regla 1, no se mergea sin el ok de Luis sobre el Preview de Vercel.

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
