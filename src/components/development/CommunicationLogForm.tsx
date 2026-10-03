import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type {
  CreateCommunicationLogPayload,
  UpdateCommunicationLogPayload,
  CommunicationEntryType,
  CommunicationLog,
} from '../../types/development';
import { COMMUNICATION_ENTRY_TYPE_LABELS } from '../../types/development';

interface CommunicationLogFormProps {
  initialValues?: Partial<CommunicationLog>;
  onSubmit: (payload: CreateCommunicationLogPayload | UpdateCommunicationLogPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

function isoToDatetimeLocal(iso: string): string {
  return iso.slice(0, 16);
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

const textareaStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const CommunicationLogForm: React.FC<CommunicationLogFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const uid = useId();
  const [occurredAt, setOccurredAt] = useState(
    initialValues.occurredAt ? isoToDatetimeLocal(initialValues.occurredAt) : ''
  );
  const [entryType, setEntryType] = useState<CommunicationEntryType | ''>(
    initialValues.entryType ?? ''
  );
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [wordsCount, setWordsCount] = useState<string>(
    initialValues.wordsCount != null ? String(initialValues.wordsCount) : ''
  );
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !occurredAt || !entryType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurredAt || !entryType) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId: initialValues.childId ?? '',
        occurredAt: new Date(occurredAt).toISOString(),
        entryType: entryType as CommunicationEntryType,
        description: description.trim() || undefined,
        wordsCount: wordsCount !== '' ? Number(wordsCount) : undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor={`${uid}-date`}>
              {t('cDevelopment.form.dateTime')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <input
              id={`${uid}-date`}
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor={`${uid}-type`}>
              {t('cDevelopment.form.type')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <select
              id={`${uid}-type`}
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as CommunicationEntryType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">{t('cDevelopment.form.select')}</option>
              {(Object.entries(COMMUNICATION_ENTRY_TYPE_LABELS) as [CommunicationEntryType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {t(`cDevelopment.entryType.${value}`, { defaultValue: label })}
                  </option>
                )
              )}
            </select>
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor={`${uid}-words`}>
            {t('cDevelopment.form.words')}
          </label>
          <input
            id={`${uid}-words`}
            type="number"
            min={0}
            value={wordsCount}
            onChange={(e) => setWordsCount(e.target.value)}
            placeholder={t('cDevelopment.form.wordsPh')}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor={`${uid}-desc`}>
            {t('cDevelopment.form.description')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(description ?? '').length}/1000)
            </span>
          </label>
          <textarea
            id={`${uid}-desc`}
            maxLength={1000}
            rows={3}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('cDevelopment.form.descriptionPh')}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor={`${uid}-notes`}>
            {t('cDevelopment.form.notes')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea
            id={`${uid}-notes`}
            maxLength={2000}
            rows={2}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('cDevelopment.form.notesPh')}
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled} loading={submitting || loading}>
            {submitting || loading ? t('cDevelopment.saving') : t('cDevelopment.form.saveLog')}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            {t('cDevelopment.cancel')}
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default CommunicationLogForm;
