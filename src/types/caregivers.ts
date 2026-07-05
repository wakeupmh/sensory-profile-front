// Types for co-caregivers with read-write delegation (SP-21)

export type CaregiverStatus = 'pending' | 'accepted';

export interface Caregiver {
  id: string;
  childId: string;
  caregiverName: string;
  status: CaregiverStatus;
  invitationToken: string | null;
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
