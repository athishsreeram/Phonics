/* js/analytics.js — sends all events to central Phonics API */
'use strict';

const analytics = (() => {
  const SESSION_KEY = 'ph_session';
  const PROFILE_KEY = 'ph_profile';

  function _apiBase() {
    return window.PHONICS_API_BASE || 'https://phonics-api-k43i.onrender.com';
  }

  function isPremium() { return localStorage.getItem('ph_premium') === 'true'; }

  // ── Session ────────────────────────────────────────────────────────────────
  function getSession() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(SESSION_KEY)) || {}; } catch(e) {}
    if (!s.id) {
      s.id  = `s_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      s.ua  = navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop';
      s.ref = document.referrer || 'direct';
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch(e) {}
    }
    return s;
  }

  // ── Core: send event to central API ───────────────────────────────────────
  function logEvent(type, data = {}) {
    const sess  = getSession();
    const event = {
      type,
      session:   sess.id,
      url:       window.location.pathname,
      ua:        sess.ua,
      premium:   isPremium(),
      ts:        Math.floor(Date.now() / 1000),
      ...data,
    };

    // Use PhonicsAPI if loaded, else direct fetch
    if (window.PhonicsAPI && typeof window.PhonicsAPI.logEvent === 'function') {
      window.PhonicsAPI.logEvent(type, data);
    } else {
      fetch(`${_apiBase()}/api/events`, {
        method:    'POST',
        headers:   { 'Content-Type': 'application/json' },
        body:      JSON.stringify(event),
        keepalive: true,
      }).catch(() => {});
    }

    return event;
  }

  // ── Activity tracking ──────────────────────────────────────────────────────
  function trackPageView()  { logEvent('page_view', { title: document.title }); }

  function trackActivityStart(id) {
    logEvent('activity_start', { activityId: id });
    _updateStreak();
    updateProfile({ lastActivity: id, lastSeen: Date.now() });
  }

  function trackActivityComplete(id, score, total) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    logEvent('activity_complete', { activityId: id, score, total, pct });
    const p = getProgress();
    if (!p[id]) p[id] = { attempts: 0, bestScore: 0, bestPct: 0 };
    p[id].attempts++;
    p[id].lastScore = score; p[id].lastPct = pct; p[id].lastTs = Date.now();
    if (pct > (p[id].bestPct || 0)) { p[id].bestScore = score; p[id].bestPct = pct; }
    _saveProgress(p);
    const done = getActivitiesCompleted();
    if (done === 3 && !isPremium()) _showUpgradeNudge('after_3_activities');
  }

  function trackUpgradeClick(source) { logEvent('upgrade_click',  { source }); }
  function trackPaywallHit(id)       { logEvent('paywall_hit',    { activityId: id }); }
  function trackOnboardingStep(step, data = {}) { logEvent('onboarding_step', { step, ...data }); }

  function trackSignup(childName, childAge, email) {
    logEvent('signup', { childName, childAge, hasEmail: !!email });
    updateProfile({ childName, childAge, signupTs: Date.now() });
    if (email) captureEmail(email, childName, 'onboarding');

    // Register with central API
    if (window.PhonicsAPI) {
      window.PhonicsAPI.registerUser(email, childName, childAge).catch(() => {});
    }
  }

  // ── Email capture ──────────────────────────────────────────────────────────
  function captureEmail(email, name, source) {
    if (!email || !email.includes('@')) return;

    // Send to central API
    if (window.PhonicsAPI) {
      window.PhonicsAPI.captureEmail(email, name, source);
    } else {
      fetch(`${_apiBase()}/api/emails`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, name, source, session_id: getSession().id }),
      }).catch(() => {});
    }
    updateProfile({ email });
    logEvent('email_captured', { source });
  }

  function showEmailCapture(source) {
    if (getProfile().email) return;
    if (document.getElementById('_email-capture')) return;
    const el = document.createElement('div');
    el.id = '_email-capture';
    el.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      background:white;border-radius:20px;padding:20px 24px;
      box-shadow:0 8px 32px rgba(0,0,0,.18);z-index:800;
      max-width:420px;width:calc(100% - 32px);border:2px solid #667eea;animation:fadeIn .3s ease;`;
    el.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1">
          <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#667eea;margin-bottom:4px">📧 Get weekly progress reports!</div>
          <div style="font-size:.82rem;color:#666;font-weight:600;margin-bottom:12px">Tips, milestones & learning updates — free.</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input id="_email-input" type="email" placeholder="parent@email.com"
              style="flex:1;min-width:160px;padding:10px 14px;border:2px solid #e5e7eb;
                     border-radius:10px;font-size:.9rem;outline:none;font-family:'Nunito',sans-serif;font-weight:700"/>
            <button onclick="analytics._submitEmail()"
              style="background:#667eea;color:white;border:none;border-radius:10px;
                     padding:10px 16px;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif">Subscribe →</button>
          </div>
        </div>
        <button onclick="document.getElementById('_email-capture').remove()"
          style="background:none;border:none;color:#ccc;font-size:1.2rem;cursor:pointer;flex-shrink:0">✕</button>
      </div>`;
    document.body.appendChild(el);
    logEvent('email_capture_shown', { source });
  }

  function _submitEmail() {
    const input = document.getElementById('_email-input');
    const email = input?.value?.trim();
    if (!email || !email.includes('@')) { if(input) input.style.borderColor='#ef4444'; return; }
    captureEmail(email, getProfile().childName || 'parent', 'email_bar');

    // Also register as user
    if (window.PhonicsAPI) {
      window.PhonicsAPI.registerUser(email, getProfile().childName, null).catch(() => {});
    }

    const el = document.getElementById('_email-capture');
    if (el) {
      el.innerHTML = `<div style="text-align:center;font-family:'Fredoka One',cursive;font-size:1.1rem;color:#22c55e;padding:8px">✅ Subscribed!</div>`;
      setTimeout(() => el.remove(), 2000);
    }
  }

  // ── Upgrade nudge ──────────────────────────────────────────────────────────
  function _showUpgradeNudge(trigger) {
    if (isPremium() || document.getElementById('_upgrade-nudge')) return;
    const el = document.createElement('div');
    el.id = '_upgrade-nudge';
    el.style.cssText = `position:fixed;bottom:20px;right:20px;
      background:linear-gradient(135deg,#667eea,#764ba2);color:white;
      border-radius:20px;padding:20px;box-shadow:0 8px 28px rgba(102,126,234,.5);
      z-index:800;max-width:280px;animation:fadeIn .4s ease;`;
    el.innerHTML = `
      <button onclick="document.getElementById('_upgrade-nudge').remove()"
        style="position:absolute;top:10px;right:12px;background:none;border:none;color:rgba(255,255,255,.6);font-size:1rem;cursor:pointer">✕</button>
      <div style="font-size:2rem;margin-bottom:8px">🌟</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.15rem;margin-bottom:6px">You're on a roll!</div>
      <div style="font-size:.85rem;opacity:.9;margin-bottom:14px;line-height:1.5">Unlock 16 more activities — first 7 days free!</div>
      <button onclick="analytics.trackUpgradeClick('nudge_${trigger}');paymentManager.initiateSubscription();document.getElementById('_upgrade-nudge').remove();"
        style="background:white;color:#667eea;border:none;border-radius:10px;
               padding:10px 18px;font-weight:800;cursor:pointer;width:100%;font-family:'Nunito',sans-serif">🚀 Start Free Trial</button>`;
    document.body.appendChild(el);
    logEvent('upgrade_nudge_shown', { trigger });
  }

  // ── Streak ─────────────────────────────────────────────────────────────────
  function _updateStreak() {
    const today = new Date().toDateString(), yest = new Date(Date.now()-864e5).toDateString();
    const d = JSON.parse(localStorage.getItem('ph_streak') || '{"last":"","count":0,"longest":0}');
    if (d.last === today) return;
    d.count   = d.last === yest ? d.count + 1 : 1;
    d.longest = Math.max(d.longest || 0, d.count);
    d.last    = today;
    localStorage.setItem('ph_streak', JSON.stringify(d));
    if (d.count > 1) logEvent('streak_milestone', { days: d.count });
  }
  function getStreak() {
    const d = JSON.parse(localStorage.getItem('ph_streak') || '{"last":"","count":0}');
    const today = new Date().toDateString(), yest = new Date(Date.now()-864e5).toDateString();
    return (d.last===today||d.last===yest) ? d.count : 0;
  }

  // ── Local progress ─────────────────────────────────────────────────────────
  function getProgress()    { try{ return JSON.parse(localStorage.getItem('ph_progress')||'{}'); }catch(e){ return {}; } }
  function _saveProgress(p) { try{ localStorage.setItem('ph_progress', JSON.stringify(p)); }catch(e){} }
  function getActivityProgress(id) { return getProgress()[id] || null; }
  function getTotalStars()  { return Object.values(getProgress()).reduce((s,a)=>s+(a.bestScore||0),0); }
  function getActivitiesCompleted() { return Object.values(getProgress()).filter(a=>(a.attempts||0)>0).length; }

  // ── Profile ────────────────────────────────────────────────────────────────
  function getProfile()     { try{ return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}'); }catch(e){ return {}; } }
  function updateProfile(d) { try{ localStorage.setItem(PROFILE_KEY, JSON.stringify({...getProfile(),...d})); }catch(e){} }
  function isNewUser()      { return !localStorage.getItem(PROFILE_KEY) && !localStorage.getItem('ph_progress'); }

  // ── Auto page-exit tracking ────────────────────────────────────────────────
  window._pageStart = Date.now();
  window.addEventListener('beforeunload', () => {
    const s = Math.round((Date.now()-window._pageStart)/1000);
    if (s > 3) logEvent('page_exit', { seconds: s });
  });
  setTimeout(() => {
    const locked = document.querySelectorAll('.activity-card.locked').length;
    if (locked > 0) logEvent('paywall_impression', { lockedCount: locked });
  }, 1500);
  const onIndex = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
  if (onIndex) {
    setTimeout(() => {
      if (!isPremium() && !getProfile().email) showEmailCapture('45s_engaged');
    }, 45000);
  }

  trackPageView();
  updateProfile({ lastSeen: Date.now() });

  return {
    trackPageView, trackActivityStart, trackActivityComplete,
    trackUpgradeClick, trackPaywallHit, trackOnboardingStep,
    trackSignup, captureEmail, showEmailCapture, _submitEmail,
    getStreak, getProgress, getActivityProgress,
    getTotalStars, getActivitiesCompleted,
    getProfile, updateProfile, isNewUser, isPremium,
    getSession, logEvent,
  };
})();
