/* =====================================================================
   GHOSTING DETECTOR™ · Muestra analizada en el TP 2
   Números fijos de la muestra cerrada el 25 de noviembre de 2026
   (23 respuestas; 18 en el análisis). Se calcularon con la misma función
   que usa la web en vivo (get_public_stats) y coinciden con el TP escrito.
   No se actualiza: los resultados en vivo están en la sección siguiente.
   ===================================================================== */
window.GD_SAMPLE = {
 "cutoff": "2026-11-25",
 "stats": {
  "n_other": 2,
  "by_depth": [
   {
    "n": 4,
    "depth": "digital",
    "ghosting": 3,
    "explicita": 1,
    "suppressed": false
   },
   {
    "n": 10,
    "depth": "citas_1_5",
    "ghosting": 4,
    "explicita": 6,
    "suppressed": false
   },
   {
    "n": 4,
    "depth": "citas_mas_5",
    "ghosting": 3,
    "explicita": 1,
    "suppressed": false
   }
  ],
  "crosstab": [
   {
    "level": "baja",
    "suppressed": true
   },
   {
    "n": 14,
    "level": "media",
    "ghosting": 6,
    "explicita": 8,
    "suppressed": false
   },
   {
    "n": 4,
    "level": "alta",
    "ghosting": 4,
    "explicita": 0,
    "suppressed": false
   }
  ],
  "min_cell": 1,
  "n_binary": 18,
  "strategy": {
   "ghosting": 10,
   "explicita": 8
  },
  "discomfort": {
   "alta": 4,
   "baja": 0,
   "media": 16
  },
  "n_eligible": 20,
  "sufficient": true,
  "n_screened_out": 3,
  "crosstab_by_depth": [
   {
    "depth": "digital",
    "level": "baja",
    "suppressed": true
   },
   {
    "n": 3,
    "depth": "digital",
    "level": "media",
    "ghosting": 2,
    "explicita": 1,
    "suppressed": false
   },
   {
    "n": 1,
    "depth": "digital",
    "level": "alta",
    "ghosting": 1,
    "explicita": 0,
    "suppressed": false
   },
   {
    "depth": "citas_1_5",
    "level": "baja",
    "suppressed": true
   },
   {
    "n": 9,
    "depth": "citas_1_5",
    "level": "media",
    "ghosting": 3,
    "explicita": 6,
    "suppressed": false
   },
   {
    "n": 1,
    "depth": "citas_1_5",
    "level": "alta",
    "ghosting": 1,
    "explicita": 0,
    "suppressed": false
   },
   {
    "depth": "citas_mas_5",
    "level": "baja",
    "suppressed": true
   },
   {
    "n": 2,
    "depth": "citas_mas_5",
    "level": "media",
    "ghosting": 1,
    "explicita": 1,
    "suppressed": false
   },
   {
    "n": 2,
    "depth": "citas_mas_5",
    "level": "alta",
    "ghosting": 2,
    "explicita": 0,
    "suppressed": false
   }
  ]
 },
 "captions": {
  "B": "<b>Gráfico 1.</b> Estrategia de finalización del último vínculo (n = 18).",
  "C": "<b>Gráfico 2.</b> Nivel de incomodidad ante la confrontación (n = 20 respuestas válidas).",
  "DE": "<b>Tabla 1 y Gráfico 3.</b> Estrategia de finalización según nivel de incomodidad ante la confrontación. Frecuencias absolutas y porcentajes por fila (n = 18).",
  "F": "<b>Gráfico 4.</b> Estrategia de finalización según profundidad del vínculo previo. Porcentajes por fila (barras apiladas al 100%, n = 18)."
 }
};
