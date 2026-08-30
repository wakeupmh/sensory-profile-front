// Types for the child's care team (fonoaudióloga, psicóloga, terapeuta
// ocupacional, AT, etc.) — professionals invited by the parent onto a
// single child, distinct from co-caregivers (src/types/caregivers.ts, which
// grant account-wide delegation) and from per-resource professional sharing
// (src/types/childSharing.ts / professionals.ts, which is read-only).
//
// The parent always grants and always revokes (see CONTRACT.md, backend
// repo). A professional can never add themselves or another professional.

export const CARE_TEAM_ROLES = [
  'fonoaudiologia',
  'psicologia',
  'terapia_ocupacional',
  'acompanhante_terapeutico',
  'educacao_fisica',
  'fisioterapia',
  'psicopedagogia',
  'outro',
] as const;

export type CareTeamRole = (typeof CARE_TEAM_ROLES)[number];

/**
 * Nome de cada especialidade, em um lugar só — mesmo desenho de
 * `LOG_TYPE_LABELS` (src/types/logs.ts). Tipado como `Record<CareTeamRole,
 * string>`, e não `Record<string, string>`, para que uma especialidade nova
 * no backend sem label aqui vire erro de compilação, não um `undefined` na
 * tela.
 */
/**
 * A chave de tradução de cada especialidade, num lugar só. O CONJUNTO de
 * especialidades vive aqui (é o que não pode divergir do backend); o texto vive
 * no i18n, senão a tela mistura idiomas — "Fonoaudióloga" aparecendo numa
 * interface em inglês, que foi o que a verificação em navegador mostrou.
 */
export const CARE_TEAM_ROLE_LABEL_KEYS: Record<CareTeamRole, string> = {
  fonoaudiologia: 'careTeam.roles.fonoaudiologia',
  psicologia: 'careTeam.roles.psicologia',
  terapia_ocupacional: 'careTeam.roles.terapia_ocupacional',
  acompanhante_terapeutico: 'careTeam.roles.acompanhante_terapeutico',
  educacao_fisica: 'careTeam.roles.educacao_fisica',
  fisioterapia: 'careTeam.roles.fisioterapia',
  psicopedagogia: 'careTeam.roles.psicopedagogia',
  outro: 'careTeam.roles.outro',
};

/** Status bruto devolvido pelo backend (`CareTeamMember.getStatus()`). */
export type CareTeamMemberStatus = 'pending' | 'accepted' | 'revoked';

/**
 * Participação de um profissional na equipe de cuidado de uma criança, do
 * ponto de vista do responsável. Espelha `CareTeamMember.toListView()` no
 * backend — por isso NÃO tem `invitationToken`: a listagem nunca traz o
 * token de convite (ver `CreateCareTeamMemberResponse`, a única resposta que
 * traz).
 */
export interface CareTeamMember {
  id: string;
  childId: string;
  memberName: string;
  role: CareTeamRole;
  status: CareTeamMemberStatus;
  invitationExpiresAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreateCareTeamMemberPayload {
  memberName: string;
  role: CareTeamRole;
}

/**
 * Resposta de `POST .../care-team` — a ÚNICA vez que `invitationToken`
 * aparece em qualquer resposta da API. Nenhuma tela deve tentar ler esse
 * campo de uma resposta de `careTeamApi.list`.
 */
export interface CreateCareTeamMemberResponse extends CareTeamMember {
  invitationToken: string | null;
}

/** Resposta de `POST /api/care-team/accept` — mínima de propósito (ver CareTeamController no backend). */
export interface AcceptCareTeamInvitationResponse {
  id: string;
  childId: string;
  role: CareTeamRole;
}

/**
 * Uma criança do caseload do profissional (`GET /api/care-team/my-children`).
 * Nada do responsável atravessa para cá (nem nome, nem id) — o profissional
 * recebeu acesso à criança, não à conta de quem o convidou.
 */
export interface CareTeamCaseloadEntry {
  membershipId: string;
  childId: string;
  childName: string;
  childBirthDate: string | null;
  role: CareTeamRole;
  acceptedAt: string | null;
}

/**
 * Status como a TELA precisa enxergar — o backend só distingue
 * pending/accepted/revoked; "expirado" é derivado aqui comparando
 * `invitationExpiresAt` com o relógio local, porque o backend não some
 * automaticamente com uma linha só por ela ter passado da validade.
 */
export type CareTeamDisplayStatus = 'pending' | 'active' | 'expired' | 'revoked';

export function getCareTeamDisplayStatus(
  member: Pick<CareTeamMember, 'status' | 'invitationExpiresAt'>,
  now: Date = new Date(),
): CareTeamDisplayStatus {
  if (member.status === 'revoked') return 'revoked';
  if (member.status === 'accepted') return 'active';
  // status === 'pending'
  if (member.invitationExpiresAt && new Date(member.invitationExpiresAt).getTime() <= now.getTime()) {
    return 'expired';
  }
  return 'pending';
}
