import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Box, Flex } from '@radix-ui/themes';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOpenIcon,
  InfoCircledIcon,
  Pencil1Icon,
  LockClosedIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { accessLogApi } from '../services/api';
import type { AccessLogEntry } from '../types/accessLog';
import { colors, spacing, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState } from '../components/domain/ErrorState';

const LIMIT = 20;

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  // Um campo ausente virava "Invalid Date" em toda linha da tabela. Numa
  // trilha de auditoria, "—" é honesto; "Invalid Date" é só ruído.
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Os valores gravados pelo backend são o nome da coleção da rota
// (`daily-reports` -> `daily_reports`), mais os literais que alguns
// controllers escrevem à mão. O fallback mostra o valor cru em vez de
// esconder a linha: uma trilha de auditoria não pode omitir o que não
// reconhece.
const KNOWN_RESOURCE_TYPES = new Set(['access_logs', 'anamnese', 'anamneses', 'assessment', 'assessments', 'care_team', 'caregivers', 'communication_logs', 'comorbidities', 'daily_logs', 'daily_reports', 'developmental_milestones', 'development', 'documents', 'education_plans', 'goals', 'medical', 'medical_appointments', 'medications', 'professional_note', 'professional_notes', 'reminders', 'school_communications', 'therapy', 'therapy_sessions']);

/**
 * "Você" só quando é mesmo você. A tela dizia "Você" em qualquer linha sem
 * nome resolvido, que é o caso da maioria — inclusive das ações de terceiros,
 * exatamente as que esta tela existe para mostrar.
 */
function actorLabel(entry: AccessLogEntry, currentUserId: string | undefined, t: TFunction): string {
  if (currentUserId && entry.actorUserId === currentUserId) return t('p1AccessLog.you');
  return entry.actorName ?? t('p1AccessLog.otherUser');
}

export default function AccessLogPage() {
  const { t, i18n } = useTranslation();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken, session } = useAuthContext();
  const currentUserId = session?.user?.id;

  const [entries, setEntries] = useState<AccessLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const result = await accessLogApi.list(token, childId, { page, limit: LIMIT });
      setEntries(result.data);
      setTotal(result.total);
    } catch {
      setError(t('p1AccessLog.errLoad'));
    } finally {
      setLoading(false);
    }
  }, [childId, page, getToken, t]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <Box style={{ maxWidth: '820px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon aria-hidden="true" /> {t('p1AccessLog.back')}
        </GumroadButton>
      </Box>

      <Box style={{ marginBottom: spacing.lg }}>
        <Flex align="center" gap="2" mb="1">
          <LockClosedIcon aria-hidden="true" />
          <GumroadHeading level="display-sm" as="h1">{t('p1AccessLog.title')}</GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          {t('p1AccessLog.subtitle')}
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text={t('p1AccessLog.loading')} />
        </GumroadCard>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} retryLabel={t('p1Common.retry')} />
      ) : entries.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} aria-hidden="true" />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              {t('p1AccessLog.empty')}
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <>
          <GumroadCard color="white" shadow="md" padding="sm" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr>
                  <th scope="col" style={thStyle}>{t('p1AccessLog.who')}</th>
                  <th scope="col" style={thStyle}>{t('p1AccessLog.what')}</th>
                  <th scope="col" style={thStyle}>{t('p1AccessLog.when')}</th>
                  <th scope="col" style={thStyle}>{t('p1AccessLog.action')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id} style={{ backgroundColor: idx % 2 === 0 ? colors.surface : colors['surface-cream'] }}>
                    <td style={tdStyle}>{actorLabel(entry, currentUserId, t)}</td>
                    <td style={tdStyle}>{KNOWN_RESOURCE_TYPES.has(entry.resourceType) ? t(`p1AccessLog.resource.${entry.resourceType}`) : entry.resourceType}</td>
                    <td style={tdStyle}>{formatDate(entry.createdAt, i18n.language)}</td>
                    <td style={tdStyle}>
                      <Flex align="center" gap="1">
                        {entry.action === 'write' ? <Pencil1Icon aria-hidden="true" /> : <EyeOpenIcon aria-hidden="true" />}
                        <GumroadText level="caption" as="span">
                          {entry.action === 'write' ? t('p1AccessLog.write') : t('p1AccessLog.read')}
                        </GumroadText>
                      </Flex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GumroadCard>

          <Flex justify="between" align="center" mt="4">
            <GumroadText level="caption" as="span" style={{ opacity: 0.6 }}>
              {t('p1AccessLog.pageInfo', { page, pages: totalPages, count: total })}
            </GumroadText>
            <Flex gap="2">
              <GumroadButton variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeftIcon aria-hidden="true" /> {t('p1AccessLog.prev')}
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                {t('p1AccessLog.next')} <ChevronRightIcon aria-hidden="true" />
              </GumroadButton>
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontFamily: 'inherit',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: `2px solid ${colors.ink}`,
  color: colors.ink,
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '13px',
  borderBottom: `1px solid rgba(10,10,26,0.1)`,
  color: colors.ink,
  borderRadius: radii.sm,
};
