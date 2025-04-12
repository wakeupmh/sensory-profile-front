import React from "react";
import { Box, Text } from "@radix-ui/themes";

interface NormalCurveChartProps {
  scores: Array<{
    section: string;
    score: number;
    classification: string;
  }>;
}

const NormalCurveChart: React.FC<NormalCurveChartProps> = ({ scores }) => {
  // Função para obter a posição horizontal com base na classificação
  const getPositionFromClassification = (classification: string): number => {
    switch (classification) {
      case "Muito menos que outros(as)":
        return 10;
      case "Menos que outros(as)":
        return 30;
      case "Exatamente como a maioria dos(as) outros(as)":
        return 50;
      case "Mais que outros(as)":
        return 70;
      case "Muito mais que outros(as)":
        return 90;
      default:
        return 50;
    }
  };

  return (
    <Box p="4">
      <Text size="6" weight="bold" mb="4">
        Curva Normal e Sistema de Classificação
      </Text>
      <Text size="3" mb="4" style={{ fontStyle: "italic" }}>
        O gráfico abaixo mostra a posição da criança em relação à curva normal de distribuição.
        Cada ponto colorido representa uma área de processamento sensorial.
      </Text>
      <Box style={{ position: "relative", width: "100%", height: "200px", marginBottom: "80px" }}>
        {/* Imagem de fundo da curva normal */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "url('/normal-curve.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundColor: "#ffffff",
          }}
        />

        {/* Classificações */}
        <Text
          size="2"
          style={{
            position: "absolute",
            top: "105%",
            left: "20%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "20%",
            fontSize: "12px",
          }}
        >
          Muito menos que outros(as)
        </Text>
        <Text
          size="2"
          style={{
            position: "absolute",
            top: "105%",
            left: "40%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "20%",
            fontSize: "12px",
          }}
        >
          Menos que outros(as)
        </Text>
        <Text
          size="2"
          style={{
            position: "absolute",
            top: "105%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "20%",
            fontSize: "12px",
          }}
        >
          Exatamente como a maioria
        </Text>
        <Text
          size="2"
          style={{
            position: "absolute",
            top: "105%",
            left: "70%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "20%",
            fontSize: "12px",
          }}
        >
          Mais que outros(as)
        </Text>
        <Text
          size="2"
          style={{
            position: "absolute",
            top: "105%",
            left: "85%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "20%",
            fontSize: "12px",
          }}
        >
          Muito mais que outros(as)
        </Text>

        {/* Pontos representando os scores */}
        {scores.map((score, index) => {
          // Todos os pontos na mesma posição se todos tiverem a mesma classificação
          const allSameClassification = scores.every(s => s.classification === scores[0].classification);
          
          // Posição horizontal baseada na classificação
          const position = getPositionFromClassification(score.classification);
          
          // Posição vertical - empilhar os pontos se tiverem a mesma classificação
          const verticalPosition = allSameClassification ? 
                                  40 + (index * 5) : // Empilhar verticalmente
                                  30 + (index * 5);  // Distribuir normalmente
          
          const color = 
            score.classification === "Muito menos que outros(as)" ? "#ff6b6b" :
            score.classification === "Menos que outros(as)" ? "#ffa94d" :
            score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "#51cf66" :
            score.classification === "Mais que outros(as)" ? "#339af0" :
            "#845ef7"; // Muito mais que outros(as)
          
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: `${verticalPosition}%`,
                left: `${position}%`,
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: color,
                border: "1px solid #333",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
              title={`${score.section}: ${score.score} (${score.classification})`}
            />
          );
        })}
      </Box>

      <Box mt="6">
        <Text size="3" weight="bold" mb="2">
          Legenda:
        </Text>
        <Box style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {scores.map((score, index) => {
            const color = 
              score.classification === "Muito menos que outros(as)" ? "#ff6b6b" :
              score.classification === "Menos que outros(as)" ? "#ffa94d" :
              score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "#51cf66" :
              score.classification === "Mais que outros(as)" ? "#339af0" :
              "#845ef7"; // Muito mais que outros(as)
            
            // Abreviação da classificação
            const shortClassification = 
              score.classification === "Muito menos que outros(as)" ? "Muito" :
              score.classification === "Menos que outros(as)" ? "Menos" :
              score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "Igual" :
              score.classification === "Mais que outros(as)" ? "Mais" : "Muito mais";
            
            return (
              <Box key={index} style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: "1px solid #333",
                  }}
                />
                <Text size="2">{score.section}: {score.score} ({shortClassification})</Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default NormalCurveChart;
