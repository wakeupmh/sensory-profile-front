/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { 
  FormData, 
  FrequencyResponse, 
  SensoryItem 
} from './types';
import { 
  auditoryProcessingItems, 
  visualProcessingItems, 
  tactileProcessingItems, 
  movementProcessingItems, 
  bodyPositionProcessingItems, 
  oralSensitivityProcessingItems, 
  behavioralResponsesItems, 
  socialEmotionalResponsesItems, 
  attentionResponsesItems 
} from './itemsData';

const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
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
    auditoryProcessing: {
      items: auditoryProcessingItems,
      rawScore: 0,
      comments: '',
    },
    visualProcessing: {
      items: visualProcessingItems,
      rawScore: 0,
      comments: '',
    },
    tactileProcessing: {
      items: tactileProcessingItems,
      rawScore: 0,
      comments: '',
    },
    movementProcessing: {
      items: movementProcessingItems,
      rawScore: 0,
      comments: '',
    },
    bodyPositionProcessing: {
      items: bodyPositionProcessingItems,
      rawScore: 0,
      comments: '',
    },
    oralSensitivityProcessing: {
      items: oralSensitivityProcessingItems,
      rawScore: 0,
      comments: '',
    },
    behavioralResponses: {
      items: behavioralResponsesItems,
      rawScore: 0,
      comments: '',
    },
    socialEmotionalResponses: {
      items: socialEmotionalResponsesItems,
      rawScore: 0,
      comments: '',
    },
    attentionResponses: {
      items: attentionResponsesItems,
      rawScore: 0,
      comments: '',
    },
  });

  // Função para atualizar formData
  const updateFormData = useCallback((path: string, value: any) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  }, []);

  // Função para atualizar resposta de item e recalcular pontuação
  const updateItemResponse = useCallback((section: string, itemId: number, response: FrequencyResponse) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      const sectionData = (newData as any)[section];
      
      // Encontre o item e atualize sua resposta
      const itemIndex = sectionData.items.findIndex((item: SensoryItem) => item.id === itemId);
      if (itemIndex !== -1) {
        sectionData.items[itemIndex] = {
          ...sectionData.items[itemIndex],
          response
        };
      }
      
      // Recalcule a pontuação bruta
      sectionData.rawScore = calculateRawScore(sectionData.items);
      
      return newData;
    });
  }, []);

  const calculateRawScore = useCallback((items: SensoryItem[]) => {
    const responseValues = {
      'quase sempre': 5,
      'frequentemente': 4,
      'metade do tempo': 3,
      'ocasionalmente': 2,
      'quase nunca': 1,
      'não se aplica': 0
    };

    return items.reduce((total, item) => {
      return total + (responseValues[item.response as keyof typeof responseValues] || 0);
    }, 0);
  }, []);

  return { 
    formData, 
    setFormData, 
    updateFormData, 
    updateItemResponse, 
    calculateRawScore
  };
};

export default useFormData;
