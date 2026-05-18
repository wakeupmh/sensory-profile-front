import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { PlusIcon, Pencil1Icon, TrashIcon, InfoCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { childApi, ChildData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing } from '../theme/tokens';
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

      {/* Add form */}
      {adding && (
        <GumroadCard color="cyan" shadow="md" padding="lg" style={{ marginBottom: spacing.lg }}>
          <GumroadHeading level="title-lg" as="h3" style={{ marginBottom: spacing.md }}>
            Nova Criança
          </GumroadHeading>
          <ChildForm
            value={addFormValue}
            onChange={(field, value) => setAddFormValue((prev) => ({ ...prev, [field]: value }))}
            disabled={addSaving}
          />
          <Flex gap="3" mt="4">
            <GumroadButton
              variant="primary"
              size="sm"
              onClick={handleSaveAdd}
              disabled={addSaving || !addFormValue.name || !addFormValue.birthDate}
            >
              {addSaving ? 'Salvando...' : 'Salvar'}
            </GumroadButton>
            <GumroadButton variant="secondary" size="sm" onClick={handleCancelAdd} disabled={addSaving}>
              Cancelar
            </GumroadButton>
          </Flex>
        </GumroadCard>
      )}

      {/* Content */}
      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text="Carregando crianças..." />
        </GumroadCard>
      ) : children.length === 0 && !adding ? (
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
            const isEditing = editingId === child.id;
            return (
              <GumroadCard key={child.id} color="white" shadow="md" padding="lg">
                <Flex direction="column" gap="3" style={{ height: '100%' }}>
                  {isEditing ? (
                    <>
                      <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                        Editar Criança
                      </GumroadHeading>
                      <ChildForm
                        value={editFormValue}
                        onChange={(field, value) =>
                          setEditFormValue((prev) => ({ ...prev, [field]: value }))
                        }
                        disabled={editSaving}
                      />
                      <Flex gap="3" mt="3">
                        <GumroadButton
                          variant="primary"
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={editSaving || !editFormValue.name || !editFormValue.birthDate}
                        >
                          {editSaving ? 'Salvando...' : 'Salvar'}
                        </GumroadButton>
                        <GumroadButton
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={editSaving}
                        >
                          Cancelar
                        </GumroadButton>
                      </Flex>
                    </>
                  ) : (
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
                      <Flex gap="2" mt="auto" pt="2">
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
