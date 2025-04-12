/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, Flex, Text, Button, Heading } from '@radix-ui/themes';
import PDFGenerator from '../components/sensory-profile/PDFGenerator';
import ReportContent from '../components/sensory-profile/ReportContent';
import { FormData, SensorySectionKey } from '../components/sensory-profile/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuth } from '@clerk/clerk-react';
import { assessmentApi } from '../services/api';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(id, token);
        
        // Verificar se a resposta está no formato novo ou antigo
        if (response.assessment && response.responses) {
          // Formato novo - transformar para o formato do formulário
          const newFormData: FormData = {
            ...response.assessment,
            child: response.assessment.child || {},
            examiner: response.assessment.examiner || {},
            caregiver: response.assessment.caregiver || {},
            // Inicializar todas as seções
            auditoryProcessing: { items: [] },
            visualProcessing: { items: [] },
            tactileProcessing: { items: [] },
            movementProcessing: { items: [] },
            bodyPositionProcessing: { items: [] },
            oralSensitivityProcessing: { items: [] },
            socialEmotionalResponses: { items: [] },
            attentionResponses: { items: [] }
          };
          
          // Adicionar as respostas às seções correspondentes
          response.responses.forEach((item: any) => {
            const section = item.section as SensorySectionKey;
            if (section) {
              if (!newFormData[section].items) {
                newFormData[section].items = [];
              }
              
              newFormData[section].items.push({
                id: item.itemId,
                description: item.description,
                response: item.response,
                responseId: item.id
              });
            }
          });
          
          setFormData(newFormData);
        } else {
          setFormData(response);
        }
        
      } catch (err: any) {
        console.error('Error fetching assessment:', err);
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar a avaliação. Por favor, tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, getToken]);

  return (
    <Box p="4" width="100%">
      {loading ? (
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando dados..." />
          </Flex>
        </Card>
      ) : notFound ? (
        <NotFound 
          title="Avaliação não encontrada" 
          message="A avaliação que você está procurando não existe ou foi removida."
        />
      ) : error ? (
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <Text color="red">{error}</Text>
            <Button onClick={() => navigate('/')} color='gray'>Voltar</Button>
          </Flex>
        </Card>
      ) : formData ? (
        <Box>
          <Flex justify="between" align="center" mb="6">
            <Heading size="7" color='violet'>
              Relatório de Avaliação
            </Heading>
            <Flex gap="3">
              <PDFGenerator formData={formData} assessmentId={id || ''} />
              <Button onClick={() => navigate(`/assessment/${id}`)} variant="outline" color='gray'>Voltar para Avaliação</Button>
              <Button onClick={() => navigate('/')} variant="outline" color='gray'>Voltar para Home</Button>
            </Flex>
          </Flex>
          
          <Card>
            <Box p="4">
              <ReportContent formData={formData} />
            </Box>
          </Card>
        </Box>
      ) : null}
    </Box>
  );
};

export default ReportPage;
