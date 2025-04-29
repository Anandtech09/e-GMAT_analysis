
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { fetchTrendAnalysis, useBackendError } from '@/utils/api';

// Format the data for the chart
const formatChartData = (years: string[], dataset: { name: string, data: number[] }[]) => {
  return years.map((year, index) => {
    const dataPoint: Record<string, any> = { year };
    dataset.forEach((set) => {
      dataPoint[set.name] = set.data[index];
    });
    return dataPoint;
  });
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TrendAnalysisCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strengths');
  const { showError, ErrorModal } = useBackendError();
  const { data: trendAnalysis, isLoading, error } = useQuery({
    queryKey: ['trendAnalysis'],
    queryFn: fetchTrendAnalysis,
    meta: {
      onError: () => showError("Failed to load trend analysis data")
    }
  });
  
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-3 h-[400px]">
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse bg-gray-100 h-[320px]"></CardContent>
      </Card>
    );
  }
  
  if (error || !trendAnalysis) {
    return <ErrorModal />;
  }

  const strengthsData = formatChartData(trendAnalysis.years, trendAnalysis.strengths);
  const featureRequestsData = formatChartData(trendAnalysis.years, trendAnalysis.featureRequests);
  const ratingData = trendAnalysis.years.map((year, index) => ({
    year,
    rating: trendAnalysis.ratings[index]
  }));
  
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="strengths" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="strengths">Strengths</TabsTrigger>
            <TabsTrigger value="features">Feature Requests</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strengths" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthsData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {trendAnalysis.strengths.map((strength, index) => (
                  <Line 
                    key={strength.name}
                    type="monotone" 
                    dataKey={strength.name} 
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="features" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={featureRequestsData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                {trendAnalysis.featureRequests.map((feature, index) => (
                  <Line 
                    key={feature.name}
                    type="monotone" 
                    dataKey={feature.name} 
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="rating" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingData}>
                <XAxis dataKey="year" />
                <YAxis domain={[4, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#0073b9"
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisCard;
