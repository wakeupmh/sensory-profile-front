/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';

interface CaregiverDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
}

const CaregiverDataSection: React.FC<CaregiverDataSectionProps> = ({ formData, updateFormData }) => {
  return (
    <div className="form-section">
      <h2 className="section-title">Dados do Cuidador</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="caregiverName">Nome do Cuidador:</label>
          <input
            id="caregiverName"
            className="form-input"
            type="text"
            value={formData.caregiver.name}
            onChange={(e) => updateFormData('caregiver.name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="caregiverRelationship">Relação com a Criança:</label>
          <select
            id="caregiverRelationship"
            className="form-select"
            value={formData.caregiver.relationship}
            onChange={(e) => updateFormData('caregiver.relationship', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="mae">Mãe</option>
            <option value="pai">Pai</option>
            <option value="avo">Avó/Avô</option>
            <option value="tio">Tio/Tia</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="caregiverContact">Contato:</label>
        <input
          id="caregiverContact"
          className="form-input"
          type="text"
          value={formData.caregiver.contact}
          onChange={(e) => updateFormData('caregiver.contact', e.target.value)}
        />
      </div>
    </div>
  );
};

export default CaregiverDataSection;
