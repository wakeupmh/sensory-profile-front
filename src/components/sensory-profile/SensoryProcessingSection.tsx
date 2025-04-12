/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from 'react';
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { Text, Box } from '@radix-ui/themes';

interface SensoryProcessingSectionProps {
  formData: FormData;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  disabled?: boolean;
}

// Componente de seção individual para melhorar a performance
const SensorySection = memo(({ 
  title, 
  sectionKey, 
  items, 
  updateItemResponse, 
  disabled 
}: { 
  title: string; 
  sectionKey: string; 
  items: SensoryItem[]; 
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void; 
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
    </Box>
  );
});

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = memo(({
  formData,
  updateItemResponse,
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
    { title: "Respostas Socioemocionais", key: "socialEmotionalResponses" },
    { title: "Respostas de Atenção", key: "attentionResponses" }
  ];

  return (
    <>
      {sections.map(section => {
        const sectionData = (formData as any)[section.key];
        const items: SensoryItem[] = sectionData?.items || [];

        return (
          <SensorySection
            key={section.key}
            title={section.title}
            sectionKey={section.key}
            items={items}
            updateItemResponse={updateItemResponse}
            disabled={disabled}
          />
        );
      })}
    </>
  );
});

export default SensoryProcessingSection;
