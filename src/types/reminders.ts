// Types for reminders feed (manual + derived) — GET /api/reminders/upcoming

export type ReminderOrigin = 'manual' | 'medical' | 'school' | 'milestone' | 'medication';
export type ReminderStatus = 'pending' | 'done' | 'dismissed';

export interface UpcomingReminder {
  id: string;
  childId: string;
  title: string;
  dueAt: string;
  notes?: string | null;
  origin: ReminderOrigin;
  status: ReminderStatus;
}

export interface Reminder {
  id: string;
  childId: string;
  title: string;
  dueAt: string;
  notes: string | null;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderPayload {
  childId: string;
  title: string;
  dueAt: string;
  notes?: string | null;
}

export interface UpdateReminderPayload {
  title?: string;
  dueAt?: string;
  notes?: string | null;
  status?: ReminderStatus;
}

export const REMINDER_ORIGIN_LABELS: Record<ReminderOrigin, string> = {
  manual: 'Manual',
  medical: 'Retorno médico',
  school: 'Escola',
  milestone: 'Marco',
  medication: 'Medicação',
};

export const REMINDER_ORIGIN_ICONS: Record<ReminderOrigin, string> = {
  manual: '📌',
  medical: '🩺',
  school: '🎒',
  milestone: '🌱',
  medication: '💊',
};
