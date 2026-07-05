import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { Medication, CreateMedicationPayload, UpdateMedicationPayload } from '../../types/medical';

interface MedicationFormProps {
  onSubmit: (payload: CreateMedicationPayload | UpdateMedicationPayload) => Promise<void>;
  initialValues?: Partial<Medication>;
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

const MedicationForm: React.FC<MedicationFormProps> = ({
  onSubmit,
  initialValues = {},
  childId,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState(initialValues.name ?? '');
  const [dosage, setDosage] = useState(initialValues.dosage ?? '');
  const [frequency, setFrequency] = useState(initialValues.frequency ?? '');
  const [startDate, setStartDate] = useState(initialValues.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues.endDate ?? '');
  const [prescribingDoctor, setPrescribingDoctor] = useState(initialValues.prescribingDoctor ?? '');
  const [active, setActive] = useState(initialValues.active !== false);
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !name.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        prescribingDoctor: prescribingDoctor.trim() || undefined,
        active,
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
          <label style={labelStyle} htmlFor="med-nome">
            Nome <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="med-nome"
            type="text"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do medicamento"
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="med-dosagem">Dosagem</label>
            <input id="med-dosagem"
              type="text"
              maxLength={100}
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ex: 10mg"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="med-frequencia">Frequência</label>
            <input id="med-frequencia"
              type="text"
              maxLength={100}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Ex: 2x ao dia"
              style={inputStyle}
            />
          </div>
        </Flex>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="med-data-de">Data de início</label>
            <input id="med-data-de"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="med-data-de-2">Data de término</label>
            <input id="med-data-de-2"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="med-medico-prescritor">Médico prescritor</label>
          <input id="med-medico-prescritor"
            type="text"
            maxLength={255}
            value={prescribingDoctor}
            onChange={(e) => setPrescribingDoctor(e.target.value)}
            placeholder="Nome do médico"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: colors['brand-cyan'], cursor: 'pointer' }}
            />
            Medicamento ativo
          </label>
        </div>

        <div>
          <label style={labelStyle} htmlFor="med-observacoes-2000">
            Observações
            <span style={{ fontWeight: 400, color: colors['ink-muted'], marginLeft: '6px' }}>
              ({notes.length}/2000)
            </span>
          </label>
          <textarea id="med-observacoes-2000"
            maxLength={2000}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais..."
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

export default MedicationForm;
