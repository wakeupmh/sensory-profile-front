/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';

interface ChildDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
}

const ChildDataSection: React.FC<ChildDataSectionProps> = ({ formData, updateFormData }) => {
  return (
    <div className="form-section">
      <h2 className="section-title">Dados da Criança</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="childName">Nome da Criança:</label>
          <input
            id="childName"
            className="form-input"
            type="text"
            value={formData.child.name}
            onChange={(e) => updateFormData('child.name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="childBirthDate">Data de Nascimento:</label>
          <input
            id="childBirthDate"
            className="form-input"
            type="date"
            value={formData.child.birthDate}
            onChange={(e) => updateFormData('child.birthDate', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="childGender">Gênero:</label>
          <select
            id="childGender"
            className="form-select"
            value={formData.child.gender}
            onChange={(e) => updateFormData('child.gender', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="childOtherInfo">Outras Informações:</label>
          <input
            id="childOtherInfo"
            className="form-input"
            type="text"
            value={formData.child.otherInfo}
            onChange={(e) => updateFormData('child.otherInfo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChildDataSection;
