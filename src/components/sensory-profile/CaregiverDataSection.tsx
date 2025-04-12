/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { Text, TextField, Select, Flex, Box } from '@radix-ui/themes';

interface CaregiverDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const CaregiverDataSection: React.FC<CaregiverDataSectionProps> = ({ formData, updateFormData, disabled }) => {
  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados do Cuidador</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3" mt="3">
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Nome do Cuidador:
          </Text>
          <TextField.Root 
            size="2"
            placeholder="Nome do cuidador"
            value={formData.caregiver.name}
            onChange={(e) => updateFormData('caregiver.name', e.target.value)}
            disabled={disabled}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Relação com a Criança:
          </Text><br></br>
          <Select.Root 
            size="2"
            value={formData.caregiver.relationship || "placeholder"} 
            onValueChange={(value) => updateFormData('caregiver.relationship', value === "placeholder" ? "" : value)}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="placeholder">Selecione</Select.Item>
                <Select.Item value="mother">Mãe</Select.Item>
                <Select.Item value="father">Pai</Select.Item>
                <Select.Item value="grandparent">Avó/Avô</Select.Item>
                <Select.Item value="sibling">Irmã/Irmão</Select.Item>
                <Select.Item value="other">Outro</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>
      <Box>
        <Text as="label" size="2" weight="bold" mb="1">
          Contato:
        </Text>
        <TextField.Root 
          size="2"
          placeholder="Telefone ou email"
          value={formData.caregiver.contact}
          onChange={(e) => updateFormData('caregiver.contact', e.target.value)}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default CaregiverDataSection;
