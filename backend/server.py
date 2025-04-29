from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI, AuthenticationError, APIError
import os
from dotenv import load_dotenv
from typing import List
from pydantic import BaseModel, validator
import json
from datetime import datetime, timedelta
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configure OpenAI client for OpenRouter
OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPEN_ROUTER_API_KEY
)

app = FastAPI()

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_DURATION = 30 * 60  # 30 minutes in seconds
USE_MOCK_DATA = False  # Set to True for testing without API

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

    @validator("id", pre=True)
    def convert_id_to_string(cls, v):
        """Convert id to string if it's an integer."""
        if isinstance(v, int):
            return str(v)
        return v

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
    """Fetch data from OpenRouter API using AsyncOpenAI client."""
    if USE_MOCK_DATA:
        logger.info("Using mock data")
        if "statistics" in prompt.lower():
            return {
                "totalReviews": 100,
                "averageRating": 4.5,
                "reviewsOverTime": [{"month": "2024-01", "count": 10}],
                "ratingsDistribution": [{"rating": 5, "count": 60}]
            }
        elif "features" in prompt.lower():
            return [{"feature": "Better UI", "count": 20, "percentage": 20.0}]
        elif "strengths" in prompt.lower():
            return [{"strength": "Great content", "count": 30, "percentage": 30.0}]
        elif "trends" in prompt.lower():
            return {
                "years": ["2021", "2022"],
                "ratings": [4.0, 4.5],
                "strengths": [{"name": "Content", "data": [10, 20]}],
                "featureRequests": [{"name": "UI", "data": [5, 10]}]
            }
        elif "reviews" in prompt.lower():
            return [
                {
                    "id": "1",
                    "text": "Great course!",
                    "rating": 5.0,
                    "date": "2024-01-01",
                    "author": "User1"
                }
            ]
        return {}
    
    if not OPEN_ROUTER_API_KEY:
        logger.error("OpenRouter API key not set")
        raise HTTPException(status_code=500, detail="OpenRouter API key not set")
    
    try:
        headers = {
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "e-GMAT Review Analysis"
        }
        logger.debug(f"Sending headers: {headers}")
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            extra_headers=headers,
            timeout=30.0
        )
        
        logger.info("OpenRouter API request successful")
        logger.debug(f"Raw OpenRouter API response: {response}")
        
        # Validate response structure
        if not response.choices or not response.choices[0].message:
            logger.error(f"Invalid API response structure: choices or message is missing, response: {response}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        content = response.choices[0].message.content
        if content is None:
            logger.error(f"Response content is None, response: {response}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        logger.debug(f"Raw response content: {content}")
        
        # Strip Markdown code block and extra whitespace
        content = re.sub(r'^\s*```(?:json)?\s*\n?|\n?\s*```\s*$', '', content, flags=re.MULTILINE).strip()
        logger.debug(f"Cleaned response content: {content}")
        
        try:
            # Try parsing the cleaned content directly
            parsed_data = json.loads(content)
            logger.info("Successfully parsed JSON from response")
            return parsed_data
        except json.JSONDecodeError as e:
            logger.warning(f"Direct JSON parsing failed: {str(e)}, attempting to extract JSON content")
            
            # Fallback: Extract content between first [ or { and last ] or }
            json_match = re.search(r'(\[.*?\]|\{.*?\})\s*$', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                logger.debug(f"Extracted JSON content: {json_str}")
                try:
                    parsed_data = json.loads(json_str)
                    logger.info("Successfully parsed extracted JSON from response")
                    return parsed_data
                except json.JSONDecodeError as e:
                    logger.error(f"Extracted JSON parsing error: {str(e)}, extracted content: {json_str}")
                    raise HTTPException(
                        status_code=500,
                        detail="Unable to fetch data using OpenRouter API"
                    )
            else:
                logger.error(f"No valid JSON found in response, cleaned content: {content}")
                raise HTTPException(
                    status_code=500,
                    detail="Unable to fetch data using OpenRouter API"
                )
                
    except AuthenticationError as e:
        logger.error(f"OpenRouter API authentication failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )
    except APIError as e:
        logger.error(f"OpenRouter API error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )
    except Exception as e:
        logger.error(f"Unexpected error in fetch_from_openrouter: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

@app.get("/api/reviews", response_model=List[Review])
async def get_reviews():
    """Get reviews from e-GMAT on GMAT Club."""
    if is_cache_valid("reviews"):
        return cache["reviews"]["data"]
    
    try:
        prompt = """
        Please visit https://gmatclub.com/reviews/e-gmat-6 and extract the latest 10 reviews. 
        For each review, include:
        1. An id (a string, e.g., "1", "2", etc.)
        2. The rating (out of 5)
        3. The date of the review
        4. The author/username
        5. The text content of the review
        
        Format the data as a JSON array of objects with the fields: id, text, rating, date, and author.
        Ensure the output is clean JSON without any Markdown or code block formatting.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Validate the response
        try:
            validated_data = [Review(**item) for item in result]
        except ValueError as e:
            logger.error(f"Pydantic validation error for reviews: {str(e)}, response: {result}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        # Update cache
        cache["reviews"]["data"] = validated_data
        cache["reviews"]["timestamp"] = datetime.now()
        
        return validated_data
        
    except Exception as e:
        logger.error(f"Error in get_reviews: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

@app.get("/api/statistics", response_model=ReviewStatistics)
async def get_statistics():
    """Get statistics about e-GMAT reviews."""
    if is_cache_valid("statistics"):
        return cache["statistics"]["data"]
    
    try:
        prompt = """
        Please analyze first 1000 reviews on https://gmatclub.com/reviews/e-gmat-6 and provide statistics in the following format:
        1. Total number of reviews
        2. Average rating
        3. Reviews over time (monthly counts for the last 12 months)
        4. Rating distribution (count of 1, 2, 3, 4 and 5 star reviews)
        
        Format the data as a JSON object with the fields:
        - totalReviews (number)
        - averageRating (number)
        - reviewsOverTime (array of objects with month and count)
        - ratingsDistribution (array of objects with rating and count)
        Ensure the output is clean JSON without any Markdown or code block formatting.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Validate the response
        try:
            validated_data = ReviewStatistics(**result)
        except ValueError as e:
            logger.error(f"Pydantic validation error for statistics: {str(e)}, response: {result}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        # Update cache
        cache["statistics"]["data"] = validated_data
        cache["statistics"]["timestamp"] = datetime.now()
        
        return validated_data
        
    except Exception as e:
        logger.error(f"Error in get_statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

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
        Ensure the output is clean JSON without any Markdown or code block formatting.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Validate the response
        try:
            validated_data = [FeatureRequest(**item) for item in result]
        except ValueError as e:
            logger.error(f"Pydantic validation error for features: {str(e)}, response: {result}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        # Update cache
        cache["features"]["data"] = validated_data
        cache["features"]["timestamp"] = datetime.now()
        
        return validated_data
        
    except Exception as e:
        logger.error(f"Error in get_features: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

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
        Ensure the output is clean JSON without any Markdown or code block formatting.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Validate the response
        try:
            validated_data = [Strength(**item) for item in result]
        except ValueError as e:
            logger.error(f"Pydantic validation error for strengths: {str(e)}, response: {result}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        # Update cache
        cache["strengths"]["data"] = validated_data
        cache["strengths"]["timestamp"] = datetime.now()
        
        return validated_data
        
    except Exception as e:
        logger.error(f"Error in get_strengths: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

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
        Ensure the output is clean JSON without any Markdown or code block formatting.
        """
        
        result = await fetch_from_openrouter(prompt)
        
        # Validate the response
        try:
            validated_data = TrendAnalysis(**result)
        except ValueError as e:
            logger.error(f"Pydantic validation error for trends: {str(e)}, response: {result}")
            raise HTTPException(
                status_code=500,
                detail="Unable to fetch data using OpenRouter API"
            )
        
        # Update cache
        cache["trends"]["data"] = validated_data
        cache["trends"]["timestamp"] = datetime.now()
        
        return validated_data
        
    except Exception as e:
        logger.error(f"Error in get_trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch data using OpenRouter API"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)