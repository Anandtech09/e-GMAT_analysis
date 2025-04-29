
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Home, RefreshCw, Play } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleRefreshData = () => {
    // Simulate refreshing data
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest data from the server...",
    });
    
    // In a real app, you would trigger a data refresh here
    setTimeout(() => {
      toast({
        title: "Data Refreshed",
        description: "The latest data has been loaded.",
        variant: "default",
      });
    }, 1500);
  };

  const handleRunAnalysis = () => {
    toast({
      title: "Running Analysis",
      description: "Processing data and generating insights...",
    });
    
    // Navigate to analysis page after showing toast
    setTimeout(() => {
      toast({
        title: "Analysis Complete",
        description: "Your insights are ready to view.",
        variant: "default",
      });
      navigate('/analysis');
    }, 2000);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-brand-500" />
          <h1 className="font-bold text-xl text-brand-700">e-GMAT Review Analyzer</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center" onClick={() => navigate('/reviews')}>
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button size="sm" onClick={handleRunAnalysis} className="flex items-center">
            <Play className="mr-2 h-4 w-4" />
            Run Analysis
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
