
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReviews } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import { Skeleton } from "@/components/ui/skeleton";

const Reviews = () => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Latest Reviews</h1>
        
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <Card key={item} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-6 w-[50px]" />
                  </div>
                  <Skeleton className="h-4 w-[100px] mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews?.map((review) => (
              <Card key={review.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>{review.author}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {review.rating}/5
                    </span>
                  </CardTitle>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </CardHeader>
                <CardContent>
                  <p>{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
