import React, { useState, useCallback } from 'react';
import { Flex } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
import GumroadModal from '../design-system/GumroadModal';
import SchoolCommCard from './SchoolCommCard';
import SchoolCommForm from './SchoolCommForm';
import { schoolCommApi } from '../../services/api';
import type {
  SchoolCommunicationSummary,
  SchoolCommunication,
  CreateSchoolCommPayload,
  UpdateSchoolCommPayload,
} from '../../types/education';
import { useAuthContext } from '../../context/AuthContext';
import { usePanelCrud } from '../../hooks/usePanelCrud';
import { useToast } from '../../context/ToastContext';

interface SchoolCommsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
}

const LIMIT = 20;

const SchoolCommsPanel: React.FC<SchoolCommsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
}) => {
  const { getToken } = useAuthContext();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFn = useCallback(async () => {
    const token = await getToken();
    const result = await schoolCommApi.list(token, {
      childId: childId || undefined,
      page: 1,
      limit: LIMIT,
    });
    setTotal(result.total);
    setPage(result.page);
    return result.data;
  }, [getToken, childId]);

  const onReset = useCallback(() => {
    setPage(1);
    setTotal(0);
  }, []);

  const {
    items: comms,
    setItems: setComms,
    editingItem: editingComm,
    setEditingItem: setEditingComm,
    isLoading,
    setIsLoading,
    error,
    view,
    setView,
    fetchItems: fetchComms,
  } = usePanelCrud<SchoolCommunicationSummary, SchoolCommunication>({ isOpen, onClose, childId, fetchFn, onReset });

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    try {
      const token = await getToken();
      const result = await schoolCommApi.list(token, {
        childId: childId || undefined,
        page: nextPage,
        limit: LIMIT,
      });
      setComms((prev) => [...prev, ...result.data]);
      setTotal(result.total);
      setPage(result.page);
    } catch {
      // non-fatal: pagination failure should not block the existing list
    }
  };

  const handleAdd = async (payload: CreateSchoolCommPayload | UpdateSchoolCommPayload) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await schoolCommApi.create(token, { ...(payload as CreateSchoolCommPayload), childId });
      await fetchComms();
      onMutate?.();
      setView('list');
      toast.success('Comunicação adicionada');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (payload: CreateSchoolCommPayload | UpdateSchoolCommPayload) => {
    if (!editingComm) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      await schoolCommApi.update(token, editingComm.id, payload as UpdateSchoolCommPayload);
      await fetchComms();
      onMutate?.();
      setView('list');
      setEditingComm(null);
      toast.success('Alterações salvas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await schoolCommApi.delete(token, id);
      await fetchComms();
      onMutate?.();
      toast.success('Comunicação removida');
    } finally {
      setIsLoading(false);
    }
  };

  const hasMore = comms.length < total;

  return (
    <GumroadModal open={isOpen} onClose={onClose} title="Comunicações com a Escola">
      <>

        {view === 'list' && (
          <>
            <GumroadButton
              variant="primary"
              size="md"
              onClick={() => setView('add')}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Flex align="center" gap="1">
                <PlusIcon />
                Adicionar Comunicação
              </Flex>
            </GumroadButton>

            {error && (
              <GumroadCard role="alert" color="salmon" padding="md" style={{ marginBottom: '16px' }}>
                <GumroadText level="body-md">{error}</GumroadText>
              </GumroadCard>
            )}

            {!error && comms.length === 0 ? (
              <GumroadCard color="cream" padding="lg" style={{ textAlign: 'center' }}>
                <GumroadText level="body-md" style={{ opacity: 0.7 }}>
                  Nenhuma comunicação registrada
                </GumroadText>
              </GumroadCard>
            ) : (
              <Flex direction="column" gap="3">
                {comms.map((comm) => (
                  <SchoolCommCard
                    key={comm.id}
                    comm={comm}
                    onEdit={async (c) => {
                      try {
                        const token = await getToken();
                        const full = await schoolCommApi.get(token, c.id);
                        setEditingComm(full);
                        setView('edit');
                      } catch {
                        setEditingComm(c as unknown as SchoolCommunication);
                        setView('edit');
                      }
                    }}
                    onDelete={handleDelete}
                  />
                ))}

                {hasMore && (
                  <GumroadButton
                    variant="ghost"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    {isLoading ? 'Carregando...' : 'Carregar mais'}
                  </GumroadButton>
                )}
              </Flex>
            )}
          </>
        )}

        {view === 'add' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Nova Comunicação
            </GumroadHeading>
            <SchoolCommForm
              initial={{ childId }}
              onSubmit={handleAdd}
              onCancel={() => setView('list')}
              childId={childId}
              isEdit={false}
            />
          </>
        )}

        {view === 'edit' && (
          <>
            <GumroadHeading level="title-md" style={{ marginBottom: '16px' }}>
              Editar Comunicação
            </GumroadHeading>
            <SchoolCommForm
              initial={editingComm ?? {}}
              onSubmit={handleEdit}
              onCancel={() => setView('list')}
              childId={childId}
              isEdit={true}
            />
          </>
        )}
      </>
    </GumroadModal>
  );
};

export default SchoolCommsPanel;
