import { Flex } from '@radix-ui/themes';
import { colors, fonts, radii } from '../../theme/tokens';
import { formatDuration } from '../../hooks/useAudioRecorder';
import { useVoiceDictation } from '../../hooks/useVoiceDictation';

interface DictateButtonProps {
  /** Recebe o texto transcrito. O chamador decide se anexa ou substitui. */
  onText: (text: string) => void;
  /** Rótulo acessível do campo que este botão preenche ("observações", "pergunta"). */
  fieldLabel: string;
}

const LABELS: Record<string, string> = {
  idle: 'Ditar',
  recording: 'Parar',
  sending: 'Enviando…',
  transcribing: 'Transcrevendo…',
};

/**
 * Botão de ditado reutilizável: acompanha qualquer campo de texto do app.
 *
 * Deliberadamente pequeno e sem estado próprio de texto — quem decide o que
 * fazer com a transcrição é o campo, via `onText`. O campo permanece editável
 * durante todo o processo: a transcrição é feita no servidor e leva alguns
 * segundos, e travar a digitação nesse intervalo trocaria uma conveniência por
 * uma espera obrigatória.
 */
export default function DictateButton({ onText, fieldLabel }: DictateButtonProps) {
  const dictation = useVoiceDictation(onText);
  if (!dictation.isSupported) return null;

  const busy = dictation.state === 'sending' || dictation.state === 'transcribing';
  const recording = dictation.state === 'recording';

  return (
    <Flex direction="column" align="end" gap="1">
      <button
        type="button"
        onClick={() => (recording ? dictation.stop() : dictation.start())}
        disabled={busy}
        aria-pressed={recording}
        aria-label={recording ? `Parar o ditado de ${fieldLabel}` : `Ditar ${fieldLabel} por voz`}
        className="press-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          fontFamily: fonts.display,
          fontSize: '12px',
          fontWeight: 600,
          color: colors.ink,
          backgroundColor: recording ? colors['brand-salmon'] : colors.surface,
          border: `2px solid ${colors.ink}`,
          borderRadius: radii.pill,
          cursor: busy ? 'progress' : 'pointer',
          opacity: busy ? 0.7 : 1,
        }}
      >
        <span aria-hidden="true">{recording ? '⏹️' : '🎙️'}</span>
        {recording ? `${LABELS.recording} ${formatDuration(dictation.seconds)}` : LABELS[dictation.state]}
      </button>

      {/* role=status: o texto chega segundos depois, então o progresso precisa
          ser anunciado a quem não está olhando para o botão. */}
      {(busy || dictation.error) && (
        <span
          role="status"
          style={{
            fontFamily: fonts.display,
            fontSize: '11px',
            color: colors['ink-muted'],
            fontStyle: 'italic',
          }}
        >
          {dictation.error ?? 'O texto aparece aqui em instantes.'}
        </span>
      )}
    </Flex>
  );
}
