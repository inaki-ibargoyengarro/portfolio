/* Plantillas de publicaciones 4:5 y utilidades compartidas. */
window.ABER = window.ABER || {};

ABER.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Logo desde la URL configurada. Si no carga, se reemplaza por la sigla. */
ABER.logoFail = function (img) {
  const s = document.createElement("span");
  s.className = "logo-fallback " + img.className;
  s.textContent = "ABER";
  s.style.color = "#fff";
  img.replaceWith(s);
};
ABER.logo = (cls = "") =>
  `<img class="logo ${cls}" src="${ABER.config.logoUrl}" alt="ABER" onerror="ABER.logoFail(this)">`;

ABER.post = function (p) {
  const F = ABER.media.foto, L = ABER.logo, e = ABER.esc;
  const foot = (dark) => `<div class="p-foot">${dark ? `<span class="p-logo-dark">${L()}</span>` : L()}<span>${e(p.fecha || "")}</span></div>`;
  const safe = `<i class="safe"></i>`;
  if (p.img) return `<article class="post post--img"><img src="${e(p.img)}" alt="${e(p.titulo || p.cat || "")}" loading="lazy">${safe}</article>`;
  switch (p.tpl) {
    case "noticia":
      return `<article class="post post--noticia">${F(p.foto, { tone: p.tono })}
        <div class="p-body"><span class="p-kick">${e(p.kick)}</span><h3 class="p-h">${e(p.titulo)}</h3></div>${foot()}${safe}</article>`;
    case "comunicado":
      return `<article class="post post--comunicado">
        <div class="p-band"><b>Comunicado<br>oficial</b><span>${e(p.num)}</span></div>
        <h3 class="p-h">${e(p.titulo)}</h3><p class="p-txt">${e(p.texto)}</p>${foot(true)}${safe}</article>`;
    case "acuerdo":
      return `<article class="post post--acuerdo"><div class="p-in">
        <span class="p-kick">Acuerdos alcanzados</span><div class="p-big" style="margin-top:3cqw">Acuerdo</div>
        <h3 class="p-h">${e(p.titulo)}</h3>
        <ol>${p.items.map((t, i) => `<li><span>0${i + 1}</span>${e(t)}</li>`).join("")}</ol></div>${foot(true)}${safe}</article>`;
    case "opinion":
      return `<article class="post post--opinion"><span class="p-q">“</span>
        <p class="p-quote">${e(p.cita)}</p>
        <div class="p-who">${F("retrato", { tone: "gris", tag: false })}<div><b>${e(p.quien)}</b><span>${e(p.rol)}</span></div></div>${foot()}${safe}</article>`;
    case "agenda":
      return `<article class="post post--agenda">
        <div class="p-date"><b>${e(p.dia)}</b><span>${e(p.mes)}</span></div>
        <span class="p-kick">Convocatoria</span>
        <h3 class="p-h">${e(p.titulo)}</h3>
        <dl>${p.datos.map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join("")}</dl>${foot(true)}${safe}</article>`;
    case "prensa":
      return `<article class="post post--prensa">${F(p.foto, { tone: p.tono })}
        <span class="p-onair">● En los medios</span>
        <div class="p-side"><span class="p-kick">${e(p.medio)}</span><h3 class="p-h">${e(p.titulo)}</h3><p>Audio completo<br>en aber.org.ar</p></div>${foot()}${safe}</article>`;
    case "debate":
      return `<article class="post post--debate"><div class="p-in"><span class="p-kick">Derechos laborales · Consulta frecuente</span>
        <h3 class="p-h">${e(p.pre)}<span>${e(p.titulo)}</span></h3></div>
        <div class="p-dots"><i></i><i></i><i></i><i></i><i></i>&nbsp; Deslizá</div>${foot(true)}${safe}</article>`;
    case "actividad":
      return `<article class="post post--actividad">${F(p.foto, { tone: p.tono })}<div class="p-shade"></div>
        <div class="p-body"><span class="p-kick">${e(p.kick)}</span><h3 class="p-h">${e(p.titulo)}</h3></div>${foot()}${safe}</article>`;
    case "gestion":
      return `<article class="post post--gestion"><div class="p-in"><span class="p-kick" style="color:var(--rojo)">Resultados de gestión</span>
        <h3 class="p-h">${e(p.titulo)}</h3>
        <ul>${p.items.map(([n, t]) => `<li><b>${e(n)}</b><span>${e(t)}</span></li>`).join("")}</ul></div>${foot()}${safe}</article>`;
  }
  return "";
};
