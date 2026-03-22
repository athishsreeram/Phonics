/* js/api.js
 * Central API client for all Phonics Hub → Render API operations.
 * Loaded after config.js on every page.
 *
 * Exposes: window.PhonicsAPI
 * Operations wired:
 *   - POST /api/events        (page views, activity start/complete, upgrade clicks)
 *   - POST /api/emails        (email lead capture)
 *   - POST /api/users/register  (user registration / upsert)
 *   - POST /api/users/ping    (last_seen update on every page load)
 *   - GET  /api/users/me      (fetch user profile + subscription status)
 *   - GET  /api/stories       (fetch all stories for story.html)
 *   - GET  /api/stories/:id   (fetch single story)
 *   - POST /api/subscriptions/checkout  (Stripe checkout session)
 *   - GET  /api/subscriptions/verify    (verify Stripe payment)
 */
'use strict';

window.PhonicsAPI = (() => {
  function base() {
    return window.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';
  }

  // ── Raw fetch helpers ──────────────────────────────────────────────────────
  async function _post(path, body) {
    try {
      const res = await fetch(`${base()}${path}`, {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify(body),
        keepalive: true,
      });
      return res.json();
    } catch (e) {
      console.warn(`[PhonicsAPI] POST ${path} failed:`, e.message);
      return { ok: false, error: e.message };
    }
  }

  async function _get(path) {
    try {
      const res = await fetch(`${base()}${path}`);
      return res.json();
    } catch (e) {
      console.warn(`[PhonicsAPI] GET ${path} failed:`, e.message);
      return { ok: false, error: e.message };
    }
  }

  // ── EVENTS ─────────────────────────────────────────────────────────────────
  // Called automatically by analytics.js — do not call directly
  function logEvent(type, data = {}) {
    const session = _getSessionId();
    return _post('/api/events', {
      type,
      session,
      url:     window.location.pathname,
      ua:      /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      premium: _isPremium(),
      ts:      Math.floor(Date.now() / 1000),
      ...data,
    });
  }

  // ── USERS ──────────────────────────────────────────────────────────────────
  async function registerUser(email, childName, childAge) {
    if (!email) return { ok: false, error: 'email required' };
    const data = await _post('/api/users/register', {
      email,
      child_name: childName || null,
      child_age:  childAge  ? parseInt(childAge) : null,
    });
    if (data.ok && data.data) {
      localStorage.setItem('ph_email', email);
      localStorage.setItem('ph_user',  JSON.stringify(data.data));
    }
    return data;
  }

  function pingUser() {
    const email = localStorage.getItem('ph_email');
    if (!email) return Promise.resolve({ ok: false });
    return _post('/api/users/ping', { email });
  }

  async function getUser() {
    const email = localStorage.getItem('ph_email');
    if (!email) return null;
    const data = await _get(`/api/users/me?email=${encodeURIComponent(email)}`);
    if (data.ok && data.data) {
      localStorage.setItem('ph_user', JSON.stringify(data.data));
      // Sync premium status from server
      const serverStatus = data.data.status || data.data.sub_status;
      if (serverStatus === 'active' || serverStatus === 'trialing') {
        localStorage.setItem('ph_premium', 'true');
      }
      return data.data;
    }
    return null;
  }

  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem('ph_user') || 'null'); } catch { return null; }
  }

  // ── EMAILS ─────────────────────────────────────────────────────────────────
  function captureEmail(email, name, source) {
    if (!email || !email.includes('@')) return Promise.resolve({ ok: false });
    localStorage.setItem('ph_email', email);
    return _post('/api/emails', { email, name: name || null, source: source || 'app' });
  }

  // ── STORIES ────────────────────────────────────────────────────────────────
  async function getStories() {
    const data = await _get('/api/stories');
    return data.ok ? (data.data || []) : [];
  }

  async function getStory(id) {
    const data = await _get(`/api/stories/${id}`);
    return data.ok ? data.data : null;
  }

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────
  async function startCheckout(successUrl, cancelUrl) {
    const origin = window.location.origin;
    const data = await _post('/api/subscriptions/checkout', {
      session_id:  _getSessionId(),
      successUrl:  successUrl  || `${origin}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:   cancelUrl   || `${origin}/index.html`,
    });
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.warn('[PhonicsAPI] checkout failed:', data.error);
    }
    return data;
  }

  async function verifySession(sessionId) {
    const data = await _get(`/api/subscriptions/verify?session_id=${sessionId}`);
    if (data.ok && data.active) {
      localStorage.setItem('ph_premium', 'true');
      localStorage.setItem('ph_premium_ts', Date.now().toString());
    }
    return data;
  }

  // ── HELPERS ────────────────────────────────────────────────────────────────
  function _getSessionId() {
    // Reuse existing session from analytics.js if loaded, else own key
    try {
      const s = JSON.parse(localStorage.getItem('ph_session') || '{}');
      return s.id || sessionStorage.getItem('ph_sid') || _makeSessionId();
    } catch { return _makeSessionId(); }
  }

  function _makeSessionId() {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    try { sessionStorage.setItem('ph_sid', id); } catch {}
    return id;
  }

  function _isPremium() {
    return localStorage.getItem('ph_premium') === 'true';
  }

  // ── AUTO-PING on every page load ───────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pingUser());
  } else {
    pingUser();
  }

  return {
    logEvent,
    registerUser, pingUser, getUser, getStoredUser,
    captureEmail,
    getStories, getStory,
    startCheckout, verifySession,
  };
})();
