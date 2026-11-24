/* =====================================================================
   GHOSTING DETECTOR™ · Panel de administración
   Acceso: Supabase Auth + tabla public.admins (RLS). Sin claves secretas.
   ===================================================================== */
(function () {
  'use strict';
  const API = window.GD_API, S = window.GD_STATS, L = S.LABELS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let rows = [], settings = null, dataset = 'real', page = 0, importRows = [];
  const PAGE = 50;

  /* ---------------- Utilidades ---------------- */
  function toast(msg, ms) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, ms || 3500);
  }
  function toLocalInput(iso) {
    if (!iso) return '';
    const d = new Date(iso); const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function fromLocalInput(v) { return v ? new Date(v).toISOString() : null; }
  function fmtDate(iso) { const d = new Date(iso); return d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); }
  const excel = () => $('#excelSep').checked;
  function numOut(x, digits) {
    if (x == null || x === '' || isNaN(x)) return '';
    const s = typeof x === 'number' ? (Number.isInteger(x) ? String(x) : x.toFixed(digits == null ? 4 : digits)) : String(x);
    return excel() ? s.replace('.', ',') : s;
  }
  function csv(rowsArr) {
    const sep = excel() ? ';' : ',';
    return '﻿' + rowsArr.map(r => r.map(v => {
      const s = v == null ? '' : String(v);
      return /[",;\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(sep)).join('\r\n');
  }
  function download(name, content, type) {
    const blob = new Blob([content], { type: type || 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const stampName = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');

  /* ---------------- Vistas y sesión ---------------- */
  function show(view) {
    ['loginView', 'noConfigView', 'panelView'].forEach(id => { $('#' + id).hidden = id !== view; });
    $('#barUser').hidden = view !== 'panelView';
  }

  async function boot() {
    if (!API.configured) return show('noConfigView');
    const token = await API.getToken();
    if (!token) return show('loginView');
    try {
      const ok = await API.rpc('is_admin', {}, token);
      if (ok !== true) { await API.signOut(); show('loginView'); $('#loginErr').textContent = 'Este usuario no tiene permisos de administración.'; return; }
    } catch (e) { show('loginView'); $('#loginErr').textContent = e.message; return; }
    $('#userEmail').textContent = (API.loadSession() || {}).email || '';
    show('panelView');
    await loadAll();
  }

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#email').value.trim(), pass = $('#password').value;
    const err = $('#loginErr'); err.textContent = '';
    if (!email || !pass) { err.textContent = 'Completá email y contraseña.'; return; }
    $('#loginBtn').disabled = true;
    try { await API.signIn(email, pass); $('#password').value = ''; await boot(); }
    catch (e2) { err.textContent = /invalid/i.test(e2.message) ? 'Email o contraseña incorrectos.' : e2.message; }
    finally { $('#loginBtn').disabled = false; }
  });
  $('#logoutBtn').addEventListener('click', async () => { await API.signOut(); rows = []; show('loginView'); });
  $('#refreshBtn').addEventListener('click', () => loadAll());

  async function loadAll() {
    try {
      const st = await API.table('GET', 'study_settings?id=eq.1&select=*');
      settings = (st.data && st.data[0]) || null;
      if (settings && !loadAll._initCutoff) {
        $('#cutoffInput').value = toLocalInput(settings.cutoff_at);
        loadAll._initCutoff = true;
      }
      fillSettingsForm();
      rows = await API.selectAll('responses?select=*&order=created_at.asc');
      renderAll();
      toast('Datos actualizados · ' + rows.length + ' registros en la base');
    } catch (e) {
      if (e.code === 'sin_sesion') { show('loginView'); $('#loginErr').textContent = e.message; return; }
      toast('Error al cargar: ' + e.message, 6000);
    }
  }

  /* ---------------- Filtros ---------------- */
  $$('[data-ds]').forEach(b => b.addEventListener('click', () => {
    dataset = b.dataset.ds; $$('[data-ds]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); page = 0; renderAll();
  }));
  ['cutoffInput', 'srcWeb', 'srcImport', 'onlyFlags', 'showInvalid'].forEach(id => $('#' + id).addEventListener('change', () => { page = 0; renderAll(); }));
  $('#cutoffClear').addEventListener('click', () => { $('#cutoffInput').value = ''; renderAll(); });

  function cutoffDate() { const v = $('#cutoffInput').value; return v ? new Date(v) : null; }
  function filtered() {
    const cut = cutoffDate();
    return rows.filter(r =>
      (dataset === 'all' || (dataset === 'test' ? r.is_test : !r.is_test)) &&
      ((r.source === 'web' && $('#srcWeb').checked) || (r.source === 'import' && $('#srcImport').checked)) &&
      (!cut || new Date(r.created_at) <= cut));
  }
  const isValid = r => r.status === 'valida';
  // Más de 35 con la encuesta completa: se guarda, pero queda fuera del análisis (18 a 35)
  const isOver35 = r => !r.eligible && r.age_group === 'mayor_35' && r.x1 != null;
  const eligibleValid = list => list.filter(r => isValid(r) && r.eligible);
  const analytic = list => eligibleValid(list).filter(r => r.y_strategy === 'explicita' || r.y_strategy === 'ghosting');

  function flagsOf(r) {
    const f = [];
    if (isOver35(r)) f.push(['Más de 35', '']);
    else if (!r.eligible) f.push(['No elegible', 'b']);
    if (r.eligible && r.y_strategy === 'otra') f.push(['Otra situación', 'w']);
    if (r.eligible && r.source === 'web' && r.elapsed_seconds != null && r.elapsed_seconds < 20) f.push(['Rápida', 'w']);
    if (r.eligible && r.x1 === r.x2 && r.x2 === r.x3 && r.x3 === r.x4) f.push(['Uniforme', '']);
    if (r.status === 'invalida') f.push(['Inválida', 'b']);
    return f;
  }

  /* ---------------- Cálculos ---------------- */
  function crosstab(list) {
    const t = {}; S.LEVELS.forEach(l => { t[l] = { explicita: 0, ghosting: 0 }; });
    list.forEach(r => { if (t[r.x_level]) t[r.x_level][r.y_strategy]++; });
    return t;
  }
  function normCdf(z) { // Abramowitz-Stegun 7.1.26
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  }
  /** Cochran–Armitage: tendencia lineal de la proporción de ghosting según el nivel ordinal de X */
  function trendTest(t) {
    const sc = { baja: 1, media: 2, alta: 3 };
    let N = 0, R = 0, snt = 0, snt2 = 0, T = 0;
    S.LEVELS.forEach(l => { const n = t[l].explicita + t[l].ghosting; N += n; R += t[l].ghosting; snt += n * sc[l]; snt2 += n * sc[l] * sc[l]; });
    if (!N || R === 0 || R === N) return null;
    const p = R / N;
    S.LEVELS.forEach(l => { const n = t[l].explicita + t[l].ghosting; T += sc[l] * (t[l].ghosting - n * p); });
    const v = p * (1 - p) * (snt2 - snt * snt / N);
    if (!(v > 0)) return null;
    const z = T / Math.sqrt(v);
    return { z, pOneSided: 1 - normCdf(z), pTwoSided: 2 * (1 - normCdf(Math.abs(z))) };
  }
  function analysis(list) {
    const an = analytic(list);
    const t = crosstab(an);
    const table = S.LEVELS.map(l => [t[l].explicita, t[l].ghosting]);
    const chi = an.length ? S.chiSquareTest(table) : { valid: false, N: 0, reasons: ['No hay respuestas en la muestra analítica.'] };
    return { an, t, chi, trend: trendTest(t) };
  }

  /* ---------------- Render ---------------- */
  function renderAll() {
    const list = filtered();
    const ev = eligibleValid(list), an = analytic(list);
    const cut = cutoffDate();
    $('#cutoffInfo').textContent = settings && settings.cutoff_at ? 'Corte oficial guardado: ' + fmtDate(settings.cutoff_at) : 'No hay fecha de corte oficial guardada (Configuración).';
    $('#sampleLine').innerHTML = `<b>Muestra analítica: n = ${an.length}</b> · datos ${dataset === 'real' ? 'reales' : dataset === 'test' ? 'de prueba' : 'reales + prueba'} · ${cut ? 'hasta el ' + esc(fmtDate(cut.toISOString())) : 'sin fecha de corte (incluye todo)'}${dataset !== 'real' ? ' · <b style="color:#a3213f">Atención: incluye datos de prueba; no usar para el TP.</b>' : ''}`;
    const nInvalid = list.filter(r => !isValid(r)).length;
    const nFlags = list.filter(r => flagsOf(r).some(f => f[1])).length;
    $('#kpis').innerHTML = [
      ['main', an.length, 'muestra analítica (X × Y)'],
      ['', list.length, 'registros en el filtro'],
      ['', ev.length, 'elegibles válidas'],
      ['', ev.filter(r => r.y_strategy === 'otra').length, '“otra situación”'],
      ['', list.filter(r => isValid(r) && isOver35(r)).length, 'más de 35 (fuera del análisis)'],
      ['', list.filter(r => isValid(r) && !r.eligible && !isOver35(r)).length, 'no elegibles'],
      ['', nInvalid, 'marcadas inválidas']
    ].map(k => `<div class="kpi ${k[0]}"><b>${k[1]}</b><span>${k[2]}</span></div>`).join('');
    renderAnalysis(list);
    renderStrata(list);
    renderOver35(list);
    renderFreq(list);
    renderTable();
    void nFlags;
  }

  function ctHTML(t, withExpected, chi) {
    const tot = { explicita: 0, ghosting: 0 };
    S.LEVELS.forEach(l => { tot.explicita += t[l].explicita; tot.ghosting += t[l].ghosting; });
    const N = tot.explicita + tot.ghosting;
    let expIdx = 0;
    const body = S.LEVELS.map(l => {
      const n = t[l].explicita + t[l].ghosting;
      let exp = '';
      if (withExpected && chi && chi.valid && n > 0) {
        const i = chi.rowsUsed.indexOf(S.LEVELS.indexOf(l));
        if (i >= 0) exp = chi.colsUsed.map(j => chi.expected[i][chi.colsUsed.indexOf(j)].toFixed(2).replace('.', ',')).join(' / ');
        expIdx++;
      }
      return `<tr><th scope="row">${L.levelShort[l]} <small>${L.levelRange[l]}</small></th>
        <td>${t[l].explicita} <small>(${S.pct(t[l].explicita, n)})</small></td>
        <td>${t[l].ghosting} <small>(${S.pct(t[l].ghosting, n)})</small></td>
        <td>${n}${withExpected ? ` <small>(${S.pct(n, N)} del total)</small>` : ''}</td>
        ${withExpected ? `<td>${exp || '–'}</td>` : ''}</tr>`;
    }).join('');
    return `<div class="table-scroll"><table class="ctab"><thead><tr><th>Incomodidad (X)</th><th>Ruptura explícita</th><th>Ghosting</th><th>Total fila</th>${withExpected ? '<th>Esperadas (expl. / ghost.)</th>' : ''}</tr></thead>
      <tbody>${body}</tbody>
      <tfoot><tr><th scope="row">Total</th><td>${tot.explicita} <small>(${S.pct(tot.explicita, N)})</small></td><td>${tot.ghosting} <small>(${S.pct(tot.ghosting, N)})</small></td><td>${N}</td>${withExpected ? '<td></td>' : ''}</tr></tfoot></table></div>`;
  }

  function renderAnalysis(list) {
    const { an, t, chi, trend } = analysis(list);
    $('#crosstab').innerHTML = an.length ? ctHTML(t, true, chi) : '<p class="callout">Todavía no hay respuestas en la muestra analítica con este filtro.</p>';
    $('#chart').innerHTML = an.length ? S.LEVELS.map(l => {
      const n = t[l].explicita + t[l].ghosting;
      const pe = n ? t[l].explicita / n * 100 : 0, pg = n ? 100 - pe : 0;
      return `<div class="srow"><b>${L.levelShort[l]}</b><div class="sbar" title="${L.level[l]}: ${t[l].explicita} ruptura / ${t[l].ghosting} ghosting">${n ? `<span class="ex" style="width:${pe}%">${pe >= 12 ? Math.round(pe) + '%' : ''}</span><span class="gh" style="width:${pg}%">${pg >= 12 ? Math.round(pg) + '%' : ''}</span>` : ''}</div><small>n = ${n}</small></div>`;
    }).join('') + '<div class="legend"><span><i style="background:var(--c-explicit)"></i>Ruptura explícita</span><span><i style="background:var(--c-ghost)"></i>Ghosting</span></div>' : '';

    let html = '';
    if (!chi.valid) {
      html = `<p class="callout bad"><b>No se puede calcular el contraste.</b> ${esc(chi.reasons.join(' '))}</p>`;
    } else {
      html = `<div class="chi-grid">
        <div><b>${S.num(chi.chi2, 3)}</b><span>χ² de Pearson</span></div>
        <div><b>${chi.df}</b><span>grados de libertad</span></div>
        <div><b>${S.formatP(chi.p)}</b><span>p-valor</span></div>
        <div><b>${S.num(chi.cramerV, 3)}</b><span>V de Cramér (intensidad)</span></div></div>
        <p>N = ${chi.N} · frecuencia esperada mínima: ${S.num(chi.minExpected, 2)} · celdas con esperada &lt; 5: ${S.num(chi.pctExpectedBelow5, 0)}%${chi.rowsUsed.length < 3 ? ` · <b>Atención:</b> se excluyeron niveles de X sin casos (${3 - chi.rowsUsed.length})` : ''}.</p>`;
      if (!chi.assumptionsOk) {
        html += `<p class="callout bad"><b>No se cumplen los supuestos del contraste.</b> ${esc(chi.reasons.join(' '))} El valor p de chi-cuadrado no es confiable con esta muestra. Opciones: ampliar la muestra antes del corte, agrupar categorías (por ejemplo, media + alta) justificándolo en el TP, o usar una prueba exacta.</p>`;
      } else {
        const sig = chi.p < 0.05;
        html += `<p class="callout ${sig ? 'good' : ''}">Con un nivel de significación α = 0,05: <b>p ${sig ? '<' : '≥'} 0,05</b>. ${sig
          ? 'Los datos de esta muestra aportan evidencia estadística para rechazar H0 (independencia entre X e Y). El contraste indica asociación, no su dirección ni causalidad: la dirección se lee en los porcentajes por fila.'
          : 'Los datos de esta muestra no aportan evidencia estadística suficiente para rechazar H0 (independencia entre X e Y). Esto no prueba que no haya relación: puede deberse al tamaño de la muestra.'}</p>`;
      }
      const g = S.LEVELS.map(l => { const n = t[l].explicita + t[l].ghosting; return n ? `${L.levelShort[l].toLowerCase()} ${S.pct(t[l].ghosting, n)}` : `${L.levelShort[l].toLowerCase()} sin casos`; });
      html += `<p><b>Dirección (descriptiva):</b> proporción de ghosting por nivel de incomodidad → ${g.join(' · ')}.</p>`;
      if (trend) {
        html += `<p class="hint"><b>Complementario · tendencia lineal (Cochran–Armitage, puntajes 1-2-3):</b> Z = ${S.num(trend.z, 3)} · p unilateral (más incomodidad → más ghosting) = ${S.formatP(trend.pOneSided)} · p bilateral = ${S.formatP(trend.pTwoSided)}. Usa el orden de X, que es lo que plantea H1; reportalo solo si la cátedra lo admite y con los mismos recaudos de tamaño muestral.</p>`;
      }
    }
    html += '<p class="hint">Ningún resultado de este panel establece causalidad. La muestra es por conveniencia: las conclusiones se limitan a quienes participaron.</p>';
    $('#chi').innerHTML = html;
  }

  function renderStrata(list) {
    const an = analytic(list);
    $('#strata').innerHTML = S.DEPTHS.map(d => {
      const sub = an.filter(r => r.z_depth === d);
      const t = crosstab(sub);
      const chi = sub.length ? S.chiSquareTest(S.LEVELS.map(l => [t[l].explicita, t[l].ghosting])) : null;
      return `<div><h3>${L.z[d]} · n = ${sub.length}</h3>${ctHTML(t, false)}<p class="hint">${chi && chi.valid ? `χ² = ${S.num(chi.chi2, 2)} · gl = ${chi.df} · p = ${S.formatP(chi.p)}${chi.assumptionsOk ? '' : ' · <b>no cumple supuestos</b>'}` : 'Sin datos suficientes para un contraste.'}</p></div>`;
    }).join('');
  }

  function renderOver35(list) {
    const o = list.filter(r => isValid(r) && isOver35(r));
    const bin = o.filter(r => r.y_strategy === 'explicita' || r.y_strategy === 'ghosting');
    const t = crosstab(bin);
    $('#over35').innerHTML = o.length
      ? `<p class="hint">${o.length} respuestas de personas de más de 35 años · ${bin.length} con ruptura explícita o ghosting · ${o.length - bin.length} con «otra situación».</p>${ctHTML(t, false)}`
      : '<p class="hint">Todavía no hay respuestas de personas de más de 35 años con este filtro.</p>';
  }

  function freqTables(list) {
    const ev = eligibleValid(list);
    const count = (key, cats, src) => cats.map(c => [c, (src || ev).filter(r => r[key] === c).length]);
    return {
      n: ev.length,
      x_level: count('x_level', S.LEVELS),
      y: count('y_strategy', ['explicita', 'ghosting', 'otra']),
      z: count('z_depth', S.DEPTHS),
      age: count('age_group', ['18_24', '25_29', '30_35']),
      x_total: Array.from({ length: 17 }, (_, i) => i + 4).map(v => [v, ev.filter(r => r.x_total === v).length]),
      items: ['x1', 'x2', 'x3', 'x4'].map(k => [k, ev.length ? ev.reduce((a, r) => a + r[k], 0) / ev.length : null])
    };
  }
  function renderFreq(list) {
    const f = freqTables(list);
    const tbl = (title, data, lab) => `<div><h3>${title}</h3><table><thead><tr><th>Categoría</th><th>f</th><th>%</th></tr></thead><tbody>${data.map(([c, n]) => `<tr><td>${esc(lab ? lab[c] : c)}</td><td>${n}</td><td>${S.pct(n, f.n)}</td></tr>`).join('')}</tbody><tfoot><tr><td>Total</td><td>${f.n}</td><td>${f.n ? '100%' : '–'}</td></tr></tfoot></table></div>`;
    $('#freq').innerHTML = tbl('X · Incomodidad (nivel)', f.x_level, L.level) + tbl('Y · Estrategia', f.y, L.y) + tbl('Z · Profundidad', f.z, L.z) +
      tbl('Edad', f.age, L.age) + tbl('X · Puntaje total (4–20)', f.x_total) +
      `<div><h3>Media por ítem (1–5)</h3><table><thead><tr><th>Ítem</th><th>Media</th></tr></thead><tbody>${f.items.map(([k, m]) => `<tr><td>${k.toUpperCase()}</td><td>${m == null ? '–' : S.num(m, 2)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  /* ---------------- Tabla de respuestas ---------------- */
  function renderTable() {
    let list = filtered().slice().reverse();
    if (!$('#showInvalid').checked) list = list.filter(isValid);
    if ($('#onlyFlags').checked) list = list.filter(r => flagsOf(r).some(f => f[1]));
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    page = Math.min(page, pages - 1);
    const slice = list.slice(page * PAGE, page * PAGE + PAGE);
    $('#rtable').innerHTML = `<thead><tr><th>#</th><th>Fecha</th><th>Origen</th><th>Edad</th><th>X1</th><th>X2</th><th>X3</th><th>X4</th><th>Total</th><th>Nivel</th><th>Y</th><th>Z</th><th>Seg.</th><th>Alertas</th><th>Acciones</th></tr></thead>
      <tbody>${slice.map(r => `<tr class="${isValid(r) ? '' : 'invalid'}">
        <td>${r.id}</td><td>${esc(fmtDate(r.created_at))}</td>
        <td>${esc(r.source)}${r.is_test ? ' <span class="pill test">prueba</span>' : ''}${r.import_batch ? `<br/><small>${esc(r.import_batch)}</small>` : ''}</td>
        <td>${esc(L.age[r.age_group] || '–')}</td>
        <td>${r.x1 ?? '–'}</td><td>${r.x2 ?? '–'}</td><td>${r.x3 ?? '–'}</td><td>${r.x4 ?? '–'}</td>
        <td>${r.x_total ?? '–'}</td><td>${esc(r.x_level ? L.levelShort[r.x_level] : '–')}</td>
        <td>${esc(r.y_strategy ? L.y[r.y_strategy] : (r.screen_out_reason ? L.reason[r.screen_out_reason] : '–'))}</td>
        <td>${esc(r.z_depth ? L.z[r.z_depth] : '–')}</td><td>${r.elapsed_seconds ?? '–'}</td>
        <td>${flagsOf(r).map(f => `<span class="flag ${f[1]}">${f[0]}</span>`).join('')}${r.admin_note ? `<br/><small title="${esc(r.admin_note)}">📝 ${esc(r.admin_note.slice(0, 40))}</small>` : ''}</td>
        <td class="actions"><button type="button" data-status="${r.id}">${isValid(r) ? 'Invalidar' : 'Restaurar'}</button><button type="button" data-note="${r.id}">Nota</button><button type="button" data-test="${r.id}">${r.is_test ? '→ Real' : '→ Prueba'}</button></td>
      </tr>`).join('') || '<tr><td colspan="15">No hay respuestas con este filtro.</td></tr>'}</tbody>`;
    $('#pager').innerHTML = `<span>${list.length} filas · página ${page + 1} de ${pages}</span><button class="btn sm" data-page="-1" ${page === 0 ? 'disabled' : ''}>←</button><button class="btn sm" data-page="1" ${page >= pages - 1 ? 'disabled' : ''}>→</button>`;
  }
  $('#pager').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) { page += +b.dataset.page; renderTable(); } });

  async function patchRow(id, body) {
    await API.table('PATCH', 'responses?id=eq.' + encodeURIComponent(id), body, { Prefer: 'return=minimal' });
    const r = rows.find(x => x.id === id); Object.assign(r, body); renderAll();
  }
  $('#rtable').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    try {
      if (b.dataset.status) {
        const id = +b.dataset.status, r = rows.find(x => x.id === id);
        const next = r.status === 'valida' ? 'invalida' : 'valida';
        let note = r.admin_note;
        if (next === 'invalida') { const n = prompt('Motivo de invalidación (queda registrado):', r.admin_note || ''); if (n === null) return; note = n.slice(0, 500); }
        await patchRow(id, { status: next, admin_note: note || null });
        toast('Respuesta #' + id + (next === 'invalida' ? ' marcada como inválida' : ' restaurada como válida'));
      } else if (b.dataset.note) {
        const id = +b.dataset.note, r = rows.find(x => x.id === id);
        const n = prompt('Nota interna:', r.admin_note || ''); if (n === null) return;
        await patchRow(id, { admin_note: n.slice(0, 500) || null });
      } else if (b.dataset.test) {
        const id = +b.dataset.test, r = rows.find(x => x.id === id);
        if (!confirm(r.is_test ? '¿Pasar esta respuesta a datos REALES?' : '¿Marcar esta respuesta como PRUEBA? Saldrá de los resultados públicos y del análisis real.')) return;
        await patchRow(id, { is_test: !r.is_test });
      }
    } catch (err) { toast('No se pudo guardar: ' + err.message, 6000); }
  });

  /* ---------------- Exportaciones ---------------- */
  const RAW_HEADERS = ['id', 'fecha_hora', 'origen', 'lote', 'es_prueba', 'estado', 'en_muestra_analitica', 'elegible', 'motivo_exclusion', 'edad', 'residencia_urbana', 'usa_redes_apps', 'finalizo_vinculo_12m', 'x1', 'x2', 'x3', 'x4', 'x_total', 'x_nivel', 'y', 'z', 'segundos', 'nota'];
  const yn = v => v == null ? '' : (v ? 'si' : 'no');
  function rawRows(list) {
    const anIds = new Set(analytic(list).map(r => r.id));
    return [RAW_HEADERS].concat(list.map(r => [r.id, r.created_at, r.source, r.import_batch || '', yn(r.is_test), r.status, anIds.has(r.id) ? 1 : 0, yn(r.eligible), r.screen_out_reason || '', r.age_group || '', yn(r.urban), yn(r.uses_apps), yn(r.ended_recently), r.x1 ?? '', r.x2 ?? '', r.x3 ?? '', r.x4 ?? '', r.x_total ?? '', r.x_level || '', r.y_strategy || '', r.z_depth || '', r.elapsed_seconds ?? '', r.admin_note || '']));
  }
  function crosstabRows(list) {
    const { t, chi, an, trend } = analysis(list);
    const out = [['Tabla de contingencia X (incomodidad) x Y (estrategia)'], ['Muestra', 'n = ' + an.length, sampleDesc()], [],
      ['Nivel X', 'Ruptura explícita (f)', 'Ghosting (f)', 'Total fila', 'Ruptura explícita (% fila)', 'Ghosting (% fila)', 'Esperada ruptura', 'Esperada ghosting']];
    let te = 0, tg = 0;
    S.LEVELS.forEach((l, li) => {
      const e = t[l].explicita, g = t[l].ghosting, n = e + g; te += e; tg += g;
      let ee = '', eg = '';
      if (chi.valid) { const i = chi.rowsUsed.indexOf(li); if (i >= 0) { ee = chi.expected[i][0]; eg = chi.expected[i][1]; } }
      out.push([L.levelShort[l] + ' (' + L.levelRange[l] + ')', e, g, n, n ? numOut(e / n * 100, 2) : '', n ? numOut(g / n * 100, 2) : '', numOut(ee, 3), numOut(eg, 3)]);
    });
    const N = te + tg;
    out.push(['Total', te, tg, N, N ? numOut(te / N * 100, 2) : '', N ? numOut(tg / N * 100, 2) : '']);
    out.push([]);
    if (chi.valid) {
      out.push(['Chi-cuadrado', numOut(chi.chi2, 4)], ['Grados de libertad', chi.df], ['p-valor', numOut(chi.p, 6)], ['V de Cramér', numOut(chi.cramerV, 4)],
        ['Frecuencia esperada mínima', numOut(chi.minExpected, 3)], ['% celdas con esperada < 5', numOut(chi.pctExpectedBelow5, 1)], ['Supuestos de Cochran cumplidos', chi.assumptionsOk ? 'si' : 'no']);
      if (trend) out.push(['Cochran-Armitage Z', numOut(trend.z, 4)], ['Cochran-Armitage p unilateral', numOut(trend.pOneSided, 6)]);
    } else out.push(['Contraste chi-cuadrado', 'no calculable: ' + chi.reasons.join(' ')]);
    return out;
  }
  function sampleDesc() {
    const cut = cutoffDate();
    return `datos ${dataset === 'real' ? 'reales' : dataset === 'test' ? 'de PRUEBA' : 'reales + PRUEBA'}; origen ${[$('#srcWeb').checked && 'web', $('#srcImport').checked && 'importadas'].filter(Boolean).join(' + ')}; corte ${cut ? fmtDate(cut.toISOString()) : 'sin corte'}; solo válidas y elegibles; Y binaria`;
  }
  function reportTxt(list) {
    const { t, chi, an, trend } = analysis(list);
    const f = freqTables(list);
    const lines = [];
    lines.push('GHOSTING DETECTOR™ · TP2 · Resumen de datos para los puntos 3 y 4');
    lines.push('Generado: ' + fmtDate(new Date().toISOString()));
    lines.push('Definición de la muestra: ' + sampleDesc());
    lines.push('Elegibles válidas: ' + f.n + ' · Muestra analítica (ruptura explícita / ghosting): ' + an.length + ' · "Otra situación": ' + f.y[2][1]);
    lines.push('');
    lines.push('TABLA DE CONTINGENCIA X × Y (frecuencias absolutas y % por fila)');
    lines.push(['Nivel X'.padEnd(20), 'Ruptura explícita'.padEnd(22), 'Ghosting'.padEnd(22), 'Total'].join(''));
    let te = 0, tg = 0;
    S.LEVELS.forEach(l => {
      const e = t[l].explicita, g = t[l].ghosting, n = e + g; te += e; tg += g;
      lines.push([(L.levelShort[l] + ' ' + L.levelRange[l]).padEnd(20), (e + ' (' + S.pct(e, n) + ')').padEnd(22), (g + ' (' + S.pct(g, n) + ')').padEnd(22), String(n)].join(''));
    });
    lines.push(['Total'.padEnd(20), (te + ' (' + S.pct(te, te + tg) + ')').padEnd(22), (tg + ' (' + S.pct(tg, te + tg) + ')').padEnd(22), String(te + tg)].join(''));
    lines.push('');
    lines.push('CONTRASTE CHI-CUADRADO DE INDEPENDENCIA');
    if (!chi.valid) lines.push('No calculable: ' + chi.reasons.join(' '));
    else {
      lines.push('χ² = ' + S.num(chi.chi2, 3) + ' · gl = ' + chi.df + ' · p = ' + S.formatP(chi.p) + ' · V de Cramér = ' + S.num(chi.cramerV, 3));
      lines.push('Frecuencia esperada mínima = ' + S.num(chi.minExpected, 2) + ' · celdas con esperada < 5 = ' + S.num(chi.pctExpectedBelow5, 0) + '%');
      lines.push('Supuestos (ninguna esperada < 1 y ≤ 20% < 5): ' + (chi.assumptionsOk ? 'se cumplen' : 'NO se cumplen — ' + chi.reasons.join(' ')));
      if (trend) lines.push('Complementario · Cochran–Armitage: Z = ' + S.num(trend.z, 3) + ' · p unilateral = ' + S.formatP(trend.pOneSided));
      lines.push('Regla de decisión (α = 0,05): si p < 0,05 y se cumplen los supuestos, se rechaza H0 (independencia).');
    }
    lines.push('');
    lines.push('Recaudos: muestra por conveniencia (no representativa); asociación no implica causalidad; índice de incomodidad exploratorio, no validado.');
    return lines.join('\r\n');
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-export]'); if (!b) return;
    const list = filtered(), kind = b.dataset.export, tag = (dataset === 'real' ? '' : '_' + dataset.toUpperCase()) + '_' + stampName();
    if (kind === 'raw') download('ghosting_respuestas' + tag + '.csv', csv(rawRows(list)));
    if (kind === 'analytic') { const ids = new Set(analytic(list).map(r => r.id)); download('ghosting_muestra_analitica' + tag + '.csv', csv(rawRows(list.filter(r => ids.has(r.id))))); }
    if (kind === 'crosstab') download('ghosting_tabla_contingencia' + tag + '.csv', csv(crosstabRows(list)));
    if (kind === 'report') download('ghosting_resumen_TP2' + tag + '.txt', '﻿' + reportTxt(list), 'text/plain;charset=utf-8');
    if (kind === 'freq') {
      const f = freqTables(list), out = [['Variable', 'Categoría', 'f', '%']];
      const add = (v, data, lab) => data.forEach(([c, n]) => out.push([v, lab ? lab[c] : c, n, f.n ? numOut(n / f.n * 100, 2) : '']));
      add('X nivel', f.x_level, L.level); add('Y', f.y, L.y); add('Z', f.z, L.z); add('Edad', f.age, L.age); add('X total', f.x_total);
      out.push([]); out.push(['n elegibles válidas', f.n]);
      download('ghosting_frecuencias' + tag + '.csv', csv(out));
    }
    if (kind === 'strata') {
      const an = analytic(list), out = [['Profundidad (Z)', 'Nivel X', 'Ruptura explícita', 'Ghosting', 'Total', '% ghosting']];
      S.DEPTHS.forEach(d => { const t = crosstab(an.filter(r => r.z_depth === d)); S.LEVELS.forEach(l => { const n = t[l].explicita + t[l].ghosting; out.push([L.z[d], L.levelShort[l], t[l].explicita, t[l].ghosting, n, n ? numOut(t[l].ghosting / n * 100, 2) : '']); }); });
      download('ghosting_estratos_Z' + tag + '.csv', csv(out));
    }
  });

  /* ---------------- Importación ---------------- */
  const TEMPLATE = 'fecha,edad,residencia_urbana,usa_redes_apps,x1,x2,x3,x4,y,z,nota\r\n2026-11-20 18:30,25_29,si,si,4,5,3,4,ghosting,digital,encuesta en papel\r\n';
  $('#tplBtn').addEventListener('click', () => download('plantilla_importacion_ghosting.csv', '﻿' + TEMPLATE));

  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const first = text.split(/\r?\n/)[0] || '';
    const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
    const out = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); out.push(row); row = []; cur = ''; }
      else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); out.push(row); }
    return out.filter(r => r.some(v => v.trim() !== ''));
  }
  const norm = s => String(s == null ? '' : s).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s\-]+/g, '_');
  const ALIASES = {
    fecha: 'created_at', fecha_hora: 'created_at', created_at: 'created_at',
    edad: 'age', age_group: 'age', grupo_edad: 'age',
    residencia_urbana: 'urban', urban: 'urban', urbano: 'urban',
    usa_redes_apps: 'apps', uses_apps: 'apps', usa_apps: 'apps',
    finalizo_vinculo_12m: 'ended', finalizo_12m: 'ended', ended_recently: 'ended',
    x1: 'x1', x2: 'x2', x3: 'x3', x4: 'x4',
    y: 'y', y_estrategia: 'y', y_strategy: 'y', estrategia: 'y',
    z: 'z', z_profundidad: 'z', z_depth: 'z', profundidad: 'z',
    nota: 'note', admin_note: 'note'
  };
  function parseBool(v) { const n = norm(v); if (['si', 's', '1', 'true', 'yes', 'verdadero'].includes(n)) return true; if (['no', 'n', '0', 'false', 'falso'].includes(n)) return false; return undefined; }
  function parseAge(v) {
    const n = norm(v);
    if (/^\d{1,3}$/.test(n)) { const a = +n; return a < 18 ? 'menor_18' : a <= 24 ? '18_24' : a <= 29 ? '25_29' : a <= 35 ? '30_35' : 'mayor_35'; }
    const m = { '18_24': '18_24', '18_a_24': '18_24', '25_29': '25_29', '25_a_29': '25_29', '30_35': '30_35', '30_a_35': '30_35', menor_18: 'menor_18', menos_de_18: 'menor_18', mayor_35: 'mayor_35', mas_de_35: 'mayor_35' };
    return m[n];
  }
  function parseY(v) { const n = norm(v); if (['explicita', 'ruptura_explicita', 'ruptura', '1'].includes(n)) return 'explicita'; if (['ghosting', 'ghost', '2'].includes(n)) return 'ghosting'; if (['otra', 'otra_situacion', 'ninguna', '3'].includes(n)) return 'otra'; }
  function parseZ(v) { const n = norm(v); if (['digital', 'solo_digital', 'baja', '1'].includes(n)) return 'digital'; if (['citas_1_5', '1_5', '1_a_5', 'media', '2'].includes(n)) return 'citas_1_5'; if (['citas_mas_5', 'mas_5', 'mas_de_5', '+5', 'alta', '3'].includes(n)) return 'citas_mas_5'; }
  function parseDate(v) {
    const s = String(v || '').trim(); if (!s) return null;
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 12), +(m[5] || 0));
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 12), +(m[5] || 0), +(m[6] || 0));
    const d = new Date(s); return isNaN(d) ? undefined : d;
  }
  function validateImport(text) {
    const data = parseCSV(text);
    if (data.length < 2) return { error: 'El archivo no tiene filas de datos.' };
    const head = data[0].map(h => ALIASES[norm(h)] || null);
    const need = ['age', 'urban', 'apps'];
    const missing = need.filter(k => !head.includes(k));
    if (missing.length) return { error: 'Faltan columnas obligatorias: ' + missing.join(', ') + '. Usá la plantilla.' };
    const batch = ($('#batchName').value.trim() || 'import-' + stampName()).slice(0, 80);
    const isTest = $('#importTest').checked;
    const out = data.slice(1).map((cells, i) => {
      const o = {}; head.forEach((k, j) => { if (k) o[k] = (cells[j] || '').trim(); });
      const errs = [];
      const age = parseAge(o.age), urban = parseBool(o.urban), apps = parseBool(o.apps), ended = o.ended ? parseBool(o.ended) : null;
      if (!age) errs.push('edad'); if (urban === undefined) errs.push('residencia'); if (apps === undefined) errs.push('uso de apps');
      const date = parseDate(o.created_at); if (date === undefined) errs.push('fecha'); if (date && date > new Date()) errs.push('fecha futura');
      let eligible = false, reason = null;
      if (!errs.length) {
        if (!['18_24', '25_29', '30_35'].includes(age)) reason = 'edad';
        else if (!urban) reason = 'residencia'; else if (!apps) reason = 'uso_apps';
        eligible = !reason;
      }
      const rec = {
        submission_id: API.uuid(), created_at: (date || new Date()).toISOString(), source: 'import', import_batch: batch, is_test: isTest,
        consent: true, eligible, screen_out_reason: reason, age_group: age || null,
        urban: urban ?? null, uses_apps: apps ?? null, ended_recently: ended === undefined ? null : ended,
        x1: null, x2: null, x3: null, x4: null, y_strategy: null, z_depth: null, elapsed_seconds: null, status: 'valida',
        admin_note: (o.note || '').slice(0, 500) || null
      };
      const over35Full = reason === 'edad' && age === 'mayor_35' && urban && apps && o.x1;
      if (over35Full) rec.screen_out_reason = 'edad';
      if (eligible || over35Full) {
        ['x1', 'x2', 'x3', 'x4'].forEach(k => { const v = +o[k]; if (Number.isInteger(v) && v >= 1 && v <= 5) rec[k] = v; else errs.push(k.toUpperCase()); });
        rec.y_strategy = parseY(o.y) || null; if (!rec.y_strategy) errs.push('Y');
        rec.z_depth = parseZ(o.z) || null; if (!rec.z_depth) errs.push('Z');
      }
      return { line: i + 2, rec, errs };
    });
    return { rows: out };
  }
  async function previewImport() {
    const f = $('#importFile').files[0]; importRows = []; $('#importErr').textContent = ''; $('#importPreview').innerHTML = '';
    if (!f) { updateImportBtn(); return; }
    if (f.size > 2 * 1024 * 1024) { $('#importErr').textContent = 'El archivo supera 2 MB.'; return; }
    const res = validateImport(await f.text());
    if (res.error) { $('#importErr').textContent = res.error; updateImportBtn(); return; }
    importRows = res.rows;
    const ok = importRows.filter(r => !r.errs.length), bad = importRows.length - ok.length;
    $('#importPreview').innerHTML = `<p><b>${ok.length}</b> filas válidas (${ok.filter(r => r.rec.eligible).length} elegibles, ${ok.filter(r => !r.rec.eligible).length} fuera de criterios) · <b>${bad}</b> con errores (no se importan).</p>
      <div class="ipreview"><table><thead><tr><th>Línea</th><th>Fecha</th><th>Edad</th><th>Elegible</th><th>X1–X4</th><th>Y</th><th>Z</th><th>Errores</th></tr></thead><tbody>${importRows.slice(0, 300).map(r => `<tr class="${r.errs.length ? 'bad' : ''}"><td>${r.line}</td><td>${esc(fmtDate(r.rec.created_at))}</td><td>${esc(L.age[r.rec.age_group] || '?')}</td><td>${r.rec.eligible ? 'sí' : (r.rec.x1 != null ? 'más de 35 (fuera del análisis)' : esc(L.reason[r.rec.screen_out_reason] || 'no'))}</td><td>${[r.rec.x1, r.rec.x2, r.rec.x3, r.rec.x4].map(v => v ?? '–').join(' ')}</td><td>${esc(L.y[r.rec.y_strategy] || '–')}</td><td>${esc(L.z[r.rec.z_depth] || '–')}</td><td>${esc(r.errs.join(', '))}</td></tr>`).join('')}</tbody></table></div>`;
    updateImportBtn();
  }
  function updateImportBtn() {
    $('#importBtn').disabled = !(importRows.some(r => !r.errs.length) && $('#importConsent').checked);
  }
  ['importFile', 'importTest', 'batchName'].forEach(id => $('#' + id).addEventListener('change', previewImport));
  $('#importConsent').addEventListener('change', updateImportBtn);
  $('#importBtn').addEventListener('click', async () => {
    const ok = importRows.filter(r => !r.errs.length).map(r => r.rec);
    if (!ok.length) return;
    if (!confirm(`¿Importar ${ok.length} filas${ok[0].is_test ? ' como PRUEBA' : ' como datos REALES'}? Esta acción queda registrada con el lote “${ok[0].import_batch}”.`)) return;
    $('#importBtn').disabled = true; $('#importErr').textContent = '';
    let done = 0;
    try {
      for (let i = 0; i < ok.length; i += 200) {
        await API.table('POST', 'responses', ok.slice(i, i + 200), { Prefer: 'return=minimal' });
        done += Math.min(200, ok.length - i);
      }
      $('#importErr').className = 'err ok'; $('#importErr').textContent = `Importadas ${done} filas.`;
      $('#importFile').value = ''; importRows = []; $('#importPreview').innerHTML = '';
      await loadAll();
    } catch (e) {
      $('#importErr').className = 'err'; $('#importErr').textContent = `Error después de ${done} filas importadas: ${e.message}`;
      await loadAll();
    } finally { updateImportBtn(); }
  });

  /* ---------------- Configuración ---------------- */
  function fillSettingsForm() {
    if (!settings) return;
    $('#setCollecting').checked = settings.collecting;
    $('#setCutoff').value = toLocalInput(settings.cutoff_at);
    $('#setMinN').value = settings.min_public_n;
    $('#setMinCell').value = settings.min_cell;
  }
  $('#settingsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#settingsMsg'); msg.className = 'err'; msg.textContent = '';
    const body = {
      collecting: $('#setCollecting').checked, cutoff_at: fromLocalInput($('#setCutoff').value),
      min_public_n: Math.max(1, Math.min(1000, +$('#setMinN').value || 10)),
      min_cell: Math.max(1, Math.min(100, +$('#setMinCell').value || 5)), updated_at: new Date().toISOString()
    };
    try {
      await API.table('PATCH', 'study_settings?id=eq.1', body, { Prefer: 'return=minimal' });
      Object.assign(settings, body);
      $('#cutoffInput').value = toLocalInput(settings.cutoff_at);
      msg.className = 'err ok'; msg.textContent = 'Configuración guardada.'; renderAll();
    } catch (err) { msg.textContent = 'No se pudo guardar: ' + err.message; }
  });
  $('#purgeTest').addEventListener('click', async () => {
    const n = rows.filter(r => r.is_test).length;
    const msg = $('#purgeMsg'); msg.className = 'err';
    if (!n) { msg.textContent = 'No hay respuestas de prueba.'; return; }
    if (prompt(`Se borrarán definitivamente ${n} respuestas de prueba. Escribí BORRAR para confirmar.`) !== 'BORRAR') return;
    try {
      await API.table('DELETE', 'responses?is_test=eq.true', undefined, { Prefer: 'return=minimal' });
      msg.className = 'err ok'; msg.textContent = 'Respuestas de prueba borradas.'; await loadAll();
    } catch (err) { msg.textContent = 'No se pudo borrar: ' + err.message; }
  });

  /* ---------------- Pestañas ---------------- */
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.tab-panel').forEach(p => { p.hidden = p.id !== 'tab-' + b.dataset.tab; });
  }));

  window.__GD_ADMIN = { validateImport, parseCSV, analysis: () => analysis(filtered()), reportTxt: () => reportTxt(filtered()) };
  boot();
})();
