# AFTERSCENE

Archivo cinematográfico personal en español, con interfaz oscura inspirada en las referencias aportadas, imágenes reales y cuentas privadas.

## Desarrollo

Node.js 22.13 o superior. Ejecuta `npm ci`, copia `.env.example` a `.dev.vars`, configura las cinco variables y ejecuta `npm run dev`. Las credenciales están excluidas de Git. Nunca se necesita una clave administrativa de Supabase. La API pública de MyAnimeList solo usa `MAL_CLIENT_ID` desde el servidor; no usa el Client Secret.

Verificación: `npx tsc --noEmit`, `npm test`, `npm run build`.

## Catálogos reales

- TMDB: películas, series, K-dramas, búsqueda, tendencias, reparto, temporadas y tráileres.
- Personas: búsqueda de intérpretes y cineastas, biografías, fotografías y filmografía verificables en TMDB.
- MyAnimeList: búsquedas, clasificaciones y fichas públicas de anime con el Client ID. Sus identificadores quedan separados de los de TMDB.
- Kitsu: anime de temporada, episodios y respaldo del catálogo. Su API pública no necesita clave. Si una fuente falla, se prueba la otra y finalmente se muestra anime de TMDB con un aviso visible.
- TheTVDB: información adicional de series enlazadas mediante el ID externo verificado por TMDB.
- `data/catalog.json`: instantánea real de 21 títulos obtenida de TMDB el 19 de octubre de 2026, con fecha y procedencia. Sirve para los destacados iniciales; las búsquedas y tendencias consultan las APIs.

Los pósteres y fotogramas proceden de los proveedores. No se incluyen imágenes generadas por IA. Las puntuaciones de los catálogos y las calificaciones personales se muestran por separado. Los datos no disponibles se indican como tales.

## Archivo y perfil

La biblioteca, favoritos, Tops, colecciones, recuerdos y estadísticas empiezan vacíos. El perfil permite nombre, alias, biografía, ubicación, color, foto, banner, fondo y hasta cuatro historias favoritas elegidas por categoría en un catálogo visual con búsqueda y paginación. Las fotografías se optimizan en el dispositivo. Se conservan en el archivo privado, con exportación/importación JSON validada. Las fichas permiten marcar Por ver o Terminada, calificar, añadir al Top 10 o a colecciones, escribir recuerdos y compartir enlaces. Las notas y reseñas públicas se muestran en la ficha del título; publicar es una decisión explícita y el archivo personal sigue separado.

El acceso admite correo y contraseña, registro, confirmación, recuperación y Google OAuth mediante Supabase. El proveedor Google y las redirecciones de producción están configurados en el panel de Supabase; el secreto OAuth nunca se incluye en el cliente. En modo invitado se guarda en este navegador; al iniciar sesión se carga un archivo separado por cuenta. La versión local anterior permanece intacta y puede importarse explícitamente.

Supabase guarda una instantánea JSONB por usuario en `user_archives`, con RLS forzado y políticas de propietario para las cuatro operaciones. La migración está en `supabase/migrations/001_private_archive.sql`. Las imágenes pequeñas se almacenan dentro del archivo. La copia local está sujeta a la cuota del navegador y la aplicación informa de errores de guardado. La sincronización usa última escritura, sin conciliación de ediciones simultáneas.

Las reseñas usan la tabla independiente `title_reviews` con RLS: lectura pública de la opinión publicada y escritura limitada a su autor. Las migraciones están en `002_public_reviews.sql` y `003_rating_only_reviews.sql`. Configuración permite Cine nocturno, Bosque animado y K-drama; el movimiento respeta la preferencia de reducción de animaciones.

## Cloudflare

Worker: `afterscene`, cuenta `e3dde56eb9a7a627f9654809220fc0af`.
URL: https://afterscene.el-ulicesss.workers.dev

El repositorio `ulices67/afterscene`, rama `main`, construye con `npm run build` y publica con `npm run deploy`. Este último usa `dist/server/wrangler.json`, generado por Vite. `keep_vars` conserva las variables del panel. TMDB y TheTVDB son secretos del servidor; `MAL_CLIENT_ID` también se configura en el panel. Supabase utiliza únicamente URL y clave publicable.

En Supabase, el origen de producción y las redirecciones de confirmación y recuperación apuntan al Worker. La prueba transaccional `supabase/tests/isolation_transaction.sql` verifica aislamiento entre dos identidades y revierte todos los datos de prueba.

## Recursos y límites

`docs/ASSETS.md` documenta las fuentes. `app/reference.css` contiene los ajustes visuales. El SVG de diseño se puede importar en Figma; no equivale a un archivo remoto con Auto Layout.

La aplicación enlaza tráileres y disponibilidad legal; no distribuye películas comerciales. El reproductor local admite archivos compatibles del usuario y subtítulos VTT. YouTube puede restringir vídeos por región o permisos. Las plantillas profesionales de confirmación y recuperación están en `supabase/email/`; para activarlas y enviar desde la dirección elegida hace falta SMTP personalizado con una contraseña de aplicación, nunca la contraseña normal del correo. Hasta entonces Supabase usa su servicio predeterminado y sus límites de entrega.
