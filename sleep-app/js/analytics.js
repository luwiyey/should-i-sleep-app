// Analytics Manager for Google Analytics and User Behavior Tracking
class AnalyticsManager {
  constructor() {
    this.isInitialized = false;
    this.gaTrackingId = 'GA_MEASUREMENT_ID'; // Replace with actual Google Analytics ID
    this.debugMode = false;
    this.eventQueue = [];
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      pageViews: 0,
      events: 0
    };
    
    this.init();
  }
  
  async init() {
    try {
      // Check if Google Analytics is loaded
      if (typeof gtag !== 'undefined') {
        this.isInitialized = true;
        console.log('Analytics Manager initialized with Google Analytics');
      } else {
        console.warn('Google Analytics not loaded, using local analytics only');
      }
      
      // Initialize session tracking
      this.initializeSession();
      
      // Setup page visibility tracking
      this.setupVisibilityTracking();
      
      // Setup error tracking
      this.setupErrorTracking();
      
      // Process queued events
      this.processEventQueue();
      
      // Track initial page view
      this.trackPageView();
      
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }
  
  initializeSession() {
    // Store session data
    sessionStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
    
    // Track session start
    this.trackEvent('session_start', {
      session_id: this.sessionData.sessionId,
      timestamp: new Date().toISOString()
    });
  }
  
  setupVisibilityTracking() {
    let visibilityStartTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page became hidden
        const visibleTime = Date.now() - visibilityStartTime;
        this.trackEvent('page_visibility', {
          action: 'hidden',
          visible_time: visibleTime
        });
      } else {
        // Page became visible
        visibilityStartTime = Date.now();
        this.trackEvent('page_visibility', {
          action: 'visible'
        });
      }
    });
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - this.sessionData.startTime;
      this.trackEvent('session_end', {
        session_id: this.sessionData.sessionId,
        duration: sessionDuration,
        page_views: this.sessionData.pageViews,
        events: this.sessionData.events
      });
    });
  }
  
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error ? event.error.stack : null
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason ? event.reason.toString() : 'Unknown',
        stack: event.reason && event.reason.stack ? event.reason.stack : null
      });
    });
  }
  
  // Core tracking methods
  trackEvent(eventName, parameters = {}) {
    const eventData = {
      event_name: eventName,
      parameters: {
        ...parameters,
        session_id: this.sessionData.sessionId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        page_title: document.title
      }
    };
    
    // Increment event counter
    this.sessionData.events++;
    
    // Send to Google Analytics if available
    if (this.isInitialized && typeof gtag !== 'undefined') {
      try {
        gtag('event', eventName, eventData.parameters);
      } catch (error) {
        console.error('GA tracking error:', error);
      }
    }
    
    // Store locally for backup/analysis
    this.storeEventLocally(eventData);
    
    // Debug logging
    if (this.debugMode) {
      console.log('Analytics Event:', eventData);
    }
  }
  
  trackPageView(pagePath = null, pageTitle = null) {
    const path = pagePath || window.location.pathname;
    const title = pageTitle || document.title;
    
    this.sessionData.pageViews++;
    
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('config', this.gaTrackingId, {
        page_path: path,
        page_title: title
      });
    }
    
    this.trackEvent('page_view', {
      page_path: path,
      page_title: title
    });
  }
  
  trackError(errorType, errorData) {
    this.trackEvent('error', {
      error_type: errorType,
      ...errorData
    });
  }
  
  // Sleep app specific tracking methods
  trackSleepCalculation(calculationType, mood, inputTime) {
    this.trackEvent('sleep_calculation', {
      calculation_type: calculationType, // 'wake_times' or 'sleep_times'
      mood: mood,
      input_time: inputTime,
      has_user: window.authManager ? window.authManager.isSignedIn() : false
    });
  }
  
  trackMoodSelection(mood, previousMood = null) {
    this.trackEvent('mood_selection', {
      selected_mood: mood,
      previous_mood: previousMood
    });
  }
  
  trackUserAction(action, details = {}) {
    this.trackEvent('user_action', {
      action: action,
      ...details
    });
  }
  
  trackFeatureUsage(feature, usage_data = {}) {
    this.trackEvent('feature_usage', {
      feature: feature,
      ...usage_data
    });
  }
  
  trackPerformance(metric, value, unit = 'ms') {
    this.trackEvent('performance', {
      metric: metric,
      value: value,
      unit: unit
    });
  }
  
  // User engagement tracking
  trackEngagement() {
    const engagementData = {
      time_on_page: Date.now() - this.sessionData.startTime,
      page_views: this.sessionData.pageViews,
      events: this.sessionData.events,
      scroll_depth: this.getScrollDepth(),
      clicks: this.getClickCount(),
      form_interactions: this.getFormInteractions()
    };
    
    this.trackEvent('engagement', engagementData);
  }
  
  getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return documentHeight > 0 ? Math.round((scrollTop / documentHeight) * 100) : 0;
  }
  
  getClickCount() {
    return parseInt(sessionStorage.getItem('click_count') || '0');
  }
  
  getFormInteractions() {
    return parseInt(sessionStorage.getItem('form_interactions') || '0');
  }
  
  // Conversion tracking
  trackConversion(conversionType, value = null) {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value: value
    });
    
    // Send to Google Analytics as conversion
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: this.gaTrackingId,
        event_category: 'engagement',
        event_label: conversionType,
        value: value
      });
    }
  }
  
  // A/B Testing support
  trackExperiment(experimentId, variantId, outcome = null) {
    this.trackEvent('experiment', {
      experiment_id: experimentId,
      variant_id: variantId,
      outcome: outcome
    });
  }
  
  // Custom dimensions and metrics
  setCustomDimension(index, value) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('config', this.gaTrackingId, {
        [`custom_map.dimension${index}`]: value
      });
    }
  }
  
  setCustomMetric(index, value) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('event', 'custom_metric', {
        [`metric${index}`]: value
      });
    }
  }
  
  // User identification
  setUserId(userId) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('config', this.gaTrackingId, {
        user_id: userId
      });
    }
    
    this.trackEvent('user_identification', {
      user_id: userId
    });
  }
  
  setUserProperties(properties) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('config', this.gaTrackingId, {
        user_properties: properties
      });
    }
    
    this.trackEvent('user_properties', properties);
  }
  
  // E-commerce tracking (if needed for premium features)
  trackPurchase(transactionId, items, value, currency = 'USD') {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items
      });
    }
    
    this.trackEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
  
  // Local storage and backup
  storeEventLocally(eventData) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(eventData);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Local analytics storage error:', error);
    }
  }
  
  getLocalEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch (error) {
      console.error('Local analytics retrieval error:', error);
      return [];
    }
  }
  
  clearLocalEvents() {
    localStorage.removeItem('analytics_events');
  }
  
  // Event queue management
  queueEvent(eventName, parameters) {
    this.eventQueue.push({ eventName, parameters, timestamp: Date.now() });
  }
  
  processEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.trackEvent(event.eventName, event.parameters);
    }
  }
  
  // Privacy and consent management
  setConsentMode(consentSettings) {
    if (this.isInitialized && typeof gtag !== 'undefined') {
      gtag('consent', 'update', consentSettings);
    }
    
    this.trackEvent('consent_update', consentSettings);
  }
  
  enableAnalytics() {
    this.isInitialized = true;
    this.processEventQueue();
    this.trackEvent('analytics_enabled');
  }
  
  disableAnalytics() {
    this.isInitialized = false;
    this.trackEvent('analytics_disabled');
  }
  
  // Utility methods
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  getSessionData() {
    return this.sessionData;
  }
  
  enableDebugMode() {
    this.debugMode = true;
    console.log('Analytics debug mode enabled');
  }
  
  disableDebugMode() {
    this.debugMode = false;
  }
  
  // Performance monitoring
  measurePerformance(name, fn) {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.trackPerformance(name, duration);
    
    return result;
  }
  
  async measureAsyncPerformance(name, asyncFn) {
    const startTime = performance.now();
    const result = await asyncFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.trackPerformance(name, duration);
    
    return result;
  }
  
  // Reporting and analytics
  generateReport() {
    const events = this.getLocalEvents();
    const report = {
      session: this.sessionData,
      totalEvents: events.length,
      eventTypes: {},
      timeRange: {
        start: events.length > 0 ? events[0].parameters.timestamp : null,
        end: events.length > 0 ? events[events.length - 1].parameters.timestamp : null
      }
    };
    
    // Count event types
    events.forEach(event => {
      const type = event.event_name;
      report.eventTypes[type] = (report.eventTypes[type] || 0) + 1;
    });
    
    return report;
  }
  
  exportAnalyticsData() {
    const data = {
      session: this.sessionData,
      events: this.getLocalEvents(),
      report: this.generateReport(),
      exportDate: new Date().toISOString()
    };
    
    return data;
  }
}

// Initialize Analytics Manager
document.addEventListener('DOMContentLoaded', () => {
  window.analytics = new AnalyticsManager();
  
  // Setup click tracking
  document.addEventListener('click', (event) => {
    const clickCount = parseInt(sessionStorage.getItem('click_count') || '0') + 1;
    sessionStorage.setItem('click_count', clickCount.toString());
    
    // Track specific element clicks
    if (event.target.id || event.target.className) {
      window.analytics.trackUserAction('click', {
        element_id: event.target.id,
        element_class: event.target.className,
        element_tag: event.target.tagName.toLowerCase(),
        element_text: event.target.textContent ? event.target.textContent.substring(0, 50) : null
      });
    }
  });
  
  // Setup form interaction tracking
  document.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
      const interactionCount = parseInt(sessionStorage.getItem('form_interactions') || '0') + 1;
      sessionStorage.setItem('form_interactions', interactionCount.toString());
      
      window.analytics.trackUserAction('form_interaction', {
        field_id: event.target.id,
        field_type: event.target.type,
        field_name: event.target.name
      });
    }
  });
  
  // Track engagement every 30 seconds
  setInterval(() => {
    if (!document.hidden) {
      window.analytics.trackEngagement();
    }
  }, 30000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
}
