/* js/payment.js – Stripe payment + localStorage unlock */
'use strict';

const paymentManager = (() => {

  // ── CONFIG ────────────────────────────────────────────────
  // Set your real Stripe Payment Link here.
  // In Stripe Dashboard → Payment Links → create one for your $9.99/mo price.
  // Set the "After payment" success URL to:
  //   https://YOUR_VERCEL_DOMAIN/pages/success.html
  // Then paste the payment link below:
  const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_cNi28ta2Rdi4g0736G0ZW00';

  // ── Premium check ─────────────────────────────────────────
  function isPremium() {
    return localStorage.getItem('ph_premium') === 'true';
  }

  function setPremium(val) {
    localStorage.setItem('ph_premium', val ? 'true' : 'false');
  }

  // ── Modal ─────────────────────────────────────────────────
  function initiateSubscription() {
    let modal = document.getElementById('_payment-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = '_payment-modal';
      modal.innerHTML = `
        <div class="modal-overlay open" id="_modal-overlay">
          <div class="modal-box">
            <h2>⭐ Go Premium</h2>
            <p>Unlock all 19+ phonics activities for <strong>$9.99/month</strong>.<br>
               Start with a <strong>7-day free trial</strong> — cancel anytime.</p>
            <button class="modal-btn" id="_stripe-btn">
              🚀 Start Free Trial
            </button>
            <button class="modal-btn" style="background:linear-gradient(135deg,#22c55e,#16a34a)" id="_stripe-btn2">
              💳 Subscribe $9.99/mo
            </button>
            <button class="modal-close" onclick="paymentManager.closeModal()">✕ Maybe later</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('_stripe-btn').addEventListener('click',  redirectToStripe);
      document.getElementById('_stripe-btn2').addEventListener('click', redirectToStripe);
    }
    document.getElementById('_modal-overlay').classList.add('open');
  }

  function closeModal() {
    const o = document.getElementById('_modal-overlay');
    if (o) o.classList.remove('open');
  }

  function redirectToStripe() {
    closeModal();
    if (STRIPE_PAYMENT_LINK.includes('REPLACE_WITH_YOUR_LINK')) {
      alert('⚠️ Stripe not configured yet.\n\nOpen js/payment.js and replace STRIPE_PAYMENT_LINK with your real Stripe Payment Link URL.\n\nGet one at: stripe.com → Payment Links');
      return;
    }
    window.location.href = STRIPE_PAYMENT_LINK;
  }

  // ── Unlock all premium cards on the page ──────────────────
  function unlockPremiumCards() {
    document.querySelectorAll('.activity-card.locked').forEach(card => {
      const id  = card.dataset.activityId;
      const btn = card.querySelector('.play-btn');
      const page = activityGating.ACTIVITY_MAP[id];
      if (!page) return;

      card.classList.remove('locked');
      const badge = card.querySelector('.lock-badge');
      if (badge) badge.remove();

      if (btn) {
        btn.textContent = '▶️ Play';
        btn.style.background = '#22c55e';
        btn.style.pointerEvents = 'auto';
        btn.href = page;
        // Remove any old click listeners by replacing node
        const newBtn = btn.cloneNode(true);
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = page;
        });
        btn.replaceWith(newBtn);
      }
    });
  }

  return { initiateSubscription, closeModal, redirectToStripe, isPremium, setPremium, unlockPremiumCards };
})();
