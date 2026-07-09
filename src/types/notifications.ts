// Types for reminder e-mail delivery preferences — GET/PATCH /api/notifications/preferences

export interface NotificationPreferences {
  email: string | null;
  reminderEmailsEnabled: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  reminderEmailsEnabled: boolean;
}

// Matches the browser's PushSubscription.toJSON() shape exactly — sent
// as-is to POST /api/notifications/push-subscriptions.
export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
