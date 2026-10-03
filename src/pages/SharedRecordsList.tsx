import { useCallback, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Separator, Tabs } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import {
  ClipboardIcon,
  FileTextIcon,
  EyeOpenIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { sharedApi } from '../services/api';
import type {
  SharedAnamneseSummary,
  SharedAssessmentSummary,
} from '../types/professionals';
import { getInstrument } from '../instruments';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing } from '../theme/tokens';

const SharedRecordsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [anamneses, setAnamneses] = useState<SharedAnamneseSummary[]>([]);
  const [assessments, setAssessments] = useState<SharedAssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialError, setPartialError] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      // allSettled: uma lista que falha não deve virar "nada compartilhado"
      const [a, b] = await Promise.allSettled([
        sharedApi.listAnamneses(token),
        sharedApi.listAssessments(token),
      ]);
      const anamneseList = a.status === 'fulfilled' ? a.value : [];
      const assessmentList = b.status === 'fulfilled' ? b.value : [];
      const anyFailed = a.status === 'rejected' || b.status === 'rejected';
      // Nada para mostrar e algo falhou: é erro, não "nada compartilhado"
      if (anyFailed && anamneseList.length + assessmentList.length === 0) {
        throw a.status === 'rejected' ? a.reason : (b as PromiseRejectedResult).reason;
      }
      setAnamneses(anamneseList);
      setAssessments(assessmentList);
      setPartialError(anyFailed);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('p2Share.records.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded && session) fetchAll();
  }, [isLoaded, session, fetchAll]);

  const totalShared = anamneses.length + assessments.length;

  return (
    <Box>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          {t('p2Share.records.title')}
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('p2Share.records.subtitle')}
        </GumroadText>
      </Box>

      <Separator size="4" mb="6" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <LoadingSpinner size="large" text={t('p2Share.loading')} />
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="3" wrap="wrap">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">
              {error}
            </GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={fetchAll}>{t('p2Share.retry')}</GumroadButton>
          </Flex>
        </GumroadCard>
      ) : totalShared === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={32} height={32} />
            <Box style={{ textAlign: 'center' }}>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p2Share.records.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                {t('p2Share.records.emptyHint')}
              </GumroadText>
            </Box>
            <GumroadButton variant="secondary" size="md" asChild>
              <Link to="/invite/accept" style={{ textDecoration: 'none' }}>
                {t('p2Share.records.haveCode')}
              </Link>
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <>
        {partialError && (
          <GumroadCard role="alert" color="yellow" shadow="sm" padding="sm" style={{ marginBottom: spacing.md }}>
            <Flex align="center" gap="3" wrap="wrap">
              <ExclamationTriangleIcon />
              <GumroadText level="body-sm" as="span">{t('p2Share.records.partialError')}</GumroadText>
              <GumroadButton variant="secondary" size="sm" onClick={fetchAll}>{t('p2Share.retry')}</GumroadButton>
            </Flex>
          </GumroadCard>
        )}
        <Tabs.Root defaultValue={anamneses.length > 0 ? 'anamneses' : 'assessments'}>
          <Tabs.List>
            <Tabs.Trigger value="anamneses">
              {t('p2Share.records.anamneses')}
              <GumroadBadge color="cream" style={{ marginLeft: 8 }}>
                {anamneses.length}
              </GumroadBadge>
            </Tabs.Trigger>
            <Tabs.Trigger value="assessments">
              {t('p2Share.records.assessments')}
              <GumroadBadge color="cream" style={{ marginLeft: 8 }}>
                {assessments.length}
              </GumroadBadge>
            </Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="anamneses">
              {anamneses.length === 0 ? (
                <GumroadCard color="cream" shadow="sm" padding="md">
                  <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                    {t('p2Share.records.noAnamneses')}
                  </GumroadText>
                </GumroadCard>
              ) : (
                <Flex direction="column" gap="3">
                  {anamneses.map((a) => (
                    <SharedRow
                      key={a.id}
                      title={a.title || t('p2Share.records.anamnese')}
                      to={`/shared/anamnese/${a.id}`}
                      icon={<ClipboardIcon />}
                      meta={t('p2Share.records.meta', { created: formatDate(a.createdAt, i18n.language), shared: formatDate(a.grantedAt, i18n.language) })}
                    />
                  ))}
                </Flex>
              )}
            </Tabs.Content>

            <Tabs.Content value="assessments">
              {assessments.length === 0 ? (
                <GumroadCard color="cream" shadow="sm" padding="md">
                  <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                    {t('p2Share.records.noAssessments')}
                  </GumroadText>
                </GumroadCard>
              ) : (
                <Flex direction="column" gap="3">
                  {assessments.map((a) => {
                    const instrumentLabel = a.instrumentId ? getInstrument(a.instrumentId).shortName : null;
                    return (
                      <SharedRow
                        key={a.id}
                        title={a.childName || t('p2Share.records.assessment')}
                        to={`/shared/assessment/${a.id}`}
                        icon={<FileTextIcon />}
                        meta={t('p2Share.records.meta', { created: formatDate(a.createdAt, i18n.language), shared: formatDate(a.grantedAt, i18n.language) })}
                        badge={instrumentLabel}
                      />
                    );
                  })}
                </Flex>
              )}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
        </>
      )}
    </Box>
  );
};

const formatDate = (iso: string, lang: string): string => {
  try {
    return new Date(iso).toLocaleDateString(lang);
  } catch {
    return iso;
  }
};

const SharedRow: React.FC<{
  title: string;
  to: string;
  icon: React.ReactNode;
  meta: string;
  badge?: string | null;
}> = ({ title, to, icon, meta, badge }) => {
  const { t } = useTranslation();
  return (
  <GumroadCard color="white" shadow="md" padding="md">
    <Flex
      justify="between"
      align={{ initial: 'start', sm: 'center' }}
      gap="3"
      direction={{ initial: 'column', sm: 'row' }}
    >
      <Flex align="center" gap="3" style={{ minWidth: 0 }}>
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: colors['surface-cream'],
            border: `2px solid ${colors.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
          <GumroadHeading level="title-sm" as="h3">
            {title}
          </GumroadHeading>
          <GumroadText level="caption" as="span" color={colors.ink} style={{ opacity: 0.65 }}>
            {meta}
          </GumroadText>
        </Flex>
      </Flex>
      <Flex gap="2" align="center" wrap="wrap">
        {badge && <GumroadBadge color="lavender">{badge}</GumroadBadge>}
        <GumroadButton variant="primary" size="sm" asChild>
          <Link to={to} aria-label={t('p2Share.records.openAria', { title })} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <EyeOpenIcon />
            {t('p2Share.records.open')}
          </Link>
        </GumroadButton>
      </Flex>
    </Flex>
  </GumroadCard>
  );
};

export default SharedRecordsList;
