# ABER — Comunicación institucional (presentación)

Presentación web navegable con: identidad, Instagram, prototipo de aber.org.ar, farmacias de turno, herramientas digitales y Salón Lozano.
Sitio estático, sin build ni dependencias externas en tiempo de ejecución (Leaflet y tipografías están incluidos en el proyecto).

## Ver localmente

```bash
cd site            # esta carpeta
python3 -m http.server 8000
# abrir http://localhost:8000
```

También funciona abriendo `index.html` directamente en el navegador.
Requiere conexión a internet sólo para los mosaicos del mapa (OpenStreetMap). Logos e imágenes están incluidos en `assets/`.

## Publicar en GitHub Pages

1. Subir el contenido de esta carpeta a un repositorio (en la raíz o en `/docs`).
2. Settings → Pages → Deploy from a branch → elegir rama y carpeta.
3. El archivo `.nojekyll` ya está incluido.

## No indexación

- `<meta name="robots" content="noindex, nofollow…">` en `index.html`.
- `robots.txt` con `Disallow: /`.
- Encabezado `X-Robots-Tag`: GitHub Pages **no permite** encabezados propios. Se incluyen configuraciones listas para hostings que sí lo permiten: `_headers` (Netlify / Cloudflare Pages), `vercel.json` (Vercel) y `.htaccess` (Apache).

No indexar no es lo mismo que privado: cualquiera con el enlace puede abrir la presentación.

## Navegación

- Menú superior, botones ← → y flechas del teclado (← → para cambiar de sección; Inicio vuelve a la portada).
- Cada sección tiene su dirección: `#identidad`, `#instagram`, `#web`, `#farmacias`, `#herramientas`, `#salon`.
- Dentro de los prototipos, la barra del navegador tiene atrás/adelante funcionales.

## Qué editar

| Qué | Dónde |
| --- | --- |
| Logo ABER (SVG) | `assets/logos/logo-aber.svg` · ruta en `js/config.js` → `logoUrl` |
| Logo Salón Lozano (SVG) | `assets/logos/logo-salon-lozano.svg` · versión embebida en `js/logo-salon.js` (toma el color del texto) |
| Datos institucionales (sede, teléfonos, WhatsApp, horarios, usuario de Instagram) | `js/config.js` → `gremio`. Lo que está en `null` se muestra como “A confirmar”. |
| Capturas del Instagram actual | `assets/actual/ig-actual-1.png` … `ig-actual-3.png` (lista en `capturasActuales`) |
| Publicaciones de Instagram de ABER | `assets/ig/IG-1.png` … `IG-9.png` (orden de la grilla) · textos en `js/data/contenido-ig.js` |
| Publicaciones de Instagram de Salón Lozano | `assets/salon/post-1.png` … `post-4.png` · `js/salon.js` |
| Fotos del sitio de Salón Lozano | `assets/salon/web-lozano-1.png` (portada) , `web-colonial.png` (Salón Colonial) y `web-primavera.png` (Salón Primavera) · `js/media.js` → `ABER.fotos` |
| Otras fotografías reales | Copiar en `assets/` y completar las rutas en `js/media.js` → `ABER.fotos`. Sin foto, se muestra una imagen ilustrativa identificada como tal. |
| Datos de Salón Lozano (capacidades, coordenadas exactas) | `js/config.js` → `salon` |
| Contenido de demostración (noticias, beneficios, documentos, FAQ, farmacias, calendario, escalas) | `js/data/demo.js` |
| Publicaciones e historias de Instagram | `js/data/contenido-ig.js` |
| Colores y tipografías | `css/base.css` → `:root` |

## Contenido de demostración

Todo el contenido de `js/data/` es de ejemplo y está marcado así en pantalla. En particular:

- **Farmacias:** nombres, teléfonos y rotación son ficticios. No se simula actualización en tiempo real. La fuente prevista es el Colegio de Farmacéuticos (Distrito La Plata), que publica turnos de 8:30 a 8:30 por zonas Centro, Zona Norte y Los Hornos.
- **Escalas salariales y calculadora:** valores y fórmula ficticios.
- **Calendario hípico:** programación de ejemplo.
- **Formularios** (turnos, boletín, bolsa de trabajo): no envían datos. Las descargas generan un archivo de demostración.
- **Salón Lozano:** dirección, teléfonos, Instagram y espacios son datos públicos del salón; el formulario arma el mensaje y abre WhatsApp al número del salón.

## Estructura

```
index.html            presentación (secciones 00–06)
css/base.css          tokens, presentación, identidad, Instagram, visores
css/web.css           prototipo aber.org.ar (adaptativo por contenedor)
css/salon.css         prototipo Salón Lozano
js/config.js          datos institucionales y configuración
js/data/demo.js       datos de demostración del sitio
js/data/contenido-ig.js  publicaciones y destacadas de ejemplo
js/media.js           imágenes ilustrativas y reemplazo por fotos reales
js/icons.js           iconografía lineal
js/posts.js           plantillas de publicaciones 4:5
js/instagram.js       perfil, visor de publicaciones e historias
js/aber-site.js       prototipo aber.org.ar
js/salon.js           prototipo Salón Lozano
js/presentacion.js    navegación de la presentación
vendor/leaflet/       mapa (Leaflet 1.9.4)
assets/fonts/         Archivo, Source Serif 4, IBM Plex Mono, Cormorant Garamond (licencia OFL)
```
