// Types for the owner-side data-access audit trail (LGPD, SP-20)

export type AccessAction = 'read' | 'write';

export interface AccessLogEntry {
  id: string;
  childId: string | null;
  /**
   * Quem agiu. Comparado com o usuário logado para decidir entre "Você" e um
   * terceiro — antes a tela assumia que toda linha sem nome era do próprio
   * responsável, e por isso mostrava "Você" até nas ações de outra pessoa.
   */
  actorUserId: string;
  professionalId: string | null;
  /**
   * Nome resolvido pelo backend a partir das concessões desta criança
   * (cuidador delegado ou profissional convidado). Null quando não dá para
   * resolver — nesse caso a tela diz "Outro usuário", nunca "Você".
   */
  actorName: string | null;
  resourceType: string;
  resourceId: string | null;
  action: AccessAction;
  createdAt: string;
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
