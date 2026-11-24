/* =====================================================================
   GHOSTING DETECTOR™ · Cliente mínimo de Supabase (sin dependencias)
   Usa la API REST de Supabase (PostgREST + GoTrue) con fetch.
   ===================================================================== */
(function () {
  const cfg = window.GD_CONFIG || {};
  const URL_BASE = (cfg.SUPABASE_URL || '').replace(/\/+$/, '');
  const KEY = cfg.SUPABASE_KEY || '';
  const configured = /^https:\/\/.+/.test(URL_BASE) && KEY.length > 20 &&
    !/service_role|sb_secret_/.test(KEY);

  if (KEY && /sb_secret_/.test(KEY)) {
    console.error('[Ghosting Detector] Se configuró una clave SECRETA en config.js. Reemplazala por la clave pública.');
  }

  function headers(token, extra) {
    const h = { apikey: KEY, 'Content-Type': 'application/json' };
    // Las claves legacy (JWT) también van en Authorization. Las nuevas
    // claves "publishable" no son JWT y solo se envían como apikey.
    if (token) h.Authorization = 'Bearer ' + token;
    else if (KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + KEY;
    return Object.assign(h, extra || {});
  }

  async function request(path, opts) {
    if (!configured) throw new GDError('no_configurado', 'La base de datos todavía no está conectada.');
    let res;
    try {
      res = await fetch(URL_BASE + path, opts);
    } catch (e) {
      throw new GDError('red', 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.');
    }
    const text = await res.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch (e) { data = text; } }
    if (!res.ok) {
      const msg = (data && (data.message || data.msg || data.error_description || data.error)) || ('Error ' + res.status);
      throw new GDError('http_' + res.status, String(msg), res.status);
    }
    return { data, res };
  }

  class GDError extends Error {
    constructor(code, message, status) { super(message); this.code = code; this.status = status; }
  }

  async function rpc(fn, body, token) {
    const { data } = await request('/rest/v1/rpc/' + fn, {
      method: 'POST', headers: headers(token), body: JSON.stringify(body || {})
    });
    return data;
  }

  /* ---------- Autenticación (solo panel de administración) ---------- */
  const SESSION_KEY = 'gd_admin_session';
  function loadSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveSession(s) {
    if (!s) { sessionStorage.removeItem(SESSION_KEY); return; }
    const session = {
      access_token: s.access_token, refresh_token: s.refresh_token,
      expires_at: s.expires_at || (Math.floor(Date.now() / 1000) + (s.expires_in || 3600)),
      email: (s.user && s.user.email) || s.email || ''
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }
  async function signIn(email, password) {
    const { data } = await request('/auth/v1/token?grant_type=password', {
      method: 'POST', headers: headers(null), body: JSON.stringify({ email, password })
    });
    return saveSession(data);
  }
  async function refresh(session) {
    const { data } = await request('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', headers: headers(null), body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    return saveSession(Object.assign({ email: session.email }, data));
  }
  async function getToken() {
    let s = loadSession();
    if (!s) return null;
    if (s.expires_at - 60 < Date.now() / 1000) {
      try { s = await refresh(s); } catch (e) { saveSession(null); return null; }
    }
    return s.access_token;
  }
  async function signOut() {
    const token = await getToken();
    if (token) {
      try { await request('/auth/v1/logout', { method: 'POST', headers: headers(token) }); } catch (e) { /* sin efecto */ }
    }
    saveSession(null);
  }

  /* ---------- Tablas (solo admins, protegido por RLS) ---------- */
  async function table(method, path, body, extraHeaders) {
    const token = await getToken();
    if (!token) throw new GDError('sin_sesion', 'Tu sesión expiró. Volvé a ingresar.');
    const opts = { method, headers: headers(token, extraHeaders) };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return request('/rest/v1/' + path, opts);
  }

  async function selectAll(path, pageSize) {
    pageSize = pageSize || 1000;
    let from = 0; const out = [];
    for (;;) {
      const { data } = await table('GET', path, undefined, { Range: from + '-' + (from + pageSize - 1), 'Range-Unit': 'items' });
      out.push.apply(out, data || []);
      if (!data || data.length < pageSize) break;
      from += pageSize;
      if (from > 200000) break;
    }
    return out;
  }

  window.GD_API = {
    configured, GDError, rpc, signIn, signOut, getToken, loadSession, table, selectAll,
    uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
        return (c === 'x' ? r : (r & 3) | 8).toString(16);
      });
    }
  };
})();
