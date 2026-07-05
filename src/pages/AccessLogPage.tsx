import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex } from '@radix-ui/themes';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
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

const LIMIT = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  anamnese: 'Anamnese',
  assessment: 'Avaliação',
  assessments: 'Avaliações',
  daily_logs: 'Registros diários',
  therapy: 'Terapia',
  medical: 'Saúde',
  development: 'Desenvolvimento',
};

export default function AccessLogPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();

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
      setError('Erro ao carregar o histórico de acesso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [childId, page, getToken]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <Box style={{ maxWidth: '820px', margin: '0 auto' }}>
      <Box style={{ marginBottom: spacing.md }}>
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon /> Voltar
        </GumroadButton>
      </Box>

      <Box style={{ marginBottom: spacing.lg }}>
        <Flex align="center" gap="2" mb="1">
          <LockClosedIcon />
          <GumroadHeading level="display-sm" as="h1">Histórico de acesso</GumroadHeading>
        </Flex>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Veja exatamente quem acessou os dados desta criança, o quê e quando — total transparência.
        </GumroadText>
      </Box>

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : entries.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="3">
            <InfoCircledIcon width={32} height={32} />
            <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
              Nenhum acesso registrado ainda.
            </GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <>
          <GumroadCard color="white" shadow="md" padding="sm" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Quem</th>
                  <th style={thStyle}>O quê</th>
                  <th style={thStyle}>Quando</th>
                  <th style={thStyle}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id} style={{ backgroundColor: idx % 2 === 0 ? colors.surface : colors['surface-cream'] }}>
                    <td style={tdStyle}>{entry.professionalName ?? 'Você'}</td>
                    <td style={tdStyle}>{RESOURCE_TYPE_LABELS[entry.resourceType] ?? entry.resourceType}</td>
                    <td style={tdStyle}>{formatDate(entry.occurredAt)}</td>
                    <td style={tdStyle}>
                      <Flex align="center" gap="1">
                        {entry.action === 'write' ? <Pencil1Icon /> : <EyeOpenIcon />}
                        <GumroadText level="caption" as="span">
                          {entry.action === 'write' ? 'Escrita' : 'Leitura'}
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
              Página {page} de {totalPages} · {total} registro{total === 1 ? '' : 's'}
            </GumroadText>
            <Flex gap="2">
              <GumroadButton variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <ChevronLeftIcon /> Anterior
              </GumroadButton>
              <GumroadButton variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Próxima <ChevronRightIcon />
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
