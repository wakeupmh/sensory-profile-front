/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import CaregiverDataSection from '../sensory-profile/CaregiverDataSection';
import type { AnamneseFormData } from './types';

interface CaregiverSectionProps {
  formData: AnamneseFormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const CaregiverSection: React.FC<CaregiverSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  return (
    <CaregiverDataSection
      formData={formData as any}
      updateFormData={updateFormData}
      disabled={disabled}
    />
  );
});

export default CaregiverSection;
