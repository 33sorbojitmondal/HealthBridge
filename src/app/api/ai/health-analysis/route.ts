import { NextRequest, NextResponse } from 'next/server';
import { healthBertModel, healthCalculations } from '@/lib/ai/health-ai-service';
import { 
  UserHealthData, 
  BehaviorData, 
  LifestyleData, 
  HealthPrediction, 
  HealthCoachMessage 
} from '@/lib/ai/health-ai';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const requestData = await request.json();
    
    // Validate the request body
    if (!requestData || !requestData.type) {
      return NextResponse.json(
        { error: 'Invalid request: missing type parameter' },
        { status: 400 }
      );
    }
    
    // Handle different types of AI health analysis requests
    switch (requestData.type) {
      case 'disease-risk': {
        // Validate required parameters
        if (!requestData.userData || !requestData.lifestyleData) {
          return NextResponse.json(
            { error: 'Missing required data: userData and lifestyleData' },
            { status: 400 }
          );
        }
        
        const userData: UserHealthData = requestData.userData;
        const lifestyleData: LifestyleData = requestData.lifestyleData;
        
        // Generate disease risk predictions using the BERT model
        const predictions = healthBertModel.predictDiseaseRisk(userData, lifestyleData);
        
        return NextResponse.json({ predictions });
      }
      
      case 'behavior-analysis': {
        // Validate required parameters
        if (!requestData.behaviorData) {
          return NextResponse.json(
            { error: 'Missing required data: behaviorData' },
            { status: 400 }
          );
        }
        
        const behaviorData: BehaviorData = requestData.behaviorData;
        
        // Generate behavior insights using the BERT model
        const insights = healthBertModel.analyzeBehavior(behaviorData);
        
        return NextResponse.json({ insights });
      }
      
      case 'health-coaching': {
        // Validate required parameters
        if (!requestData.userData || !requestData.behaviorData) {
          return NextResponse.json(
            { error: 'Missing required data: userData and behaviorData' },
            { status: 400 }
          );
        }
        
        const userData: UserHealthData = requestData.userData;
        const behaviorData: BehaviorData = requestData.behaviorData;
        
        // Generate coaching messages using the BERT model
        const messages = healthBertModel.generateCoachingMessages(userData, behaviorData);
        
        return NextResponse.json({ messages });
      }
      
      case 'health-calculations': {
        const { calculation, params } = requestData;
        
        if (!calculation || !params) {
          return NextResponse.json(
            { error: 'Missing required data: calculation type and parameters' },
            { status: 400 }
          );
        }
        
        let result;
        
        switch (calculation) {
          case 'bmi':
            if (!params.height || !params.weight) {
              return NextResponse.json(
                { error: 'Missing height or weight parameters' },
                { status: 400 }
              );
            }
            
            const bmi = healthCalculations.calculateBMI(params.height, params.weight);
            const category = healthCalculations.getBMICategory(bmi);
            
            result = { 
              bmi: parseFloat(bmi.toFixed(1)), 
              category 
            };
            break;
            
          case 'bmr':
            if (!params.height || !params.weight || !params.age || !params.gender) {
              return NextResponse.json(
                { error: 'Missing required parameters for BMR calculation' },
                { status: 400 }
              );
            }
            
            const bmr = healthCalculations.calculateBMR(
              params.height, 
              params.weight, 
              params.age, 
              params.gender
            );
            
            result = { bmr };
            break;
            
          case 'heart-rate-zones':
            if (!params.restingHeartRate || !params.age) {
              return NextResponse.json(
                { error: 'Missing resting heart rate or age parameters' },
                { status: 400 }
              );
            }
            
            const zones = healthCalculations.calculateHeartRateZones(
              params.restingHeartRate,
              params.age
            );
            
            result = { zones };
            break;
            
          default:
            return NextResponse.json(
              { error: `Unknown calculation type: ${calculation}` },
              { status: 400 }
            );
        }
        
        return NextResponse.json(result);
      }
      
      case 'news-health-trends': {
        // This would normally fetch from a news API and analyze trends
        // For demo purposes, we're returning mock data
        
        const trends = [
          {
            trend: "COVID-19 Variant",
            region: "Global",
            riskLevel: "moderate",
            description: "New COVID variant showing increased transmissibility in select regions.",
            sources: ["WHO", "CDC"],
            lastUpdated: new Date().toISOString()
          },
          {
            trend: "Seasonal Flu",
            region: "Northern Hemisphere",
            riskLevel: "moderate",
            description: "Early start to the flu season with higher than normal case counts.",
            sources: ["CDC", "European CDC"],
            lastUpdated: new Date().toISOString()
          },
          {
            trend: "Allergies",
            region: "Midwest US",
            riskLevel: "low",
            description: "Higher pollen counts expected in the coming weeks due to early spring.",
            sources: ["National Allergy Bureau"],
            lastUpdated: new Date().toISOString()
          }
        ];
        
        return NextResponse.json({ trends });
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown analysis type: ${requestData.type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in health analysis API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return API documentation
  return NextResponse.json({
    endpoints: [
      {
        type: 'disease-risk',
        description: 'Predicts disease risk based on user health and lifestyle data',
        required: ['userData', 'lifestyleData']
      },
      {
        type: 'behavior-analysis',
        description: 'Analyzes user behavior patterns for health insights',
        required: ['behaviorData']
      },
      {
        type: 'health-coaching',
        description: 'Generates personalized health coaching messages',
        required: ['userData', 'behaviorData']
      },
      {
        type: 'health-calculations',
        description: 'Performs various health-related calculations',
        calculations: ['bmi', 'bmr', 'heart-rate-zones']
      },
      {
        type: 'news-health-trends',
        description: 'Provides health trends from news and public health sources',
        required: []
      }
    ]
  });
} 