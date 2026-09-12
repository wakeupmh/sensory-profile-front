export type ProfessionalStatus = 'pending' | 'accepted';

export interface Professional {
  id: string;
  name: string;
  email: string | null;
  profession: string | null;
  status: ProfessionalStatus;
  /**
   * Só vem na criação, na consulta por id e na rotação — a LISTAGEM não traz.
   * O backend passou a devolver a lista por `toListView()` porque cada
   * `GET /api/professionals` estava carregando o token vivo de todo convite
   * pendente. Por isso é opcional: numa linha vinda da listagem ele não
   * existe, e nada na tela pode depender dele para decidir o que mostrar.
   */
  invitationToken?: string | null;
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
