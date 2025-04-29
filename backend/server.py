
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI()

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
CACHE_DURATION = 30 * 60  # 30 minutes in seconds

# In-memory cache
cache = {
    "reviews": {"data": None, "timestamp": None},
    "statistics": {"data": None, "timestamp": None},
    "features": {"data": None, "timestamp": None},
    "strengths": {"data": None, "timestamp": None},
    "trends": {"data": None, "timestamp": None}
}

class Review(BaseModel):
    id: str
    text: str
    rating: float
    date: str
    author: str

class Month(BaseModel):
    month: str
    count: int

class RatingDistribution(BaseModel):
    rating: int
    count: int

class ReviewStatistics(BaseModel):
    totalReviews: int
    averageRating: float
    reviewsOverTime: List[Month]
    ratingsDistribution: List[RatingDistribution]

class FeatureRequest(BaseModel):
    feature: str
    count: int
    percentage: float

class Strength(BaseModel):
    strength: str
    count: int
    percentage: float

class DataPoint(BaseModel):
    name: str
    data: List[int]

class TrendAnalysis(BaseModel):
    years: List[str]
    ratings: List[float]
    strengths: List[DataPoint]
    featureRequests: List[DataPoint]

def is_cache_valid(cache_type: str) -> bool:
    """Check if cache is valid for the given type."""
    cache_data = cache[cache_type]
    if cache_data["data"] and cache_data["timestamp"]:
        if datetime.now() - cache_data["timestamp"] < timedelta(seconds=CACHE_DURATION):
            return True
    return False

async def fetch_from_openrouter(prompt: str) -> dict:
    """Fetch data from OpenRouter API."""
    if not OPEN_ROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not set")
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPEN_ROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from OpenRouter API")
            
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Try to extract JSON from the content
            try:
                # Find JSON in the response if it's wrapped in text
                json_start = content.find('{')
                json_end = content.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except json.JSONDecodeError:
                # If we can't parse it as JSON, return the raw content
                return {"error": "Could not parse response as JSON", "raw_content": content}
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reviews", response_model=List[Review])
async def get_reviews():
    """Get reviews from e-GMAT on GMAT Club."""
    if is_cache_valid("reviews"):
        return cache["reviews"]["data"]
    
    try:
        prompt = """
        Please visit https://gmatclub.com/reviews/e-gmat-6 and extract the latest 10 reviews. 
        For each review, include:
        1. An id (can be a simple number or hash)
        2. The rating (out of 5)
        3. The date of the review
        4. The author/username
        5. The text content of the review
        
        Format the data as a JSON array of objects with the fields: id, text, rating, date, and author.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Ensure result is a list
        if isinstance(result, dict) and "error" not in result:
            reviews = result
        elif isinstance(result, list):
            reviews = result
        else:
            # Generate some minimal data if extraction failed
            reviews = []
            
        # Update cache
        cache["reviews"]["data"] = reviews
        cache["reviews"]["timestamp"] = datetime.now()
        
        return reviews
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics", response_model=ReviewStatistics)
async def get_statistics():
    """Get statistics about e-GMAT reviews."""
    if is_cache_valid("statistics"):
        return cache["statistics"]["data"]
    
    try:
        prompt = """
        Please analyze the reviews on https://gmatclub.com/reviews/e-gmat-6 and provide statistics in the following format:
        1. Total number of reviews
        2. Average rating
        3. Reviews over time (monthly counts for the last 12 months)
        4. Rating distribution (count of 1, 2, 3, 4 and 5 star reviews)
        
        Format the data as a JSON object with the fields:
        - totalReviews (number)
        - averageRating (number)
        - reviewsOverTime (array of objects with month and count)
        - ratingsDistribution (array of objects with rating and count)
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Update cache
        cache["statistics"]["data"] = result
        cache["statistics"]["timestamp"] = datetime.now()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/features", response_model=List[FeatureRequest])
async def get_features():
    """Get most requested features from e-GMAT reviews."""
    if is_cache_valid("features"):
        return cache["features"]["data"]
    
    try:
        prompt = """
        Please analyze the reviews on https://gmatclub.com/reviews/e-gmat-6 and extract the top 6 most requested features or improvements.
        For each feature, include:
        1. The name of the feature
        2. The count of mentions
        3. The percentage of reviews mentioning it
        
        Format the data as a JSON array of objects with the fields: feature, count, and percentage.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Update cache
        cache["features"]["data"] = result
        cache["features"]["timestamp"] = datetime.now()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/strengths", response_model=List[Strength])
async def get_strengths():
    """Get strengths mentioned in e-GMAT reviews."""
    if is_cache_valid("strengths"):
        return cache["strengths"]["data"]
    
    try:
        prompt = """
        Please analyze the reviews on https://gmatclub.com/reviews/e-gmat-6 and extract the top 5 most mentioned strengths or positive aspects.
        For each strength, include:
        1. The name or description of the strength
        2. The count of mentions
        3. The percentage of reviews mentioning it
        
        Format the data as a JSON array of objects with the fields: strength, count, and percentage.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Update cache
        cache["strengths"]["data"] = result
        cache["strengths"]["timestamp"] = datetime.now()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends", response_model=TrendAnalysis)
async def get_trends():
    """Get trend analysis from e-GMAT reviews over time."""
    if is_cache_valid("trends"):
        return cache["trends"]["data"]
    
    try:
        prompt = """
        Please analyze the reviews on https://gmatclub.com/reviews/e-gmat-6 and create a trend analysis for the past 4 years.
        Include:
        1. The years (as strings like "2020", "2021", etc.)
        2. Average ratings for each year
        3. Top 4 strengths and how they've changed over the years (as data points)
        4. Top 4 feature requests and how they've changed over the years (as data points)
        
        Format the data as a JSON object with the fields:
        - years (array of strings)
        - ratings (array of numbers)
        - strengths (array of objects with name and data array)
        - featureRequests (array of objects with name and data array)
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Update cache
        cache["trends"]["data"] = result
        cache["trends"]["timestamp"] = datetime.now()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
