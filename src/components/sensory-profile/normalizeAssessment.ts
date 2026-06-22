/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormData, SensoryItem, SensorySection } from './types';
import {
  DEFAULT_INSTRUMENT_ID,
  findSectionByItemId,
  getInstrument,
} from '../../instruments';
import { toSensoryItems } from '../../instruments/types';

/**
 * Map a backend assessment payload (either `{ assessment, responses }` from the
 * owner endpoint, or a flatter shape from the shared/professional endpoint)
 * into the front's canonical FormData.
 *
 * Shared by ReportPage and SharedAssessmentView so the section/score/comments
 * mapping can't drift between the owner's view and what an invited
 * professional sees.
 */
export const normalizeAssessmentPayload = (response: any): FormData => {
  const assessment = response.assessment ?? response;
  const responses = response.responses ?? assessment.responses ?? [];

  const instrumentId: string = assessment.instrumentId || DEFAULT_INSTRUMENT_ID;
  const instrument = getInstrument(instrumentId);

  const sections: Record<string, SensorySection> = Object.fromEntries(
    instrument.sections.map((s) => [
      s.key,
      { items: toSensoryItems(s.items) as SensoryItem[], rawScore: 0, comments: '' },
    ]),
  );

  if (Array.isArray(responses)) {
    responses.forEach((r: { itemId: number; response: string; id?: string }) => {
      const sectionKey = findSectionByItemId(instrument, r.itemId);
      if (!sectionKey) return;
      const target = sections[sectionKey].items.find((it) => it.id === r.itemId);
      if (target) {
        target.response = r.response as SensoryItem['response'];
        if (r.id) target.responseId = r.id;
      }
    });
  }

  instrument.sections.forEach((s) => {
    const scoreField = `${s.key}RawScore`;
    if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
      sections[s.key].rawScore = assessment[scoreField];
    }
  });

  if (Array.isArray(assessment.sectionComments)) {
    assessment.sectionComments.forEach((c: { section: string; comments: string }) => {
      if (sections[c.section]) sections[c.section].comments = c.comments || '';
    });
  }

  return {
    instrumentId,
    child: {
      name: assessment.childName || '',
      birthDate: assessment.childBirthDate || '',
      gender: assessment.childGender || 'male',
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
    sections,
    createdAt: assessment.createdAt,
  };
};
