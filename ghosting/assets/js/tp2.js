/* =====================================================================
   GHOSTING DETECTOR™ · ¿Por qué me ghostearon? (TP2)
   Cuestionario por etapas + envío seguro + resultados agregados
   ===================================================================== */
(function () {
  'use strict';
  const API = window.GD_API, S = window.GD_STATS, L = S.LABELS;
  const CFG = window.GD_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const IS_TEST = ['prueba', 'test'].includes((params.get('modo') || '').toLowerCase());
  const STATE_KEY = 'gd_tp2_state_v1';
  const DONE_KEY = 'gd_tp2_done_v1';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // En la página de encuesta sola, los resultados viven en otra página
  const RESULTS_HREF = document.body.dataset.resultsHref || '#resultados';
  const TP1_HREF = document.body.dataset.tp1Href || '../tp1/';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  if (IS_TEST) $('#testBanner').hidden = false;

  /* ------------------------------------------------------------------
     Definición del instrumento
     ------------------------------------------------------------------ */
  const LIKERT = [
    [1, 'Totalmente en desacuerdo'], [2, 'En desacuerdo'], [3, 'Ni de acuerdo ni en desacuerdo'],
    [4, 'De acuerdo'], [5, 'Totalmente de acuerdo']
  ];
  const STEPS = [
    { id: 'consent', type: 'consent', part: 'Antes de empezar' },
    { id: 'age', type: 'choice', part: 'Filtro · 1 de 2', title: '¿Qué edad tenés?',
      options: [['menor_18', 'Menos de 18'], ['18_24', '18 a 24 años'], ['25_29', '25 a 29 años'], ['30_35', '30 a 35 años'], ['mayor_35', 'Más de 35']] },
    { id: 'apps', type: 'choice', part: 'Filtro · 2 de 2', title: '¿Usás redes sociales, apps de mensajería o aplicaciones de citas?',
      hint: 'Por ejemplo, Instagram, WhatsApp o Tinder.',
      options: [['si', 'Sí'], ['no', 'No']] },
    { id: 'x1', type: 'likert', part: 'Incomodidad · 1 de 4', title: 'Me incomoda comunicarle a alguien que ya no quiero continuar un vínculo.' },
    { id: 'x2', type: 'likert', part: 'Incomodidad · 2 de 4', title: 'Me preocupa recibir reproches cuando decido terminar una relación.' },
    { id: 'x3', type: 'likert', part: 'Incomodidad · 3 de 4', title: 'Me cuesta afrontar conversaciones que podrían generar un conflicto emocional.' },
    { id: 'x4', type: 'likert', part: 'Incomodidad · 4 de 4', title: 'Siento culpa al comunicar explícitamente mi decisión de finalizar un vínculo.' },
    { id: 'y', type: 'choice', part: 'Tu último vínculo · 1 de 2', title: 'Pensá en el último vínculo afectivo o sexoafectivo que decidiste terminar. ¿Cómo lo terminaste?',
      hint: 'Si nunca terminaste un vínculo, elegí «Otra situación».',
      options: [['explicita', 'Comuniqué claramente mi decisión de finalizarlo'], ['ghosting', 'Dejé de responder sin dar explicaciones'], ['otra', 'Otra situación / ninguna de las anteriores']] },
    { id: 'z', type: 'choice', part: 'Tu último vínculo · 2 de 2', title: '¿Hasta dónde había llegado ese vínculo?',
      options: [['digital', 'Solo hablábamos digitalmente'], ['citas_1_5', 'Tuvimos entre 1 y 5 citas presenciales'], ['citas_mas_5', 'Tuvimos más de 5 citas presenciales']] },
    { id: 'review', type: 'review', part: 'Confirmación' }
  ];
  const QUESTION_STEPS = STEPS.filter(s => s.type !== 'review');
  const idx = id => STEPS.findIndex(s => s.id === id);

  /* ------------------------------------------------------------------
     Estado (se conserva si se recarga la página)
     ------------------------------------------------------------------ */
  let state = loadState() || freshState();
  function freshState() {
    return { step: -1, answers: {}, startedAt: null, submissionId: API.uuid(), fromReview: false };
  }
  function loadState() {
    try { const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null'); return s && s.submissionId ? s : null; } catch (e) { return null; }
  }
  function saveState() { try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { /* modo privado */ } }
  function clearState() { try { sessionStorage.removeItem(STATE_KEY); } catch (e) { } }

  const screen = $('#screen'), backBtn = $('#backBtn'), nextBtn = $('#nextBtn');
  const lampsEl = $('#lamps'), progressTxt = $('#progressTxt');
  let sending = false;
  let view = 'intro';  // intro | step | screenout | done | out_age

  /* ------------------------------------------------------------------
     Conexión
     ------------------------------------------------------------------ */
  const conn = $('#connStatus');
  function setConn(kind, text) { conn.className = 'conn ' + kind; conn.querySelector('span').textContent = text; }
  if (!API.configured) setConn('off', 'Base no conectada');
  else setConn('ok', IS_TEST ? 'Conectado · modo prueba' : 'Conectado');

  /* ------------------------------------------------------------------
     Lámparas de progreso
     ------------------------------------------------------------------ */
  lampsEl.innerHTML = QUESTION_STEPS.map(() => '<i></i>').join('');
  function updateProgress() {
    const lamps = lampsEl.children;
    const inSteps = view === 'step';
    const current = inSteps ? state.step : (view === 'done' ? STEPS.length : -1);
    for (let i = 0; i < lamps.length; i++) {
      lamps[i].className = i < current ? 'on' : (i === current ? 'now' : '');
    }
    if (inSteps) {
      const s = STEPS[state.step];
      progressTxt.textContent = s.type === 'review' ? 'Último paso: revisá y enviá'
        : s.type === 'consent' ? 'Antes de empezar'
        : 'Pregunta ' + state.step + ' de ' + (QUESTION_STEPS.length - 1);
    } else progressTxt.textContent = '';
  }

  /* ------------------------------------------------------------------
     Render de pantallas
     ------------------------------------------------------------------ */
  function setScreen(html, focus) {
    screen.classList.remove('enter');
    screen.innerHTML = html;
    void screen.offsetWidth;
    if (!reduceMotion) screen.classList.add('enter');
    updateProgress();
    if (focus !== false) {
      const h = screen.querySelector('[data-focus]') || screen;
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      const r = $('#device').getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * .5) $('#device').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function renderIntro() {
    view = 'intro';
    backBtn.hidden = true; nextBtn.hidden = true;
    const done = (() => { try { return localStorage.getItem(DONE_KEY); } catch (e) { return null; } })();
    const resume = state.step >= 0 && Object.keys(state.answers).length > 0;
    let html = '<div class="intro-screen">';
    html += '<p class="q-part">Encuesta anónima</p>';
    html += '<h3 class="q-title" data-focus>8 preguntas, menos de 2 minutos.</h3>';
    html += '<p class="q-hint">Primero, dos preguntas para saber si tu caso entra en el estudio. Después, cuatro afirmaciones y dos preguntas sobre tu último vínculo.</p>';
    if (done) {
      html += '<p class="notice">Ya enviaste una respuesta desde este dispositivo. Si otra persona quiere responder desde acá, puede empezar de nuevo.</p>';
    }
    html += '<div class="intro-actions">';
    if (resume) {
      html += '<button type="button" class="btn" data-act="resume">CONTINUAR DONDE QUEDÉ →</button>';
      html += '<button type="button" class="btn-line" data-act="restart">Empezar de nuevo</button>';
    } else {
      html += '<button type="button" class="btn" data-act="start">COMENZAR ✦</button>';
    }
    html += '</div>';
    if (!API.configured) html += '<p class="notice warn">La base de datos todavía no está conectada. Podés recorrer la encuesta, pero <b>las respuestas no se van a guardar</b>.</p>';
    html += '</div>';
    setScreen(html, false);
  }

  function renderStep() {
    view = 'step';
    const s = STEPS[state.step];
    backBtn.hidden = false;
    const ans = state.answers[s.id];
    nextBtn.hidden = !(s.type !== 'review' && s.type !== 'consent' && ans != null);
    nextBtn.textContent = state.fromReview ? 'Volver a la revisión →' : 'Siguiente →';

    let html = '';
    if (s.type === 'consent') {
      html = `<div class="consent">
        <p class="q-part">${esc(s.part)}</p>
        <h3 class="q-title" data-focus>Consentimiento informado</h3>
        <div class="consent-text">
          <p>Esta encuesta forma parte de un trabajo práctico de la materia <b>Metodología Cuantitativa</b> (FPyCS, UNLP). Estudia la relación entre la incomodidad ante la confrontación y la forma en que terminamos vínculos.</p>
          <ul>
            <li><b>Participación voluntaria.</b> Podés salir en cualquier momento antes de enviar.</li>
            <li><b>Anónima.</b> No pedimos nombre, mail, teléfono ni usuario, y no guardamos tu IP.</li>
            <li><b>Uso académico.</b> Las respuestas se analizan en conjunto y solo se publican resultados agregados.</li>
            <li><b>Sin diagnóstico.</b> La encuesta no evalúa a las personas.</li>
            <li><b>Envío definitivo.</b> Como no hay datos que te identifiquen, una vez enviada la respuesta no se puede modificar ni retirar.</li>
          </ul>
        </div>
        <label class="check"><input type="checkbox" id="consentChk" ${ans ? 'checked' : ''}/><span>Tengo 18 años o más, leí esta información y acepto participar.</span></label>
        <p class="field-error" id="consentErr" role="alert"></p>
        <button type="button" class="btn" data-act="consent">ACEPTO Y EMPIEZO →</button>
      </div>`;
    } else if (s.type === 'choice') {
      html = `<p class="q-part">${esc(s.part)}</p>
        <h3 class="q-title" id="qt-${s.id}" data-focus>${esc(s.title)}</h3>
        ${s.hint ? `<p class="q-hint">${esc(s.hint)}</p>` : ''}
        <div class="choices ${s.options.length > 3 ? 'many' : ''} ${s.options.some(o => o[1].length > 18) ? 'long' : ''}" role="group" aria-labelledby="qt-${s.id}">
          ${s.options.map(([v, t], i) => `<button type="button" class="choice" data-val="${esc(v)}" aria-pressed="${ans === v}"><span class="kbd" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span class="choice-txt">${esc(t)}</span></button>`).join('')}
        </div>`;
    } else if (s.type === 'likert') {
      html = `<p class="q-part">${esc(s.part)}</p>
        <p class="likert-lead">¿Qué tan de acuerdo estás con esta afirmación?</p>
        <h3 class="q-title statement" id="qt-${s.id}" data-focus>“${esc(s.title)}”</h3>
        <div class="likert" role="group" aria-labelledby="qt-${s.id}">
          ${LIKERT.map(([v, t]) => `<button type="button" class="lk" data-val="${v}" aria-pressed="${ans === v}" aria-label="${v}: ${esc(t)}"><span class="lk-num" aria-hidden="true">${v}</span><span class="lk-txt" aria-hidden="true">${esc(t)}</span></button>`).join('')}
        </div>
        <p class="kbd-hint" aria-hidden="true">Tip: también podés usar las teclas 1 a 5.</p>`;
    } else if (s.type === 'review') {
      html = renderReview();
    }
    setScreen(html);
  }

  function answerText(s) {
    const v = state.answers[s.id];
    if (v == null) return '—';
    if (s.type === 'likert') return v + ' · ' + LIKERT[v - 1][1];
    const o = s.options.find(o => o[0] === v);
    return o ? o[1] : v;
  }

  function xTotal() {
    const a = state.answers;
    return ['x1', 'x2', 'x3', 'x4'].every(k => a[k] != null) ? a.x1 + a.x2 + a.x3 + a.x4 : null;
  }

  function renderReview() {
    nextBtn.hidden = true;
    const total = xTotal();
    const rows = STEPS.filter(s => s.type === 'choice' || s.type === 'likert').map(s =>
      `<li><span class="rv-q">${esc(s.type === 'likert' ? s.title : s.title)}</span><span class="rv-a">${esc(answerText(s))}</span><button type="button" class="rv-edit" data-edit="${s.id}" aria-label="Editar: ${esc(s.title)}">Editar</button></li>`).join('');
    const missing = QUESTION_STEPS.filter(s => s.type !== 'consent' && state.answers[s.id] == null);
    return `<p class="q-part">Confirmación</p>
      <h3 class="q-title" data-focus>Revisá antes de enviar</h3>
      <p class="q-hint">Cuando envíes, las respuestas se guardan de forma anónima y ya no se pueden editar.</p>
      <ul class="review">${rows}</ul>
      ${total != null ? `<p class="rv-index">Suma de las cuatro afirmaciones: <b>${total}/20</b> (categoría exploratoria: <b>${esc(L.levelShort[S.classify(total)].toLowerCase())}</b>). Este puntaje se usa solo para el análisis colectivo.</p>` : ''}
      <div class="hp" aria-hidden="true"><label>Sitio web <input type="text" id="hpField" tabindex="-1" autocomplete="off"/></label></div>
      <p class="field-error" id="sendErr" role="alert">${missing.length ? 'Falta responder: ' + esc(missing.map(m => m.part).join(', ')) : ''}</p>
      ${!API.configured ? '<p class="notice warn">La base de datos todavía no está conectada, así que esta respuesta <b>no se puede guardar</b>.</p>' : ''}
      <button type="button" class="btn send" id="sendBtn" ${missing.length || !API.configured ? 'disabled' : ''}>ENVIAR MIS RESPUESTAS ✦</button>`;
  }

  function renderScreenOut(reason) {
    view = 'screenout';
    backBtn.hidden = false; nextBtn.hidden = true;
    const msgs = {
      edad: 'La encuesta es solo para personas de 18 años o más.',
      uso_apps: 'La encuesta está pensada para personas que usan redes sociales, apps de mensajería o aplicaciones de citas.'
    };
    const record = reason !== 'edad';
    setScreen(`<p class="q-part">Fuera de los criterios</p>
      <h3 class="q-title" data-focus>Gracias por tu interés.</h3>
      <p class="q-hint">${esc(msgs[reason])} ${record ? 'Si confirmás, registramos únicamente que hubo una participación fuera de los criterios, sin otras respuestas.' : 'No se guardó ningún dato.'}</p>
      <p class="q-hint">¿Te equivocaste? Tocá <b>Atrás</b> para corregir.</p>
      <p class="field-error" id="sendErr" role="alert"></p>
      <div class="intro-actions">
        ${record && API.configured ? `<button type="button" class="btn" data-act="finish-out" data-reason="${reason}">FINALIZAR</button>` : `<button type="button" class="btn" data-act="exit-out">FINALIZAR</button>`}
        <a class="btn-line" href="${RESULTS_HREF}">Ver resultados</a>
      </div>`);
    state.screenOut = reason; saveState();
  }

  function renderDone(eligible) {
    view = 'done';
    backBtn.hidden = true; nextBtn.hidden = true;
    const now = new Date();
    setScreen(`<div class="done">
      <div class="ticket" aria-hidden="true"><span>GHOSTING DETECTOR™</span><b>✓</b><span>${now.toLocaleDateString('es-AR')} · ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span><span>${IS_TEST ? 'MODO PRUEBA' : 'RESPUESTA ANÓNIMA'}</span></div>
      <h3 class="q-title" data-focus>${eligible ? '¡Listo! Tu respuesta se guardó.' : 'Listo, gracias por tu tiempo.'}</h3>
      <p class="q-hint">${eligible ? (IS_TEST ? 'Se guardó como prueba, así que no aparece en los resultados públicos.' : 'Los resultados se actualizan solos y pueden tardar unos segundos en incluir tu respuesta.') : 'Registramos la participación como fuera de los criterios del estudio.'}</p>
      <div class="intro-actions">
        <a class="btn" href="${RESULTS_HREF}" data-act="see-results">VER RESULTADOS →</a>
        <a class="btn-line" href="${TP1_HREF}">Ir a ¿Me ghostearon?</a></div></div>`);
  }

  /* ------------------------------------------------------------------
     Navegación
     ------------------------------------------------------------------ */
  function go(step) {
    state.step = step; saveState(); renderStep();
  }
  function advanceFrom(id) {
    const s = STEPS[idx(id)];
    const v = state.answers[id];
    // Filtros
    // Menores de 18: no participan. Mayores de 35: responden todo, pero quedan fuera del análisis.
    if (id === 'age' && v === 'menor_18') return renderScreenOut('edad');
    if (id === 'apps' && v === 'no') return renderScreenOut('uso_apps');
    if (state.fromReview) {
      // Si volvió a un filtro y lo cambió a "sí", sigue en la revisión
      return go(idx('review'));
    }
    go(idx(s.id) + 1);
  }

  backBtn.addEventListener('click', () => {
    if (sending) return;
    if (view === 'screenout') { state.screenOut = null; return go(state.step); }
    if (view !== 'step') return;
    if (state.fromReview && STEPS[state.step].type !== 'review') { return go(idx('review')); }
    if (state.step <= 0) { state.step = -1; saveState(); return renderIntro(); }
    state.fromReview = false;
    go(state.step - 1);
  });
  nextBtn.addEventListener('click', () => {
    const s = STEPS[state.step];
    if (state.answers[s.id] != null) advanceFrom(s.id);
  });

  let advanceTimer = null;
  screen.addEventListener('click', e => {
    const btn = e.target.closest('button, a[data-act]');
    if (!btn || sending) return;
    const act = btn.dataset.act;

    if (act === 'start') { state = freshState(); state.step = 0; saveState(); return renderStep(); }
    if (act === 'resume') { if (state.step < 0) state.step = 0; return state.screenOut ? renderScreenOut(state.screenOut) : renderStep(); }
    if (act === 'restart') { state = freshState(); state.step = 0; saveState(); return renderStep(); }
    if (act === 'consent') {
      const ok = $('#consentChk').checked;
      if (!ok) { $('#consentErr').textContent = 'Para participar, marcá la casilla de consentimiento.'; $('#consentChk').focus(); return; }
      state.answers.consent = true;
      if (!state.startedAt) state.startedAt = Date.now();
      return go(1);
    }
    if (act === 'finish-out') return submit(false, btn.dataset.reason);
    if (act === 'exit-out') { const fresh = freshState(); state = fresh; clearState(); return renderIntro(); }
    if (act === 'see-results') { loadResults(); return; }

    if (btn.dataset.edit) { state.fromReview = true; return go(idx(btn.dataset.edit)); }
    if (btn.id === 'sendBtn') return submit(true);

    if (btn.classList.contains('choice') || btn.classList.contains('lk')) {
      const s = STEPS[state.step];
      const val = s.type === 'likert' ? +btn.dataset.val : btn.dataset.val;
      state.answers[s.id] = val; saveState();
      screen.querySelectorAll('[aria-pressed]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      btn.classList.add('pulse');
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => advanceFrom(s.id), reduceMotion ? 60 : 300);
    }
  });

  document.addEventListener('keydown', e => {
    if (view !== 'step' || sending || e.altKey || e.ctrlKey || e.metaKey) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const s = STEPS[state.step];
    let target = null;
    if (s.type === 'likert' && /^[1-5]$/.test(e.key)) target = screen.querySelector(`.lk[data-val="${e.key}"]`);
    if (s.type === 'choice') {
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (e.key.length === 1 && i >= 0 && i < s.options.length) target = screen.querySelectorAll('.choice')[i];
    }
    if (target) { e.preventDefault(); target.click(); }
  });


  /* ------------------------------------------------------------------
     Envío
     ------------------------------------------------------------------ */
  const ERRORS = {
    recoleccion_cerrada: 'La recolección de respuestas está cerrada en este momento. ¡Gracias igual!',
    demasiado_rapido: 'El envío fue demasiado rápido. Revisá tus respuestas y volvé a intentar en unos segundos.',
    demasiados_envios: 'Recibimos muchos envíos desde esta red en la última hora. Probá de nuevo más tarde.',
    sin_consentimiento: 'Falta el consentimiento informado. Volvé al primer paso.',
    datos_invalidos: 'Alguna respuesta no es válida. Revisá el formulario.',
    payload_invalido: 'No pudimos procesar el envío. Recargá la página e intentá de nuevo.'
  };

  // complete = recorrió toda la encuesta (desde la revisión); si no, es un envío de exclusión
  async function submit(complete, reason) {
    if (sending) return;
    const errEl = $('#sendErr');
    const btn = complete ? $('#sendBtn') : screen.querySelector('[data-act="finish-out"]');
    if (!API.configured) { errEl.textContent = 'La base de datos todavía no está conectada: no se guardó la respuesta.'; return; }
    const a = state.answers;
    const over35 = complete && a.age === 'mayor_35';
    const eligible = complete && !over35;
    const elapsed = Math.round((Date.now() - (state.startedAt || Date.now())) / 1000);
    const payload = {
      submission_id: state.submissionId,
      consent: a.consent === true,
      eligible,
      is_test: IS_TEST,
      elapsed_seconds: Math.min(elapsed, 86400),
      website: ($('#hpField') && $('#hpField').value) || ''
    };
    if (complete) {
      Object.assign(payload, { age_group: a.age, x1: a.x1, x2: a.x2, x3: a.x3, x4: a.x4, y_strategy: a.y, z_depth: a.z });
      // Más de 35: se guarda la respuesta completa, marcada fuera de la muestra analítica
      if (over35) Object.assign(payload, { screen_out_reason: 'edad', uses_apps: true });
    } else {
      payload.screen_out_reason = reason;
      payload.age_group = a.age;
      if (a.apps) payload.uses_apps = a.apps === 'si';
    }
    sending = true; errEl.textContent = '';
    const label = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Procesando…';
    backBtn.disabled = true;
    screen.setAttribute('aria-busy', 'true');
    try {
      const res = await API.rpc('submit_response', { payload });
      if (!res || res.ok !== true) {
        const code = res && res.error;
        throw new API.GDError(code || 'desconocido', ERRORS[code] || 'No pudimos guardar tu respuesta. Intentá de nuevo.');
      }
      try { localStorage.setItem(DONE_KEY, new Date().toISOString()); } catch (e) { }
      clearState(); state = freshState();
      sending = false; backBtn.disabled = false;
      renderDone(complete);
      loadResults();
    } catch (err) {
      sending = false; backBtn.disabled = false;
      screen.removeAttribute('aria-busy');
      btn.disabled = false; btn.innerHTML = label;
      errEl.textContent = (err && err.message ? err.message : 'Error desconocido.') + (err && err.code && err.code.startsWith('http') ? ' (Podés volver a intentar: la respuesta no se duplica.)' : '');
    }
  }

  /* ------------------------------------------------------------------
     Resultados colectivos
     ------------------------------------------------------------------ */
  const root = $('#resultsRoot'), updated = $('#resUpdated'), tip = $('#tooltip');
  let lastStats = null, depthFilter = 'todas', lastFetch = 0, loadingRes = false;
  const COLORS = { explicita: 'var(--c-explicit)', ghosting: 'var(--c-ghost)' };

  async function loadResults() {
    if (!root || loadingRes) return;
    if (!API.configured) {
      root.innerHTML = `<div class="res-empty"><p class="res-big">Sin conexión a la base de datos</p><p>Los resultados van a aparecer acá cuando la web esté conectada. Mientras tanto no se muestran datos de ejemplo.</p></div>`;
      updated.textContent = '';
      return;
    }
    loadingRes = true;
    try {
      const st = await API.rpc('get_public_stats', {});
      lastStats = st; lastFetch = Date.now();
      renderResults(st);
    } catch (e) {
      if (!lastStats) root.innerHTML = `<div class="res-empty"><p class="res-big">No pudimos cargar los resultados</p><p>${esc(e.message)}</p><button type="button" class="btn" id="retryRes">REINTENTAR</button></div>`;
      updated.textContent = 'No se pudo actualizar. Se vuelve a intentar automáticamente.';
    } finally { loadingRes = false; }
  }

  if (root) root.addEventListener('click', e => {
    if (e.target.id === 'retryRes') loadResults();
    const f = e.target.closest('[data-depth]');
    if (f) { depthFilter = f.dataset.depth; renderResults(lastStats); const nb = root.querySelector(`[data-depth="${depthFilter}"]`); if (nb) nb.focus(); }
  });

  function stamp() {
    if (!lastFetch || !updated) return;
    const t = new Date(lastFetch);
    updated.innerHTML = `<i class="live" aria-hidden="true"></i> Actualizado a las ${t.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })} · se actualiza cada ${CFG.RESULTS_REFRESH_SECONDS || 30} segundos`;
  }

  function seg(key, n, total, extra) {
    const p = total ? n / total * 100 : 0;
    const label = `${L.y[key]}: ${S.pct(n, total)} (${n} de ${total})${extra ? ' · ' + extra : ''}`;
    return `<span class="seg seg-${key}" style="width:${p}%;background:${COLORS[key]}" tabindex="0" data-tip="${esc(label)}" aria-label="${esc(label)}">${p >= 14 ? `<b>${S.pct(n, total, 0)}</b>` : ''}</span>`;
  }

  function stackRow(label, sub, row) {
    if (row.suppressed) {
      return `<div class="srow"><div class="srow-label"><b>${esc(label)}</b><span>${esc(sub)}</span></div><div class="srow-bar suppressed">Menos de ${lastStats.min_cell} respuestas: no se publica</div><div class="srow-n">n &lt; ${lastStats.min_cell}</div></div>`;
    }
    return `<div class="srow"><div class="srow-label"><b>${esc(label)}</b><span>${esc(sub)}</span></div><div class="srow-bar">${seg('explicita', row.explicita, row.n, esc(label))}${seg('ghosting', row.ghosting, row.n, esc(label))}</div><div class="srow-n">n = ${row.n}</div></div>`;
  }

  const legend = () => `<div class="legend" aria-label="Referencias"><span><i style="background:var(--c-explicit)"></i>Ruptura explícita</span><span><i style="background:var(--c-ghost)" class="hatch"></i>Ghosting</span></div>`;

  function renderResults(st) {
    if (!st) return;
    stamp();
    const kpis = `<div class="kpis">
      <div class="kpi main"><span class="kpi-n">${st.n_eligible}</span><span class="kpi-l">respuestas válidas</span></div>
      <div class="kpi"><span class="kpi-n">${st.n_binary}</span><span class="kpi-l">entran en el análisis (ruptura explícita o ghosting)</span></div>
      <div class="kpi"><span class="kpi-n">${st.n_other}</span><span class="kpi-l">eligieron «otra situación»</span></div>
      <div class="kpi"><span class="kpi-n">${st.n_screened_out}</span><span class="kpi-l">quedaron fuera de los criterios</span></div>
    </div>`;
    if (!st.sufficient) {
      const p = Math.min(100, st.n_binary / st.min_public_n * 100);
      root.innerHTML = kpis + `<div class="res-empty insufficient">
        <p class="res-big">Todavía no hay datos suficientes</p>
        <p>Hay <b>${st.n_binary}</b> ${st.n_binary === 1 ? 'respuesta para analizar' : 'respuestas para analizar'}. Los gráficos se publican a partir de <b>${st.min_public_n}</b>, para que ningún resultado dependa de dos o tres personas.</p>
        <div class="fill" role="progressbar" aria-valuemin="0" aria-valuemax="${st.min_public_n}" aria-valuenow="${st.n_binary}" aria-label="Respuestas analizables"><span style="width:${p}%"></span></div>
        <p class="small">Podés ayudar compartiendo la encuesta con personas de 18 a 35 años.</p>
      </div>`;
      return;
    }

    const st2 = st.strategy, nb = st.n_binary;
    const dsc = st.discomfort, nd = dsc.baja + dsc.media + dsc.alta;
    const maxD = Math.max(dsc.baja, dsc.media, dsc.alta, 1);

    // B. Estrategias
    const chartB = `<article class="chart-card">
      <p class="chart-k">Estrategia de finalización</p>
      <h3>¿Cómo terminaron su último vínculo?</h3>
      <p class="chart-n">n = ${nb} (sin “otra situación”)</p>
      ${legend()}
      <div class="big-split">${seg('explicita', st2.explicita, nb)}${seg('ghosting', st2.ghosting, nb)}</div>
      <div class="split-vals"><span><b>${S.pct(st2.explicita, nb)}</b> ruptura explícita · ${st2.explicita}</span><span><b>${S.pct(st2.ghosting, nb)}</b> ghosting · ${st2.ghosting}</span></div>
    </article>`;

    // C. Incomodidad
    const chartC = `<article class="chart-card">
      <p class="chart-k">Incomodidad ante la confrontación</p>
      <h3>¿Cuánto incomoda comunicar una ruptura?</h3>
      <p class="chart-n">n = ${nd} (todas las respuestas válidas)</p>
      <div class="vbars">${S.LEVELS.map(l => `<div class="vbar"><div class="vbar-track"><span class="vbar-fill lvl-${l}" style="height:${dsc[l] / maxD * 100}%" tabindex="0" data-tip="${esc(L.level[l] + ' (' + L.levelRange[l] + '): ' + dsc[l] + ' respuestas · ' + S.pct(dsc[l], nd))}"></span></div><b>${S.pct(dsc[l], nd, 0)}</b><span>${L.levelShort[l]}<small>${L.levelRange[l]} · ${dsc[l]}</small></span></div>`).join('')}</div>
    </article>`;

    // D/E. Cruce X × Y (con filtro por Z)
    let rows;
    if (depthFilter === 'todas') rows = st.crosstab;
    else rows = st.crosstab_by_depth.filter(r => r.depth === depthFilter);
    const filters = `<div class="filters" role="group" aria-label="Filtrar por profundidad del vínculo"><span>Profundidad del vínculo:</span>
      ${[['todas', 'Todas'], ['digital', L.z.digital], ['citas_1_5', L.z.citas_1_5], ['citas_mas_5', L.z.citas_mas_5]].map(([v, t]) => `<button type="button" data-depth="${v}" aria-pressed="${depthFilter === v}">${esc(t)}</button>`).join('')}</div>`;
    const pub = rows.filter(r => !r.suppressed);
    const tot = pub.reduce((a, r) => ({ n: a.n + r.n, explicita: a.explicita + r.explicita, ghosting: a.ghosting + r.ghosting }), { n: 0, explicita: 0, ghosting: 0 });
    const table = `<div class="table-wrap"><table class="ctable">
      <caption>Tabla de contingencia: incomodidad (X) × estrategia (Y)${depthFilter !== 'todas' ? ' · ' + esc(L.z[depthFilter]) : ''}. Frecuencias absolutas y porcentajes por fila.</caption>
      <thead><tr><th scope="col">Incomodidad</th><th scope="col">Ruptura explícita</th><th scope="col">Ghosting</th><th scope="col">Total</th></tr></thead>
      <tbody>${rows.map(r => r.suppressed
        ? `<tr class="supp"><th scope="row">${L.levelShort[r.level]} <small>${L.levelRange[r.level]}</small></th><td colspan="3">Grupo con menos de ${st.min_cell} respuestas: no se publica</td></tr>`
        : `<tr><th scope="row">${L.levelShort[r.level]} <small>${L.levelRange[r.level]}</small></th><td>${r.explicita} <small>(${S.pct(r.explicita, r.n)})</small></td><td>${r.ghosting} <small>(${S.pct(r.ghosting, r.n)})</small></td><td>${r.n} <small>(100%)</small></td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">Total${pub.length < rows.length ? ' publicado' : ''}</th><td>${tot.explicita} <small>(${S.pct(tot.explicita, tot.n)})</small></td><td>${tot.ghosting} <small>(${S.pct(tot.ghosting, tot.n)})</small></td><td>${tot.n}</td></tr></tfoot>
    </table></div>`;
    const chartDE = `<article class="chart-card wide">
      <p class="chart-k">Incomodidad × estrategia</p>
      <h3>¿Más incomodidad, más ghosting?</h3>
      <p class="chart-n">Proporción de cada estrategia dentro de cada nivel de incomodidad (barras apiladas al 100%).</p>
      ${filters}
      ${legend()}
      <div class="stack">${rows.map(r => stackRow(L.levelShort[r.level], L.levelRange[r.level], r)).join('')}</div>
      ${table}
      <p class="read-note">Si la proporción de ghosting crece de «baja» a «alta», los datos van en la dirección de H1. Con una muestra chica, esa diferencia también puede deberse al azar, así que estos resultados son exploratorios.</p>
    </article>`;

    // F. Por profundidad
    const chartF = `<article class="chart-card wide">
      <p class="chart-k">Profundidad del vínculo</p>
      <h3>¿Cambia según hasta dónde llegó el vínculo?</h3>
      <p class="chart-n">Exploración descriptiva · n = ${st.by_depth.filter(r => !r.suppressed).reduce((a, r) => a + r.n, 0)} publicadas</p>
      ${legend()}
      <div class="stack">${st.by_depth.map(r => stackRow(L.z[r.depth], '', r)).join('')}</div>
    </article>`;

    root.innerHTML = kpis + `<div class="charts">${chartB}${chartC}${chartDE}${chartF}</div>`;
  }

  // Tooltip accesible (hover y foco)
  function showTip(el) {
    const t = el.getAttribute('data-tip'); if (!t) return;
    tip.textContent = t; tip.hidden = false;
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth;
    let x = r.left + r.width / 2 - tw / 2; x = Math.max(8, Math.min(innerWidth - tw - 8, x));
    let y = r.top - tip.offsetHeight - 10; if (y < 8) y = r.bottom + 10;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.hidden = true; }
  if (root) {
  root.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (el) showTip(el); });
  root.addEventListener('mouseout', e => { if (e.target.closest('[data-tip]')) hideTip(); });
  root.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) showTip(el); });
  root.addEventListener('focusout', hideTip);
  addEventListener('scroll', hideTip, { passive: true });
  }

  // Carga inicial y actualización automática
  const refreshMs = Math.max(10, CFG.RESULTS_REFRESH_SECONDS || 30) * 1000;
  if (root) setInterval(() => { if (document.visibilityState === 'visible') loadResults(); }, refreshMs);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastFetch > refreshMs) loadResults(); });
  setInterval(stamp, 15000);

  // Arranque
  renderIntro();
  loadResults();

  // Utilidad para pruebas (no expone datos)
  window.__GD_TP2 = { STEPS, get state() { return state; } };
})();
