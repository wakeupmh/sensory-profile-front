/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, Container, Flex, Heading, Separator, Text } from '@radix-ui/themes';
import { ExclamationTriangleIcon, FileTextIcon } from '@radix-ui/react-icons';

import { anamneseApi } from '../services/api';
import ChildSection from '../components/anamnese/ChildSection';
import CaregiverSection from '../components/anamnese/CaregiverSection';
import ClinicalHistorySection from '../components/anamnese/ClinicalHistorySection';
import { emptyClinicalHistory } from '../components/anamnese/types';
import type { AnamneseFormData } from '../components/anamnese/types';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyFormData: AnamneseFormData = {
  child: { name: '', birthDate: '', gender: 'male', nationalIdentity: '', otherInfo: '', age: 0 },
  caregiver: { name: '', relationship: '', contact: '' },
  clinicalHistory: emptyClinicalHistory(),
};

const AnamneseSharedView: React.FC = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [data, setData] = useState<AnamneseFormData>(emptyFormData);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    fetchedRef.current = false;
    setInvalid(false);
    setLoading(true);

    if (!token) {
      setInvalid(true);
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const response = await anamneseApi.getBySharedToken(token);
        const payload = response.data ?? response;
        setData({
          child: payload.child ?? emptyFormData.child,
          caregiver: payload.caregiver ?? emptyFormData.caregiver,
          clinicalHistory: payload.clinicalHistory ?? emptyClinicalHistory(),
        });
        setCreatedAt(payload.createdAt ?? null);
        fetchedRef.current = true;
      } catch (err: any) {
        console.error(err);
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  if (loading) {
    return (
      <Container size="3" p="6">
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando anamnese compartilhada..." />
          </Flex>
        </Card>
      </Container>
    );
  }

  if (invalid) {
    return (
      <Container size="2" p="6">
        <Card>
          <Flex direction="column" align="center" gap="3" py="9">
            <ExclamationTriangleIcon width={32} height={32} color="var(--crimson-9)" />
            <Heading size="5">Link inválido ou expirado</Heading>
            <Text color="gray" align="center">
              Este link de compartilhamento não é mais válido. Solicite um novo link ao profissional responsável.
            </Text>
          </Flex>
        </Card>
      </Container>
    );
  }

  // Proxy to update handler that does nothing — view is read-only.
  const noop = () => {};

  return (
    <Container size="3" p={{ initial: '4', sm: '6' }}>
      <Flex align="center" gap="2" mb="2">
        <FileTextIcon width={24} height={24} color="var(--violet-9)" />
        <Heading size="6" color="violet">Anamnese compartilhada</Heading>
      </Flex>
      <Text size="2" color="gray" as="p" mb="4">
        Visualização somente-leitura. {createdAt && (
          <>Criada em {new Date(createdAt).toLocaleDateString('pt-BR')}.</>
        )}
      </Text>
      <Separator size="4" mb="4" />

      <Card>
        <Box p={{ initial: '2', sm: '4' }}>
          <ChildSection formData={data} updateFormData={noop} disabled />
          <CaregiverSection formData={data} updateFormData={noop} disabled />
          <ClinicalHistorySection formData={data} updateFormData={noop} disabled />
        </Box>
      </Card>
    </Container>
  );
};

export default AnamneseSharedView;
