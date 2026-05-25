/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import {
  FormData,
  FrequencyResponse,
  SensoryItem,
  SensorySection,
} from './types';
import {
  DEFAULT_INSTRUMENT_ID,
  getInstrument,
} from '../../instruments';
import { toSensoryItems } from '../../instruments/types';

const buildSectionsForInstrument = (instrumentId: string): Record<string, SensorySection> => {
  const instrument = getInstrument(instrumentId);
  return Object.fromEntries(
    instrument.sections.map((s) => [
      s.key,
      { items: toSensoryItems(s.items), rawScore: 0, comments: '' },
    ]),
  );
};

const buildInitialFormData = (instrumentId: string): FormData => ({
  instrumentId,
  child: {
    name: '',
    birthDate: '',
    gender: 'male',
    nationalIdentity: '',
    otherInfo: '',
    age: 0,
  },
  examiner: {
    name: '',
    profession: '',
    contact: '',
  },
  caregiver: {
    name: '',
    relationship: '',
    contact: '',
  },
  sections: buildSectionsForInstrument(instrumentId),
});

const useFormData = (initialInstrumentId: string = DEFAULT_INSTRUMENT_ID) => {
  const [formData, setFormData] = useState<FormData>(() => buildInitialFormData(initialInstrumentId));

  const updateFormData = useCallback((path: string, value: any) => {
    setFormData((prevData) => {
      const newData: any = { ...prevData };
      const keys = path.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] };
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const updateItemResponse = useCallback(
    (sectionKey: string, itemId: number, response: FrequencyResponse) => {
      setFormData((prevData) => {
        const sections = { ...prevData.sections };
        const section = sections[sectionKey];
        if (!section) return prevData;

        const items = section.items.map((item: SensoryItem) =>
          item.id === itemId ? { ...item, response } : item,
        );
        const rawScore = calculateRawScore(items, prevData.instrumentId);

        sections[sectionKey] = { ...section, items, rawScore };
        return { ...prevData, sections };
      });
    },
    [],
  );

  const switchInstrument = useCallback((newInstrumentId: string) => {
    setFormData((prev) => ({
      ...prev,
      instrumentId: newInstrumentId,
      sections: buildSectionsForInstrument(newInstrumentId),
    }));
  }, []);

  return {
    formData,
    setFormData,
    updateFormData,
    updateItemResponse,
    calculateRawScore,
    switchInstrument,
  };
};

const legacyResponseValues: Record<string, number> = {
  'quase sempre': 5,
  'frequentemente': 4,
  'metade do tempo': 3,
  'ocasionalmente': 2,
  'quase nunca': 1,
  'não se aplica': 0,
};

export const calculateRawScore = (items: SensoryItem[], instrumentId?: string): number => {
  const scale = instrumentId ? getInstrument(instrumentId)?.scale : undefined;
  return items.reduce((total, item) => {
    const response = item.response as string;
    if (!response) return total;
    if (scale) {
      const option = scale.options.find((o) => o.value === response);
      return total + (option?.numeric ?? 0);
    }
    return total + (legacyResponseValues[response] ?? 0);
  }, 0);
};

export default useFormData;
