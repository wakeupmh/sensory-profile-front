// Types for reminder e-mail delivery preferences — GET/PATCH /api/notifications/preferences

export interface NotificationPreferences {
  email: string | null;
  reminderEmailsEnabled: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  reminderEmailsEnabled: boolean;
}
