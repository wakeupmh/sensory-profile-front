/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { FormData } from './types';
import { memo } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';
import FastSelect from './FastSelect';
import GumroadHeading from '../design-system/GumroadHeading';

interface CaregiverDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const CaregiverDataSection: React.FC<CaregiverDataSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const { t } = useTranslation();
  const handleValueChange = (path: string, value: any) => {
    updateFormData(`caregiver.${path}`, value);
  };

  const relationshipOptions = [
    { value: 'mother', label: t('assessmentForm.fields.mother') },
    { value: 'father', label: t('assessmentForm.fields.father') },
    { value: 'grandparent', label: t('assessmentForm.fields.grandparent') },
    { value: 'sibling', label: t('assessmentForm.fields.sibling') },
    { value: 'other', label: t('assessmentForm.fields.other') }
  ];

  return (
    <Box mb="6">
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
        {t('assessmentForm.fields.caregiverData')}
      </GumroadHeading>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3" mt="3">
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="name"
            label={t('assessmentForm.fields.caregiverName')}
            placeholder={t('assessmentForm.fields.caregiverNamePlaceholder')}
            initialValue={formData.caregiver?.name}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastSelect
            name="relationship"
            label={t('assessmentForm.fields.relationship')}
            options={relationshipOptions}
            initialValue={formData.caregiver?.relationship}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
      </Flex>
      <Box>
        <FastTextField
          name="contact"
          label={t('assessmentForm.fields.contact')}
          placeholder={t('assessmentForm.fields.contactPlaceholderCaregiver')}
          initialValue={formData.caregiver?.contact}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={true}
        />
      </Box>
    </Box>
  );
});

export default CaregiverDataSection;
