// Storage Manager for Local Storage and User Preferences
class StorageManager {
  constructor() {
    this.storagePrefix = 'sleep_app_';
    this.version = '1.0';
    
    // Storage keys
    this.keys = {
      userPreferences: 'user_preferences',
      sleepHistory: 'sleep_history_',
      appSettings: 'app_settings',
      userData: 'user_data_'
    };
    
    this.init();
  }
  
  init() {
    // Check if localStorage is available
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available. Using memory storage.');
      this.useMemoryStorage = true;
      this.memoryStorage = {};
    }
    
    // Initialize app settings
    this.initializeAppSettings();
    
    // Clean up old data
    this.cleanupOldData();
    
    console.log('Storage Manager initialized');
  }
  
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  initializeAppSettings() {
    const settings = this.getAppSettings();
    if (!settings.version) {
      this.saveAppSettings({
        version: this.version,
        firstLaunch: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      });
    } else {
      // Update last used
      settings.lastUsed = new Date().toISOString();
      this.saveAppSettings(settings);
    }
  }
  
  // Generic storage methods
  setItem(key, value) {
    const fullKey = this.storagePrefix + key;
    const data = {
      value: value,
      timestamp: new Date().toISOString(),
      version: this.version
    };
    
    try {
      if (this.useMemoryStorage) {
        this.memoryStorage[fullKey] = JSON.stringify(data);
      } else {
        localStorage.setItem(fullKey, JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }
  
  getItem(key) {
    const fullKey = this.storagePrefix + key;
    
    try {
      let item;
      if (this.useMemoryStorage) {
        item = this.memoryStorage[fullKey];
      } else {
        item = localStorage.getItem(fullKey);
      }
      
      if (!item) return null;
      
      const data = JSON.parse(item);
      return data.value;
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  }
  
  removeItem(key) {
    const fullKey = this.storagePrefix + key;
    
    try {
      if (this.useMemoryStorage) {
        delete this.memoryStorage[fullKey];
      } else {
        localStorage.removeItem(fullKey);
      }
      return true;
    } catch (error) {
      console.error('Storage removal error:', error);
      return false;
    }
  }
  
  // User preferences methods
  saveUserPreferences(userId, preferences) {
    const key = userId ? `${this.keys.userPreferences}_${userId}` : this.keys.userPreferences;
    const currentPrefs = this.getUserPreferences(userId) || {};
    
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    
    return this.setItem(key, updatedPrefs);
  }
  
  getUserPreferences(userId = null) {
    const key = userId ? `${this.keys.userPreferences}_${userId}` : this.keys.userPreferences;
    return this.getItem(key) || {
      mood: 'neutral',
      theme: 'light',
      notifications: true,
      autoSetCurrentTime: false,
      preferredSleepDuration: 8,
      bedtimeReminder: false,
      reminderTime: '22:00'
    };
  }
  
  saveUserPreference(key, value, userId = null) {
    const preferences = this.getUserPreferences(userId);
    preferences[key] = value;
    return this.saveUserPreferences(userId, preferences);
  }
  
  // Sleep history methods
  saveSleepHistory(userId, history) {
    const key = `${this.keys.sleepHistory}${userId}`;
    
    // Ensure history is an array and limit to 50 entries
    const limitedHistory = Array.isArray(history) ? history.slice(0, 50) : [];
    
    return this.setItem(key, limitedHistory);
  }
  
  getSleepHistory(userId) {
    const key = `${this.keys.sleepHistory}${userId}`;
    return this.getItem(key) || [];
  }
  
  addSleepCalculation(userId, calculation) {
    const history = this.getSleepHistory(userId);
    
    // Add new calculation to the beginning
    history.unshift({
      ...calculation,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 calculations
    const limitedHistory = history.slice(0, 50);
    
    return this.saveSleepHistory(userId, limitedHistory);
  }
  
  deleteSleepCalculation(userId, calculationId) {
    const history = this.getSleepHistory(userId);
    const updatedHistory = history.filter(item => item.id !== calculationId);
    
    return this.saveSleepHistory(userId, updatedHistory);
  }
  
  // App settings methods
  saveAppSettings(settings) {
    return this.setItem(this.keys.appSettings, settings);
  }
  
  getAppSettings() {
    return this.getItem(this.keys.appSettings) || {};
  }
  
  // User data methods
  saveUserData(userId, data) {
    const key = `${this.keys.userData}${userId}`;
    return this.setItem(key, data);
  }
  
  getUserData(userId) {
    const key = `${this.keys.userData}${userId}`;
    return this.getItem(key);
  }
  
  clearUserData(userId) {
    // Clear all user-specific data
    const keysToRemove = [
      `${this.keys.userPreferences}_${userId}`,
      `${this.keys.sleepHistory}${userId}`,
      `${this.keys.userData}${userId}`
    ];
    
    keysToRemove.forEach(key => this.removeItem(key));
    
    console.log(`Cleared all data for user: ${userId}`);
    return true;
  }
  
  // Analytics and usage tracking
  trackUsage(event, data = {}) {
    const usage = this.getUsageData();
    
    const eventData = {
      event: event,
      data: data,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };
    
    usage.events = usage.events || [];
    usage.events.push(eventData);
    
    // Keep only last 100 events
    if (usage.events.length > 100) {
      usage.events = usage.events.slice(-100);
    }
    
    // Update usage stats
    usage.totalEvents = (usage.totalEvents || 0) + 1;
    usage.lastActivity = new Date().toISOString();
    
    this.setItem('usage_data', usage);
  }
  
  getUsageData() {
    return this.getItem('usage_data') || {
      totalEvents: 0,
      events: [],
      firstUsed: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
  }
  
  getSessionId() {
    let sessionId = sessionStorage.getItem('sleep_app_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('sleep_app_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Export/Import functionality
  exportAllData(userId = null) {
    const exportData = {
      version: this.version,
      exportDate: new Date().toISOString(),
      userId: userId
    };
    
    if (userId) {
      // Export user-specific data
      exportData.preferences = this.getUserPreferences(userId);
      exportData.sleepHistory = this.getSleepHistory(userId);
      exportData.userData = this.getUserData(userId);
    } else {
      // Export all data
      exportData.preferences = this.getUserPreferences();
      exportData.appSettings = this.getAppSettings();
      exportData.usageData = this.getUsageData();
    }
    
    return exportData;
  }
  
  importData(data, userId = null) {
    try {
      if (!data || !data.version) {
        throw new Error('Invalid data format');
      }
      
      if (userId) {
        // Import user-specific data
        if (data.preferences) {
          this.saveUserPreferences(userId, data.preferences);
        }
        if (data.sleepHistory) {
          this.saveSleepHistory(userId, data.sleepHistory);
        }
        if (data.userData) {
          this.saveUserData(userId, data.userData);
        }
      } else {
        // Import general data
        if (data.preferences) {
          this.saveUserPreferences(null, data.preferences);
        }
        if (data.appSettings) {
          this.saveAppSettings(data.appSettings);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
  
  // Backup and restore
  createBackup(userId = null) {
    const backup = {
      timestamp: new Date().toISOString(),
      version: this.version,
      data: this.exportAllData(userId)
    };
    
    const backupKey = `backup_${Date.now()}`;
    this.setItem(backupKey, backup);
    
    // Keep only last 5 backups
    this.cleanupBackups();
    
    return backupKey;
  }
  
  restoreBackup(backupKey) {
    const backup = this.getItem(backupKey);
    if (!backup) {
      return false;
    }
    
    return this.importData(backup.data);
  }
  
  getBackups() {
    const backups = [];
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      if (key.startsWith('backup_')) {
        const backup = this.getItem(key);
        if (backup) {
          backups.push({
            key: key,
            timestamp: backup.timestamp,
            version: backup.version
          });
        }
      }
    });
    
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  cleanupBackups() {
    const backups = this.getBackups();
    if (backups.length > 5) {
      // Remove oldest backups
      backups.slice(5).forEach(backup => {
        this.removeItem(backup.key);
      });
    }
  }
  
  // Utility methods
  getAllKeys() {
    const keys = [];
    
    if (this.useMemoryStorage) {
      Object.keys(this.memoryStorage).forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          keys.push(key.replace(this.storagePrefix, ''));
        }
      });
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keys.push(key.replace(this.storagePrefix, ''));
        }
      }
    }
    
    return keys;
  }
  
  getStorageSize() {
    let totalSize = 0;
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      const item = this.getItem(key);
      if (item) {
        totalSize += JSON.stringify(item).length;
      }
    });
    
    return {
      bytes: totalSize,
      kb: (totalSize / 1024).toFixed(2),
      mb: (totalSize / (1024 * 1024)).toFixed(2)
    };
  }
  
  cleanupOldData() {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 6); // 6 months ago
    
    const keys = this.getAllKeys();
    let cleanedCount = 0;
    
    keys.forEach(key => {
      try {
        const fullKey = this.storagePrefix + key;
        let item;
        
        if (this.useMemoryStorage) {
          item = this.memoryStorage[fullKey];
        } else {
          item = localStorage.getItem(fullKey);
        }
        
        if (item) {
          const data = JSON.parse(item);
          const itemDate = new Date(data.timestamp);
          
          if (itemDate < cutoffDate && !key.includes('preferences') && !key.includes('settings')) {
            this.removeItem(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted items
        this.removeItem(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old storage items`);
    }
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Storage quota management
  checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => {
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          available: estimate.quota - estimate.usage,
          percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
        };
      });
    }
    
    return Promise.resolve(null);
  }
  
  // Clear all app data
  clearAllData() {
    const keys = this.getAllKeys();
    keys.forEach(key => this.removeItem(key));
    
    if (this.useMemoryStorage) {
      this.memoryStorage = {};
    }
    
    console.log('All app data cleared');
    return true;
  }
}

// Initialize Storage Manager
document.addEventListener('DOMContentLoaded', () => {
  window.storageManager = new StorageManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
