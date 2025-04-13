import { NextRequest, NextResponse } from 'next/server';
import {
  UserHealthData,
  BehaviorData,
  LifestyleData,
  calculateBMI,
  calculateBMR,
  calculateHeartRateZones,
  calculateDiseaseRisk,
  fetchHealthTrends,
  generateHealthPrediction,
  generateHealthCoachMessages,
  analyzeBehaviorPatterns
} from '@/lib/ai/health-ai';

/**
 * API Route for handling health calculations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userData, behaviorData, lifestyleData, location } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required parameter: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'healthCalculations': {
        if (!userData) {
          return NextResponse.json(
            { error: 'Missing required parameter: userData' },
            { status: 400 }
          );
        }

        const { height, weight, age } = userData as UserHealthData;
        const bmi = calculateBMI(weight, height);
        const bmr = calculateBMR(userData as UserHealthData);
        const heartRateZones = calculateHeartRateZones(age);

        return NextResponse.json({
          bmi,
          bmr,
          heartRateZones
        });
      }

      case 'diseaseRisk': {
        if (!userData || !lifestyleData) {
          return NextResponse.json(
            { error: 'Missing required parameters: userData and/or lifestyleData' },
            { status: 400 }
          );
        }

        const risks = await calculateDiseaseRisk(
          userData as UserHealthData,
          lifestyleData as LifestyleData
        );

        return NextResponse.json({ risks });
      }

      case 'healthTrends': {
        if (!location) {
          return NextResponse.json(
            { error: 'Missing required parameter: location' },
            { status: 400 }
          );
        }

        const trends = await fetchHealthTrends(location);
        return NextResponse.json({ trends });
      }

      case 'healthPrediction': {
        if (!userData || !behaviorData || !lifestyleData) {
          return NextResponse.json(
            { error: 'Missing required parameters for health prediction' },
            { status: 400 }
          );
        }

        const prediction = await generateHealthPrediction(
          userData as UserHealthData,
          behaviorData as BehaviorData,
          lifestyleData as LifestyleData
        );

        return NextResponse.json({ prediction });
      }

      case 'healthCoach': {
        if (!userData || !behaviorData) {
          return NextResponse.json(
            { error: 'Missing required parameters for health coach' },
            { status: 400 }
          );
        }

        const messages = generateHealthCoachMessages(
          userData as UserHealthData,
          behaviorData as BehaviorData
        );

        return NextResponse.json({ messages });
      }

      case 'behaviorAnalysis': {
        if (!behaviorData) {
          return NextResponse.json(
            { error: 'Missing required parameter: behaviorData' },
            { status: 400 }
          );
        }

        const analysis = analyzeBehaviorPatterns(behaviorData as BehaviorData);
        return NextResponse.json({ analysis });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Health API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 