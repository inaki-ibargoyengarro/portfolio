/* ==========================================================================
   DATOS DE DEMOSTRACIÓN
   --------------------------------------------------------------------------
   Todo el contenido de este archivo es de EJEMPLO. No corresponde a
   información institucional confirmada de ABER. Sirve para mostrar cómo se
   verían las piezas y herramientas con contenido real.
   Para reemplazarlo: editar estas listas o cargarlas desde una fuente real.
   ========================================================================== */
window.ABER = window.ABER || {};

(function () {
  /* Ubicación aproximada sobre la grilla platense a partir de calle (1–31)
     y calle (32–72). Sirve sólo para ubicar ejemplos en el mapa. */
  function grilla(c1, c2) {
    return [
      +(-34.9214 + (c1 - 13) * -0.00106 + (c2 - 52) * -0.00051).toFixed(5),
      +(-57.9545 + (c1 - 13) * -0.00063 + (c2 - 52) * 0.00129).toFixed(5),
    ];
  }

  ABER.demo = {
    /* ---------------------------------------------------------------- */
    noticias: [
      {
        id: "n1", tipo: "Noticias", fecha: "2026-10-09", foto: "tribuna",
        titulo: "Primera reunión de la Comisión Directiva electa con la administración del Hipódromo",
        bajada: "Se presentó la agenda de temas prioritarios para el período de transición y se acordó un cronograma de encuentros quincenales.",
        cuerpo: [
          "La Comisión Directiva electa mantuvo un primer encuentro de trabajo con la administración del Hipódromo de La Plata. En la reunión se repasaron los temas pendientes que afectan al personal de reunión y se definió un esquema de encuentros periódicos hasta la asunción formal.",
          "Entre los puntos abordados estuvieron la regularización de pagos, el estado de las instalaciones de trabajo y la actualización del padrón de afiliados.",
          "La Comisión informará a los afiliados los avances de cada encuentro a través de los canales oficiales.",
        ],
      },
      {
        id: "n2", tipo: "Comunicados", fecha: "2026-10-06", foto: "sede",
        titulo: "Comunicado sobre la actualización del padrón de afiliados",
        bajada: "Los afiliados pueden verificar y actualizar sus datos de contacto en la sede o por los canales digitales.",
        cuerpo: [
          "Se informa a los afiliados que se encuentra abierto el período de actualización de datos personales y de contacto.",
          "La actualización es necesaria para recibir información oficial, convocatorias y novedades sobre beneficios.",
        ],
      },
      {
        id: "n3", tipo: "Agenda", fecha: "2026-10-03", foto: "asamblea",
        titulo: "Convocatoria a reunión informativa abierta para afiliados",
        bajada: "Se presentarán los temas de la agenda gremial y se recibirán consultas.",
        cuerpo: ["Reunión abierta para afiliados. Lugar y horario a confirmar en la convocatoria oficial."],
      },
      {
        id: "n4", tipo: "Prensa", fecha: "2026-09-29", foto: "microfono",
        titulo: "Entrevista radial: la situación del personal de reunión del Hipódromo",
        bajada: "Integrantes de la conducción electa explicaron los ejes de trabajo de la nueva gestión.",
        cuerpo: ["Resumen de la entrevista y enlace al audio completo."],
      },
      {
        id: "n5", tipo: "Opiniones", fecha: "2026-09-24", foto: "pista",
        titulo: "El trabajo hípico necesita reglas claras y previsibles",
        bajada: "Columna de opinión de la Secretaría General.",
        cuerpo: ["Texto de la columna de opinión."],
      },
      {
        id: "n6", tipo: "Actividades", fecha: "2026-09-18", foto: "jornada",
        titulo: "Jornada de controles de salud para afiliados y familias",
        bajada: "Actividad realizada en la sede con la participación de profesionales de prestadores adheridos.",
        cuerpo: ["Crónica de la jornada."],
      },
    ],

    /* ---------------------------------------------------------------- */
    beneficios: [
      { id: "b1", nombre: "Co-seguro de medicamentos", cat: "Co-seguro", zona: "Todas", desc: "Cobertura complementaria sobre medicamentos en farmacias adheridas.", req: ["Afiliación activa", "Carnet de afiliado", "Receta médica"], destacado: true },
      { id: "b2", nombre: "Óptica — descuento en anteojos recetados", cat: "Salud", zona: "Centro", desc: "Descuento sobre cristales y armazones en ópticas adheridas.", req: ["Afiliación activa", "Receta oftalmológica"] },
      { id: "b3", nombre: "Consultorio odontológico", cat: "Profesionales", zona: "Centro", desc: "Atención con prestadores adheridos y aranceles preferenciales.", req: ["Afiliación activa", "Turno previo"] },
      { id: "b4", nombre: "Asesoramiento legal laboral", cat: "Prestaciones", zona: "Sede", desc: "Consultas sobre relación laboral, liquidaciones y reclamos.", req: ["Afiliación activa", "Solicitud de turno"] },
      { id: "b5", nombre: "Asesoramiento contable e impositivo", cat: "Prestaciones", zona: "Sede", desc: "Orientación sobre monotributo, ganancias y declaraciones juradas.", req: ["Afiliación activa", "Solicitud de turno"] },
      { id: "b6", nombre: "Útiles escolares — kit anual", cat: "Familia", zona: "Sede", desc: "Entrega anual de útiles para hijos e hijas en edad escolar.", req: ["Afiliación activa", "Certificado de alumno regular"] },
      { id: "b7", nombre: "Gimnasio — cuota preferencial", cat: "Convenios", zona: "Centro", desc: "Descuento en la cuota mensual para afiliados y grupo familiar.", req: ["Carnet de afiliado"] },
      { id: "b8", nombre: "Turismo — hotelería en la costa", cat: "Convenios", zona: "Provincia", desc: "Tarifas preferenciales en temporada baja y media.", req: ["Afiliación activa", "Reserva con anticipación"] },
      { id: "b9", nombre: "Salón Lozano — eventos familiares", cat: "Convenios", zona: "Centro", desc: "Condiciones especiales para eventos de afiliados.", req: ["Afiliación activa", "Entrevista previa"] },
      { id: "b10", nombre: "Kinesiología", cat: "Profesionales", zona: "Zona Norte", desc: "Sesiones con prestadores adheridos.", req: ["Afiliación activa", "Orden médica"] },
      { id: "b11", nombre: "Subsidio por nacimiento", cat: "Familia", zona: "Sede", desc: "Ayuda económica por nacimiento o adopción.", req: ["Afiliación activa", "Partida de nacimiento", "Solicitud dentro de los 60 días"] },
      { id: "b12", nombre: "Librería — descuento en compras", cat: "Convenios", zona: "Los Hornos", desc: "Descuento en artículos de librería y papelería.", req: ["Carnet de afiliado"] },
    ],

    /* ---------------------------------------------------------------- */
    documentos: [
      { id: "d1", titulo: "Estatuto social", tipo: "Estatutos", anio: 2026, paginas: 24, peso: "1,2 MB" },
      { id: "d2", titulo: "Reglamento de beneficios y co-seguro", tipo: "Documentación gremial", anio: 2026, paginas: 8, peso: "420 KB" },
      { id: "d3", titulo: "Formulario de afiliación", tipo: "Formularios", anio: 2026, paginas: 2, peso: "180 KB" },
      { id: "d4", titulo: "Formulario de solicitud de subsidio por nacimiento", tipo: "Formularios", anio: 2026, paginas: 1, peso: "95 KB" },
      { id: "d5", titulo: "Acta acuerdo salarial — segundo semestre", tipo: "Acuerdos", anio: 2026, paginas: 4, peso: "610 KB" },
      { id: "d6", titulo: "Acta acuerdo salarial — primer semestre", tipo: "Acuerdos", anio: 2026, paginas: 4, peso: "580 KB" },
      { id: "d7", titulo: "Escalas salariales vigentes", tipo: "Acuerdos", anio: 2026, paginas: 3, peso: "240 KB" },
      { id: "d8", titulo: "Boletín institucional Nº 1", tipo: "Boletines", anio: 2026, paginas: 6, peso: "2,4 MB" },
      { id: "d9", titulo: "Memoria y balance", tipo: "Documentación gremial", anio: 2025, paginas: 18, peso: "3,1 MB" },
      { id: "d10", titulo: "Acta de proclamación de autoridades electas", tipo: "Documentación gremial", anio: 2026, paginas: 2, peso: "310 KB" },
      { id: "d11", titulo: "Formulario de actualización de datos", tipo: "Formularios", anio: 2026, paginas: 1, peso: "88 KB" },
      { id: "d12", titulo: "Acta acuerdo salarial — segundo semestre", tipo: "Acuerdos", anio: 2025, paginas: 4, peso: "560 KB" },
    ],

    /* ---------------------------------------------------------------- */
    faq: [
      { cat: "Afiliación", q: "¿Quiénes pueden afiliarse?", a: "El personal comprendido en el ámbito de representación del gremio, según lo establecido en el estatuto." },
      { cat: "Afiliación", q: "¿Qué documentación necesito para afiliarme?", a: "DNI, último recibo de haberes y el formulario de afiliación completo y firmado." },
      { cat: "Afiliación", q: "¿Cuánto tarda el alta?", a: "Una vez presentada la documentación completa, el alta se informa por los canales de contacto declarados." },
      { cat: "Co-seguro", q: "¿Cómo uso el co-seguro en la farmacia?", a: "Presentá tu carnet de afiliado y la receta en una farmacia adherida. El listado está en la sección Farmacias." },
      { cat: "Co-seguro", q: "¿Una farmacia de turno está siempre adherida al co-seguro?", a: "No. Que una farmacia esté de turno no implica que esté adherida. El buscador de farmacias distingue ambas condiciones." },
      { cat: "Beneficios", q: "¿Mi grupo familiar accede a los beneficios?", a: "Depende de cada beneficio. Los requisitos figuran en la ficha de cada uno." },
      { cat: "Trámites", q: "¿Cómo pido un turno para asesoramiento legal?", a: "Desde Trámites y consultas → Consultas y turnos, eligiendo el área y el horario disponible." },
      { cat: "Trámites", q: "¿Dónde descargo los formularios?", a: "En Trámites y consultas, sección Formularios." },
      { cat: "Previsional", q: "¿El gremio me orienta sobre mi jubilación?", a: "Sí. Podés solicitar una entrevista de orientación previsional. La orientación no reemplaza el trámite ante ANSES." },
    ],

    /* ---------------------------------------------------------------- */
    /* Farmacias de ejemplo. `grupo` define la rotación de turnos (0–6)
       y `coseguro` si está adherida al co-seguro. */
    farmacias: [
      { id: "f1", nombre: "Farmacia Ejemplo Plaza Moreno", dir: "14 e/ 51 y 53", zona: "Centro", tel: "(0221) 400-0001", pos: grilla(14, 52), grupo: 0, coseguro: true },
      { id: "f2", nombre: "Farmacia Ejemplo Diagonal 74", dir: "Diag. 74 y 9", zona: "Centro", tel: "(0221) 400-0002", pos: grilla(9.2, 56), grupo: 0, coseguro: false },
      { id: "f3", nombre: "Farmacia Ejemplo Plaza Italia", dir: "7 e/ 44 y 45", zona: "Centro", tel: "(0221) 400-0003", pos: grilla(7, 44.5), grupo: 1, coseguro: true },
      { id: "f4", nombre: "Farmacia Ejemplo Calle 12", dir: "12 e/ 57 y 58", zona: "Centro", tel: "(0221) 400-0004", pos: grilla(12, 57.5), grupo: 1, coseguro: false },
      { id: "f5", nombre: "Farmacia Ejemplo Plaza Paso", dir: "13 e/ 43 y 44", zona: "Centro", tel: "(0221) 400-0005", pos: grilla(13, 43.5), grupo: 2, coseguro: true },
      { id: "f6", nombre: "Farmacia Ejemplo Avenida 1", dir: "1 e/ 60 y 61", zona: "Centro", tel: "(0221) 400-0006", pos: grilla(1, 60.5), grupo: 2, coseguro: true },
      { id: "f7", nombre: "Farmacia Ejemplo Plaza Rocha", dir: "7 e/ 59 y 60", zona: "Centro", tel: "(0221) 400-0007", pos: grilla(7, 59.5), grupo: 3, coseguro: false },
      { id: "f8", nombre: "Farmacia Ejemplo Calle 19", dir: "19 e/ 50 y 51", zona: "Centro", tel: "(0221) 400-0008", pos: grilla(19, 50.5), grupo: 3, coseguro: true },
      { id: "f9", nombre: "Farmacia Ejemplo Plaza Malvinas", dir: "25 e/ 49 y 50", zona: "Centro", tel: "(0221) 400-0009", pos: grilla(25, 49.5), grupo: 4, coseguro: false },
      { id: "f10", nombre: "Farmacia Ejemplo Calle 3", dir: "3 e/ 40 y 41", zona: "Centro", tel: "(0221) 400-0010", pos: grilla(3, 40.5), grupo: 5, coseguro: true },
      { id: "f11", nombre: "Farmacia Ejemplo Tolosa", dir: "1 e/ 528 y 529", zona: "Zona Norte", tel: "(0221) 400-0011", pos: [-34.8985, -57.9672], grupo: 0, coseguro: true },
      { id: "f12", nombre: "Farmacia Ejemplo Gonnet", dir: "Camino Belgrano y 501", zona: "Zona Norte", tel: "(0221) 400-0012", pos: [-34.8792, -58.0108], grupo: 2, coseguro: false },
      { id: "f13", nombre: "Farmacia Ejemplo City Bell", dir: "Cantilo y 14", zona: "Zona Norte", tel: "(0221) 400-0013", pos: [-34.8655, -58.0498], grupo: 4, coseguro: true },
      { id: "f14", nombre: "Farmacia Ejemplo Ringuelet", dir: "7 e/ 511 y 512", zona: "Zona Norte", tel: "(0221) 400-0014", pos: [-34.8876, -57.9925], grupo: 6, coseguro: false },
      { id: "f15", nombre: "Farmacia Ejemplo Los Hornos", dir: "137 e/ 64 y 65", zona: "Los Hornos", tel: "(0221) 400-0015", pos: [-34.9612, -57.9934], grupo: 1, coseguro: true },
      { id: "f16", nombre: "Farmacia Ejemplo 66", dir: "66 e/ 143 y 144", zona: "Los Hornos", tel: "(0221) 400-0016", pos: [-34.9644, -58.0059], grupo: 3, coseguro: false },
      { id: "f17", nombre: "Farmacia Ejemplo 60", dir: "60 e/ 131 y 132", zona: "Los Hornos", tel: "(0221) 400-0017", pos: [-34.9520, -57.9872], grupo: 5, coseguro: true },
      { id: "f18", nombre: "Farmacia Ejemplo Calle 6", dir: "6 e/ 47 y 48", zona: "Centro", tel: "(0221) 400-0018", pos: grilla(6, 47.5), grupo: 6, coseguro: true },
      { id: "f19", nombre: "Farmacia Ejemplo Plaza Olazábal", dir: "21 e/ 66 y 67", zona: "Centro", tel: "(0221) 400-0019", pos: grilla(21, 66.5), grupo: 5, coseguro: false },
      { id: "f20", nombre: "Farmacia Ejemplo Calle 4", dir: "4 e/ 64 y 65", zona: "Centro", tel: "(0221) 400-0020", pos: grilla(4, 64.5), grupo: 4, coseguro: true },
      { id: "f21", nombre: "Farmacia Ejemplo Plaza Azcuénaga", dir: "18 e/ 61 y 62", zona: "Centro", tel: "(0221) 400-0021", pos: grilla(18, 61.5), grupo: 6, coseguro: true },
    ],

    /* ---------------------------------------------------------------- */
    /* Calendario hípico: patrón de reuniones de ejemplo (día de semana → tipo). */
    calendario: {
      patron: { 2: "Reunión diurna", 4: "Reunión nocturna", 6: "Reunión diurna" },
      especiales: [
        { mes: 10, dia: 21, nombre: "Clásico — reunión especial (ejemplo)" },
        { mes: 11, dia: 14, nombre: "Gran Premio — reunión especial (ejemplo)" },
      ],
      gremiales: [
        { mes: 10, dia: 23, nombre: "Reunión informativa para afiliados" },
        { mes: 11, dia: 6, nombre: "Jornada de salud en sede" },
        { mes: 11, dia: 27, nombre: "Plenario de delegados" },
      ],
    },

    /* ---------------------------------------------------------------- */
    escalas: [
      { cat: "Categoría A", desc: "Supervisión de reunión", valor: 1450000 },
      { cat: "Categoría B", desc: "Atención de ventanilla", valor: 1210000 },
      { cat: "Categoría C", desc: "Control y tesorería", valor: 1180000 },
      { cat: "Categoría D", desc: "Servicios generales", valor: 1040000 },
      { cat: "Categoría E", desc: "Ingresante", valor: 960000 },
    ],

    paritarias: [
      { fecha: "Oct 2026", estado: "En negociación", texto: "Pedido de reapertura de la discusión salarial." },
      { fecha: "Jul 2026", estado: "Acuerdo firmado", texto: "Acuerdo del segundo semestre. Ver acta en Información laboral › Acuerdos." },
      { fecha: "Mar 2026", estado: "Acuerdo firmado", texto: "Acuerdo del primer semestre." },
    ],

    vacantes: [
      { puesto: "Personal de ventanilla — reunión nocturna", tipo: "Eventual", cierre: "2026-10-28", lugar: "Hipódromo de La Plata" },
      { puesto: "Control de acceso — reuniones especiales", tipo: "Eventual", cierre: "2026-11-05", lugar: "Hipódromo de La Plata" },
      { puesto: "Concurso interno — supervisión de reunión", tipo: "Carrera laboral", cierre: "2026-11-20", lugar: "Hipódromo de La Plata" },
    ],

    becas: [
      { nombre: "Curso de atención al público", modalidad: "Presencial", inicio: "Noviembre", cupo: 25 },
      { nombre: "Herramientas digitales básicas", modalidad: "Virtual", inicio: "Noviembre", cupo: 40 },
      { nombre: "Beca de estudio — nivel secundario y terciario", modalidad: "Convocatoria", inicio: "Marzo", cupo: 10 },
    ],

    boletines: [
      { num: 3, mes: "Octubre 2026", temas: ["Transición de autoridades", "Padrón de afiliados", "Nuevos convenios"] },
      { num: 2, mes: "Septiembre 2026", temas: ["Resultado electoral", "Agenda de reuniones"] },
      { num: 1, mes: "Agosto 2026", temas: ["Acuerdo salarial", "Co-seguro"] },
    ],

    autoridades: [
      "Secretaría General", "Secretaría Adjunta", "Secretaría Gremial", "Secretaría de Finanzas",
      "Secretaría de Acción Social", "Secretaría de Prensa y Comunicación", "Secretaría de Actas", "Vocalías",
    ],
  };
})();
