/* =====================================================================
   GHOSTING DETECTOR™ · Comportamientos compartidos con el TP1
   Destello mágico, música, aparición al hacer scroll y menú mobile.
   (Misma lógica que el script del TP1.)
   ===================================================================== */
(function () {
  const magicLayer = document.getElementById('magicLayer');
  let magicAudioCtx = null;
  function magicChime(kind) {
    try {
      magicAudioCtx = magicAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = magicAudioCtx; if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const notes = kind === 'start' ? [659.25, 783.99, 987.77, 1318.51] : [783.99, 987.77, 1174.66, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = i % 2 ? 'sine' : 'triangle'; osc.frequency.setValueAtTime(freq, now + i * .055);
        gain.gain.setValueAtTime(.0001, now + i * .055); gain.gain.linearRampToValueAtTime(kind === 'start' ? .045 : .038, now + i * .055 + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, now + i * .055 + .48);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(now + i * .055); osc.stop(now + i * .055 + .5);
      });
    } catch (e) { /* sin audio */ }
  }
  function magicBurst(source, kind) {
    if (!magicLayer || !source) return;
    const rect = source.getBoundingClientRect(), mx = ((rect.left + rect.width / 2) / innerWidth) * 100, my = ((rect.top + rect.height / 2) / innerHeight) * 100;
    magicLayer.style.setProperty('--mx', mx + '%'); magicLayer.style.setProperty('--my', my + '%');
    magicLayer.querySelectorAll('.magic-spark').forEach(el => el.remove());
    const count = kind === 'start' ? 28 : 22;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i'), angle = Math.PI * 2 * i / count + Math.random() * .35, distance = (kind === 'start' ? 90 : 72) + Math.random() * 125;
      s.className = 'magic-spark'; s.style.setProperty('--x', mx + '%'); s.style.setProperty('--y', my + '%'); s.style.setProperty('--s', (8 + Math.random() * 14) + 'px');
      s.style.setProperty('--r', (Math.random() * 90) + 'deg'); s.style.setProperty('--dx', (Math.cos(angle) * distance) + 'px'); s.style.setProperty('--dy', (Math.sin(angle) * distance) + 'px');
      s.style.setProperty('--d', (.65 + Math.random() * .45) + 's'); s.style.setProperty('--delay', (Math.random() * .12) + 's'); magicLayer.appendChild(s);
    }
    magicLayer.classList.remove('active'); void magicLayer.offsetWidth; magicLayer.classList.add('active'); source.classList.add('magic-triggering'); magicChime(kind);
    setTimeout(() => source.classList.remove('magic-triggering'), 850); setTimeout(() => magicLayer.classList.remove('active'), 1250);
  }

  /* Música (mismo tema y control que el TP1) */
  const theme = document.getElementById('ghostingTheme');
  const audioControl = document.getElementById('audioControl');
  let startTheme = () => {};
  if (theme && audioControl) {
    const audioLabel = audioControl.querySelector('.audio-label');
    theme.volume = 0;
    const targetVolume = .18; let fadeTimer;
    const fadeAudio = (to, duration) => {
      clearInterval(fadeTimer);
      const from = theme.volume, steps = 24, delta = (to - from) / steps; let i = 0;
      fadeTimer = setInterval(() => {
        i++; theme.volume = Math.max(0, Math.min(1, from + delta * i));
        if (i >= steps) { clearInterval(fadeTimer); theme.volume = to; if (to === 0) theme.pause(); }
      }, (duration || 1200) / steps);
    };
    const setAudioUI = playing => {
      audioControl.classList.toggle('playing', playing);
      audioControl.setAttribute('aria-pressed', playing ? 'true' : 'false');
      audioControl.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
      audioLabel.textContent = playing ? 'GHOSTING DETECTOR RADIO · ❚❚' : 'GHOSTING DETECTOR RADIO · ▶';
    };
    startTheme = async () => {
      try { if (theme.paused) { theme.volume = 0; await theme.play(); } fadeAudio(targetVolume, 1400); setAudioUI(true); }
      catch (e) { setAudioUI(false); }
    };
    audioControl.addEventListener('click', () => { theme.paused ? startTheme() : (fadeAudio(0, 700), setAudioUI(false)); });
  }

  /* Botones con destello: [data-magic="start"] también enciende la música */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-magic]').forEach(el => {
    el.addEventListener('click', e => {
      const kind = el.dataset.magic || 'soft';
      magicBurst(el, kind);
      if (kind === 'start' && theme && theme.paused) startTheme();
      // Enlaces a otra página: esperar el destello antes de navegar
      const href = el.getAttribute('href');
      if (href && !href.startsWith('#') && !reduce && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
        e.preventDefault(); setTimeout(() => { location.href = href; }, 520);
      }
    });
  });
  addEventListener('pageshow', () => magicLayer && magicLayer.classList.remove('active'));

  /* Aparición al hacer scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Menú mobile */
  const toggle = document.getElementById('mobileNavToggle'), nav = document.getElementById('mainNav');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('mobile-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); };
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('mobile-open');
      nav.classList.toggle('mobile-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  window.GD_MAGIC = { burst: magicBurst };
})();
