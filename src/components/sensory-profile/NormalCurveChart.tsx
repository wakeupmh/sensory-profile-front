import React from "react";
import { Box, Text } from "@radix-ui/themes";

interface NormalCurveChartProps {
  scores: Array<{
    section: string;
    score: number;
    classification: string;
  }>;
}

// Define distinct colors for each section
const sectionColors: Record<string, string> = {
  "Processamento Auditivo": "#E6194B", // Red
  "Processamento Visual": "#3CB44B", // Green
  "Processamento Tátil": "#FFE119", // Yellow
  "Processamento de Movimento": "#4363D8", // Blue
  "Processamento de Posição do Corpo": "#F58231", // Orange
  "Processamento de Sensibilidade Oral": "#911EB4", // Purple
  "Respostas Socioemocionais": "#46F0F0", // Cyan
  "Respostas de Atenção": "#FABEBE", // Pink
};

const getSectionColor = (section: string): string => {
  return sectionColors[section] || "#808080";
};

// Map classification to X position in SVG coordinates
const classificationToX: Record<string, number> = {
  "Muito menos que outros(as)": 150,
  "Menos que outros(as)": 300,
  "Exatamente como a maioria dos(as) outros(as)": 400,
  "Mais que outros(as)": 550,
  "Muito mais que outros(as)": 650,
};

const NormalCurveChart: React.FC<NormalCurveChartProps> = ({ scores }) => {
  // For vertical stacking, distribute points with small vertical offsets if they share the same classification
  const classificationCounts: Record<string, number> = {};

  // Print-friendly table as fallback
  const renderPrintFallback = () => (
    <div className="print-only" style={{ display: 'none' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
        Resultados da Avaliação Sensorial
      </h3>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>
              Área de Processamento
            </th>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
              Pontuação
            </th>
            <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>
              Classificação
            </th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #333', padding: '8px' }}>
                {score.section}
              </td>
              <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                {score.score}
              </td>
              <td style={{ border: '1px solid #333', padding: '8px' }}>
                {score.classification}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Box p="4">
      <Text size="6" weight="bold" mb="4">
        Curva Normal e Sistema de Classificação
      </Text>
      <Text size="3" mb="4" style={{ fontStyle: "italic" }}>
        O gráfico abaixo mostra a posição da criança em relação à curva normal de distribuição.
        Cada ponto colorido representa uma área de processamento sensorial.
      </Text>
      
      {/* Print fallback table */}
      {renderPrintFallback()}
      
      <Box 
        className="screen-only"
        style={{ 
          position: "relative", 
          width: "100%", 
          maxWidth: 800, 
          height: 220, 
          margin: "0 auto 80px auto",
          pageBreakInside: 'avoid'
        }}
      >
        {/* Enhanced SVG for better print compatibility */}
        <svg
          width="100%"
          height="220"
          viewBox="0 0 800 200"
          style={{ 
            display: "block",
            backgroundColor: 'white'
          }}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <rect width="800" height="200" fill="white" />
          {/* X axis */}
          <line x1="50" y1="170" x2="750" y2="170" stroke="#333" strokeWidth="2" />
          {/* X axis ticks */}
          <line x1="150" y1="165" x2="150" y2="175" stroke="#333" strokeWidth="1" />
          <line x1="300" y1="165" x2="300" y2="175" stroke="#333" strokeWidth="1" />
          <line x1="400" y1="165" x2="400" y2="175" stroke="#333" strokeWidth="1" />
          <line x1="550" y1="165" x2="550" y2="175" stroke="#333" strokeWidth="1" />
          <line x1="650" y1="165" x2="650" y2="175" stroke="#333" strokeWidth="1" />
          {/* X axis labels */}
          <text x="150" y="190" fontFamily="Arial" fontSize="12" textAnchor="middle">-2 DP</text>
          <text x="300" y="190" fontFamily="Arial" fontSize="12" textAnchor="middle">-1 DP</text>
          <text x="400" y="190" fontFamily="Arial" fontSize="12" textAnchor="middle">X̄</text>
          <text x="550" y="190" fontFamily="Arial" fontSize="12" textAnchor="middle">+1 DP</text>
          <text x="650" y="190" fontFamily="Arial" fontSize="12" textAnchor="middle">+2 DP</text>
          {/* Normal curve path */}
          <path d="M 50 170 C 50 170, 100 170, 150 150 C 200 130, 250 70, 400 50 C 550 70, 600 130, 650 150 C 700 170, 750 170, 750 170" fill="none" stroke="#6a994e" strokeWidth="3" />
          {/* Plot the points with enhanced print compatibility */}
          {scores.map((score, idx) => {
            const x = classificationToX[score.classification] || 400;
            // Count how many times this classification has been used so far
            classificationCounts[score.classification] = (classificationCounts[score.classification] || 0) + 1;
            // Stack vertically if needed
            const y = 170 - 18 - (classificationCounts[score.classification] - 1) * 18;
            const color = getSectionColor(score.section);
            return (
              <g key={idx}>
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill={color}
                  stroke="#333"
                  strokeWidth={2}
                  style={{
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                    colorAdjust: 'exact'
                  }}
                >
                  <title>{`${score.section}: ${score.score} (${score.classification})`}</title>
                </circle>
                {/* Add text label for print clarity */}
                <text 
                  x={x} 
                  y={y + 4} 
                  textAnchor="middle" 
                  fontSize="8" 
                  fill="white" 
                  fontWeight="bold"
                  style={{
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact'
                  }}
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      {/* Legend Section with print optimization */}
      <Box mt="6" className="screen-only">
        <Text size="3" weight="bold" mb="2">
          Legenda:
        </Text>
        <Box style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
          {scores.map((scoreItem, index) => {
            const color = getSectionColor(scoreItem.section);
            const shortClassification =
              scoreItem.classification === "Muito menos que outros(as)" ? "(Muito Menos)" :
              scoreItem.classification === "Menos que outros(as)" ? "(Menos)" :
              scoreItem.classification === "Exatamente como a maioria dos(as) outros(as)" ? "(Na Média)" :
              scoreItem.classification === "Mais que outros(as)" ? "(Mais)" :
              scoreItem.classification === "Muito mais que outros(as)" ? "(Muito Mais)" : "";
            return (
              <Box key={index} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div
                  className="legend-color-dot"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    border: "2px solid #333",
                    display: "inline-block",
                    printColorAdjust: "exact",
                    WebkitPrintColorAdjust: "exact",
                    colorAdjust: "exact",
                    fontSize: "10px",
                    color: "white",
                    textAlign: "center",
                    lineHeight: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {index + 1}
                </div>
                <Text size="2">{`${index + 1}. ${scoreItem.section}: ${scoreItem.score} ${shortClassification}`}</Text>
              </Box>
            );
          })}
        </Box>
      </Box>
      
      {/* Print-only simplified legend */}
      <div className="print-only" style={{ display: 'none', marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
          Legenda dos Resultados:
        </h4>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          {scores.map((scoreItem, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <strong>{index + 1}.</strong> {scoreItem.section}: {scoreItem.score} pontos - {scoreItem.classification}
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
};

export default NormalCurveChart;
