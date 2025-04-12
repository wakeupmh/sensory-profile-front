import React, { useRef } from "react";
import { Button } from "@radix-ui/themes";
import html2pdf from "html2pdf.js";
import ReportContent from "./ReportContent";
import { FormData } from "./types";

interface PDFGeneratorProps {
  formData: FormData;
  assessmentId?: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ formData, assessmentId }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    if (!contentRef.current) return;

    // Tornar o conteúdo visível temporariamente para captura
    const hiddenContent = contentRef.current;
    hiddenContent.style.display = 'block';

    const filename = formData.child && formData.child.name 
      ? `perfil_sensorial_${formData.child.name.replace(/\s+/g, '_')}.pdf`
      : `perfil_sensorial_${new Date().toISOString().split('T')[0]}.pdf`;

    // Configurações básicas
    const options = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Gerar o PDF
    html2pdf()
      .from(hiddenContent)
      .set(options)
      .save()
      .then(() => {
        // Esconder o conteúdo novamente
        hiddenContent.style.display = 'none';
      });
  };

  return (
    <div>
      <Button onClick={generatePDF} color="violet">
        Gerar PDF
      </Button>
      <div 
        ref={contentRef} 
        style={{ 
          display: "none",
          backgroundColor: "#ffffff",
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto"
        }}
      >
        <ReportContent formData={formData} />
      </div>
    </div>
  );
};

export default PDFGenerator;
