import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type {
  CreateEducationPlanPayload,
  UpdateEducationPlanPayload,
  EducationPlanType,
} from '../../types/education';
import { EDUCATION_PLAN_TYPE_LABELS } from '../../types/education';

interface EducationPlanFormProps {
  initial?: Partial<CreateEducationPlanPayload>;
  onSubmit: (data: CreateEducationPlanPayload | UpdateEducationPlanPayload) => Promise<void>;
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

const EducationPlanForm: React.FC<EducationPlanFormProps> = ({
  initial = {},
  onSubmit,
  onCancel,
  childId,
  isEdit = false,
}) => {
  const [schoolName, setSchoolName] = useState(initial.schoolName ?? '');
  const [academicYear, setAcademicYear] = useState(initial.academicYear ?? '');
  const [planType, setPlanType] = useState<EducationPlanType | ''>(initial.planType ?? '');
  const [startDate, setStartDate] = useState(initial.startDate ?? '');
  const [reviewDate, setReviewDate] = useState(initial.reviewDate ?? '');
  const [endDate, setEndDate] = useState(initial.endDate ?? '');
  const [goals, setGoals] = useState(initial.goals ?? '');
  const [accommodations, setAccommodations] = useState(initial.accommodations ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || !schoolName.trim() || !academicYear.trim() || !planType || !startDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !academicYear.trim() || !planType || !startDate) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        schoolName: schoolName.trim(),
        academicYear: academicYear.trim(),
        planType: planType as EducationPlanType,
        startDate,
        reviewDate: reviewDate || null,
        endDate: endDate || null,
        goals: goals.trim() || null,
        accommodations: accommodations.trim() || null,
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
          <label style={labelStyle}>
            Nome da escola <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Ex: EMEF João da Silva"
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Ano letivo <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2024 ou 2024/2025"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Tipo de plano <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as EducationPlanType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Selecionar...</option>
              {(Object.entries(EDUCATION_PLAN_TYPE_LABELS) as [EducationPlanType, string][]).map(
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
            <label style={labelStyle}>
              Data de início <span style={{ color: colors['brand-salmon'] }}>*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data de revisão</label>
            <input
              type="date"
              value={reviewDate ?? ''}
              onChange={(e) => setReviewDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data de encerramento</label>
            <input
              type="date"
              value={endDate ?? ''}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle}>
            Objetivos e metas
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(goals ?? '').length}/5000)
            </span>
          </label>
          <textarea
            maxLength={5000}
            rows={4}
            value={goals ?? ''}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Descreva os objetivos e metas do plano..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Adaptações e acomodações
            <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
              ({(accommodations ?? '').length}/5000)
            </span>
          </label>
          <textarea
            maxLength={5000}
            rows={4}
            value={accommodations ?? ''}
            onChange={(e) => setAccommodations(e.target.value)}
            placeholder="Liste as adaptações e acomodações previstas..."
            style={textareaStyle}
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
            {submitting ? 'Salvando...' : isEdit ? 'Salvar plano' : 'Adicionar plano'}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default EducationPlanForm;
