import React from "react";
import { Box } from "@radix-ui/themes";
import { colors, radii } from "../../theme/tokens";
import GumroadHeading, { GumroadText } from "../design-system/GumroadHeading";

const responseOptions = [
  {
    label: "Quase sempre",
    color: "#6D28D9",
    fontColor: "#fff",
    description: "responde desta maneira Quase sempre (90% ou mais do tempo).",
  },
  {
    label: "Frequentemente",
    color: "#8B5CF6",
    fontColor: "#fff",
    description: "responde desta maneira Frequentemente (75% do tempo).",
  },
  {
    label: "Metade do tempo",
    color: "#A78BFA",
    fontColor: "#fff",
    description: "responde desta maneira Metade do tempo (50% do tempo).",
  },
  {
    label: "Ocasionalmente",
    color: "#C4B5FD",
    fontColor: "#222",
    description: "responde desta maneira Ocasionalmente (25% do tempo).",
  },
  {
    label: "Quase nunca",
    color: "#E9D5FF",
    fontColor: "#222",
    description: "responde desta maneira Quase nunca (10% ou menos do tempo).",
  },
  {
    label: "Não se aplica",
    color: "#F3E8FF",
    fontColor: "#222",
    description: "Se você não puder responder porque você não observou o comportamento ou acha que tal item não se aplica ao/à seu/sua filho(a), marque Não se aplica.",
  },
];

const InstructionsSection: React.FC = () => (
  <Box mb="6">
    <GumroadHeading level="title-lg" as="h2" style={{ marginBottom: '12px' }}>
      INSTRUÇÕES
    </GumroadHeading>
    <Box mt="2" mb="2">
      <GumroadText level="body-md" as="p">
        As páginas a seguir contêm afirmações que descrevem como as crianças podem agir. Leia cada frase e selecione a opção que melhor descreve a frequência na qual seu/sua filho(a) demonstra esses comportamentos. <b>Marque uma opção para cada afirmação.</b>
      </GumroadText>
    </Box>
    <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
      Use estas orientações para marcar suas respostas:
    </GumroadText>
    <Box mt="2" mb="2">
      <GumroadText level="body-md" as="p" style={{ fontWeight: 600 }}>
        Quando tem a oportunidade, meu filho(a)...
      </GumroadText>
    </Box>
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <tbody>
        {responseOptions.map((option) => (
          <tr key={option.label}>
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
                {option.label}
              </span>
            </td>
            <td style={{ padding: 8, verticalAlign: 'middle' }}>
              <GumroadText level="body-md" as="span">{option.description}</GumroadText>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
);

export default InstructionsSection;
