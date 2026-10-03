import { useState, useEffect, useCallback, useRef } from 'react';
import { parseLocalDate } from '../utils/date';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Box, Flex } from '@radix-ui/themes';
import { ArrowLeftIcon, ExclamationTriangleIcon, Share2Icon } from '@radix-ui/react-icons';
import { childApi, comorbidityApi, medicationApi } from '../services/api';
import type { ChildData } from '../services/api';
import type { Comorbidity, Medication } from '../types/medical';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, radii, fonts } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';

interface CareNotes {
  sensoryTriggers: string;
  calmingStrategies: string;
  emergencyContact: string;
}

const EMPTY_NOTES: CareNotes = { sensoryTriggers: '', calmingStrategies: '', emergencyContact: '' };
const SAVE_DEBOUNCE_MS = 600;

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function calculateAge(birthDate: string, t: TFunction): string {
  const birth = parseLocalDate(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  const monthsText = t('p1Ficha.months', { count: months });
  if (years <= 0) return monthsText;
  const yearsText = t('p1Ficha.years', { count: years });
  return months > 0 ? t('p1Ficha.ageJoin', { years: yearsText, months: monthsText }) : yearsText;
}

function formatBirthDate(birthDate: string, locale: string): string {
  return parseLocalDate(birthDate).toLocaleDateString(locale);
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '60px',
  padding: '10px 12px',
  backgroundColor: colors.surface,
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  fontFamily: fonts.display,
  fontSize: '14px',
  color: colors.ink,
  resize: 'vertical',
  boxSizing: 'border-box',
};

const printLabelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 700,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const SAVE_STATUS_KEYS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'p1Ficha.saving',
  saved: 'p1Ficha.saved',
  error: 'p1Ficha.saveError',
};

export default function FichaCriancaPage() {
  const { t, i18n } = useTranslation();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [child, setChild] = useState<ChildData | null>(null);
  const [comorbidities, setComorbidities] = useState<Comorbidity[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState<CareNotes>(EMPTY_NOTES);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!childId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await getTokenRef.current();
      const [childData, comorbidityList, medicationList] = await Promise.all([
        childApi.get(childId, token),
        comorbidityApi.list(token, { childId }),
        medicationApi.list(token, { childId, active: true }),
      ]);
      setChild(childData);
      setComorbidities(comorbidityList);
      setMedications(medicationList);
      setNotes({
        sensoryTriggers: childData.sensoryTriggers ?? '',
        calmingStrategies: childData.calmingStrategies ?? '',
        emergencyContact: childData.emergencyContact ?? '',
      });
    } catch {
      setError(t('p1Ficha.errLoad'));
    } finally {
      setLoading(false);
    }
  }, [childId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveNotes = useCallback(async (snapshot: CareNotes) => {
    if (!childId) return;
    setSaveStatus('saving');
    try {
      const token = await getTokenRef.current();
      await childApi.update(childId, snapshot, token);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [childId]);

  // Edição ainda não enviada: se o usuário sair da página dentro da janela do
  // debounce, grava na saída em vez de descartar o que acabou de digitar.
  const pendingNotesRef = useRef<CareNotes | null>(null);
  const saveNotesRef = useRef(saveNotes);
  saveNotesRef.current = saveNotes;

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      if (pendingNotesRef.current) {
        const snapshot = pendingNotesRef.current;
        pendingNotesRef.current = null;
        void saveNotesRef.current(snapshot);
      }
    };
  }, []);

  const updateNotes = (patch: Partial<CareNotes>) => {
    const next = { ...notes, ...patch };
    setNotes(next);
    pendingNotesRef.current = next;
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      pendingNotesRef.current = null;
      void saveNotes(next);
    }, SAVE_DEBOUNCE_MS);
  };

  const handlePrint = () => {
    const styleId = 'ficha-crianca-print-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @media print {
          body * { visibility: hidden !important; }
          #ficha-crianca-print, #ficha-crianca-print * { visibility: visible !important; }
          #ficha-crianca-print {
            position: absolute !important;
            left: 0; top: 0; width: 100%;
            padding: 24px;
            background: white !important;
            color: black !important;
          }
          #ficha-crianca-print textarea {
            border: 1px solid #999 !important;
          }
          #ficha-crianca-print .screen-only {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    window.print();
  };

  return (
    <Box style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Flex justify="between" align="center" mb="5" gap="3" wrap="wrap">
        <GumroadButton variant="secondary" size="sm" onClick={() => navigate(childId ? `/children/${childId}` : '/children')}>
          <ArrowLeftIcon aria-hidden="true" />
          {t('p1Ficha.back')}
        </GumroadButton>
        {child && (
          <GumroadButton variant="primary" size="sm" onClick={handlePrint}>
            <Share2Icon aria-hidden="true" />
            {t('p1Ficha.print')}
          </GumroadButton>
        )}
      </Flex>

      {error && (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon aria-hidden="true" />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
            <GumroadButton variant="primary" size="sm" onClick={fetchData}>{t('p1Common.retry')}</GumroadButton>
          </Flex>
        </GumroadCard>
      )}

      {loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text={t('p1Ficha.loading')} /></Flex>
      ) : child ? (
        <div id="ficha-crianca-print">
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            {t('p1Ficha.title', { name: child.name })}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.lg }}>
            {t('p1Ficha.subtitle')}
          </GumroadText>

          <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <Flex gap="4" wrap="wrap">
              <Box>
                <span style={printLabelStyle}>{t('p1Ficha.birth')}</span>
                <GumroadText level="body-md" as="p">
                  {formatBirthDate(child.birthDate, i18n.language)} ({calculateAge(child.birthDate, t)})
                </GumroadText>
              </Box>
              {child.gender && (
                <Box>
                  <span style={printLabelStyle}>{t('p1Ficha.gender')}</span>
                  <GumroadText level="body-md" as="p">{['male', 'female', 'other'].includes(child.gender) ? t(`p1Children.${child.gender}`) : child.gender}</GumroadText>
                </Box>
              )}
            </Flex>
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>{t('p1Ficha.diagnoses')}</span>
            {comorbidities.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                {t('p1Ficha.noDiagnoses')}
              </GumroadText>
            ) : (
              <Flex direction="column" gap="1">
                {comorbidities.map((c) => (
                  <GumroadText key={c.id} level="body-sm" as="p">
                    • {c.conditionName}{c.icdCode ? ` (${c.icdCode})` : ''}
                  </GumroadText>
                ))}
              </Flex>
            )}
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>{t('p1Ficha.meds')}</span>
            {medications.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                {t('p1Ficha.noMeds')}
              </GumroadText>
            ) : (
              <Flex direction="column" gap="1">
                {medications.map((m) => (
                  <GumroadText key={m.id} level="body-sm" as="p">
                    • {m.name}{m.dosage ? ` — ${m.dosage}` : ''}{m.frequency ? `, ${m.frequency}` : ''}
                  </GumroadText>
                ))}
              </Flex>
            )}
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>{t('p1Ficha.triggers')}</span>
            <textarea
              value={notes.sensoryTriggers}
              onChange={(e) => updateNotes({ sensoryTriggers: e.target.value })}
              placeholder={t('p1Ficha.triggersPh')}
              style={textareaStyle}
              aria-label={t('p1Ficha.triggers')}
            />
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>{t('p1Ficha.calming')}</span>
            <textarea
              value={notes.calmingStrategies}
              onChange={(e) => updateNotes({ calmingStrategies: e.target.value })}
              placeholder={t('p1Ficha.calmingPh')}
              style={textareaStyle}
              aria-label={t('p1Ficha.calming')}
            />
          </GumroadCard>

          <GumroadCard color="yellow" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>{t('p1Ficha.emergency')}</span>
            <textarea
              value={notes.emergencyContact}
              onChange={(e) => updateNotes({ emergencyContact: e.target.value })}
              placeholder={t('p1Ficha.emergencyPh')}
              style={{ ...textareaStyle, minHeight: '40px', backgroundColor: colors.canvas }}
              aria-label={t('p1Ficha.emergency')}
            />
          </GumroadCard>

          {saveStatus !== 'idle' && (
            <p
              role="status"
              className="screen-only"
              style={{
                fontFamily: fonts.display,
                fontSize: '12px',
                opacity: 0.6,
                marginTop: spacing.sm,
                color: saveStatus === 'error' ? colors.error : colors.ink,
              }}
            >
              {t(SAVE_STATUS_KEYS[saveStatus])}
            </p>
          )}

          <GumroadText level="caption" as="p" style={{ opacity: 0.5, marginTop: spacing.md }}>
            {t('p1Ficha.generated', { date: new Date().toLocaleString(i18n.language) })}
          </GumroadText>
        </div>
      ) : null}

      {!loading && !child && !error && (
        <Link to="/children" style={{ textDecoration: 'none' }}>
          <GumroadText level="body-sm" as="span">{t('p1Ficha.backToChildren')}</GumroadText>
        </Link>
      )}
    </Box>
  );
}
