import { useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import {
  InfoCircledIcon,
  PlusIcon,
  HeartIcon,
} from '@radix-ui/react-icons';
import { therapyApi, therapistApi } from '../services/api';
import type {
  TherapyType,
  CreateSessionPayload,
  CreateTherapistPayload,
} from '../types/therapy';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { ChildSelector } from '../components/domain/ChildSelector';
import { FilterPill } from '../components/domain/FilterPill';
import { ErrorState } from '../components/domain/ErrorState';
import { colors, spacing, shadows } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import QuickSessionSheet from '../components/therapy/QuickSessionSheet';
import TherapistsPanel from '../components/therapy/TherapistsPanel';
import { DomainListSkeleton } from '../components/skeletons/PageSkeletons';

type BadgeColor = 'salmon' | 'yellow' | 'lavender' | 'mint' | 'cyan';

const THERAPY_TYPE_COLORS: Record<TherapyType, BadgeColor> = {
  aba: 'salmon',
  ot: 'cyan',
  fonoaudiologia: 'lavender',
  psicologia: 'yellow',
  fisioterapia: 'mint',
};

const THERAPY_TYPE_LABELS: Record<TherapyType, string> = {
  aba: 'ABA',
  ot: 'OT',
  fonoaudiologia: 'Fono',
  psicologia: 'Psico',
  fisioterapia: 'Fisio',
};

type FilterType = 'all' | TherapyType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'aba', label: 'ABA' },
  { value: 'ot', label: 'OT' },
  { value: 'fonoaudiologia', label: 'Fonoaudiologia' },
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
];

function formatOccurredAt(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TherapyPage() {
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [therapistsPanelOpen, setTherapistsPanelOpen] = useState(false);

  const sessionsResource = useDomainResource(
    async (token) => {
      const params = {
        ...(selectedChildId ? { childId: selectedChildId } : {}),
        ...(filter !== 'all' ? { therapyType: filter } : {}),
      };
      const result = await therapyApi.getSessions(token, params);
      return result.data;
    },
    [selectedChildId, filter],
    { errorMessage: 'Erro ao carregar sessões. Por favor, tente novamente.' },
  );

  // A lista de terapeutas alimenta os seletores dos painéis. Falhar aqui nunca
  // foi fatal para a página, então o erro deste recurso não é lido — só a
  // busca das sessões manda na tela.
  const therapistsResource = useDomainResource((token) => therapistApi.list(token), []);

  const sessions = sessionsResource.data ?? [];
  const therapists = therapistsResource.data ?? [];
  const loading = sessionsResource.loading;
  const error = sessionsResource.error;
  const fetchSessions = sessionsResource.reload;
  const fetchTherapists = therapistsResource.reload;

  const handleCreateSession = async (payload: CreateSessionPayload) => {
    const token = await getTokenRef.current();
    await therapyApi.createSession(token, payload);
    await fetchSessions();
  };

  const handleAddTherapist = async (payload: CreateTherapistPayload) => {
    const token = await getTokenRef.current();
    await therapistApi.create(token, payload);
    await fetchTherapists();
  };

  const handleUpdateTherapist = async (id: string, payload: Partial<CreateTherapistPayload>) => {
    const token = await getTokenRef.current();
    await therapistApi.update(token, id, payload);
    await fetchTherapists();
  };

  const handleDeleteTherapist = async (id: string) => {
    const token = await getTokenRef.current();
    await therapistApi.delete(token, id);
    await fetchTherapists();
  };

  function findTherapistName(therapistId: string | null): string | null {
    if (!therapistId) return null;
    return therapists.find((t) => t.id === therapistId)?.name ?? null;
  }

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Sessões de Terapia
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Acompanhe as terapias da criança
          </GumroadText>
        </Box>
        <GumroadButton
          variant="secondary"
          size="sm"
          onClick={() => setTherapistsPanelOpen(true)}
        >
          <HeartIcon />
          Terapeutas
        </GumroadButton>
      </Flex>

      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChange={setSelectedChildId}
      />

      <Flex align="center" gap="2" mb="5" wrap="wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <FilterPill
            key={value}
            active={filter === value}
            label={label}
            onClick={() => setFilter(value)}
          />
        ))}
      </Flex>

      {loading ? (
        <DomainListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSessions} />
      ) : children.length > 0 && sessions.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma sessão encontrada
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Registre as sessões de terapia da criança
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={() => setSheetOpen(true)}>
              <PlusIcon />
              Registrar sessão
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {sessions.map((session) => {
            const therapistName = findTherapistName(session.therapistId);
            return (
              <GumroadCard key={session.id} color="white" shadow="md" padding="md">
                <Flex justify="between" align="start" gap="2">
                  <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                    <GumroadText
                      level="body-sm"
                      as="p"
                      style={{ opacity: 0.6, fontSize: '12px' }}
                    >
                      {formatOccurredAt(session.occurredAt)}
                    </GumroadText>
                    <GumroadText
                      level="body-md"
                      as="p"
                      style={
                        therapistName
                          ? {}
                          : { fontStyle: 'italic', opacity: 0.5 }
                      }
                    >
                      {therapistName ?? 'Sem terapeuta'}
                    </GumroadText>
                    {session.durationMinutes != null && (
                      <GumroadText
                        level="body-sm"
                        as="p"
                        style={{ opacity: 0.55, fontSize: '12px' }}
                      >
                        {session.durationMinutes} min
                      </GumroadText>
                    )}
                    {session.notes && (
                      <GumroadText
                        level="body-sm"
                        as="p"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {session.notes.length > 80
                          ? session.notes.slice(0, 80) + '…'
                          : session.notes}
                      </GumroadText>
                    )}
                  </Flex>
                  <GumroadBadge color={THERAPY_TYPE_COLORS[session.therapyType]}>
                    {THERAPY_TYPE_LABELS[session.therapyType]}
                  </GumroadBadge>
                </Flex>
              </GumroadCard>
            );
          })}
        </Flex>
      )}

      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Nova sessão"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '9999px',
          backgroundColor: colors.ink,
          color: colors.canvas,
          border: `2px solid ${colors.ink}`,
          boxShadow: shadows.card,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          fontSize: '28px',
          lineHeight: 1,
          fontWeight: 700,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0px #0A0A1A';
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
        }}
      >
        +
      </button>

      <QuickSessionSheet
        isOpen={sheetOpen && !!effectiveChildId}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCreateSession}
        childId={effectiveChildId}
        therapists={therapists}
      />

      <TherapistsPanel
        isOpen={therapistsPanelOpen}
        onClose={() => setTherapistsPanelOpen(false)}
        therapists={therapists}
        onAdd={handleAddTherapist}
        onUpdate={handleUpdateTherapist}
        onDelete={handleDeleteTherapist}
      />
    </Box>
  );
}
