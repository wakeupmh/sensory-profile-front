import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { Box, Flex, AlertDialog, Separator } from '@radix-ui/themes';
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  PersonIcon,
  EnvelopeClosedIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
} from '@radix-ui/react-icons';
import { useAuthContext } from '../context/AuthContext';
import { professionalApi } from '../services/api';
import type { Professional } from '../types/professionals';
import GumroadCard from '../components/design-system/GumroadCard';
import GumroadButton from '../components/design-system/GumroadButton';
import GumroadBadge from '../components/design-system/GumroadBadge';
import GumroadHeading, { GumroadText } from '../components/design-system/GumroadHeading';
import LoadingSpinner from '../components/LoadingSpinner';
import { colors, spacing, radii, shadows } from '../theme/tokens';

const ProfessionalsList: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { getToken, isLoaded, session } = useAuthContext();
  const navigate = useNavigate();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [items, setItems] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getTokenRef.current();
      const list = await professionalApi.list(token);
      setItems(list);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('p2Pros.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded && session) fetchList();
  }, [isLoaded, session, fetchList]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const token = await getToken();
      await professionalApi.remove(id, token);
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      // Toast, e não `error`: o estado de erro esconderia a lista inteira
      toast.error(t('p2Pros.removeError'));
    } finally {
      setDeletingId(null);
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
            {t('p2Pros.title')}
          </GumroadHeading>
          <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
            {t('p2Pros.subtitle')}
          </GumroadText>
        </Box>
        <GumroadButton variant="primary" size="md" onClick={() => navigate('/professionals/new')}>
          <PlusIcon />
          {t('p2Pros.add')}
        </GumroadButton>
      </Flex>

      <Separator size="4" mb="6" />

      {loading ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <LoadingSpinner size="large" text={t('p2Pros.loading')} />
          </Flex>
        </GumroadCard>
      ) : error ? (
        <GumroadCard role="alert" color="salmon" shadow="md" padding="md">
          <Flex align="center" gap="3" wrap="wrap">
            <ExclamationTriangleIcon />
            <GumroadText level="body-md" as="span">
              {error}
            </GumroadText>
            <GumroadButton variant="secondary" size="sm" onClick={fetchList}>
              {t('p2Pros.retry')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : items.length === 0 ? (
        <GumroadCard color="cream" shadow="md" padding="xl">
          <Flex direction="column" align="center" gap="4">
            <InfoCircledIcon width={32} height={32} />
            <Box style={{ textAlign: 'center' }}>
              <GumroadHeading level="title-md" as="h3" style={{ marginBottom: spacing.xs }}>
                {t('p2Pros.emptyTitle')}
              </GumroadHeading>
              <GumroadText level="body-sm" as="p" color={colors.ink} style={{ opacity: 0.7 }}>
                {t('p2Pros.emptyHint')}
              </GumroadText>
            </Box>
            <GumroadButton variant="primary" size="md" onClick={() => navigate('/professionals/new')}>
              <PlusIcon />
              {t('p2Pros.addFirst')}
            </GumroadButton>
          </Flex>
        </GumroadCard>
      ) : (
        <Flex direction="column" gap="3">
          {items.map((p) => (
            <GumroadCard
              key={p.id}
              color={p.status === 'pending' ? 'yellow' : 'white'}
              shadow="md"
              padding="md"
            >
              <Flex
                justify="between"
                align={{ initial: 'start', sm: 'center' }}
                gap="3"
                direction={{ initial: 'column', sm: 'row' }}
              >
                <Flex align="center" gap="3" style={{ minWidth: 0 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radii.full,
                      backgroundColor: colors.surface,
                      border: `2px solid ${colors.ink}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: shadows.input,
                    }}
                  >
                    <PersonIcon width={22} height={22} />
                  </div>
                  <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                    <GumroadHeading level="title-sm" as="h3">
                      {p.name}
                    </GumroadHeading>
                    <Flex gap="3" align="center" wrap="wrap">
                      {p.profession && (
                        <GumroadText level="body-sm" as="span" color={colors.ink} style={{ opacity: 0.75 }}>
                          {p.profession}
                        </GumroadText>
                      )}
                      {p.email && (
                        <Flex align="center" gap="1" style={{ opacity: 0.7 }}>
                          <EnvelopeClosedIcon width={12} height={12} />
                          <GumroadText level="caption" as="span">
                            {p.email}
                          </GumroadText>
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                </Flex>

                <Flex gap="2" align="center" wrap="wrap">
                  <GumroadBadge color={p.status === 'accepted' ? 'mint' : 'yellow'}>
                    {p.status === 'accepted' ? t('p2Pros.accepted') : t('p2Pros.pending')}
                  </GumroadBadge>
                  {p.status === 'pending' && (
                    <GumroadButton
                      variant="secondary"
                      size="sm"
                      aria-label={t('p2Pros.codeAria', { name: p.name })}
                      onClick={() => navigate(`/professionals/${p.id}`)}
                    >
                      <ClipboardIcon />
                      {t('p2Pros.viewCode')}
                    </GumroadButton>
                  )}
                  <GumroadButton variant="secondary" size="sm" asChild>
                    <Link
                      to={`/professionals/${p.id}/edit`}
                      aria-label={t('p2Pros.editAria', { name: p.name })}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Pencil1Icon />
                      {t('p2Pros.edit')}
                    </Link>
                  </GumroadButton>
                  <AlertDialog.Root>
                    <AlertDialog.Trigger>
                      <GumroadButton variant="danger" size="sm" aria-label={t('p2Pros.deleteAria', { name: p.name })}>
                        <TrashIcon />
                        {t('p2Pros.delete')}
                      </GumroadButton>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content size="2">
                      <AlertDialog.Title>{t('p2Pros.deleteTitle')}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        {t('p2Pros.deleteConfirm', { name: p.name })}
                      </AlertDialog.Description>
                      <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                          <GumroadButton variant="secondary" size="sm">
                            {t('p2Pros.cancel')}
                          </GumroadButton>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                          <GumroadButton
                            variant="danger"
                            size="sm"
                            disabled={deletingId === p.id}
                            onClick={() => handleDelete(p.id)}
                          >
                            {deletingId === p.id ? t('p2Pros.deleting') : t('p2Pros.delete')}
                          </GumroadButton>
                        </AlertDialog.Action>
                      </Flex>
                    </AlertDialog.Content>
                  </AlertDialog.Root>
                </Flex>
              </Flex>
            </GumroadCard>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default ProfessionalsList;
