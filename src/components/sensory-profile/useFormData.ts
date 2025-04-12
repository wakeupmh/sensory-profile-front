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

  // Function to update form data at a specific path
  const updateFormData = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current: any = newData;
      
      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      // Update the value
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  // Function to update item response and recalculate raw score
  const updateItemResponse = (section: string, itemId: number, response: FrequencyResponse) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      const sectionData = (newData as any)[section];
      
      // Find the item and update its response
      const itemIndex = sectionData.items.findIndex((item: SensoryItem) => item.id === itemId);
      if (itemIndex !== -1) {
        sectionData.items[itemIndex] = {
          ...sectionData.items[itemIndex],
          response
        };
      }
      
      // Recalculate raw score
      sectionData.rawScore = calculateRawScore(sectionData.items);
      
      return newData;
    });
  };

  // Calculate raw score based on item responses
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

  return { formData, setFormData, updateFormData, updateItemResponse, calculateRawScore };
};

export default useFormData;
