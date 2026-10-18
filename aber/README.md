# ABER — Propuesta de comunicación institucional

Presentación web en un único `index.html` (HTML, CSS y JavaScript integrados).
No usa librerías ni servicios externos; el logo de ABER está embebido en el archivo.

## Estructura

```
index.html        presentación completa
assets/img/       imágenes reales optimizadas (publicaciones, salones, fotos)
assets/fonts/     Archivo, Source Serif 4, IBM Plex Mono, Cormorant Garamond (OFL)
robots.txt        bloquea la indexación
.nojekyll         evita el procesamiento de GitHub Pages
```

## Publicar en GitHub Pages

1. Subir el contenido de esta carpeta a la raíz del repositorio (o a `/docs`).
2. Settings → Pages → Deploy from a branch → elegir rama y carpeta.

Todas las rutas son relativas, así que funciona también dentro de una subcarpeta
(`usuario.github.io/repositorio/`). Para verla localmente:
`python3 -m http.server` dentro de esta carpeta.

## No indexación

`<meta name="robots" content="noindex, nofollow…">` en `index.html` y `robots.txt` con `Disallow: /`.
No indexar no es lo mismo que privado: cualquiera con el enlace puede abrirla.

## Navegación

Menú superior, botones ← → y flechas del teclado. Cada sección tiene su dirección:
`#portada`, `#identidad`, `#rrss`, `#web`, `#salon`.

## Qué editar (dentro de `index.html`, bloque `<script>`)

| Qué | Dónde |
| --- | --- |
| Datos de ABER (sede, correo, Instagram) | constante `G` |
| Datos de Salón Lozano | constante `S` |
| Beneficios | constante `BENEFICIOS` |
| Publicaciones de Instagram y categorías | `CATS` y `POSTS` |
| Noticias de ejemplo de la web | `NEWS` |
| Farmacias de ejemplo del mapa | `FARMS` |
| Colores y tipografías | bloque `<style>`, `:root` |

Para cambiar una imagen, reemplazar el archivo en `assets/img/` manteniendo el mismo nombre.

## Pendientes de confirmar

Marcados en pantalla como "A confirmar": requisitos de afiliación, integrantes de la
Comisión Directiva, teléfono de ABER y capacidad de cada salón.
