import React, { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing, zIndex } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading from '../design-system/GumroadHeading';
import { therapyApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { TherapySessionSummary, TherapyType } from '../../types/therapy';
import type { CreateGoalProgressPayload } from '../../types/goals';

const THERAPY_TYPE_LABELS: Record<TherapyType, string> = {
  aba: 'ABA',
  ot: 'Terapia Ocupacional',
  fonoaudiologia: 'Fonoaudiologia',
  psicologia: 'Psicologia',
  fisioterapia: 'Fisioterapia',
};

interface GoalProgressFormProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  unit?: string | null;
  onSubmit: (payload: CreateGoalProgressPayload) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 12px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  fontFamily: fonts.display,
  fontSize: '14px',
  color: colors.ink,
  backgroundColor: 'transparent',
  boxSizing: 'border-box',
  boxShadow: shadows.input,
};

const textareaStyle: React.CSSProperties = { ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: '64px' };

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: zIndex.modal,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: spacing.md,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.canvas,
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.xl,
  boxShadow: shadows['card-hover'],
  width: '100%',
  maxWidth: '440px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: spacing.xl,
};

const GoalProgressForm: React.FC<GoalProgressFormProps> = ({ isOpen, onClose, childId, unit, onSubmit }) => {
  const { getToken } = useAuthContext();
  const [value, setValue] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [therapySessionId, setTherapySessionId] = useState('');
  const [sessions, setSessions] = useState<TherapySessionSummary[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !childId) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const result = await therapyApi.getSessions(token, { childId, limit: 20 });
        if (!cancelled) setSessions(result.data);
      } catch {
        // optional linkage — silently ignore fetch failure
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, childId, getToken]);

  if (!isOpen) return null;

  const reset = () => {
    setValue('');
    setOccurredAt(new Date().toISOString().slice(0, 10));
    setNotes('');
    setTherapySessionId('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value === '') return;
    setSubmitting(true);
    try {
      await onSubmit({
        value: Number(value),
        occurredAt: new Date(occurredAt).toISOString(),
        notes: notes.trim() || undefined,
        therapySessionId: therapySessionId || undefined,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={cardStyle}>
        <Flex justify="between" align="center" mb="4">
          <GumroadHeading level="title-md" as="h3">Registrar progresso</GumroadHeading>
          <button
            onClick={handleClose}
            style={{ width: '36px', height: '36px', border: `2px solid ${colors.ink}`, borderRadius: radii.md, backgroundColor: colors.canvas, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Cross2Icon />
          </button>
        </Flex>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <div>
              <label style={labelStyle}>
                Valor {unit ? `(${unit})` : ''} <span style={{ color: colors['brand-salmon'] }}>*</span>
              </label>
              <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Data <span style={{ color: colors['brand-salmon'] }}>*</span></label>
              <input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} style={inputStyle} required />
            </div>
            {sessions.length > 0 && (
              <div>
                <label style={labelStyle}>Vincular à sessão de terapia (opcional)</label>
                <select value={therapySessionId} onChange={(e) => setTherapySessionId(e.target.value)} style={inputStyle}>
                  <option value="">Nenhuma</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.occurredAt).toLocaleDateString('pt-BR')} — {THERAPY_TYPE_LABELS[s.therapyType]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>
                Observação
                <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>({notes.length}/500)</span>
              </label>
              <textarea maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexto do registro..." style={textareaStyle} />
            </div>
            <Flex gap="2" mt="2">
              <GumroadButton variant="primary" size="md" type="submit" disabled={submitting || value === ''}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </GumroadButton>
              <GumroadButton variant="secondary" size="md" type="button" onClick={handleClose}>
                Cancelar
              </GumroadButton>
            </Flex>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default GoalProgressForm;
