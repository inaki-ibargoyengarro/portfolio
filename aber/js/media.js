/* ==========================================================================
   SISTEMA DE IMÁGENES
   --------------------------------------------------------------------------
   Cada imagen de la presentación se pide por una clave (ej. "tribuna").
   - Si en ABER.fotos[clave] hay una ruta (ej. "assets/fotos/tribuna.jpg"),
     se muestra esa fotografía.
   - Si no hay foto, o no carga, se muestra una ilustración de dirección de
     arte identificada como "Imagen ilustrativa". Nunca se presentan como
     fotografías reales.
   ========================================================================== */
window.ABER = window.ABER || {};

/* Reemplazos fotográficos: completar con rutas a fotos reales. */
ABER.fotos = {
  tribuna: null,
  pista: null,
  sede: null,
  asamblea: null,
  microfono: null,
  jornada: null,
  retrato: null,
  colonial: "assets/salon/web-colonial.png",
  primavera: "assets/salon/web-primavera.png",
  evento: null,
  mesa: null,
  fachada: "assets/salon/web-lozano-1.png",
};

ABER.media = (function () {
  const L = (d) => d; // legibilidad

  const grain = (id) => `
    <defs>
      <pattern id="g${id}" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".55" fill="var(--ph-fg)" opacity=".18"/>
      </pattern>
      <linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--ph-bg2)"/><stop offset="1" stop-color="var(--ph-bg)"/>
      </linearGradient>
    </defs>`;

  const scenes = {
    tribuna: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <circle cx="318" cy="96" r="34" fill="var(--ph-ac)" opacity=".9"/>
      <path d="M-10 236 L410 196 L410 214 L-10 258Z" fill="var(--ph-fg)"/>
      ${Array.from({ length: 15 }, (_, i) => {
        const x = 8 + i * 28, y = 254 - i * 2.8;
        return `<rect x="${x}" y="${y - 6}" width="4" height="${110 - i * 1.2}" fill="var(--ph-fg)" opacity=".85"/>`;
      }).join("")}
      ${Array.from({ length: 9 }, (_, i) => `<path d="M-10 ${272 + i * 11} L410 ${236 + i * 11.4}" stroke="var(--ph-fg)" stroke-width="2" opacity="${0.35 + i * 0.05}"/>`).join("")}
      <rect x="0" y="372" width="400" height="128" fill="var(--ph-mid)"/>
      <path d="M0 382 H400" stroke="var(--ph-bg2)" stroke-width="3"/>
      ${Array.from({ length: 21 }, (_, i) => `<rect x="${i * 20}" y="382" width="3" height="22" fill="var(--ph-bg2)"/>`).join("")}
      <path d="M0 404 H400" stroke="var(--ph-bg2)" stroke-width="2"/>
      <path d="M0 470 C120 452 280 452 400 466 V500 H0Z" fill="var(--ph-fg)" opacity=".25"/>`),

    pista: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <path d="M0 210 H400 V500 H0Z" fill="var(--ph-mid)"/>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M-40 ${500 - i * 30} C120 ${330 - i * 22} 300 ${250 - i * 9} 460 ${238 - i * 4}" stroke="var(--ph-bg2)" stroke-width="${6 - i}" fill="none" opacity="${0.9 - i * 0.14}"/>`).join("")}
      <path d="M-40 300 C120 250 300 226 460 220" stroke="var(--ph-fg)" stroke-width="3" fill="none"/>
      ${Array.from({ length: 14 }, (_, i) => { const t = i / 13; const x = -20 + t * 460; const y = 300 - 82 * Math.sin(t * 1.4); return `<rect x="${x}" y="${y - 2}" width="3" height="${26 - t * 16}" fill="var(--ph-fg)"/>`; }).join("")}
      <rect x="292" y="120" width="8" height="112" fill="var(--ph-fg)"/>
      <circle cx="296" cy="114" r="15" fill="var(--ph-ac)"/>
      <path d="M0 210 L60 196 L140 204 L210 190 L300 200 L400 188 V212 H0Z" fill="var(--ph-fg)" opacity=".55"/>`),

    sede: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <rect x="40" y="110" width="320" height="330" fill="var(--ph-mid)"/>
      <rect x="40" y="110" width="320" height="18" fill="var(--ph-fg)"/>
      ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${66 + c * 72}" y="${150 + r * 76}" width="44" height="54" fill="var(--ph-bg)"/><rect x="${66 + c * 72}" y="${150 + r * 76}" width="44" height="54" fill="none" stroke="var(--ph-fg)" stroke-width="3"/><path d="M${88 + c * 72} ${150 + r * 76} V${204 + r * 76}" stroke="var(--ph-fg)" stroke-width="2"/>`).join("")).join("")}
      <rect x="170" y="362" width="60" height="78" fill="var(--ph-fg)"/>
      <rect x="196" y="40" width="4" height="74" fill="var(--ph-fg)"/>
      <path d="M200 42 h56 v30 h-56Z" fill="var(--ph-ac)"/>
      <rect x="0" y="440" width="400" height="60" fill="var(--ph-fg)" opacity=".7"/>`),

    asamblea: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <rect x="150" y="120" width="100" height="96" fill="var(--ph-fg)"/>
      <rect x="120" y="96" width="160" height="10" fill="var(--ph-ac)"/>
      <circle cx="200" cy="96" r="20" fill="var(--ph-fg)"/>
      ${[0, 1, 2, 3].map((r) => Array.from({ length: 7 + r }, (_, i) => { const n = 7 + r, sp = 400 / n; const x = sp / 2 + i * sp + (r % 2 ? sp / 4 : 0); const y = 270 + r * 62; const s = 1 + r * 0.22; return `<circle cx="${x}" cy="${y}" r="${15 * s}" fill="var(--ph-fg)" opacity="${0.55 + r * 0.14}"/><path d="M${x - 28 * s} ${y + 52 * s} C${x - 26 * s} ${y + 16 * s} ${x + 26 * s} ${y + 16 * s} ${x + 28 * s} ${y + 52 * s}Z" fill="var(--ph-fg)" opacity="${0.55 + r * 0.14}"/>`; }).join("")).join("")}`),

    microfono: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${130 - i * 26} ${150 - i * 26} A${110 + i * 36} ${110 + i * 36} 0 0 0 ${130 - i * 26} ${350 + i * 26}" stroke="var(--ph-ac)" stroke-width="5" fill="none" opacity="${0.9 - i * 0.2}"/><path d="M${270 + i * 26} ${150 - i * 26} A${110 + i * 36} ${110 + i * 36} 0 0 1 ${270 + i * 26} ${350 + i * 26}" stroke="var(--ph-ac)" stroke-width="5" fill="none" opacity="${0.9 - i * 0.2}"/>`).join("")}
      <rect x="160" y="120" width="80" height="150" rx="40" fill="var(--ph-fg)"/>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M168 ${150 + i * 18} H232" stroke="var(--ph-bg)" stroke-width="3" opacity=".6"/>`).join("")}
      <path d="M140 230 C140 320 260 320 260 230" stroke="var(--ph-fg)" stroke-width="10" fill="none"/>
      <rect x="194" y="310" width="12" height="120" fill="var(--ph-fg)"/>
      <rect x="140" y="426" width="120" height="14" fill="var(--ph-fg)"/>`),

    jornada: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <path d="M40 200 L200 110 L360 200Z" fill="var(--ph-ac)"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${40 + i * 80} 200 l40 0 l-20 22Z" fill="var(--ph-ac)" opacity=".8"/>`).join("")}
      <rect x="56" y="200" width="6" height="200" fill="var(--ph-fg)"/><rect x="338" y="200" width="6" height="200" fill="var(--ph-fg)"/>
      <rect x="90" y="300" width="220" height="12" fill="var(--ph-fg)"/>
      <rect x="104" y="312" width="5" height="70" fill="var(--ph-fg)"/><rect x="292" y="312" width="5" height="70" fill="var(--ph-fg)"/>
      <rect x="180" y="250" width="40" height="50" fill="var(--ph-bg)" stroke="var(--ph-fg)" stroke-width="4"/>
      <path d="M200 262 v26 M187 275 h26" stroke="var(--ph-ac)" stroke-width="6"/>
      <circle cx="140" cy="262" r="14" fill="var(--ph-fg)"/><path d="M118 300 c0-24 44-24 44 0Z" fill="var(--ph-fg)"/>
      <circle cx="262" cy="262" r="14" fill="var(--ph-fg)"/><path d="M240 300 c0-24 44-24 44 0Z" fill="var(--ph-fg)"/>
      <rect x="0" y="400" width="400" height="100" fill="var(--ph-mid)"/>`),

    retrato: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <circle cx="200" cy="200" r="78" fill="var(--ph-fg)"/>
      <path d="M60 520 C60 340 340 340 340 520Z" fill="var(--ph-fg)"/>
      <path d="M180 300 L200 360 L220 300" fill="var(--ph-ac)"/>`),

    colonial: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      ${[0, 1, 2].map((i) => `<path d="M${30 + i * 120} 330 V170 A50 50 0 0 1 ${130 + i * 120} 170 V330" fill="var(--ph-mid)" stroke="var(--ph-fg)" stroke-width="5"/>`).join("")}
      <path d="M200 0 V60" stroke="var(--ph-fg)" stroke-width="3"/>
      <path d="M160 70 Q200 110 240 70" stroke="var(--ph-ac)" stroke-width="4" fill="none"/>
      ${[-36, -18, 0, 18, 36].map((d) => `<path d="M${200 + d} 72 v16" stroke="var(--ph-ac)" stroke-width="3"/><circle cx="${200 + d}" cy="${92}" r="4" fill="var(--ph-ac)"/>`).join("")}
      <rect x="0" y="330" width="400" height="170" fill="var(--ph-fg)" opacity=".8"/>
      ${[70, 200, 330].map((x) => `<ellipse cx="${x}" cy="410" rx="58" ry="18" fill="var(--ph-bg2)"/><path d="M${x - 58} 410 v40 h116 v-40" fill="var(--ph-bg2)" opacity=".85"/>`).join("")}`),

    primavera: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 92}" y="60" width="80" height="260" fill="var(--ph-mid)" stroke="var(--ph-fg)" stroke-width="4"/><path d="M${60 + i * 92} 60 V320 M${20 + i * 92} 150 H${100 + i * 92}" stroke="var(--ph-fg)" stroke-width="2"/>`).join("")}
      <path d="M0 40 Q100 70 200 40 T400 40" stroke="var(--ph-fg)" stroke-width="2" fill="none"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${16 + i * 34}" cy="${48 + Math.sin(i * 0.9) * 12}" r="5" fill="var(--ph-ac)"/>`).join("")}
      <rect x="0" y="320" width="400" height="180" fill="var(--ph-fg)" opacity=".75"/>
      ${[40, 360].map((x) => `<path d="M${x} 330 c-30 -60 -10 -110 0 -150 c10 40 30 90 0 150Z" fill="var(--ph-ac)" opacity=".9"/><rect x="${x - 18}" y="320" width="36" height="34" fill="var(--ph-bg2)"/>`).join("")}`),

    evento: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      ${[0, 1, 2].map((r) => `<path d="M0 ${60 + r * 50} Q200 ${130 + r * 50} 400 ${60 + r * 50}" stroke="var(--ph-fg)" stroke-width="1.5" fill="none" opacity=".6"/>` + Array.from({ length: 11 }, (_, i) => { const t = i / 10; const y = (1 - t) * (1 - t) * (60 + r * 50) + 2 * (1 - t) * t * (130 + r * 50) + t * t * (60 + r * 50); return `<circle cx="${t * 400}" cy="${y + 4}" r="4.5" fill="var(--ph-ac)"/>`; }).join("")).join("")}
      <path d="M0 330 L400 300 V500 H0Z" fill="var(--ph-fg)" opacity=".8"/>
      ${Array.from({ length: 6 }, (_, i) => `<circle cx="${50 + i * 60}" cy="${300 - (i % 2) * 10}" r="14" fill="var(--ph-fg)"/><path d="M${30 + i * 60} ${350 - (i % 2) * 10} c0-30 40-30 40 0Z" fill="var(--ph-fg)"/>`).join("")}`),

    mesa: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <ellipse cx="200" cy="300" rx="170" ry="70" fill="var(--ph-bg2)"/>
      <ellipse cx="200" cy="300" rx="170" ry="70" fill="none" stroke="var(--ph-fg)" stroke-width="3"/>
      ${[-110, -55, 0, 55, 110].map((x, i) => `<ellipse cx="${200 + x}" cy="${300 + (i % 2 ? 18 : -14)}" rx="24" ry="9" fill="var(--ph-mid)" stroke="var(--ph-fg)" stroke-width="2"/>`).join("")}
      <rect x="194" y="200" width="12" height="80" fill="var(--ph-fg)"/>
      ${[-24, -8, 8, 24].map((x) => `<path d="M${200 + x} 200 c-10 -30 10 -50 0 -80" stroke="var(--ph-ac)" stroke-width="4" fill="none"/>`).join("")}`),

    fachada: (id) => L(`
      <rect width="400" height="500" fill="url(#s${id})"/>
      <rect x="60" y="80" width="280" height="380" fill="var(--ph-mid)"/>
      <path d="M50 80 H350 V100 H50Z" fill="var(--ph-fg)"/>
      <path d="M140 460 V260 A60 60 0 0 1 260 260 V460" fill="var(--ph-fg)"/>
      <rect x="92" y="130" width="60" height="80" fill="var(--ph-bg)" stroke="var(--ph-fg)" stroke-width="4"/>
      <rect x="248" y="130" width="60" height="80" fill="var(--ph-bg)" stroke="var(--ph-fg)" stroke-width="4"/>
      <path d="M150 236 H250" stroke="var(--ph-ac)" stroke-width="3"/>
      <rect x="0" y="460" width="400" height="40" fill="var(--ph-fg)" opacity=".8"/>`),
  };

  let seq = 0;

  /* Devuelve el HTML de una imagen por clave.
     opts.tone: "azul" | "noche" | "rojo" | "papel" | "calido"
     opts.tag: texto de la etiqueta (false para ocultarla) */
  function foto(key, opts = {}) {
    const id = ++seq;
    const tone = opts.tone || "azul";
    const src = ABER.fotos && ABER.fotos[key];
    const scene = scenes[key] || scenes.tribuna;
    // Con foto real no se muestra la etiqueta "Imagen ilustrativa" (sí los rótulos de formato).
    const tagText = opts.tag === false ? "" : (opts.tag || "Imagen ilustrativa");
    const tag = !tagText || (src && /ilustrativa/i.test(tagText)) ? "" : `<span class="ph__tag">${tagText}</span>`;
    const img = src ? `<img src="${src}" alt="${opts.alt || ""}" loading="lazy" onerror="this.remove()">` : "";
    return `<figure class="ph ph--${tone} ${opts.cls || ""}" data-foto="${key}">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grain(id)}${scene(id)}<rect width="400" height="500" fill="url(#g${id})"/></svg>
      ${img}${tag}</figure>`;
  }

  return { foto, scenes: Object.keys(scenes) };
})();
