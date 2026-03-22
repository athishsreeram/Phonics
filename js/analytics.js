/* js/analytics.js – full behavior tracking + email capture + retention */
'use strict';

const analytics = (() => {
  const SESSION_KEY = 'ph_session';
  const EVENTS_KEY  = 'ph_events';
  const PROFILE_KEY = 'ph_profile';

  function isPremium() { return localStorage.getItem('ph_premium') === 'true'; }

  function getSession() {
    let s = {};
    try { s = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch(e) {}
    if (!s.id) {
      s.id      = `s_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      s.start   = Date.now();
      s.page    = window.location.pathname;
      s.premium = isPremium();
      s.ref     = document.referrer || 'direct';
      s.ua      = navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop';
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch(e) {}
    }
    return s;
  }

  function logEvent(type, data = {}) {
    const sess  = getSession();
    const event = { type, ts: Date.now(), session: sess.id, url: window.location.pathname,
                    premium: sess.premium, ua: sess.ua, ...data };
    try {
      const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      events.push(event);
      if (events.length > 1000) events.splice(0, events.length - 1000);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch(e) {}
    fetch('/api/log-events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
    return event;
  }

  // ── Core trackers ─────────────────────────────────────────
  function trackPageView() { logEvent('page_view', { title: document.title }); }

  function trackActivityStart(id) {
    logEvent('activity_start', { activityId: id });
    updateStreak();
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
    saveProgress(p);
    const done = getActivitiesCompleted();
    if (done === 3 && !isPremium()) _showUpgradeNudge('after_3_activities');
  }

  function trackUpgradeClick(source) { logEvent('upgrade_click', { source }); }
  function trackPaywallHit(id)       { logEvent('paywall_hit', { activityId: id }); }
  function trackOnboardingStep(step, data = {}) { logEvent('onboarding_step', { step, ...data }); }
  function trackSignup(childName, childAge, email) {
    logEvent('signup', { childName, childAge, hasEmail: !!email });
    updateProfile({ childName, childAge, signupTs: Date.now() });
    if (email) _sendEmailToApi(email, childName);
  }

  // ── Email capture ─────────────────────────────────────────
  function _sendEmailToApi(email, name) {
    fetch('/api/capture-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, ts: Date.now(), source: 'onboarding',
                             profile: getProfile() })
    }).catch(() => {});
    updateProfile({ email });
    logEvent('email_captured', { source: 'onboarding' });
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
          <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#667eea;margin-bottom:4px">
            📧 Get weekly progress reports!
          </div>
          <div style="font-size:.82rem;color:#666;font-weight:600;margin-bottom:12px">
            Tips, milestones & learning updates — free.
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input id="_email-input" type="email" placeholder="parent@email.com"
              style="flex:1;min-width:160px;padding:10px 14px;border:2px solid #e5e7eb;
                     border-radius:10px;font-size:.9rem;outline:none;font-family:'Nunito',sans-serif;font-weight:700"/>
            <button onclick="analytics._submitEmail()"
              style="background:#667eea;color:white;border:none;border-radius:10px;
                     padding:10px 16px;font-weight:800;cursor:pointer;font-family:'Nunito',sans-serif">
              Subscribe →
            </button>
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
    _sendEmailToApi(email, getProfile().childName || 'parent');
    const el = document.getElementById('_email-capture');
    if (el) {
      el.innerHTML = `<div style="text-align:center;font-family:'Fredoka One',cursive;font-size:1.1rem;color:#22c55e;padding:8px">
        ✅ Subscribed! You'll get weekly progress reports.
      </div>`;
      setTimeout(() => el.remove(), 2500);
    }
  }

  // ── Upgrade nudge ─────────────────────────────────────────
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
        style="position:absolute;top:10px;right:12px;background:none;border:none;
               color:rgba(255,255,255,.6);font-size:1rem;cursor:pointer">✕</button>
      <div style="font-size:2rem;margin-bottom:8px">🌟</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.15rem;margin-bottom:6px">You're on a roll!</div>
      <div style="font-size:.85rem;opacity:.9;margin-bottom:14px;line-height:1.5">
        Unlock 16 more activities — first 7 days free!
      </div>
      <button onclick="analytics.trackUpgradeClick('nudge_${trigger}');paymentManager.initiateSubscription();document.getElementById('_upgrade-nudge').remove();"
        style="background:white;color:#667eea;border:none;border-radius:10px;
               padding:10px 18px;font-weight:800;cursor:pointer;width:100%;font-family:'Nunito',sans-serif">
        🚀 Start Free Trial
      </button>`;
    document.body.appendChild(el);
    logEvent('upgrade_nudge_shown', { trigger });
  }

  // ── Streak ────────────────────────────────────────────────
  function updateStreak() {
    const today = new Date().toDateString();
    const yest  = new Date(Date.now() - 864e5).toDateString();
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
    return (d.last === today || d.last === yest) ? d.count : 0;
  }

  // ── Progress ──────────────────────────────────────────────
  function getProgress()    { try { return JSON.parse(localStorage.getItem('ph_progress')||'{}'); } catch(e){ return {}; } }
  function saveProgress(p)  { try { localStorage.setItem('ph_progress', JSON.stringify(p)); } catch(e){} }
  function getActivityProgress(id) { return getProgress()[id] || null; }
  function getTotalStars()  { return Object.values(getProgress()).reduce((s,a) => s+(a.bestScore||0), 0); }
  function getActivitiesCompleted() { return Object.values(getProgress()).filter(a => (a.attempts||0) > 0).length; }

  // ── Profile ───────────────────────────────────────────────
  function getProfile()     { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}'); } catch(e){ return {}; } }
  function updateProfile(d) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify({...getProfile(),...d})); } catch(e){} }
  function isNewUser()      { return !localStorage.getItem(PROFILE_KEY) && !localStorage.getItem('ph_progress'); }

  // ── Funnel summary ────────────────────────────────────────
  function getEvents() { try { return JSON.parse(localStorage.getItem(EVENTS_KEY)||'[]'); } catch(e){ return []; } }
  function getFunnelSummary() {
    const ev = getEvents(), c = t => ev.filter(e => e.type===t).length;
    return { pageViews:c('page_view'), activityStarts:c('activity_start'),
      activityCompletes:c('activity_complete'), paywallHits:c('paywall_hit'),
      upgradeClicks:c('upgrade_click'), emailsCaptured:c('email_captured'),
      onboardingCompleted:ev.some(e=>e.type==='onboarding_step'&&e.step==='completed'),
      streak:getStreak(), totalStars:getTotalStars(),
      activitiesCompleted:getActivitiesCompleted(), isPremium:isPremium(), profile:getProfile() };
  }

  // ── Auto-tracking ─────────────────────────────────────────
  window._pageStart = Date.now();
  window.addEventListener('beforeunload', () => {
    const s = Math.round((Date.now()-window._pageStart)/1000);
    if (s > 3) logEvent('page_exit', { seconds: s });
  });
  setTimeout(() => {
    const locked = document.querySelectorAll('.activity-card.locked').length;
    if (locked > 0) logEvent('paywall_impression', { lockedCount: locked });
  }, 1500);
  // Email capture after 45s on index for engaged non-premium users
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
    trackSignup, showEmailCapture, _submitEmail,
    getStreak, getProgress, getActivityProgress,
    getTotalStars, getActivitiesCompleted,
    getProfile, updateProfile, isNewUser,
    getEvents, getFunnelSummary, logEvent, isPremium,
  };
})();
