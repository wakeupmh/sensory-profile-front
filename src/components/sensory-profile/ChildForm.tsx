import React from 'react';
import { Flex, Box } from '@radix-ui/themes';
import { colors, shadows, radii, typography } from '../../theme/tokens';

export interface ChildFormValue {
  name: string;
  birthDate: string;
  gender?: string;
  nationalIdentity?: string;
  otherInfo?: string;
}

interface ChildFormProps {
  value: ChildFormValue;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const labelStyle: React.CSSProperties = {
  fontFamily: typography['title-sm'].font,
  fontSize: typography['title-sm'].size,
  fontWeight: typography['title-sm'].weight,
  display: 'block',
  marginBottom: '6px',
  color: colors.ink,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  boxShadow: shadows.input,
  backgroundColor: 'transparent',
  fontFamily: typography['body-md'].font,
  fontSize: typography['body-md'].size,
  color: colors.ink,
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '80px',
};

const ChildForm: React.FC<ChildFormProps> = ({ value, onChange, disabled }) => {
  const genderOptions = [
    { value: '', label: 'Selecionar...' },
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <Flex direction="column" gap="3">
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>
            Nome da Criança: <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="text"
            value={value.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Nome completo"
            disabled={disabled}
            required
            style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>
            Data de Nascimento: <span style={{ color: colors['brand-salmon'] }}>*</span>
          </label>
          <input
            type="date"
            value={value.birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
            disabled={disabled}
            required
            style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
          />
        </Box>
      </Flex>

      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>Gênero:</label>
          <select
            value={value.gender ?? ''}
            onChange={(e) => onChange('gender', e.target.value)}
            disabled={disabled}
            style={{ ...selectStyle, opacity: disabled ? 0.6 : 1 }}
          >
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Box>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle}>Identidade Nacional (RG/CPF):</label>
          <input
            type="text"
            value={value.nationalIdentity ?? ''}
            onChange={(e) => onChange('nationalIdentity', e.target.value)}
            placeholder="RG ou CPF"
            disabled={disabled}
            style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
          />
        </Box>
      </Flex>

      <Box>
        <label style={labelStyle}>Outras Informações:</label>
        <textarea
          value={value.otherInfo ?? ''}
          onChange={(e) => onChange('otherInfo', e.target.value)}
          placeholder="Informações adicionais relevantes"
          disabled={disabled}
          style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
        />
      </Box>
    </Flex>
  );
};

export default ChildForm;
