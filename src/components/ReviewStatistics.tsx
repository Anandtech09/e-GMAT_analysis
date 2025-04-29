
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchReviewStatistics, useBackendError } from '@/utils/api';

const ReviewStatistics: React.FC = () => {
  const { showError, ErrorModal } = useBackendError();
  const { data: statistics, isLoading, error } = useQuery({
    queryKey: ['reviewStatistics'],
    queryFn: fetchReviewStatistics,
    meta: {
      onError: () => showError("Failed to load review statistics")
    }
  });

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-pulse">
      <Card className="h-28"><CardContent className="p-6 bg-gray-100 h-full"></CardContent></Card>
      <Card className="h-28"><CardContent className="p-6 bg-gray-100 h-full"></CardContent></Card>
      <Card className="h-28"><CardContent className="p-6 bg-gray-100 h-full"></CardContent></Card>
      <Card className="md:col-span-3 h-64"><CardContent className="p-6 bg-gray-100 h-full"></CardContent></Card>
    </div>;
  }
  
  if (error || !statistics) {
    return <ErrorModal />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statistics.totalReviews}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statistics.averageRating.toFixed(1)}/5</div>
          <div className="flex mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star} 
                className={`h-5 w-5 ${star <= Math.round(statistics.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-500">78%</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-400">15%</div>
              <div className="text-xs text-gray-500">Neutral</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">7%</div>
              <div className="text-xs text-gray-500">Negative</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Reviews Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statistics.reviewsOverTime}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0073b9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStatistics;
