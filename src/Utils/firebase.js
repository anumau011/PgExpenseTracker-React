import { getMessaging, getToken } from 'firebase/messaging';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getApiUrl } from './api';

// Your Firebase config (replace with your actual config if different)
const firebaseConfig = {
  apiKey: "AIzaSyBD-3YedGB3xdIAgHEHmxNohufhaPww2bs",
  authDomain: "pgexpensetracker.firebaseapp.com",
  projectId: "pgexpensetracker",
  storageBucket: "pgexpensetracker.appspot.com",
  messagingSenderId: "175365812217",
  appId: "1:175365812217:web:f84ca83658547809d31728",
  measurementId: "G-HMDHE8CLX8"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Check if notification setup is needed on app startup
export async function checkNotificationSetup(userId, fetchGroupsFn) {
  // Only run this check if user is already logged in
  const authToken = localStorage.getItem('token');
  if (!authToken || !userId) {
    console.log('No auth token or userId - skipping notification check');
    return;
  }

  const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionRequested';
  const hasRequestedBefore = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
  
  // Check if we should prompt for notifications
  const permission = Notification.permission;
  
  if (permission === 'default' && !hasRequestedBefore) {
    // User hasn't been asked yet - set up notifications
    console.log('Setting up notifications for already logged in user');
    await registerDeviceForNotifications(userId, fetchGroupsFn);
  } else if (permission === 'granted') {
    // User already granted permission, check if device is registered
    const deviceRegistered = localStorage.getItem('deviceRegisteredForNotifications');
    if (!deviceRegistered) {
      console.log('Re-registering device for already logged in user');
      await registerDeviceForNotifications(userId, fetchGroupsFn);
    }
  }
}

export async function registerDeviceForNotifications(userId, fetchGroupsFn) {
  try {
    // Check if the browser supports service workers and push notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications are not supported by this browser');
      return;
    }

    // Register service worker
    let registration;
    try {
      // First, try to get existing registration
      registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      
      if (!registration) {
        // If no existing registration, create new one
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('New Service Worker registered');
        
        // Wait for the service worker to be ready and active
        await registration.ready;
        
        // Additional wait to ensure service worker is fully loaded
        if (registration.installing) {
          await new Promise((resolve) => {
            registration.installing.addEventListener('statechange', (e) => {
              if (e.target.state === 'activated') {
                resolve();
              }
            });
          });
        }
      } else {
        console.log('Using existing Service Worker registration');
        
        // Ensure the service worker is ready
        await registration.ready;
      }

      // Verify that the service worker has pushManager
      if (!registration.active) {
        throw new Error('Service worker is not active');
      }

      // Double-check pushManager availability
      const sw = registration.active;
      if (!sw) {
        throw new Error('No active service worker found');
      }

    } catch (swError) {
      console.error('Service Worker registration failed:', swError);
      return;
    }

    // Check notification permission with localStorage tracking
    const NOTIFICATION_PERMISSION_KEY = 'notificationPermissionRequested';
    const hasRequestedBefore = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
    
    let permission = Notification.permission;
    
    if (permission === 'granted') {
      console.log('Notification permission already granted');
    } else if (permission === 'denied') {
      console.log('Notification permission was denied');
      return;
    } else if (permission === 'default' && !hasRequestedBefore) {
      // Only request permission if we haven't asked before
      console.log('Requesting notification permission for the first time');
      permission = await Notification.requestPermission();
      
      // Mark that we've requested permission (regardless of the response)
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'true');
      
      if (permission !== 'granted') {
        console.log('Notification permission not granted. Status:', permission);
        return;
      }
    } else {
      // User has been asked before but permission is still default (shouldn't happen normally)
      // or we've already asked this session
      console.log('Notification permission already requested previously. Current status:', permission);
      if (permission !== 'granted') {
        return;
      }
    }

    console.log('Notification permission granted');

    // Get FCM token with retry mechanism
    let token;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        token = await getToken(messaging, {
          vapidKey: 'BE-0IFyKrHP2kdVgzx8RNOL2dBWtNaWyuXF0jU_laWD5QN6vdBixihPgheV8jmmhFn4-Z3ba1mElrEF8lE9rT14',
          serviceWorkerRegistration: registration
        });

        if (token) {
          console.log('FCM Token obtained successfully:', token);
          break;
        } else {
          throw new Error('No token received');
        }
      } catch (tokenError) {
        retryCount++;
        console.warn(`FCM token retrieval attempt ${retryCount} failed:`, tokenError);
        
        if (retryCount >= maxRetries) {
          console.error('Failed to get FCM token after multiple attempts');
          return;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Get all groups the user is part of
    let groupCodes = [];
    try {
      const groups = await fetchGroupsFn();
      if (Array.isArray(groups)) {
        groupCodes = groups
          .filter(group => group && (group.groupCode || group.code || group.id))
          .map(group => group.groupCode || group.code || group.id);
        console.log('Group codes retrieved:', groupCodes);
      } else {
        console.warn('Invalid groups data received:', groups);
      }
    } catch (groupError) {
      console.error('Error fetching groups:', groupError);
      // Continue with empty array if group fetch fails
    }

    // Get auth token
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      console.error('No authentication token found');
      return;
    }

    // Register device with backend
    try {
      const response = await axios.post(
        getApiUrl('/pg/register-device'),
        { 
          userId: userId,
          token: token,  // Backend expects 'token' field
          groupCodes: groupCodes
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.status === 200) {
        console.log('✅ Device registered successfully for notifications!');
        // Mark that device is registered
        localStorage.setItem('deviceRegisteredForNotifications', 'true');
      } else {
        console.warn('Unexpected response from server:', response);
      }
    } catch (apiError) {
      console.error('❌ Error registering device with backend:', apiError.response?.data || apiError.message);
    }

  } catch (err) {
    console.error('❌ Error in notification registration process:', err);
  }
}
