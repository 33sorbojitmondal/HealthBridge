// health-insights.ts - AI-powered health predictions and personalized insights

import { HealthMetrics } from './health-calculations';

/**
 * Local health trend data type
 */
export interface LocalHealthTrend {
  disease: string;
  prevalence: number; // 0-100 scale
  trend: 'increasing' | 'decreasing' | 'stable';
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  seasonalFactor: number; // 0-1 scale
}

/**
 * News article with health relevance
 */
export interface HealthNewsArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  relevanceScore: number; // 0-1 scale
  summary: string;
  diseases: string[];
  regions: string[];
}

/**
 * User lifestyle information
 */
export interface UserLifestyle {
  diet: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'pescatarian' | 'unknown';
  exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  sleepAverage: number; // hours
  stressLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'non_smoker' | 'former_smoker' | 'light_smoker' | 'heavy_smoker';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  workEnvironment: 'office' | 'physical' | 'remote' | 'mixed' | 'unknown';
}

/**
 * Disease risk prediction
 */
export interface DiseaseRiskPrediction {
  disease: string;
  probabilityScore: number; // 0-100
  factorsIncreasing: string[];
  factorsDecreasing: string[];
  lifestyleSuggestions: string[];
  localTrendImpact: number; // -10 to +10 scale
  confidence: number; // 0-1 scale
}

/**
 * Mock function to get recent health-related news
 * In a real implementation, this would use an API to fetch news data
 * 
 * @param region Geographic region (country or city)
 * @param relevanceThreshold Minimum relevance score (0-1)
 * @returns Array of health news articles
 */
export async function getHealthNews(
  region: string,
  relevanceThreshold: number = 0.7
): Promise<HealthNewsArticle[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock news data
  const allNews: HealthNewsArticle[] = [
    {
      id: 'news1',
      title: 'Flu Season Expected to Peak Early This Year',
      source: 'Health Daily',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/flu-season-peak',
      relevanceScore: 0.9,
      summary: 'Health experts warn that the influenza season may peak earlier than usual, urging people to get vaccinated promptly.',
      diseases: ['influenza', 'respiratory infections'],
      regions: ['United States', 'Canada', 'North America']
    },
    {
      id: 'news2',
      title: 'New Study Links Air Pollution to Increased Stroke Risk',
      source: 'Medical Research Journal',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/pollution-stroke-risk',
      relevanceScore: 0.85,
      summary: 'Researchers found that exposure to high levels of air pollution can increase the risk of stroke by up to 34%.',
      diseases: ['stroke', 'cardiovascular disease'],
      regions: ['Global', 'Urban areas']
    },
    {
      id: 'news3',
      title: 'Local Hospital Reports Rise in Gastroenteritis Cases',
      source: 'City Health News',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/gastroenteritis-rise',
      relevanceScore: 0.8,
      summary: 'Local hospitals have seen a 40% increase in gastroenteritis cases over the past two weeks, likely due to a seasonal virus.',
      diseases: ['gastroenteritis', 'norovirus'],
      regions: ['New York', 'Boston', 'Eastern United States']
    },
    {
      id: 'news4',
      title: 'Pollen Counts Expected to Reach Record Highs',
      source: 'Allergy Network',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/pollen-record-high',
      relevanceScore: 0.75,
      summary: 'Allergy sufferers should prepare for an intense season as pollen counts are predicted to reach record levels this spring.',
      diseases: ['allergies', 'asthma', 'respiratory conditions'],
      regions: ['Southern United States', 'Midwest', 'United States']
    },
    {
      id: 'news5',
      title: 'Vitamin D Deficiency More Common in Winter Months',
      source: 'Nutrition Today',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/vitamin-d-winter',
      relevanceScore: 0.7,
      summary: 'Experts remind people to consider vitamin D supplements during winter months when sun exposure is limited.',
      diseases: ['vitamin deficiency', 'osteoporosis', 'seasonal affective disorder'],
      regions: ['Northern Hemisphere', 'Canada', 'Northern Europe']
    },
    {
      id: 'news6',
      title: 'Mental Health Resources Expanded in Response to Holiday Stress',
      source: 'Psychology Weekly',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: 'https://example.com/mental-health-holidays',
      relevanceScore: 0.65,
      summary: 'Local mental health services are expanding capacity to handle increased demand during the stressful holiday season.',
      diseases: ['anxiety', 'depression', 'stress disorders'],
      regions: ['United States', 'Canada', 'Global']
    }
  ];
  
  // Filter by region and relevance
  return allNews.filter(article => 
    article.relevanceScore >= relevanceThreshold && 
    (article.regions.includes(region) || article.regions.includes('Global'))
  );
}

/**
 * Mock function to get local health trends
 * In a real implementation, this would use an API to fetch data from health departments
 * 
 * @param location User's location (city, region, or country)
 * @returns Array of local health trends
 */
export async function getLocalHealthTrends(location: string): Promise<LocalHealthTrend[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Get current month to simulate seasonal diseases
  const currentMonth = new Date().getMonth(); // 0-11
  const isFluSeason = currentMonth >= 9 || currentMonth <= 2; // Oct-Mar
  const isAllergySeason = currentMonth >= 3 && currentMonth <= 5; // Apr-Jun
  
  // Mock trends data (would be fetched from health department APIs in production)
  const trends: LocalHealthTrend[] = [
    {
      disease: 'Influenza',
      prevalence: isFluSeason ? 65 : 15,
      trend: isFluSeason ? 'increasing' : 'decreasing',
      riskLevel: isFluSeason ? 'high' : 'low',
      seasonalFactor: isFluSeason ? 0.9 : 0.2
    },
    {
      disease: 'Common Cold',
      prevalence: 40,
      trend: 'stable',
      riskLevel: 'moderate',
      seasonalFactor: 0.7
    },
    {
      disease: 'COVID-19',
      prevalence: 30,
      trend: 'decreasing',
      riskLevel: 'moderate',
      seasonalFactor: 0.5
    },
    {
      disease: 'Seasonal Allergies',
      prevalence: isAllergySeason ? 70 : 20,
      trend: isAllergySeason ? 'increasing' : 'decreasing',
      riskLevel: isAllergySeason ? 'high' : 'low',
      seasonalFactor: isAllergySeason ? 0.95 : 0.3
    },
    {
      disease: 'Gastroenteritis',
      prevalence: 25,
      trend: 'increasing',
      riskLevel: 'moderate',
      seasonalFactor: 0.6
    }
  ];
  
  return trends;
}

/**
 * Function to generate AI-powered disease risk predictions based on user health metrics,
 * local trends, and lifestyle factors
 * 
 * @param metrics User's health metrics
 * @param lifestyle User's lifestyle information
 * @param location User's location for local trends
 * @returns Array of disease risk predictions
 */
export async function predictDiseaseRisks(
  metrics: HealthMetrics,
  lifestyle: UserLifestyle,
  location: string
): Promise<DiseaseRiskPrediction[]> {
  // Get local health trends
  const localTrends = await getLocalHealthTrends(location);
  
  // Calculate base risk factors from user metrics
  const isOverweight = metrics.weight / (metrics.height * metrics.height) >= 25;
  const isHypertensive = metrics.systolicBP >= 130 || metrics.diastolicBP >= 80;
  const hasHighCholesterol = metrics.cholesterolTotal > 200;
  const isInactive = metrics.physicalActivityMinutesPerWeek < 150;
  const hasDiabetesRisk = metrics.hasDiabetes || (isOverweight && isInactive);
  
  // Mock AI analysis - in production, this would use a trained ML model
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const predictions: DiseaseRiskPrediction[] = [];
  
  // Cardiovascular disease prediction
  const cvdRisk: DiseaseRiskPrediction = {
    disease: 'Cardiovascular Disease',
    probabilityScore: 0,
    factorsIncreasing: [],
    factorsDecreasing: [],
    lifestyleSuggestions: [],
    localTrendImpact: 0,
    confidence: 0.85
  };
  
  // Calculate CVD risk factors
  if (metrics.age > 50) cvdRisk.factorsIncreasing.push('Age over 50');
  if (isOverweight) cvdRisk.factorsIncreasing.push('Overweight/Obesity');
  if (isHypertensive) cvdRisk.factorsIncreasing.push('Hypertension');
  if (hasHighCholesterol) cvdRisk.factorsIncreasing.push('High cholesterol');
  if (metrics.isSmoker) cvdRisk.factorsIncreasing.push('Smoking');
  if (isInactive) cvdRisk.factorsIncreasing.push('Insufficient physical activity');
  if (metrics.alcoholDrinksPerWeek > 14) cvdRisk.factorsIncreasing.push('High alcohol consumption');
  if (metrics.hasFamilyHistoryOfHeartDisease) cvdRisk.factorsIncreasing.push('Family history of heart disease');
  
  if (lifestyle.exerciseFrequency === 'active' || lifestyle.exerciseFrequency === 'very_active') {
    cvdRisk.factorsDecreasing.push('Regular exercise');
  }
  if (metrics.veggieServingsPerDay >= 5) cvdRisk.factorsDecreasing.push('High vegetable intake');
  if (metrics.cholesterolHDL > 60) cvdRisk.factorsDecreasing.push('High HDL cholesterol');
  if (lifestyle.diet === 'vegetarian' || lifestyle.diet === 'vegan') {
    cvdRisk.factorsDecreasing.push('Plant-based diet');
  }
  
  // Calculate overall probability score based on risk factors
  cvdRisk.probabilityScore = 10; // Base risk
  cvdRisk.probabilityScore += cvdRisk.factorsIncreasing.length * 8;
  cvdRisk.probabilityScore -= cvdRisk.factorsDecreasing.length * 5;
  cvdRisk.probabilityScore = Math.max(5, Math.min(95, cvdRisk.probabilityScore));
  
  // Add lifestyle suggestions
  if (isHypertensive) {
    cvdRisk.lifestyleSuggestions.push('Consider the DASH diet to help lower blood pressure');
    cvdRisk.lifestyleSuggestions.push('Reduce sodium intake to less than 2,300mg per day');
  }
  if (hasHighCholesterol) {
    cvdRisk.lifestyleSuggestions.push('Increase soluble fiber intake through foods like oats and beans');
    cvdRisk.lifestyleSuggestions.push('Replace saturated fats with unsaturated fats like olive oil');
  }
  if (isInactive) {
    cvdRisk.lifestyleSuggestions.push('Aim for at least 150 minutes of moderate exercise per week');
    cvdRisk.lifestyleSuggestions.push('Add strength training exercises at least twice a week');
  }
  if (metrics.isSmoker) {
    cvdRisk.lifestyleSuggestions.push('Quitting smoking can rapidly reduce cardiovascular risk');
    cvdRisk.lifestyleSuggestions.push('Consider nicotine replacement therapy or medication to help quit');
  }
  
  predictions.push(cvdRisk);
  
  // Type 2 Diabetes prediction
  const diabetesRisk: DiseaseRiskPrediction = {
    disease: 'Type 2 Diabetes',
    probabilityScore: 0,
    factorsIncreasing: [],
    factorsDecreasing: [],
    lifestyleSuggestions: [],
    localTrendImpact: 0,
    confidence: 0.82
  };
  
  // Calculate diabetes risk factors
  if (metrics.age > 45) diabetesRisk.factorsIncreasing.push('Age over 45');
  if (isOverweight) diabetesRisk.factorsIncreasing.push('Overweight/Obesity');
  if (isInactive) diabetesRisk.factorsIncreasing.push('Insufficient physical activity');
  if (metrics.hasDiabetes) diabetesRisk.factorsIncreasing.push('Pre-existing diabetes condition');
  if (isHypertensive) diabetesRisk.factorsIncreasing.push('Hypertension');
  
  if (lifestyle.exerciseFrequency === 'active' || lifestyle.exerciseFrequency === 'very_active') {
    diabetesRisk.factorsDecreasing.push('Regular exercise');
  }
  if (lifestyle.diet === 'vegetarian' || lifestyle.diet === 'vegan') {
    diabetesRisk.factorsDecreasing.push('Plant-based diet');
  }
  if (metrics.veggieServingsPerDay >= 5) diabetesRisk.factorsDecreasing.push('High vegetable intake');
  
  // Calculate overall probability score based on risk factors
  diabetesRisk.probabilityScore = 8; // Base risk
  diabetesRisk.probabilityScore += diabetesRisk.factorsIncreasing.length * 9;
  diabetesRisk.probabilityScore -= diabetesRisk.factorsDecreasing.length * 5;
  diabetesRisk.probabilityScore = Math.max(5, Math.min(95, diabetesRisk.probabilityScore));
  
  // Add lifestyle suggestions
  if (isOverweight) {
    diabetesRisk.lifestyleSuggestions.push('Aim for gradual weight loss of 7-10% of current weight');
    diabetesRisk.lifestyleSuggestions.push('Focus on portion control and mindful eating');
  }
  if (isInactive) {
    diabetesRisk.lifestyleSuggestions.push('Include both aerobic exercise and resistance training');
    diabetesRisk.lifestyleSuggestions.push('Even short walks after meals can help regulate blood sugar');
  }
  diabetesRisk.lifestyleSuggestions.push('Limit refined carbohydrates and added sugars');
  diabetesRisk.lifestyleSuggestions.push('Include foods with a low glycemic index in your diet');
  
  predictions.push(diabetesRisk);
  
  // Respiratory illness prediction based on season and local trends
  const fluTrend = localTrends.find(trend => trend.disease === 'Influenza');
  const covidTrend = localTrends.find(trend => trend.disease === 'COVID-19');
  
  if (fluTrend && fluTrend.prevalence > 30) {
    const fluRisk: DiseaseRiskPrediction = {
      disease: 'Influenza',
      probabilityScore: Math.min(90, fluTrend.prevalence + 10),
      factorsIncreasing: ['Current flu season', 'Local outbreak reported'],
      factorsDecreasing: [],
      lifestyleSuggestions: [
        'Consider getting a flu vaccination',
        'Practice frequent hand washing',
        'Avoid close contact with people who are sick',
        'Boost immune system with adequate sleep and nutrition'
      ],
      localTrendImpact: fluTrend.prevalence / 10,
      confidence: 0.75
    };
    
    if (metrics.age > 65) {
      fluRisk.factorsIncreasing.push('Age over 65');
      fluRisk.probabilityScore += 5;
    }
    
    if (lifestyle.stressLevel === 'high') {
      fluRisk.factorsIncreasing.push('High stress levels may impact immune function');
      fluRisk.probabilityScore += 3;
    }
    
    if (lifestyle.sleepAverage < 7) {
      fluRisk.factorsIncreasing.push('Insufficient sleep may weaken immune response');
      fluRisk.probabilityScore += 4;
    }
    
    predictions.push(fluRisk);
  }
  
  if (covidTrend && covidTrend.prevalence > 20) {
    const covidRisk: DiseaseRiskPrediction = {
      disease: 'COVID-19',
      probabilityScore: Math.min(85, covidTrend.prevalence + 5),
      factorsIncreasing: ['Local COVID-19 transmission reported'],
      factorsDecreasing: [],
      lifestyleSuggestions: [
        'Stay up to date with COVID-19 vaccinations',
        'Consider masking in crowded indoor spaces',
        'Maintain good ventilation in indoor settings',
        'Monitor for symptoms and test if exposed'
      ],
      localTrendImpact: covidTrend.prevalence / 10,
      confidence: 0.78
    };
    
    if (metrics.age > 65) {
      covidRisk.factorsIncreasing.push('Age over 65');
      covidRisk.probabilityScore += 7;
    }
    
    if (metrics.hasDiabetes) {
      covidRisk.factorsIncreasing.push('Pre-existing diabetes');
      covidRisk.probabilityScore += 5;
    }
    
    predictions.push(covidRisk);
  }
  
  // Add allergy prediction if in season
  const allergySeason = localTrends.find(trend => trend.disease === 'Seasonal Allergies');
  if (allergySeason && allergySeason.prevalence > 40) {
    const allergyRisk: DiseaseRiskPrediction = {
      disease: 'Seasonal Allergies',
      probabilityScore: allergySeason.prevalence,
      factorsIncreasing: ['High pollen season currently active'],
      factorsDecreasing: [],
      lifestyleSuggestions: [
        'Monitor local pollen counts and plan outdoor activities accordingly',
        'Keep windows closed during high pollen days',
        'Shower and change clothes after being outdoors',
        'Consider over-the-counter antihistamines if symptoms develop'
      ],
      localTrendImpact: allergySeason.prevalence / 10,
      confidence: 0.7
    };
    
    predictions.push(allergyRisk);
  }
  
  return predictions;
}

/**
 * Health coach message type
 */
export interface HealthCoachMessage {
  id: string;
  type: 'tip' | 'alert' | 'encouragement' | 'reminder' | 'achievement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: 'diet' | 'exercise' | 'medication' | 'mental' | 'sleep' | 'general';
  actionable: boolean;
  action?: {
    label: string;
    url: string;
  };
}

/**
 * Generate personalized health coach messages based on user data and behavior
 * 
 * @param metrics User's health metrics
 * @param lifestyle User's lifestyle information
 * @param userBehavior Information about user's app usage and compliance
 * @returns Array of health coach messages
 */
export async function generateHealthCoachMessages(
  metrics: HealthMetrics,
  lifestyle: UserLifestyle,
  userBehavior: {
    medicationAdherence: number; // 0-1 scale
    exerciseGoalCompletion: number; // 0-1 scale
    waterIntakeGoalCompletion: number; // 0-1 scale
    sleepGoalCompletion: number; // 0-1 scale
    lastLoginDays: number; // days since last login
    completedHealthChecks: number; // count of completed health assessments
  }
): Promise<HealthCoachMessage[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const messages: HealthCoachMessage[] = [];
  
  // Medication adherence messages
  if (userBehavior.medicationAdherence < 0.7) {
    messages.push({
      id: `med-${Date.now()}`,
      type: 'reminder',
      title: 'Medication Reminder',
      message: "I noticed you've missed some of your medications recently. Taking them consistently is important for their effectiveness.",
      priority: 'high',
      category: 'medication',
      actionable: true,
      action: {
        label: 'View Medication Schedule',
        url: '/medication-schedule'
      }
    });
  } else if (userBehavior.medicationAdherence > 0.9) {
    messages.push({
      id: `med-${Date.now()}`,
      type: 'achievement',
      title: 'Great Medication Consistency!',
      message: "You've been excellent with taking your medications on schedule. This consistency helps maximize their benefits.",
      priority: 'low',
      category: 'medication',
      actionable: false
    });
  }
  
  // Exercise messages
  if (userBehavior.exerciseGoalCompletion < 0.5) {
    messages.push({
      id: `exercise-${Date.now()}`,
      type: 'tip',
      title: 'Exercise Motivation',
      message: 'Regular physical activity can significantly improve your health outcomes. Even short walks count!',
      priority: 'medium',
      category: 'exercise',
      actionable: true,
      action: {
        label: 'Quick Exercise Ideas',
        url: '/exercise-suggestions'
      }
    });
  } else if (userBehavior.exerciseGoalCompletion > 0.8) {
    messages.push({
      id: `exercise-${Date.now()}`,
      type: 'achievement',
      title: 'Exercise Goal Champion!',
      message: "You've been consistently meeting your exercise goals. Your cardiovascular health thanks you!",
      priority: 'low',
      category: 'exercise',
      actionable: false
    });
  }
  
  // Sleep messages
  if (lifestyle.sleepAverage < 6) {
    messages.push({
      id: `sleep-${Date.now()}`,
      type: 'alert',
      title: 'Sleep Pattern Alert',
      message: "Your sleep data shows you're averaging less than 6 hours per night. This can impact your health and immune function.",
      priority: 'high',
      category: 'sleep',
      actionable: true,
      action: {
        label: 'Sleep Improvement Tips',
        url: '/sleep-tips'
      }
    });
  }
  
  // Water intake
  if (userBehavior.waterIntakeGoalCompletion < 0.6) {
    messages.push({
      id: `water-${Date.now()}`,
      type: 'reminder',
      title: 'Hydration Reminder',
      message: "Staying well-hydrated supports your metabolism, circulation, and overall health. Try setting hydration reminders.",
      priority: 'medium',
      category: 'general',
      actionable: true,
      action: {
        label: 'Set Hydration Reminders',
        url: '/hydration-settings'
      }
    });
  }
  
  // User engagement
  if (userBehavior.lastLoginDays > 7) {
    messages.push({
      id: `login-${Date.now()}`,
      type: 'encouragement',
      title: 'Welcome Back!',
      message: "It's been a while since your last visit. Regular health monitoring helps catch trends early.",
      priority: 'medium',
      category: 'general',
      actionable: false
    });
  }
  
  // Health check encouragement
  if (userBehavior.completedHealthChecks === 0) {
    messages.push({
      id: `health-check-${Date.now()}`,
      type: 'tip',
      title: 'Complete Your Health Profile',
      message: 'Take a few minutes to complete your health assessment so I can provide more personalized recommendations.',
      priority: 'high',
      category: 'general',
      actionable: true,
      action: {
        label: 'Start Health Assessment',
        url: '/health-assessment'
      }
    });
  }
  
  // BMI-specific message
  const bmi = metrics.weight / (metrics.height * metrics.height);
  if (bmi > 30) {
    messages.push({
      id: `bmi-${Date.now()}`,
      type: 'tip',
      title: 'Weight Management Focus',
      message: 'Your BMI indicates that focusing on weight management could significantly benefit your overall health.',
      priority: 'medium',
      category: 'diet',
      actionable: true,
      action: {
        label: 'Healthy Weight Resources',
        url: '/weight-management'
      }
    });
  }
  
  // Smoking message
  if (metrics.isSmoker) {
    messages.push({
      id: `smoking-${Date.now()}`,
      type: 'tip',
      title: 'Smoking Cessation Benefits',
      message: "Quitting smoking can rapidly improve your lung function and reduce your risk of heart disease and cancer.",
      priority: 'high',
      category: 'general',
      actionable: true,
      action: {
        label: 'Smoking Cessation Resources',
        url: '/quit-smoking'
      }
    });
  }
  
  // Stress management
  if (lifestyle.stressLevel === 'high') {
    messages.push({
      id: `stress-${Date.now()}`,
      type: 'tip',
      title: 'Stress Management',
      message: 'High stress levels can impact your physical health. Consider incorporating mindfulness or relaxation techniques.',
      priority: 'medium',
      category: 'mental',
      actionable: true,
      action: {
        label: 'Stress Reduction Techniques',
        url: '/stress-management'
      }
    });
  }
  
  // Diet suggestions based on health metrics
  if (metrics.cholesterolTotal > 200) {
    messages.push({
      id: `diet-chol-${Date.now()}`,
      type: 'tip',
      title: 'Heart-Healthy Diet',
      message: 'Consider focusing on foods that can help manage cholesterol, like oats, beans, fatty fish, and nuts.',
      priority: 'medium',
      category: 'diet',
      actionable: true,
      action: {
        label: 'Heart-Healthy Recipes',
        url: '/heart-healthy-diet'
      }
    });
  }
  
  // Blood pressure management
  if (metrics.systolicBP > 130 || metrics.diastolicBP > 80) {
    messages.push({
      id: `bp-${Date.now()}`,
      type: 'tip',
      title: 'Blood Pressure Management',
      message: 'Your blood pressure readings suggest focusing on the DASH diet approach and sodium reduction could be beneficial.',
      priority: 'high',
      category: 'diet',
      actionable: true,
      action: {
        label: 'DASH Diet Information',
        url: '/dash-diet'
      }
    });
  }
  
  return messages;
}

/**
 * Generate an emergency voice notification message based on user health data
 * 
 * @param severity Severity level of the emergency
 * @param healthData Current health data that triggered the alert
 * @returns Voice message to be read by voice assistant
 */
export function generateEmergencyVoiceMessage(
  severity: 'mild' | 'moderate' | 'severe',
  healthData: {
    metric: string;
    value: number;
    threshold: number;
    unit: string;
  }
): string {
  let message = '';
  
  switch (severity) {
    case 'mild':
      message = `Attention. Your ${healthData.metric} reading of ${healthData.value} ${healthData.unit} is slightly outside normal range. Please monitor and take appropriate action if needed.`;
      break;
    case 'moderate':
      message = `Health alert. Your ${healthData.metric} of ${healthData.value} ${healthData.unit} is significantly above the recommended threshold of ${healthData.threshold}. Please check your symptoms and consider contacting your healthcare provider.`;
      break;
    case 'severe':
      message = `URGENT MEDICAL ALERT. Your ${healthData.metric} reading of ${healthData.value} ${healthData.unit} indicates a potentially serious condition requiring immediate attention. If you're experiencing symptoms like dizziness, severe pain, or difficulty breathing, please seek emergency medical help immediately.`;
      break;
  }
  
  return message;
} 