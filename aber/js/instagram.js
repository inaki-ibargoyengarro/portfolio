/* ==========================================================================
   Instagram: perfil simulado, visor de publicaciones y visor de historias.
   Componentes reutilizados para ABER y para Salón Lozano.
   ========================================================================== */
window.ABER = window.ABER || {};

ABER.viewer = (function () {
  const I = ABER.icon, e = ABER.esc;
  const ovP = () => document.getElementById("ov-post");
  const ovS = () => document.getElementById("ov-story");
  let pState = null, sState = null, timer = null;

  /* ------------------------- Publicación ------------------------- */
  function openPost(list, idx, meta) {
    pState = { list, idx, meta, safe: false };
    renderPost();
    ovP().classList.add("is-on");
    ovP().querySelector(".ov__x").focus();
  }
  function renderPost() {
    const { list, idx, meta, safe } = pState;
    const it = list[idx];
    ovP().innerHTML = `
      <button class="ov__x" data-x aria-label="Cerrar">${I("cerrar")}</button>
      ${list.length > 1 ? `<button class="pv__nav pv__nav--l" data-p="-1" aria-label="Anterior">${I("flechaIzq")}</button><button class="pv__nav pv__nav--r" data-p="1" aria-label="Siguiente">${I("flecha")}</button>` : ""}
      <div class="pv">
        <div class="pv__img ${safe ? "show-safe" : ""}">${it.html}</div>
        <div class="pv__side">
          <div class="pv__h"><span class="igp__av">${meta.avatar}</span>${e(meta.handle)}<span style="margin-left:auto;color:#737373;font-weight:400;font-size:12px">${e(it.cat || "")}</span></div>
          <div class="pv__cap"><b>${e(meta.handle)}</b> ${e(it.caption || "")}\n\n<span class="tags">${e(it.tags || "")}</span></div>
          <div class="pv__tools">
            <div class="row">${I("corazon")}${I("comentario")}${I("enviar")}<span style="margin-left:auto">${I("guardar")}</span></div>
            <label><input type="checkbox" data-safe ${safe ? "checked" : ""}> Recorte de la grilla (3:4)</label>
            <span style="font-family:var(--f-mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#9b9ea6">1080 × 1350 px · 4:5 · ${idx + 1} / ${list.length}</span>
          </div>
        </div>
      </div>`;
  }
  function closePost() { ovP().classList.remove("is-on"); ovP().innerHTML = ""; pState = null; }

  /* --------------------------- Historias --------------------------- */
  function openStory(hl, meta) {
    sState = { hl, meta, i: 0, paused: false };
    ovS().classList.add("is-on");
    renderStory();
  }
  function renderStory() {
    clearTimeout(timer);
    const { hl, meta, i } = sState;
    const f = hl.frames[i];
    const dur = 6000;
    ovS().innerHTML = `
      <button class="ov__x" data-x aria-label="Cerrar">${I("cerrar")}</button>
      <div class="sv">
        <div class="sv__bars">${hl.frames.map((_, k) => `<i class="${k < i ? "done" : k === i ? "run" : ""}"><b style="animation-duration:${dur}ms"></b></i>`).join("")}</div>
        <div class="sv__who"><span class="igp__av">${meta.avatar}</span>${e(meta.handle)} <span>· ${e(hl.nombre)}</span></div>
        <div class="sv__frame"><div class="st ${f.cls}">${f.html}</div></div>
        <button class="sv__tap sv__tap--l" data-s="-1" aria-label="Anterior"></button>
        <button class="sv__tap sv__tap--r" data-s="1" aria-label="Siguiente"></button>
        ${f.link ? `<button class="sv__link" data-link="${e(f.link.route)}">${I("link")} ${e(f.link.label)}</button>` : ""}
      </div>`;
    timer = setTimeout(() => step(1), dur);
  }
  function step(d) {
    if (!sState) return;
    const n = sState.i + d;
    if (n < 0) { sState.i = 0; return renderStory(); }
    if (n >= sState.hl.frames.length) return closeStory();
    sState.i = n; renderStory();
  }
  function closeStory() { clearTimeout(timer); ovS().classList.remove("is-on"); ovS().innerHTML = ""; sState = null; }

  document.addEventListener("click", (ev) => {
    const t = ev.target;
    if (pState) {
      if (t.closest("[data-x]") || t === ovP()) return closePost();
      const nav = t.closest("[data-p]");
      if (nav) { pState.idx = (pState.idx + +nav.dataset.p + pState.list.length) % pState.list.length; return renderPost(); }
    }
    if (sState) {
      if (t.closest("[data-x]") || t === ovS()) return closeStory();
      const s = t.closest("[data-s]");
      if (s) return step(+s.dataset.s);
      const l = t.closest("[data-link]");
      if (l) { const r = l.dataset.link, cb = sState.meta.onLink; closeStory(); cb && cb(r); }
    }
  });
  document.addEventListener("change", (ev) => {
    if (pState && ev.target.matches("[data-safe]")) { pState.safe = ev.target.checked; ovP().querySelector(".pv__img").classList.toggle("show-safe", pState.safe); }
  });
  document.addEventListener("keydown", (ev) => {
    if (pState) {
      if (ev.key === "Escape") closePost();
      if (ev.key === "ArrowRight") { pState.idx = (pState.idx + 1) % pState.list.length; renderPost(); }
      if (ev.key === "ArrowLeft") { pState.idx = (pState.idx - 1 + pState.list.length) % pState.list.length; renderPost(); }
      ev.stopImmediatePropagation();
    } else if (sState) {
      if (ev.key === "Escape") closeStory();
      if (ev.key === "ArrowRight") step(1);
      if (ev.key === "ArrowLeft") step(-1);
      ev.stopImmediatePropagation();
    }
  }, true);

  return { openPost, openStory, isOpen: () => !!(pState || sState) };
})();

/* --------------------------------------------------------------------------
   Perfil de Instagram simulado
   cfg: { handle, verified, avatar, stats:[[n,l]...], bio(html), buttons:[...],
          highlights:[{id,nombre,icon,color,frames}], posts:[{html,caption,...}],
          gridHTML(post), onLink(route) }
   -------------------------------------------------------------------------- */
ABER.igProfile = function (el, cfg) {
  const I = ABER.icon, e = ABER.esc;
  const meta = { handle: cfg.handle, avatar: cfg.avatar, onLink: cfg.onLink };
  let tab = "grid";
  el.innerHTML = `
    <div class="phone__scr">
      <div class="phone__isl"></div>
      <div class="phone__status"><span>9:41</span><span style="display:flex;gap:5px;align-items:center"><svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/></svg></span></div>
      <div class="phone__body igp">
        <div class="igp__top"><b>${e(cfg.handle)} ${cfg.verified ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 1 2.6 2.2 3.4-.3.9 3.3 3 1.6-1.4 3.2 1.4 3.2-3 1.6-.9 3.3-3.4-.3L12 23l-2.6-2.2-3.4.3-.9-3.3-3-1.6L3.5 13 2.1 9.8l3-1.6.9-3.3 3.4.3z"/><path d="m8 12.2 2.6 2.6L16.2 9" stroke="#fff" stroke-width="2" fill="none"/></svg>' : ""}</b><div>${I("nuevo")}${I("menu")}</div></div>
        <div class="igp__head"><div class="igp__av">${cfg.avatar}</div>
          <div class="igp__stats">${cfg.stats.map(([n, l]) => `<div><b>${e(n)}</b><span>${e(l)}</span></div>`).join("")}</div></div>
        <div class="igp__bio">${cfg.bio}</div>
        <div class="igp__btns">${cfg.buttons.map((b, i) => `<button class="${i === 0 ? "is-on" : ""}" data-btn="${i}">${e(b.label)}</button>`).join("")}</div>
        <div class="igp__hl">${cfg.highlights.map((h) => `<button data-hl="${h.id}"><div class="ring"><div class="cov" style="background:${h.color}">${I(h.icon)}</div></div>${e(h.nombre)}</button>`).join("")}</div>
        <div class="igp__tabs"><button class="is-on" data-tab="grid" aria-label="Publicaciones">${I("grilla")}</button><button data-tab="reels" aria-label="Reels">${I("reels")}</button><button data-tab="tag" aria-label="Etiquetadas">${I("etiqueta")}</button></div>
        <div class="igp__grid" data-grid></div>
      </div>
      <div class="phone__tabbar">${I("casa")}${I("buscar")}${I("nuevo")}${I("reels")}<span class="igp__av" style="width:26px;height:26px;box-shadow:0 0 0 1.5px #000">${cfg.avatar}</span></div>
    </div>`;

  const grid = el.querySelector("[data-grid]");
  function paintGrid() {
    const list = tab === "grid" ? cfg.posts : tab === "reels" ? cfg.posts.filter((p) => p.multi || p.reel) : [];
    grid.innerHTML = list.length
      ? list.map((p) => `<button data-post="${cfg.posts.indexOf(p)}" aria-label="${e(p.titulo || p.cat || "Publicación")}">${p.html}${p.multi ? `<svg class="multi" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h14a2 2 0 0 1 2 2v14h-2V4H6z"/><rect x="2" y="6" width="16" height="16" rx="2"/></svg>` : ""}</button>`).join("")
      : `<div style="grid-column:1/-1;padding:36px 20px;text-align:center;color:#737373;font-size:13px">Las publicaciones donde se etiqueta a la cuenta aparecen aquí.</div>`;
  }
  paintGrid();

  el.addEventListener("click", (ev) => {
    const t = ev.target;
    const p = t.closest("[data-post]");
    if (p) return ABER.viewer.openPost(cfg.posts, +p.dataset.post, meta);
    const h = t.closest("[data-hl]");
    if (h) return ABER.viewer.openStory(cfg.highlights.find((x) => x.id === h.dataset.hl), meta);
    const tb = t.closest("[data-tab]");
    if (tb) { tab = tb.dataset.tab; el.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("is-on", b === tb)); return paintGrid(); }
    const b = t.closest("[data-btn]");
    if (b) { const btn = cfg.buttons[+b.dataset.btn]; btn.action && btn.action(); }
    const a = t.closest("[data-route]");
    if (a) { ev.preventDefault(); cfg.onLink && cfg.onLink(a.dataset.route); }
  });

  return { meta, openHighlight: (id) => ABER.viewer.openStory(cfg.highlights.find((x) => x.id === id), meta), openPost: (i) => ABER.viewer.openPost(cfg.posts, i, meta) };
};

/* --------------------------------------------------------------------------
   Sección 02 — Instagram de ABER
   -------------------------------------------------------------------------- */
ABER.buildInstagram = function () {
  const I = ABER.icon, e = ABER.esc, C = ABER.config;
  const avatar = ABER.logo();
  const posts = ABER.ig.posts.map((p) => ({ ...p, html: ABER.post(p) }));
  const handle = C.gremio.instagram;
  const toWeb = (r) => ABER.app.openWeb(r);

  /* Perfil actual (capturas) */
  const now = document.getElementById("ig-now");
  now.innerHTML = `
    <h4 class="k" style="margin:0 0 12px">Perfil actual</h4>
    <div class="ig-now__shots">${C.capturasActuales.map((src, i) => `
      <div class="ig-now__shot">
        <div class="ig-now__empty">${I("camara")}<b>Captura ${i + 1} del perfil actual</b><code>${e(src)}</code></div>
        <img src="${e(src)}" alt="Captura del Instagram actual de ABER ${i + 1}" onerror="this.remove()" onload="this.parentNode.style.aspectRatio=this.naturalWidth+' / '+this.naturalHeight" style="position:absolute;inset:0">
      </div>`).join("")}</div>
    <ul class="ig-now__diag">
      <li><i>Hoy</i>Farmacias de turno: una imagen con el listado del mes</li>
      <li><i>Nuevo</i>Farmacias de turno: mapa por día y zona en aber.org.ar</li>
      <li><i>Nuevo</i>Publicaciones 4:5 con sistema editorial único</li>
      <li><i>Nuevo</i>Beneficios y trámites en destacadas, con enlace a la web</li>
    </ul>`;

  now.addEventListener("click", (ev) => {
    const im = ev.target.closest(".ig-now__shot img"); if (!im) return;
    const d = document.createElement("div"); d.className = "sl-lb";
    d.innerHTML = `<img src="${im.getAttribute("src")}" alt="${e(im.alt)}" style="max-width:92vw;max-height:84vh;object-fit:contain;box-shadow:0 30px 80px rgba(0,0,0,.6)"><button aria-label="Cerrar">${I("cerrar")}</button><p>${e(im.alt)}</p>`;
    d.onclick = (x) => { if (x.target === d || x.target.closest("button")) d.remove(); };
    document.body.appendChild(d);
  });

  const bio = ABER.ig.perfil.bio.map((b) =>
    b.t === "n" ? `<div class="n">${e(b.v)}</div>` :
    b.t === "c" ? `<div class="c">${e(b.v)}</div>` :
    b.t === "a" ? `<a href="#" data-route="inicio">${I("link")}${e(b.v)}</a>` : `<div>${e(b.v)}</div>`).join("");

  const prof = ABER.igProfile(document.getElementById("ig-phone"), {
    handle, verified: false, avatar,
    stats: [[String(posts.length), "publicaciones"], ["—", "seguidores"], ["—", "seguidos"]],
    bio,
    buttons: [{ label: "Seguir" }, { label: "Mensaje" }, { label: "Web", action: () => toWeb("inicio") }],
    highlights: ABER.ig.destacadas,
    posts,
    onLink: toWeb,
  });

  /* Panel lateral */
  const cats = [...new Set(ABER.ig.posts.map((p) => p.cat))];
  document.getElementById("ig-side").innerHTML = `
    <h4>Feed</h4>
    <p class="bigt">Gestión, acuerdos, comunicados y agenda</p>
    <ul class="ig-cats">${ABER.ig.posts.map((p, i) => `<li><button data-open="${i}"><i>${String(i + 1).padStart(2, "0")}</i>${e(p.cat)}${I("flecha")}</button></li>`).join("")}</ul>
    <h4>Destacadas</h4>
    <p class="bigt" style="font-size:clamp(20px,2vw,28px)">Beneficios y trámites, siempre a mano</p>
    <div class="ig-hlc">${ABER.ig.destacadas.map((h) => `<button data-hlo="${h.id}"><div class="cov" style="background:${h.color}">${I(h.icon)}</div>${e(h.nombre)}</button>`).join("")}</div>`;
  document.getElementById("ig-side").addEventListener("click", (ev) => {
    const o = ev.target.closest("[data-open]"); if (o) prof.openPost(+o.dataset.open);
    const h = ev.target.closest("[data-hlo]"); if (h) prof.openHighlight(h.dataset.hlo);
  });

  /* Tira de publicaciones grandes */
  const strip = document.getElementById("ig-strip");
  strip.innerHTML = [0, 2, 4, 6].map((i) => `<button data-open="${i}">${posts[i].html}<small>${e(posts[i].cat)} · 4:5</small></button>`).join("");
  strip.addEventListener("click", (ev) => { const o = ev.target.closest("[data-open]"); if (o) prof.openPost(+o.dataset.open); });

  ABER.igPosts = posts;
};
