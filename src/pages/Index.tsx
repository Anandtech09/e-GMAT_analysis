
import React from 'react';
import Header from '@/components/Header';
import AnalysisDashboard from '@/components/AnalysisDashboard';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AnalysisDashboard />
      </main>
    </div>
  );
};

export default Index;
