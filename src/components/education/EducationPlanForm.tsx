import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <label style={labelStyle} htmlFor="eduplan-nome-da">
            {t('cEducation.form.schoolName')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="eduplan-nome-da"
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder={t('cEducation.form.schoolNamePh')}
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="eduplan-ano-letivo">
              {t('cEducation.form.academicYear')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <input id="eduplan-ano-letivo"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder={t('cEducation.form.academicYearPh')}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="eduplan-tipo-de">
              {t('cEducation.form.planType')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <select id="eduplan-tipo-de"
              value={planType}
              onChange={(e) => setPlanType(e.target.value as EducationPlanType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">{t('cEducation.form.select')}</option>
              {(Object.entries(EDUCATION_PLAN_TYPE_LABELS) as [EducationPlanType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {t(`cEducation.planType.${value}`, { defaultValue: label })}
                  </option>
                )
              )}
            </select>
          </div>
        </Flex>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="eduplan-data-de">
              {t('cEducation.form.startDate')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <input id="eduplan-data-de"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="eduplan-data-de-2">{t('cEducation.form.reviewDate')}</label>
            <input id="eduplan-data-de-2"
              type="date"
              value={reviewDate ?? ''}
              onChange={(e) => setReviewDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="eduplan-data-de-3">{t('cEducation.form.endDate')}</label>
            <input id="eduplan-data-de-3"
              type="date"
              value={endDate ?? ''}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="eduplan-objetivos-e">
            {t('cEducation.form.goals')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(goals ?? '').length}/5000)
            </span>
          </label>
          <textarea id="eduplan-objetivos-e"
            maxLength={5000}
            rows={4}
            value={goals ?? ''}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={t('cEducation.form.goalsPh')}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="eduplan-adaptacoes-e">
            {t('cEducation.form.accommodations')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(accommodations ?? '').length}/5000)
            </span>
          </label>
          <textarea id="eduplan-adaptacoes-e"
            maxLength={5000}
            rows={4}
            value={accommodations ?? ''}
            onChange={(e) => setAccommodations(e.target.value)}
            placeholder={t('cEducation.form.accommodationsPh')}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="eduplan-observacoes-2000">
            {t('cEducation.form.notes')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea id="eduplan-observacoes-2000"
            maxLength={2000}
            rows={3}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('cEducation.form.notesPh')}
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled} loading={submitting}>
            {submitting ? t('cEducation.saving') : isEdit ? t('cEducation.form.savePlan') : t('cEducation.form.addPlan')}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            {t('cEducation.cancel')}
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default EducationPlanForm;
