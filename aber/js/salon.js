/* ==========================================================================
   SALÓN LOZANO — sitio prototipo, perfil de Instagram y producción fotográfica
   ========================================================================== */
window.ABER = window.ABER || {};

ABER.createSalon = function (root, opts = {}) {
  const I = ABER.icon, e = ABER.esc, F = ABER.media.foto, S = ABER.config.salon;
  const mark = (small) => `<span class="sl-mark">${ABER.salonLogo}${small ? "<small>La Plata</small>" : ""}</span>`;
  const tbc = (v, t = "A confirmar") => (v ? e(v) : `<span class="sl-tbc">${t}</span>`);
  const wa = (txt) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(txt)}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.direccion + ", " + S.ciudad + ", Buenos Aires")}`;
  const NAV = [["inicio", "Inicio"], ["colonial", "Salón Colonial"], ["primavera", "Salón Primavera"], ["servicios", "Servicios"], ["galeria", "Galería"], ["ubicacion", "Ubicación"]];
  const ROOMS = {
    colonial: { n: "Salón Colonial", foto: "colonial", tone: "calido", lead: "Arcos, molduras y una luz cálida para celebraciones con carácter.", tipos: ["Casamientos", "Aniversarios", "Cenas formales"] },
    primavera: { n: "Salón Primavera", foto: "primavera", tone: "salvia", lead: "Ventanales, verde y luz natural para encuentros de día y de noche.", tipos: ["Cumpleaños", "15 años", "Eventos empresariales"] },
  };
  let hist = [], hi = -1, map = null, q = { tipo: null, salon: null, invitados: "", fecha: "", nombre: "", tel: "", msg: "" }, gal = "Todos";

  root.classList.add("site", "sl");
  root.innerHTML = `
    <header class="sl-top"><div class="wrap">
      <span data-go="inicio" style="cursor:pointer">${mark(false)}</span>
      <nav class="sl-nav">${NAV.slice(1).map(([r, l]) => `<button data-go="${r}">${l}</button>`).join("")}</nav>
      <button class="sl-cta" data-go="presupuesto">Pedir presupuesto</button>
      <button class="sl-burger" data-burger aria-label="Menú">${I("menu")}</button>
    </div><nav class="sl-mnav" data-mnav>${NAV.map(([r, l]) => `<button data-go="${r}">${l}</button>`).join("")}<button data-go="presupuesto">Pedir presupuesto</button></nav></header>
    <main data-view></main>
    <footer class="sl-foot"><div class="wrap">
      <div>${mark(true)}<p style="margin-top:14px">${e(S.espacios.join(" · "))}</p></div>
      <div><h4>Contacto</h4><p>${e(S.direccion)}, ${e(S.ciudad)}</p><a href="tel:+54221${S.telefono.replace(/\D/g, "").slice(-7)}">Tel. ${e(S.telefono)}</a><a href="${wa("Hola, quiero consultar por el salón.")}" target="_blank" rel="noopener">WhatsApp ${e(S.celular)}</a></div>
      <div><h4>Salón</h4><button data-go="colonial">Salón Colonial</button><button data-go="primavera">Salón Primavera</button><button data-go="galeria">Galería</button><a href="https://www.instagram.com/${S.instagram}/" target="_blank" rel="noopener">Instagram @${e(S.instagram)}</a></div>
      <div class="sl-foot__end"><span>${e(S.sitio)}</span><span>Prototipo · imágenes ilustrativas</span></div>
    </div></footer>`;
  const view = root.querySelector("[data-view]");

  const P = {};
  P.inicio = () => `
    <section class="sl-hero">${F("fachada", { tone: "calido", tag: "Imagen ilustrativa · reemplazar por foto de producción" })}
      <div class="sl-hero__in"><div class="wrap"><span class="sl-eyebrow">Salón de eventos · La Plata</span>${mark(false)}
        <p>Dos salones para celebrar: Salón Colonial y Salón Primavera.</p>
        <div class="sl-hero__row"><button class="sl-cta sl-cta--w" data-go="presupuesto">Pedir presupuesto</button><a class="sl-cta sl-cta--o" style="color:var(--crema)!important;border-color:var(--crema)" href="${wa("Hola, quiero coordinar una visita al salón.")}" target="_blank" rel="noopener">${I("chat")} Coordinar una visita</a></div></div></div></section>
    <section class="sl-sec"><div class="wrap">
      <div class="sl-h"><div><span class="sl-eyebrow">Los espacios</span></div><button class="sl-cta sl-cta--o" data-go="galeria">Ver galería</button></div>
      <div class="sl-rooms">${Object.entries(ROOMS).map(([k, r]) => `
        <article class="sl-room" data-go="${k}"><div class="sl-room__img">${F(r.foto, { tone: r.tone })}</div><h3>${e(r.n)}</h3><p>${e(r.lead)}</p>
        <dl><dt>Capacidad</dt><dd>${tbc(S.capacidades[k])}</dd><dt>Ideal para</dt><dd>${r.tipos.map(e).join(" · ")}</dd></dl></article>`).join("")}</div>
    </div></section>
    <section class="sl-sec sl-sec--dark"><div class="wrap">
      <div class="sl-h"><div><span class="sl-eyebrow">Servicios</span><h2>Lo que incluye <i>cada evento</i></h2></div><span class="sl-tbc">Servicios a confirmar con el salón</span></div>
      ${servicesHTML()}</div></section>
    <section class="sl-sec"><div class="wrap">${locHTML()}</div></section>`;

  function servicesHTML() {
    return `<div class="sl-serv">${[["mesa", "Mobiliario", "Mesas, sillas y mantelería para cada formato."], ["estrella", "Ambientación", "Iluminación y armado según el tipo de evento."], ["copa", "Gastronomía", "Opciones de catering propias o de terceros."], ["megafono", "Sonido", "Equipamiento para música y presentaciones."], ["usuario", "Coordinación", "Acompañamiento el día del evento."], ["calendario", "Visitas", "Presupuestos con entrevista previa."]]
      .map(([ic, b, p]) => `<div>${I(ic === "mesa" ? "edificio" : ic)}<b>${b}</b><p>${p}</p></div>`).join("")}</div>`;
  }
  function locHTML() {
    return `<div class="sl-h"><div><span class="sl-eyebrow">Ubicación</span><h2>Cómo <i>llegar</i></h2></div></div>
      <div class="sl-loc"><div class="sl-loc__info"><div class="addr">${e(S.direccion)}<br><span style="font-size:.6em;color:var(--sepia)">${e(S.ciudad)}, Buenos Aires</span></div>
        <dl><dt>Teléfono</dt><dd><a href="tel:+54221${S.telefono.replace(/\D/g, "").slice(-7)}">${e(S.telefono)}</a></dd><dt>Celular</dt><dd>${e(S.celular)}</dd><dt>Visitas</dt><dd>${e(S.presupuestos)}</dd><dt>Horarios</dt><dd>${tbc(null)}</dd></dl>
        <div class="sl-btns"><a class="sl-cta" href="${maps}" target="_blank" rel="noopener">${I("pin")} Abrir en Google Maps</a><a class="sl-cta sl-cta--o" href="${wa("Hola, quiero consultar por el salón.")}" target="_blank" rel="noopener">${I("chat")} WhatsApp</a></div>
        <small style="color:var(--sepia);font-size:12px">Marcador en el mapa: ubicación aproximada.</small></div>
      <div class="sl-loc__map"><div data-slmap></div></div></div>`;
  }

  const roomPage = (k) => {
    const r = ROOMS[k], o = k === "colonial" ? "primavera" : "colonial";
    const shots = [[r.foto, r.tone, "Plano general"], ["mesa", r.tone, "Montaje de mesas"], ["evento", r.tone, "Evento realizado"]];
    return `<div class="wrap sl-room-page"><div><div data-main>${F(shots[0][0], { tone: shots[0][1], tag: "Imagen ilustrativa · " + shots[0][2] })}</div>
      <div class="sl-thumbs">${shots.map(([f, t, c], i) => `<button data-shot="${i}" class="${i === 0 ? "is-on" : ""}" data-f="${f}" data-t="${t}" data-c="${e(c)}" aria-label="${e(c)}">${F(f, { tone: t, tag: false })}</button>`).join("")}</div></div>
      <div><div class="sl-switch">${Object.entries(ROOMS).map(([kk, rr]) => `<button data-go="${kk}" class="${kk === k ? "is-on" : ""}">${e(rr.n)}</button>`).join("")}</div>
        <span class="sl-eyebrow">El espacio</span><h1>${e(r.n)}</h1><p class="lead">${e(r.lead)}</p>
        <ul class="sl-feat"><li>${I("usuario")}<span>Capacidad: ${tbc(S.capacidades[k])}</span></li><li>${I("estrella")}<span>Ideal para ${r.tipos.map(e).join(", ").toLowerCase()}</span></li><li>${I("calendario")}<span>Presupuestos ${e(S.presupuestos.toLowerCase())}</span></li><li>${I("pin")}<span>${e(S.direccion)}, ${e(S.ciudad)}</span></li></ul>
        <div class="sl-btns"><button class="sl-cta" data-go="presupuesto?salon=${k}">Pedir presupuesto</button><button class="sl-cta sl-cta--o" data-go="${o}">Ver ${e(ROOMS[o].n)}</button></div></div></div>`;
  };
  P.colonial = () => roomPage("colonial");
  P.primavera = () => roomPage("primavera");
  P.servicios = () => `<section class="sl-sec sl-sec--dark"><div class="wrap"><div class="sl-h"><div><span class="sl-eyebrow">Servicios</span><h2>Servicios <i>disponibles</i></h2></div><span class="sl-tbc">A confirmar con el salón</span></div>${servicesHTML()}
    <div style="margin-top:30px"><button class="sl-cta sl-cta--w" data-go="presupuesto">Pedir presupuesto</button></div></div></section>`;

  const GAL = [["evento", "calido", "Casamientos", "w h"], ["colonial", "calido", "Casamientos", ""], ["primavera", "salvia", "15 años", ""], ["mesa", "calido", "Empresariales", "w"], ["evento", "salvia", "15 años", "h"], ["primavera", "salvia", "Cumpleaños", ""], ["colonial", "noche", "Empresariales", ""], ["mesa", "salvia", "Cumpleaños", "w"]];
  P.galeria = () => `<section class="sl-sec"><div class="wrap"><div class="sl-h"><div><span class="sl-eyebrow">Eventos realizados</span><h2>Galería</h2></div><span class="sl-tbc">Se completa con fotos reales del archivo del salón</span></div>
    <div class="sl-gal-f">${["Todos", "Casamientos", "15 años", "Cumpleaños", "Empresariales"].map((t) => `<button data-gf="${t}" class="${t === gal ? "is-on" : ""}">${t}</button>`).join("")}</div>
    <div class="sl-gal" data-gal></div></div></section>`;
  function paintGal() {
    const g = view.querySelector("[data-gal]"); if (!g) return;
    const list = GAL.filter((x) => gal === "Todos" || x[2] === gal);
    g.innerHTML = list.map(([f, t, c, cls], i) => `<button class="${gal === "Todos" ? cls : ""}" data-lb="${f}|${t}|${e(c)}">${F(f, { tone: t, tag: false })}<span class="cap">${e(c)}</span></button>`).join("");
  }
  P.ubicacion = () => `<section class="sl-sec"><div class="wrap">${locHTML()}</div></section>`;

  P.presupuesto = (qs) => {
    if (qs.salon) q.salon = ROOMS[qs.salon] ? ROOMS[qs.salon].n : q.salon;
    return `<section class="sl-sec"><div class="wrap"><div class="sl-h"><div><span class="sl-eyebrow">Consultas y presupuestos</span><h2>Contanos <i>tu evento</i></h2></div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:40px;align-items:start">
      <form class="sl-form" data-qform>
        <div class="sl-field full">Tipo de evento<div class="sl-opts" style="margin-top:6px">${["Casamiento", "15 años", "Cumpleaños", "Empresarial", "Otro"].map((t) => `<button type="button" data-qt="${t}" class="${q.tipo === t ? "is-on" : ""}">${t}</button>`).join("")}</div></div>
        <div class="sl-field full">Salón<div class="sl-opts" style="margin-top:6px">${[...S.espacios, "Sin preferencia"].map((t) => `<button type="button" data-qs="${e(t)}" class="${q.salon === t ? "is-on" : ""}">${e(t)}</button>`).join("")}</div></div>
        <label class="sl-field">Fecha tentativa<input class="sl-in" type="date" name="fecha" value="${e(q.fecha)}"></label>
        <label class="sl-field">Invitados (aprox.)<input class="sl-in" type="number" min="1" name="invitados" value="${e(q.invitados)}" placeholder="Ej. 120"></label>
        <label class="sl-field">Nombre<input class="sl-in" name="nombre" required value="${e(q.nombre)}"></label>
        <label class="sl-field">Teléfono<input class="sl-in" name="tel" required value="${e(q.tel)}"></label>
        <label class="sl-field full">Mensaje<textarea class="sl-in" name="msg" rows="3" placeholder="Horario, servicios que te interesan, consultas">${e(q.msg)}</textarea></label>
        <div class="full"><button class="sl-cta" type="submit">${I("check")} Preparar consulta</button></div>
      </form>
      <aside data-qsum></aside></div></div></section>`;
  };
  function paintSum(ready) {
    const box = view.querySelector("[data-qsum]"); if (!box) return;
    const msg = `Hola, quiero pedir un presupuesto en ${S.nombre}.\nEvento: ${q.tipo || "-"}\nSalón: ${q.salon || "-"}\nFecha: ${q.fecha || "-"}\nInvitados: ${q.invitados || "-"}\nNombre: ${q.nombre || "-"}\nTeléfono: ${q.tel || "-"}${q.msg ? "\n" + q.msg : ""}`;
    box.innerHTML = `<div class="sl-sum"><h3>${ready ? "Tu consulta está lista" : "Resumen"}</h3>
      <dl><dt>Evento</dt><dd>${e(q.tipo || "—")}</dd><dt>Salón</dt><dd>${e(q.salon || "—")}</dd><dt>Fecha</dt><dd>${e(q.fecha || "—")}</dd><dt>Invitados</dt><dd>${e(q.invitados || "—")}</dd><dt>Contacto</dt><dd>${e(q.nombre || "—")} ${q.tel ? "· " + e(q.tel) : ""}</dd></dl>
      ${ready ? `<a class="sl-cta sl-cta--w" href="${wa(msg)}" target="_blank" rel="noopener">${I("chat")} Enviar por WhatsApp</a><p class="sl-note">Se abre WhatsApp con el mensaje armado para el número del salón (${e(S.celular)}). El formulario del prototipo no guarda datos.</p>` : `<p class="sl-note">${e(S.presupuestos)}. Completá el formulario y enviá la consulta por WhatsApp.</p>`}</div>`;
  }

  /* Router */
  function render(r) {
    if (map) { try { map.remove(); } catch (_) {} map = null; }
    const [path, qs = ""] = String(r).split("?");
    const key = P[path] ? path : "inicio";
    view.innerHTML = P[key](Object.fromEntries(new URLSearchParams(qs)));
    root.scrollTop = 0;
    root.querySelector("[data-mnav]").classList.remove("is-open");
    root.querySelectorAll(".sl-nav [data-go]").forEach((b) => b.classList.toggle("is-on", b.dataset.go === key));
    paintGal(); paintSum(false); paintMap();
    opts.onRoute && opts.onRoute(key === "inicio" ? "inicio" : r, api);
  }
  function paintMap() {
    const el = view.querySelector("[data-slmap]"); if (!el || typeof L === "undefined") return;
    map = L.map(el, { scrollWheelZoom: false }).setView(S.coords, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
    L.marker(S.coords, { icon: L.divIcon({ className: "", html: `<div class="sl-pin"></div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map).bindPopup(`<b>${e(S.nombre)}</b>${e(S.direccion)}, ${e(S.ciudad)}<br><small>Ubicación aproximada</small>`);
    setTimeout(() => map && map.invalidateSize(), 80);
  }
  function go(r, push = true) { if (push) { hist = hist.slice(0, hi + 1); hist.push(r); hi = hist.length - 1; } render(r); }

  root.addEventListener("click", (ev) => {
    const t = ev.target;
    const g = t.closest("[data-go]"); if (g) { ev.preventDefault(); return go(g.dataset.go); }
    if (t.closest("[data-burger]")) return root.querySelector("[data-mnav]").classList.toggle("is-open");
    const sh = t.closest("[data-shot]"); if (sh) { view.querySelector("[data-main]").innerHTML = F(sh.dataset.f, { tone: sh.dataset.t, tag: "Imagen ilustrativa · " + sh.dataset.c }); view.querySelectorAll("[data-shot]").forEach((b) => b.classList.toggle("is-on", b === sh)); return; }
    const gf = t.closest("[data-gf]"); if (gf) { gal = gf.dataset.gf; view.querySelectorAll("[data-gf]").forEach((b) => b.classList.toggle("is-on", b === gf)); return paintGal(); }
    const lb = t.closest("[data-lb]"); if (lb) { const [f, tn, c] = lb.dataset.lb.split("|"); const d = document.createElement("div"); d.className = "sl-lb"; d.innerHTML = `${F(f, { tone: tn, tag: "Imagen ilustrativa" })}<button aria-label="Cerrar">${I("cerrar")}</button><p>${c} · Foto del archivo del salón</p>`; d.onclick = (x) => { if (x.target === d || x.target.closest("button")) d.remove(); }; document.body.appendChild(d); return; }
    const qt = t.closest("[data-qt]"); if (qt) { q.tipo = qt.dataset.qt; view.querySelectorAll("[data-qt]").forEach((b) => b.classList.toggle("is-on", b === qt)); return paintSum(false); }
    const qsb = t.closest("[data-qs]"); if (qsb) { q.salon = qsb.dataset.qs; view.querySelectorAll("[data-qs]").forEach((b) => b.classList.toggle("is-on", b === qsb)); return paintSum(false); }
  });
  root.addEventListener("input", (ev) => { const f = ev.target.closest("[data-qform]"); if (f && ev.target.name) { q[ev.target.name] = ev.target.value; paintSum(false); } });
  root.addEventListener("submit", (ev) => { ev.preventDefault(); if (ev.target.matches("[data-qform]")) paintSum(true); });

  const api = { go, back() { if (hi > 0) { hi--; render(hist[hi]); } }, forward() { if (hi < hist.length - 1) { hi++; render(hist[hi]); } }, canBack: () => hi > 0, canForward: () => hi < hist.length - 1, refresh() { map && map.invalidateSize(); } };
  go(opts.start || "inicio");
  return api;
};

/* Posts 4:5 del salón */
ABER.salonPost = function (p) {
  const F = ABER.media.foto, e = ABER.esc;
  if (p.img) return `<article class="spost spost--img"><img src="${e(p.img)}" alt="${e(p.titulo || "")}" loading="lazy"><i class="safe"></i></article>`;
  const m = `<span class="spost__m">${ABER.salonLogo}</span>`;
  if (p.tpl === "type") return `<article class="spost spost--type"><div class="in"><span class="sl-eyebrow" style="font-size:2.6cqw;color:#a5844f">${e(p.kick)}</span><b>${p.titulo}</b><div class="rule"></div><p>${e(p.texto)}</p><div class="ft" style="margin-top:6cqw"><span><i style="font-family:var(--f-salon);font-size:4cqw;letter-spacing:0;text-transform:none">Salón</i> <span style="font-family:var(--f-salon);font-size:4cqw;letter-spacing:0;text-transform:none">Lozano</span></span><span>La Plata</span></div></div></article>`;
  return `<article class="spost">${F(p.foto, { tone: p.tono, tag: p.tag || "Imagen ilustrativa" })}<div class="spost__shade"></div>${m}<div class="spost__t"><small>${e(p.kick)}</small><b>${p.titulo}</b></div></article>`;
};

ABER.buildSalon = function () {
  const I = ABER.icon, e = ABER.esc, F = ABER.media.foto, S = ABER.config.salon;

  /* Web */
  ABER.salonSite = ABER.browserFrame(document.getElementById("sl-web"), {
    domain: S.sitio, start: "inicio", tag: "Prototipo · imágenes ilustrativas",
    factory: ABER.createSalon,
  });

  /* Instagram */
  /* Publicaciones reales de @salonlozano (assets/salon/), en el orden de la grilla. */
  const posts = [
    { img: "assets/salon/post-1.png", titulo: "Conocé el Salón Primavera", cat: "Espacios", caption: "Conocé el Salón Primavera.\n\nPedí tu presupuesto con entrevista previa.", tags: "#SalónLozano #LaPlata" },
    { img: "assets/salon/post-2.png", titulo: "Let’s celebrate", cat: "Eventos", caption: "Celebraciones en Salón Lozano.", tags: "#SalónLozano" },
    { img: "assets/salon/post-3.png", titulo: "Una noche de 15", cat: "Eventos realizados", caption: "Eventos realizados en el salón.", tags: "#15años #SalónLozano" },
    { img: "assets/salon/post-4.png", titulo: "El salón", cat: "Espacios", caption: `Salón Lozano. ${S.direccion}, ${S.ciudad}.\nTel. ${S.telefono} · Cel. ${S.celular}`, tags: "#SalónLozano #LaPlata" },
  ].map((p) => ({ ...p, html: ABER.salonPost(p) }));

  const hl = [
    { id: "colonial", nombre: "Colonial", icon: "edificio", color: "#5b4b3a", frames: [{ cls: "", html: `${F("colonial", { tone: "calido" })}<span class="k2" style="margin-top:auto">El espacio</span><h5 style="font-family:var(--f-salon);font-weight:500;text-transform:none;font-stretch:100%;font-size:16cqw">Salón <i>Colonial</i></h5><p style="margin-top:3cqw">Capacidad: a confirmar</p>`, link: { label: "Ver el salón", route: "colonial" } }] },
    { id: "primavera", nombre: "Primavera", icon: "flor", color: "#5f6e57", frames: [{ cls: "", html: `${F("primavera", { tone: "salvia" })}<span class="k2" style="margin-top:auto">El espacio</span><h5 style="font-family:var(--f-salon);font-weight:500;text-transform:none;font-stretch:100%;font-size:16cqw">Salón <i>Primavera</i></h5><p style="margin-top:3cqw">Capacidad: a confirmar</p>`, link: { label: "Ver el salón", route: "primavera" } }] },
    { id: "eventos", nombre: "Eventos", icon: "estrella", color: "#1d1a16", frames: [{ cls: "", html: `${F("evento", { tone: "calido", tag: "Imagen ilustrativa · evento real" })}<span class="k2" style="margin-top:auto">Eventos realizados</span><h5 style="font-family:var(--f-salon);font-weight:500;text-transform:none;font-stretch:100%;font-size:14cqw">Casamientos, 15 y cumpleaños</h5>`, link: { label: "Galería", route: "galeria" } }] },
    { id: "presupuesto", nombre: "Presupuesto", icon: "chat", color: "#a5844f", frames: [{ cls: "st-papel st--light", html: `<span class="k2" style="color:#a5844f">Presupuestos</span><h5 style="font-family:var(--f-salon);font-weight:500;text-transform:none;font-stretch:100%;font-size:15cqw">Con entrevista previa</h5><div class="steps"><div>Completá el formulario</div><div>Coordinamos una visita</div><div>Recibís tu propuesta</div></div>`, link: { label: "Pedir presupuesto", route: "presupuesto" } }] },
    { id: "ubicacion", nombre: "Ubicación", icon: "pin", color: "#6e5b44", frames: [{ cls: "st-negro", html: `<span class="k2">Ubicación</span><h5 style="font-family:var(--f-salon);font-weight:500;text-transform:none;font-stretch:100%;font-size:16cqw">Calle 11 Nº 676</h5><p style="margin-top:3cqw">La Plata</p><div class="list"><div><span>Teléfono</span><span>${e(S.telefono)}</span></div><div><span>Celular</span><span>${e(S.celular)}</span></div></div>`, link: { label: "Cómo llegar", route: "ubicacion" } }] },
  ];
  const av = `<span class="sl-av">${ABER.salonLogo}</span>`;
  const phone = document.createElement("div"); phone.className = "phone";
  const pane = document.getElementById("sl-insta");
  pane.innerHTML = `<div class="sl-ig"><div data-ph></div><div>
      <div class="sub" style="margin-top:0"><h3>@${e(S.instagram)}</h3><span>Biografía · destacadas · grilla</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px" data-slstrip></div>
      <div class="sub"><h3>Destacadas</h3><span>Seleccionar</span></div>
      <div class="ig-hlc" style="grid-template-columns:repeat(5,1fr);max-width:520px" data-slhl>${hl.map((h) => `<button data-hlo="${h.id}" style="color:var(--negro)"><div class="cov" style="background:${h.color}">${I(h.icon)}</div>${e(h.nombre)}</button>`).join("")}</div>
    </div></div>`;
  pane.querySelector("[data-ph]").appendChild(phone);
  const toSite = (r) => { document.querySelector('.sl-tabs [data-pane="sl-web"]').click(); ABER.salonSite.go(r); };
  const prof = ABER.igProfile(phone, {
    handle: S.instagram, verified: false, avatar: av,
    stats: [[String(posts.length), "publicaciones"], ["—", "seguidores"], ["—", "seguidos"]],
    bio: `<div class="n">Salón Lozano</div><div class="c">Salón de eventos</div><div>Salón Colonial y Salón Primavera.</div><div>Presupuestos con entrevista previa.</div><div>📍 ${e(S.direccion)}, ${e(S.ciudad)}</div><div>Tel. ${e(S.telefono)} · Cel. ${e(S.celular)}</div><a href="#" data-route="inicio">${I("link")}${e(S.sitio)}</a>`.replace("📍 ", ""),
    buttons: [{ label: "Seguir" }, { label: "WhatsApp", action: () => window.open(`https://wa.me/${S.whatsapp}`, "_blank", "noopener") }, { label: "Cómo llegar", action: () => toSite("ubicacion") }],
    highlights: hl, posts, onLink: toSite,
  });
  pane.querySelector("[data-slstrip]").innerHTML = posts.map((p, i) => `<button data-open="${i}" style="display:block;text-align:left">${p.html}<small style="display:block;margin-top:6px;font-family:var(--f-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#6b6e76">${e(p.cat)}</small></button>`).join("");
  pane.addEventListener("click", (ev) => { const o = ev.target.closest("[data-open]"); if (o) prof.openPost(+o.dataset.open); const h = ev.target.closest("[data-hlo]"); if (h) prof.openHighlight(h.dataset.hlo); });

  /* Manual de marca */
  const mk = (cls = "") => `<span class="sl-mark ${cls}">${ABER.salonLogo}</span>`;
  const sw = (n, hex, rgb, uso, pct, bg, fg, flex) => `<div style="background:${bg};color:${fg};flex:${flex}"><div><b>${n}</b><code>${hex}<br>RGB ${rgb}</code></div><div><small>${uso}</small><span class="slm-pal__pct">${pct}</span></div></div>`;
  document.getElementById("sl-marca").innerHTML = `
    <div class="sub" style="margin-top:0"><h3>Logo</h3><span>Archivo oficial en SVG</span></div>
    <div class="slm-mark">
      <div class="slm-mark__main"><span class="k">Área de resguardo</span><div class="slm-clear">${mk()}</div></div>
      <div class="slm-mark__v">
        <div style="background:#f4efe6;color:#1d1a16">${mk()}<span class="k">Sobre crema</span></div>
        <div style="background:#e8e0d1;color:#1d1a16"><span class="sl-mark">${ABER.salonLogo}<small>La Plata</small></span><span class="k">Con descriptor</span></div>
        <div style="background:#a5844f"><span class="slm-avatar"><span class="sl-av">${ABER.salonLogo}</span></span><span class="k" style="color:rgba(255,255,255,.8)">Avatar de redes</span></div>
        <div style="padding:0;overflow:hidden">${F("colonial", { tone: "calido", tag: false })}<div class="slm-onphoto">${mk()}</div><span class="k" style="color:rgba(255,255,255,.8);z-index:2">Sobre fotografía</span></div>
      </div>
    </div>
    <div class="slm-rules">
      <div><b>Archivo original</b><p>El logo se usa siempre desde el archivo SVG oficial. No se redibuja ni se vuelve a escribir con otra tipografía.</p></div>
      <div><b>Resguardo</b><p>Alrededor del nombre se deja libre, como mínimo, el alto de la “L”. Ningún texto ni imagen entra en ese espacio.</p></div>
      <div><b>Tamaño mínimo</b><p>24 px en pantalla y 12 mm de ancho en impresos. Por debajo de eso se usa el avatar apilado.</p></div>
    </div>
    <div class="slm-dont">
      <figure><div><span style="font-family:var(--f-sans);font-weight:800;text-transform:uppercase;letter-spacing:.02em;font-size:26px">Salón Lozano</span></div><figcaption>No reemplazar el logo por texto ni cambiar la tipografía</figcaption></figure>
      <figure><div><span class="sl-mark" style="font-size:30px;display:inline-block;transform:scaleX(1.5)">${ABER.salonLogo}</span></div><figcaption>No estirar ni deformar el nombre</figcaption></figure>
      <figure><div style="background:#a5844f"><span class="sl-mark" style="font-size:40px;color:#c9a46a">${ABER.salonLogo}</span></div><figcaption>No usarlo sobre fondos sin contraste</figcaption></figure>
      <figure><div><span class="sl-mark" style="font-size:40px;color:#b0332a">${ABER.salonLogo}</span></div><figcaption>No aplicar colores fuera de la paleta</figcaption></figure>
    </div>

    <div class="sub"><h3>Color</h3><span>Tonos tomados de los salones · proporción de uso</span></div>
    <div class="slm-pal">
      ${sw("Crema", "#F4EFE6", "244 239 230", "Fondo principal · papel", "50 %", "#f4efe6", "#1d1a16", 5)}
      ${sw("Tinta", "#1D1A16", "29 26 22", "Texto · bloques oscuros", "25 %", "#1d1a16", "#f4efe6", 2.5)}
      ${sw("Lino", "#E8E0D1", "232 224 209", "Divisores · fondos secundarios", "12 %", "#e8e0d1", "#1d1a16", 1.4)}
      ${sw("Sepia", "#6E5B44", "110 91 68", "Textos secundarios", "8 %", "#6e5b44", "#f4efe6", 1.1)}
      ${sw("Oro", "#A5844F", "165 132 79", "Acentos · rótulos", "5 %", "#a5844f", "#fff", 1)}
    </div>
    <div class="slm-acc">
      <div><span style="background:#a5844f"></span><p><b>Salón Colonial</b> se acompaña con los tonos cálidos: oro y sepia.</p></div>
      <div><span style="background:#5f6e57"></span><p><b>Salón Primavera</b> suma un verde salvia (#5F6E57) como acento propio.</p></div>
    </div>

    <div class="sub"><h3>Tipografía</h3><span>Cormorant Garamond · Archivo · IBM Plex Mono</span></div>
    <div class="slm-type">
      <div class="slm-type__spec">
        <span class="slm-eye">Titulares — Cormorant Garamond</span>
        <div class="slm-row"><span class="k">Recurso</span><span>La palabra que da el tono va en itálica: “Contanos <i style="font-family:var(--f-salon);font-size:1.25em">tu evento</i>”.</span></div>
        <div class="slm-row"><span class="k">Texto</span><span style="font-family:var(--f-sans)">Archivo para textos, botones y formularios: clara y neutra, deja el protagonismo a los títulos.</span></div>
        <div class="slm-row"><span class="k">Rótulo</span><span class="slm-eye" style="margin:0">Calle 11 Nº 676 · La Plata</span></div>
      </div>
      <div class="slm-type__alpha">
        <span class="k" style="color:#c9bfae">Familias</span>
        <div class="slm-glyph">Aa<i>a</i></div>
        <p>Cormorant Garamond — nombre, títulos, frases<br>Archivo — texto corrido, interfaz<br>IBM Plex Mono — rótulos, datos, direcciones</p>
      </div>
    </div>

    <div class="sub"><h3>Fotografía</h3><span>Luz cálida · espacios reales · personas sin pose</span></div>
    <div class="slm-photo">
      ${[["colonial", "calido", "Cálido", "Salón Colonial. Arcos, molduras y luz de lámparas."], ["primavera", "salvia", "Salvia", "Salón Primavera. Luz natural por los ventanales."]]
        .map(([f, t, n, d]) => `<figure>${F(f, { tone: t, tag: false })}<figcaption><b>${n}</b><span>${d}</span></figcaption></figure>`).join("")}
    </div>
    <ul class="slm-list">
      <li>Mostrar los salones como son: sin filtros fuertes ni retoques que cambien los colores del lugar.</li>
      <li>Priorizar la luz natural de día y la luz cálida de la ambientación de noche.</li>
      <li>En eventos, personas en momentos reales y siempre con autorización para publicar.</li>
    </ul>

    <div class="sub"><h3>Tono de voz</h3><span>Hablamos como anfitriones</span></div>
    <div class="slm-voice">
      <div class="slm-voice__ex">
        <div class="si"><span>Sí</span>Contanos tu evento y coordinamos una visita.</div>
        <div class="no"><span>No</span>Complete el formulario de solicitud de presupuesto.</div>
        <div class="si"><span>Sí</span>Salón Colonial. Arcos, molduras y luz cálida.</div>
        <div class="no"><span>No</span>¡¡Reservá YA tu fecha!! Últimos lugares 🎉🎉</div>
      </div>
    </div>

    <div class="sub"><h3>Aplicaciones</h3><span>Publicaciones 4:5 · historia 9:16</span></div>
    <div class="slm-apps">
      <figure>${posts[0].html}<figcaption class="k">Publicación · espacio · 4:5</figcaption></figure>
      <figure>${posts[2].html}<figcaption class="k">Publicación · evento · 4:5</figcaption></figure>
      <figure><div style="position:relative;aspect-ratio:9/16;container-type:inline-size;overflow:hidden;background:#1d1a16"><div class="st">${hl[1].frames[0].html}</div></div><figcaption class="k">Historia · 9:16</figcaption></figure>
    </div>`;

  /* Producción fotográfica — propuesta */
  document.getElementById("sl-fotos").innerHTML = `
    <div class="slm-prop">
      <span class="slm-eye">Propuesta</span>
      <p class="slm-lead">Una producción de fotos profesional <i>para las redes del salón.</i></p>
      <p>Hoy el contenido de Instagram depende de fotos del archivo y, en este prototipo, de imágenes ilustrativas. Como propuesta, sería útil contar con una producción fotográfica profesional que genere material propio para las redes sociales, alineado con el manual de marca.</p>
    </div>
    <div class="sub"><h3>Qué aportaría</h3><span>Contenido para redes sociales</span></div>
    <div class="slm-gain">
      <div><i>01</i><b>Contenido propio</b><p>Un banco de imágenes para publicaciones, historias y destacadas, sin depender del archivo.</p></div>
      <div><i>02</i><b>Coherencia de marca</b><p>Fotos con la luz y el tratamiento cálido que define el manual, para que el perfil se vea como un todo.</p></div>
      <div><i>03</i><b>Mejor primera impresión</b><p>Quien consulta por Instagram conoce los salones antes de coordinar la visita.</p></div>
      <div><i>04</i><b>Un material, varios usos</b><p>Las mismas fotos sirven para el sitio web y para otras piezas de difusión.</p></div>
    </div>
    <div class="sub"><h3>Formatos para redes</h3><span>Una sesión, todos los formatos</span></div>
    <div class="slm-fmt">
      <figure>${F("colonial", { tone: "calido", tag: "Post · 4:5" }).replace('class="ph', 'style="aspect-ratio:4/5" class="ph')}<figcaption class="k">Instagram · publicación 4:5</figcaption></figure>
      <figure>${F("evento", { tone: "noche", tag: "Historia · 9:16" }).replace('class="ph', 'style="aspect-ratio:9/16" class="ph')}<figcaption class="k">Historias y reels · 9:16</figcaption></figure>
      <figure>${F("primavera", { tone: "salvia", tag: "Web · 16:9" }).replace('class="ph', 'style="aspect-ratio:16/9" class="ph')}<figcaption class="k">Sitio web · 16:9</figcaption></figure>
    </div>`;

  document.querySelector(".sl-tabs").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-pane]"); if (!b) return;
    document.querySelectorAll(".sl-tabs button").forEach((x) => x.classList.toggle("is-on", x === b));
    document.querySelectorAll(".sl-pane").forEach((p) => p.classList.toggle("is-on", p.id === b.dataset.pane));
    if (b.dataset.pane === "sl-web") setTimeout(() => ABER.salonSite.refresh(), 50);
  });
};
