/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import FastTextField from '../sensory-profile/FastTextField';
import FastSelect from '../sensory-profile/FastSelect';
import FastTextArea from './FastTextArea';
import type { AnamneseFormData } from './types';
import { colors } from '../../theme/tokens';
import GumroadHeading from '../design-system/GumroadHeading';

interface ClinicalHistorySectionProps {
  formData: AnamneseFormData;
  updateFormData: (path: string, value: any) => void;
  disabled?: boolean;
}

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
];

const deliveryOptions = [
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'cesarean', label: 'Cesárea' },
  { value: 'forceps', label: 'Fórceps' },
  { value: 'other', label: 'Outro' },
];

const shiftOptions = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'full', label: 'Integral' },
];

const boolToSelect = (v: boolean | null): string => (v === true ? 'yes' : v === false ? 'no' : '');
const selectToBool = (v: string): boolean | null => (v === 'yes' ? true : v === 'no' ? false : null);

const parseNumberOrNull = (value: string): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const numAsString = (v: number | null | undefined): string =>
  v === null || v === undefined ? '' : String(v);

const ClinicalHistorySection: React.FC<ClinicalHistorySectionProps> = memo(({ formData, updateFormData, disabled }) => {
  const ch = formData.clinicalHistory;

  const handleText = (path: string) => (_name: string, value: string) => {
    updateFormData(`clinicalHistory.${path}`, value);
  };

  const handleNumber = (path: string) => (_name: string, value: string) => {
    updateFormData(`clinicalHistory.${path}`, parseNumberOrNull(value));
  };

  const handleBool = (path: string) => (_name: string, value: string) => {
    updateFormData(`clinicalHistory.${path}`, selectToBool(value));
  };

  const handleSelect = (path: string) => (_name: string, value: string) => {
    updateFormData(`clinicalHistory.${path}`, value);
  };

  const sectionTitle = (text: string) => (
    <GumroadHeading level="title-lg" as="h3" style={{ marginBottom: '8px', marginTop: '8px' }}>
      {text}
    </GumroadHeading>
  );

  const separatorStyle = {
    backgroundColor: colors.ink,
    height: '2px',
    margin: '16px 0',
  };

  return (
    <Box mb="6">
      <GumroadHeading level="display-sm" as="h2" style={{ marginBottom: '16px' }}>
        Histórico Clínico
      </GumroadHeading>

      {/* Queixa */}
      <Box mb="5">
        {sectionTitle('Queixa Principal')}
        <Flex direction="column" gap="3" mt="2">
          <FastTextArea
            name="mainComplaint"
            label="Queixa principal:"
            placeholder="Motivo da procura, principais preocupações"
            initialValue={ch.queixa.mainComplaint}
            onValueChange={handleText('queixa.mainComplaint')}
            disabled={disabled}
            required
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="complaintOnset"
                label="Quando começou:"
                placeholder="Ex: há 6 meses"
                initialValue={ch.queixa.complaintOnset}
                onValueChange={handleText('queixa.complaintOnset')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="previousTreatments"
                label="Tratamentos anteriores:"
                placeholder="Descreva tratamentos já realizados"
                initialValue={ch.queixa.previousTreatments}
                onValueChange={handleText('queixa.previousTreatments')}
                disabled={disabled}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Gestação e parto */}
      <Box mb="5">
        {sectionTitle('Gestação e Parto')}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="plannedPregnancy"
                label="Gravidez planejada:"
                options={yesNoOptions}
                initialValue={boolToSelect(ch.gestation.plannedPregnancy)}
                onValueChange={handleBool('gestation.plannedPregnancy')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="deliveryType"
                label="Tipo de parto:"
                options={deliveryOptions}
                initialValue={ch.gestation.deliveryType}
                onValueChange={handleSelect('gestation.deliveryType')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="prenatalCareDetails"
            label="Pré-natal:"
            placeholder="Acompanhamento, número de consultas, exames"
            initialValue={ch.gestation.prenatalCareDetails}
            onValueChange={handleText('gestation.prenatalCareDetails')}
            disabled={disabled}
          />
          <FastTextArea
            name="complications"
            label="Intercorrências na gestação:"
            placeholder="Hipertensão, diabetes, sangramento, etc."
            initialValue={ch.gestation.complications}
            onValueChange={handleText('gestation.complications')}
            disabled={disabled}
          />
          <FastTextArea
            name="medicationsDuringPregnancy"
            label="Medicações durante a gestação:"
            placeholder="Liste medicações utilizadas"
            initialValue={ch.gestation.medicationsDuringPregnancy}
            onValueChange={handleText('gestation.medicationsDuringPregnancy')}
            disabled={disabled}
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="gestationalAgeWeeks"
                label="Idade gestacional (semanas):"
                type="number"
                initialValue={numAsString(ch.gestation.gestationalAgeWeeks)}
                onValueChange={handleNumber('gestation.gestationalAgeWeeks')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="birthWeightGrams"
                label="Peso ao nascer (g):"
                type="number"
                initialValue={numAsString(ch.gestation.birthWeightGrams)}
                onValueChange={handleNumber('gestation.birthWeightGrams')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="birthLengthCm"
                label="Comprimento ao nascer (cm):"
                type="number"
                initialValue={numAsString(ch.gestation.birthLengthCm)}
                onValueChange={handleNumber('gestation.birthLengthCm')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="apgar1min"
                label="Apgar 1º minuto:"
                type="number"
                initialValue={numAsString(ch.gestation.apgar1min)}
                onValueChange={handleNumber('gestation.apgar1min')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="apgar5min"
                label="Apgar 5º minuto:"
                type="number"
                initialValue={numAsString(ch.gestation.apgar5min)}
                onValueChange={handleNumber('gestation.apgar5min')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="neonatalIntercurrences"
            label="Intercorrências neonatais:"
            placeholder="UTI neonatal, icterícia, etc."
            initialValue={ch.gestation.neonatalIntercurrences}
            onValueChange={handleText('gestation.neonatalIntercurrences')}
            disabled={disabled}
          />
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Desenvolvimento */}
      <Box mb="5">
        {sectionTitle('Desenvolvimento')}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} wrap="wrap">
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="heldHeadMonths"
                label="Sustentou a cabeça (meses):"
                type="number"
                initialValue={numAsString(ch.development.heldHeadMonths)}
                onValueChange={handleNumber('development.heldHeadMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="sattMonths"
                label="Sentou sem apoio (meses):"
                type="number"
                initialValue={numAsString(ch.development.sattMonths)}
                onValueChange={handleNumber('development.sattMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="crawledMonths"
                label="Engatinhou (meses):"
                type="number"
                initialValue={numAsString(ch.development.crawledMonths)}
                onValueChange={handleNumber('development.crawledMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="walkedMonths"
                label="Andou (meses):"
                type="number"
                initialValue={numAsString(ch.development.walkedMonths)}
                onValueChange={handleNumber('development.walkedMonths')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} wrap="wrap">
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="firstWordsMonths"
                label="Primeiras palavras (meses):"
                type="number"
                initialValue={numAsString(ch.development.firstWordsMonths)}
                onValueChange={handleNumber('development.firstWordsMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="firstSentencesMonths"
                label="Primeiras frases (meses):"
                type="number"
                initialValue={numAsString(ch.development.firstSentencesMonths)}
                onValueChange={handleNumber('development.firstSentencesMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="sphincterControlMonths"
                label="Controle de esfíncter (meses):"
                type="number"
                initialValue={numAsString(ch.development.sphincterControlMonths)}
                onValueChange={handleNumber('development.sphincterControlMonths')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="currentMotorObservations"
            label="Observações motoras atuais:"
            placeholder="Coordenação, equilíbrio, preferência manual, etc."
            initialValue={ch.development.currentMotorObservations}
            onValueChange={handleText('development.currentMotorObservations')}
            disabled={disabled}
          />
          <FastTextArea
            name="currentLanguageObservations"
            label="Observações de linguagem atuais:"
            placeholder="Compreensão, expressão, articulação"
            initialValue={ch.development.currentLanguageObservations}
            onValueChange={handleText('development.currentLanguageObservations')}
            disabled={disabled}
          />
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Saúde */}
      <Box mb="5">
        {sectionTitle('Saúde')}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="allergies"
                label="Alergias:"
                initialValue={ch.health.allergies}
                onValueChange={handleText('health.allergies')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="chronicConditions"
                label="Condições crônicas / diagnósticos:"
                initialValue={ch.health.chronicConditions}
                onValueChange={handleText('health.chronicConditions')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="currentMedications"
                label="Medicações em uso:"
                initialValue={ch.health.currentMedications}
                onValueChange={handleText('health.currentMedications')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="pastSurgeries"
                label="Cirurgias prévias:"
                initialValue={ch.health.pastSurgeries}
                onValueChange={handleText('health.pastSurgeries')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="hospitalizations"
                label="Internações:"
                initialValue={ch.health.hospitalizations}
                onValueChange={handleText('health.hospitalizations')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="recurrentIllnesses"
                label="Doenças recorrentes:"
                placeholder="Otites, crises convulsivas, etc."
                initialValue={ch.health.recurrentIllnesses}
                onValueChange={handleText('health.recurrentIllnesses')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="sleepPattern"
                label="Padrão de sono:"
                initialValue={ch.health.sleepPattern}
                onValueChange={handleText('health.sleepPattern')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="feedingPattern"
                label="Padrão alimentar:"
                initialValue={ch.health.feedingPattern}
                onValueChange={handleText('health.feedingPattern')}
                disabled={disabled}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Escola */}
      <Box mb="5">
        {sectionTitle('Escola')}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="attendsSchool"
                label="Frequenta escola:"
                options={yesNoOptions}
                initialValue={boolToSelect(ch.school.attendsSchool)}
                onValueChange={handleBool('school.attendsSchool')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="shift"
                label="Turno:"
                options={shiftOptions}
                initialValue={ch.school.shift}
                onValueChange={handleSelect('school.shift')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="schoolName"
                label="Nome da escola:"
                initialValue={ch.school.schoolName}
                onValueChange={handleText('school.schoolName')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="grade"
                label="Série / nível:"
                initialValue={ch.school.grade}
                onValueChange={handleText('school.grade')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="academicPerformance"
            label="Desempenho acadêmico:"
            initialValue={ch.school.academicPerformance}
            onValueChange={handleText('school.academicPerformance')}
            disabled={disabled}
          />
          <FastTextArea
            name="socialBehaviorAtSchool"
            label="Comportamento social na escola:"
            initialValue={ch.school.socialBehaviorAtSchool}
            onValueChange={handleText('school.socialBehaviorAtSchool')}
            disabled={disabled}
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="hasSupportTeacher"
                label="Possui professor de apoio:"
                options={yesNoOptions}
                initialValue={boolToSelect(ch.school.hasSupportTeacher)}
                onValueChange={handleBool('school.hasSupportTeacher')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 2 }}>
              <FastTextField
                name="supportDetails"
                label="Detalhes do apoio:"
                initialValue={ch.school.supportDetails}
                onValueChange={handleText('school.supportDetails')}
                disabled={disabled}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Família */}
      <Box mb="2">
        {sectionTitle('Família e Contexto')}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="livesWith"
                label="Mora com:"
                placeholder="Ex: pai, mãe e irmãos"
                initialValue={ch.family.livesWith}
                onValueChange={handleText('family.livesWith')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="parentsMaritalStatus"
                label="Estado civil dos pais:"
                initialValue={ch.family.parentsMaritalStatus}
                onValueChange={handleText('family.parentsMaritalStatus')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextField
            name="siblings"
            label="Irmãos (quantidade / idades):"
            initialValue={ch.family.siblings}
            onValueChange={handleText('family.siblings')}
            disabled={disabled}
          />
          <FastTextArea
            name="familyHistoryOfDisorders"
            label="Histórico familiar de transtornos:"
            initialValue={ch.family.familyHistoryOfDisorders}
            onValueChange={handleText('family.familyHistoryOfDisorders')}
            disabled={disabled}
          />
          <FastTextArea
            name="socioeconomicNotes"
            label="Contexto socioeconômico:"
            initialValue={ch.family.socioeconomicNotes}
            onValueChange={handleText('family.socioeconomicNotes')}
            disabled={disabled}
          />
          <FastTextArea
            name="additionalNotes"
            label="Observações adicionais:"
            initialValue={ch.family.additionalNotes}
            onValueChange={handleText('family.additionalNotes')}
            disabled={disabled}
          />
        </Flex>
      </Box>
    </Box>
  );
});

ClinicalHistorySection.displayName = 'ClinicalHistorySection';

export default ClinicalHistorySection;
