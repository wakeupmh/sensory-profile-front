import type { Instrument } from '../../instruments/types';
import { toSensoryItems } from '../../instruments/types';
import { DEFAULT_INSTRUMENT_ID, getInstrument, getSectionsForItemIds } from '../../instruments';
import type { FormData, SensoryItem, SensorySection } from './types';

/** Avaliação crua da API (rota legada, sem tipo — ver `LegacyPayload` em api.ts). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawAssessment = Record<string, any>;

interface RawResponse {
  itemId: number;
  response: string;
  id?: string;
}

/**
 * Monta as seções preenchidas de uma avaliação carregada da API.
 * Seções dinâmicas (M-CHAT-R/F) são derivadas dos itens respondidos.
 */
function buildSectionsFromResponses(
  instrument: Instrument,
  responses: RawResponse[] | unknown,
): { sections: Record<string, SensorySection>; sectionKeys: string[] } {
  const list: RawResponse[] = Array.isArray(responses) ? responses : [];
  const defs = getSectionsForItemIds(instrument, list.map((r) => r.itemId));
  const sections: Record<string, SensorySection> = Object.fromEntries(
    defs.map((s) => [
      s.key,
      { items: toSensoryItems(s.items) as SensoryItem[], rawScore: 0, comments: '' },
    ]),
  );
  list.forEach((r) => {
    for (const section of Object.values(sections)) {
      const target = section.items.find((it) => it.id === r.itemId);
      if (target) {
        target.response = r.response as SensoryItem['response'];
        if (r.id) target.responseId = r.id;
        return;
      }
    }
  });
  return { sections, sectionKeys: defs.map((s) => s.key) };
}

/** Seções da avaliação carregada, com pontuação bruta e comentários por seção. */
export function buildAssessmentSections(
  instrument: Instrument,
  assessment: RawAssessment,
  responses: unknown,
): Record<string, SensorySection> {
  const { sections, sectionKeys } = buildSectionsFromResponses(instrument, responses);

  sectionKeys.forEach((key) => {
    const scoreField = `${key}RawScore`;
    if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
      sections[key].rawScore = assessment[scoreField];
    }
  });

  if (Array.isArray(assessment.sectionComments)) {
    assessment.sectionComments.forEach((c: { section: string; comments: string }) => {
      if (sections[c.section]) sections[c.section].comments = c.comments || '';
    });
  }

  return sections;
}

/** Avaliação carregada da API no formato de leitura do relatório. */
export function assessmentToFormData(assessment: RawAssessment, responses: unknown): FormData {
  const instrumentId: string = assessment.instrumentId || DEFAULT_INSTRUMENT_ID;
  return {
    instrumentId,
    child: {
      name: assessment.childName || '',
      birthDate: assessment.childBirthDate || '',
      gender: assessment.childGender ?? '', // ausente fica "Não informado" no relatório, nunca "Masculino"
      nationalIdentity: assessment.childNationalIdentity || '',
      otherInfo: assessment.childOtherInfo || '',
      age: assessment.childAge || 0,
    },
    examiner: {
      name: assessment.examinerName || '',
      profession: assessment.examinerProfession || '',
      contact: assessment.examinerContact || '',
    },
    caregiver: {
      name: assessment.caregiverName || '',
      relationship: assessment.caregiverRelationship || '',
      contact: assessment.caregiverContact || '',
    },
    sections: buildAssessmentSections(getInstrument(instrumentId), assessment, responses),
    scoresJson: assessment.scores_json ?? assessment.scoresJson ?? undefined,
    createdAt: assessment.createdAt,
  };
}
