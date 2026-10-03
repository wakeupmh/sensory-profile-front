import { useState, useEffect, useCallback, useRef } from 'react';
import { parseLocalDate } from '../utils/date';
import { Box, Flex, AlertDialog } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { PlusIcon, Pencil1Icon, TrashIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { childApi, ChildData } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import GumroadModal from '../components/design-system/GumroadModal';
import ChildForm, { ChildFormValue } from '../components/sensory-profile/ChildForm';
import { ChildrenListSkeleton } from '../components/skeletons/PageSkeletons';
import { ErrorState } from '../components/domain/ErrorState';
import axios from 'axios';

function calculateAge(birthDate: string, t: TFunction): string {
  const birth = parseLocalDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return t('p1Children.years', { count: Math.max(age, 0) });
}

const GENDER_KEYS = ['male', 'female', 'other'];

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
  open: boolean;
  title: string;
  value: ChildFormValue;
  onChange: (field: keyof ChildFormValue, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

// Bottom-sheet modal compartilhado por adicionar/editar criança
const ChildFormModal = ({ open, title, value, onChange, onSave, onCancel, saving }: ChildFormModalProps) => {
  const { t } = useTranslation();
  return (
  <GumroadModal open={open} onClose={onCancel} title={title} closeDisabled={saving}>
    <ChildForm value={value} onChange={onChange} disabled={saving} />
    <Flex gap="3" mt="4">
      <GumroadButton
        variant="primary"
        size="sm"
        onClick={onSave}
        disabled={saving || !value.name || !value.birthDate}
      >
        {saving ? t('p1Children.saving') : t('p1Children.save')}
      </GumroadButton>
      <GumroadButton variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
        {t('p1Children.cancel')}
      </GumroadButton>
    </Flex>
  </GumroadModal>
  );
};

const Children = () => {
  const { t } = useTranslation();
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
  const toast = useToast();
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
      setError(t('p1Children.errLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      toast.success(t('p1Children.toastSaved'));
    } catch {
      setError(t('p1Children.errSave'));
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
      toast.success(t('p1Children.toastAdded'));
    } catch {
      setError(t('p1Children.errCreate'));
    } finally {
      setAddSaving(false);
    }
  };

  const handleDelete = async (child: ChildData) => {
    setDeleteLoading(child.id);
    try {
      const token = await getTokenRef.current();
      await childApi.delete(child.id, token);
      setChildren((prev) => prev.filter((c) => c.id !== child.id));
      toast.success(t('p1Children.toastDeleted'));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error(t('p1Children.errHasAssessments'));
      } else {
        setError(t('p1Children.errDelete'));
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
            {t('p1Children.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            {t('p1Children.subtitle')}
          </GumroadText>
        </Box>
        <GumroadButton
          variant="primary"
          size="md"
          onClick={handleStartAdd}
          disabled={adding}
        >
          <PlusIcon aria-hidden="true" />
          {t('p1Children.add')}
        </GumroadButton>
      </Flex>

      {/* Error banner */}
      {error && (
        <Box mb="5">
          <ErrorState message={error} onRetry={fetchChildren} retryLabel={t('p1Common.retry')} />
        </Box>
      )}

      {/* Add form — bottom-sheet modal */}
      <ChildFormModal
        open={adding}
        title={t('p1Children.newTitle')}
        value={addFormValue}
        onChange={(field, value) => setAddFormValue((prev) => ({ ...prev, [field]: value }))}
        onSave={handleSaveAdd}
        onCancel={handleCancelAdd}
        saving={addSaving}
      />

      {/* Edit form — bottom-sheet modal */}
      <ChildFormModal
        open={editingId !== null}
        title={t('p1Children.editTitle')}
        value={editFormValue}
        onChange={(field, value) => setEditFormValue((prev) => ({ ...prev, [field]: value }))}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        saving={editSaving}
      />

      {/* Content */}
      {loading ? (
        <ChildrenListSkeleton />
      ) : !error && children.length === 0 && !adding ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p1Children.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('p1Children.emptyBody')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={handleStartAdd}>
              <PlusIcon aria-hidden="true" />
              {t('p1Children.add')}
            </GumroadButton>
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
          {children.map((child, i) => {
            return (
              <GumroadCard
                key={child.id}
                color="white"
                shadow="md"
                padding="lg"
                className="stagger-item"
                style={{ ['--i' as string]: Math.min(i, 8) }}
              >
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
                            {GENDER_KEYS.includes(child.gender) ? t(`p1Children.${child.gender}`) : child.gender}
                          </GumroadBadge>
                        )}
                      </Flex>

                      {/* Details */}
                      <Flex direction="column" gap="1">
                        {child.birthDate && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>{t('p1Children.age')}</strong> {calculateAge(child.birthDate, t)}
                          </GumroadText>
                        )}
                        {child.nationalIdentity && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>{t('p1Children.document')}</strong> {child.nationalIdentity}
                          </GumroadText>
                        )}
                        {child.otherInfo && (
                          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                            <strong>{t('p1Children.notes')}</strong> {child.otherInfo}
                          </GumroadText>
                        )}
                      </Flex>

                      {/* Actions */}
                      <Flex gap="2" mt="auto" pt="2" wrap="wrap">
                        <GumroadButton variant="primary" size="sm" asChild style={{ flex: 1 }}>
                          <Link
                            to={`/children/${child.id}`}
                            aria-label={t('p1Children.viewProfileFor', { name: child.name })}
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            {t('p1Children.viewProfile')}
                          </Link>
                        </GumroadButton>
                        <GumroadButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartEdit(child)}
                          aria-label={t('p1Children.editFor', { name: child.name })}
                          style={{ flex: 1 }}
                        >
                          <Pencil1Icon aria-hidden="true" />
                          {t('p1Children.edit')}
                        </GumroadButton>
                        <AlertDialog.Root>
                          <AlertDialog.Trigger>
                            <GumroadButton
                              variant="danger"
                              size="sm"
                              disabled={deleteLoading === child.id}
                              aria-label={t('p1Children.deleteFor', { name: child.name })}
                              style={{ flex: 1 }}
                            >
                              <TrashIcon aria-hidden="true" />
                              {deleteLoading === child.id ? t('p1Children.deleting') : t('p1Children.delete')}
                            </GumroadButton>
                          </AlertDialog.Trigger>
                          <AlertDialog.Content size="2">
                            <AlertDialog.Title>{t('p1Children.deleteTitle')}</AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              {t('p1Children.deleteConfirm', { name: child.name })}
                            </AlertDialog.Description>
                            <Flex gap="3" mt="4" justify="end">
                              <AlertDialog.Cancel>
                                <GumroadButton variant="secondary" size="sm">{t('p1Children.cancel')}</GumroadButton>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action>
                                <GumroadButton variant="danger" size="sm" onClick={() => handleDelete(child)}>
                                  {t('p1Children.delete')}
                                </GumroadButton>
                              </AlertDialog.Action>
                            </Flex>
                          </AlertDialog.Content>
                        </AlertDialog.Root>
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
