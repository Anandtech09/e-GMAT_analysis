
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchFeatureRequests, useBackendError } from '@/utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FeatureRequestsCard: React.FC = () => {
  const { showError, ErrorModal } = useBackendError();
  const { data: featureRequests, isLoading, error } = useQuery({
    queryKey: ['featureRequests'],
    queryFn: fetchFeatureRequests,
    meta: {
      onError: () => showError("Failed to load feature requests data")
    }
  });

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 h-[350px]">
        <CardHeader>
          <CardTitle>Top Feature Requests</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse bg-gray-100 h-[270px]"></CardContent>
      </Card>
    );
  }

  if (error || !featureRequests) {
    return <ErrorModal />;
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Feature Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col-reverse md:flex-row items-start justify-between">
          <div className="w-full md:w-1/2">
            <div className="space-y-4">
              {featureRequests.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{item.feature}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="rounded-full h-1.5" 
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-1/2 h-[250px] mb-4 md:mb-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={featureRequests}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  innerRadius="55%"
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="feature"
                >
                  {featureRequests.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureRequestsCard;
