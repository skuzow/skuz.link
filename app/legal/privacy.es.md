## 1. Quién soy

Soy Alejandro Porras, gestiono skuz.link desde España y soy el responsable de los datos personales que describe esta política. Puedes escribirme a [contact@skuz.link](mailto:contact@skuz.link).

En el [Aviso legal](/es/aviso-legal) encontrarás más sobre quién soy, y en los [Términos de uso](/es/terminos), las normas para usar skuz.link.

## 2. Qué datos trato y para qué

### Cualquiera que abre skuz.link

Cloudflare atiende cada petición que llega a skuz.link. Para servirla, recibe tu dirección IP, tu navegador, la dirección que pides y la hora. Guarda registros y trazas de las peticiones durante un máximo de 7 días, y yo los uso para mantener el sitio seguro y corregir errores.

### Quien abre una URL corta

Al abrir una URL corta, además, se suma uno al contador de clics de su enlace. No guardo nada sobre ti junto al enlace.

El sitio al que redirige la URL corta tiene sus propias normas de privacidad.

### Usuarios

Cuando inicias sesión con Google o con GitHub, guardo:

- tu nombre, tu correo electrónico y la dirección de tu avatar, que recibo de Google o de GitHub. Tu navegador carga el avatar desde sus servidores;
- tus cuentas conectadas: el identificador de tu cuenta en Google o en GitHub y los tokens que te emiten al iniciar sesión;
- tus sesiones: el navegador (user agent), la dirección IP, y cuándo se crearon y cuándo caducan;
- tus enlaces: el slug, la dirección a la que redirigen y su número de clics.

La dirección IP de cada sesión la tomo de la cabecera `CF-Connecting-IP`, en la que Cloudflare pone tu dirección real. Guardo las direcciones IPv4 completas y las IPv6 acortadas a su red /64. La uso solo para investigar abusos y para mantener seguras las cuentas, por ejemplo para averiguar desde dónde se usó tu cuenta si alguien entró en ella. Se borra junto con su sesión: cuando cierras sesión, cuando la revocas o, como tarde, 30 días después de que caduque.

### Usuarios bloqueados

Si bloqueo a un usuario por incumplir los Términos de uso, conservo su nombre, su correo electrónico, el motivo del bloqueo y los identificadores de sus cuentas conectadas, para que la misma cuenta de Google o de GitHub no pueda volver a registrarse.

### Quien me escribe

Si me escribes a [contact@skuz.link](mailto:contact@skuz.link) o a [abuse@skuz.link](mailto:abuse@skuz.link), guardo tu dirección de correo electrónico y tu mensaje.

## 3. Bases legales

| Tratamiento                                    | Base legal                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Atender las peticiones, registros y trazas     | Interés legítimo: ofrecer el sitio, mantenerlo seguro y corregir errores (art. 6.1.f RGPD)                            |
| Cuenta, cuentas conectadas, sesiones y enlaces | Contrato: prestarte el servicio conforme a los Términos de uso (art. 6.1.b RGPD)                                      |
| Direcciones IP de las sesiones                 | Interés legítimo: investigar abusos y mantener seguras las cuentas (art. 6.1.f RGPD)                                  |
| Gestión de abusos y bloqueos                   | Interés legítimo: mantener skuz.link libre de abusos (art. 6.1.f RGPD)                                                |
| Correos electrónicos                           | Interés legítimo en responderte (art. 6.1.f RGPD); en las solicitudes de derechos, obligación legal (art. 6.1.c RGPD) |

## 4. Cookies y almacenamiento del navegador

skuz.link guarda en tu navegador solo estas entradas. Las cuatro primeras son cookies, y `nuxt-color-mode` es una entrada de localStorage.

| Nombre                               | Para qué                                                                | Cuándo se guarda                            | Cuánto dura                  |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| `__Secure-better-auth.session_token` | Mantiene tu sesión iniciada                                             | Al iniciar sesión                           | 7 días, renovados con el uso |
| `__Secure-better-auth.session_data`  | Guarda una copia de tu sesión para ahorrar consultas a la base de datos | Al iniciar sesión                           | 5 minutos                    |
| `__Secure-better-auth.state`         | Protege el viaje de ida y vuelta a Google o a GitHub                    | Solo mientras inicias sesión                | 5 minutos                    |
| `i18n_redirected`                    | Recuerda tu idioma (`en` o `es`)                                        | En la primera visita y al cambiar de idioma | 1 año                        |
| `nuxt-color-mode`                    | Recuerda el tema (`light`, `dark` o `system`)                           | En la primera visita y al cambiar de tema   | Hasta que la borres          |

Ninguna de ellas sirve para rastrearte, mostrarte publicidad ni hacer analítica. Por eso no hay banner de cookies: las tres primeras son necesarias para iniciar sesión, y las otras dos solo recuerdan cómo quieres ver el sitio.

Puedes borrarlas cuando quieras desde los ajustes de tu navegador. Si borras las de sesión, tendrás que volver a iniciar sesión.

## 5. Quién más recibe datos

| Destinatario              | Qué hace                                                                                                 | Dónde            | Garantía de la transferencia            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------- |
| Cloudflare, Inc.          | Encargado del tratamiento: alojamiento, base de datos, registros y trazas, y reenvío del correo          | EE. UU. y global | Marco de Privacidad de Datos UE-EE. UU. |
| Google LLC y GitHub, Inc. | Responsables independientes del inicio de sesión y de servir tu avatar, solo si inicias sesión con ellos | EE. UU.          | Marco de Privacidad de Datos UE-EE. UU. |
| Proton AG                 | Encargado del tratamiento: el buzón de `contact@skuz.link` y `abuse@skuz.link`                           | Suiza            | Decisión de adecuación de la UE         |

Nunca vendo tus datos, ni los uso para publicidad, ni hago analítica con ellos.

## 6. Cuánto tiempo los conservo

| Datos                                                                          | Cuánto tiempo                                                                                         |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Registros y trazas de las peticiones en Cloudflare                             | Hasta 7 días                                                                                          |
| Datos de la cuenta (usuario, cuentas conectadas, enlaces)                      | Hasta que eliminas tu cuenta y, después, hasta 30 días en las copias de seguridad de la base de datos |
| Sesiones, con su dirección IP                                                  | Hasta que cierras sesión o la revocas y, como tarde, 30 días después de que caduquen                  |
| Registro del bloqueo (nombre, correo electrónico, motivo y cuentas conectadas) | Mientras skuz.link siga funcionando                                                                   |
| Correos a `contact@skuz.link`                                                  | Hasta que los atiendo                                                                                 |
| Denuncias de abuso a `abuse@skuz.link`                                         | 1 año                                                                                                 |

Lo que borro de la base de datos sigue hasta 30 días más en sus copias de seguridad y después desaparece.

## 7. Tus derechos

Tienes derecho a acceder a tus datos, a rectificarlos, a suprimirlos, a limitar su tratamiento, a oponerte a él y a llevártelos a otro servicio (portabilidad).

En los Ajustes puedes ejercer algunos tú mismo:

- editar tu nombre;
- revocar tus sesiones;
- desconectar una cuenta conectada;
- eliminar tu cuenta, lo que borra también tus enlaces y tus sesiones.

Para todo lo demás, escríbeme a [contact@skuz.link](mailto:contact@skuz.link) desde el correo electrónico de tu cuenta. Si no puedes, te pediré que demuestres de otro modo que la cuenta es tuya. Te responderé en el plazo de un mes.

Tu correo electrónico es el de tu cuenta de Google o de GitHub. Si necesitas corregirlo, escríbeme.

Si te he bloqueado y pides la supresión de tus datos, borro todo salvo el registro del bloqueo, que necesito para que no vuelvas a registrarte.

Si crees que no he atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos en [aepd.es](https://www.aepd.es).

## 8. Edad mínima

Para usar skuz.link tienes que tener al menos 14 años. Si descubro que una cuenta pertenece a alguien más joven, la elimino.

## 9. Cambios

Cuando cambie esta política, cambiará la fecha de última actualización que aparece arriba.
