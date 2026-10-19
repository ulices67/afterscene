# AFTERSCENE — Design System

Primera edición · 18 de octubre de 2026

La interfaz reproduce la línea de las referencias Liner y AFTERSCENE: negros neutros, grises discretos y controles blancos.

## Fundamentos

| Token | Valor | Uso |
|---|---|---|
| Background | `#040607` | Lienzo |
| Sidebar | `#030506` | Navegación |
| Surface | `#111416` | Paneles |
| Elevated | `#1B1E20` | Controles |
| Text | `#F5F5F4` | Lectura principal |
| Muted | `#969AA1` | Metadatos |
| Accent | `#F5F5F4` | Indicadores y archivo personal |
| Border | `#FFFFFF10` | Separación |

- UI: Inter, pesos 400–650. Editorial: Instrument Serif, regular e italic.
- Espaciado: 4, 8, 12, 16, 24, 32, 48.
- Radios: 6–8 para controles, 8 para pósteres, 10–12 para héroes y modales.
- Póster 2:3, fotograma 16:9, fotografía de recuerdo 4:3.
- Navegación de escritorio 224 px; compacta 76 px; móvil cinco destinos inferiores.
- Cuadrícula de seis columnas, cuatro en tablet y dos en móvil. Carruseles horizontales con desplazamiento nativo.

## Componentes y estados

Button: primary / secondary / icon / disabled / focus-visible. Poster: default / hover / favorite / in-library. LibraryItem: planned / watching / completed / paused / dropped; favorito y puntuación son independientes del estado. Dialog: centrado, foco contenido, Escape, restauración de foco y fondo inerte mediante Radix. MemoryCard: archivo / cronología. Ranking: arrastre / botones de subir y bajar.

## Movimiento

Motion controla presión, hover, modales y el póster compartido entre catálogo y ficha. GSAP revela la cabecera de cada sección. No controlan las mismas propiedades del mismo elemento. Los cambios del hero se detienen con el cursor, el foco o la pestaña oculta. La rotación automática es opcional y está desactivada inicialmente.

Se respeta `prefers-reduced-motion` y el ajuste propio de la aplicación. Los efectos no son necesarios para leer ni accionar los controles.

## Figma

`AFTERSCENE-Design-System.svg` es una lámina vectorial importable: paleta, tipografía, componentes y escalas. No se ha creado un archivo remoto de Figma. Para continuar el trabajo en Figma, importa el SVG en un documento llamado **AFTERSCENE — Design System**, instala Inter e Instrument Serif y convierte los grupos en componentes, variables y Auto Layout. El SVG no equivale a un archivo `.fig` con esas propiedades nativas.

Las doce pantallas funcionales se revisan en la aplicación: Inicio, Explorar, Películas, Series, Anime, K-dramas, Detalles, Biblioteca, Tops, Recuerdos, Perfil y Configuración.
