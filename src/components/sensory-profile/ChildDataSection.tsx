/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { useEffect, useState } from 'react';
import { Text, TextField, Select, Flex, Box } from '@radix-ui/themes';

interface ChildDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ChildDataSection: React.FC<ChildDataSectionProps> = ({ formData, updateFormData, disabled }) => {
  const [calculatedAge, setCalculatedAge] = useState<number>(0);

  useEffect(() => {
    if (formData.child.birthDate) {
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
  }, [formData.child.birthDate, formData.child.age, updateFormData]);

  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados da Criança</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Nome da Criança:
          </Text>
          <TextField.Root 
            size="2"
            placeholder="Nome completo"
            value={formData.child.name}
            onChange={(e) => updateFormData('child.name', e.target.value)}
            disabled={disabled}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Gênero:
          </Text><br></br>
          <Select.Root 
            size="2"
            value={formData.child.gender || "placeholder"} 
            onValueChange={(value) => updateFormData('child.gender', value === "placeholder" ? "" : value)}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Group>
                <Select.Item value="placeholder">Selecione</Select.Item>
                <Select.Item value="male">Masculino</Select.Item>
                <Select.Item value="female">Feminino</Select.Item>
                <Select.Item value="other">Outro</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Box>
      </Flex>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Data de Nascimento:
          </Text>
          <TextField.Root 
            size="2"
            type="date"
            value={formData.child.birthDate}
            onChange={(e) => updateFormData('child.birthDate', e.target.value)}
            disabled={disabled}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Idade (anos):
          </Text>
          <TextField.Root 
            size="2"
            type="number"
            value={calculatedAge.toString()}
            onChange={(e) => updateFormData('child.age', parseInt(e.target.value))}
            disabled={disabled || !!formData.child.birthDate}
          />
        </Box>
      </Flex>
      <Box>
        <Text as="label" size="2" weight="bold" mb="1">
          Outras Informações:
        </Text>
        <TextField.Root 
          size="2"
          placeholder="Informações adicionais relevantes"
          value={formData.child.otherInfo || ''}
          onChange={(e) => updateFormData('child.otherInfo', e.target.value)}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default ChildDataSection;
