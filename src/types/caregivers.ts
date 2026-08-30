// Types for co-caregivers with read-write delegation (SP-21)

export type CaregiverStatus = 'pending' | 'accepted';

export interface Caregiver {
  id: string;
  childId: string;
  caregiverName: string;
  status: CaregiverStatus;
  /**
   * Só vem na resposta da criação — a listagem usa `toListView()`, que remove
   * o token. Opcional porque numa linha vinda da listagem ele não existe, e
   * declarar não-opcional é a mesma mentira que `types/professionals.ts`
   * carregava.
   */
  invitationToken?: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCaregiverPayload {
  caregiverName: string;
}

export interface AcceptCaregiverInviteResponse {
  caregiver: Caregiver;
  child?: DelegateChild | null;
}

/** A child the current user is delegating as (acting on behalf of an owner). */
export interface DelegateChild {
  id: string;
  name: string;
}
