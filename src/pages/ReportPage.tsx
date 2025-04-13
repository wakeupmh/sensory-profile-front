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
          // Import item data to get descriptions
          import('../components/sensory-profile/itemsData').then((itemsModule) => {
            // Create a map of all items by ID for quick lookup
            const allItems = [
              ...itemsModule.auditoryProcessingItems,
              ...itemsModule.visualProcessingItems,
              ...itemsModule.tactileProcessingItems,
              ...itemsModule.movementProcessingItems,
              ...itemsModule.bodyPositionProcessingItems,
              ...itemsModule.oralSensitivityProcessingItems,
              ...itemsModule.socialEmotionalResponsesItems,
              ...itemsModule.attentionResponsesItems
            ];
            
            const itemsById = new Map();
            allItems.forEach(item => {
              itemsById.set(item.id, item);
            });
            
            // Map responses to their respective sections
            const responsesBySection: Record<string, any[]> = {
              auditoryProcessing: [],
              visualProcessing: [],
              tactileProcessing: [],
              movementProcessing: [],
              bodyPositionProcessing: [],
              oralSensitivityProcessing: [],
              socialEmotionalResponses: [],
              attentionResponses: []
            };
            
            // Map item IDs to their sections
            const sectionRanges = [
              { start: 1, end: 8, section: 'auditoryProcessing' },
              { start: 9, end: 19, section: 'visualProcessing' },
              { start: 20, end: 37, section: 'tactileProcessing' },
              { start: 38, end: 53, section: 'movementProcessing' },
              { start: 54, end: 65, section: 'bodyPositionProcessing' },
              { start: 66, end: 77, section: 'oralSensitivityProcessing' },
              { start: 78, end: 85, section: 'socialEmotionalResponses' },
              { start: 86, end: 92, section: 'attentionResponses' }
            ];
            
            // Function to determine which section an item belongs to
            const getSectionForItemId = (itemId: number) => {
              const range = sectionRanges.find(r => itemId >= r.start && itemId <= r.end);
              return range ? range.section : null;
            };
            
            // Process each response and add it to the appropriate section
            response.responses.forEach((responseItem: any) => {
              const itemId = responseItem.itemId;
              const section = getSectionForItemId(itemId);
              
              if (section && responsesBySection[section]) {
                const originalItem = itemsById.get(itemId);
                
                responsesBySection[section].push({
                  id: itemId,
                  quadrant: originalItem?.quadrant || '',
                  description: originalItem?.description || `Item ${itemId}`,
                  response: responseItem.response,
                  responseId: responseItem.id
                });
              }
            });
            
            // Create the form data structure with the assessment data and responses
            const newFormData: FormData = {
              child: {
                name: response.assessment.childName || '',
                birthDate: response.assessment.childBirthDate || '',
                gender: response.assessment.childGender || '',
                otherInfo: response.assessment.childOtherInfo || '',
                age: response.assessment.childAge || 0
              },
              examiner: {
                name: response.assessment.examinerName || '',
                profession: response.assessment.examinerProfession || '',
                contact: response.assessment.examinerContact || ''
              },
              caregiver: {
                name: response.assessment.caregiverName || '',
                relationship: response.assessment.caregiverRelationship || '',
                contact: response.assessment.caregiverContact || ''
              },
              auditoryProcessing: { 
                items: responsesBySection.auditoryProcessing,
                rawScore: response.assessment.auditoryProcessingRawScore || 0
              },
              visualProcessing: { 
                items: responsesBySection.visualProcessing,
                rawScore: response.assessment.visualProcessingRawScore || 0
              },
              tactileProcessing: { 
                items: responsesBySection.tactileProcessing,
                rawScore: response.assessment.tactileProcessingRawScore || 0
              },
              movementProcessing: { 
                items: responsesBySection.movementProcessing,
                rawScore: response.assessment.movementProcessingRawScore || 0
              },
              bodyPositionProcessing: { 
                items: responsesBySection.bodyPositionProcessing,
                rawScore: response.assessment.bodyPositionProcessingRawScore || 0
              },
              oralSensitivityProcessing: { 
                items: responsesBySection.oralSensitivityProcessing,
                rawScore: response.assessment.oralSensitivityProcessingRawScore || 0
              },
              socialEmotionalResponses: { 
                items: responsesBySection.socialEmotionalResponses,
                rawScore: response.assessment.socialEmotionalResponsesRawScore || 0
              },
              attentionResponses: { 
                items: responsesBySection.attentionResponses,
                rawScore: response.assessment.attentionResponsesRawScore || 0
              },
              createdAt: response.assessment.createdAt,
              id: response.assessment.id
            };
            
            setFormData(newFormData);
            setLoading(false);
          });
        } else {
          setFormData(response);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching assessment:', err);
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar a avaliação. Por favor, tente novamente.');
        }
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
