# Correos de AFTERSCENE

Plantillas HTML listas para **Confirm sign up** y **Reset password** en Supabase Auth. Asuntos sugeridos: `Confirma tu correo · AFTERSCENE` y `Recupera tu acceso · AFTERSCENE`. Usan `{{ .ConfirmationURL }}` y `{{ .SiteURL }}` de Supabase y una imagen cinematográfica real servida por AFTERSCENE; el contenido sigue siendo legible si el cliente de correo bloquea imágenes.

La configuración actual de Supabase usa el servidor predeterminado y no permite editar las plantillas. Para enviar como **AFTERSCENE <afterescene@gmail.com>**, configura SMTP personalizado en Authentication → Emails → SMTP Settings y después pega estas plantillas en los dos editores. Si usas Gmail SMTP, Google exige una **contraseña de aplicación** con verificación en dos pasos; la contraseña normal de la cuenta no sirve para esta integración. Nunca guardes credenciales SMTP en Git ni en el navegador de la app.
