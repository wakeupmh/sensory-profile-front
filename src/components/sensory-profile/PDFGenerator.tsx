import React, { useRef } from "react";
import { Button } from "@radix-ui/themes";
import ReportContent from "./ReportContent";
import { FormData } from "./types";

interface PDFGeneratorProps {
  formData: FormData;
  assessmentId?: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ formData }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        body * {
          visibility: hidden;
        }
        #print-content, #print-content * {
          visibility: visible;
        }
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 210mm;
        }
        .page-break {
          page-break-after: always;
          break-after: page;
        }
        .section-container {
          page-break-before: always;
          break-before: page;
        }
        .first-section {
          page-break-before: avoid;
          break-before: avoid;
        }
      }
    `;
    document.head.appendChild(style);

    // Show the content
    if (contentRef.current) {
      contentRef.current.style.display = 'block';
    }

    // Print
    window.print();

    // Clean up
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.style.display = 'none';
      }
      const printStyle = document.getElementById('print-style');
      if (printStyle) {
        document.head.removeChild(printStyle);
      }
    }, 500);
  };

  return (
    <div>
      <Button onClick={generatePDF} color="violet">
        Gerar PDF
      </Button>
      <div 
        id="print-content"
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
