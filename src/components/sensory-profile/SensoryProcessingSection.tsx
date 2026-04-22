/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { getInstrument } from '../../instruments';
import { Text, Box, TextArea } from '@radix-ui/themes';

interface SensoryProcessingSectionProps {
  formData: FormData;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const SensorySection = memo(({
  title,
  sectionKey,
  items,
  comments,
  updateItemResponse,
  updateComments,
  disabled,
}: {
  title: string;
  sectionKey: string;
  items: SensoryItem[];
  comments: string;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateComments: (section: string, comments: string) => void;
  disabled?: boolean;
}) => {
  const textareaId = `comments-${sectionKey}`;
  return (
    <Box mb="6">
      <Text size="5" weight="bold" mb="3">{title}</Text>
      <SensoryItemsTable
        items={items}
        onResponseChange={(itemId, response) =>
          updateItemResponse(sectionKey, itemId, response)
        }
        disabled={disabled}
      />
      <Box mt="3">
        <Text as="label" htmlFor={textareaId} size="2" weight="bold" mb="1">Comentários:</Text>
        <TextArea
          id={textareaId}
          placeholder="Adicione comentários sobre esta seção"
          value={comments || ''}
          onChange={(e) => updateComments(sectionKey, e.target.value)}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      </Box>
    </Box>
  );
});

SensorySection.displayName = 'SensorySection';

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = memo(({
  formData,
  updateItemResponse,
  updateFormData,
  disabled,
}) => {
  const instrument = getInstrument(formData.instrumentId);

  const handleCommentsChange = (section: string, comments: string) => {
    updateFormData(`sections.${section}.comments`, comments);
  };

  return (
    <>
      {instrument.sections.map((section) => {
        const sectionData = formData.sections?.[section.key];
        const items: SensoryItem[] = sectionData?.items || [];
        const comments: string = sectionData?.comments || '';

        return (
          <SensorySection
            key={section.key}
            title={section.title}
            sectionKey={section.key}
            items={items}
            comments={comments}
            updateItemResponse={updateItemResponse}
            updateComments={handleCommentsChange}
            disabled={disabled}
          />
        );
      })}
    </>
  );
});

SensoryProcessingSection.displayName = 'SensoryProcessingSection';

export default SensoryProcessingSection;
