# AFTERSCENE

Archivo cinematográfico personal en español, con interfaz oscura inspirada en las referencias aportadas, imágenes reales y cuentas privadas.

## Desarrollo

Node.js 22.13 o superior. Ejecuta `npm ci`, copia `.env.example` a `.dev.vars`, configura las cuatro variables y ejecuta `npm run dev`. Las credenciales están excluidas de Git. Nunca se necesita una clave administrativa de Supabase.

Verificación: `npx tsc --noEmit`, `npm test`, `npm run build`.

## Catálogos reales

- TMDB: películas, series, K-dramas, búsqueda, tendencias, reparto, temporadas y tráileres.
- Jikan: anime, temporada, películas y episodios. Los ID de MyAnimeList se conservan sin inventar equivalencias con TMDB. Un Durable Object coordina caché y límites globales. Si Jikan no responde, las listas muestran anime de TMDB con un aviso visible; las fichas de MyAnimeList no se sustituyen por títulos aproximados.
- TheTVDB: información adicional de series enlazadas mediante el ID externo verificado por TMDB.
- `data/catalog.json`: instantánea real de 21 títulos obtenida de TMDB el 19 de octubre de 2026, con fecha y procedencia. Sirve para los destacados iniciales; las búsquedas y tendencias consultan las APIs.

Los pósteres y fotogramas proceden de los proveedores. No se incluyen imágenes generadas por IA. Las puntuaciones de los catálogos y las calificaciones personales se muestran por separado. Los datos no disponibles se indican como tales.

## Archivo y perfil

La biblioteca, favoritos, Tops, colecciones, recuerdos y estadísticas empiezan vacíos. El perfil permite nombre, alias, biografía, ubicación, color, foto, banner, fondo y hasta cuatro historias favoritas. Las fotografías se optimizan en el dispositivo. Se conservan en el archivo privado, con exportación/importación JSON validada.

El acceso admite correo y contraseña, registro, confirmación y recuperación mediante Supabase. No se muestran proveedores sociales sin configurar. En modo invitado se guarda en este navegador; al iniciar sesión se carga un archivo separado por cuenta. La versión local anterior permanece intacta y puede importarse explícitamente.

Supabase guarda una instantánea JSONB por usuario en `user_archives`, con RLS forzado y políticas de propietario para las cuatro operaciones. La migración está en `supabase/migrations/001_private_archive.sql`. Las imágenes pequeñas se almacenan dentro del archivo. La copia local está sujeta a la cuota del navegador y la aplicación informa de errores de guardado. La sincronización usa última escritura, sin conciliación de ediciones simultáneas.

## Cloudflare

Worker: `afterscene`, cuenta `e3dde56eb9a7a627f9654809220fc0af`.
URL: https://afterscene.el-ulicesss.workers.dev

El repositorio `ulices67/afterscene`, rama `main`, construye con `npm run build` y publica con `npm run deploy`. Este último usa `dist/server/wrangler.json`, generado por Vite. `keep_vars` conserva las variables del panel. TMDB y TheTVDB son secretos del servidor; Supabase utiliza únicamente URL y clave publicable.

En Supabase, el origen de producción y las redirecciones de confirmación y recuperación apuntan al Worker. La prueba transaccional `supabase/tests/isolation_transaction.sql` verifica aislamiento entre dos identidades y revierte todos los datos de prueba.

## Recursos y límites

`docs/ASSETS.md` documenta las fuentes. `app/reference.css` contiene los ajustes visuales. El SVG de diseño se puede importar en Figma; no equivale a un archivo remoto con Auto Layout.

La aplicación enlaza tráileres y disponibilidad legal; no distribuye películas comerciales. El reproductor local admite archivos compatibles del usuario y subtítulos VTT. YouTube puede restringir vídeos por región o permisos. La entrega de correos depende de la configuración y límites del proveedor de autenticación.
