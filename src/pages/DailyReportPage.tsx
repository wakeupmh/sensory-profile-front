import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertDialog, Box, Flex } from '@radix-ui/themes';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  SpeakerLoudIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { dailyReportApi, logApi } from '../services/api';
import type { DailyReport, SuggestedLog } from '../types/dailyReports';
import type { LogType } from '../types/logs';
import { useDomainPage } from '../hooks/useDomainPage';
import { useToast } from '../context/ToastContext';
import { ChildSelector } from '../components/domain/ChildSelector';
import { colors, spacing, shadows } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import DailyReportRecorder from '../components/logs/DailyReportRecorder';
import type { AudioRecording } from '../hooks/useAudioRecorder';
import { useAuthContext } from '../context/AuthContext';

const LOG_TYPE_LABELS: Record<LogType, string> = {
  abc: 'ABC',
  mood: 'Humor',
  sleep: 'Sono',
  food: 'Alimentação',
  toileting: 'Banheiro',
};

const STATUS_LABELS: Record<DailyReport['status'], string> = {
  draft: 'Aguardando áudio',
  transcribing: 'Transcrevendo…',
  ready: 'Pronto',
  failed: 'Falhou',
};

/** Transcrever alguns minutos leva dezenas de segundos; 4s é o meio-termo. */
const POLL_INTERVAL_MS = 4000;

function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatReportDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export default function DailyReportPage() {
  const { isLoaded, session } = useAuthContext();
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();
  const toast = useToast();

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState<string | null>(null);
  const [savedLogs, setSavedLogs] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<DailyReport | null>(null);

  const fetchReports = useCallback(async () => {
    if (!effectiveChildId) {
      setReports([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      setReports(await dailyReportApi.list(token, effectiveChildId));
      setError(null);
    } catch {
      setError('Erro ao carregar os relatos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [effectiveChildId, getTokenRef]);

  useEffect(() => {
    if (isLoaded && session) fetchReports();
  }, [fetchReports, isLoaded, session]);

  // Enquanto houver relato transcrevendo, o backend só avança o estado quando
  // é consultado — por isso o polling vive aqui e não numa fila no servidor.
  const transcribingIds = reports.filter((r) => r.status === 'transcribing').map((r) => r.id);
  const transcribingKey = transcribingIds.join(',');
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!transcribingKey) return;
    const ids = transcribingKey.split(',');
    pollRef.current = window.setInterval(async () => {
      try {
        const token = await getTokenRef.current();
        const updated = await Promise.all(ids.map((id) => dailyReportApi.get(token, id)));
        setReports((prev) => prev.map((r) => updated.find((u) => u.id === r.id) ?? r));
      } catch {
        // Uma consulta que falha não deve derrubar o loop: a próxima tenta de novo.
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [transcribingKey, getTokenRef]);

  const handleFinishRecording = async (recording: AudioRecording) => {
    const token = await getTokenRef.current();
    const { report, uploadUrl } = await dailyReportApi.create(token, {
      childId: effectiveChildId,
      reportDate: today(),
      mimeType: recording.mimeType,
    });
    await dailyReportApi.uploadAudio(uploadUrl, recording.blob, recording.mimeType);
    // Só depois do upload concluído: o job de transcrição lê o objeto no S3,
    // e dispará-lo antes garantiria um "arquivo não encontrado".
    const started = await dailyReportApi.startTranscription(token, report.id);
    setReports((prev) => [started, ...prev.filter((r) => r.id !== started.id)]);
    toast.info('Gravação enviada', 'A transcrição leva alguns instantes.');
  };

  const handlePlayAudio = async (report: DailyReport) => {
    try {
      const token = await getTokenRef.current();
      const { url } = await dailyReportApi.getAudioUrl(token, report.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Não foi possível abrir a gravação.');
    }
  };

  const handleDelete = async (report: DailyReport) => {
    setDeleting(null);
    try {
      const token = await getTokenRef.current();
      await dailyReportApi.remove(token, report.id);
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      toast.success('Relato removido.');
    } catch {
      toast.error('Não foi possível remover o relato.');
    }
  };

  /**
   * O registro sugerido só vira um `daily_log` de verdade aqui, com um clique
   * explícito. É de propósito: a IA transcreve e organiza, mas quem assina o
   * histórico da criança é o cuidador.
   */
  const handleConfirmLog = async (report: DailyReport, suggestion: SuggestedLog, index: number) => {
    const key = `${report.id}:${index}`;
    setSavingLog(key);
    try {
      const token = await getTokenRef.current();
      await logApi.createLog(token, {
        childId: report.childId,
        logType: suggestion.logType,
        // Meio-dia da data do relato: o relato é sobre o dia inteiro, e não
        // sabemos a hora do evento. Meio-dia evita que o fuso empurre o
        // registro para o dia anterior ou seguinte.
        occurredAt: new Date(`${report.reportDate}T12:00:00`).toISOString(),
        data: (suggestion.data ?? {}) as never,
        notes: suggestion.notes ?? null,
      });
      setSavedLogs((prev) => new Set(prev).add(key));
      toast.success('Registro salvo.');
    } catch {
      toast.error('Não foi possível salvar o registro.');
    } finally {
      setSavingLog(null);
    }
  };

  const todaysReport = reports.find((r) => r.reportDate === today());

  return (
    <Box>
      <Box mb="6">
        <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
          Relato do Dia
        </GumroadHeading>
        <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
          Conte em voz alta como foi o dia — nós transcrevemos e organizamos
        </GumroadText>
      </Box>

      <ChildSelector children={children} selectedChildId={selectedChildId} onChange={setSelectedChildId} />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando relatos..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : children.length > 0 && reports.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhum relato ainda
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Grave um áudio de dois minutos contando como foi o dia. É mais rápido que digitar.
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={() => setRecorderOpen(true)} disabled={!effectiveChildId}>
              Gravar o relato de hoje
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {reports.map((report) => {
            const expanded = expandedId === report.id;
            return (
              <GumroadCard key={report.id} color="white" shadow="md" padding="md">
                <Flex justify="between" align="start" gap="2">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontSize: '12px' }}>
                      {formatReportDate(report.reportDate)}
                    </GumroadText>
                    <GumroadText level="body-sm" as="p">
                      {report.status === 'ready'
                        ? report.structured?.summary ?? report.transcript ?? ''
                        : report.status === 'failed'
                          ? report.error ?? 'A transcrição falhou.'
                          : 'Estamos transcrevendo a gravação…'}
                    </GumroadText>
                  </Box>
                  <GumroadBadge
                    color={report.status === 'ready' ? 'mint' : report.status === 'failed' ? 'salmon' : 'yellow'}
                  >
                    {STATUS_LABELS[report.status]}
                  </GumroadBadge>
                </Flex>

                <Flex gap="2" mt="3" wrap="wrap">
                  {report.status === 'ready' && (
                    <GumroadButton variant="secondary" size="sm" onClick={() => setExpandedId(expanded ? null : report.id)}>
                      {expanded ? 'Ocultar detalhes' : 'Ver relatório'}
                    </GumroadButton>
                  )}
                  {report.hasAudio && (
                    <GumroadButton variant="ghost" size="sm" onClick={() => handlePlayAudio(report)}>
                      <SpeakerLoudIcon />
                      Ouvir
                    </GumroadButton>
                  )}
                  <GumroadButton variant="ghost" size="sm" onClick={() => setDeleting(report)}>
                    <TrashIcon />
                    Excluir
                  </GumroadButton>
                </Flex>

                {expanded && (
                  <Box mt="4" style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: spacing.md }}>
                    {report.structured?.highlights?.length ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Destaques</GumroadHeading>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {report.structured.highlights.map((item, i) => (
                            <li key={i}><GumroadText level="body-sm">{item}</GumroadText></li>
                          ))}
                        </ul>
                      </Box>
                    ) : null}

                    {report.structured?.concerns?.length ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Pontos de atenção</GumroadHeading>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {report.structured.concerns.map((item, i) => (
                            <li key={i}><GumroadText level="body-sm">{item}</GumroadText></li>
                          ))}
                        </ul>
                      </Box>
                    ) : null}

                    {report.structured?.suggestedLogs?.length ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Registros sugeridos</GumroadHeading>
                        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.sm }}>
                          Nada é salvo sem a sua confirmação.
                        </GumroadText>
                        <Flex direction="column" gap="2">
                          {report.structured.suggestedLogs.map((suggestion, i) => {
                            const key = `${report.id}:${i}`;
                            const saved = savedLogs.has(key);
                            return (
                              <Flex key={key} justify="between" align="center" gap="2" wrap="wrap">
                                <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                                  <GumroadBadge color="lavender">
                                    {LOG_TYPE_LABELS[suggestion.logType] ?? suggestion.logType}
                                  </GumroadBadge>
                                  <GumroadText level="body-sm">{suggestion.notes ?? ''}</GumroadText>
                                </Flex>
                                <GumroadButton
                                  variant={saved ? 'ghost' : 'secondary'}
                                  size="sm"
                                  disabled={saved || savingLog === key}
                                  onClick={() => handleConfirmLog(report, suggestion, i)}
                                >
                                  {saved ? <><CheckIcon /> Salvo</> : savingLog === key ? 'Salvando…' : 'Salvar registro'}
                                </GumroadButton>
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Box>
                    ) : null}

                    {report.transcript && (
                      <Box>
                        <GumroadHeading level="title-sm" as="h4">Transcrição</GumroadHeading>
                        <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap' }}>
                          {report.transcript}
                        </GumroadText>
                      </Box>
                    )}
                  </Box>
                )}
              </GumroadCard>
            );
          })}
        </Flex>
      )}

      {effectiveChildId && (
        <button
          onClick={() => setRecorderOpen(true)}
          aria-label="Gravar relato do dia"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            backgroundColor: colors['brand-yellow'],
            color: colors.ink,
            border: `2px solid ${colors.ink}`,
            boxShadow: shadows.card,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <SpeakerLoudIcon width={24} height={24} />
        </button>
      )}

      <DailyReportRecorder
        isOpen={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onFinish={handleFinishRecording}
        reportDate={today()}
        replaces={todaysReport ?? null}
      />

      <AlertDialog.Root open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialog.Content size="2">
          <AlertDialog.Title>Excluir relato</AlertDialog.Title>
          <AlertDialog.Description size="2">
            {deleting?.status === 'ready'
              ? 'A transcrição, o relatório e a gravação deste dia serão apagados. Esta ação não pode ser desfeita.'
              : 'Este relato e a gravação dele serão apagados. Esta ação não pode ser desfeita.'}
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <GumroadButton variant="secondary" size="sm">Cancelar</GumroadButton>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <GumroadButton variant="danger" size="sm" onClick={() => deleting && handleDelete(deleting)}>
                Excluir
              </GumroadButton>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
