/* ==========================================================================
   CONTENIDO DE EJEMPLO — INSTAGRAM
   Publicaciones (4:5) e historias destacadas. Textos de demostración.
   ========================================================================== */
window.ABER = window.ABER || {};

ABER.ig = {
  perfil: {
    seguidores: "—",
    seguidos: "—",
    bio: [
      { t: "n", v: "ABER · Gremio del Hipódromo de La Plata" },
      { t: "c", v: "Organización gremial" },
      { t: "p", v: "Noticias, comunicados y agenda de la Comisión Directiva." },
      { t: "p", v: "Beneficios, farmacias y trámites en Destacadas ↓" },
      { t: "a", v: "aber.org.ar" },
    ],
  },

  /* Publicaciones reales de ABER (assets/ig/). El orden es el de la grilla:
     IG-1 es la primera (arriba a la izquierda) e IG-9 la última. */
  posts: [
    {
      id: "p1", img: "assets/ig/IG-1.png", cat: "Reuniones institucionales",
      titulo: "Primera reunión de la nueva administración del Hipódromo",
      caption: "Primera reunión de trabajo con la nueva administración del Hipódromo de La Plata.\n\nLos avances se informarán por los canales oficiales.",
      tags: "#ABER #HipódromoDeLaPlata",
    },
    {
      id: "p2", img: "assets/ig/IG-2.png", cat: "Comunicados oficiales",
      titulo: "Comunicado oficial · A los compañeros/as del Hipódromo de La Plata",
      caption: "COMUNICADO OFICIAL · Diciembre 2026\n\nA los compañeros/as del Hipódromo de La Plata.",
      tags: "#ComunicadoOficial",
    },
    {
      id: "p3", img: "assets/ig/IG-3.png", cat: "Acuerdos alcanzados",
      titulo: "Acuerdo · Puntos acordados con la administración",
      caption: "Nuevos acuerdos alcanzados con la administración:\n\n01 Cronograma de pagos pendientes\n02 Relevamiento de puestos de trabajo\n03 Mesa técnica mensual",
      tags: "#Acuerdos",
    },
    {
      id: "p4", img: "assets/ig/IG-4.png", cat: "Opiniones y posicionamientos",
      titulo: "Ezequiel Grasso · Secretario Gremial",
      caption: "“El Trabajo Hípico está atravesando un cambio de época, y como gremio nos proponemos atravesarlo de la mejor manera.”\n\nEzequiel Grasso, Secretario Gremial.",
      tags: "#Opinión",
    },
    {
      id: "p5", img: "assets/ig/IG-5.png", cat: "Agenda y convocatorias",
      titulo: "Reunión informativa para afiliados",
      caption: "CONVOCATORIA · Martes 15 de diciembre\n\nReunión informativa para afiliados.\nLugar: Sede ABER · Horario: 18:00",
      tags: "#Convocatoria",
    },
    {
      id: "p6", img: "assets/ig/IG-6.png", cat: "Prensa y entrevistas",
      titulo: "¿Cómo está hoy la situación de los empleados del Hipódromo de La Plata?",
      caption: "ENTREVISTA · ¿Cómo está hoy la situación de los empleados del Hipódromo de La Plata?\n\nNota completa en realpolitik.com.ar",
      tags: "#Prensa",
    },
    {
      id: "p7", img: "assets/ig/IG-7.png", cat: "Debates laborales", multi: true,
      titulo: "¿Sabés cómo se liquida el aguinaldo?",
      caption: "NUEVA HERRAMIENTA · ¿Sabés cómo se liquida el aguinaldo?\n\nDeslizá y enterate.",
      tags: "#DerechosLaborales #Aguinaldo",
    },
    {
      id: "p8", img: "assets/ig/IG-8.png", cat: "Actividades gremiales",
      titulo: "Día de la Niñez · Pasamos juntos una tarde increíble",
      caption: "DÍA DE LA NIÑEZ · Pasamos juntos una tarde increíble.\n\nGracias a las familias que participaron.",
      tags: "#ActividadGremial",
    },
    {
      id: "p9", img: "assets/ig/IG-9.png", cat: "Beneficios",
      titulo: "Ya tenemos tu caja navideña",
      caption: "Ya tenemos tu caja navideña 🎁\n\nEnterate cómo retirarla.",
      tags: "#Beneficios",
    },
  ],

  destacadas: [
    {
      id: "beneficios", nombre: "Beneficios", icon: "beneficio", color: "var(--azul)",
      frames: [
        { cls: "st-azul", html: `<span class="k2">Beneficios para afiliados</span><h5>Todo lo que tenés por estar afiliado</h5><div class="list"><div><span>Co-seguro de medicamentos</span><span>Salud</span></div><div><span>Asesoramiento legal y contable</span><span>Sede</span></div><div><span>Convenios comerciales</span><span>Descuentos</span></div><div><span>Útiles escolares</span><span>Familia</span></div></div>`, link: { label: "Buscar beneficios", route: "servicios/buscador" } },
        { cls: "st-negro", html: `<span class="k2">Convenios</span><h5>Óptica, gimnasio, turismo y más</h5><p style="margin-top:6cqw">Presentá tu carnet de afiliado. Requisitos y direcciones de cada convenio en la web.</p>`, link: { label: "Ver convenios", route: "servicios/buscador" } },
      ],
    },
    {
      id: "farmacias", nombre: "Farmacias", icon: "farmacia", color: "var(--rojo)",
      frames: [
        { cls: "st-rojo", html: `<span class="k2">Farmacias de turno</span><h5>¿Qué farmacia está de turno hoy?</h5><p style="margin-top:6cqw">Elegí el día y la zona. El mapa te muestra la más cercana y cómo llegar.</p><div class="list"><div><span>Horario de turno</span><span>8:30 a 8:30</span></div><div><span>Zonas</span><span>Centro · Norte · Los Hornos</span></div></div>`, link: { label: "Abrir el mapa", route: "farmacias" } },
        { cls: "st-papel st--light", html: `<span class="k2" style="color:var(--rojo)">Importante</span><h5>De turno no es lo mismo que adherida</h5><p style="margin-top:6cqw">Para usar el co-seguro, filtrá el mapa por “Adheridas al co-seguro”.</p>`, link: { label: "Ver adheridas", route: "farmacias?capa=coseguro" } },
      ],
    },
    {
      id: "afiliacion", nombre: "Afiliación", icon: "afiliacion", color: "var(--negro)",
      frames: [
        { cls: "st-negro", html: `<span class="k2">Cómo afiliarse</span><h5>Afiliación en cuatro pasos</h5><div class="steps"><div>Descargá el formulario</div><div>Completalo y firmalo</div><div>Adjuntá DNI y recibo de haberes</div><div>Entregalo en la sede</div></div>`, link: { label: "Guía de afiliación", route: "tramites/afiliacion" } },
      ],
    },
    {
      id: "coseguro", nombre: "Co-seguro", icon: "escudo", color: "var(--azul-osc)",
      frames: [
        { cls: "st-azul", html: `<span class="k2">Co-seguro</span><div class="big">%</div><h5 style="margin-top:4cqw">Cobertura complementaria en medicamentos</h5><p style="margin-top:4cqw">Porcentajes y farmacias adheridas en la web.</p>`, link: { label: "Ver co-seguro", route: "servicios/coseguro" } },
      ],
    },
    {
      id: "tramites", nombre: "Trámites", icon: "doc", color: "#3a3d45",
      frames: [
        { cls: "st-papel st--light", html: `<span class="k2" style="color:var(--azul)">Trámites y consultas</span><h5>Formularios y turnos</h5><div class="steps"><div>Formularios para descargar</div><div>Turnos legales y contables</div><div>Orientación previsional</div></div>`, link: { label: "Ir a trámites", route: "tramites" } },
      ],
    },
    {
      id: "agenda", nombre: "Agenda", icon: "calendario", color: "var(--rojo-osc)",
      frames: [
        { cls: "st-rojo", html: `<span class="k2">Agenda</span><div class="big">23</div><h5 style="margin-top:2cqw">Reunión informativa para afiliados</h5><p style="margin-top:4cqw">Octubre · Sede ABER</p>`, link: { label: "Calendario completo", route: "calendario" } },
      ],
    },
    {
      id: "contacto", nombre: "Contacto", icon: "telefono", color: "var(--grafito)",
      frames: [
        { cls: "st-negro", html: `<span class="k2">Contacto</span><h5>Sede y canales oficiales</h5><div class="list"><div><span>Sede</span><span>A confirmar</span></div><div><span>Teléfono</span><span>A confirmar</span></div><div><span>WhatsApp</span><span>A confirmar</span></div><div><span>Web</span><span>aber.org.ar</span></div></div>`, link: { label: "Contactos", route: "gremio/sedes" } },
      ],
    },
  ],
};
