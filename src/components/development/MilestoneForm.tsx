import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { CreateMilestonePayload, UpdateMilestonePayload } from '../../types/development';
import {
  MILESTONE_CATEGORY_LABELS,
  MILESTONE_STATUS_LABELS,
} from '../../types/development';
import type { MilestoneCategory, MilestoneStatus } from '../../types/development';

interface MilestoneFormProps {
  initialValues?: Partial<CreateMilestonePayload>;
  onSubmit: (payload: CreateMilestonePayload | UpdateMilestonePayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
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

const MilestoneForm: React.FC<MilestoneFormProps> = ({
  initialValues = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [category, setCategory] = useState<MilestoneCategory | ''>(initialValues.category ?? '');
  const [status, setStatus] = useState<MilestoneStatus>(initialValues.status ?? 'not_yet');
  const [achievedDate, setAchievedDate] = useState(initialValues.achievedDate ?? '');
  const [targetDate, setTargetDate] = useState(initialValues.targetDate ?? '');
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !title.trim() || !category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId: initialValues.childId ?? '',
        title: title.trim(),
        category: category as MilestoneCategory,
        status,
        achievedDate: achievedDate || null,
        targetDate: targetDate || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <div>
          <label style={labelStyle} htmlFor="milestone-nome">
            Nome <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="milestone-nome"
            type="text"
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome do marco"
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="milestone-categoria">
              Categoria <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <select id="milestone-categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value as MilestoneCategory)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Selecionar...</option>
              {(Object.entries(MILESTONE_CATEGORY_LABELS) as [MilestoneCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="milestone-status">Status</label>
            <select id="milestone-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {(Object.entries(MILESTONE_STATUS_LABELS) as [MilestoneStatus, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </Flex>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="milestone-data-de">Data de conquista</label>
            <input id="milestone-data-de"
              type="date"
              value={achievedDate ?? ''}
              onChange={(e) => setAchievedDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="milestone-data-meta">Data meta</label>
            <input id="milestone-data-meta"
              type="date"
              value={targetDate ?? ''}
              onChange={(e) => setTargetDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="milestone-notas-2000">
            Notas
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea id="milestone-notas-2000"
            maxLength={2000}
            rows={3}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações sobre este marco..."
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting || loading ? 'Salvando...' : 'Salvar Marco'}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default MilestoneForm;
