// ============================================================
// shared.js — Phonics Learning Hub · Shared Utilities
// ============================================================

// ─── SPEECH ──────────────────────────────────────────────────
function speak(text, rate = 0.82, pitch = 1.1, onEnd = null) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate  = rate;
  u.pitch = pitch;
  u.lang  = 'en-US';
  // prefer a clear female/child-friendly voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') ||
    v.name.includes('Google US') || v.name.includes('Female') || v.name.includes('Zira'))
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) u.voice = preferred;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

function speakSlow(text, onEnd = null) { speak(text, 0.65, 1.1, onEnd); }
function speakFast(text, onEnd = null) { speak(text, 1.05, 1.0, onEnd); }

// Speak phoneme in isolation (no trailing vowel)
function speakPhoneme(ph) {
  const map = {
    'a':'/æ/','e':'/ɛ/','i':'/ɪ/','o':'/ɒ/','u':'/ʌ/',
    'sh':'sh','ch':'ch','th':'th','ph':'ph','wh':'wh','ng':'ng'
  };
  speak(ph, 0.7, 1.2);
}

// ─── STARS & PROGRESS ─────────────────────────────────────────
const STARS_KEY = 'ph_stars';
const PROGRESS_KEY = 'ph_progress';

function getTotalStars() {
  return parseInt(localStorage.getItem(STARS_KEY) || '0');
}

function awardStars(moduleId, count = 1) {
  const cur = getTotalStars();
  localStorage.setItem(STARS_KEY, cur + count);
  const prog = getProgress();
  prog[moduleId] = (prog[moduleId] || 0) + count;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  updateStarDisplay();
}

function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
}

function markComplete(moduleId) {
  const prog = getProgress();
  prog[moduleId + '_done'] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
}

function isComplete(moduleId) {
  return !!getProgress()[moduleId + '_done'];
}

function updateStarDisplay() {
  const el = document.getElementById('total-stars');
  if (el) el.textContent = '⭐ ' + getTotalStars();
}

// ─── CONFETTI ─────────────────────────────────────────────────
function confetti(duration = 2200) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6FCF','#FF9F43','#A29BFE'];
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: 8 + Math.random() * 10,
    h: 6 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    speed: 2 + Math.random() * 4,
    spin: (Math.random() - 0.5) * 6,
    drift: (Math.random() - 0.5) * 2
  }));

  const start = Date.now();
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y    += p.speed;
      p.x    += p.drift;
      p.rot  += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (Date.now() - start < duration) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

// ─── CELEBRATION OVERLAY ──────────────────────────────────────
function celebrate(msg = 'Amazing! 🎉', stars = 1) {
  confetti();
  awardStars('generic', stars);
  const overlay = document.createElement('div');
  overlay.className = 'ph-celebrate-overlay';
  overlay.innerHTML = `
    <div class="ph-celebrate-box">
      <div class="ph-celebrate-emoji">🎉</div>
      <div class="ph-celebrate-msg">${msg}</div>
      <div class="ph-celebrate-stars">${'⭐'.repeat(stars)}</div>
      <button class="ph-celebrate-btn" onclick="this.closest('.ph-celebrate-overlay').remove()">Keep Going! 🚀</button>
    </div>`;
  document.body.appendChild(overlay);
  speak(msg.replace(/[🎉⭐🚀✨🌟]/g,''));
  setTimeout(() => overlay.remove(), 5000);
}

// ─── HOME BUTTON ──────────────────────────────────────────────
function injectHomeBtn() {
  const btn = document.createElement('a');
  btn.href = './index.html';
  btn.className = 'ph-home-btn';
  btn.title = 'Go Home';
  btn.innerHTML = '🏠';
  btn.onclick = (e) => { e.preventDefault(); speak('Going home!'); setTimeout(() => location.href = './index.html', 600); };
  document.body.appendChild(btn);
}

// ─── MASCOT (Ollie the Owl) ────────────────────────────────────
function injectMascot(tips = []) {
  const defaultTips = [
    "Tap any card to hear it! 🦉",
    "You're doing great! Keep going!",
    "Try saying it out loud! 🗣️",
    "Every star counts! ⭐",
    "Learning is fun! 🌟"
  ];
  const allTips = [...tips, ...defaultTips];
  let tipIdx = 0;

  const mascot = document.createElement('div');
  mascot.className = 'ph-mascot';
  mascot.innerHTML = `
    <div class="ph-mascot-bubble" id="mascot-bubble">${allTips[0]}</div>
    <div class="ph-mascot-owl" id="mascot-owl">🦉</div>`;
  document.body.appendChild(mascot);

  const bubble = document.getElementById('mascot-bubble');
  const owl    = document.getElementById('mascot-owl');

  owl.onclick = () => {
    tipIdx = (tipIdx + 1) % allTips.length;
    bubble.textContent = allTips[tipIdx];
    bubble.style.opacity = '1';
    speak(allTips[tipIdx].replace(/[🦉⭐🗣️🌟]/g,''));
    owl.style.transform = 'scale(1.3) rotate(-10deg)';
    setTimeout(() => owl.style.transform = '', 400);
  };

  // auto-cycle tips
  setInterval(() => {
    tipIdx = (tipIdx + 1) % allTips.length;
    bubble.style.opacity = '0';
    setTimeout(() => { bubble.textContent = allTips[tipIdx]; bubble.style.opacity = '1'; }, 400);
  }, 12000);
}

// ─── STAR COUNTER IN HEADER ───────────────────────────────────
function injectStarCounter() {
  const el = document.createElement('div');
  el.id = 'total-stars';
  el.className = 'ph-star-counter';
  el.textContent = '⭐ ' + getTotalStars();
  document.body.prepend(el);
}

// ─── WRONG SHAKE ──────────────────────────────────────────────
function shakeWrong(el) {
  el.classList.add('ph-shake');
  setTimeout(() => el.classList.remove('ph-shake'), 600);
  speak("Try again!", 0.9);
}

// ─── CORRECT FLASH ────────────────────────────────────────────
function flashCorrect(el, msg = "Correct!") {
  el.classList.add('ph-correct-flash');
  setTimeout(() => el.classList.remove('ph-correct-flash'), 800);
  speak(msg);
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // preload voices
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();

  injectHomeBtn();
  updateStarDisplay();
});
