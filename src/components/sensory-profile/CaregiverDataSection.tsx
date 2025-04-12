/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { memo } from 'react';
import { Text, Flex, Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';
import FastSelect from './FastSelect';

interface CaregiverDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const CaregiverDataSection: React.FC<CaregiverDataSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const handleValueChange = (path: string, value: any) => {
    updateFormData(`caregiver.${path}`, value);
  };

  const relationshipOptions = [
    { value: 'mother', label: 'Mãe' },
    { value: 'father', label: 'Pai' },
    { value: 'grandparent', label: 'Avó/Avô' },
    { value: 'sibling', label: 'Irmã/Irmão' },
    { value: 'other', label: 'Outro' }
  ];

  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados do Cuidador</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3" mt="3">
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="name"
            label="Nome do Cuidador:"
            placeholder="Nome do cuidador"
            initialValue={formData.caregiver?.name}
            onValueChange={handleValueChange}
            disabled={disabled}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastSelect
            name="relationship"
            label="Relação com a Criança:"
            options={relationshipOptions}
            initialValue={formData.caregiver?.relationship}
            onValueChange={handleValueChange}
            disabled={disabled}
          />
        </Box>
      </Flex>
      <Box>
        <FastTextField
          name="contact"
          label="Contato:"
          placeholder="Telefone ou e-mail"
          initialValue={formData.caregiver?.contact}
          onValueChange={handleValueChange}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
});

export default CaregiverDataSection;
