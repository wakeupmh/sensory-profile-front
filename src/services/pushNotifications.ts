import { notificationApi } from './api';
import { arrayBufferToBase64Url, isPushSupported, urlBase64ToUint8Array } from '../utils/pushNotifications';
import type { PushSubscriptionPayload } from '../types/notifications';

export { isPushSupported };

export type PushPermissionState = NotificationPermission | 'unsupported';

export function getPushPermissionState(): PushPermissionState {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

function toPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');
  if (!p256dh || !auth) throw new Error('Assinatura push inválida: chaves de criptografia ausentes');
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64Url(p256dh),
      auth: arrayBufferToBase64Url(auth),
    },
  };
}

/** Requests notification permission, subscribes via PushManager, and registers the subscription with the backend. Throws if permission is denied or the platform doesn't support push. */
export async function subscribeToPush(token: string | null): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Notificações push não são suportadas neste navegador');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão de notificação negada');
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();

  const publicKey = await notificationApi.getPushPublicKey(token);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await notificationApi.subscribeToPush(token, toPayload(subscription));
}

/** No-op if there's no active subscription — safe to call unconditionally. */
export async function unsubscribeFromPush(token: string | null): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await notificationApi.unsubscribeFromPush(token, endpoint);
}
