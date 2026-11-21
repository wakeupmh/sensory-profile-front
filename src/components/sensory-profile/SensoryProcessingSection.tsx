/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { getInstrument } from '../../instruments';
import { Box, TextArea } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { colors, shadows, radii, typography } from '../../theme/tokens';
import GumroadHeading from '../design-system/GumroadHeading';
import type { InstrumentSection, ResponseScale } from '../../instruments/types';

interface SensoryProcessingSectionProps {
  formData: FormData;
  /** Seções efetivas (instrumentos com seções dinâmicas); padrão: as do instrumento. */
  sections?: InstrumentSection[];
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const SensorySection = memo(({
  title,
  sectionKey,
  items,
  comments,
  rawScore,
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
  rawScore?: number;
  scale?: ResponseScale;
  allowedValues?: string[];
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateComments: (section: string, comments: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  const textareaId = `comments-${sectionKey}`;
  const answered = items.filter((item) => item.response).length;
  return (
    // Só leitura: cada seção começa fechada, com o resumo na linha do título —
    // as 86 perguntas abertas davam ~50 telas de rolagem no celular.
    <Box mb="6" asChild>
      <details open={!disabled}>
      <summary style={{ cursor: 'pointer', listStyle: disabled ? undefined : 'none', marginBottom: '12px' }}>
        <GumroadHeading level="title-lg" as="h3" style={{ display: 'inline' }}>
          {title}
        </GumroadHeading>
        {disabled && (
          <span style={{ display: 'block', fontSize: '14px', opacity: 0.75, marginTop: '4px' }}>
            {t('assessmentForm.sectionSummary', { answered, total: items.length })}
            {rawScore != null ? ` · ${t('assessmentForm.sectionScore', { score: rawScore })}` : ''}
          </span>
        )}
      </summary>
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
        <label htmlFor={textareaId} style={{ fontFamily: typography['title-sm'].font, fontWeight: 600, fontSize: '16px', display: 'block', marginBottom: '6px' }}>
          {t('assessmentForm.comments.label')}
        </label>
        <TextArea
          id={textareaId}
          placeholder={t('assessmentForm.comments.placeholder')}
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
          }}
        />
      </Box>
      </details>
    </Box>
  );
});

SensorySection.displayName = 'SensorySection';

export { SensorySection };

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = memo(({
  formData,
  sections,
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
      {(sections ?? instrument.sections).map((section) => {
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
            rawScore={sectionData?.rawScore}
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
