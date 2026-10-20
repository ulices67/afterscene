# AFTERSCENE para Windows

La aplicación de escritorio abre la versión oficial de AFTERSCENE en una ventana aislada. Comparte la cuenta y el archivo personal con la versión web; necesita conexión a internet.

## Compilar el instalador

Desde `desktop/`, ejecuta `npm ci`. Después, desde la raíz del proyecto, ejecuta `./desktop/scripts/build-installer.ps1` en PowerShell. El asistente NSIS, con icono y arte propios, aparece en `release/AFTERSCENE-Setup.exe`.

El script descarga una distribución verificada de Electron, genera una copia local para evitar el bloqueo de renombrado observado en Windows y empaqueta la aplicación. El instalador actual no incluye firma de código: para una distribución a gran escala, firma el ejecutable con un certificado de confianza antes de publicar.

La interfaz de la página `/descargar` utiliza imágenes promocionales reales ya presentes en el catálogo del proyecto. El icono y los gráficos del instalador se generan mediante `desktop/scripts/generate-artwork.mjs` a partir de geometría SVG y una imagen real del catálogo.
