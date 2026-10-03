/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import PDFGenerator from '../components/sensory-profile/PDFGenerator';
import ReportContent from '../components/sensory-profile/ReportContent';
import { FormData } from '../components/sensory-profile/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';
import { useAuthContext } from '../context/AuthContext';
import { assessmentApi } from '../services/api';
import { DEFAULT_INSTRUMENT_ID, getInstrument } from '../instruments';
import { buildSectionsFromResponses } from '../components/sensory-profile/buildSections';

import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;

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

          const { sections, sectionKeys } = buildSectionsFromResponses(instrument, response.responses);

          sectionKeys.forEach((key) => {
            const scoreField = `${key}RawScore`;
            if (response.assessment[scoreField] !== undefined && response.assessment[scoreField] !== null) {
              sections[key].rawScore = response.assessment[scoreField];
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
            scoresJson: response.assessment.scores_json ?? response.assessment.scoresJson ?? undefined,
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
          setError(tRef.current('assessmentReport.page.loadError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssessment();
    return () => { cancelled = true; };
  }, [id, getToken]);

  return (
    <Box width="100%">
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text={t('assessmentForm.loading')} />
          </Flex>
        </GumroadCard>
      ) : notFound ? (
        <NotFound
          title={t('assessmentForm.notFound.title')}
          message={t('assessmentForm.notFound.message')}
        />
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="xl">
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <GumroadText level="body-md" as="p">{error}</GumroadText>
            <GumroadButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
              {t('assessmentForm.buttons.back')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : formData ? (
        <Box>
          <Flex
            justify="between"
            align={{ initial: 'start', sm: 'center' }}
            mb="6"
            gap="4"
            direction={{ initial: 'column', sm: 'row' }}
          >
            <GumroadHeading level="display-sm" as="h1">
              {t('assessmentReport.title')}
            </GumroadHeading>
            <Flex gap="3" wrap="wrap">
              <PDFGenerator formData={formData} assessmentId={id || ''} />
              <GumroadButton variant="secondary" size="sm" onClick={() => navigate(`/assessment/${id}`)}>
                {t('assessmentReport.page.backToAssessment')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                {t('assessmentReport.page.backToHome')}
              </GumroadButton>
            </Flex>
          </Flex>

          <GumroadCard color="white" shadow="md" padding="lg">
            <ReportContent formData={formData} assessmentId={id} />
          </GumroadCard>
        </Box>
      ) : null}
    </Box>
  );
};

export default ReportPage;
