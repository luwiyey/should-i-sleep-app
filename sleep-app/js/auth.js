// Authentication Manager for Google Sign-In
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual Google Client ID
    
    // DOM Elements
    this.signInBtn = document.getElementById('sign-in-btn');
    this.signOutBtn = document.getElementById('sign-out-btn');
    this.profileBtn = document.getElementById('profile-btn');
    this.userAvatar = document.getElementById('user-avatar');
    this.userName = document.getElementById('user-name');
    
    this.init();
  }
  
  async init() {
    try {
      // Wait for Google Identity Services to load
      await this.waitForGoogleAPI();
      
      // Initialize Google Identity Services
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Check for existing session
      this.checkExistingSession();
      
      this.isInitialized = true;
      console.log('Auth Manager initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Auth Manager:', error);
      this.showAuthError('Authentication service unavailable');
    }
  }
  
  waitForGoogleAPI() {
    return new Promise((resolve, reject) => {
      const checkGoogle = () => {
        if (typeof google !== 'undefined' && google.accounts) {
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      
      checkGoogle();
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (typeof google === 'undefined') {
          reject(new Error('Google API failed to load'));
        }
      }, 10000);
    });
  }
  
  setupEventListeners() {
    if (this.signInBtn) {
      this.signInBtn.addEventListener('click', () => this.signIn());
    }
    
    if (this.signOutBtn) {
      this.signOutBtn.addEventListener('click', () => this.signOut());
    }
    
    if (this.profileBtn) {
      this.profileBtn.addEventListener('click', () => this.showProfile());
    }
  }
  
  signIn() {
    if (!this.isInitialized) {
      this.showAuthError('Authentication not ready. Please try again.');
      return;
    }
    
    try {
      // Show Google One Tap
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to popup
          this.showGoogleSignInPopup();
        }
      });
      
    } catch (error) {
      console.error('Sign-in error:', error);
      this.showAuthError('Sign-in failed. Please try again.');
    }
  }
  
  showGoogleSignInPopup() {
    // Create a popup for Google Sign-In
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    popup.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <i class="fab fa-google text-4xl text-blue-500 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Sign in with Google</h3>
          <p class="text-gray-600 mb-6">Sign in to save your preferences and track your sleep history</p>
          <div id="google-signin-button" class="mb-4 flex justify-center items-center"></div>
          <button id="cancel-signin" class="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Render Google Sign-In button
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: 350,
        height: 60,
        text: 'signin_with',
        shape: 'rectangular'
      }
    );
    
    // Cancel button
    document.getElementById('cancel-signin').addEventListener('click', () => {
      popup.remove();
    });
    
    // Close on outside click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });
  }
  
  handleCredentialResponse(response) {
    try {
      // Decode JWT token
      const userInfo = this.parseJWT(response.credential);
      
      // Validate token (in production, verify on server)
      if (this.validateGoogleEmail(userInfo.email)) {
        this.currentUser = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          verified: userInfo.email_verified
        };
        
        this.onSignInSuccess();
        
        // Track analytics
        if (window.analytics) {
          window.analytics.trackEvent('user_sign_in', {
            method: 'google'
          });
        }
        
      } else {
        this.showAuthError('Please use a valid Google email address');
      }
      
    } catch (error) {
      console.error('Credential handling error:', error);
      this.showAuthError('Authentication failed. Please try again.');
    }
    
    // Remove popup if exists
    const popup = document.querySelector('.fixed.inset-0.bg-black');
    if (popup) {
      popup.remove();
    }
  }
  
  validateGoogleEmail(email) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
  
  onSignInSuccess() {
    // Update UI
    this.updateAuthUI(true);
    
    // Save session
    this.saveSession();
    
    // Load user data
    this.loadUserData();
    
    // Show success notification
    this.showNotification('Successfully signed in!', 'success');
    
    // Notify other components
    this.notifySignIn();
  }
  
  signOut() {
    try {
      // Sign out from Google
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
      
      // Clear user data
      this.currentUser = null;
      
      // Update UI
      this.updateAuthUI(false);
      
      // Clear session
      this.clearSession();
      
      // Clear user data
      this.clearUserData();
      
      // Show notification
      this.showNotification('Successfully signed out', 'info');
      
      // Track analytics
      if (window.analytics) {
        window.analytics.trackEvent('user_sign_out');
      }
      
      // Notify other components
      this.notifySignOut();
      
    } catch (error) {
      console.error('Sign-out error:', error);
      this.showAuthError('Sign-out failed');
    }
  }
  
  updateAuthUI(isSignedIn) {
    if (isSignedIn && this.currentUser) {
      // Show user info
      this.signInBtn.classList.add('hidden');
      this.signOutBtn.classList.remove('hidden');
      this.profileBtn.classList.remove('hidden');
      
      // Update user info
      if (this.userAvatar) {
        this.userAvatar.src = this.currentUser.picture;
        this.userAvatar.alt = `${this.currentUser.name}'s avatar`;
      }
      
      if (this.userName) {
        this.userName.textContent = this.currentUser.name.split(' ')[0]; // First name only
      }
      
    } else {
      // Show sign-in button
      this.signInBtn.classList.remove('hidden');
      this.signOutBtn.classList.add('hidden');
      this.profileBtn.classList.add('hidden');
    }
  }
  
  showProfile() {
    if (!this.currentUser) return;
    
    // Create profile modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <img src="${this.currentUser.picture}" alt="Profile" class="w-20 h-20 rounded-full mx-auto mb-4">
          <h3 class="text-xl font-semibold mb-2">${this.currentUser.name}</h3>
          <p class="text-gray-600 mb-4">${this.currentUser.email}</p>
          <div class="space-y-3">
            <button id="view-history" class="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 px-4 rounded-lg transition-colors">
              <i class="fas fa-history mr-2"></i>View Sleep History
            </button>
            <button id="export-data" class="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-colors">
              <i class="fas fa-download mr-2"></i>Export Data
            </button>
            <button id="delete-account" class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors">
              <i class="fas fa-trash mr-2"></i>Delete Account Data
            </button>
          </div>
          <button id="close-profile" class="mt-4 text-gray-500 hover:text-gray-700">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-profile').addEventListener('click', () => modal.remove());
    document.getElementById('view-history').addEventListener('click', () => this.viewHistory());
    document.getElementById('export-data').addEventListener('click', () => this.exportUserData());
    document.getElementById('delete-account').addEventListener('click', () => this.deleteAccountData());
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  viewHistory() {
    const historySection = document.getElementById('sleep-history');
    if (historySection) {
      historySection.scrollIntoView({ behavior: 'smooth' });
      // Close profile modal
      const modal = document.querySelector('.fixed.inset-0.bg-black');
      if (modal) modal.remove();
    }
  }
  
  exportUserData() {
    if (!this.currentUser) return;
    
    const userData = {
      user: this.currentUser,
      preferences: window.storageManager ? window.storageManager.getUserPreferences() : {},
      sleepHistory: window.storageManager ? window.storageManager.getSleepHistory(this.currentUser.id) : [],
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sleep-app-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('Data exported successfully!', 'success');
  }
  
  deleteAccountData() {
    if (!this.currentUser) return;
    
    const confirmed = confirm('Are you sure you want to delete all your account data? This action cannot be undone.');
    
    if (confirmed) {
      // Clear all user data
      if (window.storageManager) {
        window.storageManager.clearUserData(this.currentUser.id);
      }
      
      // Sign out
      this.signOut();
      
      this.showNotification('Account data deleted successfully', 'info');
      
      // Close modal
      const modal = document.querySelector('.fixed.inset-0.bg-black');
      if (modal) modal.remove();
    }
  }
  
  saveSession() {
    if (this.currentUser) {
      localStorage.setItem('sleep_app_user', JSON.stringify(this.currentUser));
      localStorage.setItem('sleep_app_session', Date.now().toString());
    }
  }
  
  clearSession() {
    localStorage.removeItem('sleep_app_user');
    localStorage.removeItem('sleep_app_session');
  }
  
  checkExistingSession() {
    try {
      const savedUser = localStorage.getItem('sleep_app_user');
      const sessionTime = localStorage.getItem('sleep_app_session');
      
      if (savedUser && sessionTime) {
        const sessionAge = Date.now() - parseInt(sessionTime);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (sessionAge < maxAge) {
          this.currentUser = JSON.parse(savedUser);
          this.updateAuthUI(true);
          this.loadUserData();
          console.log('Restored user session');
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Session restoration error:', error);
      this.clearSession();
    }
  }
  
  loadUserData() {
    if (this.currentUser && window.sleepApp) {
      window.sleepApp.currentUser = this.currentUser;
      window.sleepApp.loadSleepHistory();
    }
  }
  
  clearUserData() {
    if (window.sleepApp) {
      window.sleepApp.currentUser = null;
      window.sleepApp.sleepHistory = [];
      
      // Hide history section
      const historySection = document.getElementById('sleep-history');
      if (historySection) {
        historySection.classList.add('hidden');
      }
    }
  }
  
  notifySignIn() {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('userSignedIn', {
      detail: { user: this.currentUser }
    }));
  }
  
  notifySignOut() {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('userSignedOut'));
  }
  
  getCurrentUser() {
    return this.currentUser;
  }
  
  isSignedIn() {
    return !!this.currentUser;
  }
  
  showNotification(message, type = 'info') {
    // Use the main app's notification system if available
    if (window.sleepApp && window.sleepApp.showNotification) {
      window.sleepApp.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
  
  showAuthError(message) {
    this.showNotification(message, 'error');
    console.error('Auth Error:', message);
  }
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Listen for auth state changes
window.addEventListener('userSignedIn', (event) => {
  console.log('User signed in:', event.detail.user);
});

window.addEventListener('userSignedOut', () => {
  console.log('User signed out');
});
