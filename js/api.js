/* js/api.js
 * Central API client for all Phonics Hub → Render API operations.
 * Loaded after config.js on every page.
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
    const emailToUse = (email && email.includes('@')) ? email : null;
    const data = await _post('/api/users/register', {
      email:      emailToUse,
      child_name: childName || null,
      child_age:  childAge  ? parseInt(childAge) : null,
    });
    if (data.ok && data.data) {
      if (emailToUse) localStorage.setItem('ph_email', emailToUse);
      localStorage.setItem('ph_user', JSON.stringify(data.data));
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
      _syncPremiumFromUser(data.data);
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
    const email  = localStorage.getItem('ph_email') || null;
    const data   = await _post('/api/subscriptions/checkout', {
      email,
      successUrl: successUrl || `${origin}/pages/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  cancelUrl  || `${origin}/index.html`,
    });
    if (data.url) {
      window.location.href = data.url;
    } else {
      console.warn('[PhonicsAPI] checkout failed:', data.error);
    }
    return data;
  }

  // Called from success.html after Stripe redirect.
  // Writes expiry to localStorage so offline checks work.
  async function verifySession(sessionId) {
    const email  = localStorage.getItem('ph_email') || '';
    const params = new URLSearchParams({ session_id: sessionId });
    if (email) params.set('email', email);

    const data = await _get(`/api/subscriptions/verify?${params.toString()}`);

    if (data.ok) {
      if (data.active) {
        localStorage.setItem('ph_premium',         'true');
        localStorage.setItem('ph_premium_ts',       Date.now().toString());
        localStorage.setItem('ph_premium_verified', 'true');
      }
      if (data.expires_at) {
        localStorage.setItem('ph_expires_at', data.expires_at);
      }
      if (data.email) {
        localStorage.setItem('ph_email', data.email);
      }
      // Update cached user
      const stored = getStoredUser();
      if (stored && data.status) {
        stored.status = data.status;
        localStorage.setItem('ph_user', JSON.stringify(stored));
      }
    }

    return data;
  }

  // Called on every app load — background sync with backend.
  // Updates localStorage expiry and premium flag.
  async function getSubscriptionStatus() {
    const email = localStorage.getItem('ph_email');
    if (!email) return { active: false, status: 'none' };

    const data = await _get(
      `/api/subscriptions/status?email=${encodeURIComponent(email)}`
    );

    if (data.ok) {
      if (data.active) {
        localStorage.setItem('ph_premium',   'true');
        localStorage.setItem('ph_expires_at', data.expires_at || '');
      } else {
        // Backend says expired — revoke localStorage
        localStorage.removeItem('ph_premium');
        localStorage.removeItem('ph_expires_at');
      }
    }

    return data;
  }

  // ── PREMIUM HELPERS ────────────────────────────────────────────────────────

  // Fast local check — uses expiry if available, falls back to flag
  function isPremium() {
    if (localStorage.getItem('ph_premium') !== 'true') return false;
    const expiresAt = localStorage.getItem('ph_expires_at');
    if (!expiresAt) return true; // no expiry stored yet — trust the flag
    return new Date(expiresAt) > new Date();
  }

  function _syncPremiumFromUser(user) {
    const active = user.status === 'active' || user.status === 'trialing' ||
                   user.sub_status === 'active' || user.sub_status === 'trialing';
    if (active) {
      localStorage.setItem('ph_premium', 'true');
    }
    if (user.expires_at) {
      localStorage.setItem('ph_expires_at', user.expires_at);
    }
  }

  // ── BACKGROUND SYNC every 5 minutes ───────────────────────────────────────
  // Runs silently — keeps premium status in sync without blocking anything
  function _startBackgroundSync() {
    const INTERVAL = 5 * 60 * 1000; // 5 minutes

    async function sync() {
      try {
        const data = await getSubscriptionStatus();
        // Dispatch event so UI can react if status changed
        window.dispatchEvent(new CustomEvent('ph:subscription-sync', { detail: data }));
      } catch (e) {
        // Silent — never interrupt the user
      }
    }

    // First sync after 10s (let page settle), then every 5 min
    setTimeout(sync, 10000);
    setInterval(sync, INTERVAL);
  }

  // ── SESSION HELPERS ────────────────────────────────────────────────────────
  function _getSessionId() {
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

  // ── INIT ───────────────────────────────────────────────────────────────────
  const _init = () => {
    pingUser();
    _startBackgroundSync();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  return {
    logEvent,
    registerUser, pingUser, getUser, getStoredUser,
    captureEmail,
    getStories, getStory,
    startCheckout, verifySession, getSubscriptionStatus,
    isPremium,
  };
})();