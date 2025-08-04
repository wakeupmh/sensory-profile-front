import React, { useRef, useState } from "react";
import { Button } from "@radix-ui/themes";
import ReportContent from "./ReportContent";
import { FormData } from "./types";

interface PDFGeneratorProps {
  formData: FormData;
  assessmentId?: string;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ formData }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Add comprehensive print-specific styles
      const style = document.createElement('style');
      style.id = 'print-style';
      style.innerHTML = `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Hide everything first */
          body * {
            visibility: hidden !important;
          }
          
          /* Show only print content */
          #print-content, #print-content * {
            visibility: visible !important;
          }
          
          #print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Page breaks */
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          
          .section-container {
            page-break-before: always !important;
            break-before: page !important;
          }
          
          .first-section {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Show print-only content */
          .print-only {
            display: block !important;
          }
          
          /* Hide screen-only content */
          .screen-only {
            display: none !important;
          }
          
          /* Chart and SVG specific */
          svg {
            max-width: 100% !important;
            height: auto !important;
            background: white !important;
          }
          
          /* Color preservation */
          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Table styles */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          
          th, td {
            border: 1px solid #333 !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
          
          /* Typography */
          h1, h2, h3, h4, h5, h6 {
            color: #333 !important;
            margin-top: 0 !important;
          }
          
          /* Ensure text is readable */
          p, div, span {
            color: #333 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Show the content with a small delay for style application
      if (contentRef.current) {
        contentRef.current.style.display = 'block';
      }

      // Wait for content to render and styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));

      // Focus the window and print
      window.focus();
      window.print();

      // Clean up after print dialog closes
      setTimeout(() => {
        try {
          if (contentRef.current) {
            contentRef.current.style.display = 'none';
          }
          const printStyle = document.getElementById('print-style');
          if (printStyle && printStyle.parentNode) {
            printStyle.parentNode.removeChild(printStyle);
          }
        } catch (cleanupError) {
          console.warn('Error during cleanup:', cleanupError);
        } finally {
          setIsGenerating(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={generatePDF} 
        color="violet"
        disabled={isGenerating}
      >
        {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
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
