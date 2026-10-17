/* ==========================================================================
   PRESENTACIÓN — navegación entre secciones y armado de cada escenario
   ========================================================================== */
(function () {
  const I = ABER.icon, e = ABER.esc, F = ABER.media.foto;
  const stages = [...document.querySelectorAll(".stage")];
  const nav = document.getElementById("nav");
  let cur = -1;
  const sites = {};

  /* Logos estáticos */
  document.querySelectorAll(".js-logo").forEach((img) => { img.onerror = () => ABER.logoFail(img); img.src = ABER.config.logoUrl; });

  /* Controles */
  document.getElementById("prev").innerHTML = I("flechaIzq");
  document.getElementById("next").innerHTML = I("flecha");
  document.getElementById("menu").innerHTML = I("menu");
  nav.innerHTML = stages.map((s, i) => `<button data-go="${i}"><i>${String(i).padStart(2, "0")}</i>${e(s.dataset.label)}</button>`).join("");

  function goTo(i, opts = {}) {
    i = Math.max(0, Math.min(stages.length - 1, i));
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    stages.forEach((s, k) => {
      s.classList.toggle("from-left", dir < 0 && k === i);
      if (k === i) { s.classList.add("is-on"); s.removeAttribute("aria-hidden"); s.removeAttribute("inert"); }
      else { s.classList.remove("is-on"); s.setAttribute("aria-hidden", "true"); s.setAttribute("inert", ""); }
    });
    cur = i;
    if (!opts.keepScroll) stages[i].scrollTop = 0;
    nav.querySelectorAll("button").forEach((b, k) => b.classList.toggle("is-on", k === i));
    nav.classList.remove("is-open");
    document.getElementById("count").textContent = `${String(i).padStart(2, "0")} / ${String(stages.length - 1).padStart(2, "0")}`;
    document.getElementById("progress").style.width = (i / (stages.length - 1)) * 100 + "%";
    document.getElementById("prev").disabled = i === 0;
    document.getElementById("next").disabled = i === stages.length - 1;
    if (location.hash.slice(1) !== stages[i].id) history.replaceState(null, "", "#" + stages[i].id);
    setTimeout(() => Object.values(sites).forEach((s) => s && s.refresh && s.refresh()), 450);
    ABER.salonSite && setTimeout(() => ABER.salonSite.refresh(), 450);
  }

  document.addEventListener("click", (ev) => {
    const g = ev.target.closest("[data-go]");
    if (g && /^\d+$/.test(g.dataset.go) && !g.closest(".site")) { ev.preventDefault(); goTo(+g.dataset.go); }
  });
  document.getElementById("prev").onclick = () => goTo(cur - 1);
  document.getElementById("next").onclick = () => goTo(cur + 1);
  document.getElementById("menu").onclick = () => nav.classList.toggle("is-open");

  document.addEventListener("keydown", (ev) => {
    if (ABER.viewer.isOpen()) return;
    const over = document.querySelector(".aw-modal, .sl-lb");
    if (over) { if (ev.key === "Escape") over.remove(); return; }
    const t = ev.target;
    if (t.closest && (t.closest("input, textarea, select, [contenteditable]") || t.closest(".leaflet-container"))) return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); goTo(cur + 1); }
    if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); goTo(cur - 1); }
    if (ev.key === "Home") { ev.preventDefault(); goTo(0); }
  });
  window.addEventListener("hashchange", () => { const k = stages.findIndex((s) => s.id === location.hash.slice(1)); if (k >= 0) goTo(k); });

  /* ------------------------------ 00 Portada ------------------------------ */
  document.getElementById("cover-img").innerHTML = F("tribuna", { tone: "azul", tag: "Imagen ilustrativa" }).replace('class="ph', 'style="height:100%" class="ph');
  const sub = { identidad: "Logo, color, tipografía, piezas", instagram: "Perfil, publicaciones, destacadas", web: "Prototipo navegable", farmacias: "Mapa por día y zona", herramientas: "11 herramientas", salon: "Marca, web, Instagram, fotografía" };
  document.getElementById("cover-idx").innerHTML = stages.slice(1).map((s, k) => `<li><button data-go="${k + 1}"><i>${String(k + 1).padStart(2, "0")}</i><span>${e(s.dataset.label)}</span><small>${e(sub[s.id] || "")}</small></button></li>`).join("");

  /* ------------------------------ 01 Identidad ------------------------------ */
  document.getElementById("id-chip-photo").innerHTML = `<div style="position:absolute;inset:0">${F("pista", { tone: "azul", tag: false })}</div><div style="position:relative;z-index:2;background:var(--negro);padding:14px 18px">${ABER.logo()}</div><span class="k" style="z-index:2">Sobre fotografía</span>`;
  document.querySelector("#id-chip-photo .logo").style.width = "110px";

  const TREAT = [
    ["azul", "Duotono azul", "Noticias, gestión y web"],
    ["noche", "Negro con acento rojo", "Comunicados y prensa"],
    ["rojo", "Duotono rojo", "Convocatorias y actividades"],
    ["papel", "Papel", "Institucional, historia"],
  ];
  const ptStage = document.getElementById("pt-stage"), ptOpts = document.getElementById("pt-opts");
  const paintPT = (k) => {
    ptStage.innerHTML = F("asamblea", { tone: TREAT[k][0] }) + `<div class="photo-t__cap"><span>${e(TREAT[k][2].split(",")[0])}</span><b>Reunión informativa abierta para afiliados</b></div>`;
    ptOpts.querySelectorAll("button").forEach((b, i) => b.classList.toggle("is-on", i === k));
  };
  ptOpts.innerHTML = TREAT.map(([t, n, u], i) => `<button data-pt="${i}"><span class="sw">${F("asamblea", { tone: t, tag: false }).replace('class="ph', 'style="width:54px;height:54px" class="ph')}</span><span><b>${e(n)}</b><small>${e(u)}</small></span></button>`).join("");
  ptOpts.addEventListener("click", (ev) => { const b = ev.target.closest("[data-pt]"); if (b) paintPT(+b.dataset.pt); });
  paintPT(0);

  const idPosts = [ABER.ig.posts[1], ABER.ig.posts[0]];
  const idEl = document.getElementById("id-posts");
  idEl.innerHTML = idPosts.map((p, i) => `<button data-idp="${i}" style="display:block;text-align:left">${ABER.post(p)}<small class="k" style="display:block;margin-top:8px;color:#6b6e76">${i ? "Noticia" : "Comunicado"} · 1080 × 1350</small></button>`).join("");

  const n0 = ABER.demo.noticias[0];
  document.getElementById("id-apps").innerHTML = `
    <figure><div class="app-web"><div class="app-web__bar">${ABER.logo()}<span><i></i><i></i><i></i><i></i></span></div>${F(n0.foto, { tone: "azul" })}<div class="app-web__t"><span class="t-meta">${e(n0.tipo)}</span><b>${e(n0.titulo)}</b></div></div><figcaption><span class="k" style="color:#6b6e76">Web · nota</span><button class="k" style="color:var(--azul)" data-openweb="novedades/${n0.id}">Abrir ${I("flecha")}</button></figcaption></figure>
    <figure>${ABER.post(ABER.ig.posts[4])}<figcaption><span class="k" style="color:#6b6e76">Instagram · 4:5</span><button class="k" style="color:var(--azul)" data-go="2">Ver perfil ${I("flecha")}</button></figcaption></figure>
    <figure><div class="app-story"><div style="position:relative;aspect-ratio:9/16;container-type:inline-size;overflow:hidden">
      <div class="st st-rojo">${ABER.ig.destacadas[1].frames[0].html}</div></div></div>
      <figcaption style="width:62%;margin:10px auto 0"><span class="k" style="color:#6b6e76">Historia · 9:16</span><button class="k" style="color:var(--azul)" data-hl-open="farmacias">Ver ${I("flecha")}</button></figcaption></figure>`;

  /* ------------------------------ 02 Instagram ------------------------------ */
  ABER.buildInstagram();
  idEl.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-idp]"); if (!b) return;
    ABER.viewer.openPost(ABER.igPosts, b.dataset.idp === "0" ? 1 : 0, { handle: ABER.config.gremio.instagram, avatar: ABER.logo(), onLink: (r) => ABER.app.openWeb(r) });
  });
  document.getElementById("id-apps").addEventListener("click", (ev) => {
    const w = ev.target.closest("[data-openweb]"); if (w) ABER.app.openWeb(w.dataset.openweb);
    const h = ev.target.closest("[data-hl-open]"); if (h) ABER.viewer.openStory(ABER.ig.destacadas.find((x) => x.id === h.dataset.hlOpen), { handle: ABER.config.gremio.instagram, avatar: ABER.logo(), onLink: (r) => ABER.app.openWeb(r) });
  });

  /* ------------------------------ 03 Web ------------------------------ */
  const TOUR = [["inicio", "Inicio"], ["gremio", "El gremio"], ["servicios", "Servicios"], ["servicios/buscador", "Buscar beneficio"], ["laboral", "Laboral"], ["tramites", "Trámites"], ["tramites/faq", "Preguntas frecuentes"], ["novedades", "Novedades"], ["farmacias", "Farmacias"], ["calendario", "Calendario hípico"]];
  const tour = document.getElementById("web-tour");
  tour.innerHTML = `<span class="k">Recorrido</span>` + TOUR.map(([r, l]) => `<button data-tour="${r}">${e(l)}</button>`).join("");
  const syncTour = (r) => tour.querySelectorAll("[data-tour]").forEach((b) => b.classList.toggle("is-on", b.dataset.tour === r));
  sites.web = ABER.browserFrame(document.getElementById("web-frame"), {
    domain: ABER.config.gremio.dominio, start: "inicio",
    factory: (el, o) => ABER.createSite(el, { ...o, onRoute: (r, api) => { o.onRoute(r, api); syncTour(r); } }),
  });
  tour.addEventListener("click", (ev) => { const b = ev.target.closest("[data-tour]"); if (b) sites.web.go(b.dataset.tour); });

  /* ------------------------------ 04 Farmacias ------------------------------ */
  sites.farm = ABER.browserFrame(document.getElementById("farm-desk"), { domain: ABER.config.gremio.dominio, start: "farmacias", factory: ABER.createSite });
  const mob = document.createElement("div");
  document.getElementById("farm-mobile").appendChild(mob);
  sites.farmMob = ABER.createSite(mob, { start: "farmacias" });

  /* ------------------------------ 05 Herramientas ------------------------------ */
  const rail = document.getElementById("tools-rail");
  rail.innerHTML = ABER.TOOLS.map(([r, ic, n], i) => `<li><button data-tool="${r}"><i>${String(i + 1).padStart(2, "0")}</i>${I(ic)}<span>${e(n)}</span></button></li>`).join("");
  sites.tools = ABER.browserFrame(document.getElementById("tools-frame"), {
    domain: ABER.config.gremio.dominio, start: "herramientas",
    factory: (el, o) => ABER.createSite(el, { ...o, onRoute: (r, api) => { o.onRoute(r, api); rail.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("is-on", b.dataset.tool === r.split("?")[0])); } }),
  });
  rail.addEventListener("click", (ev) => { const b = ev.target.closest("[data-tool]"); if (b) { sites.tools.go(b.dataset.tool); if (innerWidth < 1180) document.getElementById("tools-frame").scrollIntoView({ behavior: "smooth" }); } });

  /* ------------------------------ 06 Salón Lozano ------------------------------ */
  ABER.buildSalon();

  /* API global */
  ABER.app = {
    goTo,
    openWeb(route) {
      const k = stages.findIndex((s) => s.id === "web");
      goTo(k); sites.web.go(route);
    },
  };

  /* Inicio */
  const start = stages.findIndex((s) => s.id === location.hash.slice(1));
  goTo(start >= 0 ? start : 0);
})();
