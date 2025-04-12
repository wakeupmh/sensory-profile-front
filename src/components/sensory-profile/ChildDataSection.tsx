/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';
import { useEffect, useState, memo } from 'react';
import { Text, Flex, Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';
import FastSelect from './FastSelect';

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

  // Manipulador para atualizar o formData quando os campos mudarem
  const handleValueChange = (path: string, value: any) => {
    updateFormData(`child.${path}`, value);
  };

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' }
  ];

  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">Dados da Criança</Text>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="name"
            label="Nome da Criança:"
            placeholder="Nome completo"
            initialValue={formData.child?.name}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="birthDate"
            label="Data de Nascimento:"
            type="date"
            initialValue={formData.child?.birthDate}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
      </Flex>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <Text as="label" size="2" weight="bold" mb="1">
            Idade:
          </Text>
          <FastTextField
            name="age"
            label=""
            type="number"
            initialValue={calculatedAge.toString()}
            disabled={true}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastSelect
            name="gender"
            label="Gênero:"
            options={genderOptions}
            initialValue={formData.child?.gender}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
      </Flex>
      <Box>
        <FastTextField
          name="otherInfo"
          label="Outras Informações Relevantes:"
          placeholder="Informações adicionais relevantes"
          initialValue={formData.child?.otherInfo}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={false}
        />
      </Box>
    </Box>
  );
});

export default ChildDataSection;
