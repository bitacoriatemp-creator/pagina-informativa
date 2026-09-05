/* Traspaso del correo entre el hero y /registro.
   Va por sessionStorage y no por la URL: un correo en la barra de direcciones
   acaba en el historial del navegador y en el referrer de cualquier recurso
   externo que cargue la página. La clave se lee UNA vez y se borra. */
export const HANDOFF_EMAIL = "bitacoria_registro_email";

/** Bandera local de "esta persona ya se dio de alta desde este navegador". */
export const REGISTERED_FLAG = "bitacoria_registered";
