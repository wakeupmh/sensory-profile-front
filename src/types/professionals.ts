export type ProfessionalStatus = 'pending' | 'accepted';

export interface Professional {
  id: string;
  name: string;
  email: string | null;
  profession: string | null;
  status: ProfessionalStatus;
  /** Only present for pending records (or after token rotation). */
  invitationToken: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalPayload {
  name: string;
  email?: string | null;
  profession?: string | null;
}

export interface ResourceShare {
  id: string;
  professionalId: string;
  grantedByUserId: string;
  createdAt: string;
}

export interface AcceptedIdentity {
  id: string;
  ownerUserId: string;
  ownerLabel?: string | null;
  acceptedAt: string;
}

/** Item returned by GET /api/shared/anamneses (read-only listing). */
export interface SharedAnamneseSummary {
  id: string;
  title: string;
  createdAt: string;
  grantedAt: string;
}

/** Item returned by GET /api/shared/assessments (read-only listing). */
export interface SharedAssessmentSummary {
  id: string;
  childName?: string;
  instrumentId?: string;
  createdAt: string;
  grantedAt: string;
}
