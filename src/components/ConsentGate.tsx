import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from '@radix-ui/themes';
import { useAuthContext } from '../context/AuthContext';
import { accountApi } from '../services/api';
import { colors, spacing } from '../theme/tokens';
import GumroadButton from './design-system/GumroadButton';
import GumroadHeading, { GumroadText } from './design-system/GumroadHeading';
import LoadingSpinner from './LoadingSpinner';

type Gate =
  | { status: 'checking' }
  | { status: 'unreachable' }
  | { status: 'asking'; currentVersion: string; isUpdate: boolean }
  | { status: 'accepted' };

// Cada rota protegida monta o próprio gate; quem já aceitou nesta visita não
// espera outra consulta a cada navegação.
let acceptedBy: string | null = null;

/**
 * LGPD Art. 11 e 14: dado de saúde de criança só com consentimento específico
 * do responsável legal. Nenhuma página protegida abre antes disso, e quem
 * aceitou uma versão anterior do termo confirma de novo.
 */
export default function ConsentGate({ children }: { children: ReactNode }) {
  const { session, getToken } = useAuthContext();
  const userId = session?.user.id ?? '';
  const [gate, setGate] = useState<Gate>(() =>
    acceptedBy === userId ? { status: 'accepted' } : { status: 'checking' },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (acceptedBy === userId) return;
    let cancelled = false;
    setGate({ status: 'checking' });
    getToken()
      .then((token) => accountApi.getConsent(token))
      .then((consent) => {
        if (cancelled) return;
        if (consent.acceptedVersion === consent.currentVersion) {
          acceptedBy = userId;
          setGate({ status: 'accepted' });
        } else {
          setGate({ status: 'asking', currentVersion: consent.currentVersion, isUpdate: consent.acceptedVersion !== null });
        }
      })
      .catch(() => {
        if (!cancelled) setGate({ status: 'unreachable' });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, getToken, attempt]);

  if (gate.status === 'accepted') return <>{children}</>;

  return (
    <FullPage>
      {gate.status === 'checking' && <LoadingSpinner />}
      {gate.status === 'unreachable' && <Unreachable onRetry={() => setAttempt((n) => n + 1)} />}
      {gate.status === 'asking' && (
        <ConsentForm
          currentVersion={gate.currentVersion}
          isUpdate={gate.isUpdate}
          onAccepted={() => {
            acceptedBy = userId;
            setGate({ status: 'accepted' });
          }}
        />
      )}
    </FullPage>
  );
}

// Cobre a navegação do Layout: até aceitar, não há para onde ir além de sair.
function FullPage({ children }: { children: ReactNode }) {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ position: 'fixed', inset: 0, zIndex: 1050, overflowY: 'auto', background: colors.canvas, padding: spacing.lg }}
    >
      <Box style={{ maxWidth: 560, width: '100%', margin: 'auto' }}>{children}</Box>
    </Flex>
  );
}

function SignOutButton() {
  const { t } = useTranslation();
  const { signOut } = useAuthContext();
  return (
    <GumroadButton variant="ghost" onClick={() => void signOut()}>
      {t('consent.signOut')}
    </GumroadButton>
  );
}

function Unreachable({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <Flex direction="column" gap="4" align="center" role="alert">
      <GumroadText level="body-md" as="p" style={{ textAlign: 'center' }}>
        {t('consent.loadError')}
      </GumroadText>
      <Flex gap="3" wrap="wrap" justify="center">
        <GumroadButton onClick={onRetry}>{t('consent.retry')}</GumroadButton>
        <SignOutButton />
      </Flex>
    </Flex>
  );
}

// TODO(jurídico): o texto deste consentimento (chaves consent.* nos arquivos
// de idioma) precisa de revisão por advogado antes de valer como base legal.
function ConsentForm({ currentVersion, isUpdate, onAccepted }: { currentVersion: string; isUpdate: boolean; onAccepted: () => void }) {
  const { t } = useTranslation();
  const { getToken } = useAuthContext();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const accept = async () => {
    setSaving(true);
    setFailed(false);
    try {
      const saved = await accountApi.acceptConsent(await getToken(), currentVersion);
      if (saved.acceptedVersion === saved.currentVersion) {
        onAccepted();
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    }
    setSaving(false);
  };

  return (
    <Flex direction="column" gap="4">
      <GumroadHeading level="display-sm" as="h1">{t('consent.title')}</GumroadHeading>
      {isUpdate && <GumroadText level="body-md" as="p">{t('consent.updated')}</GumroadText>}
      <GumroadText level="body-md" as="p">{t('consent.whatWeStore')}</GumroadText>
      <GumroadText level="body-md" as="p">{t('consent.whyWeStore')}</GumroadText>
      <GumroadText level="body-md" as="p">
        {t('consent.readMore')}{' '}
        <Link to="/privacidade" style={{ color: colors.ink, fontWeight: 600 }}>{t('consent.privacyLink')}</Link>
        {' · '}
        <Link to="/termos" style={{ color: colors.ink, fontWeight: 600 }}>{t('consent.termsLink')}</Link>
      </GumroadText>
      <label style={{ display: 'flex', gap: spacing.sm, alignItems: 'flex-start', minHeight: 44, cursor: 'pointer', fontWeight: 600 }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ width: 24, height: 24, flexShrink: 0, margin: '2px 0 0', accentColor: colors.ink, cursor: 'pointer' }}
        />
        {t('consent.checkbox')}
      </label>
      {failed && (
        <GumroadText level="body-sm" as="p" role="alert" style={{ color: colors.error }}>
          {t('consent.saveError')}
        </GumroadText>
      )}
      <Flex gap="3" wrap="wrap" align="center">
        <GumroadButton disabled={!agreed} loading={saving} onClick={() => void accept()}>
          {t('consent.accept')}
        </GumroadButton>
        <SignOutButton />
      </Flex>
    </Flex>
  );
}
