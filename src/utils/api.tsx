
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
  author: string;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  reviewsOverTime: { month: string; count: number }[];
  ratingsDistribution: { rating: number; count: number }[];
}

export interface FeatureRequest {
  feature: string;
  count: number;
  percentage: number;
}

export interface Strength {
  strength: string;
  count: number;
  percentage: number;
}

export interface TrendAnalysis {
  years: string[];
  ratings: number[];
  strengths: { name: string; data: number[] }[];
  featureRequests: { name: string; data: number[] }[];
}

export const fetchReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/reviews");
    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch reviews. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

export const fetchReviewStatistics = async (): Promise<ReviewStatistics> => {
  try {
    const response = await fetch("http://localhost:8000/api/statistics");
    if (!response.ok) {
      throw new Error("Failed to fetch statistics");
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch statistics. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};

export const fetchFeatureRequests = async (): Promise<FeatureRequest[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/features");
    if (!response.ok) {
      throw new Error("Failed to fetch feature requests");
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch feature requests. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};

export const fetchStrengths = async (): Promise<Strength[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/strengths");
    if (!response.ok) {
      throw new Error("Failed to fetch strengths");
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error", 
      description: "Failed to fetch strengths. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};

export const fetchTrendAnalysis = async (): Promise<TrendAnalysis> => {
  try {
    const response = await fetch("http://localhost:8000/api/trends");
    if (!response.ok) {
      throw new Error("Failed to fetch trend analysis");
    }
    return await response.json();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to fetch trend analysis. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};

export const useBackendError = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("The backend service is currently unavailable. Please try again later.");

  const showError = (message = "The backend service is currently unavailable. Please try again later.") => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const ErrorModal = () => (
    <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Backend Error</AlertDialogTitle>
          <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Dismiss</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { showError, ErrorModal };
};
