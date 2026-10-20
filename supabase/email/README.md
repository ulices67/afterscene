# Correos de AFTERSCENE

Plantillas HTML listas para **Confirm sign up** y **Reset password** en Supabase Auth. Asuntos sugeridos: `Confirma tu correo · AFTERSCENE` y `Recupera tu acceso · AFTERSCENE`. Usan `{{ .ConfirmationURL }}` y `{{ .SiteURL }}` de Supabase y una imagen cinematográfica real servida por AFTERSCENE; el contenido sigue siendo legible si el cliente de correo bloquea imágenes.

En producción, el SMTP personalizado de Supabase está activado con el remitente **AFTERSCENE <afterescene@gmail.com>**. Ambas plantillas se aplicaron a Authentication → Emails el 19 de octubre de 2026. La imagen se sirve desde el dominio público de la aplicación; algunos clientes y la vista previa de Supabase bloquean imágenes externas, por lo que cada mensaje incluye texto alternativo y contenido legible sin imágenes. Si se reconstruye el proyecto, pega estas plantillas en los dos editores. Nunca guardes credenciales SMTP en Git ni en el navegador de la app.
