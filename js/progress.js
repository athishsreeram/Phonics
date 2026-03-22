/* js/progress.js – progress widget rendered on index.html */
'use strict';

const progressWidget = (() => {

  function render() {
    const profile  = analytics.getProfile();
    const streak   = analytics.getStreak();
    const stars    = analytics.getTotalStars();
    const done     = analytics.getActivitiesCompleted();
    const premium  = analytics.isPremium();
    const progress = analytics.getProgress();
    const name     = profile.childName || null;

    // Only show if user has done something or has a profile
    const hasActivity = done > 0 || stars > 0 || streak > 0 || profile.childName;
    if (!hasActivity) return;

    const existing = document.getElementById('_progress-widget');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.id = '_progress-widget';
    widget.style.cssText = `
      background:white;border-radius:20px;padding:20px 20px 16px;
      box-shadow:0 4px 16px rgba(0,0,0,.08);
      margin:0 0 32px 0;border:2px solid #f0f0ff;
    `;

    // Build recent activity badges
    const recentKeys = Object.entries(progress)
      .filter(([,v]) => v.lastTs)
      .sort(([,a],[,b]) => b.lastTs - a.lastTs)
      .slice(0, 4)
      .map(([k,v]) => ({ id:k, pct:v.bestPct||0, stars:v.bestScore||0 }));

    const ACTIVITY_LABELS = {
      'sound-matching':'Sound Matching','alphabet':'Alphabet A–Z','blending-intro':'Blending',
      'digraph-practice':'Digraphs','vowel-blends':'Vowels','cvc-words':'CVC Words',
      'sight-words':'Sight Words','sentence-reading':'Sentences','word-families':'Word Families',
      'consonant-blends':'Blends','phonics-review':'Review','word-match':'Word Match',
    };

    widget.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#444">
          ${name ? `👋 ${name}'s Progress` : '📊 Your Progress'}
        </div>
        <a href="parent-dashboard.html" style="font-size:.8rem;font-weight:800;color:#667eea;text-decoration:none">
          View full dashboard →
        </a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:${recentKeys.length?'16px':'0'}">
        <div style="${statBox()}">
          <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#f59e0b;line-height:1">${streak || 0}</div>
          <div style="font-size:.75rem;font-weight:800;color:#888;margin-top:3px">🔥 Day streak</div>
        </div>
        <div style="${statBox()}">
          <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#667eea;line-height:1">${stars}</div>
          <div style="font-size:.75rem;font-weight:800;color:#888;margin-top:3px">⭐ Stars</div>
        </div>
        <div style="${statBox()}">
          <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#22c55e;line-height:1">${done}</div>
          <div style="font-size:.75rem;font-weight:800;color:#888;margin-top:3px">✅ Activities</div>
        </div>
      </div>
      ${recentKeys.length ? `
        <div style="font-size:.8rem;font-weight:800;color:#aaa;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Recent</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${recentKeys.map(a => `
            <div style="
              background:#f9fafb;border-radius:10px;padding:6px 12px;
              font-size:.8rem;font-weight:800;color:#555;
              display:flex;align-items:center;gap:6px;
            ">
              ${getActivityEmoji(a.id)} ${ACTIVITY_LABELS[a.id]||a.id}
              <span style="color:${a.pct>=80?'#22c55e':a.pct>=50?'#f59e0b':'#aaa'};font-size:.75rem">
                ${a.pct}%
              </span>
            </div>`).join('')}
        </div>` : ''}
      ${!premium ? `
        <div style="
          margin-top:16px;background:linear-gradient(135deg,#667eea,#764ba2);
          border-radius:14px;padding:12px 16px;
          display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
        ">
          <div style="color:white;font-weight:700;font-size:.88rem">
            🔒 ${16 - Math.min(done,3)} more activities waiting…
          </div>
          <button onclick="analytics.trackUpgradeClick('progress-widget');paymentManager.initiateSubscription()"
            style="background:white;color:#667eea;border:none;border-radius:10px;
                   padding:8px 16px;font-weight:800;font-size:.85rem;cursor:pointer;
                   white-space:nowrap;transition:transform .15s"
            onmouseover="this.style.transform='scale(1.05)'"
            onmouseout="this.style.transform='scale(1)'">
            ⭐ Unlock All
          </button>
        </div>` : `
        <div style="
          margin-top:16px;background:#f0fdf4;border-radius:14px;padding:12px 16px;
          display:flex;align-items:center;gap:8px;
        ">
          <span style="font-size:1.3rem">✅</span>
          <span style="font-weight:700;font-size:.88rem;color:#15803d">Premium active — all activities unlocked!</span>
        </div>`}
    `;

    // Insert into the dedicated slot, or after hero as fallback
    const slot = document.getElementById('progress-widget-slot');
    if (slot) {
      slot.appendChild(widget);
    } else {
      const hero = document.querySelector('.hero');
      if (hero) hero.insertAdjacentElement('afterend', widget);
    }
  }

  function statBox() {
    return `background:#f9fafb;border-radius:14px;padding:14px 10px;text-align:center;`;
  }

  function getActivityEmoji(id) {
    const map = {
      'sound-matching':'🔊','alphabet':'🔤','blending-intro':'🔤',
      'digraph-practice':'📖','vowel-blends':'🎵','cvc-words':'📝',
      'sight-words':'⭐','sentence-reading':'📚','word-families':'👨‍👩‍👧‍👦',
      'consonant-blends':'🔗','phonics-review':'🔄','word-match':'📊',
    };
    return map[id] || '🎯';
  }

  return { render };
})();
