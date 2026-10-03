import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            <label style={labelStyle} htmlFor="schoolcomm-data-e">
              {t('cEducation.form.dateTime')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <input id="schoolcomm-data-e"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="schoolcomm-tipo-de">
              {t('cEducation.form.commType')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <select id="schoolcomm-tipo-de"
              value={commType}
              onChange={(e) => setCommType(e.target.value as SchoolCommType)}
              style={{ ...inputStyle, cursor: 'pointer' }}
              required
            >
              <option value="">{t('cEducation.form.select')}</option>
              {(Object.entries(SCHOOL_COMM_TYPE_LABELS) as [SchoolCommType, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {t(`cEducation.commType.${value}`, { defaultValue: label })}
                  </option>
                )
              )}
            </select>
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="schoolcomm-assunto">
            {t('cEducation.form.subject')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="schoolcomm-assunto"
            type="text"
            maxLength={255}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('cEducation.form.subjectPh')}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="schoolcomm-descricao-5000">
            {t('cEducation.form.description')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(description ?? '').length}/5000)
            </span>
          </label>
          <textarea id="schoolcomm-descricao-5000"
            maxLength={5000}
            rows={4}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('cEducation.form.descriptionPh')}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="schoolcomm-participantes">{t('cEducation.form.attendees')}</label>
          <input id="schoolcomm-participantes"
            type="text"
            maxLength={500}
            value={attendees ?? ''}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder={t('cEducation.form.attendeesPh')}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="schoolcomm-data-de">{t('cEducation.form.followUpDate')}</label>
          <input id="schoolcomm-data-de"
            type="date"
            value={followUpDate ?? ''}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="schoolcomm-observacoes-2000">
            {t('cEducation.form.notes')}
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({(notes ?? '').length}/2000)
            </span>
          </label>
          <textarea id="schoolcomm-observacoes-2000"
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
            {submitting ? t('cEducation.saving') : isEdit ? t('cEducation.form.saveComm') : t('cEducation.form.addComm')}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            {t('cEducation.cancel')}
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default SchoolCommForm;
