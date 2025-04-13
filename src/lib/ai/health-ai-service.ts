/**
 * Health AI Service
 * Handles AI model processing for health predictions and analysis
 */

import { UserHealthData, BehaviorData, LifestyleData, HealthPrediction, HealthCoachMessage } from './health-ai';

// Mock BERT model for health prediction (would be replaced with actual ML model implementation)
class HealthBertModel {
  // Predicts disease risk based on health data
  predictDiseaseRisk(userData: UserHealthData, lifestyleData: LifestyleData): { 
    condition: string; 
    risk: 'low' | 'moderate' | 'high';
    probability: number;
  }[] {
    // This would actually use a trained BERT model
    // For now, we'll return mock predictions based on simple rules
    
    const predictions: { 
      condition: string; 
      risk: 'low' | 'moderate' | 'high';
      probability: number;
    }[] = [];
    
    // Simple rule-based mock predictions
    // In a real implementation, this would use the BERT model to analyze the data
    
    // Heart disease risk assessment
    if (userData.bloodPressure && userData.bloodPressure.systolic > 140) {
      const risk = userData.bloodPressure.systolic > 160 ? 'high' : 'moderate';
      predictions.push({
        condition: 'Hypertension',
        risk,
        probability: risk === 'high' ? 0.75 : 0.5
      });
    }
    
    // Diabetes risk
    if (userData.bloodGlucose && userData.bloodGlucose > 100) {
      const risk = userData.bloodGlucose > 125 ? 'high' : 'moderate';
      predictions.push({
        condition: 'Type 2 Diabetes',
        risk,
        probability: risk === 'high' ? 0.8 : 0.45
      });
    }
    
    // BMI calculation for weight-related risks
    const bmi = userData.weight / Math.pow(userData.height / 100, 2);
    
    if (bmi > 30) {
      predictions.push({
        condition: 'Obesity',
        risk: 'high',
        probability: 0.9
      });
      
      // Add related conditions with lower probabilities
      predictions.push({
        condition: 'Sleep Apnea',
        risk: 'moderate',
        probability: 0.6
      });
    } else if (bmi > 25) {
      predictions.push({
        condition: 'Overweight',
        risk: 'moderate',
        probability: 0.8
      });
    }
    
    // Smoking-related conditions
    if (lifestyleData.smoking.status === 'current') {
      predictions.push({
        condition: 'Lung Disease',
        risk: 'high',
        probability: 0.7
      });
      
      predictions.push({
        condition: 'Heart Disease',
        risk: 'moderate',
        probability: 0.6
      });
    }
    
    // If no specific conditions found, add a generic low risk entry
    if (predictions.length === 0) {
      predictions.push({
        condition: 'General Health',
        risk: 'low',
        probability: 0.2
      });
    }
    
    return predictions;
  }
  
  // Analyzes behavior patterns
  analyzeBehavior(behaviorData: BehaviorData): {
    category: string;
    insight: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidenceScore: number;
  }[] {
    const insights: {
      category: string;
      insight: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      confidenceScore: number;
    }[] = [];
    
    // Sleep analysis
    if (behaviorData.sleepPatterns && behaviorData.sleepPatterns.length > 0) {
      const avgSleep = behaviorData.sleepPatterns.reduce((acc, curr) => acc + curr.hoursSlept, 0) / behaviorData.sleepPatterns.length;
      
      if (avgSleep < 6) {
        insights.push({
          category: 'sleep',
          insight: 'Your sleep duration is below recommended levels',
          sentiment: 'negative',
          confidenceScore: 0.85
        });
      } else if (avgSleep >= 7 && avgSleep <= 9) {
        insights.push({
          category: 'sleep',
          insight: 'Your sleep duration is within healthy range',
          sentiment: 'positive',
          confidenceScore: 0.9
        });
      }
      
      // Sleep quality analysis
      const avgQuality = behaviorData.sleepPatterns.reduce((acc, curr) => acc + curr.quality, 0) / behaviorData.sleepPatterns.length;
      if (avgQuality < 5) {
        insights.push({
          category: 'sleep',
          insight: 'Your sleep quality is poor',
          sentiment: 'negative',
          confidenceScore: 0.8
        });
      }
    }
    
    // Exercise analysis
    if (behaviorData.exercise && behaviorData.exercise.length > 0) {
      const exercises = behaviorData.exercise;
      const exerciseDays = new Set(exercises.map(e => e.date)).size;
      
      if (exerciseDays >= 5) {
        insights.push({
          category: 'exercise',
          insight: 'You exercise regularly which is excellent for your health',
          sentiment: 'positive',
          confidenceScore: 0.9
        });
      } else if (exerciseDays <= 2) {
        insights.push({
          category: 'exercise',
          insight: 'You would benefit from more regular exercise',
          sentiment: 'negative',
          confidenceScore: 0.8
        });
      }
      
      // Exercise intensity
      const highIntensityCount = exercises.filter(e => e.intensity === 'high').length;
      if (highIntensityCount >= 2) {
        insights.push({
          category: 'exercise',
          insight: 'You include high intensity workouts in your routine',
          sentiment: 'positive',
          confidenceScore: 0.85
        });
      }
    }
    
    // Medication adherence
    if (behaviorData.medicationAdherence && behaviorData.medicationAdherence.length > 0) {
      const adherenceRate = behaviorData.medicationAdherence.filter(m => m.takenAsScheduled).length / behaviorData.medicationAdherence.length;
      
      if (adherenceRate < 0.8) {
        insights.push({
          category: 'medication',
          insight: 'Your medication adherence could be improved',
          sentiment: 'negative',
          confidenceScore: 0.9
        });
      } else if (adherenceRate > 0.95) {
        insights.push({
          category: 'medication',
          insight: 'You follow your medication schedule very well',
          sentiment: 'positive',
          confidenceScore: 0.95
        });
      }
    }
    
    // Nutrition analysis
    if (behaviorData.nutrition && behaviorData.nutrition.length > 0) {
      const nutrition = behaviorData.nutrition;
      
      // Water intake analysis
      const avgWaterIntake = nutrition.reduce((acc, day) => acc + day.waterIntake, 0) / nutrition.length;
      if (avgWaterIntake < 64) { // Less than 8 cups (8oz each)
        insights.push({
          category: 'nutrition',
          insight: 'Your water intake is below recommended levels',
          sentiment: 'negative',
          confidenceScore: 0.85
        });
      } else {
        insights.push({
          category: 'nutrition',
          insight: 'You stay well hydrated',
          sentiment: 'positive',
          confidenceScore: 0.9
        });
      }
      
      // Meal frequency analysis
      const avgMealsPerDay = nutrition.reduce((acc, day) => acc + day.meals.length, 0) / nutrition.length;
      if (avgMealsPerDay < 3) {
        insights.push({
          category: 'nutrition',
          insight: 'You might be skipping meals',
          sentiment: 'neutral',
          confidenceScore: 0.7
        });
      }
    }
    
    return insights;
  }
  
  // Generates health coach messages
  generateCoachingMessages(userData: UserHealthData, behaviorData: BehaviorData): HealthCoachMessage[] {
    const messages: HealthCoachMessage[] = [];
    const now = new Date().toISOString();
    
    // Generate messages based on behavior insights
    const behaviorInsights = this.analyzeBehavior(behaviorData);
    
    behaviorInsights.forEach(insight => {
      if (insight.sentiment === 'negative') {
        messages.push({
          type: insight.category === 'medication' ? 'warning' : 'info',
          priority: insight.category === 'medication' ? 'high' : 'medium',
          title: `${insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Alert`,
          message: insight.insight,
          relatedMetric: insight.category,
          actionable: true,
          suggestedAction: this.generateSuggestedAction(insight.category, insight.insight),
          timestamp: now
        });
      } else if (insight.sentiment === 'positive' && insight.confidenceScore > 0.9) {
        messages.push({
          type: 'achievement',
          priority: 'low',
          title: `${insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Achievement`,
          message: insight.insight,
          relatedMetric: insight.category,
          actionable: false,
          timestamp: now
        });
      }
    });
    
    // Add messages based on health metrics
    if (userData.bloodPressure && (userData.bloodPressure.systolic > 140 || userData.bloodPressure.diastolic > 90)) {
      messages.push({
        type: 'warning',
        priority: 'high',
        title: 'Elevated Blood Pressure',
        message: `Your blood pressure (${userData.bloodPressure.systolic}/${userData.bloodPressure.diastolic}) is above the recommended range.`,
        relatedMetric: 'bloodPressure',
        actionable: true,
        suggestedAction: 'Schedule a check-up with your doctor to discuss your blood pressure.',
        timestamp: now
      });
    }
    
    if (userData.bloodGlucose && userData.bloodGlucose > 125) {
      messages.push({
        type: 'warning',
        priority: 'high',
        title: 'Elevated Blood Glucose',
        message: `Your blood glucose level (${userData.bloodGlucose} mg/dL) is above the recommended range.`,
        relatedMetric: 'bloodGlucose',
        actionable: true,
        suggestedAction: 'Consider consulting with your healthcare provider about your blood glucose levels.',
        timestamp: now
      });
    }
    
    // Add motivational message
    messages.push({
      type: 'motivation',
      priority: 'medium',
      title: 'Daily Health Reminder',
      message: 'Small daily improvements lead to significant long-term health benefits.',
      actionable: false,
      timestamp: now
    });
    
    return messages;
  }
  
  // Helper method to generate suggested actions
  private generateSuggestedAction(category: string, insight: string): string {
    switch (category) {
      case 'sleep':
        if (insight.includes('below recommended')) {
          return 'Try to establish a regular sleep schedule and aim for 7-9 hours per night.';
        } else if (insight.includes('quality is poor')) {
          return 'Consider improving your sleep environment and avoiding screens before bedtime.';
        }
        break;
      case 'exercise':
        if (insight.includes('more regular exercise')) {
          return 'Start with a 15-minute walk daily and gradually increase your activity.';
        }
        break;
      case 'medication':
        if (insight.includes('could be improved')) {
          return 'Set up daily reminders and keep your medications in a visible location.';
        }
        break;
      case 'nutrition':
        if (insight.includes('water intake')) {
          return 'Keep a water bottle with you and set reminders to drink throughout the day.';
        } else if (insight.includes('skipping meals')) {
          return 'Try to schedule regular meal times and prepare easy-to-grab healthy options.';
        }
        break;
      default:
        return 'Consult with your healthcare provider for personalized recommendations.';
    }
    
    return 'Consult with your healthcare provider for personalized recommendations.';
  }
}

// Export the health BERT model instance
export const healthBertModel = new HealthBertModel();

// Health calculations service
export const healthCalculations = {
  // Calculate BMI
  calculateBMI(height: number, weight: number): number {
    // Height in meters (convert from cm)
    const heightInMeters = height / 100;
    // BMI formula: weight (kg) / height^2 (m)
    return weight / (heightInMeters * heightInMeters);
  },
  
  // Get BMI category
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obesity class I';
    if (bmi < 40) return 'Obesity class II';
    return 'Obesity class III';
  },
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  calculateBMR(height: number, weight: number, age: number, gender: 'male' | 'female' | 'other'): number {
    // For male: BMR = 10W + 6.25H - 5A + 5
    // For female: BMR = 10W + 6.25H - 5A - 161
    // For other: Use average of male and female formulas
    
    const maleBMR = 10 * weight + 6.25 * height - 5 * age + 5;
    const femaleBMR = 10 * weight + 6.25 * height - 5 * age - 161;
    
    if (gender === 'male') return Math.round(maleBMR);
    if (gender === 'female') return Math.round(femaleBMR);
    
    // For 'other', use average of male and female formulas
    return Math.round((maleBMR + femaleBMR) / 2);
  },
  
  // Calculate heart rate zones
  calculateHeartRateZones(restingHeartRate: number, age: number): {
    zone: string;
    min: number;
    max: number;
    description: string;
  }[] {
    // Calculate max heart rate using 220 - age formula
    const maxHeartRate = 220 - age;
    // Calculate heart rate reserve (HRR)
    const hrr = maxHeartRate - restingHeartRate;
    
    // Create heart rate zones
    const zones = [
      {
        zone: 'Very Light',
        min: Math.round(restingHeartRate + 0.5 * hrr),
        max: Math.round(restingHeartRate + 0.6 * hrr),
        description: 'Warm up, cool down, recovery'
      },
      {
        zone: 'Light',
        min: Math.round(restingHeartRate + 0.6 * hrr),
        max: Math.round(restingHeartRate + 0.7 * hrr),
        description: 'Builds aerobic base and endurance'
      },
      {
        zone: 'Moderate',
        min: Math.round(restingHeartRate + 0.7 * hrr),
        max: Math.round(restingHeartRate + 0.8 * hrr),
        description: 'Improves aerobic capacity'
      },
      {
        zone: 'Hard',
        min: Math.round(restingHeartRate + 0.8 * hrr),
        max: Math.round(restingHeartRate + 0.9 * hrr),
        description: 'Increases maximum performance capacity'
      },
      {
        zone: 'Maximum',
        min: Math.round(restingHeartRate + 0.9 * hrr),
        max: maxHeartRate,
        description: 'Develops maximum performance and speed'
      }
    ];
    
    return zones;
  }
}; 