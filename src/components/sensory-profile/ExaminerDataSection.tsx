/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { memo } from 'react';
import { Text, Flex, Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';

interface ExaminerDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ExaminerDataSection: React.FC<ExaminerDataSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const handleValueChange = (path: string, value: any) => {
    updateFormData(`examiner.${path}`, value);
  };

  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados do Examinador</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="name"
            label="Nome do Examinador:"
            placeholder="Nome do examinador"
            initialValue={formData.examiner?.name}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="profession"
            label="Cargo/Função:"
            placeholder="Cargo ou função"
            initialValue={formData.examiner?.profession}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
      </Flex>
      <Box>
        <FastTextField
          name="contact"
          label="Contato:"
          placeholder="Telefone ou email"
          initialValue={formData.examiner?.contact}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={true}
        />
      </Box>
    </Box>
  );
});

export default ExaminerDataSection;
