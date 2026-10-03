import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { parseLocalDate } from '../../utils/date';
import { Flex, Box } from '@radix-ui/themes';
import { childApi, ChildData } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { colors, shadows, radii, spacing, typography } from '../../theme/tokens';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import GumroadButton from '../design-system/GumroadButton';
import ChildForm, { ChildFormValue } from './ChildForm';

interface ChildPickerProps {
  selectedId: string | null;
  onSelect: (child: ChildData) => void;
}

function computeAge(birthDate: string): number {
  const bd = parseLocalDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

const EMPTY_FORM: ChildFormValue = {
  name: '',
  birthDate: '',
  gender: '',
  nationalIdentity: '',
  otherInfo: '',
};

const ChildPicker: React.FC<ChildPickerProps> = ({ selectedId, onSelect }) => {
  const { getToken } = useAuthContext();
  const { t } = useTranslation();
  const genderLabel: Record<string, string> = {
    male: t('assessmentForm.fields.male'),
    female: t('assessmentForm.fields.female'),
    other: t('assessmentForm.fields.other'),
  };

  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formValue, setFormValue] = useState<ChildFormValue>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [missingSelected, setMissingSelected] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // A lista é buscada uma vez; selecionar uma criança não deve recarregá-la
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const token = await getToken();
      const list = await childApi.list(token);
      setChildren(list);
      const current = selectedIdRef.current;
      if (current && list.length > 0 && !list.find((c) => c.id === current)) {
        setMissingSelected(true);
      }
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFormChange = (field: string, value: string) => {
    setFormValue((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formValue.name || !formValue.birthDate || !formValue.gender) {
      setSaveError(t('assessmentForm.childPicker.requiredFields'));
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      const token = await getToken();
      const payload = {
        name: formValue.name,
        birthDate: formValue.birthDate,
        gender: formValue.gender as 'male' | 'female' | 'other',
        nationalIdentity: formValue.nationalIdentity || undefined,
        otherInfo: formValue.otherInfo || undefined,
      };
      const newChild = await childApi.create(payload, token);
      setChildren((prev) => [...prev, newChild]);
      setShowForm(false);
      setFormValue(EMPTY_FORM);
      setMissingSelected(false);
      onSelect(newChild);
    } catch {
      setSaveError(t('assessmentForm.childPicker.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormValue(EMPTY_FORM);
    setSaveError(null);
  };

  if (loading) {
    return (
      <Box role="status" style={{ padding: spacing.lg }}>
        <GumroadText level="body-md">{t('assessmentForm.childPicker.loading')}</GumroadText>
      </Box>
    );
  }

  return (
    <Box>
      <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '16px' }}>
        {t('assessmentForm.childPicker.title')}
      </GumroadHeading>

      {missingSelected && (
        <Box
          style={{
            backgroundColor: colors['surface-cream'],
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            padding: `${spacing.sm} ${spacing.md}`,
            marginBottom: spacing.md,
          }}
        >
          <GumroadText level="body-sm" style={{ color: colors.ink }}>
            {t('assessmentForm.childPicker.removed')}
          </GumroadText>
        </Box>
      )}

      {loadError && (
        <Box role="alert" style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-md" style={{ color: colors.error }}>
            {t('assessmentForm.childPicker.loadError')}
          </GumroadText>
          <Box mt="2">
            <GumroadButton variant="secondary" size="sm" onClick={load}>
              {t('assessmentForm.childPicker.retry')}
            </GumroadButton>
          </Box>
        </Box>
      )}

      {children.length === 0 && !showForm && !loadError && (
        <Box style={{ marginBottom: spacing.md }}>
          <GumroadText level="body-md" style={{ color: colors['ink-muted'] }}>
            {t('assessmentForm.childPicker.empty')}
          </GumroadText>
        </Box>
      )}

      {/* Grid of child cards + "Nova Criança" card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: spacing.md,
          marginBottom: showForm ? spacing.md : 0,
        }}
      >
        {children.map((child) => {
          const isSelected = child.id === selectedId;
          const age = child.birthDate ? computeAge(child.birthDate) : null;

          return (
            <button
              key={child.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setMissingSelected(false);
                onSelect(child);
              }}
              style={{
                position: 'relative',
                backgroundColor: isSelected ? colors['brand-cyan'] : colors.surface,
                border: `2px solid ${colors.ink}`,
                borderRadius: radii.lg,
                boxShadow: isSelected ? `4px 4px 0px ${colors.ink}` : shadows['card-sm'],
                padding: spacing.md,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px, -2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = isSelected
                  ? `4px 4px 0px ${colors.ink}`
                  : shadows['card-sm'];
              }}
            >
              {/* Checkmark when selected */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: colors.ink,
                  }}
                >
                  ✓
                </span>
              )}

              <div
                style={{
                  fontFamily: typography['title-md'].font,
                  fontSize: typography['title-md'].size,
                  fontWeight: typography['title-md'].weight,
                  color: colors.ink,
                  marginBottom: '6px',
                  paddingRight: isSelected ? '20px' : 0,
                }}
              >
                {child.name}
              </div>

              {age !== null && (
                <div style={{ fontSize: '13px', color: colors.ink, marginBottom: '4px' }}>
                  {age} {age === 1 ? t('assessmentForm.childPicker.year') : t('assessmentForm.childPicker.years')}
                </div>
              )}

              {child.gender && (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: colors.ink,
                    color: colors.surface,
                    borderRadius: radii.pill,
                    padding: '2px 8px',
                  }}
                >
                  {genderLabel[child.gender] ?? child.gender}
                </span>
              )}
            </button>
          );
        })}

        {/* "Nova Criança" card */}
        <button
          type="button"
          aria-expanded={showForm}
          onClick={() => setShowForm((v) => !v)}
          style={{
            backgroundColor: showForm ? colors['brand-yellow'] : colors.canvas,
            border: `2px dashed ${colors.ink}`,
            borderRadius: radii.lg,
            boxShadow: shadows['card-sm'],
            padding: spacing.md,
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90px',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px, -2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows.card;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translate(0, 0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = shadows['card-sm'];
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1, color: colors.ink }}>+</span>
          <span
            style={{
              fontFamily: typography['title-sm'].font,
              fontSize: typography['title-sm'].size,
              fontWeight: typography['title-sm'].weight,
              color: colors.ink,
            }}
          >
            {t('assessmentForm.childPicker.newChild')}
          </span>
        </button>
      </div>

      {/* Inline new-child form */}
      {showForm && (
        <Box
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.lg,
            boxShadow: shadows.card,
            padding: spacing.lg,
            marginTop: spacing.md,
          }}
        >
          <GumroadHeading level="title-md" as="h3" style={{ marginBottom: '16px' }}>
            {t('assessmentForm.childPicker.newChild')}
          </GumroadHeading>

          <ChildForm value={formValue} onChange={handleFormChange} disabled={saving} />

          {saveError && (
            <Box mt="2" role="alert">
              <GumroadText level="body-sm" style={{ color: colors.error }}>{saveError}</GumroadText>
            </Box>
          )}

          <Flex gap="3" mt="4" justify="end">
            <GumroadButton variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
              {t('assessmentForm.buttons.cancel')}
            </GumroadButton>
            <GumroadButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? t('assessmentForm.saving') : t('assessmentForm.childPicker.save')}
            </GumroadButton>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ChildPicker;
