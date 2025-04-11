/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
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
  socialEmotionalResponsesItems, 
  attentionResponsesItems 
} from './itemsData';

const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    child: {
      name: '',
      birthDate: '',
      gender: '',
      otherInfo: ''
    },
    examiner: {
      name: '',
      profession: '',
      contact: ''
    },
    caregiver: {
      name: '',
      relationship: '',
      contact: ''
    },
    auditoryProcessing: {
      items: auditoryProcessingItems,
      comments: '',
      rawScore: 0
    },
    visualProcessing: {
      items: visualProcessingItems,
      comments: '',
      rawScore: 0
    },
    tactileProcessing: {
      items: tactileProcessingItems,
      comments: '',
      rawScore: 0
    },
    movementProcessing: {
      items: movementProcessingItems,
      comments: '',
      rawScore: 0
    },
    bodyPositionProcessing: {
      items: bodyPositionProcessingItems,
      comments: '',
      rawScore: 0
    },
    oralSensitivityProcessing: {
      items: oralSensitivityProcessingItems,
      comments: '',
      rawScore: 0
    },
    socialEmotionalResponses: {
      items: socialEmotionalResponsesItems,
      comments: '',
      rawScore: 0
    },
    attentionResponses: {
      items: attentionResponsesItems,
      comments: '',
      rawScore: 0
    }
  });

  // Função para atualizar os dados do formulário
  const updateFormData = (path: string, value: any) => {
    const pathArray = path.split('.');
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current: any = newData;
      
      // Navega através do caminho até o penúltimo elemento
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      
      // Atualiza o valor final
      current[pathArray[pathArray.length - 1]] = value;
      
      return newData;
    });
  };

  const updateItemResponse = (section: string, itemId: number, response: FrequencyResponse) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      const sectionItems = [...(newData as any)[section].items] as SensoryItem[];
      
      const itemIndex = sectionItems.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        sectionItems[itemIndex] = { ...sectionItems[itemIndex], response };
        (newData as any)[section].items = sectionItems;
        
        // Recalcular a pontuação bruta
        (newData as any)[section].rawScore = calculateRawScore(sectionItems);
      }
      
      return newData;
    });
  };

  // Função para calcular a pontuação bruta
  const calculateRawScore = (items: SensoryItem[]) => {
    const responseValues = {
      'always': 5,
      'frequently': 4,
      'occasionally': 3,
      'rarely': 2,
      'never': 1,
      null: 0
    };

    return items.reduce((total, item) => {
      return total + (responseValues[item.response as keyof typeof responseValues] || 0);
    }, 0);
  };

  return { formData, updateFormData, updateItemResponse, calculateRawScore };
};

export default useFormData;
