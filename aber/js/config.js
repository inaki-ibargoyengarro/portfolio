/* ==========================================================================
   CONFIGURACIÓN INSTITUCIONAL
   --------------------------------------------------------------------------
   Este archivo concentra los datos reales o a confirmar. Todo lo que figura
   como `null` se muestra en la presentación como "A confirmar".
   Los datos de demostración viven aparte, en js/data/demo.js.
   ========================================================================== */
window.ABER = window.ABER || {};

ABER.config = {
  /* Logo oficial: se carga desde esta URL. Reemplazarla cambia el logo en
     toda la presentación sin tocar el código. */
  logoUrl:
    "assets/logos/logo-aber.svg",

  gremio: {
    sigla: "ABER",
    // Denominación tal como figura en el logo oficial.
    nombre: "Agremiación Bonaerense Empleados de Reunión Hipódromo de La Plata e Interior",
    dominio: "aber.org.ar",
    instagram: "aber.laplata", // usuario de ejemplo: reemplazar por el real
    eleccion: "10 de septiembre de 2026",
    asuncion: "Diciembre de 2026",
    sede: null, // dirección de la sede
    telefono: null,
    email: null,
    whatsapp: null, // formato internacional sin signos, ej: 5492210000000
    horario: null,
  },

  /* Capturas del Instagram actual de ABER.
     Copiar las imágenes en assets/actual/ con estos nombres (o editar la lista). */
  capturasActuales: [
    "assets/actual/ig-actual-1.png",
    "assets/actual/ig-actual-2.png",
    "assets/actual/ig-actual-3.png",
  ],

  /* Salón Lozano — datos públicos verificados en su perfil de Instagram
     (@salonlozano) y en la guía de beneficios del Colegio de la Abogacía. */
  salon: {
    nombre: "Salón Lozano",
    direccion: "Calle 11 Nº 676",
    ciudad: "La Plata",
    telefono: "(0221) 423-7175",
    celular: "221 201-8699",
    whatsapp: "5492212018699",
    instagram: "salonlozano",
    sitio: "salonlozano.com.ar",
    espacios: ["Salón Colonial", "Salón Primavera"],
    presupuestos: "Con entrevista previa",
    // Ubicación aproximada (calle 11 entre 45 y 46). Ajustar con el punto exacto.
    coords: [-34.9158, -57.9614],
    capacidades: { colonial: null, primavera: null },
  },

  farmacias: {
    fuente: "Colegio de Farmacéuticos de la Provincia de Buenos Aires — Distrito La Plata",
    horarioTurno: "De 8:30 a 8:30 del día siguiente",
    zonas: ["Centro", "Zona Norte", "Los Hornos"],
  },
};
