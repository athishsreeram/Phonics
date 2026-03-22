/* js/activity-gating.js – controls free vs paid activity access */
'use strict';

const activityGating = (() => {

  /* Map from data-activity-id  →  HTML page filename */
  const ACTIVITY_MAP = {
    /* FREE */
    'sound-matching':    'listen-choose.html',
    'letter-recognition':'alphabet.html',
    'blending-intro':    'phonic-set1.html',

    /* PREMIUM */
    'digraph-practice':  'digraphs.html',
    'vowel-blends':      'vowels.html',
    'cvc-words':         'cvc.html',
    'sight-words':       'sight-words.html',
    'sentence-reading':  'read.html',
    'word-families':     'rhyme.html',
    'consonant-blends':  'consonant-blend.html',
    'r-controlled-vowels':'phonic-set2.html',
    'silent-e-words':    'magic-e.html',
    'vowel-digraphs':    'digraph_fill.html',
    'phonics-review':    'phkids.html',
    'assessment-level-1':'word-match.html',
    'assessment-level-2':'word-explore.html',
    'story-time':        'story.html',
    'parent-dashboard':  'parent-dashboard.html',
    'progress-tracker':  'trace.html',
  };

  const FREE_ACTIVITIES = new Set([
    'sound-matching',
    'letter-recognition',
    'blending-intro',
  ]);

  async function initializeActivityGating() {
    const premium = paymentManager.isPremium();
    const cards = document.querySelectorAll('.activity-card');

    cards.forEach(card => {
      const id   = card.dataset.activityId;
      const page = ACTIVITY_MAP[id];
      const btn  = card.querySelector('.play-btn, button');
      if (!btn || !page) return;

      const isFree    = FREE_ACTIVITIES.has(id);
      const hasAccess = isFree || premium;

      if (hasAccess) {
        card.classList.remove('locked');
        const badge = card.querySelector('.lock-badge');
        if (badge) badge.remove();
        btn.style.pointerEvents = 'auto';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = page;
        });
        if (!isFree) {
          btn.textContent = '▶️ Play';
          btn.style.background = '#22c55e';
          btn.href = page;
        }
      } else {
        card.classList.add('locked');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          paymentManager.initiateSubscription();
        });
      }
    });
  }

  return { initializeActivityGating, ACTIVITY_MAP, FREE_ACTIVITIES };
})();
