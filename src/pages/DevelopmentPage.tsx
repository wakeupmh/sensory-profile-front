import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { milestoneApi, communicationLogApi } from '../services/api';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { ChildSelector } from '../components/domain/ChildSelector';
import { NoChildrenPage } from '../components/domain/NoChildrenPrompt';
import { ErrorState } from '../components/domain/ErrorState';
import { previewItemStyle, emptyStyle } from '../components/domain/previewStyles';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import MilestonesPanel from '../components/development/MilestonesPanel';
import CommunicationLogsPanel from '../components/development/CommunicationLogsPanel';
import { DomainListSkeleton } from '../components/skeletons/PageSkeletons';

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DevelopmentPage() {
  const { t, i18n } = useTranslation();
  const { children, childrenLoaded, childrenError, reloadChildren, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [milestonesPanelOpen, setMilestonesPanelOpen] = useState(false);
  const [commLogsPanelOpen, setCommLogsPanelOpen] = useState(false);

  const { data, loading, error, reload: fetchAll } = useDomainResource(
    async (token) => {
      const childIdParam = selectedChildId || undefined;
      const [milestonesData, logsData] = await Promise.all([
        milestoneApi.list(token, { childId: childIdParam }),
        communicationLogApi.list(token, { childId: childIdParam, limit: 20, page: 1 }),
      ]);
      return { milestones: milestonesData, commLogs: logsData.data ?? logsData };
    },
    [selectedChildId],
  );

  const milestones = data?.milestones ?? [];
  const commLogs = data?.commLogs ?? [];


  if (childrenLoaded && !childrenError && children.length === 0) {
    return <NoChildrenPage title={t('p1Development.title')} subtitle={t('p1Development.subtitle')} />;
  }
  return (
    <Box>
      {/* Header */}
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            {t('p1Development.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            {t('p1Development.subtitle')}
          </GumroadText>
        </Box>
      </Flex>

      {/* Child filter */}
      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChange={setSelectedChildId}
      />

      {/* Loading state */}
      {loading ? (
        <DomainListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAll} retryLabel={t('p1Common.retry')} />
      ) : childrenError ? (
        <ErrorState message={childrenError} onRetry={reloadChildren} />
      ) : !childrenLoaded ? null : (
        <Flex direction="column" gap="4">
          {/* Marcos do Desenvolvimento */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  {t('p1Development.milestones')}
                </GumroadHeading>
                <GumroadBadge color="cyan">{milestones.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setMilestonesPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                {t('p1Common.manage')}
              </GumroadButton>
            </Flex>
            {children.length > 0 && milestones.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>{t('p1Development.empty')}</p>
            ) : (
              milestones.slice(0, 3).map((m) => (
                <div key={m.id} style={previewItemStyle}>
                  {m.title}
                  {' '}
                  <span
                    style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      fontStyle: 'italic',
                    }}
                  >
                    — {t(`p1Common.milestoneStatus.${m.status}`)}
                  </span>
                </div>
              ))
            )}
          </GumroadCard>

          {/* Registros de Comunicação */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  {t('p1Development.commLogs')}
                </GumroadHeading>
                <GumroadBadge color="lavender">{commLogs.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setCommLogsPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                {t('p1Common.manage')}
              </GumroadButton>
            </Flex>
            {children.length > 0 && commLogs.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>{t('p1Development.empty')}</p>
            ) : (
              commLogs.slice(0, 3).map((log) => (
                <div key={log.id} style={previewItemStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: '9999px',
                      backgroundColor: colors['brand-cyan'],
                      color: colors.ink,
                      fontSize: '11px',
                      fontWeight: 600,
                      marginRight: '6px',
                      border: `1px solid ${colors.ink}`,
                    }}
                  >
                    {t(`p1Common.commType.${log.entryType}`)}
                  </span>
                  {formatDateTime(log.occurredAt, i18n.language)}
                </div>
              ))
            )}
          </GumroadCard>
        </Flex>
      )}

      {/* Panels */}
      <MilestonesPanel
        isOpen={milestonesPanelOpen}
        onClose={() => setMilestonesPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={fetchAll}
        getToken={getTokenRef.current}
      />

      <CommunicationLogsPanel
        isOpen={commLogsPanelOpen}
        onClose={() => setCommLogsPanelOpen(false)}
        childId={effectiveChildId}
        onMutate={fetchAll}
        getToken={getTokenRef.current}
      />
    </Box>
  );
}
