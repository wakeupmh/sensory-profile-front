/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { Text, Box, TextArea } from '@radix-ui/themes';

interface SensoryProcessingSectionProps {
  formData: FormData;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

// Componente de seção individual para melhorar a performance
const SensorySection = memo(({ 
  title, 
  sectionKey, 
  items, 
  comments,
  updateItemResponse, 
  updateComments,
  disabled 
}: { 
  title: string; 
  sectionKey: string; 
  items: SensoryItem[];
  comments: string;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateComments: (section: string, comments: string) => void;
  disabled?: boolean;
}) => {
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
        <Text size="2" weight="bold" mb="1">Comentários:</Text>
        <TextArea 
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

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = memo(({
  formData,
  updateItemResponse,
  updateFormData,
  disabled
}) => {
  // Process all sections
  const sections = [
    { title: "Processamento Auditivo", key: "auditoryProcessing" },
    { title: "Processamento Visual", key: "visualProcessing" },
    { title: "Processamento Tátil", key: "tactileProcessing" },
    { title: "Processamento de Movimento", key: "movementProcessing" },
    { title: "Processamento de Posição do Corpo", key: "bodyPositionProcessing" },
    { title: "Processamento de Sensibilidade Oral", key: "oralSensitivityProcessing" },
    { title: "Conduta associada ao processamento sensorial", key: "conductProcessing" },
    { title: "Respostas Socioemocionais", key: "socialEmotionalResponses" },
    { title: "Respostas de Atenção", key: "attentionResponses" }
  ];

  const handleCommentsChange = (section: string, comments: string) => {
    updateFormData(`${section}.comments`, comments);
  };

  return (
    <>
      {sections.map(section => {
        const sectionData = (formData as any)[section.key];
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

export default SensoryProcessingSection;
