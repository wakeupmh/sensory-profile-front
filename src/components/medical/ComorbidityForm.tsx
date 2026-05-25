import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { Comorbidity, CreateComorbidityPayload } from '../../types/medical';

interface ComorbidityFormProps {
  onSubmit: (payload: CreateComorbidityPayload | Omit<CreateComorbidityPayload, 'childId'>) => Promise<void>;
  initialValues?: Partial<Comorbidity>;
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

const ComorbidityForm: React.FC<ComorbidityFormProps> = ({
  onSubmit,
  initialValues = {},
  childId,
  onCancel,
  loading = false,
}) => {
  const [conditionName, setConditionName] = useState(initialValues.conditionName ?? '');
  const [icdCode, setIcdCode] = useState(initialValues.icdCode ?? '');
  const [diagnosisDate, setDiagnosisDate] = useState(initialValues.diagnosisDate ?? '');
  const [diagnosingDoctor, setDiagnosingDoctor] = useState(initialValues.diagnosingDoctor ?? '');
  const [notes, setNotes] = useState(initialValues.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !conditionName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionName.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        conditionName: conditionName.trim(),
        icdCode: icdCode.trim() || undefined,
        diagnosisDate: diagnosisDate || undefined,
        diagnosingDoctor: diagnosingDoctor.trim() || undefined,
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
            Condição / Diagnóstico <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="text"
            maxLength={255}
            value={conditionName}
            onChange={(e) => setConditionName(e.target.value)}
            placeholder="Ex: Transtorno do Espectro Autista"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Código CID</label>
          <input
            type="text"
            maxLength={20}
            value={icdCode}
            onChange={(e) => setIcdCode(e.target.value)}
            placeholder="Ex: F84.0"
            style={inputStyle}
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data do diagnóstico</label>
            <input
              type="date"
              value={diagnosisDate}
              onChange={(e) => setDiagnosisDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Médico diagnosticador</label>
            <input
              type="text"
              maxLength={255}
              value={diagnosingDoctor}
              onChange={(e) => setDiagnosingDoctor(e.target.value)}
              placeholder="Nome do médico"
              style={inputStyle}
            />
          </div>
        </Flex>

        <div>
          <label style={labelStyle}>Observações</label>
          <textarea
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

export default ComorbidityForm;
