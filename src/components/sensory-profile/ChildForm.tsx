import React from 'react';
import { useTranslation } from 'react-i18next';
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
  onChange: (field: keyof ChildFormValue, value: string) => void;
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
  const { t } = useTranslation();
  const genderOptions = [
    { value: '', label: t('common.select') },
    { value: 'male', label: t('assessmentForm.fields.male') },
    { value: 'female', label: t('assessmentForm.fields.female') },
    { value: 'other', label: t('assessmentForm.fields.other') },
  ];

  return (
    <Flex direction="column" gap="3">
      <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="child-nome-da">
            {t('assessmentForm.fields.childName')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="child-nome-da"
            type="text"
            value={value.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={t('assessmentForm.fields.fullName')}
            disabled={disabled}
            required
            style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="child-data-de">
            {t('assessmentForm.fields.birthDate')} <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="child-data-de"
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
          <label style={labelStyle} htmlFor="child-genero">{t('assessmentForm.fields.gender')}</label>
          <select id="child-genero"
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
          <label style={labelStyle} htmlFor="child-identidade-nacional">{t('assessmentForm.fields.nationalId')}</label>
          <input id="child-identidade-nacional"
            type="text"
            value={value.nationalIdentity ?? ''}
            onChange={(e) => onChange('nationalIdentity', e.target.value)}
            placeholder={t('assessmentForm.fields.nationalIdPlaceholder')}
            disabled={disabled}
            style={{ ...inputStyle, opacity: disabled ? 0.6 : 1 }}
          />
        </Box>
      </Flex>

      <Box>
        <label style={labelStyle} htmlFor="child-outras-informacoes">{t('assessmentForm.fields.otherInfo')}</label>
        <textarea id="child-outras-informacoes"
          value={value.otherInfo ?? ''}
          onChange={(e) => onChange('otherInfo', e.target.value)}
          placeholder={t('assessmentForm.fields.otherInfoPlaceholder')}
          disabled={disabled}
          style={{ ...textareaStyle, opacity: disabled ? 0.6 : 1 }}
        />
      </Box>
    </Flex>
  );
};

export default ChildForm;
