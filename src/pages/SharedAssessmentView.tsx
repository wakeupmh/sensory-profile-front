/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Separator } from '@radix-ui/themes';
import { ChevronLeftIcon, ExclamationTriangleIcon, FileTextIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedApi } from '../services/api';
import ReportContent from '../components/sensory-profile/ReportContent';
import type { FormData, SensoryItem, SensorySection } from '../components/sensory-profile/types';
import {
  DEFAULT_INSTRUMENT_ID,
  findSectionByItemId,
  getInstrument,
} from '../instruments';
import { toSensoryItems } from '../instruments/types';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing } from '../theme/tokens';

const SharedAssessmentView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const fetchedRef = useRef(false);

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const response = await sharedApi.getAssessment(id, token);

        // The backend may return either `{ assessment, responses }` or a flatter shape.
        const assessment = response.assessment ?? response;
        const responses = response.responses ?? assessment.responses ?? [];

        const instrumentId: string = assessment.instrumentId || DEFAULT_INSTRUMENT_ID;
        const instrument = getInstrument(instrumentId);

        const sections: Record<string, SensorySection> = Object.fromEntries(
          instrument.sections.map((s) => [
            s.key,
            { items: toSensoryItems(s.items) as SensoryItem[], rawScore: 0, comments: '' },
          ]),
        );

        if (Array.isArray(responses)) {
          responses.forEach((r: { itemId: number; response: string; id?: string }) => {
            const sectionKey = findSectionByItemId(instrument, r.itemId);
            if (!sectionKey) return;
            const target = sections[sectionKey].items.find((it) => it.id === r.itemId);
            if (target) {
              target.response = r.response as SensoryItem['response'];
              if (r.id) target.responseId = r.id;
            }
          });
        }

        instrument.sections.forEach((s) => {
          const scoreField = `${s.key}RawScore`;
          if (assessment[scoreField] !== undefined && assessment[scoreField] !== null) {
            sections[s.key].rawScore = assessment[scoreField];
          }
        });

        if (Array.isArray(assessment.sectionComments)) {
          assessment.sectionComments.forEach((c: { section: string; comments: string }) => {
            if (sections[c.section]) sections[c.section].comments = c.comments || '';
          });
        }

        setFormData({
          instrumentId,
          child: {
            name: assessment.childName || '',
            birthDate: assessment.childBirthDate || '',
            gender: assessment.childGender || 'male',
            nationalIdentity: assessment.childNationalIdentity || '',
            otherInfo: assessment.childOtherInfo || '',
            age: assessment.childAge || 0,
          },
          examiner: {
            name: assessment.examinerName || '',
            profession: assessment.examinerProfession || '',
            contact: assessment.examinerContact || '',
          },
          caregiver: {
            name: assessment.caregiverName || '',
            relationship: assessment.caregiverRelationship || '',
            contact: assessment.caregiverContact || '',
          },
          sections,
          createdAt: assessment.createdAt,
        });
        fetchedRef.current = true;
      } catch (err: any) {
        console.error(err);
        const status = err?.response?.status;
        setError(
          status === 404
            ? 'Você não tem acesso a esta avaliação ou ela não existe mais.'
            : 'Não foi possível carregar a avaliação.',
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, getToken]);

  return (
    <Box style={{ maxWidth: 1080, margin: '0 auto' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/shared')}>
          <ChevronLeftIcon /> Voltar
        </GumroadButton>
        <GumroadBadge color="lavender">Compartilhado com você</GumroadBadge>
      </Flex>

      <Flex align="center" gap="2" mb="2">
        <FileTextIcon width={22} height={22} />
        <GumroadHeading level="display-sm" as="h1">
          Avaliação Sensorial
        </GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7, marginBottom: spacing.md }}>
        Visualização somente-leitura do relatório.
      </GumroadText>

      <Separator size="4" mb="4" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando..." />
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">
              {error}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : formData ? (
        <GumroadCard color="white" shadow="md" padding="lg">
          <ReportContent formData={formData} />
        </GumroadCard>
      ) : null}
    </Box>
  );
};

export default SharedAssessmentView;
