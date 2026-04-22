/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import ChildDataSection from '../sensory-profile/ChildDataSection';
import type { AnamneseFormData } from './types';

interface ChildSectionProps {
  formData: AnamneseFormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ChildSection: React.FC<ChildSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  return (
    <ChildDataSection
      formData={formData as any}
      updateFormData={updateFormData}
      disabled={disabled}
    />
  );
});

export default ChildSection;
