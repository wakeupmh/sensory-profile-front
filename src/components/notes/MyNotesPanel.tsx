import React, { useCallback, useEffect, useState } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import { ChatBubbleIcon, ExclamationTriangleIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { sharedNotesApi } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import type { ProfessionalNote } from '../../types/professionalNotes';
import type { RecentSession } from '../../types/consolidatedReport';
import { colors, radii, shadows, fonts } from '../../theme/tokens';
import GumroadCard from '../design-system/GumroadCard';
import GumroadButton from '../design-system/GumroadButton';
import GumroadHeading, { GumroadText } from '../design-system/GumroadHeading';
import LoadingSpinner from '../LoadingSpinner';

interface MyNotesPanelProps {
  childId: string;
  therapySessions?: RecentSession[];
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  padding: '10px 12px',
  border: `2px solid ${colors.ink}`,
  borderRadius: radii.md,
  fontFamily: fonts.body,
  fontSize: '14px',
  color: colors.ink,
  backgroundColor: colors.surface,
  boxShadow: shadows.input,
  resize: 'vertical',
  boxSizing: 'border-box',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const MyNotesPanel: React.FC<MyNotesPanelProps> = ({ childId, therapySessions = [] }) => {
  const { getToken } = useAuthContext();
  const [notes, setNotes] = useState<ProfessionalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [linkedSessionId, setLinkedSessionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const list = await sharedNotesApi.list(token, childId);
      setNotes([...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Erro ao carregar suas notas.');
    } finally {
      setLoading(false);
    }
  }, [childId, getToken]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const note = await sharedNotesApi.create(token, childId, {
        content: content.trim(),
        resourceType: linkedSessionId ? 'therapy_session' : undefined,
        resourceId: linkedSessionId || undefined,
      });
      setNotes((prev) => [note, ...prev]);
      setContent('');
      setLinkedSessionId('');
    } catch {
      setError('Erro ao salvar a nota. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (note: ProfessionalNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    setSavingEditId(id);
    try {
      const token = await getToken();
      const updated = await sharedNotesApi.update(token, id, { content: editContent.trim() });
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null);
    } catch {
      setError('Erro ao atualizar a nota. Tente novamente.');
    } finally {
      setSavingEditId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = await getToken();
      await sharedNotesApi.delete(token, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setError('Erro ao remover a nota. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Flex align="center" gap="2" mb="3">
        <ChatBubbleIcon />
        <GumroadHeading level="title-lg" as="h2">Minhas notas</GumroadHeading>
      </Flex>

      <form onSubmit={handleAdd}>
        <Flex direction="column" gap="2" mb="4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 4000))}
            placeholder="Escreva uma anotação sobre esta criança..."
            style={textareaStyle}
            maxLength={4000}
          />
          <Flex justify="between" align="center" wrap="wrap" gap="2">
            <GumroadText level="caption" as="span" style={{ opacity: 0.5 }}>{content.length}/4000</GumroadText>
            {therapySessions.length > 0 && (
              <select
                value={linkedSessionId}
                onChange={(e) => setLinkedSessionId(e.target.value)}
                style={{
                  height: '36px',
                  padding: '0 10px',
                  border: `2px solid ${colors.ink}`,
                  borderRadius: radii.md,
                  fontFamily: fonts.body,
                  fontSize: '13px',
                }}
              >
                <option value="">Vincular a uma sessão (opcional)</option>
                {therapySessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.occurredAt).toLocaleDateString('pt-BR')} — {s.therapyType}
                  </option>
                ))}
              </select>
            )}
          </Flex>
          <GumroadButton variant="primary" size="sm" type="submit" disabled={submitting || !content.trim()} style={{ alignSelf: 'flex-start' }}>
            <PlusIcon /> {submitting ? 'Salvando...' : 'Adicionar nota'}
          </GumroadButton>
        </Flex>
      </form>

      {error && (
        <Flex align="center" gap="2" style={{ color: colors['brand-salmon'] }} mb="3">
          <ExclamationTriangleIcon />
          <GumroadText level="body-sm" as="span">{error}</GumroadText>
        </Flex>
      )}

      {loading ? (
        <LoadingSpinner size="medium" text="Carregando notas..." />
      ) : notes.length === 0 ? (
        <GumroadText level="body-sm" as="p" style={{ opacity: 0.6, fontStyle: 'italic' }}>
          Você ainda não escreveu notas sobre esta criança.
        </GumroadText>
      ) : (
        <Flex gap="3" wrap="wrap">
          {notes.map((note) => (
            <GumroadCard key={note.id} color="yellow" shadow="sm" padding="sm" style={{ width: '260px' }}>
              {editingId === note.id ? (
                <Flex direction="column" gap="2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value.slice(0, 4000))}
                    style={{ ...textareaStyle, minHeight: '60px', backgroundColor: colors.canvas }}
                    maxLength={4000}
                  />
                  <Flex gap="2">
                    <GumroadButton variant="primary" size="sm" onClick={() => handleSaveEdit(note.id)} disabled={savingEditId === note.id}>
                      {savingEditId === note.id ? 'Salvando...' : 'Salvar'}
                    </GumroadButton>
                    <GumroadButton variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                      Cancelar
                    </GumroadButton>
                  </Flex>
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  <GumroadText level="body-sm" as="p" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</GumroadText>
                  <Flex justify="between" align="center">
                    <GumroadText level="caption" as="span" style={{ opacity: 0.55 }}>{formatDate(note.createdAt)}</GumroadText>
                    <Flex gap="1">
                      <button
                        onClick={() => startEdit(note)}
                        aria-label="Editar nota"
                        style={{ width: '26px', height: '26px', border: `1.5px solid ${colors.ink}`, borderRadius: radii.sm, backgroundColor: colors.canvas, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Pencil1Icon width={12} height={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                        aria-label="Remover nota"
                        style={{ width: '26px', height: '26px', border: `1.5px solid ${colors.ink}`, borderRadius: radii.sm, backgroundColor: colors.canvas, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <TrashIcon width={12} height={12} />
                      </button>
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default MyNotesPanel;
