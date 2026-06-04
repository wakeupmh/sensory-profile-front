import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { PlusIcon, Pencil1Icon, TrashIcon, InfoCircledIcon, ExclamationTriangleIcon, Cross2Icon } from '@radix-ui/react-icons';
import { childApi, ChildData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, zIndex, shadows, radii } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import ChildForm, { ChildFormValue } from '../components/sensory-profile/ChildForm';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 0) return '0 anos';
  if (age === 1) return '1 ano';
  return `${age} anos`;
}

const genderLabel: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
};

const emptyFormValue = (): ChildFormValue => ({
  name: '',
  birthDate: '',
  gender: '',
  nationalIdentity: '',
  otherInfo: '',
});

function childDataToFormValue(child: ChildData): ChildFormValue {
  return {
    name: child.name,
    birthDate: child.birthDate,
    gender: child.gender ?? '',
    nationalIdentity: child.nationalIdentity ?? '',
    otherInfo: child.otherInfo ?? '',
  };
}

interface ChildFormModalProps {
  title: string;
  value: ChildFormValue;
  onChange: (field: keyof ChildFormValue, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

// Bottom-sheet modal compartilhado por adicionar/editar criança
const ChildFormModal = ({ title, value, onChange, onSave, onCancel, saving }: ChildFormModalProps) => (
  <div
    className="modal-overlay"
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: zIndex.modal,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}
    onClick={(e) => { if (e.target === e.currentTarget && !saving) onCancel(); }}
  >
    <div
      className="modal-sheet"
      style={{
        backgroundColor: colors.canvas,
        border: `2px solid ${colors.ink}`,
        borderBottom: 'none',
        borderRadius: `${radii.xl} ${radii.xl} 0 0`,
        boxShadow: shadows['card-hover'],
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: spacing.xl,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
    >
      <Flex justify="between" align="center" mb="4">
        <GumroadHeading level="title-lg" as="h3">{title}</GumroadHeading>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Fechar"
          style={{
            background: 'none',
            border: `2px solid ${colors.ink}`,
            borderRadius: radii.md,
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: shadows.button,
          }}
        >
          <Cross2Icon width={16} height={16} />
        </button>
      </Flex>
      <ChildForm value={value} onChange={onChange} disabled={saving} />
      <Flex gap="3" mt="4">
        <GumroadButton
          variant="primary"
          size="sm"
          onClick={onSave}
          disabled={saving || !value.name || !value.birthDate}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </GumroadButton>
        <GumroadButton variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
          Cancelar
        </GumroadButton>
      </Flex>
    </div>
  </div>
);

const Children = () => {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state: childId → current form value (null means not editing)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormValue, setEditFormValue] = useState<ChildFormValue>(emptyFormValue());
  const [editSaving, setEditSaving] = useState(false);

  // Adding state
  const [adding, setAdding] = useState(false);
  const [addFormValue, setAddFormValue] = useState<ChildFormValue>(emptyFormValue());
  const [addSaving, setAddSaving] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const { getToken, isLoaded, session } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const data = await childApi.list(token);
      setChildren(data);
      setError(null);
    } catch {
      setError('Erro ao carregar crianças. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && session) {
      fetchChildren();
    }
  }, [fetchChildren, isLoaded, session]);

  const handleStartEdit = (child: ChildData) => {
    setEditingId(child.id);
    setEditFormValue(childDataToFormValue(child));
    setAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormValue(emptyFormValue());
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      const token = await getTokenRef.current();
      const payload = {
        name: editFormValue.name,
        birthDate: editFormValue.birthDate,
        ...(editFormValue.gender ? { gender: editFormValue.gender as 'male' | 'female' | 'other' } : {}),
        ...(editFormValue.nationalIdentity ? { nationalIdentity: editFormValue.nationalIdentity } : {}),
        ...(editFormValue.otherInfo ? { otherInfo: editFormValue.otherInfo } : {}),
      };
      await childApi.update(editingId, payload, token);
      await fetchChildren();
      setEditingId(null);
      setEditFormValue(emptyFormValue());
    } catch {
      setError('Erro ao salvar criança. Por favor, tente novamente.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleStartAdd = () => {
    setAdding(true);
    setAddFormValue(emptyFormValue());
    setEditingId(null);
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setAddFormValue(emptyFormValue());
  };

  const handleSaveAdd = async () => {
    setAddSaving(true);
    try {
      const token = await getTokenRef.current();
      const payload = {
        name: addFormValue.name,
        birthDate: addFormValue.birthDate,
        ...(addFormValue.gender ? { gender: addFormValue.gender as 'male' | 'female' | 'other' } : {}),
        ...(addFormValue.nationalIdentity ? { nationalIdentity: addFormValue.nationalIdentity } : {}),
        ...(addFormValue.otherInfo ? { otherInfo: addFormValue.otherInfo } : {}),
      };
      await childApi.create(payload, token);
      await fetchChildren();
      setAdding(false);
      setAddFormValue(emptyFormValue());
    } catch {
      setError('Erro ao criar criança. Por favor, tente novamente.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleDelete = async (child: ChildData) => {
    const confirmed = window.confirm(
      `Excluir ${child.name}? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeleteLoading(child.id);
    try {
      const token = await getTokenRef.current();
      await childApi.delete(child.id, token);
      setChildren((prev) => prev.filter((c) => c.id !== child.id));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        alert('Esta criança possui avaliações e não pode ser excluída.');
      } else {
        setError('Erro ao excluir criança. Por favor, tente novamente.');
      }
    } finally {
      setDeleteLoading(null);
    }
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
            Minhas Crianças
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            Gerencie o cadastro das crianças
          </GumroadText>
        </Box>
        <GumroadButton
          variant="primary"
          size="md"
          onClick={handleStartAdd}
          disabled={adding}
        >
          <PlusIcon />
          Adicionar Criança
        </GumroadButton>
      </Flex>

      {/* Error banner */}
      {error && (
        <GumroadCard color="salmon" shadow="md" padding="md" style={{ marginBottom: spacing.lg }}>
          <Flex align="center" gap="2">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="p">{error}</GumroadText>
          </Flex>
        </GumroadCard>
      )}

      {/* Add form — bottom-sheet modal */}
      {adding && (
        <ChildFormModal
          title="Nova Criança"
          value={addFormValue}
          onChange={(field, value) => setAddFormValue((prev) => ({ ...prev, [field]: value }))}
          onSave={handleSaveAdd}
          onCancel={handleCancelAdd}
          saving={addSaving}
        />
      )}

      {/* Edit form — bottom-sheet modal */}
      {editingId && (
        <ChildFormModal
          title="Editar Criança"
          value={editFormValue}
          onChange={(field, value) => setEditFormValue((prev) => ({ ...prev, [field]: value }))}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          saving={editSaving}
        />
      )}

      {/* Content */}
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando crianças..." />
        </GumroadCard>
      ) : !error && children.length === 0 && !adding ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                Nenhuma criança cadastrada
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                Clique em "Adicionar Criança" para começar.
              </GumroadText>
            </Box>
          </Flex>
        </GumroadCard>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {children.map((child) => {
            return (
              <GumroadCard key={child.id} color="white" shadow="md" padding="lg">
                <Flex direction="column" gap="3" style={{ height: '100%' }}>
                  {(
                    <>
                      {/* Card header */}
                      <Flex justify="between" align="start" gap="2">
                        <GumroadHeading
                          level="title-lg"
                          as="h3"
                          style={{ wordBreak: 'break-word', flex: 1 }}
                        >
                          {child.name}
                        </GumroadHeading>
                        {child.gender && (
                          <GumroadBadge color="lavender">
                            {genderLabel[child.gender] ?? child.gender}
                          </GumroadBadge>
                        )}
                      </Flex>

                      {/* Details */}
                      <Flex direction="column" gap="1">
                        {child.birthDate && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>Idade:</strong> {calculateAge(child.birthDate)}
                          </GumroadText>
                        )}
                        {child.nationalIdentity && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>Documento:</strong> {child.nationalIdentity}
                          </GumroadText>
                        )}
                        {child.otherInfo && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>Obs:</strong> {child.otherInfo}
                          </GumroadText>
                        )}
                      </Flex>

                      {/* Actions */}
                      <Flex gap="2" mt="auto" pt="2" wrap="wrap">
                        <GumroadButton variant="primary" size="sm" asChild style={{ flex: 1 }}>
                          <Link
                            to={`/children/${child.id}`}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            Ver Perfil
                          </Link>
                        </GumroadButton>
                        <GumroadButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartEdit(child)}
                          style={{ flex: 1 }}
                        >
                          <Pencil1Icon />
                          Editar
                        </GumroadButton>
                        <GumroadButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(child)}
                          disabled={deleteLoading === child.id}
                          style={{ flex: 1 }}
                        >
                          <TrashIcon />
                          {deleteLoading === child.id ? 'Excluindo...' : 'Excluir'}
                        </GumroadButton>
                      </Flex>
                    </>
                  )}
                </Flex>
              </GumroadCard>
            );
          })}
        </div>
      )}
    </Box>
  );
};

export default Children;
