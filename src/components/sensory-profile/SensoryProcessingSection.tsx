/* eslint-disable @typescript-eslint/no-explicit-any */
import SensoryItemsTable from './SensoryItemsTable';
import { FormData, FrequencyResponse, SensoryItem } from './types';

interface SensoryProcessingSectionProps {
  title: string;
  sectionKey: string;
  formData: FormData;
  updateItemResponse: (section: string, itemId: number, response: FrequencyResponse) => void;
  updateFormData: (path: string, value: any) => void;
}

const SensoryProcessingSection: React.FC<SensoryProcessingSectionProps> = ({
  title,
  sectionKey,
  formData,
  updateItemResponse,
  updateFormData
}) => {
  const sectionData = (formData as any)[sectionKey];
  const items: SensoryItem[] = sectionData.items;
  const comments: string = sectionData.comments;
  const rawScore: number = sectionData.rawScore;

  const handleUpdateItemResponse = (itemId: number, response: FrequencyResponse) => {
    updateItemResponse(sectionKey, itemId, response);
  };

  return (
    <div className="sensory-section">
      <h2 className="section-title">{title}</h2>
      <SensoryItemsTable 
        items={items} 
        updateItemResponse={handleUpdateItemResponse} 
      />
      <div className="raw-score-container">
        <label className="form-label">Pontuação Bruta:</label>
        <div className="raw-score-box">{rawScore}</div>
      </div>
      <div className="comments-container">
        <label className="form-label" htmlFor={`${sectionKey}-comments`}>Comentários:</label>
        <textarea
          id={`${sectionKey}-comments`}
          className="comments-textarea"
          value={comments}
          onChange={(e) => updateFormData(`${sectionKey}.comments`, e.target.value)}
        />
      </div>
    </div>
  );
};

export default SensoryProcessingSection;
