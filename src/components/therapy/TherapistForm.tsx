import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { TherapyType, CreateTherapistPayload } from '../../types/therapy';

interface TherapistFormProps {
  initial?: Partial<CreateTherapistPayload>;
  onSubmit: (payload: CreateTherapistPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: colors.surface,
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const TherapistForm: React.FC<TherapistFormProps> = ({
  initial = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState(initial.name ?? '');
  const [specialty, setSpecialty] = useState<string>(initial.specialty ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [email, setEmail] = useState(initial.email ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialty) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        specialty: specialty as TherapyType,
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || isLoading || !name.trim() || !specialty;

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        {/* Nome */}
        <div>
          <label style={labelStyle}>
            Nome <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="text"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do terapeuta"
            style={inputStyle}
            required
          />
        </div>

        {/* Especialidade */}
        <div>
          <label style={labelStyle}>
            Especialidade <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            style={selectStyle}
            required
          >
            <option value="">Selecionar...</option>
            <option value="aba">ABA</option>
            <option value="ot">OT</option>
            <option value="fonoaudiologia">Fonoaudiologia</option>
            <option value="psicologia">Psicologia</option>
            <option value="fisioterapia">Fisioterapia</option>
          </select>
        </div>

        {/* Telefone */}
        <div>
          <label style={labelStyle}>Telefone</label>
          <input
            type="tel"
            maxLength={50}
            value={phone ?? ''}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>E-mail</label>
          <input
            type="email"
            maxLength={255}
            value={email ?? ''}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="terapeuta@exemplo.com"
            style={inputStyle}
          />
        </div>

        {/* Observações */}
        <div>
          <label style={labelStyle}>Observações</label>
          <textarea
            maxLength={500}
            rows={2}
            value={notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais..."
            style={textareaStyle}
          />
        </div>

        {/* Buttons */}
        <Flex gap="2" mt="4">
          <GumroadButton
            variant="primary"
            size="md"
            type="submit"
            disabled={isDisabled}
          >
            {submitting || isLoading ? 'Salvando...' : 'Salvar'}
          </GumroadButton>
          <GumroadButton
            variant="ghost"
            size="md"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default TherapistForm;
