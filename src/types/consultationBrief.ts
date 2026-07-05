// Types for the AI consultation brief ("pauta de consulta médica") — SP-22

export interface ConsultationBrief {
  whatChanged: string;
  currentTreatments: string;
  suggestedQuestions: string[];
}

export interface GenerateConsultationBriefPayload {
  childId: string;
  periodDays?: number;
}
