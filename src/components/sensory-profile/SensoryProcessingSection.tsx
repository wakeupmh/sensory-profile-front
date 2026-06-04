/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { getInstrument } from '../../instruments';
import { Box, TextArea } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';
import GumroadHeading from '../design-system/GumroadHeading';
import type { ResponseScale } from '../../instruments/types';

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
  scale,
  allowedValues,
  updateItemResponse,
  updateComments,
  disabled,
}: {
  title: string;
  sectionKey: string;
  items: SensoryItem[];
  comments: string;
  scale?: ResponseScale;
  allowedValues?: string[];
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateComments: (section: string, comments: string) => void;
  disabled?: boolean;
}) => {
  const textareaId = `comments-${sectionKey}`;
  return (
    <Box mb="6">
      <GumroadHeading level="title-lg" as="h3" style={{ marginBottom: '12px' }}>
        {title}
      </GumroadHeading>
      <SensoryItemsTable
        items={items}
        scale={scale}
        allowedValues={allowedValues}
        onResponseChange={(itemId, response) =>
          updateItemResponse(sectionKey, itemId, response)
        }
        disabled={disabled}
      />
      <Box mt="3">
        <label htmlFor={textareaId} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px', display: 'block', marginBottom: '6px' }}>
          Comentários:
        </label>
        <TextArea
          id={textareaId}
          placeholder="Adicione comentários sobre esta seção"
          value={comments || ''}
          onChange={(e) => updateComments(sectionKey, e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            backgroundColor: colors.canvas,
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            boxShadow: shadows.input,
            padding: '12px 16px',
            fontFamily: typography['body-md'].font,
            fontSize: typography['body-md'].size,
            outline: 'none',
          }}
        />
      </Box>
    </Box>
  );
});

SensorySection.displayName = 'SensorySection';

export { SensorySection };

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
            scale={instrument.scale}
            allowedValues={section.allowedValues}
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
