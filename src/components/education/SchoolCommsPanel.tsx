import React, { useState, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { colors, shadows, radii, fonts, spacing } from '../../theme/tokens';
import GumroadButton from '../design-system/GumroadButton';
import GumroadCard from '../design-system/GumroadCard';
import GumroadHeading from '../design-system/GumroadHeading';
import { GumroadText } from '../design-system/GumroadHeading';
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

interface SchoolCommsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  onMutate?: () => void;
}

type PanelView = 'list' | 'add' | 'edit';

const LIMIT = 20;

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10,10,26,0.5)',
  zIndex: 200,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
};

const sheetStyle: React.CSSProperties = {
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
};

const SchoolCommsPanel: React.FC<SchoolCommsPanelProps> = ({
  isOpen,
  onClose,
  childId,
  onMutate,
}) => {
  const { getToken } = useAuthContext();
  const [view, setView] = useState<PanelView>('list');
  const [comms, setComms] = useState<SchoolCommunicationSummary[]>([]);
  const [editingComm, setEditingComm] = useState<SchoolCommunication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComms = async (pageNum = 1, append = false) => {
    try {
      const token = await getToken();
      const result = await schoolCommApi.list(token, {
        childId: childId || undefined,
        page: pageNum,
        limit: LIMIT,
      });
      if (append) {
        setComms((prev) => [...prev, ...result.data]);
      } else {
        setComms(result.data);
      }
      setTotal(result.total);
      setPage(result.page);
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingComm(null);
      setComms([]);
      setPage(1);
      setTotal(0);
      return;
    }
    fetchComms(1);
  }, [isOpen, childId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    await fetchComms(nextPage, true);
  };

  const handleAdd = async (payload: CreateSchoolCommPayload | UpdateSchoolCommPayload) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await schoolCommApi.create(token, { ...(payload as CreateSchoolCommPayload), childId });
      await fetchComms(1);
      onMutate?.();
      setView('list');
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
      await fetchComms(1);
      onMutate?.();
      setView('list');
      setEditingComm(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await schoolCommApi.delete(token, id);
      await fetchComms(1);
      onMutate?.();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasMore = comms.length < total;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <Flex justify="between" align="center" mb="4">
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '18px', color: colors.ink }}>
            Comunicações com a Escola
          </span>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: `2px solid ${colors.ink}`,
              borderRadius: radii.md,
              backgroundColor: colors.canvas,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cross2Icon />
          </button>
        </Flex>

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

            {comms.length === 0 ? (
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
      </div>
    </div>
  );
};

export default SchoolCommsPanel;
