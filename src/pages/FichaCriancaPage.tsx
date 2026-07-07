import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

interface FichaNotes {
  triggers: string;
  calmingStrategies: string;
  emergencyContact: string;
}

const EMPTY_NOTES: FichaNotes = { triggers: '', calmingStrategies: '', emergencyContact: '' };

function notesKey(childId: string): string {
  return `ficha-crianca-notes-${childId}`;
}

function loadNotes(childId: string): FichaNotes {
  try {
    const raw = localStorage.getItem(notesKey(childId));
    return raw ? { ...EMPTY_NOTES, ...JSON.parse(raw) } : EMPTY_NOTES;
  } catch {
    return EMPTY_NOTES;
  }
}

function calculateAge(birthDate: string): string {
  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years <= 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
}

function formatBirthDate(birthDate: string): string {
  return new Date(`${birthDate}T00:00:00`).toLocaleDateString('pt-BR');
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

export default function FichaCriancaPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [child, setChild] = useState<ChildData | null>(null);
  const [comorbidities, setComorbidities] = useState<Comorbidity[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState<FichaNotes>(EMPTY_NOTES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;
    setNotes(loadNotes(childId));
  }, [childId]);

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
    } catch {
      setError('Erro ao carregar a ficha. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateNotes = (patch: Partial<FichaNotes>) => {
    if (!childId) return;
    setNotes((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(notesKey(childId), JSON.stringify(next));
      } catch {
        // localStorage indisponível (modo privado, quota) — mantém em memória só nesta sessão
      }
      return next;
    });
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
          <ArrowLeftIcon />
          Voltar
        </GumroadButton>
        {child && (
          <GumroadButton variant="primary" size="sm" onClick={handlePrint}>
            <Share2Icon />
            Imprimir / Exportar
          </GumroadButton>
        )}
      </Flex>

      {error && (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {loading ? (
        <Flex justify="center" py="6"><LoadingSpinner size="medium" text="Carregando ficha..." /></Flex>
      ) : child ? (
        <div id="ficha-crianca-print">
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Ficha da Criança — {child.name}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7, marginBottom: spacing.lg }}>
            Documento de referência rápida para escola, cuidadores e emergências
          </GumroadText>

          <GumroadCard color="cream" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <Flex gap="4" wrap="wrap">
              <Box>
                <span style={printLabelStyle}>Nascimento</span>
                <GumroadText level="body-md" as="p">
                  {formatBirthDate(child.birthDate)} ({calculateAge(child.birthDate)})
                </GumroadText>
              </Box>
              {child.gender && (
                <Box>
                  <span style={printLabelStyle}>Gênero</span>
                  <GumroadText level="body-md" as="p">{child.gender}</GumroadText>
                </Box>
              )}
            </Flex>
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>Diagnósticos</span>
            {comorbidities.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                Nenhum diagnóstico registrado
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
            <span style={printLabelStyle}>Medicações em uso</span>
            {medications.length === 0 ? (
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                Nenhuma medicação ativa registrada
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
            <span style={printLabelStyle}>Gatilhos sensoriais conhecidos</span>
            <textarea
              value={notes.triggers}
              onChange={(e) => updateNotes({ triggers: e.target.value })}
              placeholder="Ex.: barulhos altos e inesperados, luzes fluorescentes, aglomerações..."
              style={textareaStyle}
              aria-label="Gatilhos sensoriais conhecidos"
            />
          </GumroadCard>

          <GumroadCard color="white" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>O que ajuda a acalmar</span>
            <textarea
              value={notes.calmingStrategies}
              onChange={(e) => updateNotes({ calmingStrategies: e.target.value })}
              placeholder="Ex.: fone abafador, objeto de apego, contar até 10 em voz baixa..."
              style={textareaStyle}
              aria-label="O que ajuda a acalmar"
            />
          </GumroadCard>

          <GumroadCard color="yellow" shadow="md" padding="lg" style={{ marginBottom: spacing.md }}>
            <span style={printLabelStyle}>Contato de emergência</span>
            <textarea
              value={notes.emergencyContact}
              onChange={(e) => updateNotes({ emergencyContact: e.target.value })}
              placeholder="Nome, parentesco e telefone"
              style={{ ...textareaStyle, minHeight: '40px', backgroundColor: colors.canvas }}
              aria-label="Contato de emergência"
            />
          </GumroadCard>

          <GumroadText level="caption" as="p" style={{ opacity: 0.6, marginTop: spacing.sm }} className="screen-only">
            Os campos de texto acima são salvos apenas neste aparelho (não sincronizam entre dispositivos). Imprima ou exporte após preencher.
          </GumroadText>

          <GumroadText level="caption" as="p" style={{ opacity: 0.5, marginTop: spacing.md }}>
            Gerado em {new Date().toLocaleString('pt-BR')}
          </GumroadText>
        </div>
      ) : null}

      {!loading && !child && !error && (
        <Link to="/children" style={{ textDecoration: 'none' }}>
          <GumroadText level="body-sm" as="span">Voltar para crianças</GumroadText>
        </Link>
      )}
    </Box>
  );
}
