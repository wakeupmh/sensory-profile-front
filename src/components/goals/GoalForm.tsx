import React, { useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { colors, shadows, radii, fonts } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import type { Goal, CreateGoalPayload, UpdateGoalPayload, GoalDomain, GoalStatus } from '../../types/goals';
import { GOAL_DOMAIN_LABELS, GOAL_STATUS_LABELS } from '../../types/goals';

interface GoalFormProps {
  childId: string;
  initialValues?: Partial<Goal>;
  onSubmit: (payload: CreateGoalPayload | UpdateGoalPayload) => Promise<void>;
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
  ...inputStyle,
  height: 'auto',
  padding: '10px 12px',
  resize: 'vertical',
  minHeight: '64px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: fonts.display,
  fontSize: '13px',
  fontWeight: 600,
  color: colors.ink,
  marginBottom: '6px',
  display: 'block',
};

const domainOptions = Object.entries(GOAL_DOMAIN_LABELS) as [GoalDomain, string][];
const statusOptions = Object.entries(GOAL_STATUS_LABELS) as [GoalStatus, string][];

const GoalForm: React.FC<GoalFormProps> = ({ childId, initialValues = {}, onSubmit, onCancel, loading = false }) => {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [domain, setDomain] = useState<GoalDomain>(initialValues.domain ?? 'comunicacao');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [criteria, setCriteria] = useState(initialValues.criteria ?? '');
  const [baseline, setBaseline] = useState(initialValues.baseline?.toString() ?? '0');
  const [target, setTarget] = useState(initialValues.target?.toString() ?? '');
  const [unit, setUnit] = useState(initialValues.unit ?? '');
  const [status, setStatus] = useState<GoalStatus>(initialValues.status ?? 'active');
  const [startDate, setStartDate] = useState(initialValues.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(initialValues.targetDate?.slice(0, 10) ?? '');
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = submitting || loading || !title.trim() || target === '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    setSubmitting(true);
    try {
      await onSubmit({
        childId,
        title: title.trim(),
        domain,
        description: description.trim() || undefined,
        criteria: criteria.trim() || undefined,
        baseline: Number(baseline) || 0,
        target: Number(target),
        unit: unit.trim() || undefined,
        status,
        startDate,
        targetDate: targetDate || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <div>
          <label style={labelStyle} htmlFor="goal-titulo-da">
            Título da meta <span style={{ color: colors.error }} aria-hidden="true">*</span>
          </label>
          <input id="goal-titulo-da"
            type="text"
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Ampliar vocabulário funcional"
            style={inputStyle}
            required
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-dominio">Domínio</label>
            <select id="goal-dominio" value={domain} onChange={(e) => setDomain(e.target.value as GoalDomain)} style={inputStyle}>
              {domainOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-status">Status</label>
            <select id="goal-status" value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)} style={inputStyle}>
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </Flex>

        <div>
          <label style={labelStyle} htmlFor="goal-criterio-de">Critério de domínio</label>
          <textarea id="goal-criterio-de"
            maxLength={1000}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Ex: Critério de sucesso, contexto de aplicação..."
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="goal-descricao">Descrição</label>
          <textarea id="goal-descricao"
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes adicionais sobre a meta..."
            style={textareaStyle}
          />
        </div>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-baseline">Baseline</label>
            <input id="goal-baseline"
              type="number"
              step="any"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-meta">
              Meta <span style={{ color: colors.error }} aria-hidden="true">*</span>
            </label>
            <input id="goal-meta"
              type="number"
              step="any"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-unidade">Unidade</label>
            <input id="goal-unidade"
              type="text"
              maxLength={30}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex: palavras"
              style={inputStyle}
            />
          </div>
        </Flex>

        <Flex gap="3">
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-data-de">Data de início</label>
            <input id="goal-data-de" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="goal-data-alvo">Data alvo</label>
            <input id="goal-data-alvo" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={inputStyle} />
          </div>
        </Flex>

        <Flex gap="2" mt="2">
          <GumroadButton variant="primary" size="md" type="submit" disabled={isDisabled}>
            {submitting || loading ? 'Salvando...' : 'Salvar'}
          </GumroadButton>
          <GumroadButton variant="secondary" size="md" type="button" onClick={onCancel}>
            Cancelar
          </GumroadButton>
        </Flex>
      </Flex>
    </form>
  );
};

export default GoalForm;
