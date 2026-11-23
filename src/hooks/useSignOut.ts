import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { countQueuedFor } from '../services/offlineLogQueue';

/**
 * Sair da conta apaga do aparelho os registros feitos offline (dados de saúde
 * não ficam num aparelho que outra pessoa pode usar). Se algum desta conta
 * ainda não foi enviado, pergunta antes: dá para cancelar, voltar a ter
 * internet e deixar sincronizar.
 */
export function useSignOut() {
  const { signOut, session } = useAuthContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  return useCallback(async () => {
    const pending = session?.user?.id ? countQueuedFor(session.user.id) : 0;
    if (pending > 0 && !window.confirm(t('nav.signOutPending', { count: pending }))) return;
    await signOut();
    navigate('/sign-in', { replace: true });
  }, [session, signOut, navigate, t]);
}
