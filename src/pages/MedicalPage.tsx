import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { medicationApi, comorbidityApi, appointmentApi, childApi } from '../services/api';
import type { ChildData } from '../services/api';
import type {
  Medication,
  Comorbidity,
  MedicalAppointmentSummary,
  CreateMedicationPayload,
  UpdateMedicationPayload,
  CreateComorbidityPayload,
  UpdateComorbidityPayload,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/medical';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, shadows, radii, fonts } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import MedicationsPanel from '../components/medical/MedicationsPanel';
import ComorbiditiesPanel from '../components/medical/ComorbiditiesPanel';
import AppointmentsPanel from '../components/medical/AppointmentsPanel';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MedicalPage() {
  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [medications, setMedications] = useState<Medication[]>([]);
  const [comorbidities, setComorbidities] = useState<Comorbidity[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointmentSummary[]>([]);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medsPanelOpen, setMedsPanelOpen] = useState(false);
  const [comorbidityPanelOpen, setComorbidityPanelOpen] = useState(false);
  const [appointmentPanelOpen, setAppointmentPanelOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const childIdParam = selectedChildId || undefined;
      const [meds, comorbList, appts, childList] = await Promise.all([
        medicationApi.list(token, { childId: childIdParam }),
        comorbidityApi.list(token, { childId: childIdParam }),
        appointmentApi.list(token, { childId: childIdParam }),
        childApi.list(token),
      ]);
      setMedications(meds);
      setComorbidities(comorbList);
      setAppointments(appts.data ?? appts);
      setChildren(childList);
      setError(null);
    } catch {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (isLoaded && session) {
      fetchAll();
    }
  }, [fetchAll, isLoaded, session]);

  const effectiveChildId = selectedChildId || (children.length > 0 ? children[0].id : '');

  // Medication handlers
  const handleAddMedication = async (payload: CreateMedicationPayload) => {
    const token = await getTokenRef.current();
    await medicationApi.create(token, payload);
    await fetchAll();
  };

  const handleEditMedication = async (id: string, payload: UpdateMedicationPayload) => {
    const token = await getTokenRef.current();
    await medicationApi.update(token, id, payload);
    await fetchAll();
  };

  const handleDeleteMedication = async (id: string) => {
    const token = await getTokenRef.current();
    await medicationApi.delete(token, id);
    await fetchAll();
  };

  // Comorbidity handlers
  const handleAddComorbidity = async (payload: CreateComorbidityPayload) => {
    const token = await getTokenRef.current();
    await comorbidityApi.create(token, payload);
    await fetchAll();
  };

  const handleEditComorbidity = async (id: string, payload: UpdateComorbidityPayload) => {
    const token = await getTokenRef.current();
    await comorbidityApi.update(token, id, payload);
    await fetchAll();
  };

  const handleDeleteComorbidity = async (id: string) => {
    const token = await getTokenRef.current();
    await comorbidityApi.delete(token, id);
    await fetchAll();
  };

  // Appointment handlers
  const handleAddAppointment = async (payload: CreateAppointmentPayload) => {
    const token = await getTokenRef.current();
    await appointmentApi.create(token, payload);
    await fetchAll();
  };

  const handleEditAppointment = async (id: string, payload: UpdateAppointmentPayload) => {
    const token = await getTokenRef.current();
    await appointmentApi.update(token, id, payload);
    await fetchAll();
  };

  const handleDeleteAppointment = async (id: string) => {
    const token = await getTokenRef.current();
    await appointmentApi.delete(token, id);
    await fetchAll();
  };

  const activeMeds = medications.filter((m) => m.active);

  const previewItemStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    padding: `${spacing.xs} 0`,
    borderBottom: `1px solid rgba(10,10,26,0.1)`,
  };

  const emptyStyle: React.CSSProperties = {
    fontSize: '14px',
    color: colors.ink,
    fontFamily: fonts.body,
    opacity: 0.5,
    fontStyle: 'italic',
  };

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            Histórico Médico
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Medicamentos, diagnósticos e consultas
          </GumroadText>
        </Box>
      </Flex>

      {/* Child filter */}
      {children.length > 0 && (
        <Box mb="4">
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            style={{
              height: '44px',
              padding: '0 12px',
              backgroundColor: colors.surface,
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              fontFamily: fonts.display,
              fontSize: '14px',
              fontWeight: 500,
              color: colors.ink,
              cursor: 'pointer',
              boxShadow: shadows['card-sm'],
              minWidth: '200px',
            }}
          >
            <option value="">Todas as crianças</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Box>
      )}

      {/* Loading state */}
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando..." />
        </GumroadCard>
      ) : error ? (
        <GumroadCard color="salmon" shadow="md" padding="lg">
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="4">
          {/* Medicamentos Ativos */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Medicamentos Ativos
                </GumroadHeading>
                <GumroadBadge color="cyan">{activeMeds.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setMedsPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {medications.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              medications.slice(0, 3).map((med) => (
                <div key={med.id} style={previewItemStyle}>
                  {med.name}{med.dosage ? ` — ${med.dosage}` : ''}
                </div>
              ))
            )}
          </GumroadCard>

          {/* Diagnósticos */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Diagnósticos
                </GumroadHeading>
                <GumroadBadge color="lavender">{comorbidities.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setComorbidityPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {comorbidities.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              comorbidities.slice(0, 3).map((c) => (
                <div key={c.id} style={previewItemStyle}>
                  {c.conditionName}{c.icdCode ? ` (${c.icdCode})` : ''}
                </div>
              ))
            )}
          </GumroadCard>

          {/* Consultas */}
          <GumroadCard color="cream" shadow="md" padding="lg">
            <Flex justify="between" align="center" mb="3" gap="2">
              <Flex align="center" gap="2">
                <GumroadHeading level="title-md" as="h2">
                  Consultas
                </GumroadHeading>
                <GumroadBadge color="yellow">{appointments.length}</GumroadBadge>
              </Flex>
              <GumroadButton
                variant="secondary"
                size="sm"
                onClick={() => effectiveChildId && setAppointmentPanelOpen(true)}
                disabled={!effectiveChildId}
              >
                Gerenciar
              </GumroadButton>
            </Flex>
            {appointments.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} style={previewItemStyle}>
                  {appt.appointmentDate ? formatDate(appt.appointmentDate) : '—'}
                  {appt.doctorName ? ` — ${appt.doctorName}` : ''}
                </div>
              ))
            )}
          </GumroadCard>
        </Flex>
      )}

      {/* Panels */}
      <MedicationsPanel
        isOpen={medsPanelOpen}
        onClose={() => setMedsPanelOpen(false)}
        childId={effectiveChildId}
        medications={medications}
        onAdd={handleAddMedication}
        onEdit={handleEditMedication}
        onDelete={handleDeleteMedication}
      />

      <ComorbiditiesPanel
        isOpen={comorbidityPanelOpen}
        onClose={() => setComorbidityPanelOpen(false)}
        childId={effectiveChildId}
        comorbidities={comorbidities}
        onAdd={handleAddComorbidity}
        onEdit={handleEditComorbidity}
        onDelete={handleDeleteComorbidity}
      />

      <AppointmentsPanel
        isOpen={appointmentPanelOpen}
        onClose={() => setAppointmentPanelOpen(false)}
        childId={effectiveChildId}
        appointments={appointments}
        onAdd={handleAddAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
      />
    </Box>
  );
}
