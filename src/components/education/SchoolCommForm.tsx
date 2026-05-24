import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type {
  CreateSchoolCommPayload,
  UpdateSchoolCommPayload,
  SchoolCommType,
} from '../../types/education';
import { SCHOOL_COMM_TYPE_LABELS } from '../../types/education';

interface SchoolCommFormProps {
  initial?: Partial<CreateSchoolCommPayload>;
  onSubmit: (data: CreateSchoolCommPayload | UpdateSchoolCommPayload) => Promise<void>;
  onCancel: () => void;
  childId: string;
  isEdit?: boolean;
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

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

const SchoolCommForm: React.FC<SchoolCommFormProps> = ({
  initial = {},
  onSubmit,
  onCancel,
  childId,
  isEdit = false,
}) => {
  const [occurredAt, setOccurredAt] = useState(toDatetimeLocal(initial.occurredAt));
  const [commType, setCommType] = useState<SchoolCommType | ''>(initial.commType ?? '');
  const [subject, setSubject] = useState(initial.subject ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [attendees, setAttendees] = useState(initial.attendees ?? '');
  const [followUpDate, setFollowUpDate] = useState(initial.followUpDate ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || !occurredAt || !commType || !subject.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurredAt || !commType || !subject.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        occurredAt: new Date(occurredAt).toISOString(),
        commType: commType as SchoolCommType,
        subject: subject.trim(),
        description: description.trim() || null,
        attendees: attendees.trim() || null,
        followUpDate: followUpDate || null,
        notes: notes.trim() || null,
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
              Tipo de comunicação <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <select
              value={commType}
              onChange={(e) => setCommType(e.target.value as SchoolCommType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Selecionar...</option>
              {(Object.entries(SCHOOL_COMM_TYPE_LABELS) as [SchoolCommType, string][]).map(
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
            Assunto <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="text"
            maxLength={255}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Resumo da comunicação"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>
            Descrição
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(description ?? '').length}/5000)
            </span>
          </label>
          <textarea
            maxLength={5000}
            rows={4}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes da comunicação..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Participantes</label>
          <input
            type="text"
            maxLength={500}
            value={attendees ?? ''}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Ex: Professora Ana, coordenadora, responsável"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Data de retorno</label>
          <input
            type="date"
            value={followUpDate ?? ''}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Observações
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea
            maxLength={2000}
            rows={3}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais..."
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting ? 'Salvando...' : isEdit ? 'Salvar comunicação' : 'Adicionar comunicação'}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default SchoolCommForm;
