import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { anamneseApi } from '../services/api';
import { Box, Flex, AlertDialog, IconButton, Separator } from '@radix-ui/themes';
import {
  PlusIcon,
  EyeOpenIcon,
  Pencil1Icon,
  TrashIcon,
  InfoCircledIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorState } from '../components/domain/ErrorState';
import type { AnamneseSummary } from '../components/anamnese/types';
import { colors, spacing } from '../theme/tokens';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';

const AnamneseList = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [items, setItems] = useState<AnamneseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuthContext();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const response = await anamneseApi.list(token);
      setItems(response.data ?? response);
      setError(null);
    } catch (err) {
      setError(t('p1AnamneseList.errLoad'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const token = await getToken();
      await anamneseApi.remove(id, token);
      setItems((prev) => prev.filter((a) => a.id !== id));
      toast.success(t('p1AnamneseList.deleted'));
    } catch (err) {
      toast.error(t('p1AnamneseList.errDelete'));
      console.error(err);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        mb="6"
        gap="4"
        direction={{ initial: 'column', sm: 'row' }}
      >
        <Box>
          <GumroadHeading level="display-sm" as="h1" style={{ marginBottom: spacing.xs }}>
            {t('p1AnamneseList.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
            {t('p1AnamneseList.subtitle')}
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" asChild>
          <Link to="/anamnese/new" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <PlusIcon aria-hidden="true" />
            {t('p1AnamneseList.new')}
          </Link>
        </GumroadButton>
      </Flex>

      <Separator size="4" mb="6" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" text={t('p1AnamneseList.loading')} />
        </GumroadCard>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchList} retryLabel={t('p1Common.retry')} />
      ) : items.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl" style={{ textAlign: 'center' }}>
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={40} height={40} aria-hidden="true" />
            <Box>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p1AnamneseList.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                {t('p1AnamneseList.emptyBody')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" asChild>
              <Link to="/anamnese/new" style={{ textDecoration: 'none' }}>
                {t('p1AnamneseList.createFirst')}
              </Link>
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
          {items.map((a) => (
            <GumroadCard key={a.id} color="white" shadow="md" padding="lg">
              <Flex direction="column" gap="3" style={{ height: '100%' }}>
                <Flex justify="between" align="start" gap="2">
                  <GumroadHeading level="title-md" as="h3" style={{ wordBreak: 'break-word', flex: 1 }}>
                    {a.childName}
                  </GumroadHeading>
                  {a.isShared ? (
                    <GumroadBadge color="mint">
                      <Share1Icon aria-hidden="true" /> {t('p1AnamneseList.shared')}
                    </GumroadBadge>
                  ) : (
                    <GumroadBadge color="cream">{t('p1AnamneseList.private')}</GumroadBadge>
                  )}
                </Flex>

                <Flex direction="column" gap="1">
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                    <strong>{t('p1AnamneseList.caregiver')}</strong> {a.caregiverName}
                  </GumroadText>
                  <GumroadText level="body-sm" as="p" style={{ opacity: 0.7 }}>
                    <strong>{t('p1AnamneseList.createdAt')}</strong>{' '}
                    {new Date(a.createdAt).toLocaleDateString(i18n.language)}
                  </GumroadText>
                </Flex>

                <Flex gap="2" mt="auto" pt="2">
                  <IconButton
                    variant="soft"
                    size="2"
                    asChild
                    title={t('p1AnamneseList.view')}
                    aria-label={t('p1AnamneseList.viewAria', { name: a.childName })}
                    style={{
                      background: colors.canvas,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: '10px',
                      boxShadow: '2px 2px 0px #0A0A1A',
                      cursor: 'pointer',
                    }}
                  >
                    <Link to={`/anamnese/${a.id}`}>
                      <EyeOpenIcon aria-hidden="true" />
                    </Link>
                  </IconButton>
                  <IconButton
                    variant="soft"
                    size="2"
                    asChild
                    title={t('p1AnamneseList.edit')}
                    aria-label={t('p1AnamneseList.editAria', { name: a.childName })}
                    style={{
                      background: colors['brand-cyan'],
                      border: `2px solid ${colors.ink}`,
                      borderRadius: '10px',
                      boxShadow: '2px 2px 0px #0A0A1A',
                      cursor: 'pointer',
                    }}
                  >
                    <Link to={`/anamnese/${a.id}/edit`}>
                      <Pencil1Icon aria-hidden="true" />
                    </Link>
                  </IconButton>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <IconButton
                        variant="soft"
                        size="2"
                        title={t('p1AnamneseList.delete')}
                        aria-label={t('p1AnamneseList.deleteAria', { name: a.childName })}
                        style={{
                          background: colors['brand-salmon'],
                          border: `2px solid ${colors.ink}`,
                          borderRadius: '10px',
                          boxShadow: '2px 2px 0px #0A0A1A',
                          cursor: 'pointer',
                        }}
                      >
                        <TrashIcon aria-hidden="true" />
                      </IconButton>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content size="2">
                      <AlertDialog.Title>{t('p1AnamneseList.deleteTitle')}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        {t('p1AnamneseList.deleteBody')}
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <GumroadButton variant="secondary" size="sm">
                            {t('p1AnamneseList.cancel')}
                          </GumroadButton>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <GumroadButton
                            variant="danger"
                            size="sm"
                            disabled={deleteLoading === a.id}
                            onClick={() => handleDelete(a.id)}
                          >
                            {deleteLoading === a.id ? t('p1AnamneseList.deleting') : t('p1AnamneseList.delete')}
                          </GumroadButton>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>
            </GumroadCard>
          ))}
        </div>
      )}
    </Box>
  );
};

export default AnamneseList;
