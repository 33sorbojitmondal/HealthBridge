import { NextResponse } from 'next/server';
import { 
  generateMockHealthPrediction, 
  analyzeNewsForHealthRisks,
  UserProfile
} from '@/lib/ai/health-prediction';

// In a real app, we would use a database to store user profiles
// For demo purposes, we'll use in-memory storage
const userProfiles: Map<string, UserProfile> = new Map();

// Simulate a model-based prediction endpoint
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const forceUpdate = url.searchParams.get('forceUpdate') === 'true';
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // In a production app, this would fetch user profile from database
    // and call actual ML models deployed as services
    
    // Generate a mock prediction for demo purposes
    const prediction = generateMockHealthPrediction(userId);
    
    // Get user location from profile or default to a region
    let userLocation = 'US';
    const userProfile = userProfiles.get(userId);
    if (userProfile && userProfile.region) {
      userLocation = userProfile.region;
    }
    
    // Fetch relevant health news
    const healthNews = await analyzeNewsForHealthRisks(userLocation);
    
    // Add relevant news to predictions
    prediction.relevantNews = healthNews;
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error generating health prediction:', error);
    return NextResponse.json(
      { error: 'Failed to generate health prediction' },
      { status: 500 }
    );
  }
}

// Update user profile with new data
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, profile } = data;
    
    if (!userId || !profile) {
      return NextResponse.json(
        { error: 'User ID and profile are required' },
        { status: 400 }
      );
    }
    
    // Store or update user profile
    userProfiles.set(userId, profile);
    
    // Generate updated prediction
    const prediction = generateMockHealthPrediction(userId);
    
    return NextResponse.json({
      success: true,
      message: 'User health profile updated',
      prediction
    });
    
  } catch (error) {
    console.error('Error updating user health profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user health profile' },
      { status: 500 }
    );
  }
} 