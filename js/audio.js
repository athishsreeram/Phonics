/**
 * audio.js — Global audio manager for Phonics Learning Hub
 * Handles: Speech synthesis, sound effects, audio on/off toggle
 */

const AudioManager = (() => {
  // ── State ──────────────────────────────────────────────
  let _enabled = localStorage.getItem('phonics_audio') !== 'off';
  let _speaking = false;
  let _currentUtterance = null;

  // ── Speech Synthesis helpers ───────────────────────────

  /** Speak text aloud (respects audio toggle) */
  function speak(text, opts = {}) {
    if (!_enabled) return;
    if (!('speechSynthesis' in window)) return;

    stop(); // cancel any current speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = opts.rate  ?? 0.85;   // slightly slower for toddlers
    utterance.pitch = opts.pitch ?? 1.1;    // slightly higher, friendlier
    utterance.volume = opts.volume ?? 1.0;

    // Pick a clear, child-friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen')    ||
      v.name.includes('Google US English') ||
      v.lang === 'en-US'
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { _speaking = true; };
    utterance.onend   = () => {
      _speaking = false;
      _currentUtterance = null;
      if (typeof opts.onEnd === 'function') opts.onEnd();
    };
    utterance.onerror = () => { _speaking = false; };

    _currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /** Speak a single letter with its phoneme sound */
  function speakLetter(letter) {
    // Map letters to their phoneme descriptions for clearer pronunciation
    const phonemes = {
      a:'aah', b:'buh', c:'kuh', d:'duh', e:'eh', f:'fuh',
      g:'guh', h:'huh', i:'ih', j:'juh', k:'kuh', l:'luh',
      m:'muh', n:'nuh', o:'oh', p:'puh', q:'kwuh', r:'ruh',
      s:'sss', t:'tuh', u:'uh', v:'vuh', w:'wuh', x:'ksss',
      y:'yuh', z:'zzz'
    };
    const l = letter.toLowerCase();
    const phoneme = phonemes[l] || l;
    speak(`${letter}. ${phoneme}`, { rate: 0.8 });
  }

  /** Speak a word clearly, letter-by-letter then the full word */
  function spellWord(word) {
    if (!_enabled) return;
    const letters = word.split('').join('... ');
    speak(`${letters}... ${word}`, { rate: 0.8 });
  }

  /** Play a short sound effect via Web Audio API */
  function playTone(type = 'correct') {
    if (!_enabled) return;
    if (!window.AudioContext && !window.webkitAudioContext) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const tones = {
        correct: { freq: [523, 659, 784], dur: 0.1, wave: 'sine' },
        wrong:   { freq: [300, 220],      dur: 0.15, wave: 'sawtooth' },
        click:   { freq: [440],           dur: 0.08, wave: 'sine' },
        star:    { freq: [523, 659, 784, 1047], dur: 0.08, wave: 'triangle' },
        pop:     { freq: [600, 400],       dur: 0.1, wave: 'sine' },
      };

      const t = tones[type] || tones.click;
      osc.type = t.wave;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      t.freq.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * t.dur);
      });

      const totalDur = t.freq.length * t.dur;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + totalDur + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + totalDur + 0.15);
    } catch (e) {
      // Silently fail — audio is not critical
    }
  }

  /** Stop any current speech */
  function stop() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    _speaking = false;
    _currentUtterance = null;
  }

  // ── Toggle ─────────────────────────────────────────────

  function isEnabled() { return _enabled; }

  function setEnabled(val) {
    _enabled = !!val;
    localStorage.setItem('phonics_audio', _enabled ? 'on' : 'off');
    if (!_enabled) stop();
    _updateAllToggles();
  }

  function toggle() {
    setEnabled(!_enabled);
    return _enabled;
  }

  // ── UI Sync ────────────────────────────────────────────

  /** Update every .audio-toggle button on the page */
  function _updateAllToggles() {
    document.querySelectorAll('.audio-toggle').forEach(btn => {
      btn.classList.toggle('on', _enabled);
      btn.classList.toggle('off', !_enabled);
      const icon = btn.querySelector('.audio-icon');
      const label = btn.querySelector('.audio-label');
      if (icon)  icon.textContent = _enabled ? '🔊' : '🔇';
      if (label) label.textContent = _enabled ? 'Sound' : 'Muted';
    });
  }

  /** Create and insert an audio toggle button */
  function createToggleBtn() {
    const btn = document.createElement('button');
    btn.className = `audio-toggle ${_enabled ? 'on' : 'off'}`;
    btn.setAttribute('aria-label', 'Toggle sound');
    btn.setAttribute('title', 'Toggle sound on/off');
    btn.innerHTML = `
      <span class="audio-icon">${_enabled ? '🔊' : '🔇'}</span>
      <span class="audio-label">${_enabled ? 'Sound' : 'Muted'}</span>
    `;
    btn.addEventListener('click', () => {
      const nowOn = toggle();
      playTone('click');
      showToast(nowOn ? '🔊 Sound On' : '🔇 Sound Off');
    });
    return btn;
  }

  // ── Toast helper ───────────────────────────────────────

  function showToast(msg, duration = 1800) {
    let toast = document.getElementById('ph-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ph-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ── Init ───────────────────────────────────────────────

  /** Call once on page load to wire up the nav audio button */
  function init() {
    // Voices load async in some browsers
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {});
    }
    // Insert button into .nav-right if present
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      navRight.prepend(createToggleBtn());
    }
    _updateAllToggles();
  }

  // Public API
  return { speak, speakLetter, spellWord, playTone, stop, isEnabled, setEnabled, toggle, createToggleBtn, showToast, init };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AudioManager.init);
} else {
  AudioManager.init();
}
