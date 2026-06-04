import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '../config/firebase';
import { auth } from '../config/firebase';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const API_URL = import.meta.env.VITE_RAILWAY_API_URL;

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isWebPlatform = () => !Capacitor.isNativePlatform();

export const requestWebNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const getWebFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = getMessaging(app);
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VITE_FIREBASE_VAPID_KEY not set');
      return null;
    }
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const setupWebForegroundListener = (onMessageReceived: (payload: any) => void) => {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      onMessageReceived(payload);
    });
  } catch {
    return () => {};
  }
};

export const registerCapacitorPush = async (): Promise<string | null> => {
  try {
    let permissionResult = await PushNotifications.requestPermissions();
    if (permissionResult.receive !== 'granted') {
      await PushNotifications.requestPermissions();
    }

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (tokenResult) => {
        resolve(tokenResult.value);
      });

      PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });

      PushNotifications.register();
    });
  } catch {
    return null;
  }
};

export const setupCapacitorPushListeners = (
  onForeground: (data: any) => void,
) => {
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    onForeground(notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', () => {});
};

export const registerPushToken = async (token: string, platform: 'web' | 'android' | 'ios') => {
  try {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform }),
    });
  } catch {
    // silently fail
  }
};

export const unregisterPushToken = async (platform?: string) => {
  try {
    const headers = await getAuthHeaders();
    await fetch(`${API_URL}/api/notifications/unregister-token`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
  } catch {
    // silently fail
  }
};

export const initializePushNotifications = async (onWebMessage?: (payload: any) => void) => {
  try {
    if (isWebPlatform()) {
      const granted = await requestWebNotificationPermission();
      if (!granted) return;

      const fcmToken = await getWebFcmToken();
      if (fcmToken) {
        await registerPushToken(fcmToken, 'web');
      }

      if (onWebMessage) {
        setupWebForegroundListener(onWebMessage);
      }
    } else {
      const pushToken = await registerCapacitorPush();
      if (pushToken) {
        const platform = Capacitor.getPlatform() as 'android' | 'ios';
        await registerPushToken(pushToken, platform);
      }

      if (onWebMessage) {
        setupCapacitorPushListeners(onWebMessage);
      }
    }
  } catch (error) {
    console.error('Push notification init error:', error);
  }
};
