 import * as React from 'react';
import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi } from '../services/api';

import ChildDataSection from '../components/sensory-profile/ChildDataSection';
import ExaminerDataSection from '../components/sensory-profile/ExaminerDataSection';
import CaregiverDataSection from '../components/sensory-profile/CaregiverDataSection';
import InstructionsSection from '../components/sensory-profile/InstructionsSection';
import SensoryProcessingSection from '../components/sensory-profile/SensoryProcessingSection';
import useFormData from '../components/sensory-profile/useFormData';
import { Button, Flex, Text, Box, Card, Heading } from '@radix-ui/themes';

const SensoryProfileForm: React.FC = () => {
  const { formData, updateFormData, updateItemResponse, setFormData } = useFormData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isViewMode = !!id && !location.pathname.includes('/edit') && !location.pathname.includes('/report');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isReportMode = !!id && location.pathname.includes('/report');
  const isNewMode = !id;

  useEffect(() => {
    // If we have an ID and we're not in new mode, fetch the assessment data
    if (id && !isNewMode) {
      const fetchAssessment = async () => {
        try {
          setLoading(true);
          const data = await assessmentApi.getAssessmentById(id);
          setFormData(data);
          setError(null);
        } catch (err) {
          setError('Erro ao carregar avaliação. Por favor, tente novamente.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchAssessment();
    }
  }, [id, isNewMode, setFormData]);

  useEffect(() => {
    // If we're in report mode, fetch the report
    if (id && isReportMode) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          await assessmentApi.generateReport(id);
          // Handle report data as needed
          setError(null);
        } catch (err) {
          setError('Erro ao gerar relatório. Por favor, tente novamente.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchReport();
    }
  }, [id, isReportMode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isNewMode) {
        await assessmentApi.createAssessment(formData);
        alert('Avaliação criada com sucesso!');
      } else if (isEditMode && id) {
        await assessmentApi.updateAssessment(id, formData);
        alert('Avaliação atualizada com sucesso!');
      }
      
      navigate('/');
    } catch (err) {
      setError('Erro ao salvar avaliação. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const getTitle = () => {
    if (isNewMode) return 'Nova Avaliação';
    if (isEditMode) return 'Editar Avaliação';
    if (isReportMode) return 'Relatório de Avaliação';
    return 'Visualizar Avaliação';
  };

  return (
    <Box style={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '-24px', 
      paddingTop: '0',
      zIndex: 0 
    }}>
      <Card size="2" style={{ 
        width: '100%',
        flex: 1,
        margin: 0,
        borderRadius: '0',
        border: 'none'
      }}>
        <Box pt="2" p="4" onSubmit={handleSubmit}>
          <Heading size="6" mb="4">{getTitle()}</Heading>
          
          {loading ? (
            <Text size="2" mb="4">Carregando...</Text>
          ) : error ? (
            <Text size="2" mb="4" color="crimson">{error}</Text>
          ) : (
            <Box style={{ width: '100%' }}>
              <Flex direction="column" gap="3" mb="4" justify="between">
                <Text size="5" weight="bold">Questionário para Cuidadores</Text>
                <Text size="2">Crianças de 3 a 14 anos de idade</Text>
                <Text size="2">Perfil Sensorial 2</Text>
              </Flex>

              <ChildDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
                disabled={isViewMode || isReportMode}
              />
              
              <ExaminerDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
                disabled={isViewMode || isReportMode}
              />
              
              <CaregiverDataSection 
                formData={formData} 
                updateFormData={updateFormData} 
                disabled={isViewMode || isReportMode}
              />
              
              <InstructionsSection />
              
              <SensoryProcessingSection 
                formData={formData} 
                updateItemResponse={updateItemResponse} 
                disabled={isViewMode || isReportMode}
              />

              <Flex gap="3" mt="4" justify="end">
                {!isViewMode && !isReportMode && (
                  <>
                    <Button variant="soft" color="gray" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {isNewMode ? 'Criar Avaliação' : 'Salvar Alterações'}
                    </Button>
                  </>
                )}

                {(isViewMode || isReportMode) && (
                  <>
                    <Button variant="soft" color="gray" onClick={handleClose}>
                      Voltar
                    </Button>
                    {isViewMode && (
                      <Button onClick={() => navigate(`/assessment/${id}/edit`)}>
                        Editar
                      </Button>
                    )}
                  </>
                )}
              </Flex>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default SensoryProfileForm;