/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useAuthContext } from '../context/AuthContext';

import { anamneseApi } from '../services/api';
import useAnamneseForm from '../components/anamnese/useAnamneseForm';
import ChildSection from '../components/anamnese/ChildSection';
import CaregiverSection from '../components/anamnese/CaregiverSection';
import ClinicalHistorySection from '../components/anamnese/ClinicalHistorySection';
import ShareLinkBox from '../components/anamnese/ShareLinkBox';
import { emptyClinicalHistory } from '../components/anamnese/types';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFound from '../components/NotFound';

const AnamneseForm: React.FC = () => {
  const { formData, setFormData, updateFormData } = useAnamneseForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuthContext();
  const fetchedRef = useRef(false);

  const isViewMode = !!id && !location.pathname.includes('/edit');
  const isEditMode = !!id && location.pathname.includes('/edit');
  const isNewMode = !id;

  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current) return;

    const run = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const token = await getToken();
        const response = await anamneseApi.getById(id, token);
        const data = response.data ?? response;

        setFormData({
          child: data.child ?? formData.child,
          caregiver: data.caregiver ?? formData.caregiver,
          clinicalHistory: data.clinicalHistory ?? emptyClinicalHistory(),
        });
        setShareToken(data.shareToken ?? null);
        setError(null);
        fetchedRef.current = true;
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError('Erro ao carregar anamnese. Por favor, tente novamente.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, getToken, setFormData, formData.child, formData.caregiver]);

  const validateForm = (): boolean => {
    setValidationError(null);
    if (!formData.child?.name) { setValidationError('Nome da criança é obrigatório'); return false; }
    if (!formData.child?.birthDate) { setValidationError('Data de nascimento da criança é obrigatória'); return false; }
    if (!formData.child?.gender) { setValidationError('Gênero da criança é obrigatório'); return false; }
    if (!formData.child?.age) { setValidationError('Idade da criança é obrigatória'); return false; }
    if (!formData.caregiver?.name) { setValidationError('Nome do responsável é obrigatório'); return false; }
    if (!formData.caregiver?.relationship) { setValidationError('Relação do responsável é obrigatória'); return false; }
    if (!formData.caregiver?.contact) { setValidationError('Contato do responsável é obrigatório'); return false; }
    if (!formData.clinicalHistory?.queixa?.mainComplaint) {
      setValidationError('Queixa principal é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const payload = {
        child: formData.child,
        caregiver: formData.caregiver,
        clinicalHistory: formData.clinicalHistory,
      };

      if (isNewMode) {
        await anamneseApi.create(payload, token);
      } else if (isEditMode && id) {
        await anamneseApi.update(id, payload, token);
      }

      navigate('/anamneses');
    } catch (err) {
      setError('Erro ao salvar anamnese. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTitle = () => {
    if (isNewMode) return 'Nova Anamnese';
    if (isEditMode) return 'Editar Anamnese';
    return 'Visualizar Anamnese';
  };

  const disabled = isViewMode;

  if (loading) {
    return (
      <Box p="4" width="100%">
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <LoadingSpinner size="large" text="Carregando anamnese..." />
          </Flex>
        </Card>
      </Box>
    );
  }

  if (notFound) {
    return (
      <NotFound
        title="Anamnese não encontrada"
        message="A anamnese que você está procurando não existe ou foi removida."
      />
    );
  }

  if (error) {
    return (
      <Box p="4" width="100%">
        <Card>
          <Flex align="center" justify="center" direction="column" gap="3" py="9">
            <Text color="red">{error}</Text>
            <Button onClick={() => navigate('/anamneses')} color="gray">Voltar</Button>
          </Flex>
        </Card>
      </Box>
    );
  }

  return (
    <Box p="4" width="100%">
      <form onSubmit={handleSubmit}>
        <Flex justify="between" align="center" mb="6">
          <Heading size="7" color="violet">{getTitle()}</Heading>
          <Flex gap="3">
            {isViewMode && (
              <Button onClick={() => navigate(`/anamnese/${id}/edit`)}>Editar</Button>
            )}
            <Button onClick={() => navigate('/anamneses')} variant="outline" color="gray">
              Voltar
            </Button>
          </Flex>
        </Flex>

        {validationError && (
          <Box mb="4" p="3" role="alert" style={{ backgroundColor: '#FFEBEE', borderRadius: '4px' }}>
            <Text color="crimson" weight="bold">Erros de validação: </Text>
            <Text color="crimson">{validationError}</Text>
          </Box>
        )}

        {isViewMode && id && (
          <ShareLinkBox
            anamneseId={id}
            shareToken={shareToken}
            onTokenChange={setShareToken}
          />
        )}

        <ChildSection
          formData={formData}
          updateFormData={updateFormData}
          disabled={disabled}
        />

        <CaregiverSection
          formData={formData}
          updateFormData={updateFormData}
          disabled={disabled}
        />

        <ClinicalHistorySection
          formData={formData}
          updateFormData={updateFormData}
          disabled={disabled}
        />

        <Flex gap="3" mt="4" justify="end">
          {!isViewMode && (
            <>
              <Button variant="soft" color="gray" onClick={() => navigate('/anamneses')}>
                Cancelar
              </Button>
              <Button type="submit" color="violet" disabled={submitting}>
                {submitting ? (
                  <Flex gap="2" align="center">
                    <LoadingSpinner size="small" />
                    <Text>{isNewMode ? 'Criando...' : 'Salvando...'}</Text>
                  </Flex>
                ) : (
                  isNewMode ? 'Criar Anamnese' : 'Salvar Alterações'
                )}
              </Button>
            </>
          )}
          {isViewMode && (
            <Button variant="soft" color="gray" onClick={() => navigate('/anamneses')}>
              Voltar
            </Button>
          )}
        </Flex>
      </form>
    </Box>
  );
};

export default AnamneseForm;
