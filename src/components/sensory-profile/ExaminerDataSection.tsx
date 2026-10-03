/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTranslation } from 'react-i18next';
import { FormData } from './types';
import { memo } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import FastTextField from './FastTextField';
import GumroadHeading from '../design-system/GumroadHeading';

interface ExaminerDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const ExaminerDataSection: React.FC<ExaminerDataSectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const { t } = useTranslation();
  const handleValueChange = (path: string, value: any) => {
    updateFormData(`examiner.${path}`, value);
  };

  return (
    <Box mb="6">
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
        {t('assessmentForm.fields.examinerData')}
      </GumroadHeading>
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} mb="3">
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="name"
            label={t('assessmentForm.fields.examinerName')}
            placeholder={t('assessmentForm.fields.examinerNamePlaceholder')}
            initialValue={formData.examiner?.name}
            onValueChange={handleValueChange}
            disabled={disabled}
            required={true}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <FastTextField
            name="profession"
            label={t('assessmentForm.fields.profession')}
            placeholder={t('assessmentForm.fields.professionPlaceholder')}
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
          label={t('assessmentForm.fields.contact')}
          placeholder={t('assessmentForm.fields.contactPlaceholder')}
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
