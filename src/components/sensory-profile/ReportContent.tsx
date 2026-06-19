import React from "react";
import { FormData, SensoryItem } from "./types";
import NormalCurveChart from "./NormalCurveChart";
import { getInstrument } from "../../instruments";
import type { ClassificationBand, InstrumentSection } from "../../instruments/types";

interface ReportContentProps {
  formData: FormData;
}

const quadrants = {
  seeking:     { title: "Busca Sensorial",        color: "#f4a261" },
  avoiding:    { title: "Evitação Sensorial",     color: "#4361ee" },
  sensitivity: { title: "Sensibilidade Sensorial", color: "#6a994e" },
  registration:{ title: "Registro Sensorial",     color: "#d62828" },
};

const responseValueMap: Record<string, number> = {
  "não se aplica": 0,
  "quase nunca": 1,
  "ocasionalmente": 2,
  "metade do tempo": 3,
  "frequentemente": 4,
  "quase sempre": 5,
};

const ReportContent: React.FC<ReportContentProps> = ({ formData }) => {
  const instrument = getInstrument(formData.instrumentId);

  const calculateSectionScore = (items: SensoryItem[]): number => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      const score = item.response ? responseValueMap[item.response] || 0 : 0;
      return total + score;
    }, 0);
  };

  const classifyScore = (score: number, section: InstrumentSection): { label: string; color: string } => {
    const bands: ClassificationBand[] = section.bands ?? instrument.defaultBands;
    if (!bands || bands.length === 0) return { label: "Sem dados suficientes", color: "#888" };

    const maxPossible = section.items.length * 5;
    for (const band of bands) {
      if (band.maxScoreAbs !== undefined && score <= band.maxScoreAbs) return { label: band.label, color: band.color };
      if (band.maxScorePct !== undefined) {
        const pct = maxPossible > 0 ? score / maxPossible : 0;
        if (pct <= band.maxScorePct) return { label: band.label, color: band.color };
      }
    }
    const last = bands[bands.length - 1];
    return { label: last.label, color: last.color };
  };

  const scoreData = instrument.sections.map((section) => {
    const sectionData = formData.sections?.[section.key] || { items: [] };
    const items = sectionData.items || [];

    const score = sectionData.rawScore !== undefined && sectionData.rawScore !== null
      ? sectionData.rawScore
      : calculateSectionScore(items);

    const { label, color } = classifyScore(score, section);

    return {
      sectionKey: section.key,
      section: section.title,
      score,
      classification: label,
      color,
    };
  });

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
        <h1 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>{instrument.name}</h1>
        <h2 style={{ fontSize: "18px", fontWeight: "normal", margin: "0" }}>Relatório de Avaliação</h2>
      </div>

      <div style={{ borderTop: "1px solid #6a994e", marginBottom: "20px" }}></div>

      {instrument.disclaimer && (
        <div style={{
          backgroundColor: "#fff8e1",
          border: "1px solid #f4c430",
          borderRadius: "4px",
          padding: "10px 14px",
          marginBottom: "20px",
          fontSize: "13px",
          fontStyle: "italic",
        }}>
          {instrument.disclaimer}
        </div>
      )}

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
                formData.child.gender === 'male' ? 'Masculino'
                  : formData.child.gender === 'female' ? 'Feminino'
                    : formData.child.gender === 'other' ? 'Outro'
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
                formData.caregiver.relationship === 'father' ? 'Pai'
                  : formData.caregiver.relationship === 'mother' ? 'Mãe'
                    : formData.caregiver.relationship === 'grandparent' ? 'Avô/Avó'
                      : formData.caregiver.relationship === 'other_relative' ? 'Outro Familiar'
                        : formData.caregiver.relationship === 'sibling' ? 'Irmão/Irmã'
                          : formData.caregiver.relationship === 'other' ? 'Outro'
                            : formData.caregiver.relationship || 'Não informada'
              }
            </div>
          </div>
          <div>
            <span style={fieldLabelStyle}>Contato:</span> {formData.caregiver.contact || 'Não informado'}
          </div>
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Quadrantes de Processamento Sensorial</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          Os quatro quadrantes descrevem padrões de como a criança processa estímulos sensoriais no cotidiano.
        </p>
        <div style={{ marginTop: "15px" }}>
          <div style={colorBarStyle(quadrants.seeking.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.seeking.color }}>{quadrants.seeking.title} (EX)</div>
            <div style={{ fontSize: "14px" }}>
              Busca ativamente mais experiências sensoriais do que o típico para a idade.
            </div>
          </div>
          <div style={colorBarStyle(quadrants.avoiding.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.avoiding.color }}>{quadrants.avoiding.title} (EV)</div>
            <div style={{ fontSize: "14px" }}>
              Procura reduzir o contato com estímulos sensoriais que considera desagradáveis.
            </div>
          </div>
          <div style={colorBarStyle(quadrants.sensitivity.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.sensitivity.color }}>{quadrants.sensitivity.title} (SN)</div>
            <div style={{ fontSize: "14px" }}>
              Nota e reage com maior intensidade a estímulos que outras crianças mal percebem.
            </div>
          </div>
          <div style={colorBarStyle(quadrants.registration.color)}>
            <div style={{ fontWeight: "bold", color: quadrants.registration.color }}>{quadrants.registration.title} (OB)</div>
            <div style={{ fontSize: "14px" }}>
              Tende a não perceber estímulos que outras crianças notam; registro sensorial reduzido.
            </div>
          </div>
        </div>
      </div>

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>Resumo das Pontuações</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          {instrument.hasNormalCurve
            ? "As pontuações são classificadas comparando o desempenho da criança com outras da mesma faixa etária."
            : "As pontuações indicam a frequência observada por seção, conforme as faixas definidas por este instrumento."}
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
            {scoreData.map((row, index) => (
              <tr key={row.sectionKey} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={tableCellStyle}>{row.section}</td>
                <td style={{ ...tableCellStyle, textAlign: 'center' as const }}>{row.score}</td>
                <td style={tableCellStyle}>{row.classification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {instrument.hasNormalCurve && (
        <>
          <div className="page-break"></div>
          <div style={sectionStyle} className="avoid-break section-container">
            <h3 style={subHeaderStyle}>Curva Normal e Sistema de Classificação</h3>
            <NormalCurveChart scores={scoreData} />
          </div>
        </>
      )}

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container detailed-responses">
        <h3 style={subHeaderStyle}>Detalhes das Respostas</h3>

        <div style={sectionContentStyle} className="detailed-responses">
          {instrument.sections.map((section, sectionIndex) => {
            const sectionData = formData.sections?.[section.key] || { items: [] };
            const items = sectionData.items || [];
            if (items.length === 0) return null;

            return (
              <React.Fragment key={section.key}>
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
                          { value: "não se aplica", label: "Não se aplica" },
                          { value: "quase nunca", label: "Quase Nunca" },
                          { value: "ocasionalmente", label: "Ocasionalmente" },
                          { value: "metade do tempo", label: "Metade do Tempo" },
                          { value: "frequentemente", label: "Frequentemente" },
                          { value: "quase sempre", label: "Quase Sempre" },
                        ];

                        const responseText = frequencyOptions.find(o => o.value === item.response)?.label || "Não respondido";
                        const responseValue = item.response ? Number(responseValueMap[item.response]) || 0 : 0;
                        const itemDescription = item.description || `Item ${item.id}`;

                        return (
                          <tr key={item.id} style={{ backgroundColor: itemIndex % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={tableCellStyle}>{itemDescription}</td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' as const }}>{responseText}</td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' as const }}>
                              {typeof responseValue === 'number' && !isNaN(responseValue) ? responseValue : 0}
                            </td>
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
                {formData.examiner.profession && (<span> - {formData.examiner.profession}</span>)}
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
