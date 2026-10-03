import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Flex, Select, Text } from '@radix-ui/themes';
import { ClipboardIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../context/AuthContext';
import { anamneseApi } from '../../services/api';
import type { Anamnese, AnamneseSummary } from './types';

interface AnamneseSelectorProps {
  onSelect: (anamnese: Anamnese) => void;
}

const MANUAL_VALUE = '__manual__';

const AnamneseSelector: React.FC<AnamneseSelectorProps> = ({ onSelect }) => {
  const { t, i18n } = useTranslation();
  const { getToken } = useAuthContext();
  const navigate = useNavigate();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const [items, setItems] = useState<AnamneseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selected, setSelected] = useState<string>(MANUAL_VALUE);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = await getTokenRef.current();
        const response = await anamneseApi.list(token);
        setItems(response.data ?? response);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(t('cAnamnese.selector.loadError'));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [t]);

  const handleChange = async (value: string) => {
    setSelected(value);
    if (value === MANUAL_VALUE) return;

    try {
      setLoadingDetail(true);
      const token = await getToken();
      const response = await anamneseApi.getById(value, token);
      const data: Anamnese = response.data ?? response;
      onSelect(data);
    } catch (err) {
      console.error(err);
      setError(t('cAnamnese.selector.detailError'));
      setSelected(MANUAL_VALUE);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <Card mb="4">
      <Flex align="center" gap="2" mb="2">
        <ClipboardIcon aria-hidden="true" />
        <Text size="3" weight="bold">{t('cAnamnese.selector.title')}</Text>
      </Flex>
      <Text size="2" color="gray" mb="3" as="p">
        {t('cAnamnese.selector.intro')}
      </Text>

      {loading && <Text size="1" color="gray" mt="2" as="p" role="status">{t('cAnamnese.selector.loading')}</Text>}
      {loadingDetail && <Text size="1" color="gray" mt="2" as="p" role="status">{t('cAnamnese.selector.loadingDetail')}</Text>}
      {error && <Text size="1" color="crimson" mt="2" as="p" role="alert">{error}</Text>}

      {!loading && items.length > 0 && (
        <Box>
          <Select.Root value={selected} onValueChange={handleChange} disabled={loadingDetail}>
            <Select.Trigger placeholder={t('cAnamnese.selector.placeholder')} aria-label={t('cAnamnese.selector.title')} />
            <Select.Content>
              <Select.Item value={MANUAL_VALUE}>{t('cAnamnese.selector.manual')}</Select.Item>
              {items.map((a) => (
                <Select.Item key={a.id} value={a.id}>
                  {a.childName} · {new Date(a.createdAt).toLocaleDateString(i18n.language)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>
      )}

      {!loading && items.length === 0 && !error && (
        <Flex align="center" gap="3" mt="2" wrap="wrap">
          <Text size="1" color="gray" as="p">{t('cAnamnese.selector.empty')}</Text>
          <button
            type="button"
            onClick={() => navigate('/anamnese/new')}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '8px',
              border: '2px solid #0A0A1A',
              background: '#4ECDC4',
              color: '#0A0A1A',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px #0A0A1A',
            }}
          >
            {t('cAnamnese.selector.create')}
          </button>
        </Flex>
      )}
    </Card>
  );
};

export default AnamneseSelector;
