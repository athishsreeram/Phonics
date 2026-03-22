class AnalyticsManager {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.events = this.loadEvents();
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }

  // Track activity start
  trackActivityStart(activityId) {
    this.logEvent('activity_start', {
      activityId,
      isPaid: paymentManager.userSession.isPaid,
      timestamp: new Date().toISOString()
    });
  }

  // Track activity completion
  trackActivityComplete(activityId, score) {
    this.logEvent('activity_complete', {
      activityId,
      score,
      isPaid: paymentManager.userSession.isPaid,
      timestamp: new Date().toISOString()
    });
  }

  // Track subscription conversion
  trackConversion() {
    this.logEvent('conversion', {
      timestamp: new Date().toISOString()
    });
  }

  // Track upgrade button click
  trackUpgradeClick() {
    this.logEvent('upgrade_click', {
      timestamp: new Date().toISOString()
    });
  }

  // Internal logging function
  logEvent(eventName, eventData) {
    const event = {
      name: eventName,
      data: eventData,
      sessionId: this.sessionId
    };

    this.events.push(event);
    
    // Keep max 100 events per session
    if (this.events.length > 100) {
      this.events.shift();
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(this.events));

    // Send events in batches of 10
    if (this.events.length % 10 === 0) {
      this.sendEvents();
    }
  }

  // Send events to server
  async sendEvents() {
    if (this.events.length === 0) return;

    try {
      await fetch('/api/log-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: this.events,
          sessionId: this.sessionId
        })
      });
      
      this.events = [];
      localStorage.removeItem('analytics_events');
    } catch (error) {
      console.error('Analytics send error (non-fatal):', error);
    }
  }

  loadEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Initialize globally
const analytics = new AnalyticsManager();

// Send events on page unload
window.addEventListener('beforeunload', () => {
  analytics.sendEvents();
});
