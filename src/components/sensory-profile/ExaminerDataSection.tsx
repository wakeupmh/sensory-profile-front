/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from './types';

interface ExaminerDataSectionProps {
  formData: FormData;
  updateFormData: (path: string, value: any) => void;
}

const ExaminerDataSection: React.FC<ExaminerDataSectionProps> = ({ formData, updateFormData }) => {
  return (
    <div className="form-section">
      <h2 className="section-title">Dados do Examinador</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="examinerName">Nome do Examinador:</label>
          <input
            id="examinerName"
            className="form-input"
            type="text"
            value={formData.examiner.name}
            onChange={(e) => updateFormData('examiner.name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="examinerProfession">Profissão:</label>
          <input
            id="examinerProfession"
            className="form-input"
            type="text"
            value={formData.examiner.profession}
            onChange={(e) => updateFormData('examiner.profession', e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="examinerContact">Contato:</label>
        <input
          id="examinerContact"
          className="form-input"
          type="text"
          value={formData.examiner.contact}
          onChange={(e) => updateFormData('examiner.contact', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ExaminerDataSection;
