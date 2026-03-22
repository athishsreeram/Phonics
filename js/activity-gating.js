// Define which activities are free vs paid
const ACTIVITY_TIERS = {
  free: [
    'sound-matching',
    'letter-recognition', 
    'blending-intro'
  ],
  paid: [
    'digraph-practice',
    'vowel-blends',
    'cvc-words',
    'sight-words',
    'sentence-reading',
    'word-families',
    'consonant-blends',
    'r-controlled-vowels',
    'silent-e-words',
    'vowel-digraphs',
    'phonics-review',
    'assessment-level-1',
    'assessment-level-2',
    'story-time',
    'parent-dashboard',
    'progress-tracker'
  ]
};

class ActivityGating {
  constructor(paymentManager) {
    this.paymentManager = paymentManager;
    this.userSubscriptionStatus = null;
  }

  // Initialize gating when page loads
  async initializeActivityGating() {
    const userId = this.paymentManager.userSession.userId;
    this.userSubscriptionStatus = await this.paymentManager.verifySubscription(userId);
    this.applyActivityGating();
  }

  // Apply lock/unlock to activity elements
  applyActivityGating() {
    document.querySelectorAll('[data-activity-id]').forEach(activityEl => {
      const activityId = activityEl.getAttribute('data-activity-id');
      const tier = this.getActivityTier(activityId);
      
      if (tier === 'free' || this.userSubscriptionStatus.isPaid) {
        // Unlock activity
        activityEl.classList.remove('locked');
        const button = activityEl.querySelector('button');
        if (button) {
          button.removeAttribute('disabled');
          button.classList.remove('unlock-btn');
        }
      } else {
        // Lock activity
        this.lockActivity(activityEl, activityId);
      }
    });
  }

  // Determine if activity is free or paid
  getActivityTier(activityId) {
    if (ACTIVITY_TIERS.free.includes(activityId)) return 'free';
    if (ACTIVITY_TIERS.paid.includes(activityId)) return 'paid';
    return 'unknown';
  }

  // Apply lock visual to activity
  lockActivity(activityEl, activityId) {
    activityEl.classList.add('locked');
    const button = activityEl.querySelector('button');
    
    if (button) {
      button.setAttribute('disabled', 'true');
      button.classList.add('unlock-btn');
      button.textContent = '🔒 Unlock with Premium';
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showUpgradeModal(activityId);
      };
    }
  }

  // Show modal encouraging upgrade
  showUpgradeModal(activityId) {
    // Check if modal already exists
    if (document.querySelector('.upgrade-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <button class="modal-close" onclick="this.closest('.upgrade-modal').remove()">✕</button>
        <h2>Unlock Premium Access</h2>
        <p>Get full access to all ${ACTIVITY_TIERS.paid.length} premium phonics activities</p>
        <p class="price">Only <strong>$9.99/month</strong></p>
        <button class="btn-primary" onclick="paymentManager.initiateSubscription()">
          Start Free Trial (7 Days)
        </button>
        <button class="btn-secondary" onclick="this.closest('.upgrade-modal').remove()">
          Continue with Free Tier
        </button>
        <p class="modal-footer">Cancel anytime. No credit card required for trial.</p>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Track upgrade click
    if (typeof analytics !== 'undefined') {
      analytics.trackUpgradeClick();
    }
  }
}

// Initialize globally
const activityGating = new ActivityGating(paymentManager);

// Initialize on page load
window.addEventListener('load', async () => {
  await activityGating.initializeActivityGating();
});
