import { NextRequest, NextResponse } from 'next/server';
import { healthBertModel } from '@/lib/ai/health-bert-model';
import {
  UserHealthData,
  LifestyleData,
  BehaviorData,
  HealthPrediction,
  BehaviorInsight,
  HealthCoachMessage,
  HealthTrend,
  BMIResult,
  HeartRateZones
} from '@/lib/ai/health-ai';

// Handler for POST requests to /api/health-ai
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { action, data } = requestData;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'calculateBMI':
        if (!data?.weight || !data?.height) {
          return NextResponse.json(
            { error: 'Missing required parameters for BMI calculation' },
            { status: 400 }
          );
        }
        result = healthBertModel.calculateBMI(
          data.weight,
          data.height,
          data.unit || 'metric'
        );
        break;

      case 'calculateBMR':
        if (!data?.weight || !data?.height || !data?.age || !data?.gender) {
          return NextResponse.json(
            { error: 'Missing required parameters for BMR calculation' },
            { status: 400 }
          );
        }
        result = healthBertModel.calculateBMR(
          data.weight,
          data.height,
          data.age,
          data.gender
        );
        break;

      case 'calculateHeartRateZones':
        if (!data?.age || !data?.restingHeartRate) {
          return NextResponse.json(
            { error: 'Missing required parameters for heart rate zones calculation' },
            { status: 400 }
          );
        }
        result = healthBertModel.calculateHeartRateZones(
          data.age,
          data.restingHeartRate
        );
        break;

      case 'predictDiseaseRisk':
        if (!data?.userData || !data?.lifestyleData) {
          return NextResponse.json(
            { error: 'Missing required user health or lifestyle data' },
            { status: 400 }
          );
        }
        result = await healthBertModel.predictDiseaseRisk(
          data.userData as UserHealthData,
          data.lifestyleData as LifestyleData
        );
        break;

      case 'analyzeBehavior':
        if (!data?.behaviorData) {
          return NextResponse.json(
            { error: 'Missing required behavior data' },
            { status: 400 }
          );
        }
        result = await healthBertModel.analyzeBehavior(
          data.behaviorData as BehaviorData
        );
        break;

      case 'generateCoachingMessages':
        if (!data?.userData || !data?.behaviorData) {
          return NextResponse.json(
            { error: 'Missing required user or behavior data' },
            { status: 400 }
          );
        }
        result = await healthBertModel.generateCoachingMessages(
          data.userData as UserHealthData,
          data.behaviorData as BehaviorData
        );
        break;

      case 'getHealthTrends':
        result = await healthBertModel.getHealthTrends(
          data?.region || 'Global'
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Health AI API error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

// Handler for GET requests - only for health trends to simplify client usage
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'getHealthTrends') {
      const region = searchParams.get('region') || 'Global';
      const trends = await healthBertModel.getHealthTrends(region);
      return NextResponse.json({ data: trends });
    }

    return NextResponse.json(
      { error: 'Invalid or missing action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Health AI API error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
} 