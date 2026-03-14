/**
 * ui.js — Shared UI helpers for Phonics Learning Hub
 * Feedback overlays, confetti, stars, progress, nav building
 */

const UI = (() => {

  // ── Feedback ───────────────────────────────────────────

  const CORRECT_MSGS = ['Amazing! 🌟','Great job! 🎉','You got it! ✨','Super! 🦄','Brilliant! 🎊','Well done! 🏆'];
  const WRONG_MSGS   = ['Try again! 💪','So close! 😊','You can do it! 🌈','Keep going! 🚀'];

  function showFeedback(correct, duration = 1200) {
    // Remove existing overlay
    document.getElementById('ph-feedback')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'ph-feedback';
    overlay.className = 'feedback-overlay';

    const msgs = correct ? CORRECT_MSGS : WRONG_MSGS;
    const emoji = correct
      ? ['🎉','⭐','🌟','🦄','🎊','🥳','🏆','🎈'][Math.floor(Math.random() * 8)]
      : ['😊','💪','🌈','🚀'][Math.floor(Math.random() * 4)];
    const msg  = msgs[Math.floor(Math.random() * msgs.length)];

    overlay.style.background = correct
      ? 'rgba(107, 203, 119, 0.85)'
      : 'rgba(255, 107, 53, 0.75)';

    overlay.innerHTML = `
      <div class="feedback-emoji">${emoji}</div>
      <div class="feedback-text">${msg}</div>
    `;

    document.body.appendChild(overlay);

    // Show → hide
    requestAnimationFrame(() => overlay.classList.add('show'));

    if (correct) launchConfetti();

    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }, duration);
  }

  // ── Confetti ───────────────────────────────────────────

  function launchConfetti() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confetti-canvas';
      document.body.appendChild(canvas);
    }
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const colors = ['#FF6B35','#4ECDC4','#FFE66D','#A78BFA','#6BCB77','#FF85A1','#4D96FF'];
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 8 + Math.random() * 10,
      h: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 4,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
    }));

    let frame;
    let elapsed = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        p.vy  += 0.1; // gravity
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      elapsed++;
      if (alive && elapsed < 180) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(frame);
      }
    }
    draw();
  }

  // ── Star rating display ────────────────────────────────

  function renderStars(count, max = 5) {
    return Array.from({ length: max }, (_, i) =>
      `<span style="font-size:1.4em">${i < count ? '⭐' : '☆'}</span>`
    ).join('');
  }

  // ── Progress bar ───────────────────────────────────────

  function updateProgress(el, value, max) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    el.style.width = pct + '%';
    el.setAttribute('aria-valuenow', value);
    el.setAttribute('aria-valuemax', max);
  }

  // ── Navigation bar builder ─────────────────────────────

  /**
   * Inject the standard top nav bar.
   * Call from each page after DOMContentLoaded.
   * @param {string} title - Page title shown in nav
   * @param {string} [stageColor] - CSS color for stage indicator
   */
  function buildNav(title, stageColor) {
    // Skip if nav already exists
    if (document.querySelector('.top-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    nav.innerHTML = `
      <div class="nav-left">
        <a href="index.html" class="nav-home-btn" aria-label="Home" title="Go to Home">🏠</a>
        <span class="nav-title">${title}</span>
      </div>
      <div class="nav-right">
        <!-- audio toggle and material selector injected by their modules -->
      </div>
    `;

    if (stageColor) {
      nav.style.borderBottom = `4px solid ${stageColor}`;
    }

    // Insert before first child of body
    document.body.insertBefore(nav, document.body.firstChild);
  }

  // ── Score storage helpers ──────────────────────────────

  function getScore(key) {
    try { return JSON.parse(localStorage.getItem('phonics_score_' + key)) || {}; }
    catch { return {}; }
  }

  function setScore(key, data) {
    localStorage.setItem('phonics_score_' + key, JSON.stringify(data));
  }

  // ── Utility: animate a button on tap ──────────────────

  function animateBtn(el, cls = 'animate-bounce') {
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 700);
  }

  // ── Utility: shuffle array ─────────────────────────────

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Toast ──────────────────────────────────────────────
  function toast(msg, duration = 2000) {
    if (window.AudioManager) AudioManager.showToast(msg, duration);
    else {
      let t = document.getElementById('ph-toast');
      if (!t) { t = document.createElement('div'); t.id = 'ph-toast'; t.className = 'toast'; document.body.appendChild(t); }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._timer);
      t._timer = setTimeout(() => t.classList.remove('show'), duration);
    }
  }

  return { showFeedback, launchConfetti, renderStars, updateProgress, buildNav, getScore, setScore, animateBtn, shuffle, toast };
})();
