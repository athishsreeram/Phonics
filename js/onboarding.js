/* js/onboarding.js – multi-step onboarding for new users */
'use strict';

const onboarding = (() => {

  const STEPS = [
    'welcome',    // Step 0: Welcome screen
    'child-info', // Step 1: Child name + age
    'goal',       // Step 2: What do you want to learn?
    'tour',       // Step 3: Quick app tour
    'ready',      // Step 4: All set!
  ];

  let currentStep = 0;
  let answers = {};

  function shouldShow() {
    return !localStorage.getItem('ph_onboarded');
  }

  function markDone() {
    localStorage.setItem('ph_onboarded', 'true');
    localStorage.setItem('ph_onboarded_ts', Date.now().toString());
  }

  function start() {
    if (!shouldShow()) return;
    render(0);
  }

  function render(step) {
    currentStep = step;
    const existing = document.getElementById('_onboarding');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = '_onboarding';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:1000;
      background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:20px;
      animation:fadeIn .3s ease;
    `;

    const content = getStepContent(step);
    overlay.innerHTML = `
      <div style="
        background:white;border-radius:28px;padding:40px 32px;
        max-width:480px;width:100%;text-align:center;
        box-shadow:0 24px 80px rgba(0,0,0,.25);
        animation:fadeIn .35s ease;
        position:relative;
      ">
        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:28px">
          ${STEPS.map((_,i) => `
            <div style="
              height:6px;border-radius:3px;flex:1;max-width:48px;
              background:${i<=step?'#667eea':'#e5e7eb'};
              transition:background .3s;
            "></div>`).join('')}
        </div>
        ${content}
      </div>`;

    document.body.appendChild(overlay);
    analytics.trackOnboardingStep(STEPS[step]);
  }

  function getStepContent(step) {
    switch(step) {
      case 0: return `
        <div style="font-size:4.5rem;margin-bottom:16px">📚</div>
        <h2 style="font-family:'Fredoka One',cursive;font-size:2rem;color:#667eea;margin-bottom:10px">
          Welcome to Phonics Hub!
        </h2>
        <p style="color:#666;font-size:1rem;line-height:1.6;margin-bottom:28px">
          Fun, interactive phonics learning for kids ages 3–7.<br>
          Let's set things up in <strong>30 seconds</strong>. 🚀
        </p>
        <button onclick="onboarding.next()" style="${btnStyle('#667eea')}">
          Let's Go! →
        </button>
        <button onclick="onboarding.skip()" style="${linkStyle()}">Skip setup</button>`;

      case 1: return `
        <div style="font-size:3.5rem;margin-bottom:12px">👶</div>
        <h2 style="font-family:'Fredoka One',cursive;font-size:1.8rem;color:#667eea;margin-bottom:8px">
          Tell us about your child
        </h2>
        <p style="color:#666;font-size:.9rem;margin-bottom:24px">We'll personalise their experience!</p>
        <div style="text-align:left;display:flex;flex-direction:column;gap:14px;margin-bottom:24px">
          <div>
            <label style="font-weight:800;font-size:.85rem;color:#444;display:block;margin-bottom:6px">
              Child's first name
            </label>
            <input id="ob-name" type="text" placeholder="e.g. Emma" maxlength="20"
              style="${inputStyle()}" />
          </div>
          <div>
            <label style="font-weight:800;font-size:.85rem;color:#444;display:block;margin-bottom:8px">
              Child's age
            </label>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
              ${['2–3','4','5','6–7'].map(age => `
                <button onclick="onboarding.selectAge('${age}',this)"
                  style="${ageStyle()}" data-age="${age}">${age}</button>
              `).join('')}
            </div>
          </div>
        </div>
        <button onclick="onboarding.saveChildInfo()" style="${btnStyle('#667eea')}">
          Continue →
        </button>
        <button onclick="onboarding.prev()" style="${linkStyle()}">← Back</button>`;

      case 2: return `
        <div style="font-size:3.5rem;margin-bottom:12px">🎯</div>
        <h2 style="font-family:'Fredoka One',cursive;font-size:1.8rem;color:#667eea;margin-bottom:8px">
          What's your main goal?
        </h2>
        <p style="color:#666;font-size:.9rem;margin-bottom:20px">Pick all that apply</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;text-align:left">
          ${[
            ['🔤','Learn letter sounds','letter-sounds'],
            ['📖','Start reading words','reading'],
            ['🎵','Practice blending','blending'],
            ['⭐','Master sight words','sight-words'],
            ['🎮','Make learning fun','fun'],
          ].map(([emoji,label,id]) => `
            <label style="
              display:flex;align-items:center;gap:12px;
              background:#f9fafb;border:2px solid #e5e7eb;border-radius:14px;
              padding:14px 16px;cursor:pointer;font-weight:700;font-size:.95rem;
              transition:all .15s;
            " onclick="this.style.borderColor=this.querySelector('input').checked?'#e5e7eb':'#667eea';
                       this.style.background=this.querySelector('input').checked?'#f9fafb':'#eef2ff'">
              <input type="checkbox" value="${id}" style="width:18px;height:18px;accent-color:#667eea" />
              <span style="font-size:1.3rem">${emoji}</span>
              ${label}
            </label>`).join('')}
        </div>
        <button onclick="onboarding.saveGoals()" style="${btnStyle('#667eea')}">
          Continue →
        </button>
        <button onclick="onboarding.prev()" style="${linkStyle()}">← Back</button>`;

      case 3: return `
        <div style="font-size:3.5rem;margin-bottom:12px">🗺️</div>
        <h2 style="font-family:'Fredoka One',cursive;font-size:1.8rem;color:#667eea;margin-bottom:8px">
          Here's how it works
        </h2>
        <div style="display:flex;flex-direction:column;gap:12px;margin:20px 0;text-align:left">
          ${[
            ['🆓','3 free activities — no signup needed'],
            ['🔒','16+ premium activities — $9.99/mo'],
            ['🔊','Tap any word or letter to hear it'],
            ['⭐','Earn stars as you complete activities'],
            ['📊','Track progress in Parent Dashboard'],
          ].map(([icon,text]) => `
            <div style="
              display:flex;align-items:center;gap:12px;
              background:#f9fafb;border-radius:14px;padding:14px 16px;
              font-weight:700;font-size:.92rem;
            ">
              <span style="font-size:1.4rem">${icon}</span>${text}
            </div>`).join('')}
        </div>
        <button onclick="onboarding.next()" style="${btnStyle('#667eea')}">
          Got it! →
        </button>
        <button onclick="onboarding.prev()" style="${linkStyle()}">← Back</button>`;

      case 4: {
        const name = answers.childName ? `${answers.childName}` : 'your little one';
        return `
        <div style="font-size:4.5rem;margin-bottom:16px;animation:pop .4s ease">🎉</div>
        <h2 style="font-family:'Fredoka One',cursive;font-size:2rem;color:#667eea;margin-bottom:10px">
          All set for ${name}!
        </h2>
        <p style="color:#666;font-size:.95rem;line-height:1.6;margin-bottom:24px">
          Start with the <strong>3 free activities</strong> below.<br>
          Upgrade anytime to unlock everything!
        </p>
        <div style="display:flex;gap:10px;flex-direction:column">
          <button onclick="onboarding.finish()" style="${btnStyle('#667eea')}">
            🚀 Start Learning!
          </button>
          <button onclick="onboarding.finishAndUpgrade()" style="${btnStyle('#22c55e')}">
            ⭐ Start Free Trial + Unlock All
          </button>
        </div>`;
      }
    }
  }

  function btnStyle(bg) {
    return `
      display:block;width:100%;padding:14px 20px;border-radius:14px;border:none;
      background:${bg};color:white;font-family:'Nunito',sans-serif;
      font-weight:800;font-size:1rem;cursor:pointer;
      transition:transform .15s,box-shadow .15s;margin-bottom:8px;
    `;
  }
  function linkStyle() {
    return `
      background:none;border:none;color:#aaa;font-size:.875rem;
      cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;
      display:block;width:100%;padding:8px;margin-top:4px;
    `;
  }
  function inputStyle() {
    return `
      width:100%;padding:12px 16px;border:2px solid #e5e7eb;border-radius:12px;
      font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;
      outline:none;transition:border-color .2s;
    `;
  }
  function ageStyle() {
    return `
      padding:10px 6px;border-radius:12px;border:2px solid #e5e7eb;
      background:#f9fafb;font-family:'Nunito',sans-serif;font-weight:800;
      font-size:.9rem;cursor:pointer;transition:all .15s;
    `;
  }

  function selectAge(age, el) {
    document.querySelectorAll('[data-age]').forEach(b => {
      b.style.background = '#f9fafb';
      b.style.borderColor = '#e5e7eb';
      b.style.color = '#333';
    });
    el.style.background = '#667eea';
    el.style.borderColor = '#667eea';
    el.style.color = 'white';
    answers.childAge = age;
  }

  function saveChildInfo() {
    const name  = document.getElementById('ob-name')?.value?.trim();
    const email = document.getElementById('ob-email')?.value?.trim();
    if (name)  answers.childName = name;
    if (email) answers.email = email;
    if (answers.childName || answers.childAge) {
      analytics.trackSignup(answers.childName || 'anonymous', answers.childAge || 'unknown', answers.email || null);
    if (window.PhonicsAPI && answers.email) {
      window.PhonicsAPI.registerUser(answers.email, answers.childName, answers.childAge).catch(() => {});
    }
      analytics.updateProfile({ childName: answers.childName, childAge: answers.childAge });
      // Register user in central API
      if (answers.email) {
        analytics.registerUser(answers.email, answers.childName, answers.childAge);
      }
    }
    next();
  }

  function saveGoals() {
    const checked = [...document.querySelectorAll('#_onboarding input[type=checkbox]:checked')].map(i => i.value);
    answers.goals = checked;
    analytics.updateProfile({ goals: checked });
    analytics.logEvent('goals_selected', { goals: checked });
    next();
  }

  function next()   { render(Math.min(currentStep + 1, STEPS.length - 1)); }
  function prev()   { render(Math.max(currentStep - 1, 0)); }

  function finish() {
    markDone();
    document.getElementById('_onboarding')?.remove();
    // Personalise greeting if we have a name
    const profile = analytics.getProfile();
    if (profile.childName) {
      const hero = document.querySelector('.hero h1');
      if (hero) hero.textContent = `Ready to learn, ${profile.childName}? 🌟`;
    }
    analytics.trackOnboardingStep('completed');
  }

  function finishAndUpgrade() {
    markDone();
    document.getElementById('_onboarding')?.remove();
    analytics.trackOnboardingStep('completed_upgrade');
    analytics.trackUpgradeClick('onboarding');
    paymentManager.initiateSubscription();
  }

  function skip() {
    markDone();
    document.getElementById('_onboarding')?.remove();
    analytics.trackOnboardingStep('skipped');
  }

  return { start, next, prev, finish, finishAndUpgrade, skip, selectAge, saveChildInfo, saveGoals, shouldShow };
})();
