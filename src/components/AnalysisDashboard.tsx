
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReviewStatistics from './ReviewStatistics';
import FeatureRequestsCard from './FeatureRequestsCard';
import StrengthsCard from './StrengthsCard';
import TrendAnalysisCard from './TrendAnalysisCard';
import PDFExportButton from './PDFExportButton';
import { useBackendError } from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const AnalysisDashboard: React.FC = () => {
  const { ErrorModal } = useBackendError();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the main page (/) or analysis page
  const isMainPage = location.pathname === '/';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {!isMainPage && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">Review Analysis Dashboard</h2>
        </div>
        <PDFExportButton />
      </div>
      
      <ReviewStatistics />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <FeatureRequestsCard />
        <StrengthsCard />
        <TrendAnalysisCard />
      </div>
      
      <div className="mt-8 bg-gray-50 border border-gray-100 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">About This Analysis</h3>
        <p className="text-sm text-gray-600">
          This analysis is based on GMAT Club e-GMAT reviews. 
          The data has been processed using natural language processing techniques to 
          identify key strengths, feature requests, and trends over time. The analysis 
          was last updated on April 28, 2025.
        </p>
      </div>
      
      <ErrorModal />
    </div>
  );
};

export default AnalysisDashboard;
