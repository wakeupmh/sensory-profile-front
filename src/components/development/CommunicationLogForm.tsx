import React, { useState } from 'react';
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
            <label style={labelStyle}>
              Data e hora <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Tipo <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as CommunicationEntryType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Selecionar...</option>
              {(Object.entries(COMMUNICATION_ENTRY_TYPE_LABELS) as [CommunicationEntryType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </Flex>

        <div>
          <label style={labelStyle}>
            Vocabulário estimado (palavras)
          </label>
          <input
            type="number"
            min={0}
            value={wordsCount}
            onChange={(e) => setWordsCount(e.target.value)}
            placeholder="Ex: 50"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Descrição / Observações
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(description ?? '').length}/1000)
            </span>
          </label>
          <textarea
            maxLength={1000}
            rows={3}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva a interação ou observação..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Notas adicionais
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea
            maxLength={2000}
            rows={2}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais..."
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting || loading ? 'Salvando...' : 'Salvar Registro'}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default CommunicationLogForm;
