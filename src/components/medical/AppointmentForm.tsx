import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { MedicalAppointment, CreateAppointmentPayload } from '../../types/medical';

interface AppointmentFormProps {
  onSubmit: (payload: CreateAppointmentPayload | Omit<CreateAppointmentPayload, 'childId'>) => Promise<void>;
  initialValues?: Partial<MedicalAppointment>;
  childId: string;
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

function isoToDatetimeLocal(iso: string): string {
  if (!iso) return '';
  // Strips seconds/ms for datetime-local input compatibility
  return iso.slice(0, 16);
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  initialValues = {},
  childId,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [occurredAt, setOccurredAt] = useState(
    initialValues.occurredAt ? isoToDatetimeLocal(initialValues.occurredAt) : ''
  );
  const [doctorName, setDoctorName] = useState(initialValues.doctorName ?? '');
  const [specialty, setSpecialty] = useState(initialValues.specialty ?? '');
  const [clinicName, setClinicName] = useState(initialValues.clinicName ?? '');
  const [summary, setSummary] = useState(initialValues.summary ?? '');
  const [followUpDate, setFollowUpDate] = useState(initialValues.followUpDate ?? '');
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !occurredAt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurredAt) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        occurredAt: new Date(occurredAt).toISOString(),
        doctorName: doctorName.trim() || undefined,
        specialty: specialty.trim() || undefined,
        clinicName: clinicName.trim() || undefined,
        summary: summary.trim() || undefined,
        followUpDate: followUpDate || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <div>
          <label style={labelStyle} htmlFor="appt-data-e">
            {t('p2Medical.appts.form.when')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="appt-data-e"
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="appt-medico">{t('p2Medical.appts.form.doctor')}</label>
            <input id="appt-medico"
              type="text"
              maxLength={255}
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder={t('p2Medical.appts.form.doctorPh')}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="appt-especialidade">{t('p2Medical.appts.form.specialty')}</label>
            <input id="appt-especialidade"
              type="text"
              maxLength={100}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder={t('p2Medical.appts.form.specialtyPh')}
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="appt-clinica-hospital">{t('p2Medical.appts.form.clinic')}</label>
          <input id="appt-clinica-hospital"
            type="text"
            maxLength={255}
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder={t('p2Medical.appts.form.clinicPh')}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="appt-resumo-da">{t('p2Medical.appts.form.summary')}</label>
          <textarea id="appt-resumo-da"
            maxLength={2000}
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t('p2Medical.appts.form.summaryPh')}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="appt-data-de">{t('p2Medical.appts.form.followUp')}</label>
          <input id="appt-data-de"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="appt-observacoes-internas">{t('p2Medical.appts.form.notes')}</label>
          <textarea id="appt-observacoes-internas"
            maxLength={2000}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('p2Medical.appts.form.notesPh')}
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting || loading ? t('p2Medical.saving') : t('p2Medical.save')}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            {t('p2Medical.cancel')}
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default AppointmentForm;
