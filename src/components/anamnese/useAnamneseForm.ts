/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { AnamneseFormData, emptyClinicalHistory } from './types';

const initialState = (): AnamneseFormData => ({
  child: {
    name: '',
    birthDate: '',
    gender: 'male',
    nationalIdentity: '',
    otherInfo: '',
    age: 0,
  },
  caregiver: {
    name: '',
    relationship: '',
    contact: '',
  },
  clinicalHistory: emptyClinicalHistory(),
});

const useAnamneseForm = () => {
  const [formData, setFormData] = useState<AnamneseFormData>(initialState);

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

  return { formData, setFormData, updateFormData };
};

export default useAnamneseForm;
