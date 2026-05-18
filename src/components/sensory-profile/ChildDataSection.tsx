/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { useEffect, useState, memo } from 'react';
import { Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';
import GumroadHeading from '../design-system/GumroadHeading';
import ChildForm, { ChildFormValue } from './ChildForm';

interface ChildDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ChildDataSection: React.FC<ChildDataSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const [calculatedAge, setCalculatedAge] = useState<number>(0);

  useEffect(() => {
    if (formData.child?.birthDate) {
      const birthDate = new Date(formData.child.birthDate);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      setCalculatedAge(age);

      if (age !== formData.child.age) {
        updateFormData('child.age', age);
      }
    }
  }, [formData.child?.birthDate, formData.child?.age, updateFormData]);

  const childFormValue: ChildFormValue = {
    name: formData.child?.name ?? '',
    birthDate: formData.child?.birthDate ?? '',
    gender: formData.child?.gender ?? '',
    nationalIdentity: formData.child?.nationalIdentity ?? '',
    otherInfo: formData.child?.otherInfo ?? '',
  };

  const handleChildFormChange = (field: string, value: string) => {
    updateFormData(`child.${field}`, value);
  };

  return (
    <Box mb="6">
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
        Dados da Criança
      </GumroadHeading>

      <ChildForm
        value={childFormValue}
        onChange={handleChildFormChange}
        disabled={disabled}
      />

      {/* Calculated age display */}
      <Box mt="3" style={{ maxWidth: '200px' }}>
        <FastTextField
          name="age"
          label="Idade:"
          type="number"
          initialValue={calculatedAge.toString()}
          disabled={true}
        />
      </Box>
    </Box>
  );
});

export default ChildDataSection;
