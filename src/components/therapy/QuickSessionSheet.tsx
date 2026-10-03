import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadModal from '../design-system/GumroadModal';
import TherapyTypeSelector from './TherapyTypeSelector';
import type { TherapyType, Therapist, CreateSessionPayload } from '../../types/therapy';

interface QuickSessionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSessionPayload) => Promise<void>;
  childId: string;
  therapists: Therapist[];
  defaultTherapyType?: TherapyType;
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

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const QuickSessionSheet: React.FC<QuickSessionSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  childId,
  therapists,
  defaultTherapyType,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<TherapyType | null>(null);
  const [occurredAt, setOccurredAt] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reinicia o formulário a cada abertura (foco/trap/Escape são do GumroadModal)
  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setOccurredAt(local);
    setStep(defaultTherapyType ? 'form' : 'type');
    setSelectedType(defaultTherapyType ?? null);
    setTherapistId('');
    setDurationMinutes('');
    setNotes('');
    setError(null);
  }, [isOpen, defaultTherapyType]);

  const handleSubmit = async () => {
    if (!selectedType) return;
    const when = new Date(occurredAt);
    if (Number.isNaN(when.getTime())) {
      setError(t('p2Therapy.session.invalidDate'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const dur = durationMinutes ? parseInt(durationMinutes, 10) : null;
      await onSubmit({
        childId,
        therapistId: therapistId || null,
        therapyType: selectedType,
        occurredAt: when.toISOString(),
        durationMinutes: dur && !isNaN(dur) ? dur : null,
        notes: notes.trim() || null,
      });
      toast.success(t('p2Therapy.session.saved'));
      onClose();
    } catch {
      setError(t('p2Therapy.session.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const title = step === 'form' && selectedType
    ? t(`p2Therapy.types.${selectedType}.label`)
    : t('p2Therapy.session.title');

  return (
    <GumroadModal open={isOpen} onClose={onClose} title={title}>
        {/* DateTime Picker (shown on both steps) */}
        <div style={{ marginBottom: spacing.md }}>
          <label style={labelStyle} htmlFor="session-data-e">{t('p2Therapy.session.dateTime')}</label>
          <input id="session-data-e"
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            style={inputStyle}
          />
        </div>

        {step === 'type' && (
          <TherapyTypeSelector
            selected={selectedType}
            onSelect={(type) => { setSelectedType(type); setStep('form'); }}
          />
        )}

        {step === 'form' && (
          <Flex direction="column" gap="3">
            {/* Therapist select */}
            <div>
              <label style={labelStyle} htmlFor="session-terapeuta">{t('p2Therapy.session.therapist')}</label>
              <select id="session-terapeuta"
                value={therapistId}
                onChange={(e) => setTherapistId(e.target.value)}
                style={{
                  height: '44px',
                  padding: '0 12px',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  color: colors.ink,
                  backgroundColor: colors.surface,
                  width: '100%',
                  boxSizing: 'border-box',
                  boxShadow: shadows['card-sm'],
                }}
              >
                <option value="">{t('p2Therapy.session.noTherapist')}</option>
                {therapists.map((th) => (
                  <option key={th.id} value={th.id}>{th.name}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle} htmlFor="session-duracao-minutos">{t('p2Therapy.session.duration')}</label>
              <input id="session-duracao-minutos"
                type="number"
                min="1"
                max="480"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder={t('p2Therapy.session.durationPh')}
                style={inputStyle}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle} htmlFor="session-observacoes">{t('p2Therapy.session.notes')}</label>
              <textarea id="session-observacoes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t('p2Therapy.session.notesPh')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.display,
                  fontSize: '14px',
                  color: colors.ink,
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  boxShadow: shadows.input,
                  resize: 'vertical',
                }}
              />
              <div style={{ fontFamily: fonts.body, fontSize: '11px', color: colors['ink-muted'], textAlign: 'right' }}>
                {notes.length}/500
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" style={{
                padding: '10px 14px',
                backgroundColor: colors['brand-salmon'],
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.md,
                fontFamily: fonts.display,
                fontSize: '13px',
                color: colors.ink,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <GumroadButton
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? t('p2Therapy.saving') : t('p2Therapy.session.save')}
            </GumroadButton>

            {/* Back link */}
            <button
              type="button"
              onClick={() => setStep('type')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: fonts.display,
                fontSize: '13px',
                color: colors.ink,
                opacity: 0.7,
                textAlign: 'center',
                padding: '4px',
              }}
            >
              {t('p2Therapy.back')}
            </button>
          </Flex>
        )}
    </GumroadModal>
  );
};

export default QuickSessionSheet;
