import { useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { medicationApi, comorbidityApi, appointmentApi } from '../services/api';
import type {
  CreateMedicationPayload,
  UpdateMedicationPayload,
  CreateComorbidityPayload,
  UpdateComorbidityPayload,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/medical';
import { useDomainPage } from '../hooks/useDomainPage';
import { useDomainResource } from '../hooks/useDomainResource';
import { ChildSelector } from '../components/domain/ChildSelector';
import { ErrorState } from '../components/domain/ErrorState';
import { previewItemStyle, emptyStyle } from '../components/domain/previewStyles';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import MedicationsPanel from '../components/medical/MedicationsPanel';
import ComorbiditiesPanel from '../components/medical/ComorbiditiesPanel';
import AppointmentsPanel from '../components/medical/AppointmentsPanel';
import { DomainListSkeleton } from '../components/skeletons/PageSkeletons';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MedicalPage() {
  const { children, selectedChildId, setSelectedChildId, effectiveChildId, getTokenRef } = useDomainPage();

  const [medsPanelOpen, setMedsPanelOpen] = useState(false);
  const [comorbidityPanelOpen, setComorbidityPanelOpen] = useState(false);
  const [appointmentPanelOpen, setAppointmentPanelOpen] = useState(false);

  // Três recursos independentes, e não um só: cada mutação nesta página
  // rebusca apenas a sua seção (são nove pontos de mutação). Juntar tudo num
  // `reload()` triplicaria o tráfego a cada alteração. De quebra, uma seção
  // que falha não apaga mais as outras duas.
  const childIdParam = selectedChildId || undefined;

  const meds = useDomainResource(
    (token) => medicationApi.list(token, { childId: childIdParam }),
    [childIdParam],
  );
  const comorbs = useDomainResource(
    (token) => comorbidityApi.list(token, { childId: childIdParam }),
    [childIdParam],
  );
  const appts = useDomainResource(
    async (token) => {
      const result = await appointmentApi.list(token, { childId: childIdParam });
      return result.data ?? result;
    },
    [childIdParam],
  );

  const medications = meds.data ?? [];
  const comorbidities = comorbs.data ?? [];
  const appointments = appts.data ?? [];

  // Esqueleto SÓ na primeira carga (`data` ainda nulo). Antes desta página
  // virar hook, os refetches por seção não mexiam em `loading`; com
  // `loading` puro, apagar um medicamento levava as três seções para o
  // esqueleto de uma vez. `data === null` distingue "ainda não carregou" de
  // "está recarregando o que já está na tela".
  const loading =
    (meds.loading && meds.data === null) ||
    (comorbs.loading && comorbs.data === null) ||
    (appts.loading && appts.data === null);
  // Erro da página inteira só quando as TRÊS seções falharam — aí não há o que
  // mostrar mesmo. Antes, o primeiro erro trocava a página toda por um
  // `ErrorState`, e uma seção fora do ar apagava as outras duas. É o benefício
  // que a divisão em três recursos prometia e que só agora está implementado.
  const error = meds.error && comorbs.error && appts.error ? meds.error : null;

  /** Erro de UMA seção, mostrado no lugar da lista daquela seção. */
  const sectionError = (resource: { error: string | null }, retry: () => void) =>
    resource.error ? (
      <Flex direction="column" gap="2" align="start" style={{ padding: '4px 0' }}>
        <GumroadText level="body-sm" as="p" style={{ color: colors['brand-salmon'] }}>
          {resource.error}
        </GumroadText>
        <GumroadButton variant="secondary" size="sm" onClick={retry}>
          Tentar novamente
        </GumroadButton>
      </Flex>
    ) : null;

  const fetchMedications = meds.reload;
  const fetchComorbidities = comorbs.reload;
  const fetchAppointments = appts.reload;
  const fetchAll = () => {
    fetchMedications();
    fetchComorbidities();
    fetchAppointments();
  };

  // Medication handlers
  const handleAddMedication = async (payload: CreateMedicationPayload) => {
    const token = await getTokenRef.current();
    await medicationApi.create(token, payload);
    await fetchMedications();
  };

  const handleEditMedication = async (id: string, payload: UpdateMedicationPayload) => {
    const token = await getTokenRef.current();
    await medicationApi.update(token, id, payload);
    await fetchMedications();
  };

  const handleDeleteMedication = async (id: string) => {
    const token = await getTokenRef.current();
    await medicationApi.delete(token, id);
    await fetchMedications();
  };

  // Comorbidity handlers
  const handleAddComorbidity = async (payload: CreateComorbidityPayload) => {
    const token = await getTokenRef.current();
    await comorbidityApi.create(token, payload);
    await fetchComorbidities();
  };

  const handleEditComorbidity = async (id: string, payload: UpdateComorbidityPayload) => {
    const token = await getTokenRef.current();
    await comorbidityApi.update(token, id, payload);
    await fetchComorbidities();
  };

  const handleDeleteComorbidity = async (id: string) => {
    const token = await getTokenRef.current();
    await comorbidityApi.delete(token, id);
    await fetchComorbidities();
  };

  // Appointment handlers
  const handleAddAppointment = async (payload: CreateAppointmentPayload) => {
    const token = await getTokenRef.current();
    await appointmentApi.create(token, payload);
    await fetchAppointments();
  };

  const handleEditAppointment = async (id: string, payload: UpdateAppointmentPayload) => {
    const token = await getTokenRef.current();
    await appointmentApi.update(token, id, payload);
    await fetchAppointments();
  };

  const handleDeleteAppointment = async (id: string) => {
    const token = await getTokenRef.current();
    await appointmentApi.delete(token, id);
    await fetchAppointments();
  };

  const activeMeds = medications.filter((m) => m.active);

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
      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChange={setSelectedChildId}
      />

      {/* Loading state */}
      {loading ? (
        <DomainListSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAll} />
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
            {sectionError(meds, fetchMedications) ??
             (children.length > 0 && medications.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              medications.slice(0, 3).map((med) => (
                <div key={med.id} style={previewItemStyle}>
                  {med.name}{med.dosage ? ` — ${med.dosage}` : ''}
                </div>
              ))
            ))}
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
            {sectionError(comorbs, fetchComorbidities) ??
             (children.length > 0 && comorbidities.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              comorbidities.slice(0, 3).map((c) => (
                <div key={c.id} style={previewItemStyle}>
                  {c.conditionName}{c.icdCode ? ` (${c.icdCode})` : ''}
                </div>
              ))
            ))}
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
            {sectionError(appts, fetchAppointments) ??
             (children.length > 0 && appointments.slice(0, 3).length === 0 ? (
              <p style={emptyStyle}>Nenhum registro</p>
            ) : (
              appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} style={previewItemStyle}>
                  {appt.occurredAt ? formatDate(appt.occurredAt) : '—'}
                  {appt.doctorName ? ` — ${appt.doctorName}` : ''}
                </div>
              ))
            ))}
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
