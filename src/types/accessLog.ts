// Types for the owner-side data-access audit trail (LGPD, SP-20)

export type AccessAction = 'read' | 'write';

export interface AccessLogEntry {
  id: string;
  childId: string;
  professionalId: string | null;
  professionalName?: string | null;
  resourceType: string;
  action: AccessAction;
  occurredAt: string;
}

export interface PaginatedAccessLogs {
  data: AccessLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface AccessLogQueryParams {
  page?: number;
  limit?: number;
}
