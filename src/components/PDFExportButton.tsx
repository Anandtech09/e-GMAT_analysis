import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PDFExportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      const element = document.body;
      if (!element) {
        throw new Error("Page content element not found");
      }

      const header = document.querySelector("header") || document.querySelector(".header");
      let headerDisplayStyle = "";
      if (header) {
        headerDisplayStyle = header.style.display;
        header.style.display = "none";
      }

      let buttonDisplayStyle = "";
      if (buttonRef.current) {
        buttonDisplayStyle = buttonRef.current.style.display;
        buttonRef.current.style.display = "none";
      }

      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );

      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowHeight: scrollHeight,
        scrollY: 0,
        width: document.documentElement.clientWidth,
      });

      if (header) {
        header.style.display = headerDisplayStyle || "";
      }
      if (buttonRef.current) {
        buttonRef.current.style.display = buttonDisplayStyle || "";
      }

      console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });
      console.log("Document scrollHeight:", scrollHeight);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210;
      const pdfHeight = 398;

      const canvasWidthMm = canvas.width / 3.78;
      const canvasHeightMm = canvas.height / 3.78;

      const scale = pdfWidth / canvasWidthMm;
      const scaledWidth = canvasWidthMm * scale;
      const scaledHeight = canvasHeightMm * scale;

      console.log("Scaled dimensions (mm):", { width: scaledWidth, height: scaledHeight });
      const imgData = canvas.toDataURL("image/png");

      const pageHeightMm = pdfHeight;
      const totalHeightMm = scaledHeight;
      const pageCount = Math.ceil(totalHeightMm / pageHeightMm);

      console.log("PDF page count:", pageCount);
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          "PNG",
          0,
          -(i * pageHeightMm),
          scaledWidth,
          scaledHeight*1.3,
          undefined,
          "FAST"
        );
      }

      pdf.save("e-GMAT_Analysis_Report.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      const header = document.querySelector("header") || document.querySelector(".header");
      if (header) {
        header.style.display = header.style.display || "";
      }
      if (buttonRef.current) {
        buttonRef.current.style.display = buttonRef.current.style.display || "";
      }
      setIsGenerating(false);
    }
  };

  return (
    <Button
      ref={buttonRef}
      onClick={handleExport}
      className="bg-brand-500 hover:bg-brand-600 text-white"
      disabled={isGenerating}
    >
      <Download className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating PDF..." : "Export PDF Report"}
    </Button>
  );
};

export default PDFExportButton;