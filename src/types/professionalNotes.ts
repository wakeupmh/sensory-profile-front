// Types for professional notes on shared children (LGPD-friendly, SP-20)

export interface ProfessionalNote {
  id: string;
  childId: string;
  professionalId: string;
  professionalName?: string | null;
  professionalProfession?: string | null;
  content: string;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalNotePayload {
  content: string;
  resourceType?: string | null;
  resourceId?: string | null;
}

export type UpdateProfessionalNotePayload = Partial<CreateProfessionalNotePayload>;
