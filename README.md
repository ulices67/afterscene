# AFTERSCENE

Aplicación cinematográfica responsive en español. La interfaz sigue las capturas Liner y AFTERSCENE aportadas: negro neutro, controles blancos y grises, marca espaciada, navegación lateral, hero inmersivo y pósteres compactos.

## Iniciar

Requiere Node.js 22.13 o superior.

```sh
npm ci
npm run dev
```

Abre la dirección indicada por el servidor (normalmente http://127.0.0.1:5173).

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/archive.test.mjs
npm run build
npm start
```

React 19 + TypeScript; APIs y App Router compatibles con Next.js mediante Vinext para el despliegue en Sites. Tailwind CSS, Radix, Lucide, Motion y GSAP. La reproducción de archivos locales utiliza controles HTML5 nativos.

## Funciona sin credenciales

- Inicio, Explorar, Películas, Series, Anime, K-dramas, ficha de título, Biblioteca, Favoritos, Tops, Recuerdos, Perfil, Configuración y acceso a cuentas.
- Selección editorial local de 21 títulos, con imágenes incluidas y búsqueda por título, títulos originales, director, reparto y género.
- Filtros combinados, ordenación y carga de más resultados.
- Favorito, estado de visualización y nota personal independientes.
- Biblioteca en cuadrícula/lista, colecciones editables y Top 10 con arrastre o botones de subir/bajar.
- Diario con creación, edición, eliminación, fecha, emoción, acompañantes, nota y fotografías optimizadas; vistas archivo y cronología.
- Perfil editable y selección de cuatro historias.
- Exportación/importación JSON validada. La importación reemplaza el archivo actual.
- Tráileres de YouTube sin autoplay y enlaces a disponibilidad legal en TMDB / JustWatch.
- Reproductor de videos propios MP4/WebM compatibles, subtítulos VTT, controles de volumen, velocidad y pantalla completa del navegador; reanudación al seleccionar el mismo archivo.
- Movimiento reducido y navegación inferior en móvil.

La biblioteca inicial contiene algunos títulos de ejemplo, editables. El diario comienza vacío. Los datos se conservan en el navegador; no equivalen a una copia de seguridad. El proyecto no distribuye películas comerciales completas.

## Activar TMDB

Copia `.env.example` a `.env.local` y configura `TMDB_READ_ACCESS_TOKEN` solo en el servidor. En Sites, configura la variable mediante el gestor de secretos del sitio. Reinicia la vista local después de cambiar variables.

La ruta `/api/catalog` valida consultas y consulta TMDB desde el servidor. Con la clave activa, búsqueda y descubrimiento usan datos de la API, las fichas se actualizan y se habilita la consulta y seguimiento de episodios. Si el servicio falla se conserva la selección local. Los filtros de la interfaz se aplican a los resultados cargados, y se pueden solicitar más páginas.

Sin clave, la selección es editorial: no representa tendencias ni disponibilidad actualizadas en tiempo real. Las puntuaciones y metadatos incluidos son una instantánea de referencia.

## Activar Supabase

1. Crea un proyecto de Supabase y ejecuta `supabase/migrations/001_private_archive.sql`.
2. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Solo se usan la URL y clave publicable; nunca una clave administrativa.
3. Activa correo/contraseña y la confirmación de correo. Configura el origen del sitio como Site URL y sus URLs de redirección permitidas.
4. Opcionalmente configura los proveedores Google y Apple en Supabase antes de usar sus botones.
5. Ejecuta las comprobaciones SQL en `supabase/tests/archive_rls.sql` y una prueba funcional con dos cuentas reales, comprobando que ninguna pueda leer ni sobrescribir a la otra.

La primera edición guarda una instantánea JSONB por usuario en `user_archives`, de forma atómica, con RLS para las cuatro operaciones. Incluye biblioteca, colecciones, Tops, diario, fotografías y perfil. No crea tablas relacionales separadas para cada sección. Las fotografías pequeñas viajan dentro del archivo; para grandes volúmenes conviene migrarlas a un bucket privado de Storage con sus propias políticas.

La app separa las copias locales por usuario, evita guardar antes de cargar la cuenta y muestra fallos de sincronización. Esta edición usa sincronización de última escritura, sin resolución de edición simultánea en varios dispositivos. El archivo local anónimo no se copia automáticamente a una cuenta: puedes exportarlo e importarlo después de iniciar sesión.

Sin configurar Supabase, el acceso a cuentas está desactivado y se ofrece continuar en este dispositivo. La publicación de Sites es privada para su propietario.

## Diseño y recursos

- `docs/DESIGN_SYSTEM.md`: tokens y componentes; `docs/AFTERSCENE-Design-System.svg`: lámina vectorial importable en Figma.
- `app/reference.css`: ajuste final a las imágenes solicitadas.
- `docs/ASSETS.md`: imágenes, créditos y procedencia.
- `docs/IMAGE_PROMPTS.md`: prompts y rutas de los fondos producidos con la herramienta integrada de imágenes.

No se creó un archivo remoto de Figma. El SVG se puede importar, pero sus grupos todavía deben convertirse en componentes, variables y Auto Layout dentro de Figma.

## Verificación

Se comprobaron compilación TypeScript, siete pruebas automáticas y construcción de producción. En navegador se revisaron Inicio, filtros combinados, ficha, persistencia de favorito tras recarga, creación/edición/persistencia del diario, filtro de favoritos, ordenación de Tops y los puntos de adaptación de escritorio y móvil.

Las conexiones reales con TMDB, Supabase y sus políticas entre cuentas requieren las credenciales del propietario y no se validaron contra servicios de producción. YouTube puede bloquear un tráiler por permisos, región o red. No se proporcionó un video propio para validar codecs concretos.
