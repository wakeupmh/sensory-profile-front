/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const ch = formData.clinicalHistory;
  const opt = (values: string[]) => values.map((value) => ({ value, label: t(`cAnamnese.opt.${value}`) }));
  const yesNoOptions = opt(['yes', 'no']);
  const deliveryOptions = opt(['vaginal', 'cesarean', 'forceps', 'other']);
  const shiftOptions = opt(['morning', 'afternoon', 'full']);

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
        {t('cAnamnese.clinicalHistory')}
      </GumroadHeading>

      {/* Queixa */}
      <Box mb="5">
        {sectionTitle(t('cAnamnese.sec.complaint'))}
        <Flex direction="column" gap="3" mt="2">
          <FastTextArea
            name="mainComplaint"
            label={t('cAnamnese.f.mainComplaint.label')}
            placeholder={t('cAnamnese.f.mainComplaint.placeholder')}
            initialValue={ch.queixa.mainComplaint}
            onValueChange={handleText('queixa.mainComplaint')}
            disabled={disabled}
            required
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="complaintOnset"
                label={t('cAnamnese.f.complaintOnset.label')}
                placeholder={t('cAnamnese.f.complaintOnset.placeholder')}
                initialValue={ch.queixa.complaintOnset}
                onValueChange={handleText('queixa.complaintOnset')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="previousTreatments"
                label={t('cAnamnese.f.previousTreatments.label')}
                placeholder={t('cAnamnese.f.previousTreatments.placeholder')}
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
        {sectionTitle(t('cAnamnese.sec.gestation'))}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="plannedPregnancy"
                label={t('cAnamnese.f.plannedPregnancy.label')}
                options={yesNoOptions}
                initialValue={boolToSelect(ch.gestation.plannedPregnancy)}
                onValueChange={handleBool('gestation.plannedPregnancy')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="deliveryType"
                label={t('cAnamnese.f.deliveryType.label')}
                options={deliveryOptions}
                initialValue={ch.gestation.deliveryType}
                onValueChange={handleSelect('gestation.deliveryType')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="prenatalCareDetails"
            label={t('cAnamnese.f.prenatalCareDetails.label')}
            placeholder={t('cAnamnese.f.prenatalCareDetails.placeholder')}
            initialValue={ch.gestation.prenatalCareDetails}
            onValueChange={handleText('gestation.prenatalCareDetails')}
            disabled={disabled}
          />
          <FastTextArea
            name="complications"
            label={t('cAnamnese.f.complications.label')}
            placeholder={t('cAnamnese.f.complications.placeholder')}
            initialValue={ch.gestation.complications}
            onValueChange={handleText('gestation.complications')}
            disabled={disabled}
          />
          <FastTextArea
            name="medicationsDuringPregnancy"
            label={t('cAnamnese.f.medicationsDuringPregnancy.label')}
            placeholder={t('cAnamnese.f.medicationsDuringPregnancy.placeholder')}
            initialValue={ch.gestation.medicationsDuringPregnancy}
            onValueChange={handleText('gestation.medicationsDuringPregnancy')}
            disabled={disabled}
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="gestationalAgeWeeks"
                label={t('cAnamnese.f.gestationalAgeWeeks.label')}
                type="number"
                initialValue={numAsString(ch.gestation.gestationalAgeWeeks)}
                onValueChange={handleNumber('gestation.gestationalAgeWeeks')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="birthWeightGrams"
                label={t('cAnamnese.f.birthWeightGrams.label')}
                type="number"
                initialValue={numAsString(ch.gestation.birthWeightGrams)}
                onValueChange={handleNumber('gestation.birthWeightGrams')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="birthLengthCm"
                label={t('cAnamnese.f.birthLengthCm.label')}
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
                label={t('cAnamnese.f.apgar1min.label')}
                type="number"
                initialValue={numAsString(ch.gestation.apgar1min)}
                onValueChange={handleNumber('gestation.apgar1min')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="apgar5min"
                label={t('cAnamnese.f.apgar5min.label')}
                type="number"
                initialValue={numAsString(ch.gestation.apgar5min)}
                onValueChange={handleNumber('gestation.apgar5min')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="neonatalIntercurrences"
            label={t('cAnamnese.f.neonatalIntercurrences.label')}
            placeholder={t('cAnamnese.f.neonatalIntercurrences.placeholder')}
            initialValue={ch.gestation.neonatalIntercurrences}
            onValueChange={handleText('gestation.neonatalIntercurrences')}
            disabled={disabled}
          />
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Desenvolvimento */}
      <Box mb="5">
        {sectionTitle(t('cAnamnese.sec.development'))}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }} wrap="wrap">
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="heldHeadMonths"
                label={t('cAnamnese.f.heldHeadMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.heldHeadMonths)}
                onValueChange={handleNumber('development.heldHeadMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="sattMonths"
                label={t('cAnamnese.f.sattMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.sattMonths)}
                onValueChange={handleNumber('development.sattMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="crawledMonths"
                label={t('cAnamnese.f.crawledMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.crawledMonths)}
                onValueChange={handleNumber('development.crawledMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="walkedMonths"
                label={t('cAnamnese.f.walkedMonths.label')}
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
                label={t('cAnamnese.f.firstWordsMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.firstWordsMonths)}
                onValueChange={handleNumber('development.firstWordsMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="firstSentencesMonths"
                label={t('cAnamnese.f.firstSentencesMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.firstSentencesMonths)}
                onValueChange={handleNumber('development.firstSentencesMonths')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1, minWidth: 180 }}>
              <FastTextField
                name="sphincterControlMonths"
                label={t('cAnamnese.f.sphincterControlMonths.label')}
                type="number"
                initialValue={numAsString(ch.development.sphincterControlMonths)}
                onValueChange={handleNumber('development.sphincterControlMonths')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="currentMotorObservations"
            label={t('cAnamnese.f.currentMotorObservations.label')}
            placeholder={t('cAnamnese.f.currentMotorObservations.placeholder')}
            initialValue={ch.development.currentMotorObservations}
            onValueChange={handleText('development.currentMotorObservations')}
            disabled={disabled}
          />
          <FastTextArea
            name="currentLanguageObservations"
            label={t('cAnamnese.f.currentLanguageObservations.label')}
            placeholder={t('cAnamnese.f.currentLanguageObservations.placeholder')}
            initialValue={ch.development.currentLanguageObservations}
            onValueChange={handleText('development.currentLanguageObservations')}
            disabled={disabled}
          />
        </Flex>
      </Box>

      <div style={separatorStyle} />

      {/* Saúde */}
      <Box mb="5">
        {sectionTitle(t('cAnamnese.sec.health'))}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="allergies"
                label={t('cAnamnese.f.allergies.label')}
                initialValue={ch.health.allergies}
                onValueChange={handleText('health.allergies')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="chronicConditions"
                label={t('cAnamnese.f.chronicConditions.label')}
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
                label={t('cAnamnese.f.currentMedications.label')}
                initialValue={ch.health.currentMedications}
                onValueChange={handleText('health.currentMedications')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="pastSurgeries"
                label={t('cAnamnese.f.pastSurgeries.label')}
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
                label={t('cAnamnese.f.hospitalizations.label')}
                initialValue={ch.health.hospitalizations}
                onValueChange={handleText('health.hospitalizations')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="recurrentIllnesses"
                label={t('cAnamnese.f.recurrentIllnesses.label')}
                placeholder={t('cAnamnese.f.recurrentIllnesses.placeholder')}
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
                label={t('cAnamnese.f.sleepPattern.label')}
                initialValue={ch.health.sleepPattern}
                onValueChange={handleText('health.sleepPattern')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextArea
                name="feedingPattern"
                label={t('cAnamnese.f.feedingPattern.label')}
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
        {sectionTitle(t('cAnamnese.sec.school'))}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="attendsSchool"
                label={t('cAnamnese.f.attendsSchool.label')}
                options={yesNoOptions}
                initialValue={boolToSelect(ch.school.attendsSchool)}
                onValueChange={handleBool('school.attendsSchool')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="shift"
                label={t('cAnamnese.f.shift.label')}
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
                label={t('cAnamnese.f.schoolName.label')}
                initialValue={ch.school.schoolName}
                onValueChange={handleText('school.schoolName')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="grade"
                label={t('cAnamnese.f.grade.label')}
                initialValue={ch.school.grade}
                onValueChange={handleText('school.grade')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextArea
            name="academicPerformance"
            label={t('cAnamnese.f.academicPerformance.label')}
            initialValue={ch.school.academicPerformance}
            onValueChange={handleText('school.academicPerformance')}
            disabled={disabled}
          />
          <FastTextArea
            name="socialBehaviorAtSchool"
            label={t('cAnamnese.f.socialBehaviorAtSchool.label')}
            initialValue={ch.school.socialBehaviorAtSchool}
            onValueChange={handleText('school.socialBehaviorAtSchool')}
            disabled={disabled}
          />
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastSelect
                name="hasSupportTeacher"
                label={t('cAnamnese.f.hasSupportTeacher.label')}
                options={yesNoOptions}
                initialValue={boolToSelect(ch.school.hasSupportTeacher)}
                onValueChange={handleBool('school.hasSupportTeacher')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 2 }}>
              <FastTextField
                name="supportDetails"
                label={t('cAnamnese.f.supportDetails.label')}
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
        {sectionTitle(t('cAnamnese.sec.family'))}
        <Flex direction="column" gap="3" mt="2">
          <Flex gap="4" direction={{ initial: 'column', sm: 'row' }}>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="livesWith"
                label={t('cAnamnese.f.livesWith.label')}
                placeholder={t('cAnamnese.f.livesWith.placeholder')}
                initialValue={ch.family.livesWith}
                onValueChange={handleText('family.livesWith')}
                disabled={disabled}
              />
            </Box>
            <Box style={{ flex: 1 }}>
              <FastTextField
                name="parentsMaritalStatus"
                label={t('cAnamnese.f.parentsMaritalStatus.label')}
                initialValue={ch.family.parentsMaritalStatus}
                onValueChange={handleText('family.parentsMaritalStatus')}
                disabled={disabled}
              />
            </Box>
          </Flex>
          <FastTextField
            name="siblings"
            label={t('cAnamnese.f.siblings.label')}
            initialValue={ch.family.siblings}
            onValueChange={handleText('family.siblings')}
            disabled={disabled}
          />
          <FastTextArea
            name="familyHistoryOfDisorders"
            label={t('cAnamnese.f.familyHistoryOfDisorders.label')}
            initialValue={ch.family.familyHistoryOfDisorders}
            onValueChange={handleText('family.familyHistoryOfDisorders')}
            disabled={disabled}
          />
          <FastTextArea
            name="socioeconomicNotes"
            label={t('cAnamnese.f.socioeconomicNotes.label')}
            initialValue={ch.family.socioeconomicNotes}
            onValueChange={handleText('family.socioeconomicNotes')}
            disabled={disabled}
          />
          <FastTextArea
            name="additionalNotes"
            label={t('cAnamnese.f.additionalNotes.label')}
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
