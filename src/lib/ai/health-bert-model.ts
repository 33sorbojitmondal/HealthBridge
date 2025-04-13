/**
 * HealthBERT Model Implementation
 * 
 * This module simulates an AI model for health predictions and analysis.
 * In a production environment, this would connect to a real ML model API or service.
 */

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
} from './health-ai';

class HealthBertModel {
  private static instance: HealthBertModel;

  private constructor() {
    // Initialize model
    console.log('HealthBERT model initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): HealthBertModel {
    if (!HealthBertModel.instance) {
      HealthBertModel.instance = new HealthBertModel();
    }
    return HealthBertModel.instance;
  }

  /**
   * Calculates BMI based on weight and height
   */
  public calculateBMI(weight: number, height: number, unit: 'metric' | 'imperial' = 'metric'): BMIResult {
    let bmi: number;
    
    if (unit === 'metric') {
      // Weight in kg, height in m
      bmi = weight / (height * height);
    } else {
      // Weight in lbs, height in inches
      bmi = (weight * 703) / (height * height);
    }
    
    bmi = parseFloat(bmi.toFixed(1));
    
    let category: BMIResult['category'];
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else if (bmi < 40) category = 'obese';
    else category = 'extremely obese';
    
    return { bmi, category };
  }

  /**
   * Calculates BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
   */
  public calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    let bmr: number;
    
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    return Math.round(bmr);
  }

  /**
   * Calculates heart rate zones based on maximum heart rate
   */
  public calculateHeartRateZones(age: number, restingHeartRate: number): HeartRateZones {
    // Calculate max heart rate using Tanaka formula: 208 - (0.7 * age)
    const maxHR = Math.round(208 - (0.7 * age));
    
    // Calculate heart rate reserve (HRR)
    const hrr = maxHR - restingHeartRate;
    
    // Calculate zones using Karvonen formula: ((MaxHR - RestingHR) * Intensity%) + RestingHR
    const calculateZone = (minPercent: number, maxPercent: number): { min: number; max: number } => {
      return {
        min: Math.round((hrr * minPercent) + restingHeartRate),
        max: Math.round((hrr * maxPercent) + restingHeartRate)
      };
    };
    
    return {
      resting: restingHeartRate,
      zone1: { ...calculateZone(0.5, 0.6), name: 'Very Light' },
      zone2: { ...calculateZone(0.6, 0.7), name: 'Light' },
      zone3: { ...calculateZone(0.7, 0.8), name: 'Moderate' },
      zone4: { ...calculateZone(0.8, 0.9), name: 'Hard' },
      zone5: { ...calculateZone(0.9, 1.0), name: 'Maximum' }
    };
  }

  /**
   * Predicts disease risk based on user health data and lifestyle
   */
  public async predictDiseaseRisk(
    userData: UserHealthData,
    lifestyleData: LifestyleData
  ): Promise<HealthPrediction[]> {
    // This would connect to a real ML model in production
    // For demo purposes, we'll return simulated predictions
    
    const predictions: HealthPrediction[] = [];
    
    // Check for cardiovascular disease risk
    if (userData.bloodPressure && userData.bloodPressure.length > 0) {
      const latestBP = userData.bloodPressure[userData.bloodPressure.length - 1];
      const systolic = latestBP.systolic;
      const diastolic = latestBP.diastolic;
      
      let cvdRisk: HealthPrediction['riskLevel'] = 'low';
      let cvdScore = 0;
      
      // Basic BP analysis
      if (systolic >= 140 || diastolic >= 90) {
        cvdRisk = 'high';
        cvdScore = 75;
      } else if (systolic >= 130 || diastolic >= 85) {
        cvdRisk = 'moderate';
        cvdScore = 50;
      } else {
        cvdScore = 25;
      }
      
      // Factor in smoking
      if (lifestyleData.smokingStatus === 'current') {
        cvdScore += 20;
        if (cvdScore > 75) cvdRisk = 'very high';
        else if (cvdScore > 50) cvdRisk = 'high';
      }
      
      // Factor in exercise
      if (lifestyleData.exerciseFrequency === 'sedentary') {
        cvdScore += 15;
      } else if (lifestyleData.exerciseFrequency === 'active' || 
                lifestyleData.exerciseFrequency === 'very active') {
        cvdScore -= 10;
      }
      
      // Cap the score
      cvdScore = Math.min(Math.max(cvdScore, 10), 95);
      
      predictions.push({
        condition: 'Cardiovascular Disease',
        riskLevel: cvdRisk,
        score: cvdScore,
        confidence: 0.85,
        factors: [
          {
            factor: 'Blood Pressure',
            impact: systolic >= 130 || diastolic >= 85 ? 'negative' : 'positive',
            strength: systolic >= 140 ? 0.8 : systolic >= 130 ? 0.6 : 0.3
          },
          {
            factor: 'Smoking Status',
            impact: lifestyleData.smokingStatus === 'never' ? 'positive' : 'negative',
            strength: lifestyleData.smokingStatus === 'current' ? 0.9 : 
                    lifestyleData.smokingStatus === 'former' ? 0.5 : 0.1
          },
          {
            factor: 'Physical Activity',
            impact: lifestyleData.exerciseFrequency === 'sedentary' ? 'negative' : 'positive',
            strength: lifestyleData.exerciseFrequency === 'very active' ? 0.8 : 
                    lifestyleData.exerciseFrequency === 'active' ? 0.7 : 
                    lifestyleData.exerciseFrequency === 'moderate' ? 0.5 : 
                    lifestyleData.exerciseFrequency === 'light' ? 0.3 : 0.7
          }
        ],
        recommendations: [
          'Maintain blood pressure below 120/80 mmHg',
          'Engage in at least 150 minutes of moderate exercise weekly',
          'Reduce sodium intake to less than 2,300mg per day',
          lifestyleData.smokingStatus === 'current' ? 'Consider smoking cessation programs' : ''
        ].filter(r => r !== ''),
        timeframe: '10-year risk assessment'
      });
    }
    
    // Check for diabetes risk
    if (userData.bloodGlucose && userData.bloodGlucose.length > 0) {
      const latestBG = userData.bloodGlucose[userData.bloodGlucose.length - 1];
      const glucoseValue = latestBG.value;
      const unit = latestBG.unit;
      
      // Convert to mg/dL if needed
      const normalizedGlucose = unit === 'mmol/L' ? glucoseValue * 18 : glucoseValue;
      
      let diabetesRisk: HealthPrediction['riskLevel'] = 'low';
      let diabetesScore = 0;
      
      // Basic glucose analysis (fasting)
      if (normalizedGlucose >= 126) {
        diabetesRisk = 'very high';
        diabetesScore = 85;
      } else if (normalizedGlucose >= 100) {
        diabetesRisk = 'high';
        diabetesScore = 65;
      } else if (normalizedGlucose >= 90) {
        diabetesRisk = 'moderate';
        diabetesScore = 40;
      } else {
        diabetesScore = 20;
      }
      
      // Factor in diet
      if (lifestyleData.diet.sugarIntake === 'high') {
        diabetesScore += 15;
      } else if (lifestyleData.diet.sugarIntake === 'low') {
        diabetesScore -= 10;
      }
      
      // Factor in activity
      if (lifestyleData.exerciseFrequency === 'sedentary') {
        diabetesScore += 15;
      } else if (lifestyleData.exerciseFrequency === 'active' || 
                lifestyleData.exerciseFrequency === 'very active') {
        diabetesScore -= 10;
      }
      
      // Cap the score
      diabetesScore = Math.min(Math.max(diabetesScore, 10), 95);
      
      // Adjust risk level based on final score
      if (diabetesScore >= 75) diabetesRisk = 'very high';
      else if (diabetesScore >= 60) diabetesRisk = 'high';
      else if (diabetesScore >= 40) diabetesRisk = 'moderate';
      else diabetesRisk = 'low';
      
      predictions.push({
        condition: 'Type 2 Diabetes',
        riskLevel: diabetesRisk,
        score: diabetesScore,
        confidence: 0.82,
        factors: [
          {
            factor: 'Blood Glucose',
            impact: normalizedGlucose >= 100 ? 'negative' : 'positive',
            strength: normalizedGlucose >= 126 ? 0.9 : normalizedGlucose >= 100 ? 0.7 : 0.3
          },
          {
            factor: 'Diet - Sugar Intake',
            impact: lifestyleData.diet.sugarIntake === 'high' ? 'negative' : 'positive',
            strength: lifestyleData.diet.sugarIntake === 'high' ? 0.8 : 
                    lifestyleData.diet.sugarIntake === 'medium' ? 0.5 : 0.2
          },
          {
            factor: 'Physical Activity',
            impact: lifestyleData.exerciseFrequency === 'sedentary' ? 'negative' : 'positive',
            strength: lifestyleData.exerciseFrequency === 'sedentary' ? 0.8 : 
                    lifestyleData.exerciseFrequency === 'light' ? 0.5 : 0.3
          }
        ],
        recommendations: [
          'Maintain fasting blood glucose below 100 mg/dL',
          'Reduce intake of refined sugars and simple carbohydrates',
          'Aim for at least 30 minutes of physical activity most days',
          'Consider regular A1C testing'
        ],
        timeframe: '5-year risk assessment'
      });
    }
    
    return predictions;
  }

  /**
   * Analyzes user behavior patterns to provide insights
   */
  public async analyzeBehavior(behaviorData: BehaviorData): Promise<BehaviorInsight[]> {
    const insights: BehaviorInsight[] = [];
    
    // Sleep analysis
    const sleepScore = (
      behaviorData.sleep.averageDuration * 0.4 + 
      (1 - behaviorData.sleep.variability) * 0.3 + 
      behaviorData.sleep.bedtimeConsistency * 0.15 + 
      behaviorData.sleep.wakeTimeConsistency * 0.15
    ) * 100;
    
    let sleepSentiment: BehaviorInsight['sentiment'] = 'neutral';
    if (sleepScore >= 75) sleepSentiment = 'positive';
    else if (sleepScore < 50) sleepSentiment = 'negative';
    
    insights.push({
      category: 'Sleep',
      score: Math.round(sleepScore),
      sentiment: sleepSentiment,
      observations: [
        behaviorData.sleep.averageDuration < 7 ? 'You are consistently sleeping less than the recommended 7-9 hours' : 
        behaviorData.sleep.averageDuration > 9 ? 'You are consistently sleeping more than 9 hours, which may indicate other health issues' : 
        'Your sleep duration is within the recommended range',
        
        behaviorData.sleep.variability > 0.3 ? 'Your sleep schedule varies significantly from day to day' : 
        'Your sleep duration is relatively consistent',
        
        behaviorData.sleep.bedtimeConsistency < 0.6 ? 'Your bedtime varies significantly' : 
        'You maintain a consistent bedtime routine'
      ],
      suggestions: [
        behaviorData.sleep.averageDuration < 7 ? 'Try to increase your sleep duration to at least 7 hours' : '',
        behaviorData.sleep.variability > 0.3 ? 'Try to maintain a more consistent sleep schedule, even on weekends' : '',
        behaviorData.sleep.bedtimeConsistency < 0.6 ? 'Establish a regular bedtime routine to improve sleep quality' : '',
        'Consider avoiding screens for at least 30 minutes before bedtime'
      ].filter(s => s !== '')
    });
    
    // Exercise analysis
    const exerciseScore = (
      behaviorData.exercise.frequency * 0.3 + 
      behaviorData.exercise.duration * 0.25 + 
      behaviorData.exercise.intensity * 0.25 + 
      behaviorData.exercise.consistency * 0.2
    ) * 100;
    
    let exerciseSentiment: BehaviorInsight['sentiment'] = 'neutral';
    if (exerciseScore >= 75) exerciseSentiment = 'positive';
    else if (exerciseScore < 50) exerciseSentiment = 'negative';
    
    insights.push({
      category: 'Physical Activity',
      score: Math.round(exerciseScore),
      sentiment: exerciseSentiment,
      observations: [
        behaviorData.exercise.frequency < 0.5 ? 'You are exercising less frequently than recommended' : 
        'Your exercise frequency is good',
        
        behaviorData.exercise.intensity < 0.4 ? 'Your exercise intensity is generally low' : 
        behaviorData.exercise.intensity > 0.8 ? 'You maintain high-intensity workouts' : 
        'You maintain a moderate exercise intensity',
        
        behaviorData.exercise.consistency < 0.6 ? 'Your exercise routine lacks consistency' : 
        'You maintain a consistent exercise routine'
      ],
      suggestions: [
        behaviorData.exercise.frequency < 0.5 ? 'Aim for at least 150 minutes of moderate activity per week' : '',
        behaviorData.exercise.intensity < 0.4 ? 'Try to incorporate some higher intensity activities' : '',
        behaviorData.exercise.consistency < 0.6 ? 'Schedule regular exercise sessions to build consistency' : '',
        'Consider mixing cardio, strength training, and flexibility exercises'
      ].filter(s => s !== '')
    });
    
    // Medication adherence analysis
    if (behaviorData.medication) {
      const medicationScore = (
        behaviorData.medication.adherence * 0.7 + 
        behaviorData.medication.timeliness * 0.3
      ) * 100;
      
      let medicationSentiment: BehaviorInsight['sentiment'] = 'neutral';
      if (medicationScore >= 80) medicationSentiment = 'positive';
      else if (medicationScore < 60) medicationSentiment = 'negative';
      
      insights.push({
        category: 'Medication Adherence',
        score: Math.round(medicationScore),
        sentiment: medicationSentiment,
        observations: [
          behaviorData.medication.adherence < 0.8 ? 'You sometimes miss taking your medications' : 
          'You consistently take your medications',
          
          behaviorData.medication.timeliness < 0.7 ? 'You often take medications at inconsistent times' : 
          'You generally take medications at the appropriate times'
        ],
        suggestions: [
          behaviorData.medication.adherence < 0.8 ? 'Set reminders to help remember to take medications' : '',
          behaviorData.medication.timeliness < 0.7 ? 'Try to take medications at the same time each day' : '',
          medicationScore < 80 ? 'Consider using a pill organizer to keep track of medications' : '',
          'Discuss any side effects or concerns with your healthcare provider'
        ].filter(s => s !== '')
      });
    }
    
    return insights;
  }

  /**
   * Generates personalized coaching messages based on user data and behavior
   */
  public async generateCoachingMessages(
    userData: UserHealthData,
    behaviorData: BehaviorData
  ): Promise<HealthCoachMessage[]> {
    const messages: HealthCoachMessage[] = [];
    
    // Sleep coaching
    if (behaviorData.sleep.averageDuration < 7) {
      messages.push({
        type: 'education',
        priority: 'medium',
        title: 'Improve Your Sleep',
        message: 'Getting 7-9 hours of sleep is crucial for your overall health. Your recent average is below the recommended amount.',
        relatedMetric: 'sleep',
        suggestedAction: {
          text: 'Learn sleep improvement techniques',
          actionType: 'read',
          deepLink: '/resources/sleep-hygiene'
        },
        dismissible: true
      });
    }
    
    // Physical activity coaching
    if (behaviorData.exercise.frequency < 0.4) {
      messages.push({
        type: 'encouragement',
        priority: 'high',
        title: 'Boost Your Activity',
        message: 'Regular physical activity reduces heart disease risk by up to 35%. Even small increases in movement can make a big difference.',
        relatedMetric: 'activity',
        suggestedAction: {
          text: 'Find activities you enjoy',
          actionType: 'read',
          deepLink: '/resources/activity-finder'
        },
        dismissible: true
      });
    }
    
    // Heart rate check reminder
    const lastHeartRateCheck = userData.heartRate ? 
      new Date(userData.heartRate[userData.heartRate.length - 1].timestamp) : 
      new Date(0);
    
    const daysSinceLastHRCheck = Math.floor((Date.now() - lastHeartRateCheck.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastHRCheck > 7) {
      messages.push({
        type: 'reminder',
        priority: 'low',
        title: 'Check Your Heart Rate',
        message: 'It\'s been over a week since your last heart rate measurement. Regular monitoring helps track your cardiovascular health.',
        relatedMetric: 'heartRate',
        suggestedAction: {
          text: 'Log heart rate',
          actionType: 'log',
          deepLink: '/tracking/heart-rate'
        },
        dismissible: true
      });
    }
    
    // Medication reminder
    if (behaviorData.medication && behaviorData.medication.adherence < 0.8) {
      messages.push({
        type: 'alert',
        priority: 'high',
        title: 'Medication Reminder',
        message: 'Taking your medications consistently is crucial for managing your health conditions effectively.',
        suggestedAction: {
          text: 'Set up medication reminders',
          actionType: 'schedule',
          deepLink: '/medication/reminders'
        },
        dismissible: false
      });
    }
    
    // Add personalized message based on overall health profile
    let personalizedMessage: HealthCoachMessage | null = null;
    
    // For someone who is doing well overall
    const goodSleepAndExercise = behaviorData.sleep.averageDuration >= 7 && behaviorData.exercise.frequency >= 0.6;
    if (goodSleepAndExercise) {
      personalizedMessage = {
        type: 'encouragement',
        priority: 'medium',
        title: 'Keep Up the Good Work!',
        message: 'You\'re making excellent progress with your sleep and exercise habits. This significantly reduces your risk of chronic conditions.',
        suggestedAction: {
          text: 'View your health trends',
          actionType: 'read',
          deepLink: '/health-tracking/trends'
        },
        dismissible: true
      };
    }
    
    // For someone who needs more targeted support
    if (personalizedMessage) {
      messages.push(personalizedMessage);
    }
    
    return messages;
  }

  /**
   * Gets current health trends based on news and local data
   */
  public async getHealthTrends(region: string): Promise<HealthTrend[]> {
    // This would connect to a real data source in production
    // For demo purposes, we'll return simulated trends
    
    // Get current month for seasonality
    const currentMonth = new Date().getMonth();
    const isFluSeason = currentMonth >= 9 || currentMonth <= 2; // Oct-Mar
    const isAllergySeason = currentMonth >= 3 && currentMonth <= 5; // Apr-Jun
    
    const trends: HealthTrend[] = [];
    
    // Seasonal trends
    if (isFluSeason) {
      trends.push({
        trend: 'Seasonal Influenza',
        region: region,
        riskLevel: 'high',
        description: 'Flu cases are increasing in your area. The dominant strain this season appears to be H3N2, which typically causes more severe illness.',
        sources: ['CDC Weekly Influenza Report', 'Local Health Department Data'],
        lastUpdated: new Date().toISOString()
      });
    }
    
    if (isAllergySeason) {
      trends.push({
        trend: 'Pollen Allergies',
        region: region,
        riskLevel: 'moderate',
        description: 'Tree pollen counts are elevated in your region. Those with seasonal allergies may experience increased symptoms.',
        sources: ['National Allergy Bureau', 'Weather Services'],
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Add some general health trends
    trends.push({
      trend: 'COVID-19 Variants',
      region: 'Global',
      riskLevel: 'moderate',
      description: 'New COVID variants continue to emerge. The latest variants appear to be more transmissible but generally cause less severe disease in vaccinated individuals.',
      sources: ['WHO Updates', 'Medical Research Journals'],
      lastUpdated: new Date().toISOString()
    });
    
    trends.push({
      trend: 'Mental Health Awareness',
      region: 'Global',
      riskLevel: 'moderate',
      description: 'Increased recognition of mental health impacts from chronic stress and isolation. New resources are becoming available for support and treatment.',
      sources: ['Mental Health America', 'Research Publications'],
      lastUpdated: new Date().toISOString()
    });
    
    return trends;
  }
}

// Export singleton instance
export const healthBertModel = HealthBertModel.getInstance(); 