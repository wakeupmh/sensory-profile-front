/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { Text, TextField, Flex, Box } from '@radix-ui/themes';

interface ExaminerDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ExaminerDataSection: React.FC<ExaminerDataSectionProps> = ({ formData, updateFormData, disabled }) => {
  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados do Examinador</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Nome do Examinador:
          </Text>
          <TextField.Root 
            size="2"
            placeholder="Nome do examinador"
            value={formData.examiner.name}
            onChange={(e) => updateFormData('examiner.name', e.target.value)}
            disabled={disabled}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Cargo/Função:
          </Text>
          <TextField.Root 
            size="2"
            placeholder="Cargo ou função"
            value={formData.examiner.profession}
            onChange={(e) => updateFormData('examiner.profession', e.target.value)}
            disabled={disabled}
          />
        </Box>
      </Flex>
      <Box>
        <Text as="label" size="2" weight="bold" mb="1">
          Contato:
        </Text>
        <TextField.Root 
          size="2"
          placeholder="Telefone ou email"
          value={formData.examiner.contact}
          onChange={(e) => updateFormData('examiner.contact', e.target.value)}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default ExaminerDataSection;
