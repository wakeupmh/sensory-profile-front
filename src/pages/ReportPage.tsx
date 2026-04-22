/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, Flex, Text, Button, Heading } from '@radix-ui/themes';
import PDFGenerator from '../components/sensory-profile/PDFGenerator';
import ReportContent from '../components/sensory-profile/ReportContent';
import { FormData, SensoryItem, SensorySection } from '../components/sensory-profile/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuth } from '@clerk/clerk-react';
import { assessmentApi } from '../services/api';
import {
  DEFAULT_INSTRUMENT_ID,
  findSectionByItemId,
  getInstrument,
} from '../instruments';
import { toSensoryItems } from '../instruments/types';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAssessment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await assessmentApi.getAssessmentById(id, token);
        if (cancelled) return;

        if (response.assessment && response.responses) {
          const instrumentId: string = response.assessment.instrumentId || DEFAULT_INSTRUMENT_ID;
          const instrument = getInstrument(instrumentId);

          const sections: Record<string, SensorySection> = Object.fromEntries(
            instrument.sections.map((s) => [
              s.key,
              { items: toSensoryItems(s.items) as SensoryItem[], rawScore: 0, comments: '' },
            ]),
          );

          response.responses.forEach((r: { itemId: number; response: string; id?: string }) => {
            const sectionKey = findSectionByItemId(instrument, r.itemId);
            if (!sectionKey) return;
            const target = sections[sectionKey].items.find((it) => it.id === r.itemId);
            if (target) {
              target.response = r.response as SensoryItem['response'];
              if (r.id) target.responseId = r.id;
            }
          });

          instrument.sections.forEach((s) => {
            const scoreField = `${s.key}RawScore`;
            if (response.assessment[scoreField] !== undefined && response.assessment[scoreField] !== null) {
              sections[s.key].rawScore = response.assessment[scoreField];
            }
          });

          if (Array.isArray(response.assessment.sectionComments)) {
            response.assessment.sectionComments.forEach((c: { section: string; comments: string }) => {
              if (sections[c.section]) sections[c.section].comments = c.comments || '';
            });
          }

          setFormData({
            instrumentId,
            child: {
              name: response.assessment.childName || '',
              birthDate: response.assessment.childBirthDate || '',
              gender: response.assessment.childGender || 'male',
              nationalIdentity: response.assessment.childNationalIdentity || '',
              otherInfo: response.assessment.childOtherInfo || '',
              age: response.assessment.childAge || 0,
            },
            examiner: {
              name: response.assessment.examinerName || '',
              profession: response.assessment.examinerProfession || '',
              contact: response.assessment.examinerContact || '',
            },
            caregiver: {
              name: response.assessment.caregiverName || '',
              relationship: response.assessment.caregiverRelationship || '',
              contact: response.assessment.caregiverContact || '',
            },
            sections,
            createdAt: response.assessment.createdAt,
          });
        } else {
          setFormData({
            instrumentId: response.instrumentId || DEFAULT_INSTRUMENT_ID,
            ...response,
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('Error fetching assessment:', err);
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar a avaliação. Por favor, tente novamente.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssessment();
    return () => { cancelled = true; };
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
            <Button onClick={() => navigate('/')} color="gray">Voltar</Button>
          </Flex>
        </Card>
      ) : formData ? (
        <Box>
          <Flex justify="between" align="center" mb="6">
            <Heading size="7" color="violet">Relatório de Avaliação</Heading>
            <Flex gap="3">
              <PDFGenerator formData={formData} assessmentId={id || ''} />
              <Button onClick={() => navigate(`/assessment/${id}`)} variant="outline" color="gray">Voltar para Avaliação</Button>
              <Button onClick={() => navigate('/')} variant="outline" color="gray">Voltar para Home</Button>
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
