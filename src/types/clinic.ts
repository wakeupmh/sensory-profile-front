/**
 * Clínicas. A clínica administra PESSOAS — nada aqui carrega dado de criança.
 *
 * Um admin vê o quadro e QUANTAS crianças cada profissional atende, nunca
 * quais: o responsável convidou uma pessoa para a equipe de cuidado, não uma
 * organização. Ver `docs/care-team.md` no backend.
 */

export const CLINIC_ROLES = ['admin', 'profissional'] as const;

export type ClinicRole = (typeof CLINIC_ROLES)[number];

/**
 * A chave de tradução de cada função, num lugar só. O CONJUNTO de funções vive
 * aqui (é o que não pode divergir do backend); o texto vive no i18n, senão a
 * tela mistura idiomas — um rótulo fixo em português aparecendo ao lado de
 * interface em inglês, que foi exatamente o que apareceu na verificação.
 */
export const CLINIC_ROLE_LABEL_KEYS: Record<ClinicRole, string> = {
  admin: 'clinic.roles.admin',
  profissional: 'clinic.roles.profissional',
};

export type ClinicMemberStatus = 'pending' | 'accepted' | 'revoked';

/** Uma linha do quadro. `caseloadSize` é número — nunca identidade. */
export interface ClinicRosterMember {
  id: string;
  clinicId: string;
  memberName: string;
  role: ClinicRole;
  status: ClinicMemberStatus;
  invitationExpiresAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  caseloadSize: number;
}

/** A resposta do convite — a ÚNICA que traz `invitationToken`. */
export interface CreateClinicMemberResponse extends Omit<ClinicRosterMember, 'caseloadSize'> {
  invitationToken: string | null;
}

/** Uma clínica de que eu faço parte, com o meu papel nela. */
export interface ClinicMembership {
  clinicId: string;
  clinicName: string;
  role: ClinicRole;
  acceptedAt: string | null;
}

export interface Clinic {
  id: string;
  name: string;
  createdAt: string;
}

/**
 * O status que a tela mostra. Um convite pendente cujo prazo passou não é a
 * mesma coisa que um convite pendente, e o backend não tem por que saber da
 * diferença — ela é de leitura.
 */
export type ClinicDisplayStatus = 'pending' | 'active' | 'expired' | 'revoked';

export function getClinicDisplayStatus(
  member: Pick<ClinicRosterMember, 'status' | 'invitationExpiresAt'>,
  now: Date = new Date(),
): ClinicDisplayStatus {
  if (member.status === 'revoked') return 'revoked';
  if (member.status === 'accepted') return 'active';
  if (member.invitationExpiresAt && new Date(member.invitationExpiresAt) <= now) return 'expired';
  return 'pending';
}
