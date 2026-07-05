import React, { useEffect, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ChatBubbleIcon, InfoCircledIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { aiQuestionApi, AIRateLimitError } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { colors, spacing, radii, shadows, fonts } from '../../theme/tokens';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';

interface Props {
  childId: string;
  periodDays?: number;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  error: string | null;
  loading: boolean;
}

function useCountdown(retryAt: number | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!retryAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [retryAt]);
  if (!retryAt) return 0;
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}

const AIQuestionChat: React.FC<Props> = ({ childId, periodDays = 90 }) => {
  const { getToken } = useAuthContext();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const retrySeconds = useCountdown(retryAt);

  useEffect(() => {
    if (retryAt && retrySeconds === 0) setRetryAt(null);
  }, [retryAt, retrySeconds]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || sending || retrySeconds > 0) return;

    const id = `${Date.now()}`;
    setMessages((prev) => [...prev, { id, question: trimmed, answer: null, error: null, loading: true }]);
    setQuestion('');
    setSending(true);
    try {
      const token = await getToken();
      const { answer } = await aiQuestionApi.ask(token, { childId, question: trimmed, periodDays });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, answer, loading: false } : m)));
    } catch (err) {
      if (err instanceof AIRateLimitError) {
        if (err.info.retryAfterSeconds) setRetryAt(Date.now() + err.info.retryAfterSeconds * 1000);
        setMessages((prev) => prev.map((m) => (m.id === id ? {
          ...m,
          loading: false,
          error: err.info.retryAfterSeconds
            ? `Limite de perguntas atingido. Tente novamente em ${err.info.retryAfterSeconds}s.`
            : 'Limite de 5 perguntas por hora atingido. Tente novamente mais tarde.',
        } : m)));
      } else {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, loading: false, error: 'Erro ao processar a pergunta. Tente novamente.' } : m)));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Flex align="center" gap="2" mb="2">
        <ChatBubbleIcon />
        <GumroadHeading level="title-lg" as="h2">Perguntar à IA</GumroadHeading>
      </Flex>
      <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.md }}>
        Pergunte sobre o histórico registrado. A resposta é baseada apenas nos dados do sistema.
      </GumroadText>

      {messages.length > 0 && (
        <Flex direction="column" gap="3" mb="4">
          {messages.map((m) => (
            <Flex key={m.id} direction="column" gap="2">
              <Box
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '85%',
                  backgroundColor: colors.ink,
                  color: colors.canvas,
                  borderRadius: `${radii.lg} ${radii.lg} ${radii.xs} ${radii.lg}`,
                  padding: '10px 16px',
                  fontFamily: fonts.body,
                  fontSize: '14px',
                }}
              >
                {m.question}
              </Box>
              <Box
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.ink}`,
                  boxShadow: shadows['card-sm'],
                  borderRadius: `${radii.lg} ${radii.lg} ${radii.lg} ${radii.xs}`,
                  padding: '10px 16px',
                  fontFamily: fonts.body,
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.loading ? 'Pensando...' : m.error ? <span style={{ color: colors['brand-salmon'] }}>{m.error}</span> : m.answer}
              </Box>
            </Flex>
          ))}
        </Flex>
      )}

      <form onSubmit={handleAsk}>
        <Flex gap="2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={retrySeconds > 0 ? `Aguarde ${retrySeconds}s para perguntar novamente` : 'Ex: Como está o sono nas últimas semanas?'}
            maxLength={500}
            disabled={sending || retrySeconds > 0}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 14px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.pill,
              fontFamily: fonts.body,
              fontSize: '14px',
              boxShadow: shadows.input,
            }}
          />
          <button
            type="submit"
            disabled={sending || retrySeconds > 0 || !question.trim()}
            aria-label="Enviar pergunta"
            style={{
              width: '44px',
              height: '44px',
              flexShrink: 0,
              borderRadius: radii.full,
              border: `2px solid ${colors.ink}`,
              backgroundColor: colors['brand-cyan'],
              cursor: sending || retrySeconds > 0 ? 'not-allowed' : 'pointer',
              opacity: sending || retrySeconds > 0 || !question.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaperPlaneIcon />
          </button>
        </Flex>
      </form>

      <Flex align="center" gap="2" mt="3" style={{ opacity: 0.7 }}>
        <InfoCircledIcon />
        <GumroadText level="caption" as="span">
          A IA pode errar e não substitui a avaliação de um profissional.
        </GumroadText>
      </Flex>
    </Box>
  );
};

export default AIQuestionChat;
