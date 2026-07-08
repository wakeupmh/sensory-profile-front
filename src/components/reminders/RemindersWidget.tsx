import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { CalendarIcon, CheckIcon, Cross2Icon, ExclamationTriangleIcon, PlusIcon } from '@radix-ui/react-icons';
import { reminderApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { CreateReminderPayload, UpcomingReminder } from '../../types/reminders';
import { REMINDER_ORIGIN_ICONS, REMINDER_ORIGIN_LABELS } from '../../types/reminders';
import { colors, radii, shadows } from '../../theme/tokens';
import { generateICS, downloadICS, dateOnlyFromISOString } from '../../utils/ics';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import LoadingSpinner from '../LoadingSpinner';
import CreateReminderModal from './CreateReminderModal';

interface RemindersWidgetProps {
  childId: string;
  days?: number;
}

function formatDueAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const RemindersWidget: React.FC<RemindersWidgetProps> = ({ childId, days = 14 }) => {
  const { getToken } = useAuthContext();
  const [reminders, setReminders] = useState<UpcomingReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await reminderApi.getUpcoming(token, childId, days);
      setReminders(data);
    } catch {
      setError('Erro ao carregar lembretes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [childId, days, getToken]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const sorted = useMemo(
    () => [...reminders].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [reminders],
  );

  const handleAction = (item: UpcomingReminder, status: 'done' | 'dismissed') => {
    if (item.origin !== 'manual' || busyId) return;
    setCompletingIds((prev) => new Set(prev).add(item.id));
    setBusyId(item.id);
    window.setTimeout(async () => {
      try {
        const token = await getToken();
        await reminderApi.update(token, item.id, { status });
        setReminders((prev) => prev.filter((r) => r.id !== item.id));
      } catch {
        setError('Não foi possível atualizar o lembrete.');
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      } finally {
        setBusyId(null);
      }
    }, 220);
  };

  const handleCreate = async (payload: CreateReminderPayload) => {
    const token = await getToken();
    await reminderApi.create(token, payload);
    await fetchReminders();
  };

  const handleAddToCalendar = (item: UpcomingReminder) => {
    const ics = generateICS({
      uid: item.id,
      title: item.title,
      description: REMINDER_ORIGIN_LABELS[item.origin],
      date: dateOnlyFromISOString(item.dueAt),
    });
    downloadICS(`lembrete-${item.id}`, ics);
  };

  if (!childId) return null;

  return (
    <GumroadCard color="cream" shadow="md" padding="lg">
      <Flex justify="between" align="center" mb="3" gap="2">
        <GumroadHeading level="title-md" as="h2">
          Próximos lembretes
        </GumroadHeading>
        <GumroadButton variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
          <PlusIcon />
          Novo
        </GumroadButton>
      </Flex>

      {loading ? (
        <LoadingSpinner size="medium" text="Carregando..." />
      ) : error ? (
        <Flex align="center" gap="2" style={{ color: colors.error }}>
          <ExclamationTriangleIcon />
          <GumroadText level="body-sm" as="span">{error}</GumroadText>
        </Flex>
      ) : sorted.length === 0 ? (
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
          Nenhum lembrete nos próximos {days} dias
        </GumroadText>
      ) : (
        <Flex direction="column" gap="2">
          {sorted.map((item) => {
            const isCompleting = completingIds.has(item.id);
            return (
              <Flex
                key={item.id}
                align="center"
                gap="3"
                style={{
                  background: colors.surface,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  padding: '12px 14px',
                  boxShadow: shadows['card-sm'],
                  opacity: isCompleting ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {item.origin === 'manual' ? (
                  <button
                    onClick={() => handleAction(item, 'done')}
                    aria-label="Marcar como feito"
                    disabled={isCompleting}
                    style={{
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      borderRadius: radii.full,
                      border: `2px solid ${colors.ink}`,
                      backgroundColor: isCompleting ? colors['brand-mint'] : colors.canvas,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isCompleting && <CheckIcon />}
                  </button>
                ) : (
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{REMINDER_ORIGIN_ICONS[item.origin]}</span>
                )}

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <GumroadText
                    level="body-sm"
                    as="p"
                    style={{
                      fontWeight: 600,
                      textDecoration: isCompleting ? 'line-through' : 'none',
                      transition: 'text-decoration 0.2s ease',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.title}
                  </GumroadText>
                  <Flex align="center" gap="2" wrap="wrap">
                    <GumroadText level="caption" as="span" style={{ opacity: 0.65 }}>
                      {formatDueAt(item.dueAt)}
                    </GumroadText>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: radii.pill,
                        border: `1.5px solid ${colors.ink}`,
                        backgroundColor: item.origin === 'manual' ? colors['brand-lavender'] : colors['surface-cream'],
                      }}
                    >
                      {REMINDER_ORIGIN_ICONS[item.origin]} {REMINDER_ORIGIN_LABELS[item.origin]}
                    </span>
                  </Flex>
                </Box>

                <button
                  onClick={() => handleAddToCalendar(item)}
                  aria-label="Adicionar ao calendário"
                  title="Adicionar ao calendário"
                  style={{
                    width: '28px',
                    height: '28px',
                    flexShrink: 0,
                    borderRadius: radii.md,
                    border: `2px solid ${colors.ink}`,
                    backgroundColor: colors.canvas,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarIcon />
                </button>

                {item.origin === 'manual' && (
                  <button
                    onClick={() => handleAction(item, 'dismissed')}
                    aria-label="Dispensar lembrete"
                    disabled={isCompleting}
                    style={{
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      borderRadius: radii.md,
                      border: `2px solid ${colors.ink}`,
                      backgroundColor: colors.canvas,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Cross2Icon />
                  </button>
                )}
              </Flex>
            );
          })}
        </Flex>
      )}

      <CreateReminderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        childId={childId}
        onSubmit={handleCreate}
      />
    </GumroadCard>
  );
};

export default RemindersWidget;
