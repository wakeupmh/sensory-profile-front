import React from "react";
import { Box, Text } from "@radix-ui/themes";

const responseOptions = [
  {
    label: "Quase sempre",
    color: "#6D28D9", // Deep purple
    fontColor: "#fff",
    description: "responde desta maneira Quase sempre (90% ou mais do tempo).",
  },
  {
    label: "Frequentemente",
    color: "#8B5CF6", // Medium purple
    fontColor: "#fff",
    description: "responde desta maneira Frequentemente (75% do tempo).",
  },
  {
    label: "Metade do tempo",
    color: "#A78BFA", // Soft purple
    fontColor: "#fff",
    description: "responde desta maneira Metade do tempo (50% do tempo).",
  },
  {
    label: "Ocasionalmente",
    color: "#C4B5FD", // Light lavender
    fontColor: "#222",
    description: "responde desta maneira Ocasionalmente (25% do tempo).",
  },
  {
    label: "Quase nunca",
    color: "#E9D5FF", // Pale lilac
    fontColor: "#222",
    description: "responde desta maneira Quase nunca (10% ou menos do tempo).",
  },
  {
    label: "Não se aplica",
    color: "#F3E8FF", // Very pale lavender
    fontColor: "#222",
    description: "Se você não puder responder porque você não observou o comportamento ou acha que tal item não se aplica ao/à seu/sua filho(a), marque Não se aplica.",
  },
];

const InstructionsSection: React.FC = () => (
  <Box mb="6" p="4" style={{ background: "#f9f9f9", borderRadius: 8, border: "1px solid #e0e0e0" }}>
    <Text size="4" weight="bold">
      INSTRUÇÕES
    </Text>
    <Box mt="2" mb="2">
      <Text size="3">
        As páginas a seguir contêm afirmações que descrevem como as crianças podem agir. Leia cada frase e selecione a opção que melhor descreve a frequência na qual seu/sua filho(a) demonstra esses comportamentos. <b>Marque uma opção para cada afirmação.</b>
      </Text>
    </Box>
    <Text size="3" weight="bold">
      Use estas orientações para marcar suas respostas:
    </Text>
    <Box mt="2" mb="2">
      <Text size="3" weight="bold">
        Quando tem a oportunidade, meu filho(a)...
      </Text>
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
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontWeight: 600,
                  display: 'inline-block',
                  minWidth: 100,
                  textAlign: 'center',
                }}
              >
                {option.label}
              </span>
            </td>
            <td style={{ padding: 8, verticalAlign: 'middle' }}>
              <Text size="3">{option.description}</Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
);

export default InstructionsSection;
