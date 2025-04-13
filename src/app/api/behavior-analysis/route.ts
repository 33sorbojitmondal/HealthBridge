import { NextResponse } from 'next/server';
import { 
  analyzeUserBehavior, 
  CommunicationStyle,
  BehaviorAnalysisResult
} from '@/lib/ai/health-prediction';

// In-memory storage for user behavior preferences (would use DB in production)
const userBehaviorCache: Map<string, BehaviorAnalysisResult> = new Map();

// Get the user's behavior analysis and communication preferences
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Check if we have a cached analysis
    let behaviorAnalysis = userBehaviorCache.get(userId);
    
    // If not, generate a new one
    if (!behaviorAnalysis) {
      behaviorAnalysis = analyzeUserBehavior(userId);
      userBehaviorCache.set(userId, behaviorAnalysis);
    }
    
    return NextResponse.json(behaviorAnalysis);
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    return NextResponse.json(
      { error: 'Failed to analyze user behavior' },
      { status: 500 }
    );
  }
}

// Update user communication preferences
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, communicationStyle } = data;
    
    if (!userId || !communicationStyle) {
      return NextResponse.json(
        { error: 'User ID and communication style are required' },
        { status: 400 }
      );
    }
    
    // Get existing analysis or create new one
    let behaviorAnalysis = userBehaviorCache.get(userId) || analyzeUserBehavior(userId);
    
    // Update communication style
    behaviorAnalysis.preferredCommunicationStyle = communicationStyle as CommunicationStyle;
    
    // Save back to cache
    userBehaviorCache.set(userId, behaviorAnalysis);
    
    return NextResponse.json({
      success: true,
      message: 'Communication preferences updated',
      behavior: behaviorAnalysis
    });
    
  } catch (error) {
    console.error('Error updating communication preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update communication preferences' },
      { status: 500 }
    );
  }
} 