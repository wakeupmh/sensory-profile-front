import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { childApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { colors, spacing } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import LoadingSpinner from '../LoadingSpinner';
import TimelineEventCard from './TimelineEventCard';
import type { TimelineEvent } from '../../types/child';

const PAGE_LIMIT = 20;

interface UnifiedTimelineProps {
  childId: string;
}

const UnifiedTimeline: React.FC<UnifiedTimelineProps> = ({ childId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      const token = await getTokenRef.current();
      const result = await childApi.getTimeline(childId, token, { page: pageNum, limit: PAGE_LIMIT });
      setTotal(result.total);
      setPage(result.page);
      if (append) {
        setEvents((prev) => [...prev, ...result.data]);
      } else {
        setEvents(result.data);
      }
    } catch {
      setError('Erro ao carregar linha do tempo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [childId]);

  useEffect(() => {
    setEvents([]);
    setTotal(0);
    setPage(1);
    fetchPage(1, false);
  }, [fetchPage]);

  const handleLoadMore = () => {
    fetchPage(page + 1, true);
  };

  if (loading) {
    return (
      <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
        <LoadingSpinner size="large" text="Carregando linha do tempo..." />
      </GumroadCard>
    );
  }

  if (error) {
    return (
      <GumroadCard color="salmon" shadow="md" padding="md">
        <Flex align="center" gap="2">
          <ExclamationTriangleIcon />
          <GumroadText level="body-md" as="p">{error}</GumroadText>
        </Flex>
      </GumroadCard>
    );
  }

  if (events.length === 0) {
    return (
      <GumroadCard color="cream" shadow="md" padding="lg" style={{ textAlign: 'center' }}>
        <GumroadText level="body-md" as="p" style={{ opacity: 0.7 }}>
          Nenhum evento registrado ainda.
        </GumroadText>
      </GumroadCard>
    );
  }

  return (
    <Box>
      <Flex direction="column" gap="3">
        {events.map((event) => (
          <TimelineEventCard key={event.id} event={event} />
        ))}
      </Flex>

      {events.length < total && (
        <Box style={{ textAlign: 'center', marginTop: spacing.lg }}>
          <GumroadButton
            variant="secondary"
            size="md"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </GumroadButton>
        </Box>
      )}

      <GumroadText level="body-sm" as="p" style={{ opacity: 0.5, textAlign: 'center', marginTop: spacing.sm }}>
        {events.length} de {total} eventos
      </GumroadText>
    </Box>
  );
};

export default UnifiedTimeline;
