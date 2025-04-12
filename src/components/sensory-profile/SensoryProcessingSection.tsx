/* eslint-disable @typescript-eslint/no-explicit-any */
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';
import { Text, Box } from '@radix-ui/themes';

interface SensoryProcessingSectionProps {
  formData: FormData;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  disabled?: boolean;
}

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = ({
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
          <Box key={section.key} mb="6">
            <Text size="5" weight="bold" mb="3">{section.title}</Text>
            <SensoryItemsTable
              items={items}
              onResponseChange={(itemId, response) => 
                updateItemResponse(section.key, itemId, response)
              }
              disabled={disabled}
            />
          </Box>
        );
      })}
    </>
  );
};

export default SensoryProcessingSection;
