/* js/payment.js – Stripe Checkout Session flow + manual fallback */
'use strict';

const paymentManager = (() => {

  // ── CONFIG ────────────────────────────────────────────────────────────────
  // Your Stripe Payment Link (from Stripe Dashboard → Payment Links)
  // IMPORTANT: In Stripe Dashboard, edit this Payment Link and set:
  //   After payment → Redirect customers to a URL:
  //   https://phonics77-app.vercel.app/pages/success.html
  //
  // Your current link from the screenshots:
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_cNi28ta2RdI4g0736G0ZW00';

  // The exact URL Stripe should redirect to after payment
  // Must match what you set in Stripe Dashboard → Payment Link → After payment
  const SUCCESS_URL = 'https://phonics77-app.vercel.app/pages/success.html';
  // ─────────────────────────────────────────────────────────────────────────

  function isPremium() {
    return localStorage.getItem('ph_premium') === 'true';
  }

  function setPremium(val) {
    localStorage.setItem('ph_premium', val ? 'true' : 'false');
  }

  // ── Modal with Stripe redirect + manual fallback ──────────────────────────
  function initiateSubscription() {
    let modal = document.getElementById('_payment-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = '_payment-modal';
      modal.innerHTML = `
        <div class="modal-overlay open" id="_modal-overlay">
          <div class="modal-box">
            <h2>⭐ Go Premium</h2>
            <p>Unlock all 19+ phonics activities for <strong>$9.99/month</strong>.</p>
            <button class="modal-btn" id="_stripe-btn">
              🚀 Subscribe $9.99/mo
            </button>
            <div style="margin:12px 0;font-size:.8rem;color:#aaa;text-align:center">── or ──</div>
            <button class="modal-btn" id="_already-paid-btn"
              style="background:#f3f4f6;color:#333;font-size:.9rem;padding:10px">
              ✅ I already paid — unlock now
            </button>
            <button class="modal-close" onclick="paymentManager.closeModal()">✕ Maybe later</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('_stripe-btn').addEventListener('click', redirectToStripe);
      document.getElementById('_already-paid-btn').addEventListener('click', manualUnlock);
    }
    document.getElementById('_modal-overlay').classList.add('open');
  }

  function closeModal() {
    const o = document.getElementById('_modal-overlay');
    if (o) o.classList.remove('open');
  }

  function redirectToStripe() {
    closeModal();
    // Try Checkout Session API first (Vercel), fall back to Payment Link
    tryCheckoutSession().catch(() => {
      window.location.href = STRIPE_PAYMENT_LINK;
    });
  }

  // Try creating a Checkout Session via your Vercel API
  // This lets us pass success_url in code so redirect works automatically
  async function tryCheckoutSession() {
    const res = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ successUrl: SUCCESS_URL }),
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (!data.url) throw new Error('No URL returned');
    window.location.href = data.url;
  }

  // Manual unlock button — for users who paid but redirect failed
  function manualUnlock() {
    closeModal();
    const code = prompt(
      '🔑 Enter your unlock code\n\n' +
      'After subscribing, check your email from Stripe/Phonics Hub for your access code.\n\n' +
      'Or contact startdreamhere123@gmail.com with your payment receipt.'
    );
    // Simple code check — change this to whatever code you want
    const VALID_CODES = ['PHONICS2026', 'PREMIUM77', 'UNLOCK99'];
    if (code && VALID_CODES.includes(code.trim().toUpperCase())) {
      setPremium(true);
      unlockPremiumCards();
      alert('🎉 Premium unlocked! Enjoy all activities!');
    } else if (code) {
      alert('❌ Invalid code. Please contact support at startdreamhere123@gmail.com');
    }
  }

  // ── Unlock all premium cards on the page ─────────────────────────────────
  function unlockPremiumCards() {
    document.querySelectorAll('.activity-card').forEach(card => {
      const id   = card.dataset.activityId;
      if (!id) return;
      const page = (typeof activityGating !== 'undefined') ? activityGating.ACTIVITY_MAP[id] : null;
      if (!page) return;

      card.classList.remove('locked');
      const badge = card.querySelector('.lock-badge');
      if (badge) badge.remove();

      const btn = card.querySelector('.play-btn');
      if (btn) {
        // Clone to wipe old event listeners
        const newBtn = btn.cloneNode(false);
        newBtn.textContent        = '▶️ Play';
        newBtn.style.background   = '#22c55e';
        newBtn.style.pointerEvents = 'auto';
        newBtn.style.opacity      = '1';
        newBtn.style.cursor       = 'pointer';
        newBtn.setAttribute('href', page);
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = page;
        });
        btn.replaceWith(newBtn);
      }
    });
  }

  return {
    initiateSubscription,
    closeModal,
    redirectToStripe,
    isPremium,
    setPremium,
    unlockPremiumCards,
  };
})();
