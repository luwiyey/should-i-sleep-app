// Service Worker for Should I Sleep App
const CACHE_NAME = 'should-i-sleep-v1.0.0';
const STATIC_CACHE_NAME = 'should-i-sleep-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'should-i-sleep-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/auth.js',
  './js/storage.js',
  './js/analytics.js',
  './manifest.json',
  './images/icon-192x192.png',
  './images/icon-512x512.png',
  // External resources (cached when accessed)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Network-first resources (always try network first)
const NETWORK_FIRST_URLS = [
  'https://accounts.google.com/gsi/client',
  'https://www.googletagmanager.com/gtag/js'
];

// Cache-first resources (try cache first, fallback to network)
const CACHE_FIRST_URLS = [
  '/images/',
  '/css/',
  '/js/',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('should-i-sleep-')) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim(); // Take control of all pages
      })
      .catch((error) => {
        console.error('Service Worker: Error during activation:', error);
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle different caching strategies based on URL
  if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isCacheFirst(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network-first strategy (for dynamic content)
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page or error
    return getOfflineResponse(request);
  }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache-first strategy failed:', error);
    return getOfflineResponse(request);
  }
}

// Stale-while-revalidate strategy (for app shell)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Service Worker: Network update failed:', error);
    });
  
  // Return cached version immediately, or wait for network
  return cachedResponse || networkResponsePromise || getOfflineResponse(request);
}

// Helper functions
function isNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

function isCacheFirst(url) {
  return CACHE_FIRST_URLS.some(pattern => url.includes(pattern));
}

function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return caches.match('./index.html');
  }
  
  // Return placeholder for images
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  // Return generic offline response
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-sleep-data') {
    event.waitUntil(syncSleepData());
  } else if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync sleep calculation data
async function syncSleepData() {
  try {
    console.log('Service Worker: Syncing sleep data...');
    
    // Get pending sync data from IndexedDB or localStorage
    const pendingData = await getPendingSyncData('sleep-calculations');
    
    if (pendingData && pendingData.length > 0) {
      // Send data to server
      for (const data of pendingData) {
        await fetch('/api/sleep-calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      
      // Clear pending data after successful sync
      await clearPendingSyncData('sleep-calculations');
      console.log('Service Worker: Sleep data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing sleep data:', error);
    throw error; // Retry sync
  }
}

// Sync feedback data
async function syncFeedback() {
  try {
    console.log('Service Worker: Syncing feedback...');
    
    const pendingFeedback = await getPendingSyncData('feedback');
    
    if (pendingFeedback && pendingFeedback.length > 0) {
      for (const feedback of pendingFeedback) {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback)
        });
      }
      
      await clearPendingSyncData('feedback');
      console.log('Service Worker: Feedback synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing feedback:', error);
    throw error;
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    console.log('Service Worker: Syncing analytics...');
    
    const pendingAnalytics = await getPendingSyncData('analytics');
    
    if (pendingAnalytics && pendingAnalytics.length > 0) {
      for (const event of pendingAnalytics) {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
      }
      
      await clearPendingSyncData('analytics');
      console.log('Service Worker: Analytics synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing analytics:', error);
    throw error;
  }
}

// Helper functions for sync data management
async function getPendingSyncData(type) {
  try {
    const data = localStorage.getItem(`pending_sync_${type}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Service Worker: Error getting pending sync data:', error);
    return [];
  }
}

async function clearPendingSyncData(type) {
  try {
    localStorage.removeItem(`pending_sync_${type}`);
  } catch (error) {
    console.error('Service Worker: Error clearing pending sync data:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Time for your optimal sleep schedule!',
    icon: './images/icon-192x192.png',
    badge: './images/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: './',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: './images/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: './images/action-dismiss.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.title = pushData.title || 'Should I Sleep?';
      options.data = { ...options.data, ...pushData.data };
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Should I Sleep?', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow('./');
          }
        })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already handled above)
    console.log('Service Worker: Notification dismissed');
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
      case 'SYNC_DATA':
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          self.registration.sync.register(event.data.tag);
        }
        break;
      default:
        console.log('Service Worker: Unknown message type:', event.data.type);
    }
  }
});

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Error clearing caches:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'sleep-reminder') {
    event.waitUntil(handleSleepReminder());
  }
});

// Handle sleep reminder
async function handleSleepReminder() {
  try {
    // Get user preferences for sleep reminders
    const preferences = JSON.parse(localStorage.getItem('sleep_app_user_preferences') || '{}');
    
    if (preferences.bedtimeReminder && preferences.reminderTime) {
      const now = new Date();
      const reminderTime = new Date();
      const [hours, minutes] = preferences.reminderTime.split(':');
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Check if it's time for reminder (within 5 minutes)
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      if (timeDiff <= 5 * 60 * 1000) { // 5 minutes
        await self.registration.showNotification('Bedtime Reminder', {
          body: 'It\'s time to start your bedtime routine for optimal sleep!',
          icon: './images/icon-192x192.png',
          badge: './images/badge-72x72.png',
          tag: 'bedtime-reminder',
          requireInteraction: true,
          actions: [
            { action: 'calculate', title: 'Calculate Sleep Times' },
            { action: 'snooze', title: 'Remind Later' }
          ]
        });
      }
    }
  } catch (error) {
    console.error('Service Worker: Error handling sleep reminder:', error);
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Script loaded successfully');
