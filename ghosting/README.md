# Ghosting Detector™

Producto comunicacional de **Metodología Cuantitativa** (FPyCS, UNLP) · Iñaki Ibargoyen Garro.

```
ghosting/
├── index.html                 ← Portada: elegir experiencia
├── tp1/index.html             ← Experiencia 01 · ¿Me ghostearon? (TP1 original)
├── tp2/index.html             ← Experiencia 02 · ¿Por qué me ghostearon? (encuesta + resultados)
├── encuesta/index.html        ← Solo la encuesta, para compartir con quienes van a responder
├── admin/index.html           ← Panel de datos (acceso restringido)
├── assets/
│   ├── css/  gd-base.css (diseño del TP1) · home.css · tp2.css · encuesta.css · admin.css
│   ├── js/   gd-base.js · config.js · api.js · stats.js · tp2.js · admin.js
│   └── (las imágenes, GIF y MP3 que ya están en el repo NO se tocan)
├── supabase/schema.sql        ← Base de datos, seguridad y funciones
└── data/plantilla_importacion.csv
```

Todas las páginas tienen `noindex, nofollow`. No hay dependencias ni build: es HTML, CSS y JS puros.

---

## 1. Qué está listo y qué falta

| Parte | Estado |
|---|---|
| Portada, TP1 reubicado y TP2 | Listos. Funcionan apenas se publican. |
| Cuestionario y resultados | Listos, pero **no guardan ni muestran datos** hasta conectar Supabase (pasos 2 y 3). Mientras tanto la web lo avisa en pantalla y no muestra datos de ejemplo. |
| Panel admin | Listo. Necesita Supabase y un usuario administrador. |

Para conectar solo hace falta: crear el proyecto en Supabase, ejecutar `schema.sql`, crear tu usuario admin y pegar **dos valores** en `assets/js/config.js`.

---

## 2. Configurar Supabase (una sola vez, ~10 minutos)

1. Entrá a <https://supabase.com> → **New project**. Elegí una región cercana (São Paulo) y guardá la contraseña de la base en un lugar seguro.
2. **SQL Editor → New query** → pegá el contenido completo de `supabase/schema.sql` → **Run**.
   Tiene que terminar sin errores. Se puede volver a ejecutar sin perder datos.
3. **Crear tu usuario administrador:** *Authentication → Users → Add user → Create new user*. Usá tu mail y una contraseña fuerte, y marcá **Auto Confirm User**.
4. **Darle permisos de admin:** en el SQL Editor ejecutá (con tu mail):
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'TU_MAIL@ejemplo.com'
   on conflict (user_id) do nothing;
   ```
5. **Cerrar el registro público:** *Authentication → Sign In / Providers* → desactivá **Allow new users to sign up**.
   (Aunque alguien se registrara, no vería datos porque no está en `admins`; desactivarlo es una capa más de seguridad.)
6. **Copiar las claves públicas:** *Project Settings → API Keys* (o *Data API*):
   - **Project URL** → `https://xxxx.supabase.co`
   - **Publishable key** (`sb_publishable_…`) o, en proyectos viejos, la **anon public** (`eyJ…`).
7. Abrí `assets/js/config.js` y completá:
   ```js
   SUPABASE_URL: 'https://xxxx.supabase.co',
   SUPABASE_KEY: 'sb_publishable_xxxxxxxxxxxxxxxx',
   ```
   ⚠️ **Nunca** pegues la *secret key* ni la *service_role*: saltean toda la seguridad y este archivo es público. Si lo hicieras por error, `api.js` la rechaza y no se conecta.

### Qué protege el esquema

- El público **no puede leer, editar ni borrar** la tabla de respuestas (RLS sin políticas para `anon`).
- La única forma de escribir es la función `submit_response`, que valida todo: rangos 1–5, categorías permitidas, consentimiento, coherencia (una respuesta elegible tiene que estar completa).
- **Duplicados:** cada envío lleva un identificador único; si el botón se toca dos veces o se reintenta tras un corte, no se duplica.
- **Spam:** campo trampa oculto, tiempo mínimo humano (12 s para un recorrido completo) y límite de 40 envíos por hora por red. La IP **no se guarda**: se usa un hash con sal secreta en una tabla privada, separada de las respuestas.
- **Resultados públicos:** solo vía `get_public_stats`, que devuelve agregados de respuestas **reales, válidas y elegibles**, y no publica grupos con menos de 5 casos ni gráficos con menos de 10 respuestas (configurable). Nota: al ser datos totalmente anónimos y sin otras variables, este umbral es una medida de prudencia, no de anonimización estricta.
- **Admins:** pueden leer, marcar como inválida/prueba, anotar e importar. **No** pueden modificar las respuestas en sí (solo `status`, `is_test`, `admin_note`) y solo pueden **borrar datos de prueba**.

---

## 3. Publicar en GitHub Pages

La web vive en el repositorio `inaki-ibargoyengarro/ghosting`, que se sirve en `inaki.ar/ghosting/`. Tu portfolio no se toca.

**Antes de subir:** dejá en el repo todo lo que ya existe dentro de `assets/` (las imágenes, el GIF y `Magical Transition.mp3`). El TP1 los usa desde `raw.githubusercontent.com/.../main/assets/...`, así que si se borran o se renombran, el TP1 pierde sus imágenes y su audio.

**Opción A · desde github.com (sin terminal)**
1. Abrí el repo `ghosting` → **Add file → Upload files**.
2. Arrastrá las carpetas `tp1`, `tp2`, `encuesta`, `admin`, `assets` (solo trae `css/` y `js/`, se suman a lo existente), `supabase`, `data` y los archivos `index.html` y `README.md`.
   El `index.html` nuevo **reemplaza** al de la raíz: el TP1 original ya está copiado en `tp1/index.html`.
3. **Commit changes.** En uno o dos minutos queda publicado.

**Opción B · con git**
```bash
git clone https://github.com/inaki-ibargoyengarro/ghosting.git
cd ghosting
# copiar acá el contenido de esta carpeta (sin borrar assets/ existentes)
git add index.html tp1 tp2 encuesta admin assets/css assets/js supabase data README.md
git commit -m "Ghosting Detector: portada, TP2 y panel de datos"
git push
```

**URLs finales**
- Portada: `https://inaki.ar/ghosting/`
- ¿Me ghostearon?: `https://inaki.ar/ghosting/tp1/`
- ¿Por qué me ghostearon?: `https://inaki.ar/ghosting/tp2/`
- **Solo la encuesta (para compartir):** `https://inaki.ar/ghosting/encuesta/`
- Panel: `https://inaki.ar/ghosting/admin/` (no está enlazado desde ningún lado)

**Probar sin ensuciar los datos reales:** abrí `https://inaki.ar/ghosting/tp2/?modo=prueba`. Aparece una franja amarilla y las respuestas se guardan como **prueba**: no entran en los resultados públicos ni en el análisis «Reales». Después se borran desde *Panel → Configuración → Borrar respuestas de prueba*.

> El parámetro de prueba es público. Si alguien lo usara, sus respuestas quedarían como prueba: fuera de la muestra, nunca al revés.

---

## 4. Cómo funciona el cuestionario

Flujo (9 preguntas + confirmación): **consentimiento → edad → centro urbano → redes/apps → X1–X4 (Likert 1–5) → Y → Z → revisión → enviar**.

Ya no se pregunta si la persona terminó un vínculo en los últimos 12 meses. La pregunta Y pide pensar en el último vínculo que la persona decidió terminar; quien nunca terminó uno elige «Otra situación» y queda fuera del análisis binario. Ajustá la unidad de análisis del TP escrito en consecuencia. Si ya habías ejecutado el SQL anterior, volvé a ejecutar `schema.sql`: actualiza la regla de la base sin borrar datos.

- Se avanza tocando una opción. Se puede volver atrás, editar desde la revisión, usar el teclado (A/B/C… y 1–5) y recargar la página sin perder el progreso.
- **Edad fuera de rango:** termina sin guardar nada.
- **Otro filtro en «no»:** muestra la pantalla de exclusión y, si la persona confirma, registra solo que hubo una participación no elegible (sin respuestas). Sirve para documentar la tasa de exclusión.
- **Y = «Otra situación»:** se guarda, pero queda fuera del análisis binario ruptura explícita / ghosting.
- La base calcula sola `x_total` (4–20) y `x_level` (baja 4–7, media 8–14, alta 15–20).
- No se muestra ningún diagnóstico. En la revisión se ve la suma de X con la aclaración de que es un dato para el análisis colectivo.

**Encuesta para compartir:** `inaki.ar/ghosting/encuesta/` muestra solo la encuesta, sin el recorrido del TP. Usa la misma base y las mismas validaciones, así que las respuestas de las dos páginas se suman en un solo conjunto. Al terminar, el botón «Ver resultados» lleva a `tp2/#resultados`. Al pegar el enlace en WhatsApp o en un mail aparece una vista previa con la imagen del proyecto. También funciona el modo prueba: `inaki.ar/ghosting/encuesta/?modo=prueba`.

Los resultados públicos se actualizan solos cada 30 segundos (`RESULTS_REFRESH_SECONDS` en `config.js`).

---

## 5. Procedimiento para el TP escrito (puntos 3 y 4)

1. **Definí la fecha de corte.** *Panel → Configuración →* «Fecha de corte oficial» → Guardar.
   La web puede seguir recibiendo respuestas: el análisis toma solo las anteriores al corte. Si querés cerrar la recolección, destildá «Recolección abierta».
2. **Revisá las respuestas.** *Panel → Respuestas →* «Solo con alertas». Marcá como inválidas las que correspondan (ej. pruebas hechas por vos sin `?modo=prueba`). Queda registrado el motivo.
3. **Configurá el filtro:** Datos = **Reales**, fecha de corte = la oficial, origen web (+ importadas, si corresponde). La línea «Muestra analítica: n = …» define exactamente qué se analiza.
4. **Descargá:**
   - **Descargar tabla (CSV)** → tabla de contingencia X × Y con frecuencias absolutas, % por fila, frecuencias esperadas, χ², gl, p, V de Cramér y chequeo de supuestos.
   - **Resumen para el TP (TXT)** → los mismos números redactados para copiar.
   - **Solo muestra analítica (CSV)** → microdatos anónimos para rehacer el contraste en Excel, SPSS, jamovi o R.
   - Para Excel en español, tildá «Formato Excel en español» antes de descargar (usa `;` y coma decimal).
5. **Gráfico de barras:** el panel muestra las barras apiladas al 100% de la muestra cerrada. Para el documento podés capturarlas o rehacerlas con la tabla.

**Cómo leer el contraste (lo que el panel calcula y lo que no):**
- **χ² de independencia de Pearson** sobre la tabla 3 × 2 (gl = 2). Validado contra SciPy.
- **Supuestos de Cochran:** ninguna frecuencia esperada < 1 y no más del 20% de las celdas < 5. Si no se cumplen, el panel lo dice y **no** da una conclusión: en el TP corresponde declarar que el contraste no es concluyente con esta muestra, y como opciones ampliar la muestra, agrupar categorías justificándolo o usar una prueba exacta.
- **Regla de decisión** (α = 0,05): si p < 0,05 y se cumplen los supuestos, se rechaza H0. El χ² indica **asociación**, no dirección ni causalidad. La dirección (si el ghosting crece de baja a alta) se lee en los % por fila.
- **Complementario:** Cochran–Armitage (tendencia lineal según el orden de X), que es lo que formula H1. Usalo solo si la cátedra lo admite.
- **Recaudos para el punto 4:** muestra por conveniencia (no representativa de la población); asociación no implica causalidad; índice de incomodidad exploratorio y no validado.

**Importar respuestas obtenidas por otros medios** (encuesta en papel, otro formulario): *Panel → Importar → Descargar plantilla CSV*. Columnas: `fecha, edad, residencia_urbana, usa_redes_apps, x1, x2, x3, x4, y, z, nota`. Se aceptan `si/no`, edades exactas o por grupo (`18_24`, `25_29`, `30_35`), `y` = `explicita | ghosting | otra`, `z` = `digital | citas_1_5 | citas_mas_5`. El panel valida cada fila, muestra los errores y solo importa las filas válidas, con el nombre del lote. También acepta el CSV exportado por el propio panel.

---

## 6. Diseño

- La portada y `tp2/` usan exactamente el sistema visual del TP1: `assets/css/gd-base.css` es una copia literal de sus estilos y `assets/js/gd-base.js` replica sus comportamientos (destello mágico, música, aparición al hacer scroll, menú mobile).
- El TP1 conserva su HTML original con sus estilos propios. Solo se agregó «← Portada» al menú y, al final, enlaces a la portada y a ¿Por qué me ghostearon?
- Los colores de los gráficos (azul = ruptura explícita, rosa con rayado = ghosting) se validaron para daltonismo; el ghosting lleva textura para no depender solo del color.
- Accesibilidad: navegación por teclado, foco visible, `prefers-reduced-motion`, tablas reales detrás de cada gráfico y tooltips con foco.
