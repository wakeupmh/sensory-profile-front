import { useCallback, useEffect, useState } from 'react';
import { AlertDialog, Box, Flex } from '@radix-ui/themes';
import {
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  Pencil1Icon,
  SpeakerLoudIcon,
  TrashIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { dailyReportApi, logApi } from '../services/api';
import type { DailyReport, SuggestedLog } from '../types/dailyReports';
import { LOG_TYPE_LABELS } from '../types/logs';
import { useDomainPage } from '../hooks/useDomainPage';
import { useToast } from '../context/ToastContext';
import { ChildSelector } from '../components/domain/ChildSelector';
import { colors, spacing, shadows, radii, fonts } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import DailyReportRecorder from '../components/logs/DailyReportRecorder';
import SuggestedLogValuesEditor from '../components/logs/SuggestedLogValuesEditor';
import type { AudioRecording } from '../hooks/useAudioRecorder';
import { useAuthContext } from '../context/AuthContext';

/**
 * O backend valida a saída da IA antes de gravar, mas relatos estruturados
 * antes disso continuam no banco — e um `.map` em não-lista derruba a página
 * inteira. Ler defensivamente aqui custa uma função e cobre esses registros.
 */
function readSuggestedLogs(report: DailyReport): SuggestedLog[] {
  const suggestions = report.structured?.suggestedLogs;
  if (!Array.isArray(suggestions)) return [];
  return suggestions.filter((s): s is SuggestedLog => !!s && typeof s === 'object' && s.logType in LOG_TYPE_LABELS);
}

function readStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

const STATUS_LABELS: Record<DailyReport['status'], string> = {
  draft: 'Aguardando áudio',
  transcribing: 'Transcrevendo…',
  ready: 'Pronto',
  failed: 'Falhou',
};

/** Transcrever alguns minutos leva dezenas de segundos; 4s é o meio-termo. */
const POLL_INTERVAL_MS = 4000;
/** Teto do afastamento depois de falhas seguidas. */
const MAX_POLL_INTERVAL_MS = 60000;
/**
 * Depois disto o relato provavelmente travou no servidor. Transcrever alguns
 * minutos de áudio não leva cinco — insistir para sempre só gasta bateria e
 * requisição, e esconde do cuidador que algo deu errado.
 */
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

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
  const [retrying, setRetrying] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  // Chave `${reportId}:${index}`: valores que o cuidador ajustou antes de
  // confirmar uma sugestão. Ausente = usa `suggestion.data` como veio da IA.
  const [adjustedData, setAdjustedData] = useState<Record<string, Record<string, unknown>>>({});
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [editingTranscriptId, setEditingTranscriptId] = useState<string | null>(null);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [savingTranscript, setSavingTranscript] = useState(false);

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

  useEffect(() => {
    setPollTimedOut(false);
  }, [transcribingKey]);

  useEffect(() => {
    if (!transcribingKey) return;
    const ids = transcribingKey.split(',');
    let cancelled = false;
    let timer: number | undefined;
    const startedAt = Date.now();
    let consecutiveFailures = 0;

    const tick = async () => {
      if (cancelled) return;

      // Aba escondida não precisa de polling: num PWA instalado isto acordava
      // o rádio a cada 4 segundos, indefinidamente, com a tela apagada.
      if (document.visibilityState === 'hidden') return schedule(POLL_INTERVAL_MS);

      // Um relato que trava no servidor (job morto) fazia o cliente consultar
      // para sempre. Passado o teto, para e diz que parou.
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        if (!cancelled) setPollTimedOut(true);
        return;
      }

      try {
        const token = await getTokenRef.current();
        const updated = await Promise.all(ids.map((id) => dailyReportApi.get(token, id)));
        if (cancelled) return;
        consecutiveFailures = 0;
        setReports((prev) => {
          // Devolver `prev` quando nada mudou evita recriar o array — e com
          // ele o JSX de todos os cartões — a cada 4 segundos.
          let changed = false;
          const next = prev.map((r) => {
            const fresh = updated.find((u) => u.id === r.id);
            if (!fresh || fresh.updatedAt === r.updatedAt) return r;
            changed = true;
            return fresh;
          });
          return changed ? next : prev;
        });
      } catch {
        // Um backend em erro era martelado a 15 req/min para sempre, porque o
        // catch engolia tudo. Agora cada falha afasta a próxima tentativa.
        consecutiveFailures += 1;
      }
      schedule(Math.min(POLL_INTERVAL_MS * 2 ** consecutiveFailures, MAX_POLL_INTERVAL_MS));
    };

    // setTimeout encadeado, não setInterval: o intervalo não espera a chamada
    // anterior, então numa conexão lenta as requisições se empilhavam.
    function schedule(delay: number) {
      if (!cancelled) timer = window.setTimeout(tick, delay);
    }

    schedule(POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
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

  /**
   * Uma transcrição que falhou não custa a gravação: o áudio continua no S3
   * pela janela de retenção, e o backend gera um job novo a cada chamada. Sem
   * isto o cuidador teria que regravar dois minutos de relato por causa de uma
   * indisponibilidade momentânea da AWS.
   */
  const handleRetry = async (report: DailyReport) => {
    setRetrying(report.id);
    try {
      const token = await getTokenRef.current();
      const updated = await dailyReportApi.startTranscription(token, report.id);
      // Volta para `transcribing`, e o polling desta tela assume daqui.
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      toast.error('Não foi possível reprocessar a gravação.');
    } finally {
      setRetrying(null);
    }
  };

  /**
   * Toca dentro do card em vez de abrir a URL assinada numa aba nova.
   * `window.open` aqui acontece depois de dois `await` — fora do stack do
   * gesto do usuário — e o Safari do iOS bloqueia isso; num PWA que o cuidador
   * usa no celular, era o caminho mais provável de a gravação simplesmente não
   * tocar. Mesmo quando abria, jogava a pessoa numa aba com uma URL crua do S3
   * (que vários navegadores baixam em vez de tocar), sem contexto e sem volta.
   */
  const handlePlayAudio = async (report: DailyReport) => {
    if (audioUrls[report.id]) return;
    setLoadingAudio(report.id);
    try {
      const token = await getTokenRef.current();
      const { url } = await dailyReportApi.getAudioUrl(token, report.id);
      setAudioUrls((prev) => ({ ...prev, [report.id]: url }));
    } catch {
      toast.error('Não foi possível carregar a gravação.');
    } finally {
      setLoadingAudio(null);
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
        // O que o cuidador ajustou (se ajustou) prevalece sobre o que a IA
        // propôs — ver SuggestedLogValuesEditor.
        data: (adjustedData[key] ?? suggestion.data ?? {}) as never,
        notes: suggestion.notes ?? null,
      });
      setSavedLogs((prev) => new Set(prev).add(key));
      setEditingSuggestion((prev) => (prev === key ? null : prev));
      toast.success('Registro salvo.');
    } catch {
      toast.error('Não foi possível salvar o registro.');
    } finally {
      setSavingLog(null);
    }
  };

  /**
   * A transcrição é o registro durável (alimenta a exportação LGPD e os
   * resumos da IA), então precisa ser corrigível quando a transcrição
   * automática erra um nome, remédio ou termo clínico — sem descartar a
   * gravação inteira. O backend reestrutura via IA a partir do texto novo e
   * devolve `structured` atualizado (ou `null`, se a IA falhar) — nunca a
   * versão antiga descrevendo um texto que não existe mais. Por isso os
   * marcadores de "sugestão ajustada"/"registro salvo" deste relato são
   * descartados aqui: eles se referem a índices de uma lista de sugestões
   * que acabou de deixar de existir.
   */
  const handleSaveTranscript = async (report: DailyReport) => {
    const transcript = transcriptDraft.trim();
    if (!transcript) {
      toast.error('A transcrição não pode ficar vazia.');
      return;
    }
    setSavingTranscript(true);
    try {
      const token = await getTokenRef.current();
      const updated = await dailyReportApi.updateTranscript(token, report.id, transcript);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      const prefix = `${report.id}:`;
      setSavedLogs((prev) => {
        const next = new Set(prev);
        for (const k of next) if (k.startsWith(prefix)) next.delete(k);
        return next;
      });
      setAdjustedData((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) if (k.startsWith(prefix)) delete next[k];
        return next;
      });
      setEditingSuggestion((prev) => (prev?.startsWith(prefix) ? null : prev));
      setEditingTranscriptId(null);
      toast.success(
        updated.structured
          ? 'Transcrição atualizada e o resumo foi reorganizado.'
          : 'Transcrição atualizada. Não foi possível reorganizar o resumo agora.',
      );
    } catch {
      toast.error('Não foi possível salvar a transcrição.');
    } finally {
      setSavingTranscript(false);
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
                          : pollTimedOut
                            ? 'A transcrição está demorando mais que o esperado. Atualize a página para verificar de novo.'
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
                  {report.status === 'failed' && report.hasAudio && (
                    <GumroadButton
                      variant="secondary"
                      size="sm"
                      disabled={retrying === report.id}
                      onClick={() => handleRetry(report)}
                    >
                      <UpdateIcon />
                      {retrying === report.id ? 'Reenviando…' : 'Tentar novamente'}
                    </GumroadButton>
                  )}
                  {report.hasAudio && !audioUrls[report.id] && (
                    <GumroadButton
                      variant="ghost"
                      size="sm"
                      disabled={loadingAudio === report.id}
                      onClick={() => handlePlayAudio(report)}
                    >
                      <SpeakerLoudIcon />
                      {loadingAudio === report.id ? 'Carregando…' : 'Ouvir'}
                    </GumroadButton>
                  )}
                  <GumroadButton variant="ghost" size="sm" onClick={() => setDeleting(report)}>
                    <TrashIcon />
                    Excluir
                  </GumroadButton>
                </Flex>

                {audioUrls[report.id] && (
                  <Box mt="3">
                    {/* A URL assinada vale 15 minutos; se expirar com o player
                        aberto, o `onError` devolve o botão em vez de deixar um
                        controle morto na tela. */}
                    <audio
                      controls
                      autoPlay
                      src={audioUrls[report.id]}
                      style={{ width: '100%' }}
                      onError={() => {
                        setAudioUrls((prev) => {
                          const next = { ...prev };
                          delete next[report.id];
                          return next;
                        });
                        toast.error('A gravação expirou. Toque em "Ouvir" novamente.');
                      }}
                    >
                      <track kind="captions" />
                    </audio>
                  </Box>
                )}

                {expanded && (
                  <Box mt="4" style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: spacing.md }}>
                    {readStringList(report.structured?.highlights).length > 0 ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Destaques</GumroadHeading>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {readStringList(report.structured?.highlights).map((item, i) => (
                            <li key={i}><GumroadText level="body-sm">{item}</GumroadText></li>
                          ))}
                        </ul>
                      </Box>
                    ) : null}

                    {readStringList(report.structured?.concerns).length > 0 ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Pontos de atenção</GumroadHeading>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {readStringList(report.structured?.concerns).map((item, i) => (
                            <li key={i}><GumroadText level="body-sm">{item}</GumroadText></li>
                          ))}
                        </ul>
                      </Box>
                    ) : null}

                    {readSuggestedLogs(report).length > 0 ? (
                      <Box mb="3">
                        <GumroadHeading level="title-sm" as="h4">Registros sugeridos</GumroadHeading>
                        <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.sm }}>
                          Nada é salvo sem a sua confirmação.
                        </GumroadText>
                        <Flex direction="column" gap="2">
                          {readSuggestedLogs(report).map((suggestion, i) => {
                            const key = `${report.id}:${i}`;
                            const saved = savedLogs.has(key);
                            const editing = editingSuggestion === key;
                            const currentData = adjustedData[key] ?? suggestion.data ?? {};
                            return (
                              <Box
                                key={key}
                                style={{
                                  border: `2px solid ${colors.ink}`,
                                  borderRadius: radii.md,
                                  padding: spacing.sm,
                                }}
                              >
                                <Flex justify="between" align="center" gap="2" wrap="wrap">
                                  <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                                    <GumroadBadge color="lavender">
                                      {LOG_TYPE_LABELS[suggestion.logType]}
                                    </GumroadBadge>
                                    <GumroadText level="body-sm">{suggestion.notes ?? ''}</GumroadText>
                                  </Flex>
                                  <Flex gap="2">
                                    {!saved && (
                                      <GumroadButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingSuggestion(editing ? null : key)}
                                      >
                                        <Pencil1Icon /> {editing ? 'Fechar' : 'Ajustar'}
                                      </GumroadButton>
                                    )}
                                    <GumroadButton
                                      variant={saved ? 'ghost' : 'secondary'}
                                      size="sm"
                                      disabled={saved || savingLog === key}
                                      onClick={() => handleConfirmLog(report, suggestion, i)}
                                    >
                                      {saved ? <><CheckIcon /> Salvo</> : savingLog === key ? 'Salvando…' : 'Salvar registro'}
                                    </GumroadButton>
                                  </Flex>
                                </Flex>
                                {editing && !saved && (
                                  <Box mt="3">
                                    <SuggestedLogValuesEditor
                                      logType={suggestion.logType}
                                      data={currentData}
                                      onChange={(next) => setAdjustedData((prev) => ({ ...prev, [key]: next }))}
                                    />
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Flex>
                      </Box>
                    ) : null}

                    {report.transcript && (
                      <Box>
                        <Flex justify="between" align="center" mb="1">
                          <GumroadHeading level="title-sm" as="h4">Transcrição</GumroadHeading>
                          {editingTranscriptId !== report.id && (
                            <GumroadButton
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTranscriptId(report.id);
                                setTranscriptDraft(report.transcript ?? '');
                              }}
                            >
                              <Pencil1Icon /> Corrigir
                            </GumroadButton>
                          )}
                        </Flex>
                        {editingTranscriptId === report.id ? (
                          <Box>
                            <textarea
                              value={transcriptDraft}
                              onChange={(e) => setTranscriptDraft(e.target.value)}
                              autoFocus
                              style={{
                                width: '100%',
                                minHeight: '140px',
                                padding: '10px 12px',
                                backgroundColor: 'transparent',
                                border: `2px solid ${colors.ink}`,
                                borderRadius: radii.sm,
                                boxShadow: shadows.input,
                                fontFamily: fonts.body,
                                fontSize: '14px',
                                color: colors.ink,
                                boxSizing: 'border-box',
                                whiteSpace: 'pre-wrap',
                                resize: 'vertical',
                              }}
                            />
                            <GumroadText level="body-sm" as="p" style={{ opacity: 0.65, marginTop: spacing.xxs }}>
                              Corrija nomes, remédios ou termos que a transcrição automática errou. O resumo da IA
                              é reorganizado a partir do texto corrigido.
                            </GumroadText>
                            <Flex gap="2" mt="2">
                              <GumroadButton
                                variant="primary"
                                size="sm"
                                disabled={savingTranscript}
                                onClick={() => handleSaveTranscript(report)}
                              >
                                {savingTranscript ? 'Salvando…' : 'Salvar correção'}
                              </GumroadButton>
                              <GumroadButton
                                variant="secondary"
                                size="sm"
                                disabled={savingTranscript}
                                onClick={() => setEditingTranscriptId(null)}
                              >
                                <Cross2Icon /> Cancelar
                              </GumroadButton>
                            </Flex>
                          </Box>
                        ) : (
                          <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap' }}>
                            {report.transcript}
                          </GumroadText>
                        )}
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
