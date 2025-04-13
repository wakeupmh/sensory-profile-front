import React from "react";
import { FormData, SensoryItem, SensorySectionKey } from "./types";

interface ReportContentProps {
  formData: FormData;
}

// Definição dos quadrantes
const quadrants = {
  exploration: {
    title: "Exploração/Criança exploradora",
    color: "#f4a261", // Laranja
  },
  avoidance: {
    title: "Esquiva/Criança que se esquiva",
    color: "#4361ee", // Azul
  },
  sensitivity: {
    title: "Sensibilidade/Criança sensível",
    color: "#6a994e", // Verde
  },
  observation: {
    title: "Observação/Criança observadora",
    color: "#d62828", // Vermelho
  },
};

const ReportContent: React.FC<ReportContentProps> = ({ formData }) => {
  // Função para calcular a pontuação de uma seção
  const calculateSectionScore = (items: SensoryItem[]): number => {
    if (!items || items.length === 0) return 0;
    
    // Map response to numeric value for scoring
    const responseValueMap: Record<string, number> = {
      "not_applied": 0,
      "almost_never": 1,
      "occasionally": 2,
      "half_time": 3,
      "frequently": 4,
      "almost_always": 5
    };
    
    return items.reduce((total, item) => {
      const score = item.response ? responseValueMap[item.response] || 0 : 0;
      return total + score;
    }, 0);
  };

  // Função para classificar a pontuação
  const classifyScore = (score: number, section: SensorySectionKey): string => {
    // Define score ranges for each section based on the assessment guidelines
    const scoreRanges: Record<SensorySectionKey, { veryLow: number, low: number, average: number, high: number }> = {
      auditoryProcessing: { veryLow: 8, low: 16, average: 24, high: 32 },
      visualProcessing: { veryLow: 11, low: 22, average: 33, high: 44 },
      tactileProcessing: { veryLow: 18, low: 36, average: 54, high: 72 },
      movementProcessing: { veryLow: 16, low: 32, average: 48, high: 64 },
      bodyPositionProcessing: { veryLow: 12, low: 24, average: 36, high: 48 },
      oralSensitivityProcessing: { veryLow: 12, low: 24, average: 36, high: 48 },
      socialEmotionalResponses: { veryLow: 8, low: 16, average: 24, high: 32 },
      attentionResponses: { veryLow: 7, low: 14, average: 21, high: 28 }
    };
    
    const ranges = scoreRanges[section];
    
    if (!ranges) return "Sem dados suficientes";
    
    if (score <= ranges.veryLow) return "Muito menos que outros(as)";
    if (score <= ranges.low) return "Menos que outros(as)";
    if (score <= ranges.average) return "Exatamente como a maioria dos(as) outros(as)";
    if (score <= ranges.high) return "Mais que outros(as)";
    return "Muito mais que outros(as)";
  };

  // Obter todas as seções do formData
  const sections = [
    { key: "auditoryProcessing" as SensorySectionKey, title: "Processamento Auditivo" },
    { key: "visualProcessing" as SensorySectionKey, title: "Processamento Visual" },
    { key: "tactileProcessing" as SensorySectionKey, title: "Processamento Tátil" },
    { key: "movementProcessing" as SensorySectionKey, title: "Processamento de Movimento" },
    { key: "bodyPositionProcessing" as SensorySectionKey, title: "Processamento de Posição do Corpo" },
    { key: "oralSensitivityProcessing" as SensorySectionKey, title: "Processamento de Sensibilidade Oral" },
    { key: "socialEmotionalResponses" as SensorySectionKey, title: "Respostas Socioemocionais" },
    { key: "attentionResponses" as SensorySectionKey, title: "Respostas de Atenção" },
  ];

  // Preparar dados para o gráfico
  const scoreData = sections.map((section) => {
    const sectionData = formData[section.key] || { items: [] };
    const items = sectionData.items || [];
    
    // Use the rawScore from the API if available, otherwise calculate it
    const score = sectionData.rawScore !== undefined && sectionData.rawScore !== null
      ? sectionData.rawScore
      : calculateSectionScore(items);
      
    const classification = classifyScore(score, section.key);
    
    return {
      section: section.title,
      score,
      classification,
    };
  });

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

  // Estilo para o relatório
  const reportStyle = {
    fontFamily: "Arial, sans-serif",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "20px",
    lineHeight: "1.5",
    color: "#333",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "15px 20px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    pageBreakInside: "avoid" as const,
  };

  const sectionContentStyle = {
    pageBreakInside: "avoid" as const,
  };

  const headerStyle = {
    textAlign: "center" as const,
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #6a994e",
  };

  const subHeaderStyle = {
    fontSize: "18px",
    fontWeight: "bold" as const,
    marginBottom: "15px",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "8px",
  };

  const fieldLabelStyle = {
    fontWeight: "bold" as const,
    width: "180px",
    display: "inline-block",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "10px",
  };

  const tableCellStyle = {
    border: "1px solid #ddd",
    padding: "8px 12px",
    textAlign: "left" as const,
  };

  const tableHeaderStyle = {
    ...tableCellStyle,
    backgroundColor: "#f5f5f5",
    fontWeight: "bold" as const,
  };

  const colorBarStyle = (color: string) => ({
    borderLeft: `4px solid ${color}`,
    paddingLeft: "12px",
    marginBottom: "10px",
  });

  return (
    <div style={reportStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>Perfil Sensorial</h1>
        <h2 style={{ fontSize: "18px", fontWeight: "normal", margin: "0" }}>Relatório de Avaliação</h2>
      </div>
      
      <div style={{ borderTop: "1px solid #6a994e", marginBottom: "20px" }}></div>

      <div style={sectionStyle} className="avoid-break first-section">
        <h3 style={subHeaderStyle}>Dados da Criança</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Nome:</span> {formData.child.name || 'Não informado'}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Idade:</span> {formData.child.age || 0} anos
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Data de Nascimento:</span> {
                formData.child.birthDate 
                  ? new Intl.DateTimeFormat('pt-BR').format(new Date(formData.child.birthDate))
                  : 'Não informada'
              }
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Gênero:</span> {
                formData.child.gender === 'male' 
                  ? 'Masculino' 
                  : formData.child.gender === 'female' 
                    ? 'Feminino' 
                    : formData.child.gender || 'Não informado'
              }
            </div>
          </div>
          {formData.child.otherInfo && (
            <div style={{ marginTop: "5px" }}>
              <span style={fieldLabelStyle}>Informações Adicionais:</span> {formData.child.otherInfo}
            </div>
          )}
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break">
        <h3 style={subHeaderStyle}>Dados do Examinador</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Nome:</span> {formData.examiner.name || 'Não informado'}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Profissão:</span> {formData.examiner.profession || 'Não informada'}
            </div>
          </div>
          <div>
            <span style={fieldLabelStyle}>Contato:</span> {formData.examiner.contact || 'Não informado'}
          </div>
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break">
        <h3 style={subHeaderStyle}>Dados do Cuidador</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Nome:</span> {formData.caregiver.name || 'Não informado'}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>Relação:</span> {
                formData.caregiver.relationship === 'father' ? 'Pai' :
                formData.caregiver.relationship === 'mother' ? 'Mãe' :
                formData.caregiver.relationship === 'grandparent' ? 'Avô/Avó' :
                formData.caregiver.relationship === 'other_relative' ? 'Outro Familiar' :
                formData.caregiver.relationship || 'Não informada'
              }
            </div>
          </div>
          <div>
            <span style={fieldLabelStyle}>Contato:</span> {formData.caregiver.contact || 'Não informado'}
          </div>
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Tipos de Perfil Sensorial</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          O Perfil Sensorial 2 identifica quatro tipos de perfis sensoriais que descrevem como a criança processa informações sensoriais.
        </p>
        
        <div style={{ marginTop: "15px" }}>
          <div style={colorBarStyle(quadrants.exploration.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.exploration.color }}>Exploração/Criança exploradora</div>
            <div style={{ fontSize: "14px" }}>
              Criança que busca ativamente experiências sensoriais, demonstrando comportamentos de busca sensorial.
            </div>
          </div>
          
          <div style={colorBarStyle(quadrants.avoidance.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.avoidance.color }}>Esquiva/Criança que se esquiva</div>
            <div style={{ fontSize: "14px" }}>
              Criança que evita experiências sensoriais, demonstrando comportamentos de esquiva sensorial.
            </div>
          </div>
          
          <div style={colorBarStyle(quadrants.sensitivity.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.sensitivity.color }}>Sensibilidade/Criança sensível</div>
            <div style={{ fontSize: "14px" }}>
              Criança que é sensível a estímulos sensoriais, demonstrando comportamentos de sensibilidade sensorial.
            </div>
          </div>
          
          <div style={colorBarStyle(quadrants.observation.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.observation.color }}>Observação/Criança observadora</div>
            <div style={{ fontSize: "14px" }}>
              Criança que observa atentamente antes de se engajar, demonstrando comportamentos de registro sensorial.
            </div>
          </div>
        </div>
      </div>

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Resumo das Pontuações</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          As pontuações são classificadas de acordo com o Perfil Sensorial 2, comparando o desempenho da criança com outras da mesma faixa etária.
        </p>
        
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Seção</th>
              <th style={tableHeaderStyle}>Pontuação Bruta</th>
              <th style={tableHeaderStyle}>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, index) => {
              const sectionData = formData[section.key] || { items: [] };
              const items = sectionData.items || [];
              const score = sectionData.rawScore !== undefined && sectionData.rawScore !== null
                ? sectionData.rawScore
                : calculateSectionScore(items);
              const classification = classifyScore(score, section.key);
              
              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={tableCellStyle}>{section.title}</td>
                  <td style={{...tableCellStyle, textAlign: 'center' as const}}>{score}</td>
                  <td style={tableCellStyle}>{classification}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Curva Normal e Sistema de Classificação</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          O gráfico abaixo mostra a posição da criança em relação à curva normal de distribuição. Cada ponto colorido representa uma área de processamento sensorial.
        </p>
        
        <div style={{ position: "relative", width: "100%", height: "180px", marginBottom: "80px", backgroundColor: "#ffffff" }}>
          {/* Curva normal simplificada */}
          <div style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center"
          }}>
            {/* Linha base */}
            <div style={{ width: "90%", height: "2px", backgroundColor: "#333", marginBottom: "30px", position: "relative" }}>
              {/* Marcações */}
              <div style={{ position: "absolute", left: "10%", height: "10px", width: "2px", backgroundColor: "#333", top: "-5px" }}></div>
              <div style={{ position: "absolute", left: "30%", height: "10px", width: "2px", backgroundColor: "#333", top: "-5px" }}></div>
              <div style={{ position: "absolute", left: "50%", height: "10px", width: "2px", backgroundColor: "#333", top: "-5px" }}></div>
              <div style={{ position: "absolute", left: "70%", height: "10px", width: "2px", backgroundColor: "#333", top: "-5px" }}></div>
              <div style={{ position: "absolute", left: "90%", height: "10px", width: "2px", backgroundColor: "#333", top: "-5px" }}></div>
              
              {/* Textos */}
              <div style={{ position: "absolute", left: "10%", top: "15px", transform: "translateX(-50%)", fontSize: "12px" }}>-2 DP</div>
              <div style={{ position: "absolute", left: "30%", top: "15px", transform: "translateX(-50%)", fontSize: "12px" }}>-1 DP</div>
              <div style={{ position: "absolute", left: "50%", top: "15px", transform: "translateX(-50%)", fontSize: "12px" }}>X</div>
              <div style={{ position: "absolute", left: "70%", top: "15px", transform: "translateX(-50%)", fontSize: "12px" }}>+1 DP</div>
              <div style={{ position: "absolute", left: "90%", top: "15px", transform: "translateX(-50%)", fontSize: "12px" }}>+2 DP</div>
              
              {/* Classificações */}
              <div style={{ position: "absolute", left: "10%", top: "35px", transform: "translateX(-50%)", fontSize: "10px", width: "80px", textAlign: "center" }}>
                Muito menos que outros(as)
              </div>
              <div style={{ position: "absolute", left: "30%", top: "35px", transform: "translateX(-50%)", fontSize: "10px", width: "80px", textAlign: "center" }}>
                Menos que outros(as)
              </div>
              <div style={{ position: "absolute", left: "50%", top: "35px", transform: "translateX(-50%)", fontSize: "10px", width: "80px", textAlign: "center" }}>
                Exatamente como a maioria
              </div>
              <div style={{ position: "absolute", left: "70%", top: "35px", transform: "translateX(-50%)", fontSize: "10px", width: "80px", textAlign: "center" }}>
                Mais que outros(as)
              </div>
              <div style={{ position: "absolute", left: "90%", top: "35px", transform: "translateX(-50%)", fontSize: "10px", width: "80px", textAlign: "center" }}>
                Muito mais que outros(as)
              </div>
              
              {/* Curva */}
              <div style={{ 
                position: "absolute", 
                width: "80%", 
                height: "80px", 
                left: "10%",
                top: "-80px",
                borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                borderTop: "3px solid #6a994e",
                borderLeft: "3px solid #6a994e",
                borderRight: "3px solid #6a994e",
              }}></div>
            </div>
          </div>

          {/* Pontos representando os scores */}
          {scoreData.map((score, index) => {
            // Todos os pontos na mesma posição se todos tiverem a mesma classificação
            const allSameClassification = scoreData.every(s => s.classification === scoreData[0].classification);
            
            // Posição horizontal baseada na classificação
            const position = getPositionFromClassification(score.classification);
            
            // Posição vertical - empilhar os pontos se tiverem a mesma classificação
            const verticalPosition = allSameClassification ? 
                                    40 + (index * 5) : // Empilhar verticalmente
                                    30 + (index * 5);  // Distribuir normalmente
                            
            const color = score.classification === "Muito menos que outros(as)" ? "#ff6b6b" :
                          score.classification === "Menos que outros(as)" ? "#ffa94d" :
                          score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "#51cf66" :
                          score.classification === "Mais que outros(as)" ? "#339af0" : "#845ef7";
            
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
        </div>
        
        {/* Legenda */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Legenda:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {scoreData.map((score, index) => {
              const color = score.classification === "Muito menos que outros(as)" ? "#ff6b6b" :
                          score.classification === "Menos que outros(as)" ? "#ffa94d" :
                          score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "#51cf66" :
                          score.classification === "Mais que outros(as)" ? "#339af0" : "#845ef7";
              
              // Abreviação da classificação
              const shortClassification = score.classification === "Muito menos que outros(as)" ? "Muito" :
                                         score.classification === "Menos que outros(as)" ? "Menos" :
                                         score.classification === "Exatamente como a maioria dos(as) outros(as)" ? "Igual" :
                                         score.classification === "Mais que outros(as)" ? "Mais" : "Muito mais";
              
              return (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: color,
                      border: "1px solid #333",
                    }}
                  />
                  <div style={{ fontSize: "14px" }}>{score.section}: {score.score} ({shortClassification})</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Interpretação das Pontuações</h3>
        
        <div style={sectionContentStyle}>
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Muito menos que outros(as):</div>
            <p style={{ margin: "0 0 10px 0" }}>
              Indica que a criança demonstra comportamentos relacionados a esta seção com muito menos frequência que seus pares.
            </p>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Menos que outros(as):</div>
            <p style={{ margin: "0 0 10px 0" }}>
              Indica que a criança demonstra comportamentos relacionados a esta seção com menos frequência que seus pares.
            </p>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Exatamente como a maioria dos(as) outros(as):</div>
            <p style={{ margin: "0 0 10px 0" }}>
              Indica que a criança demonstra comportamentos relacionados a esta seção com a mesma frequência que seus pares.
            </p>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Mais que outros(as):</div>
            <p style={{ margin: "0 0 10px 0" }}>
              Indica que a criança demonstra comportamentos relacionados a esta seção com mais frequência que seus pares.
            </p>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Muito mais que outros(as):</div>
            <p style={{ margin: "0 0 10px 0" }}>
              Indica que a criança demonstra comportamentos relacionados a esta seção com muito mais frequência que seus pares.
            </p>
          </div>
        </div>
      </div>

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container detailed-responses">
        <h3 style={subHeaderStyle}>Detalhes das Respostas</h3>
        
        <div style={sectionContentStyle} className="detailed-responses">
          {sections.map((section, sectionIndex) => {
            const sectionData = formData[section.key] || { items: [] };
            const items = sectionData.items || [];
            
            if (items.length === 0) return null;
            
            return (
              <React.Fragment key={sectionIndex}>
                {sectionIndex > 0 && <div className="page-break"></div>}
                <div className="sensory-section" style={{ marginBottom: "30px", pageBreakInside: "avoid" as const }}>
                  <h4 style={{ fontSize: "16px", marginBottom: "10px", color: "#444" }}>{section.title}</h4>
                  
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Item</th>
                        <th style={tableHeaderStyle}>Resposta</th>
                        <th style={tableHeaderStyle}>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, itemIndex) => {
                        const frequencyOptions = [
                          { value: "not_applied", label: "Não se aplica" },
                          { value: "almost_never", label: "Quase Nunca" },
                          { value: "half_time", label: "Metade do Tempo" },
                          { value: "occasionally", label: "Ocasionalmente" },
                          { value: "almost_always", label: "Quase Sempre" },
                          { value: "frequently", label: "Frequentemente" }
                        ];

                        const responseText = frequencyOptions.find(option => option.value === item.response)?.label || "Não respondido";
                        
                        // Map response to numeric value for scoring
                        const responseValueMap: Record<string, number> = {
                          "not_applied": 0,
                          "almost_never": 1,
                          "occasionally": 2,
                          "half_time": 3,
                          "frequently": 4,
                          "almost_always": 5
                        };
                        
                        const responseValue = item.response ? responseValueMap[item.response] || 0 : 0;
                        
                        // Ensure we have a description for the item
                        const itemDescription = item.description || `Item ${item.id}`;
                          
                        return (
                          <tr key={itemIndex} style={{ backgroundColor: itemIndex % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={tableCellStyle}>{itemDescription}</td>
                            <td style={{...tableCellStyle, textAlign: 'center' as const}}>{responseText}</td>
                            <td style={{...tableCellStyle, textAlign: 'center' as const}}>{responseValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="page-break"></div>

      <div style={{ marginTop: "30px", pageBreakBefore: "always" as const }}>
        <div style={{ marginBottom: "10px" }}>
          <span style={fieldLabelStyle}>Data da Avaliação:</span> {
            formData.createdAt 
              ? new Intl.DateTimeFormat('pt-BR').format(new Date(formData.createdAt)) 
              : new Intl.DateTimeFormat('pt-BR').format(new Date())
          }
        </div>
        
        <div style={{ marginTop: "40px" }}>
          <div style={{ width: "60%", borderTop: "1px solid #000", marginTop: "40px" }}></div>
          <div style={{ marginTop: "5px" }}>
            {formData.examiner?.name ? (
              <>
                {formData.examiner.name}
                {formData.examiner.profession && (
                  <span> - {formData.examiner.profession}</span>
                )}
              </>
            ) : (
              "Assinatura do Examinador"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;
