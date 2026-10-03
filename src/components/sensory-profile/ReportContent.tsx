import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseLocalDate } from '../../utils/date';
import { FormData, SensoryItem } from "./types";
import NormalCurveChart from "./NormalCurveChart";
import { getInstrument, getSectionsForItemIds } from "../../instruments";
import type { ClassificationBand, InstrumentSection } from "../../instruments/types";

interface ReportContentProps {
  formData: FormData;
  assessmentId?: string;
}

const quadrants = {
  seeking:     { title: "Busca Sensorial",        color: "#f4a261" },
  avoiding:    { title: "Evitação Sensorial",     color: "#4361ee" },
  sensitivity: { title: "Sensibilidade Sensorial", color: "#6a994e" },
  registration:{ title: "Registro Sensorial",     color: "#d62828" },
};

const SP2_FALLBACK_VALUE_MAP: Record<string, number> = {
  "não se aplica": 0,
  "quase nunca": 1,
  "ocasionalmente": 2,
  "metade do tempo": 3,
  "frequentemente": 4,
  "quase sempre": 5,
};

const SP2_FALLBACK_SCALE_OPTIONS = [
  { value: "não se aplica", label: "Não se aplica" },
  { value: "quase nunca", label: "Quase Nunca" },
  { value: "ocasionalmente", label: "Ocasionalmente" },
  { value: "metade do tempo", label: "Metade do Tempo" },
  { value: "frequentemente", label: "Frequentemente" },
  { value: "quase sempre", label: "Quase Sempre" },
];

const ReportContent: React.FC<ReportContentProps> = ({ formData, assessmentId }) => {
  const { t, i18n } = useTranslation();
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(i18n.language || 'pt-BR'), [i18n.language]);
  const instrument = getInstrument(formData.instrumentId);

  // Seções efetivas: instrumentos com seções dinâmicas (M-CHAT-R/F) derivam das respostas
  const sections: InstrumentSection[] = useMemo(() => {
    const itemIds = Object.values(formData.sections ?? {}).flatMap((s) => (s.items ?? []).map((i) => i.id));
    return getSectionsForItemIds(instrument, itemIds);
  }, [instrument, formData.sections]);

  const hasBands =
    instrument.defaultBands.length > 0 || sections.some((s) => (s.bands?.length ?? 0) > 0);

  const responseValueMap = useMemo(() => {
    if (!instrument?.scale?.options) {
      return SP2_FALLBACK_VALUE_MAP;
    }
    const map: Record<string, number> = {};
    for (const opt of instrument.scale.options) {
      map[opt.value] = opt.numeric;
    }
    return map;
  }, [instrument]);

  const scaleOptions = useMemo(() => {
    if (!instrument?.scale?.options) {
      return SP2_FALLBACK_SCALE_OPTIONS;
    }
    return instrument.scale.options.map(o => ({ value: o.value, label: o.label }));
  }, [instrument]);

  const scoreData = useMemo(() => {
    const calculateSectionScore = (items: SensoryItem[]): number => {
      if (!items || items.length === 0) return 0;
      return items.reduce((total, item) => {
        const score = item.response ? responseValueMap[item.response] || 0 : 0;
        return total + score;
      }, 0);
    };

    const classifyScore = (score: number, section: InstrumentSection): { label: string; color: string } => {
      const bands: ClassificationBand[] = section.bands ?? instrument.defaultBands;
      if (!bands || bands.length === 0) return { label: t('assessmentReport.insufficientData'), color: "#888" };

      const maxPerItem = instrument.scale
        ? Math.max(...instrument.scale.options.map((o) => o.numeric))
        : 5; // SP-2 fallback
      const maxPossible = section.items.length * maxPerItem;
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

    return sections.map((section) => {
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
  }, [instrument, sections, formData.sections, responseValueMap, t]);

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
    <div className="paper-surface" style={reportStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>{instrument.name}</h1>
        <h2 style={{ fontSize: "18px", fontWeight: "normal", margin: "0" }}>{t('assessmentReport.title')}</h2>
        {instrument.citation && (
          <p style={{ fontSize: "12px", color: "#666", marginTop: "6px", fontStyle: "italic" }}>
            {t('assessmentReport.source')} {instrument.citation}
          </p>
        )}
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
        <h3 style={subHeaderStyle}>{t('assessmentForm.fields.childData')}</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.name')}</span> {formData.child.name || t('assessmentReport.notInformedM')}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentForm.fields.age')}</span> {t('assessmentReport.years', { count: formData.child.age || 0 })}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentForm.fields.birthDate')}</span> {
                formData.child.birthDate
                  ? dateFmt.format(parseLocalDate(formData.child.birthDate))
                  : t('assessmentReport.notInformedF')
              }
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentForm.fields.gender')}</span> {
                formData.child.gender === 'male' ? t('assessmentForm.fields.male')
                  : formData.child.gender === 'female' ? t('assessmentForm.fields.female')
                    : formData.child.gender === 'other' ? t('assessmentForm.fields.other')
                      : formData.child.gender || t('assessmentReport.notInformedM')
              }
            </div>
          </div>
          {formData.child.otherInfo && (
            <div style={{ marginTop: "5px" }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.additionalInfo')}</span> {formData.child.otherInfo}
            </div>
          )}
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break">
        <h3 style={subHeaderStyle}>{t('assessmentForm.fields.examinerData')}</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.name')}</span> {formData.examiner.name || t('assessmentReport.notInformedM')}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.profession')}</span> {formData.examiner.profession || t('assessmentReport.notInformedF')}
            </div>
          </div>
          <div>
            <span style={fieldLabelStyle}>{t('assessmentForm.fields.contact')}</span> {formData.examiner.contact || t('assessmentReport.notInformedM')}
          </div>
        </div>
      </div>

      <div style={sectionStyle} className="avoid-break">
        <h3 style={subHeaderStyle}>{t('assessmentForm.fields.caregiverData')}</h3>
        <div style={sectionContentStyle}>
          <div style={{ display: "flex", flexDirection: "row", gap: "10px", marginBottom: "5px" }}>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.name')}</span> {formData.caregiver.name || t('assessmentReport.notInformedM')}
            </div>
            <div style={{ flex: 1 }}>
              <span style={fieldLabelStyle}>{t('assessmentReport.relationship')}</span> {
                ['father', 'mother', 'grandparent', 'other_relative', 'sibling', 'other'].includes(formData.caregiver.relationship)
                  ? t(`assessmentReport.relations.${formData.caregiver.relationship}`)
                  : formData.caregiver.relationship || t('assessmentReport.notInformedF')
              }
            </div>
          </div>
          <div>
            <span style={fieldLabelStyle}>{t('assessmentForm.fields.contact')}</span> {formData.caregiver.contact || t('assessmentReport.notInformedM')}
          </div>
        </div>
      </div>

      {instrument.hasQuadrants && (
        <div style={sectionStyle} className="avoid-break section-container">
          <h3 style={subHeaderStyle}>{t('assessmentReport.quadrants.title')}</h3>
          <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
            {t('assessmentReport.quadrants.intro')}
          </p>
          <div style={{ marginTop: "15px" }}>
            <div style={colorBarStyle(quadrants.seeking.color)}>
              <div style={{ fontWeight: "bold", color: quadrants.seeking.color }}>{t('assessmentReport.quadrants.seeking.title')} (EX)</div>
              <div style={{ fontSize: "14px" }}>
                {t('assessmentReport.quadrants.seeking.description')}
              </div>
            </div>
            <div style={colorBarStyle(quadrants.avoiding.color)}>
              <div style={{ fontWeight: "bold", color: quadrants.avoiding.color }}>{t('assessmentReport.quadrants.avoiding.title')} (EV)</div>
              <div style={{ fontSize: "14px" }}>
                {t('assessmentReport.quadrants.avoiding.description')}
              </div>
            </div>
            <div style={colorBarStyle(quadrants.sensitivity.color)}>
              <div style={{ fontWeight: "bold", color: quadrants.sensitivity.color }}>{t('assessmentReport.quadrants.sensitivity.title')} (SN)</div>
              <div style={{ fontSize: "14px" }}>
                {t('assessmentReport.quadrants.sensitivity.description')}
              </div>
            </div>
            <div style={colorBarStyle(quadrants.registration.color)}>
              <div style={{ fontWeight: "bold", color: quadrants.registration.color }}>{t('assessmentReport.quadrants.registration.title')} (OB)</div>
              <div style={{ fontSize: "14px" }}>
                {t('assessmentReport.quadrants.registration.description')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-break"></div>

      {instrument.summaryComponent && (
        <instrument.summaryComponent
          scores={formData.scoresJson ?? scoreData}
          instrument={instrument}
          assessmentId={assessmentId}
          sections={formData.sections}
        />
      )}

      {/* Sem faixas de classificação (ex.: M-CHAT-R) a tabela de pontuação bruta não tem significado */}
      {hasBands && (
      <div style={sectionStyle} className="avoid-break section-container">
        <h3 style={subHeaderStyle}>{t('assessmentReport.scores.title')}</h3>
        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
          {instrument.hasNormalCurve
            ? t('assessmentReport.scores.normed')
            : t('assessmentReport.scores.banded')}
        </p>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>{t('assessmentReport.scores.section')}</th>
              <th style={tableHeaderStyle}>{t('assessmentReport.scores.raw')}</th>
              <th style={tableHeaderStyle}>{t('assessmentReport.scores.classification')}</th>
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
      )}

      {instrument.hasNormalCurve && (
        <>
          <div className="page-break"></div>
          <div style={sectionStyle} className="avoid-break section-container">
            <h3 style={subHeaderStyle}>{t('assessmentReport.normalCurve')}</h3>
            <NormalCurveChart scores={scoreData} />
          </div>
        </>
      )}

      <div className="page-break"></div>

      <div style={sectionStyle} className="avoid-break section-container detailed-responses">
        <h3 style={subHeaderStyle}>{t('assessmentReport.details.title')}</h3>

        <div style={sectionContentStyle} className="detailed-responses">
          {sections.map((section, sectionIndex) => {
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
                        <th style={tableHeaderStyle}>{t('assessmentForm.item')}</th>
                        <th style={tableHeaderStyle}>{t('assessmentForm.answer')}</th>
                        {hasBands && <th style={tableHeaderStyle}>{t('assessmentReport.details.value')}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, itemIndex) => {
                        const responseText = scaleOptions.find(o => o.value === item.response)?.label || t('assessmentReport.details.unanswered');
                        const responseValue = item.response ? Number(responseValueMap[item.response]) || 0 : 0;
                        const itemDescription = item.description || `Item ${item.id}`;

                        return (
                          <tr key={item.id} style={{ backgroundColor: itemIndex % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={tableCellStyle}>{itemDescription}</td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' as const }}>{responseText}</td>
                            {hasBands && (
                              <td style={{ ...tableCellStyle, textAlign: 'center' as const }}>
                                {typeof responseValue === 'number' && !isNaN(responseValue) ? responseValue : 0}
                              </td>
                            )}
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
          <span style={fieldLabelStyle}>{t('assessmentReport.date')}</span> {
            formData.createdAt
              ? dateFmt.format(new Date(formData.createdAt))
              : dateFmt.format(new Date())
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
              t('assessmentReport.signature')
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;
