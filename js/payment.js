// Stripe Configuration - CONFIGURED FOR YOUR ACCOUNT
const STRIPE_PUBLIC_KEY = 'pk_test_51TDdbkQ3NpLw3uEvtmmWhLSCeJDajOusgpa89cEXPMb7HvT37PgS6M9bkAQFgGsrFsYLxSMgNl18iN56pUw6H6k900lwEaAoqf';
const SUBSCRIPTION_PRICE_ID = 'price_1TDdsWQ3NpLw3uEvjnvehml9'; // YOUR PRICE ID - CONFIGURED ✓

class PaymentManager {
  constructor() {
    this.stripe = Stripe(STRIPE_PUBLIC_KEY);
    this.userSession = this.loadSession();
  }

  // Initialize subscription checkout
  async initiateSubscription() {
    try {
      const sessionResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_PRICE_ID,
          successUrl: window.location.origin + '/pages/success.html',
          cancelUrl: window.location.origin + '/',
          userId: this.userSession.userId
        })
      });

      const { sessionId } = await sessionResponse.json();
      if (!sessionId) {
        alert('Error initiating checkout. Please try again.');
        return;
      }
      
      await this.stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Payment error. Please try again.');
    }
  }

  // Verify subscription status
  async verifySubscription(userId) {
    const cachedStatus = localStorage.getItem(`subscription_${userId}`);
    
    // Use cache if valid (24 hours)
    if (cachedStatus && this.isTokenValid(cachedStatus)) {
      return JSON.parse(cachedStatus);
    }

    try {
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) throw new Error('Verification failed');
      
      const status = await response.json();
      
      // Cache the result
      localStorage.setItem(`subscription_${userId}`, 
        JSON.stringify({ ...status, timestamp: Date.now() }));
      
      return status;
    } catch (error) {
      console.error('Verification error:', error);
      // Return free tier on error (safe fallback)
      return { isPaid: false, userId };
    }
  }

  // Check if cached subscription is still valid (24-hour cache)
  isTokenValid(cachedData) {
    try {
      const { timestamp } = JSON.parse(cachedData);
      const ageMs = Date.now() - timestamp;
      const oneDayMs = 24 * 60 * 60 * 1000;
      return ageMs < oneDayMs;
    } catch {
      return false;
    }
  }

  // Load or create user session
  loadSession() {
    let session = localStorage.getItem('phonics_session');
    if (!session) {
      session = {
        userId: this.generateUserId(),
        createdAt: Date.now(),
        isPaid: false
      };
      localStorage.setItem('phonics_session', JSON.stringify(session));
    }
    return JSON.parse(session);
  }

  // Generate unique user ID
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Initialize globally
const paymentManager = new PaymentManager();
