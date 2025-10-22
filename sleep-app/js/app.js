// Main Application Logic for Should I Sleep App
class SleepApp {
  constructor() {
    this.selectedMood = 'neutral';
    this.currentUser = null;
    this.sleepHistory = [];
    
    // DOM Elements
    this.currentTimeInput = document.getElementById('currentTime');
    this.wakeTimeInput = document.getElementById('wakeTime');
    this.resultsDiv = document.getElementById('results');
    this.moodButtons = document.querySelectorAll('.mood-btn');
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.validationMessages = document.getElementById('validation-messages');
    this.validationText = document.getElementById('validation-text');
    
    // Quick Action Buttons
    this.setCurrentTimeBtn = document.getElementById('set-current-time');
    this.savePreferencesBtn = document.getElementById('save-preferences');
    this.shareResultsBtn = document.getElementById('share-results');
    this.feedbackBtn = document.getElementById('feedback-btn');
    
    // Feedback Modal
    this.feedbackModal = document.getElementById('feedback-modal');
    this.feedbackForm = document.getElementById('feedback-form');
    this.closeFeedbackBtn = document.getElementById('close-feedback');
    
    // Sleep cycle constants
    this.SLEEP_CYCLE_MINUTES = 90;
    this.FALL_ASLEEP_MINUTES = 15;
    
    // Mood suggestions
    this.moodSuggestions = {
      neutral: 'Maintain a consistent sleep schedule for best results.',
      anxious: 'Try a calming routine before bed: deep breathing, meditation, or gentle stretches.',
      tired: 'Consider a short nap earlier in the day and avoid caffeine late in the afternoon.',
      stressed: 'Practice relaxation techniques like progressive muscle relaxation or journaling before sleep.',
      happy: 'Keep up the good mood! A light evening walk can help maintain your energy balance.',
      sad: 'Try to get some natural light during the day and avoid screens 1 hour before bedtime.'
    };
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadUserPreferences();
    this.initializeMoodButtons();
    this.setupAccessibility();
    
    // Set current time as default
    this.setCurrentTime();
    
    // Load user data if signed in
    if (window.authManager && window.authManager.getCurrentUser()) {
      this.currentUser = window.authManager.getCurrentUser();
      this.loadSleepHistory();
    }
  }
  
  setupEventListeners() {
    // Time input listeners
    this.currentTimeInput.addEventListener('input', () => this.handleCurrentTimeChange());
    this.wakeTimeInput.addEventListener('input', () => this.handleWakeTimeChange());
    
    // Mood button listeners
    this.moodButtons.forEach(btn => {
      btn.addEventListener('click', () => this.selectMood(btn));
      btn.addEventListener('keydown', (e) => this.handleMoodKeydown(e, btn));
    });
    
    // Quick action listeners
    this.setCurrentTimeBtn.addEventListener('click', () => this.setCurrentTime());
    this.savePreferencesBtn.addEventListener('click', () => this.savePreferences());
    this.shareResultsBtn.addEventListener('click', () => this.shareResults());
    this.feedbackBtn.addEventListener('click', () => this.openFeedbackModal());
    
    // Feedback modal listeners
    this.closeFeedbackBtn.addEventListener('click', () => this.closeFeedbackModal());
    this.feedbackForm.addEventListener('submit', (e) => this.submitFeedback(e));
    
    // Close modal on outside click
    this.feedbackModal.addEventListener('click', (e) => {
      if (e.target === this.feedbackModal) {
        this.closeFeedbackModal();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }
  
  handleCurrentTimeChange() {
    if (this.currentTimeInput.value) {
      this.wakeTimeInput.value = '';
      this.validateAndCalculate();
    } else {
      this.showDefaultMessage();
    }
  }
  
  handleWakeTimeChange() {
    if (this.wakeTimeInput.value) {
      this.currentTimeInput.value = '';
      this.validateAndCalculate();
    } else {
      this.showDefaultMessage();
    }
  }
  
  validateAndCalculate() {
    this.hideValidationMessages();
    
    const currentTime = this.parseTimeToDate(this.currentTimeInput.value);
    const wakeTime = this.parseTimeToDate(this.wakeTimeInput.value);
    
    // Validation
    if (!currentTime && !wakeTime) {
      this.showValidationError('Please enter either current time or desired wake time.');
      return;
    }
    
    if (currentTime && wakeTime) {
      this.showValidationError('Please enter only one time field.');
      return;
    }
    
    // Show loading
    this.showLoading();
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      this.calculateAndDisplay();
      this.hideLoading();
      
      // Track analytics
      if (window.analytics) {
        window.analytics.trackEvent('sleep_calculation', {
          mood: this.selectedMood,
          input_type: currentTime ? 'current_time' : 'wake_time'
        });
      }
    }, 500);
  }
  
  calculateAndDisplay() {
    this.resultsDiv.innerHTML = '';
    
    const currentTime = this.parseTimeToDate(this.currentTimeInput.value);
    const wakeTime = this.parseTimeToDate(this.wakeTimeInput.value);
    
    if (currentTime) {
      this.displayWakeTimes(currentTime);
    } else if (wakeTime) {
      this.displaySleepTimes(wakeTime);
    }
    
    this.appendMoodSuggestion();
    this.saveSleepCalculation();
  }
  
  displayWakeTimes(currentTime) {
    const baseTime = this.addMinutes(currentTime, this.FALL_ASLEEP_MINUTES);
    const wakeTimes = [];
    
    for (let i = 3; i <= 6; i++) {
      const wakeTimeOption = this.addMinutes(baseTime, i * this.SLEEP_CYCLE_MINUTES);
      wakeTimes.push({
        time: this.formatTime(wakeTimeOption),
        cycles: i,
        hours: (i * 1.5).toFixed(1)
      });
    }
    
    const container = document.createElement('div');
    container.className = 'results-card';
    
    const heading = document.createElement('h3');
    heading.className = 'text-xl font-semibold mb-4 text-indigo-700 flex items-center gap-2';
    heading.innerHTML = '<i class="fas fa-sun"></i> Optimal Wake Times';
    
    const description = document.createElement('p');
    description.className = 'text-gray-600 mb-4';
    description.textContent = 'If you go to sleep now, try to wake up at one of these times:';
    
    const timesList = document.createElement('div');
    timesList.className = 'grid gap-3';
    
    wakeTimes.forEach(option => {
      const timeCard = document.createElement('div');
      timeCard.className = 'time-option flex justify-between items-center';
      timeCard.innerHTML = `
        <div>
          <div class="text-lg font-semibold text-indigo-600">${option.time}</div>
          <div class="text-sm text-gray-500">${option.cycles} sleep cycles (${option.hours} hours)</div>
        </div>
        <i class="fas fa-clock text-indigo-400"></i>
      `;
      timesList.appendChild(timeCard);
    });
    
    container.appendChild(heading);
    container.appendChild(description);
    container.appendChild(timesList);
    this.resultsDiv.appendChild(container);
  }
  
  displaySleepTimes(wakeTime) {
    const sleepTimes = [];
    
    for (let i = 6; i >= 3; i--) {
      const sleepTimeOption = this.addMinutes(wakeTime, -(i * this.SLEEP_CYCLE_MINUTES + this.FALL_ASLEEP_MINUTES));
      sleepTimes.push({
        time: this.formatTime(sleepTimeOption),
        cycles: i,
        hours: (i * 1.5).toFixed(1)
      });
    }
    
    const container = document.createElement('div');
    container.className = 'results-card';
    
    const heading = document.createElement('h3');
    heading.className = 'text-xl font-semibold mb-4 text-indigo-700 flex items-center gap-2';
    heading.innerHTML = '<i class="fas fa-moon"></i> Optimal Sleep Times';
    
    const description = document.createElement('p');
    description.className = 'text-gray-600 mb-4';
    description.textContent = 'To wake up refreshed at your desired time, try to fall asleep at one of these times:';
    
    const timesList = document.createElement('div');
    timesList.className = 'grid gap-3';
    
    sleepTimes.forEach(option => {
      const timeCard = document.createElement('div');
      timeCard.className = 'time-option flex justify-between items-center';
      timeCard.innerHTML = `
        <div>
          <div class="text-lg font-semibold text-indigo-600">${option.time}</div>
          <div class="text-sm text-gray-500">${option.cycles} sleep cycles (${option.hours} hours)</div>
        </div>
        <i class="fas fa-bed text-indigo-400"></i>
      `;
      timesList.appendChild(timeCard);
    });
    
    container.appendChild(heading);
    container.appendChild(description);
    container.appendChild(timesList);
    this.resultsDiv.appendChild(container);
  }
  
  appendMoodSuggestion() {
    const suggestion = this.moodSuggestions[this.selectedMood];
    if (suggestion) {
      const suggestionCard = document.createElement('div');
      suggestionCard.className = 'suggestion-card mt-6';
      suggestionCard.innerHTML = `
        <div class="flex items-start gap-3">
          <i class="fas fa-lightbulb text-indigo-500 mt-1"></i>
          <div>
            <h4 class="font-semibold text-indigo-700 mb-1">Personalized Tip</h4>
            <p class="text-indigo-600">${suggestion}</p>
          </div>
        </div>
      `;
      this.resultsDiv.appendChild(suggestionCard);
    }
  }
  
  selectMood(button) {
    // Update ARIA states
    this.moodButtons.forEach(btn => {
      btn.setAttribute('aria-checked', 'false');
      btn.tabIndex = -1;
    });
    
    button.setAttribute('aria-checked', 'true');
    button.tabIndex = 0;
    button.focus();
    
    this.selectedMood = button.getAttribute('data-mood');
    
    // Recalculate if we have input
    if (this.currentTimeInput.value || this.wakeTimeInput.value) {
      this.validateAndCalculate();
    }
    
    // Save preference
    this.saveUserPreference('mood', this.selectedMood);
  }
  
  handleMoodKeydown(event, button) {
    const buttons = Array.from(this.moodButtons);
    const currentIndex = buttons.indexOf(button);
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        this.selectMood(buttons[nextIndex]);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        this.selectMood(buttons[prevIndex]);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectMood(button);
        break;
    }
  }
  
  initializeMoodButtons() {
    // Set default mood
    const defaultMoodBtn = document.querySelector(`[data-mood="${this.selectedMood}"]`);
    if (defaultMoodBtn) {
      this.selectMood(defaultMoodBtn);
    }
  }
  
  setupAccessibility() {
    // Add live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
  }
  
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
  
  setCurrentTime() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    this.currentTimeInput.value = timeString;
    this.wakeTimeInput.value = '';
    this.validateAndCalculate();
    this.showNotification('Current time set successfully!', 'success');
  }
  
  savePreferences() {
    if (!this.currentUser) {
      this.showNotification('Please sign in to save preferences', 'info');
      return;
    }
    
    const preferences = {
      mood: this.selectedMood,
      lastUsed: new Date().toISOString()
    };
    
    if (window.storageManager) {
      window.storageManager.saveUserPreferences(this.currentUser.id, preferences);
      this.showNotification('Preferences saved successfully!', 'success');
    }
  }
  
  shareResults() {
    if (!this.resultsDiv.innerHTML.includes('time-option')) {
      this.showNotification('Please calculate sleep times first', 'info');
      return;
    }
    
    const shareData = {
      title: 'Should I Sleep? - My Sleep Schedule',
      text: 'Check out my personalized sleep schedule from Should I Sleep app!',
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(err => {
        console.log('Error sharing:', err);
        this.fallbackShare();
      });
    } else {
      this.fallbackShare();
    }
  }
  
  fallbackShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
      this.showNotification('Unable to share. Please copy the URL manually.', 'error');
    });
  }
  
  openFeedbackModal() {
    this.feedbackModal.classList.remove('hidden');
    document.getElementById('feedback-message').focus();
  }
  
  closeFeedbackModal() {
    this.feedbackModal.classList.add('hidden');
    this.feedbackForm.reset();
  }
  
  submitFeedback(event) {
    event.preventDefault();
    
    const formData = new FormData(this.feedbackForm);
    const feedback = {
      type: document.getElementById('feedback-type').value,
      message: document.getElementById('feedback-message').value,
      timestamp: new Date().toISOString(),
      user: this.currentUser ? this.currentUser.email : 'anonymous'
    };
    
    // Here you would typically send to your backend
    console.log('Feedback submitted:', feedback);
    
    // Track analytics
    if (window.analytics) {
      window.analytics.trackEvent('feedback_submitted', {
        type: feedback.type
      });
    }
    
    this.closeFeedbackModal();
    this.showNotification('Thank you for your feedback!', 'success');
  }
  
  handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 't':
          event.preventDefault();
          this.setCurrentTime();
          break;
        case 's':
          event.preventDefault();
          this.savePreferences();
          break;
        case 'Enter':
          if (event.target.tagName === 'INPUT') {
            event.preventDefault();
            this.validateAndCalculate();
          }
          break;
      }
    }
    
    if (event.key === 'Escape') {
      this.closeFeedbackModal();
    }
  }
  
  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }
  
  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }
  
  showValidationError(message) {
    this.validationText.textContent = message;
    this.validationMessages.classList.remove('hidden');
  }
  
  hideValidationMessages() {
    this.validationMessages.classList.add('hidden');
  }
  
  showDefaultMessage() {
    this.resultsDiv.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-moon text-4xl text-gray-300 mb-4"></i>
        <p class="text-lg text-gray-500">Please enter a time and select your mood to see personalized suggestions.</p>
      </div>
    `;
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Utility functions
  parseTimeToDate(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  }
  
  formatTime(date) {
    if (!date) return '';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  
  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }
  
  loadUserPreferences() {
    if (window.storageManager) {
      const preferences = window.storageManager.getUserPreferences();
      if (preferences.mood) {
        this.selectedMood = preferences.mood;
      }
    }
  }
  
  saveUserPreference(key, value) {
    if (window.storageManager) {
      window.storageManager.saveUserPreference(key, value);
    }
  }
  
  saveSleepCalculation() {
    if (!this.currentUser) return;
    
    const calculation = {
      timestamp: new Date().toISOString(),
      mood: this.selectedMood,
      inputType: this.currentTimeInput.value ? 'current_time' : 'wake_time',
      inputValue: this.currentTimeInput.value || this.wakeTimeInput.value
    };
    
    this.sleepHistory.unshift(calculation);
    
    // Keep only last 10 calculations
    if (this.sleepHistory.length > 10) {
      this.sleepHistory = this.sleepHistory.slice(0, 10);
    }
    
    if (window.storageManager) {
      window.storageManager.saveSleepHistory(this.currentUser.id, this.sleepHistory);
    }
  }
  
  loadSleepHistory() {
    if (this.currentUser && window.storageManager) {
      this.sleepHistory = window.storageManager.getSleepHistory(this.currentUser.id) || [];
      this.displaySleepHistory();
    }
  }
  
  displaySleepHistory() {
    const historySection = document.getElementById('sleep-history');
    const historyContent = document.getElementById('history-content');
    
    if (this.sleepHistory.length > 0) {
      historySection.classList.remove('hidden');
      historyContent.innerHTML = this.sleepHistory.map(item => `
        <div class="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div class="font-medium">${new Date(item.timestamp).toLocaleDateString()}</div>
            <div class="text-sm text-gray-600">Mood: ${item.mood} | ${item.inputType.replace('_', ' ')}: ${item.inputValue}</div>
          </div>
          <i class="fas fa-history text-gray-400"></i>
        </div>
      `).join('');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.sleepApp = new SleepApp();
});
