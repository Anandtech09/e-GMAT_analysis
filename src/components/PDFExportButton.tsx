
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PDFExportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: "Report Generated",
        description: "Your analysis report has been successfully generated.",
      });
      
      // In a real implementation, this would trigger a file download
      // Since this is a frontend-only demo, we're just showing the toast
    }, 2000);
  };

  return (
    <Button 
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
