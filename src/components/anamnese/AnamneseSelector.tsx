import { useEffect, useRef, useState } from 'react';
import { Box, Card, Flex, Select, Text } from '@radix-ui/themes';
import { ClipboardIcon } from '@radix-ui/react-icons';
import { useAuthContext } from '../../context/AuthContext';
import { anamneseApi } from '../../services/api';
import type { Anamnese, AnamneseSummary } from './types';

interface AnamneseSelectorProps {
  onSelect: (anamnese: Anamnese) => void;
}

const MANUAL_VALUE = '__manual__';

const AnamneseSelector: React.FC<AnamneseSelectorProps> = ({ onSelect }) => {
  const { getToken } = useAuthContext();
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
        setError('Não foi possível carregar anamneses existentes.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

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
      setError('Erro ao carregar dados da anamnese selecionada.');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <Card mb="4">
      <Flex align="center" gap="2" mb="2">
        <ClipboardIcon />
        <Text size="3" weight="bold">Usar anamnese existente</Text>
      </Flex>
      <Text size="2" color="gray" mb="3" as="p">
        Selecione uma anamnese já cadastrada para preencher automaticamente os dados da criança e do responsável. Ao selecionar, os campos abaixo serão sobrescritos.
      </Text>

      <Box>
        <Select.Root value={selected} onValueChange={handleChange} disabled={loading || loadingDetail}>
          <Select.Trigger placeholder="Selecione uma anamnese" />
          <Select.Content>
            <Select.Item value={MANUAL_VALUE}>— Preencher manualmente —</Select.Item>
            {items.map((a) => (
              <Select.Item key={a.id} value={a.id}>
                {a.childName} · {new Date(a.createdAt).toLocaleDateString('pt-BR')}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      {loading && <Text size="1" color="gray" mt="2" as="p">Carregando anamneses...</Text>}
      {loadingDetail && <Text size="1" color="gray" mt="2" as="p">Carregando dados selecionados...</Text>}
      {error && <Text size="1" color="crimson" mt="2" as="p">{error}</Text>}
      {!loading && items.length === 0 && !error && (
        <Text size="1" color="gray" mt="2" as="p">
          Nenhuma anamnese cadastrada ainda. Você pode continuar preenchendo manualmente.
        </Text>
      )}
    </Card>
  );
};

export default AnamneseSelector;
