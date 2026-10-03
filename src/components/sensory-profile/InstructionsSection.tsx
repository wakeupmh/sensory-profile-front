import React from "react";
import { Box } from "@radix-ui/themes";
import { colors, radii } from "../../theme/tokens";
import { useTranslation } from "react-i18next";
import type { Instrument } from "../../instruments/types";
import GumroadHeading, { GumroadText } from "../design-system/GumroadHeading";

// Chaves em assessmentForm.instructions.options.<key>.{label,description}
const responseOptions = [
  { key: 'almostAlways', color: "#6D28D9", fontColor: "#fff" },
  { key: 'frequently', color: "#8B5CF6", fontColor: "#fff" },
  { key: 'halfTheTime', color: "#A78BFA", fontColor: "#fff" },
  { key: 'occasionally', color: "#C4B5FD", fontColor: "#222" },
  { key: 'almostNever', color: "#E9D5FF", fontColor: "#222" },
  { key: 'notApplicable', color: "#F3E8FF", fontColor: "#222" },
];

interface InstructionsSectionProps {
  instrument?: Instrument;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instrument }) => {
  const { t } = useTranslation();

  // Escalas de frequência são específicas do Perfil Sensorial; M-CHAT-R usa sim/não
  // e o M-CHAT-R/F usa passou/falhou, então as instruções precisam ser outras.
  const binaryScale = (instrument?.scale?.options.length ?? 0) === 2;
  if (binaryScale) {
    const isFollowup = !!instrument?.parentInstrumentId;
    return (
      <Box mb="6">
        <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
          {t('assessmentForm.instructions.title')}
        </GumroadHeading>
        <GumroadText level="body-md" as="p">
          {t(isFollowup ? 'assessmentForm.instructions.followup' : 'assessmentForm.instructions.yesNo')}
        </GumroadText>
      </Box>
    );
  }

  return (
  <Box mb="6">
    <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
      {t('assessmentForm.instructions.title')}
    </GumroadHeading>
    <Box mt="2" mb="2">
      <GumroadText level="body-md" as="p">
        {t('assessmentForm.instructions.intro')} <b>{t('assessmentForm.instructions.introBold')}</b>
      </GumroadText>
    </Box>
    <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
      {t('assessmentForm.instructions.guidelines')}
    </GumroadText>
    <Box mt="2" mb="2">
      <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
        {t('assessmentForm.instructions.whenOpportunity')}
      </GumroadText>
    </Box>
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <tbody>
        {responseOptions.map((option) => (
          <tr key={option.key}>
            <td style={{
              padding: 8,
              width: 160,
              verticalAlign: 'middle',
              textAlign: 'center',
            }}>
              <span
                style={{
                  background: option.color,
                  color: option.fontColor,
                  borderRadius: radii.sm,
                  padding: '4px 12px',
                  fontWeight: 600,
                  display: 'inline-block',
                  minWidth: 100,
                  textAlign: 'center',
                  border: `2px solid ${colors.ink}`,
                }}
              >
                {t(`assessmentForm.instructions.options.${option.key}.label`)}
              </span>
            </td>
            <td style={{ padding: 8, verticalAlign: 'middle' }}>
              <GumroadText level="body-md" as="span">
                {t(`assessmentForm.instructions.options.${option.key}.description`)}
              </GumroadText>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
  );
};

export default InstructionsSection;
