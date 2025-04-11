 
import * as React from 'react';
import { useState, FormEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import './SensoryProfile.css';

// Importar componentes
import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection from '../components/sensory-profile/SensoryProcessingSection';
import useFormData from '../components/sensory-profile/useFormData';

const SensoryProfileForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, updateFormData, updateItemResponse } = useFormData();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário enviados:', formData);
    // Aqui você pode implementar a lógica para enviar os dados para o backend
    alert('Formulário enviado com sucesso!');
    setIsOpen(false);
  };

  return (
    <div>
      <button className="form-button primary" onClick={() => setIsOpen(true)}>
        Abrir Perfil Sensorial 2
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">Perfil Sensorial 2</Dialog.Title>
            <Dialog.Close asChild>
              <button className="close-button" aria-label="Fechar">
                <Cross2Icon />
              </button>
            </Dialog.Close>

            <form onSubmit={handleSubmit}>
              <div className="sensory-profile-header">
                <div className="profile-title">
                  <h2>Questionário para Cuidadores</h2>
                  <p>Crianças de 3 a 14 anos de idade</p>
                </div>
                <div className="profile-subtitle">
                  <h3>Winnie Dunn, PhD, OTR, FAOTA</h3>
                  <p>Pearson Clinical Assessment</p>
                  <div className="internal-use-box">
                    Para uso interno
                  </div>
                </div>
              </div>

              <ChildDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
              />
              
              <ExaminerDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
              />
              
              <CaregiverDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
              />
              
              <InstructionsSection />
              
              <SensoryProcessingSection
                title="Processamento Auditivo"
                sectionKey="auditoryProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Processamento Visual"
                sectionKey="visualProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Processamento Tátil"
                sectionKey="tactileProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Processamento de Movimento"
                sectionKey="movementProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Processamento de Posição do Corpo"
                sectionKey="bodyPositionProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Processamento de Sensibilidade Oral"
                sectionKey="oralSensitivityProcessing"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Respostas Socioemocionais"
                sectionKey="socialEmotionalResponses"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />
              
              <SensoryProcessingSection
                title="Respostas de Atenção"
                sectionKey="attentionResponses"
                formData={formData}
                updateItemResponse={updateItemResponse}
                updateFormData={updateFormData}
              />

              <div className="form-buttons">
                <button type="button" className="form-button secondary" onClick={() => setIsOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="form-button primary">
                  Enviar
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default SensoryProfileForm;