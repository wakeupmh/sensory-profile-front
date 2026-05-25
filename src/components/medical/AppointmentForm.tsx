import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
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
          <label style={labelStyle}>
            Data e hora da consulta <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Médico</label>
            <input
              type="text"
              maxLength={255}
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Nome do médico"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Especialidade</label>
            <input
              type="text"
              maxLength={100}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex: Neuropediatra"
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle}>Clínica / Hospital</label>
          <input
            type="text"
            maxLength={255}
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Nome da clínica ou hospital"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Resumo da consulta</label>
          <textarea
            maxLength={2000}
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="O que foi discutido ou decidido na consulta..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Data de retorno</label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Observações internas</label>
          <textarea
            maxLength={2000}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionais..."
            style={textareaStyle}
          />
        </div>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting || loading ? 'Salvando...' : 'Salvar'}
          </GumroadButton>
          <GumroadButton variant="ghost" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default AppointmentForm;
