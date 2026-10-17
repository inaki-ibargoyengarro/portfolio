/* ==========================================================================
   PROTOTIPO NAVEGABLE — aber.org.ar
   ABER.createSite(contenedor, { start, onRoute }) crea una instancia
   independiente del sitio (se usan varias: web, farmacias, celular, herramientas).
   ========================================================================== */
window.ABER = window.ABER || {};

ABER.createSite = function (root, opts = {}) {
  const I = ABER.icon, e = ABER.esc, F = ABER.media.foto, D = ABER.demo, C = ABER.config;
  const G = C.gremio;
  const tbc = (v) => (v ? e(v) : `<span class="aw-tbc">A confirmar</span>`);
  const demoTag = (t = "Contenido de ejemplo") => `<span class="aw-demo">${I("faq")} ${e(t)}</span>`;
  const fmtDate = (iso) => { const d = new Date(iso + "T12:00:00"); return d.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" }); };
  const money = (n) => "$ " + Math.round(n).toLocaleString("es-AR");
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const NAV = [
    ["inicio", "Inicio"], ["gremio", "El gremio"], ["servicios", "Servicios y beneficios"], ["laboral", "Información laboral"],
    ["tramites", "Trámites y consultas"], ["novedades", "Novedades"],
  ];
  const TOOLS = [
    ["servicios/buscador", "beneficio", "Buscador de convenios y beneficios", "Por categoría, zona y requisitos"],
    ["tramites/faq", "faq", "Preguntas frecuentes", "Respuestas con buscador"],
    ["calendario", "calendario", "Calendario hípico", "Reuniones y agenda gremial"],
    ["tramites/afiliacion", "afiliacion", "Guía de afiliación", "Paso a paso con requisitos"],
    ["herramientas/boletin", "boletin", "Boletín institucional", "Suscripción y archivo"],
    ["tramites/consultas", "turnos", "Consultas y turnos", "Legal, contable y previsional"],
    ["herramientas/becas", "becas", "Becas y capacitaciones", "Convocatorias e inscripción"],
    ["herramientas/bolsa", "bolsa", "Bolsa de trabajo eventual", "Registro de disponibilidad"],
    ["laboral/calculadora", "calculadora", "Calculadora de impacto salarial", "Simulación de aumentos"],
    ["tramites/previsional", "previsional", "Orientación previsional", "Requisitos y próximos pasos"],
    ["herramientas/acompanamiento", "acompanamiento", "Canales de acompañamiento", "Orientación especializada"],
  ];
  ABER.TOOLS = TOOLS;

  let hist = [], hi = -1, cleanup = [];
  const st = { farm: null, ben: null, faq: null, cal: null, afi: null, turno: null, calc: null, prev: null, nov: "Todas" };

  /* ------------------------------ Estructura ------------------------------ */
  root.classList.add("site", "aw");
  root.innerHTML = `
    <header class="aw-top"><div class="wrap">
      <div class="aw-brand" data-go="inicio">${ABER.logo()}</div>
      <div class="aw-util">
        <button data-go="calendario">${I("calendario")}Calendario hípico</button>
        <button data-go="herramientas">${I("menu")}Herramientas</button>
        <button data-go="tramites/afiliacion">${I("afiliacion")}Afiliate</button>
        <button class="hot" data-go="farmacias">${I("farmacia")}Farmacias de turno</button>
      </div>
      <button class="aw-burger" data-burger aria-label="Menú">${I("menu")}</button>
    </div></header>
    <nav class="aw-mnav" data-mnav>
      ${NAV.map(([r, l]) => `<button data-go="${r}">${l}${I("flecha")}</button>`).join("")}
      <button class="hot" data-go="farmacias">Farmacias de turno${I("farmacia")}</button>
      <button data-go="calendario">Calendario hípico${I("calendario")}</button>
      <button data-go="herramientas">Herramientas${I("menu")}</button>
    </nav>
    <nav class="aw-nav"><div class="wrap">${NAV.map(([r, l]) => `<button data-go="${r}">${l}</button>`).join("")}</div></nav>
    <main data-view></main>
    <footer>
      <div class="aw-foot"><div class="wrap">
        <div>${ABER.logo()}<p>${e(G.nombre)}</p><p style="margin-top:10px">Sitio prototipo. Los contenidos marcados como ejemplo no corresponden a información oficial.</p></div>
        <div><h4>Gremio</h4><button data-go="gremio/historia">Historia</button><button data-go="gremio/autoridades">Autoridades</button><button data-go="gremio/sedes">Sedes y contactos</button></div>
        <div><h4>Afiliados</h4><button data-go="servicios">Servicios y beneficios</button><button data-go="farmacias">Farmacias de turno</button><button data-go="tramites/afiliacion">Cómo afiliarse</button><button data-go="tramites/formularios">Formularios</button></div>
        <div><h4>Enlaces útiles</h4><a href="https://www.anses.gob.ar" target="_blank" rel="noopener">ANSES ${I("externo")}</a><a href="https://www.argentina.gob.ar/trabajo" target="_blank" rel="noopener">Ministerio de Trabajo ${I("externo")}</a><button data-go="herramientas/boletin">Boletín institucional</button></div>
      </div></div>
      <div class="aw-foot aw-foot__end"><div class="wrap"><span>© ${new Date().getFullYear()} ${e(G.sigla)} · ${e(G.dominio)}</span><span>Prototipo de demostración</span></div></div>
    </footer>`;
  const view = root.querySelector("[data-view]");

  /* --------------------------- Componentes --------------------------- */
  function head(title, crumbs, lead, demo) {
    return `<section class="aw-ph"><div class="wrap">
      <div class="aw-crumb"><button data-go="inicio">Inicio</button>${crumbs.map(([r, l]) => `<span>/</span><button data-go="${r}">${e(l)}</button>`).join("")}</div>
      <h1>${e(title)}</h1>${lead ? `<p>${e(lead)}</p>` : ""}${demo ? `<div class="demo">${demoTag(demo === true ? undefined : demo)}</div>` : ""}
    </div></section>`;
  }
  function split(sec, items, active, body) {
    return `<div class="wrap aw-split"><aside class="aw-sub">${items.map(([r, l]) => `<button data-go="${sec}/${r}" class="${r === active ? "is-on" : ""}">${e(l)}${I("flecha")}</button>`).join("")}</aside><div class="aw-body">${body}</div></div>`;
  }
  const h2 = (t, right = "") => `<div class="aw-h2"><h2>${e(t)}</h2>${right}</div>`;

  function toast(msg) {
    document.querySelector(".aw-toast")?.remove();
    const t = document.createElement("div");
    t.className = "aw-toast"; t.innerHTML = `${I("check")} ${e(msg)}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  function modal(title, html) {
    const m = document.createElement("div");
    m.className = "aw-modal";
    m.innerHTML = `<div class="aw-modal__box"><div class="aw-modal__h">${I("doc")}<b>${e(title)}</b><button data-close aria-label="Cerrar">${I("cerrar")}</button></div>${html}</div>`;
    m.addEventListener("click", (ev) => {
      if (ev.target === m || ev.target.closest("[data-close]")) return m.remove();
      const dl = ev.target.closest("[data-dl]"); if (dl) download(D.documentos.find((d) => d.id === dl.dataset.dl));
    });
    document.body.appendChild(m);
    m.querySelector("[data-close]").focus();
  }
  function docSheet(d) {
    return `<div class="aw-modal__doc"><div class="sheet">
      <div class="sheet__h">${ABER.logo()}<div>${e(d.tipo)}<br>${d.anio}<br>${d.paginas} páginas</div></div><div class="sheet__band"></div>
      <div class="sheet__b"><span class="t-meta">${e(G.sigla)} · Documento</span><h4>${e(d.titulo)}</h4>
      <p>Vista previa de demostración. En la versión publicada se muestra aquí el documento oficial en PDF, con descarga directa.</p>
      <p>Cada documento lleva fecha de publicación, tipo y versión, para que siempre se descargue el vigente.</p>
      <div class="sheet__sig"><span>${e(G.dominio)}</span><span>Ejemplo</span></div></div></div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding:14px 18px"><button class="aw-btn" data-dl="${d.id}">${I("descargar")} Descargar</button></div>`;
  }
  function download(d) {
    const txt = `${G.sigla} — ${G.dominio}\n\n${d.titulo}\nTipo: ${d.tipo} · Año: ${d.anio}\n\nARCHIVO DE DEMOSTRACIÓN.\nEn el sitio publicado esta descarga entrega el documento oficial en PDF.\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
    a.download = `ABER-${norm(d.titulo).replace(/[^a-z0-9]+/g, "-")}-EJEMPLO.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("Descarga de demostración iniciada");
  }

  /* ================================ PÁGINAS ================================ */
  const P = {};

  /* ------------------------------ INICIO ------------------------------ */
  P.inicio = () => {
    const [lead, ...rest] = D.noticias;
    const com = D.noticias.filter((n) => n.id !== lead.id).slice(0, 3);
    const ag = D.calendario.gremiales.slice(0, 3);
    const mes = ["", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    return `
      <section class="aw-hero">
        <article class="aw-hero__main" data-go="novedades/${lead.id}">${F(lead.foto, { tone: "azul" })}
          <div class="aw-hero__txt"><span class="aw-kick"><b>${e(lead.tipo)}</b>${fmtDate(lead.fecha)}</span><h2>${e(lead.titulo)}</h2><p>${e(lead.bajada)}</p></div></article>
        <div class="aw-hero__side"><h3>Comunicados y noticias</h3>
          ${com.map((n) => `<button data-go="novedades/${n.id}"><b>${e(n.titulo)}</b><small>${e(n.tipo)} · ${fmtDate(n.fecha)}</small></button>`).join("")}
          <button class="aw-link" data-go="novedades">Todas las novedades ${I("flecha")}</button></div>
      </section>
      <section class="aw-access">
        <button class="hot" data-go="farmacias">${I("farmacia")}<div><b>Farmacias de turno</b><small>Mapa por día y zona</small></div></button>
        <button data-go="servicios/buscador">${I("beneficio")}<div><b>Beneficios</b><small>Convenios y descuentos</small></div></button>
        <button data-go="servicios/coseguro">${I("escudo")}<div><b>Co-seguro</b><small>Cobertura y adheridas</small></div></button>
        <button data-go="calendario">${I("calendario")}<div><b>Calendario hípico</b><small>Reuniones y agenda</small></div></button>
        <button data-go="tramites/afiliacion">${I("afiliacion")}<div><b>Afiliación</b><small>Requisitos y pasos</small></div></button>
        <button data-go="tramites/consultas">${I("turnos")}<div><b>Consultas y turnos</b><small>Legal, contable, previsional</small></div></button>
      </section>
      <div class="wrap">
        <div class="aw-home2">
          <div>
            ${h2("Para afiliados", `<span>Información importante</span>`)}
            <div class="aw-alert"><b>Actualización del padrón de afiliados</b><p>Verificá tus datos de contacto para recibir comunicados, convocatorias y novedades de beneficios.</p><button class="aw-link" data-go="tramites/formularios">Formulario de actualización ${I("flecha")}</button></div>
            <div style="margin-top:28px">${h2("Últimas novedades", `<button data-go="novedades">Ver todas ${I("flecha")}</button>`)}
            <div class="aw-news">${rest.slice(0, 3).map((n) => `<button data-go="novedades/${n.id}">${F(n.foto, { tone: n.tipo === "Prensa" ? "noche" : n.tipo === "Actividades" ? "rojo" : "papel" })}<small>${e(n.tipo)} · ${fmtDate(n.fecha)}</small><b>${e(n.titulo)}</b></button>`).join("")}</div></div>
          </div>
          <div>
            ${h2("Agenda", `<button data-go="calendario">Calendario ${I("flecha")}</button>`)}
            <div class="aw-agenda" style="border-top:0"><ul>${ag.map((a) => `<li><div class="d"><b>${a.dia}</b><span>${mes[a.mes]}</span></div><div><strong>${e(a.nombre)}</strong><small>Agenda gremial · ejemplo</small></div></li>`).join("")}</ul></div>
            <div style="margin-top:28px">${h2("Enlaces útiles")}
              <div class="aw-rows" style="border-top:0">
                <div class="aw-row"><div><div class="aw-row__t">Escalas salariales vigentes</div><div class="aw-row__m">Información laboral</div></div><button class="aw-link" data-go="laboral/escalas">${I("flecha")}</button></div>
                <div class="aw-row"><div><div class="aw-row__t">Preguntas frecuentes</div><div class="aw-row__m">Afiliación, co-seguro, trámites</div></div><button class="aw-link" data-go="tramites/faq">${I("flecha")}</button></div>
                <div class="aw-row"><div><div class="aw-row__t">ANSES</div><div class="aw-row__m">anses.gob.ar</div></div><a class="aw-link" href="https://www.anses.gob.ar" target="_blank" rel="noopener">${I("externo")}</a></div>
              </div></div>
          </div>
        </div>
      </div>
      <section class="aw-contact" style="margin-top:36px"><div class="wrap">
        <h3>Sede y<br>contactos</h3>
        <div class="c"><span>Dirección</span><b>${tbc(G.sede)}</b></div>
        <div class="c"><span>Teléfono · WhatsApp</span><b>${tbc(G.telefono)}</b></div>
        <div class="c"><span>Atención</span><b>${tbc(G.horario)}</b></div>
      </div></section>`;
  };

  /* ------------------------------ GREMIO ------------------------------ */
  const GSUB = [["historia", "Historia"], ["autoridades", "Autoridades"], ["sedes", "Sedes y contactos"]];
  P.gremio = (sub = "historia") => {
    let body = "";
    if (sub === "historia") body = `${h2("Historia institucional")}
      <p class="aw-lead">Espacio para la historia de la organización: fundación, hitos y conducciones. ${demoTag("Estructura de ejemplo · completar con información institucional")}</p>
      <div class="aw-two" style="margin-top:24px"><div class="aw-tl"><ul>
        <li><span class="f">Fundación</span><b>Origen de la organización</b><p>Fecha y circunstancias de la fundación.</p></li>
        <li><span class="f">Hitos</span><b>Acuerdos y conquistas relevantes</b><p>Convenios, reconocimientos y logros.</p></li>
        <li><span class="f">Hipódromo de La Plata</span><b>Relación con la actividad hípica</b><p>Ámbito de representación del gremio.</p></li>
        <li class="on"><span class="f">10.09.2026</span><b>Elección de la nueva Comisión Directiva</b><p>Asunción prevista: ${e(G.asuncion)}.</p></li>
      </ul></div>${F("tribuna", { tone: "papel", cls: "", tag: "Imagen ilustrativa · archivo histórico" }).replace('class="ph', 'style="aspect-ratio:4/5" class="ph')}</div>`;
    if (sub === "autoridades") body = `${h2("Comisión Directiva", `<span>Período 2026 — ${demoTag("Nombres a confirmar")}</span>`)}
      <div class="aw-people">${D.autoridades.map((r) => `<div class="aw-person"><div class="av">${I("usuario")}</div><b>${e(r)}</b><small>Nombre a confirmar</small></div>`).join("")}</div>`;
    if (sub === "sedes") body = `${h2("Sedes y contactos")}
      <dl class="aw-kv"><dt>Sede central</dt><dd>${tbc(G.sede)}</dd><dt>Teléfono</dt><dd>${tbc(G.telefono)}</dd><dt>WhatsApp</dt><dd>${tbc(G.whatsapp)}</dd><dt>Correo</dt><dd>${tbc(G.email)}</dd><dt>Horario</dt><dd>${tbc(G.horario)}</dd><dt>Instagram</dt><dd>@${e(G.instagram)} <span class="aw-tbc">usuario de ejemplo</span></dd></dl>
      <div style="margin-top:22px;display:flex;gap:8px;flex-wrap:wrap"><button class="aw-btn" data-go="tramites/consultas">${I("turnos")} Pedir un turno</button><button class="aw-btn aw-btn--o" data-go="herramientas/acompanamiento">${I("acompanamiento")} Canales de atención</button></div>`;
    return head("El gremio", [["gremio", "El gremio"]], null) + split("gremio", GSUB, sub, body);
  };

  /* ----------------------------- SERVICIOS ----------------------------- */
  const SSUB = [["coseguro", "Co-seguro"], ["prestaciones", "Prestaciones"], ["buscador", "Convenios y beneficios"], ["profesionales", "Profesionales y prestadores"], ["requisitos", "Requisitos"]];
  P.servicios = (sub = "coseguro") => {
    let body = "";
    if (sub === "coseguro") body = `
      <div class="aw-feature"><div class="aw-feature__a"><span class="aw-kick"><b>Salud</b></span><h3>Co-seguro de medicamentos</h3><p>Cobertura complementaria sobre medicamentos en farmacias adheridas, presentando el carnet de afiliado y la receta.</p><button class="aw-btn" data-go="farmacias?capa=coseguro">${I("farmacia")} Farmacias adheridas</button></div>
      <div class="aw-feature__b"><dl class="aw-kv"><dt>Cobertura</dt><dd>${tbc(null)}</dd><dt>Quiénes</dt><dd>Afiliados con afiliación activa${"" }</dd><dt>Qué presentar</dt><dd>Carnet, DNI y receta</dd><dt>Dónde</dt><dd>Farmacias adheridas</dd><dt>Consultas</dt><dd><button class="aw-link" data-go="tramites/faq">Preguntas frecuentes</button></dd></dl></div></div>`;
    if (sub === "prestaciones") body = `${h2("Prestaciones")}
      <div class="aw-cols">
        <div>${I("legal")}<b>Asesoramiento legal</b><p>Relación laboral, liquidaciones y reclamos.</p><button class="aw-link" data-go="tramites/consultas?area=Legal">Pedir turno ${I("flecha")}</button></div>
        <div>${I("calculadora")}<b>Asesoramiento contable</b><p>Monotributo, ganancias y declaraciones.</p><button class="aw-link" data-go="tramites/consultas?area=Contable">Pedir turno ${I("flecha")}</button></div>
        <div>${I("previsional")}<b>Orientación previsional</b><p>Requisitos y pasos para jubilarse.</p><button class="aw-link" data-go="tramites/previsional">Orientador ${I("flecha")}</button></div>
      </div>${demoTag("Prestaciones de ejemplo · confirmar las vigentes")}`;
    if (sub === "buscador") body = benefitsTool();
    if (sub === "profesionales") body = `${h2("Profesionales y prestadores", `<span>${demoTag()}</span>`)}
      <table class="aw-table"><thead><tr><th>Especialidad</th><th>Prestador</th><th>Zona</th><th>Turnos</th></tr></thead><tbody>
      ${[["Odontología", "Consultorio adherido", "Centro"], ["Kinesiología", "Centro de rehabilitación adherido", "Zona Norte"], ["Óptica", "Ópticas adheridas", "Centro"], ["Psicología", "Profesional adherido", "Centro"]].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td><td><button class="aw-link" data-go="tramites/consultas">Solicitar ${I("flecha")}</button></td></tr>`).join("")}</tbody></table>`;
    if (sub === "requisitos") body = `${h2("Requisitos por servicio")}
      <table class="aw-table"><thead><tr><th>Servicio</th><th>Requisitos</th></tr></thead><tbody>${D.beneficios.map((b) => `<tr><td><b>${e(b.nombre)}</b></td><td>${b.req.map(e).join(" · ")}</td></tr>`).join("")}</tbody></table>`;
    return head("Servicios y beneficios", [["servicios", "Servicios y beneficios"]], null, sub === "buscador" || sub === "coseguro" ? true : null) + split("servicios", SSUB, sub, body);
  };

  function benefitsTool() {
    st.ben = st.ben || { q: "", cat: "Todas", zona: "Todas", open: null };
    const cats = ["Todas", ...new Set(D.beneficios.map((b) => b.cat))];
    const zonas = ["Todas", ...new Set(D.beneficios.map((b) => b.zona))];
    return `${h2("Buscador de convenios y beneficios")}
      <div class="aw-tools"><label class="aw-search">${I("buscar")}<input class="aw-in" data-ben-q placeholder="Buscar: óptica, gimnasio, útiles, legal…" value="${e(st.ben.q)}"></label>
        <label class="aw-field">Zona<select class="aw-in" data-ben-z>${zonas.map((z) => `<option ${z === st.ben.zona ? "selected" : ""}>${e(z)}</option>`).join("")}</select></label></div>
      <div class="aw-chips" data-ben-cats>${cats.map((c) => `<button class="aw-chip ${c === st.ben.cat ? "is-on" : ""}" data-cat="${e(c)}">${e(c)}<b>${c === "Todas" ? D.beneficios.length : D.beneficios.filter((b) => b.cat === c).length}</b></button>`).join("")}</div>
      <div data-ben-out></div>`;
  }
  function paintBenefits() {
    const out = view.querySelector("[data-ben-out]"); if (!out) return;
    const s = st.ben, q = norm(s.q);
    const list = D.beneficios.filter((b) => (s.cat === "Todas" || b.cat === s.cat) && (s.zona === "Todas" || b.zona === s.zona) && (!q || norm(b.nombre + " " + b.desc + " " + b.cat).includes(q)));
    out.innerHTML = `<div class="aw-count">${list.length} resultado${list.length === 1 ? "" : "s"}</div>` + (list.length ? `<div class="aw-rows">${list.map((b) => `
      <div class="aw-row ${s.open === b.id ? "is-open" : ""}">
        <div><div class="aw-row__t">${e(b.nombre)}</div><div class="aw-row__m"><span class="aw-badge aw-badge--azul">${e(b.cat)}</span>${I("pin")} ${e(b.zona)}${b.destacado ? ` <span class="aw-badge aw-badge--rojo">Destacado</span>` : ""}</div></div>
        <div class="aw-row__a"><button class="aw-btn aw-btn--o aw-btn--s" data-ben-open="${b.id}">${s.open === b.id ? "Cerrar" : "Requisitos"}</button></div>
        ${s.open === b.id ? `<div class="aw-detail"><div><h4>Descripción</h4><p class="aw-txt" style="font-size:15px">${e(b.desc)}</p></div><div><h4>Requisitos</h4><ul>${b.req.map((r) => `<li>${I("check")}${e(r)}</li>`).join("")}</ul><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="aw-btn aw-btn--s" data-go="tramites/consultas">Consultar</button>${b.cat === "Co-seguro" ? `<button class="aw-btn aw-btn--o aw-btn--s" data-go="farmacias?capa=coseguro">Farmacias adheridas</button>` : ""}</div></div></div>` : ""}
      </div>`).join("")}</div>` : `<div class="aw-empty">No hay beneficios que coincidan. Probá con otra palabra o categoría.</div>`);
  }

  /* ------------------------------ LABORAL ------------------------------ */
  const LSUB = [["paritarias", "Paritarias"], ["escalas", "Escalas salariales"], ["acuerdos", "Acuerdos"], ["carrera", "Carrera laboral"], ["calculadora", "Calculadora salarial"]];
  P.laboral = (sub = "paritarias") => {
    let body = "";
    if (sub === "paritarias") body = `${h2("Paritarias", `<span>${demoTag()}</span>`)}
      <div class="aw-tl"><ul>${D.paritarias.map((p, i) => `<li class="${i === 0 ? "on" : ""}"><span class="f">${e(p.fecha)} · ${e(p.estado)}</span><b>${e(p.texto)}</b></li>`).join("")}</ul></div>
      <button class="aw-btn aw-btn--o" data-go="laboral/acuerdos">${I("doc")} Actas de acuerdos</button>`;
    if (sub === "escalas") body = `${h2("Escalas salariales", `<span>${demoTag("Valores ficticios")}</span>`)}
      <table class="aw-table"><thead><tr><th>Categoría</th><th>Función</th><th class="n">Básico</th></tr></thead><tbody>${D.escalas.map((s) => `<tr><td><b>${e(s.cat)}</b></td><td>${e(s.desc)}</td><td class="n">${money(s.valor)}</td></tr>`).join("")}</tbody></table>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="aw-btn" data-go="laboral/calculadora">${I("calculadora")} Calcular impacto</button><button class="aw-btn aw-btn--o" data-dl="d7">${I("descargar")} Descargar escalas</button></div>`;
    if (sub === "acuerdos") body = `${h2("Acuerdos")}<div class="aw-rows">${D.documentos.filter((d) => d.tipo === "Acuerdos").map(docRow).join("")}</div>`;
    if (sub === "carrera") body = `${h2("Carrera laboral")}
      <div class="aw-cols"><div>${I("becas")}<b>Capacitación</b><p>Cursos para el desarrollo en el puesto.</p><button class="aw-link" data-go="herramientas/becas">Ver cursos ${I("flecha")}</button></div>
      <div>${I("bolsa")}<b>Trabajo eventual</b><p>Registro para reuniones especiales.</p><button class="aw-link" data-go="herramientas/bolsa">Registrarme ${I("flecha")}</button></div></div>`;
    if (sub === "calculadora") body = calcHTML();
    return head("Información laboral", [["laboral", "Información laboral"]], null) + split("laboral", LSUB, sub, body);
  };
  function calcHTML() {
    st.calc = st.calc || { cat: 1, ant: 5, pct: 12 };
    return `${h2("Calculadora de impacto salarial", `<span>${demoTag("Valores y fórmula de ejemplo")}</span>`)}
      <div class="aw-two"><div class="aw-form" data-calc>
        <label class="aw-field full">Categoría<select class="aw-in" name="cat">${D.escalas.map((s, i) => `<option value="${i}" ${i === st.calc.cat ? "selected" : ""}>${e(s.cat)} — ${e(s.desc)}</option>`).join("")}</select></label>
        <label class="aw-field">Antigüedad (años)<input class="aw-in" type="number" min="0" max="45" name="ant" value="${st.calc.ant}"><small>1 % por año sobre el básico</small></label>
        <label class="aw-field">Aumento acordado (%)<input class="aw-in" type="number" min="0" max="100" step="0.5" name="pct" value="${st.calc.pct}"></label>
      </div><div class="aw-result" data-calc-out></div></div>`;
  }
  function paintCalc() {
    const out = view.querySelector("[data-calc-out]"); if (!out) return;
    const s = st.calc, b = D.escalas[s.cat].valor;
    const act = b * (1 + s.ant / 100), nue = act * (1 + s.pct / 100), dif = nue - act;
    out.innerHTML = `<span class="k">Nuevo salario básico + antigüedad</span><div class="big">${money(nue)}</div>
      <dl><dt>Actual</dt><dd>${money(act)}</dd><dt>Diferencia mensual</dt><dd>+ ${money(dif)}</dd><dt>Diferencia anual (13 sueldos)</dt><dd>+ ${money(dif * 13)}</dd></dl>
      <p>Simulación sobre valores ficticios. No incluye adicionales ni descuentos.</p>`;
  }

  /* ------------------------ FILA DE DOCUMENTO ------------------------ */
  function docRow(d) {
    return `<div class="aw-row aw-row--doc"><span class="fi">PDF</span><div><div class="aw-row__t">${e(d.titulo)}</div><div class="aw-row__m"><span class="aw-badge aw-badge--azul">${e(d.tipo)}</span>${d.anio} · ${d.paginas} pág. · ${e(d.peso)}</div></div>
      <div class="aw-row__a"><button class="aw-btn aw-btn--o aw-btn--s" data-view-doc="${d.id}">${I("ver")} Ver</button><button class="aw-btn aw-btn--s" data-dl="${d.id}">${I("descargar")}<span class="vh">Descargar</span></button></div></div>`;
  }

  /* ------------------------------ TRÁMITES ------------------------------ */
  const TSUB = [["afiliacion", "Cómo afiliarse"], ["formularios", "Formularios"], ["faq", "Preguntas frecuentes"], ["consultas", "Consultas y turnos"], ["previsional", "Orientación previsional"]];
  P.tramites = (sub = "afiliacion", q) => {
    let body = "";
    if (sub === "afiliacion") body = afiHTML();
    if (sub === "formularios") body = `${h2("Formularios")}<div class="aw-rows">${D.documentos.filter((d) => d.tipo === "Formularios").map(docRow).join("")}</div>`;
    if (sub === "faq") body = faqHTML();
    if (sub === "consultas") { st.turno = { area: q.area || "Legal", dia: null, hora: null, done: false }; body = turnoHTML(); }
    if (sub === "previsional") body = prevHTML();
    return head("Trámites y consultas", [["tramites", "Trámites y consultas"]], null) + split("tramites", TSUB, sub, body);
  };

  const AFI = [
    { t: "Requisitos", h: "Quiénes pueden afiliarse", p: "El personal comprendido en el ámbito de representación del gremio, según el estatuto.", c: ["Trabajo en el ámbito del Hipódromo de La Plata", "DNI vigente", "Último recibo de haberes"] },
    { t: "Formulario", h: "Descargá y completá el formulario", p: "Completalo con letra clara y firmalo. Si tenés dudas, podés completarlo en la sede.", c: ["Formulario descargado", "Datos personales completos", "Firma"], doc: "d3" },
    { t: "Presentación", h: "Presentá la documentación", p: "Entregá el formulario con la copia de DNI y del recibo en la sede, o pedí un turno.", c: ["Copia de DNI", "Copia del recibo", "Formulario firmado"], turno: true },
    { t: "Alta", h: "Confirmación del alta", p: "El alta se informa por los canales de contacto declarados. Desde ese momento accedés a los beneficios.", c: ["Recibí la confirmación", "Retirá tu carnet"] },
  ];
  function afiHTML() {
    st.afi = st.afi || { i: 0, chk: {} };
    const s = st.afi, a = AFI[s.i];
    const total = AFI.reduce((n, x) => n + x.c.length, 0), done = Object.values(s.chk).filter(Boolean).length;
    return `${h2("Guía de afiliación", `<span>${demoTag("Requisitos a validar")}</span>`)}
      <div class="aw-steps">${AFI.map((x, i) => `<button data-afi="${i}" class="${i === s.i ? "is-on" : i < s.i ? "done" : ""}"><span>Paso 0${i + 1}</span><b>${e(x.t)}</b></button>`).join("")}</div>
      <div class="aw-step"><div><h3>${e(a.h)}</h3><p class="aw-lead">${e(a.p)}</p>
        <div class="aw-check">${a.c.map((c, k) => { const id = s.i + "-" + k; return `<label><input type="checkbox" data-chk="${id}" ${s.chk[id] ? "checked" : ""}>${e(c)}</label>`; }).join("")}</div>
        <div class="aw-navsteps">${s.i > 0 ? `<button class="aw-btn aw-btn--o" data-afi="${s.i - 1}">${I("flechaIzq")} Anterior</button>` : ""}${s.i < AFI.length - 1 ? `<button class="aw-btn" data-afi="${s.i + 1}">Siguiente ${I("flecha")}</button>` : `<button class="aw-btn aw-btn--r" data-go="tramites/consultas?area=Afiliación">${I("turnos")} Pedir turno en sede</button>`}</div></div>
        <aside class="aw-step__aside"><h4>Tu avance</h4><b style="font-size:28px;font-stretch:70%;font-weight:800">${done} / ${total}</b><div class="aw-bar"><i style="width:${(done / total) * 100}%"></i></div><small style="color:#6b6e76">Ítems marcados</small>
          <div style="margin-top:18px;display:grid;gap:8px">${a.doc ? `<button class="aw-btn" data-dl="${a.doc}">${I("descargar")} Formulario de afiliación</button>` : ""}${a.turno ? `<button class="aw-btn aw-btn--o" data-go="tramites/consultas?area=Afiliación">${I("turnos")} Pedir turno</button>` : ""}<button class="aw-btn aw-btn--o" data-go="tramites/faq">${I("faq")} Preguntas frecuentes</button></div></aside></div>`;
  }

  function faqHTML() {
    st.faq = st.faq || { q: "", cat: "Todas" };
    const cats = ["Todas", ...new Set(D.faq.map((f) => f.cat))];
    return `${h2("Preguntas frecuentes", `<span>${demoTag()}</span>`)}
      <label class="aw-search" style="display:block;margin-bottom:12px">${I("buscar")}<input class="aw-in" data-faq-q placeholder="Escribí tu pregunta: carnet, farmacia, formulario…" value="${e(st.faq.q)}"></label>
      <div class="aw-chips" data-faq-c>${cats.map((c) => `<button class="aw-chip ${c === st.faq.cat ? "is-on" : ""}" data-fcat="${e(c)}">${e(c)}</button>`).join("")}</div>
      <div data-faq-out style="margin-top:14px"></div>`;
  }
  function paintFaq() {
    const out = view.querySelector("[data-faq-out]"); if (!out) return;
    const s = st.faq, q = norm(s.q);
    const hl = (t) => { if (!q) return e(t); const n = norm(t), i = n.indexOf(q); return i < 0 ? e(t) : e(t.slice(0, i)) + "<mark>" + e(t.slice(i, i + q.length)) + "</mark>" + e(t.slice(i + q.length)); };
    const list = D.faq.filter((f) => (s.cat === "Todas" || f.cat === s.cat) && (!q || norm(f.q + " " + f.a).includes(q)));
    out.innerHTML = list.length ? `<div class="aw-faq" style="border-top:2px solid var(--negro)">${list.map((f, i) => `<details ${q && i === 0 ? "open" : ""}><summary><span><small>${e(f.cat)}</small>${hl(f.q)}</span></summary><p>${hl(f.a)}</p></details>`).join("")}</div>`
      : `<div class="aw-empty">No encontramos esa pregunta. <button class="aw-link" data-go="tramites/consultas">Hacé tu consulta ${I("flecha")}</button></div>`;
  }

  function nextDays(n) {
    const out = [], d = new Date(); d.setHours(12);
    while (out.length < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d)); }
    return out;
  }
  function turnoHTML() {
    return `${h2("Consultas y turnos", `<span>${demoTag("Demostración · no envía datos")}</span>`)}<div data-turno></div>`;
  }
  function paintTurno() {
    const box = view.querySelector("[data-turno]"); if (!box) return;
    const s = st.turno;
    if (s.done) {
      box.innerHTML = `<div class="aw-ok">${I("check")}<div><b>Solicitud registrada (demostración)</b><p>${e(s.area)} · ${s.dia.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} · ${e(s.hora)} h<br>En el sitio publicado se envía una confirmación por correo o WhatsApp.</p><div style="margin-top:12px"><button class="aw-btn aw-btn--o aw-btn--s" data-turno-reset>Pedir otro turno</button></div></div></div>`;
      return;
    }
    const days = nextDays(8), areas = ["Legal", "Contable", "Previsional", "Afiliación", "Gremial"];
    const seed = (d, h) => (d.getDate() * 7 + h.length * 3 + h.charCodeAt(1)) % 4 === 0;
    box.innerHTML = `<div class="aw-form">
      <div class="aw-field full">Área de consulta<div class="aw-chips" style="margin-top:4px">${areas.map((a) => `<button class="aw-chip ${a === s.area ? "is-on" : ""}" data-area="${a}">${a}</button>`).join("")}</div></div>
      <div class="aw-field full">Día<div class="aw-dates" style="margin-top:4px">${days.map((d) => `<button data-dia="${d.toISOString()}" class="${s.dia && d.toDateString() === s.dia.toDateString() ? "is-on" : ""}">${d.toLocaleDateString("es-AR", { weekday: "short" })}<b>${d.getDate()}</b>${d.toLocaleDateString("es-AR", { month: "short" })}</button>`).join("")}</div></div>
      ${s.dia ? `<div class="aw-field full">Horario disponible<div class="aw-slots" style="margin-top:4px">${["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00"].map((h) => `<button data-hora="${h}" class="${s.hora === h ? "is-on" : ""}" ${seed(s.dia, h) ? "disabled" : ""}>${h}</button>`).join("")}</div></div>` : ""}
      ${s.hora ? `<label class="aw-field">Nombre y apellido<input class="aw-in" data-tn required placeholder="Como figura en tu DNI"></label><label class="aw-field">Teléfono o correo<input class="aw-in" data-tc required></label>
      <label class="aw-field full">Motivo<textarea class="aw-in" rows="3" placeholder="Contanos brevemente tu consulta"></textarea></label>
      <div class="full"><button class="aw-btn" data-turno-ok>${I("check")} Confirmar solicitud</button></div>` : ""}
    </div>`;
  }

  function prevHTML() {
    st.prev = st.prev || { edad: 58, sexo: "M", aportes: 27 };
    return `${h2("Orientación previsional", `<span>${demoTag("Orientativo · no reemplaza a ANSES")}</span>`)}
      <div class="aw-two"><div class="aw-form" data-prev>
        <label class="aw-field">Edad<input class="aw-in" type="number" name="edad" min="18" max="90" value="${st.prev.edad}"></label>
        <label class="aw-field">Régimen de edad<select class="aw-in" name="sexo"><option value="M" ${st.prev.sexo === "M" ? "selected" : ""}>Mujer — 60 años</option><option value="V" ${st.prev.sexo === "V" ? "selected" : ""}>Varón — 65 años</option></select></label>
        <label class="aw-field full">Años de aportes registrados<input class="aw-in" type="number" name="aportes" min="0" max="50" value="${st.prev.aportes}"><small>Se requieren 30 años de servicios con aportes para la jubilación ordinaria.</small></label>
      </div><div class="aw-result" data-prev-out></div></div>
      <div class="aw-cols" style="margin-top:28px"><div>${I("doc")}<b>Historia laboral</b><p>Revisá tus aportes en Mi ANSES antes de la entrevista.</p><a class="aw-link" href="https://www.anses.gob.ar" target="_blank" rel="noopener">anses.gob.ar ${I("externo")}</a></div>
      <div>${I("turnos")}<b>Entrevista de orientación</b><p>Analizamos tu caso con la documentación.</p><button class="aw-link" data-go="tramites/consultas?area=Previsional">Pedir turno ${I("flecha")}</button></div>
      <div>${I("faq")}<b>Dudas frecuentes</b><p>Moratorias, aportes faltantes, plazos.</p><button class="aw-link" data-go="tramites/faq">Ver respuestas ${I("flecha")}</button></div></div>`;
  }
  function paintPrev() {
    const out = view.querySelector("[data-prev-out]"); if (!out) return;
    const s = st.prev, edadReq = s.sexo === "M" ? 60 : 65;
    const fe = Math.max(0, edadReq - s.edad), fa = Math.max(0, 30 - s.aportes);
    const ok = !fe && !fa;
    out.innerHTML = `<span class="k">Resultado orientativo</span><div class="big" style="color:${ok ? "#7fe0a8" : "#fff"}">${ok ? "Reunís los requisitos" : "Todavía no"}</div>
      <dl><dt>Edad requerida</dt><dd>${edadReq} años${fe ? ` · faltan ${fe}` : " ✓"}</dd><dt>Años de aportes</dt><dd>30 años${fa ? ` · faltan ${fa}` : " ✓"}</dd></dl>
      <p>${ok ? "Pedí una entrevista para revisar la documentación e iniciar el trámite ante ANSES." : "Podés pedir una entrevista para evaluar alternativas según tu historia laboral."}</p>`;
  }

  /* ----------------------------- NOVEDADES ----------------------------- */
  P.novedades = (sub) => {
    if (sub) {
      const n = D.noticias.find((x) => x.id === sub) || D.noticias[0];
      return `<article class="aw-art"><div class="aw-crumb"><button data-go="inicio">Inicio</button><span>/</span><button data-go="novedades">Novedades</button><span>/</span><span>${e(n.tipo)}</span></div>
        <span class="aw-kick ${n.tipo === "Comunicados" ? "" : "aw-kick--azul"}"><b>${e(n.tipo)}</b></span>
        <h1>${e(n.titulo)}</h1><p class="bajada">${e(n.bajada)}</p>
        <div class="meta" style="margin-top:20px"><span>${fmtDate(n.fecha)}</span><span>· Prensa ${e(G.sigla)}</span>${demoTag("Nota de ejemplo")}<span class="sp"><button class="aw-btn aw-btn--o aw-btn--s" data-copy>${I("copiar")} Copiar enlace</button></span></div>
        ${F(n.foto, { tone: "azul" })}
        <div class="aw-txt">${n.cuerpo.map((p) => `<p>${e(p)}</p>`).join("")}</div>
        <div style="margin-top:30px;padding-top:16px;border-top:2px solid var(--negro);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><button class="aw-link" data-go="novedades">${I("flechaIzq")} Volver a novedades</button><button class="aw-link" data-go="herramientas/boletin">Recibir el boletín ${I("flecha")}</button></div>
      </article>`;
    }
    return head("Novedades", [["novedades", "Novedades"]], null, true) + `<div class="wrap" style="padding-top:28px;padding-bottom:72px"><div data-nov></div></div>`;
  };
  function paintNov() {
    const box = view.querySelector("[data-nov]"); if (!box) return;
    const tabs = ["Todas", "Noticias", "Comunicados", "Prensa", "Opiniones", "Agenda", "Actividades"];
    const list = D.noticias.filter((n) => st.nov === "Todas" || n.tipo === st.nov);
    const tone = (t) => ({ Prensa: "noche", Actividades: "rojo", Comunicados: "papel", Opiniones: "gris" }[t] || "azul");
    box.innerHTML = `<div class="aw-ntabs">${tabs.map((t) => `<button data-nt="${t}" class="${t === st.nov ? "is-on" : ""}">${t}</button>`).join("")}</div>` +
      (list.length ? `<div class="aw-nlist">${list.map((n) => `<button data-go="novedades/${n.id}">${F(n.foto, { tone: tone(n.tipo) })}<span class="aw-kick"><b>${e(n.tipo)}</b>${fmtDate(n.fecha)}</span><b>${e(n.titulo)}</b><p>${e(n.bajada)}</p></button>`).join("")}</div>`
        : `<div class="aw-empty">No hay publicaciones en esta categoría.</div>`);
  }

  /* ------------------------------ FARMACIAS ------------------------------ */
  P.farmacias = (sub, q) => {
    const today = new Date(); today.setHours(12, 0, 0, 0);
    st.farm = { date: today, zona: "Todas", capa: q.capa === "coseguro" ? "coseguro" : "turno", q: "", sel: null, me: null };
    return head("Farmacias de turno", [["farmacias", "Farmacias de turno"]], null) + `
      <div class="wrap" style="padding-top:24px;padding-bottom:64px">
        <div class="aw-farm__ctl">
          <div class="aw-dates" data-fdates></div>
          <div class="aw-ctlrow">
            <label class="aw-search">${I("buscar")}<input class="aw-in" data-fq placeholder="Buscar por nombre o dirección"></label>
            <div class="aw-seg" data-fzona>${["Todas", ...C.farmacias.zonas].map((z) => `<button data-z="${z}" class="${z === "Todas" ? "is-on" : ""}">${z}</button>`).join("")}</div>
            <div class="aw-seg" data-fcapa><button data-c="turno" class="red ${st.farm.capa === "turno" ? "is-on" : ""}">De turno</button><button data-c="coseguro" class="blue ${st.farm.capa === "coseguro" ? "is-on" : ""}">Adheridas al co-seguro</button></div>
          </div>
        </div>
        <div class="aw-farm"><div class="aw-farm__list" data-flist></div><div class="aw-farm__map"><div data-fmap style="position:absolute;inset:0"></div></div></div>
        <div class="aw-farm__src"><span><b>Fuente:</b> ${e(C.farmacias.fuente)} · <b>Turno:</b> ${e(C.farmacias.horarioTurno)}</span><span class="aw-demo">Datos de ejemplo · no corresponden a turnos reales</span></div>
      </div>`;
  };
  const dayKey = (d) => Math.floor(d.getTime() / 86400000);
  const onDuty = (f, d) => ((dayKey(d) % 7) + 7) % 7 === f.grupo;
  const dist = (a, b) => { const R = 6371, r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r; const x = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  function farmList() {
    const s = st.farm, q = norm(s.q);
    let l = D.farmacias.filter((f) => (s.zona === "Todas" || f.zona === s.zona) && (s.capa === "turno" ? onDuty(f, s.date) : f.coseguro) && (!q || norm(f.nombre + " " + f.dir).includes(q)));
    if (s.me) l = l.map((f) => ({ ...f, km: dist(s.me, f.pos) })).sort((a, b) => a.km - b.km);
    return l;
  }
  function paintFarm(fit = true) {
    const s = st.farm; if (!s) return;
    const dEl = view.querySelector("[data-fdates]"); if (!dEl) return;
    const base = new Date(); base.setHours(12, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
    const isSel = (d) => d.toDateString() === s.date.toDateString();
    const extra = !days.some(isSel);
    dEl.innerHTML = days.map((d, i) => `<button data-d="${d.toISOString()}" class="${isSel(d) ? "is-on" : ""}">${i === 0 ? "Hoy" : d.toLocaleDateString("es-AR", { weekday: "short" })}<b>${d.getDate()}</b>${d.toLocaleDateString("es-AR", { month: "short" })}</button>`).join("") +
      (extra ? `<button class="is-on">${s.date.toLocaleDateString("es-AR", { weekday: "short" })}<b>${s.date.getDate()}</b>${s.date.toLocaleDateString("es-AR", { month: "short" })}</button>` : "") +
      `<label class="cal" title="Elegir otra fecha">${I("calendario")}<input type="date" data-fdate aria-label="Elegir fecha"></label>`;
    dEl.style.opacity = s.capa === "coseguro" ? ".45" : "1";
    const list = farmList();
    const L = view.querySelector("[data-flist]");
    const head = `<div style="padding:12px 16px;border-bottom:1px solid #e3e3e0;display:flex;justify-content:space-between;align-items:center;gap:8px;background:#fafaf8">
      <span style="font-size:13px"><b>${list.length}</b> ${s.capa === "turno" ? `de turno · ${s.date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}` : "adheridas al co-seguro"}</span>
      <button class="aw-link" style="font-size:12.5px" data-fme>${I("pin")} Cerca mío</button></div>`;
    L.innerHTML = head + (list.length ? list.map((f) => `
      <div class="aw-fitem ${s.sel === f.id ? "is-on" : ""}" data-f="${f.id}">
        ${f.km != null ? `<span class="dist">${f.km.toFixed(1)} km</span>` : ""}<b>${e(f.nombre)}</b>
        <div class="m">${e(f.dir)} · ${e(f.zona)}</div><div class="m">${e(f.tel)}</div>
        <div class="bd">${onDuty(f, s.date) ? `<span class="aw-badge aw-badge--rojo">De turno · 8:30 a 8:30</span>` : ""}${f.coseguro ? `<span class="aw-badge aw-badge--azul">Co-seguro</span>` : `<span class="aw-badge" style="color:#9b9ea6">Sin co-seguro</span>`}</div>
        <div class="ac"><a class="aw-btn aw-btn--s" href="https://www.google.com/maps/dir/?api=1&destination=${f.pos[0]},${f.pos[1]}" target="_blank" rel="noopener">${I("pin")} Cómo llegar</a><a class="aw-btn aw-btn--o aw-btn--s" href="tel:${f.tel.replace(/[^0-9]/g, "")}">${I("telefono")} Llamar</a></div>
      </div>`).join("") : `<div class="aw-empty" style="border:0">No hay farmacias para esta búsqueda.</div>`);
    paintMap(list, fit);
  }
  function paintMap(list, fit) {
    const s = st.farm, el = view.querySelector("[data-fmap]");
    if (!el || typeof L === "undefined") return;
    if (!s.map || s.mapEl !== el) {
      s.mapEl = el;
      s.map = L.map(el, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([-34.92, -57.96], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(s.map);
      s.layer = L.layerGroup().addTo(s.map);
      cleanup.push(() => { try { s.map.remove(); } catch (_) {} });
      setTimeout(() => s.map && s.map.invalidateSize(), 60);
    }
    s.layer.clearLayers(); s.markers = {};
    list.forEach((f, i) => {
      const cls = s.sel === f.id ? "aw-mk aw-mk--sel" : s.capa === "coseguro" ? "aw-mk aw-mk--co" : "aw-mk";
      const m = L.marker(f.pos, { icon: L.divIcon({ className: "", html: `<div class="${cls}"><span>${i + 1}</span></div>`, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] }) })
        .bindPopup(`<b>${e(f.nombre)}</b>${e(f.dir)}<br>${e(f.tel)}<br><a href="https://www.google.com/maps/dir/?api=1&destination=${f.pos[0]},${f.pos[1]}" target="_blank" rel="noopener">Cómo llegar →</a>`)
        .on("click", () => { s.sel = f.id; paintFarm(false); })
        .addTo(s.layer);
      s.markers[f.id] = m;
    });
    if (s.me) L.marker(s.me, { icon: L.divIcon({ className: "", html: `<div class="aw-mk aw-mk--me"></div>`, iconSize: [18, 18] }) }).addTo(s.layer);
    if (fit && list.length) s.map.fitBounds(L.latLngBounds(list.map((f) => f.pos).concat(s.me ? [s.me] : [])).pad(0.25), { maxZoom: 15 });
    if (s.sel && s.markers[s.sel]) s.markers[s.sel].openPopup();
  }

  /* ----------------------------- CALENDARIO ----------------------------- */
  P.calendario = () => {
    const t = new Date();
    st.cal = st.cal || { y: t.getFullYear(), m: t.getMonth(), sel: t.getDate(), show: { h: true, e: true, g: true } };
    return head("Calendario hípico", [["calendario", "Calendario hípico"]], null, "Programación de ejemplo") + `<div class="wrap" style="padding-top:28px;padding-bottom:72px"><div data-cal></div></div>`;
  };
  function eventsOn(y, m, d) {
    const C2 = D.calendario, out = [], dow = new Date(y, m, d).getDay();
    if (C2.patron[dow]) out.push({ k: "h", n: C2.patron[dow], t: dow === 4 ? "19:00" : "14:00" });
    C2.especiales.forEach((x) => { if (x.mes === m + 1 && x.dia === d) out.push({ k: "e", n: x.nombre, t: "15:00" }); });
    C2.gremiales.forEach((x) => { if (x.mes === m + 1 && x.dia === d) out.push({ k: "g", n: x.nombre, t: "18:00" }); });
    return out.filter((x) => st.cal.show[x.k]);
  }
  function paintCal() {
    const box = view.querySelector("[data-cal]"); if (!box) return;
    const s = st.cal, first = new Date(s.y, s.m, 1), start = (first.getDay() + 6) % 7, dim = new Date(s.y, s.m + 1, 0).getDate();
    const t = new Date(), cells = [];
    for (let i = 0; i < 42; i++) { const d = i - start + 1; cells.push(d); }
    const rows = Math.ceil((start + dim) / 7) * 7;
    const ttl = first.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const sel = eventsOn(s.y, s.m, s.sel);
    const col = { h: "var(--azul)", e: "var(--rojo)", g: "var(--negro)" };
    box.innerHTML = `<div class="aw-cal"><div>
      <div class="aw-cal__head"><h3>${e(ttl)}</h3><button class="nav" data-cm="-1" aria-label="Mes anterior">${I("flechaIzq")}</button><button class="nav" data-cm="1" aria-label="Mes siguiente">${I("flecha")}</button></div>
      <div class="aw-legend">${[["h", "Reuniones hípicas"], ["e", "Reuniones especiales"], ["g", "Agenda gremial"]].map(([k, l]) => `<button data-ck="${k}" class="${s.show[k] ? "" : "off"}"><i style="background:${col[k]}"></i>${l}</button>`).join("")}</div>
      <div class="aw-cal__grid">${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => `<div class="dn">${d}</div>`).join("")}
      ${cells.slice(0, rows).map((d) => { if (d < 1 || d > dim) return `<button class="out" disabled></button>`; const ev = eventsOn(s.y, s.m, d); const today = d === t.getDate() && s.m === t.getMonth() && s.y === t.getFullYear();
        return `<button data-cd="${d}" class="${today ? "today" : ""} ${d === s.sel ? "is-on" : ""}"><b>${d}</b>${ev.map((x) => `<span class="aw-ev aw-ev--${x.k}">${e(x.n)}</span>`).join("")}</button>`; }).join("")}</div></div>
      <aside class="aw-cal__side"><h4>${new Date(s.y, s.m, s.sel).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</h4>
        <ul>${sel.length ? sel.map((x) => `<li><i style="background:${col[x.k]}"></i><div><b>${e(x.n)}</b><small>${x.t} h · ${x.k === "g" ? "Sede ABER" : "Hipódromo de La Plata"}</small></div></li>`).join("") : `<li><i></i><div><small>Sin actividades este día.</small></div></li>`}</ul>
        <div style="margin-top:16px">${demoTag("Programación de ejemplo")}</div>
        <p style="margin-top:12px;font-size:13px;color:#6b6e76">La programación oficial de reuniones la define el Hipódromo. El calendario se actualiza con cada publicación.</p></aside></div>`;
  }

  /* ---------------------------- HERRAMIENTAS ---------------------------- */
  P.herramientas = (sub) => {
    if (!sub) return head("Herramientas", [["herramientas", "Herramientas"]], null) + `<div class="wrap" style="padding-top:28px;padding-bottom:72px">
      <div class="aw-tlist">${TOOLS.map(([r, ic, n, d], i) => `<button data-go="${r}"><i>${String(i + 1).padStart(2, "0")}</i>${I(ic)}<div><b>${e(n)}</b><small>${e(d)}</small></div><span class="go"><span>Abrir</span> ${I("flecha")}</span></button>`).join("")}</div></div>`;
    const crumbs = [["herramientas", "Herramientas"]];
    if (sub === "boletin") return head("Boletín institucional", crumbs, null) + `<div class="wrap aw-two" style="padding-top:32px;padding-bottom:72px">
      <div>${h2("Suscripción")}<div data-bol><form class="aw-form" data-bol-form>
        <label class="aw-field full">Correo electrónico<input class="aw-in" type="email" required placeholder="nombre@correo.com"></label>
        <div class="aw-field full">Temas<div class="aw-chips" style="margin-top:4px">${["Comunicados", "Paritarias", "Beneficios", "Agenda"].map((t) => `<label class="aw-chip"><input type="checkbox" checked style="accent-color:var(--azul);margin-right:6px">${t}</label>`).join("")}</div></div>
        <div class="full"><button class="aw-btn" type="submit">${I("boletin")} Suscribirme</button> <span class="aw-demo" style="margin-left:6px">Demostración</span></div></form></div></div>
      <div>${h2("Ediciones anteriores", `<span>${demoTag()}</span>`)}<div class="aw-rows" style="border-top:0">${D.boletines.map((b) => `<div class="aw-row"><div><div class="aw-row__t">Boletín Nº ${b.num} · ${e(b.mes)}</div><div class="aw-row__m">${b.temas.map(e).join(" · ")}</div></div><button class="aw-btn aw-btn--o aw-btn--s" data-view-doc="d8">${I("ver")} Leer</button></div>`).join("")}</div></div></div>`;
    if (sub === "becas") return head("Becas y capacitaciones", crumbs, null, true) + `<div class="wrap" style="padding-top:32px;padding-bottom:72px">
      <table class="aw-table"><thead><tr><th>Propuesta</th><th>Modalidad</th><th>Inicio</th><th class="n">Cupo</th><th></th></tr></thead><tbody>
      ${D.becas.map((b, i) => `<tr><td><b>${e(b.nombre)}</b></td><td>${e(b.modalidad)}</td><td>${e(b.inicio)}</td><td class="n">${b.cupo}</td><td style="text-align:right"><button class="aw-btn aw-btn--s" data-insc="${i}">Inscribirme</button></td></tr>`).join("")}</tbody></table></div>`;
    if (sub === "bolsa") return head("Bolsa de trabajo eventual", crumbs, "Registro de disponibilidad para reuniones especiales y convocatorias eventuales.", "Demostración · no envía datos") + `<div class="wrap aw-two" style="padding-top:32px;padding-bottom:72px">
      <div>${h2("Registrarme")}<div data-bolsa><form class="aw-form" data-bolsa-form>
        <label class="aw-field">Nombre y apellido<input class="aw-in" required></label><label class="aw-field">Teléfono<input class="aw-in" required></label>
        <div class="aw-field full">Tareas<div class="aw-chips" style="margin-top:4px">${["Ventanilla", "Control de acceso", "Atención al público", "Servicios generales"].map((t) => `<label class="aw-chip"><input type="checkbox" style="accent-color:var(--azul);margin-right:6px">${t}</label>`).join("")}</div></div>
        <div class="aw-field full">Disponibilidad<div class="aw-chips" style="margin-top:4px">${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((t) => `<label class="aw-chip"><input type="checkbox" style="accent-color:var(--azul);margin-right:6px">${t}</label>`).join("")}</div></div>
        <div class="full"><button class="aw-btn" type="submit">${I("check")} Enviar registro</button></div></form></div></div>
      <div>${h2("Convocatorias abiertas")}<div class="aw-rows" style="border-top:0">${D.vacantes.filter((v) => v.tipo === "Eventual").map((v) => `<div class="aw-row"><div><div class="aw-row__t">${e(v.puesto)}</div><div class="aw-row__m">Cierra ${fmtDate(v.cierre)}</div></div><span class="aw-badge aw-badge--azul">Eventual</span></div>`).join("")}</div></div></div>`;
    if (sub === "acompanamiento") return head("Canales de acompañamiento", crumbs, "Orientación especializada para afiliados y familias.", "Canales a confirmar") + `<div class="wrap" style="padding-top:32px;padding-bottom:72px">
      <div class="aw-cols">
        <div>${I("legal")}<b>Orientación legal</b><p>Conflictos laborales, sanciones, despidos.</p><button class="aw-link" data-go="tramites/consultas?area=Legal">Pedir turno ${I("flecha")}</button></div>
        <div>${I("calculadora")}<b>Orientación contable</b><p>Recibos, liquidaciones, impuestos.</p><button class="aw-link" data-go="tramites/consultas?area=Contable">Pedir turno ${I("flecha")}</button></div>
        <div>${I("previsional")}<b>Orientación previsional</b><p>Requisitos, aportes, jubilación.</p><button class="aw-link" data-go="tramites/previsional">Orientador ${I("flecha")}</button></div>
        <div>${I("acompanamiento")}<b>Escucha y derivación</b><p>Situaciones personales o familiares que requieren acompañamiento.</p><button class="aw-link" data-go="tramites/consultas?area=Gremial">Contactar ${I("flecha")}</button></div>
        <div>${I("chat")}<b>WhatsApp institucional</b><p>Consultas rápidas y derivaciones.</p><span class="aw-tbc">Número a confirmar</span></div>
        <div>${I("edificio")}<b>Atención en sede</b><p>Atención presencial con turno o por orden de llegada.</p><button class="aw-link" data-go="gremio/sedes">Sede y horarios ${I("flecha")}</button></div>
      </div></div>`;
    return P.herramientas();
  };

  /* =============================== ROUTER =============================== */
  function parse(r) {
    const [path, qs = ""] = String(r || "inicio").split("?");
    const [sec, sub] = path.split("/");
    const q = Object.fromEntries(new URLSearchParams(qs));
    return { path, sec: P[sec] ? sec : "inicio", sub, q, raw: r };
  }
  function render(r) {
    cleanup.forEach((f) => f()); cleanup = [];
    if (st.farm) st.farm.map = null;
    const R = parse(r);
    view.innerHTML = P[R.sec](R.sub, R.q);
    root.scrollTop = 0;
    root.querySelector("[data-mnav]").classList.remove("is-open");
    root.querySelectorAll(".aw-nav [data-go]").forEach((b) => b.classList.toggle("is-on", b.dataset.go === R.sec));
    // pintar herramientas
    paintBenefits(); paintFaq(); paintCalc(); paintPrev(); paintNov(); paintCal(); paintTurno();
    if (R.sec === "farmacias") paintFarm(true);
    opts.onRoute && opts.onRoute(R.raw, api);
  }
  function go(r, push = true) {
    if (push) { hist = hist.slice(0, hi + 1); hist.push(r); hi = hist.length - 1; }
    render(r);
  }

  /* =============================== EVENTOS =============================== */
  root.addEventListener("click", (ev) => {
    const t = ev.target;
    const g = t.closest("[data-go]");
    if (g && root.contains(g)) { ev.preventDefault(); return go(g.dataset.go); }
    if (t.closest("[data-burger]")) return root.querySelector("[data-mnav]").classList.toggle("is-open");
    const dl = t.closest("[data-dl]"); if (dl) return download(D.documentos.find((d) => d.id === dl.dataset.dl));
    const vd = t.closest("[data-view-doc]"); if (vd) { const d = D.documentos.find((x) => x.id === vd.dataset.viewDoc); return modal(d.titulo, docSheet(d)); }
    // beneficios
    const bc = t.closest("[data-cat]"); if (bc) { st.ben.cat = bc.dataset.cat; view.querySelectorAll("[data-cat]").forEach((b) => b.classList.toggle("is-on", b === bc)); return paintBenefits(); }
    const bo = t.closest("[data-ben-open]"); if (bo) { st.ben.open = st.ben.open === bo.dataset.benOpen ? null : bo.dataset.benOpen; return paintBenefits(); }
    // faq
    const fc = t.closest("[data-fcat]"); if (fc) { st.faq.cat = fc.dataset.fcat; view.querySelectorAll("[data-fcat]").forEach((b) => b.classList.toggle("is-on", b === fc)); return paintFaq(); }
    // afiliación
    const af = t.closest("[data-afi]"); if (af) { st.afi.i = +af.dataset.afi; view.querySelector(".aw-body").innerHTML = afiHTML(); return; }
    // turnos
    const ta = t.closest("[data-area]"); if (ta) { st.turno.area = ta.dataset.area; return paintTurno(); }
    const td = t.closest("[data-dia]"); if (td) { st.turno.dia = new Date(td.dataset.dia); st.turno.hora = null; return paintTurno(); }
    const th = t.closest("[data-hora]"); if (th) { st.turno.hora = th.dataset.hora; paintTurno(); view.querySelector("[data-tn]")?.focus(); return; }
    if (t.closest("[data-turno-ok]")) { const n = view.querySelector("[data-tn]"), c = view.querySelector("[data-tc]"); if (!n.value.trim() || !c.value.trim()) { (n.value.trim() ? c : n).reportValidity(); return; } st.turno.done = true; return paintTurno(); }
    if (t.closest("[data-turno-reset]")) { st.turno = { area: st.turno.area, dia: null, hora: null, done: false }; return paintTurno(); }
    // novedades
    const nt = t.closest("[data-nt]"); if (nt) { st.nov = nt.dataset.nt; return paintNov(); }
    if (t.closest("[data-copy]")) { const u = `https://${G.dominio}/${hist[hi]}`; navigator.clipboard?.writeText(u).catch(() => {}); return toast("Enlace copiado: " + u); }
    // calendario
    const cm = t.closest("[data-cm]"); if (cm) { const d = new Date(st.cal.y, st.cal.m + +cm.dataset.cm, 1); st.cal.y = d.getFullYear(); st.cal.m = d.getMonth(); st.cal.sel = 1; return paintCal(); }
    const cd = t.closest("[data-cd]"); if (cd) { st.cal.sel = +cd.dataset.cd; return paintCal(); }
    const ck = t.closest("[data-ck]"); if (ck) { st.cal.show[ck.dataset.ck] = !st.cal.show[ck.dataset.ck]; return paintCal(); }
    // farmacias
    const fd = t.closest("[data-d]"); if (fd && st.farm) { st.farm.date = new Date(fd.dataset.d); st.farm.sel = null; if (st.farm.capa !== "turno") { st.farm.capa = "turno"; syncSeg(); } return paintFarm(true); }
    const fz = t.closest("[data-z]"); if (fz) { st.farm.zona = fz.dataset.z; st.farm.sel = null; view.querySelectorAll("[data-z]").forEach((b) => b.classList.toggle("is-on", b === fz)); return paintFarm(true); }
    const fcp = t.closest("[data-c]"); if (fcp) { st.farm.capa = fcp.dataset.c; st.farm.sel = null; syncSeg(); return paintFarm(true); }
    if (t.closest("[data-fme]")) {
      const use = (p) => { st.farm.me = p; paintFarm(true); };
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition((p) => use([p.coords.latitude, p.coords.longitude]), () => { use([-34.9214, -57.9545]); toast("Sin permiso de ubicación: se usa Plaza Moreno como referencia"); }, { timeout: 6000 });
      else use([-34.9214, -57.9545]);
      return;
    }
    const fi = t.closest("[data-f]"); if (fi && !t.closest("a")) { st.farm.sel = fi.dataset.f; paintFarm(false); const f = D.farmacias.find((x) => x.id === fi.dataset.f); st.farm.map && st.farm.map.setView(f.pos, 15, { animate: true }); return; }
    // becas
    const ins = t.closest("[data-insc]"); if (ins) { ins.outerHTML = `<span class="aw-badge aw-badge--verde">${I("check")} Pre-inscripción registrada</span>`; return toast("Pre-inscripción de demostración registrada"); }
  });
  function syncSeg() { view.querySelectorAll("[data-c]").forEach((b) => b.classList.toggle("is-on", b.dataset.c === st.farm.capa)); }

  root.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.matches("[data-ben-q]")) { st.ben.q = t.value; paintBenefits(); }
    if (t.matches("[data-faq-q]")) { st.faq.q = t.value; paintFaq(); }
    if (t.matches("[data-fq]")) { st.farm.q = t.value; paintFarm(true); }
    if (t.closest("[data-calc]")) { const f = t.closest("[data-calc]"); st.calc = { cat: +f.cat.value, ant: Math.max(0, +f.ant.value || 0), pct: Math.max(0, +f.pct.value || 0) }; paintCalc(); }
    if (t.closest("[data-prev]")) { const f = t.closest("[data-prev]"); st.prev = { edad: +f.edad.value || 0, sexo: f.sexo.value, aportes: +f.aportes.value || 0 }; paintPrev(); }
  });
  root.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.matches("[data-ben-z]")) { st.ben.zona = t.value; paintBenefits(); }
    if (t.matches("[data-chk]")) { st.afi.chk[t.dataset.chk] = t.checked; view.querySelector(".aw-body").innerHTML = afiHTML(); }
    if (t.matches("[data-fdate]") && t.value) { st.farm.date = new Date(t.value + "T12:00:00"); st.farm.sel = null; st.farm.capa = "turno"; syncSeg(); paintFarm(true); }
    if (t.matches("[data-calc] select")) { st.calc.cat = +t.value; paintCalc(); }
    if (t.matches("[data-prev] select")) { st.prev.sexo = t.value; paintPrev(); }
  });
  root.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.matches("[data-bol-form]")) f.parentElement.innerHTML = `<div class="aw-ok">${I("check")}<div><b>Suscripción registrada (demostración)</b><p>En el sitio publicado se envía un correo de confirmación.</p></div></div>`;
    if (f.matches("[data-bolsa-form]")) f.parentElement.innerHTML = `<div class="aw-ok">${I("check")}<div><b>Registro recibido (demostración)</b><p>En el sitio publicado, el área gremial contacta a las personas registradas según cada convocatoria.</p></div></div>`;
  });

  const api = {
    go, route: () => hist[hi],
    back() { if (hi > 0) { hi--; render(hist[hi]); } },
    forward() { if (hi < hist.length - 1) { hi++; render(hist[hi]); } },
    canBack: () => hi > 0, canForward: () => hi < hist.length - 1,
    refresh() { if (st.farm && st.farm.map) { st.farm.map.invalidateSize(); } },
  };
  go(opts.start || "inicio");
  return api;
};

/* Marco de navegador con barra de dirección y historial funcional. */
ABER.browserFrame = function (el, { domain, start, tag, factory }) {
  const I = ABER.icon;
  el.innerHTML = `<div class="browser">
    <div class="browser__bar"><div class="browser__dots"><i></i><i></i><i></i></div>
      <div class="browser__hist"><button data-b aria-label="Atrás">${I("flechaIzq")}</button><button data-f aria-label="Adelante">${I("flecha")}</button></div>
      <div class="browser__url"><svg class="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><span data-url></span></div>
      <span class="browser__tag">${tag || "Prototipo · contenido de ejemplo"}</span></div>
    <div class="browser__view"><div data-site></div></div></div>`;
  const url = el.querySelector("[data-url]"), b = el.querySelector("[data-b]"), f = el.querySelector("[data-f]");
  const site = factory(el.querySelector("[data-site]"), {
    start,
    onRoute(r, api) {
      url.innerHTML = `<b>${domain}</b>${r === "inicio" ? "" : "/" + ABER.esc(r)}`;
      b.disabled = !api.canBack(); f.disabled = !api.canForward();
    },
  });
  b.onclick = () => site.back(); f.onclick = () => site.forward();
  return site;
};
