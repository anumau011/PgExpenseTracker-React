importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Service worker version for debugging
console.log('[Service Worker] Firebase messaging service worker loaded');

// Wait for service worker to be ready
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(self.clients.claim());
});

// Initialize Firebase after service worker is ready
try {
  firebase.initializeApp({
    apiKey: "AIzaSyBD-3YedGB3xdIAgHEHmxNohufhaPww2bs",
    authDomain: "pgexpensetracker.firebaseapp.com",
    projectId: "pgexpensetracker",
    storageBucket: "pgexpensetracker.appspot.com",
    messagingSenderId: "175365812217",
    appId: "1:175365812217:web:f84ca83658547809d31728",
    measurementId: "G-HMDHE8CLX8"
  });

  const messaging = firebase.messaging();
  console.log('[Service Worker] Firebase messaging initialized');

  // Verify pushManager is available
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('[Service Worker] Push messaging is supported');
  } else {
    console.warn('[Service Worker] Push messaging is not supported');
  }

  messaging.onBackgroundMessage(function(payload) {
    console.log('[Service Worker] Received background message:', payload);
    
    try {
      const notificationTitle = payload.notification?.title || 'PG Expense Tracker';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: 'public/vite.svg',
        badge: 'public/vite.svg',
        timestamp: Date.now(),
        tag: 'expense-notification',
        data: payload.data || {},
        requireInteraction: false,
        silent: false
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (error) {
      console.error('[Service Worker] Error showing notification:', error);
    }
  });

  console.log('[Service Worker] Background message handler registered');
} catch (error) {
  console.error('[Service Worker] Initialization error:', error);
}
