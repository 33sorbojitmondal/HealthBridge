// Health data API utilities for AI HealthBridge

export type HealthMetricType = 
  | 'blood_pressure'
  | 'heart_rate'
  | 'weight'
  | 'blood_glucose'
  | 'steps'
  | 'sleep'
  | 'water'
  | 'calories';

export interface HealthDataPoint {
  date: Date;
  value: number;
}

export interface BloodPressureDataPoint {
  date: Date;
  systolic: number;
  diastolic: number;
}

export interface HealthMetric {
  id: HealthMetricType;
  name: string;
  unit: string;
  current: number;
  previousPeriod: number;
  changePercentage: number;
  goal?: number;
  goal_progress?: number; // percentage
  data: HealthDataPoint[] | BloodPressureDataPoint[];
  color: string;
}

export interface HealthGoal {
  id: string;
  metricType: HealthMetricType;
  name: string;
  current: number | string;
  target: number | string;
  unit: string;
  startDate: Date;
  deadline?: Date;
  progress: number;
}

// Generate random health data for the past 'days' days
function generateHealthData(
  metricType: HealthMetricType, 
  days: number, 
  baseValue: number, 
  variance: number
): HealthDataPoint[] | BloodPressureDataPoint[] {
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    if (metricType === 'blood_pressure') {
      data.push({
        date,
        systolic: baseValue + Math.floor(Math.random() * variance),
        diastolic: Math.floor(baseValue * 0.65) + Math.floor(Math.random() * (variance * 0.6))
      });
    } else {
      // For metrics that trend downward or upward over time
      let trendAdjustment = 0;
      if (metricType === 'weight') {
        // Weight tends to decrease slightly over time (for weight loss goal)
        trendAdjustment = -i * 0.05;
      } else if (metricType === 'steps') {
        // Steps tend to increase over time (for fitness goal)
        trendAdjustment = i * 10;
      }
      
      data.push({
        date,
        value: baseValue + trendAdjustment + (Math.random() * variance - variance / 2)
      });
    }
  }
  
  return data;
}

// Get health metrics data for a user
export async function getUserHealthMetrics(
  userId: string,
  days: number = 14
): Promise<Record<HealthMetricType, HealthMetric>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would fetch data from an API
  // Here we're generating mock data
  
  // Generate base metrics with mock data
  const bloodPressureData = generateHealthData('blood_pressure', days, 120, 15) as BloodPressureDataPoint[];
  const latestBP = bloodPressureData[bloodPressureData.length - 1];
  const prevBP = bloodPressureData[bloodPressureData.length - 8]; // About a week ago
  
  const metrics: Record<HealthMetricType, HealthMetric> = {
    blood_pressure: {
      id: 'blood_pressure',
      name: 'Blood Pressure',
      unit: 'mmHg',
      current: latestBP.systolic,
      previousPeriod: prevBP.systolic,
      changePercentage: parseFloat((((latestBP.systolic - prevBP.systolic) / prevBP.systolic) * 100).toFixed(1)),
      data: bloodPressureData,
      color: 'rgb(244, 63, 94)'
    },
    heart_rate: {
      id: 'heart_rate',
      name: 'Heart Rate',
      unit: 'bpm',
      current: 0, // Will be set from data
      previousPeriod: 0, // Will be set from data
      changePercentage: 0, // Will be calculated
      goal: 60,
      goal_progress: 0, // Will be calculated
      data: generateHealthData('heart_rate', days, 70, 12) as HealthDataPoint[],
      color: 'rgb(239, 68, 68)'
    },
    weight: {
      id: 'weight',
      name: 'Weight',
      unit: 'lbs',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 160,
      goal_progress: 0,
      data: generateHealthData('weight', days, 170, 2) as HealthDataPoint[],
      color: 'rgb(59, 130, 246)'
    },
    blood_glucose: {
      id: 'blood_glucose',
      name: 'Blood Glucose',
      unit: 'mg/dL',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 90,
      goal_progress: 0,
      data: generateHealthData('blood_glucose', days, 95, 15) as HealthDataPoint[],
      color: 'rgb(16, 185, 129)'
    },
    steps: {
      id: 'steps',
      name: 'Steps',
      unit: '',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 10000,
      goal_progress: 0,
      data: generateHealthData('steps', days, 7500, 3000) as HealthDataPoint[],
      color: 'rgb(139, 92, 246)'
    },
    sleep: {
      id: 'sleep',
      name: 'Sleep',
      unit: 'h',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 8,
      goal_progress: 0,
      data: generateHealthData('sleep', days, 7, 1.5) as HealthDataPoint[],
      color: 'rgb(20, 184, 166)'
    },
    water: {
      id: 'water',
      name: 'Water Intake',
      unit: 'oz',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 80,
      goal_progress: 0,
      data: generateHealthData('water', days, 60, 20) as HealthDataPoint[],
      color: 'rgb(6, 182, 212)'
    },
    calories: {
      id: 'calories',
      name: 'Calories',
      unit: 'kcal',
      current: 0,
      previousPeriod: 0,
      changePercentage: 0,
      goal: 2000,
      goal_progress: 0,
      data: generateHealthData('calories', days, 2100, 400) as HealthDataPoint[],
      color: 'rgb(251, 146, 60)'
    }
  };
  
  // Calculate current, previous, and percentage change for each metric
  Object.keys(metrics).forEach((key) => {
    const metric = metrics[key as HealthMetricType];
    if (key !== 'blood_pressure') {
      const data = metric.data as HealthDataPoint[];
      const latest = data[data.length - 1].value;
      const previous = data[data.length - 8].value; // About a week ago
      
      metric.current = parseFloat(latest.toFixed(1));
      metric.previousPeriod = parseFloat(previous.toFixed(1));
      metric.changePercentage = parseFloat((((latest - previous) / previous) * 100).toFixed(1));
      
      // Calculate goal progress if goal exists
      if (metric.goal) {
        if (metric.id === 'weight') {
          // For weight, lower is better, so progress is calculated differently
          const startWeight = 175; // Assuming starting weight
          const totalChange = startWeight - metric.goal;
          const currentChange = startWeight - metric.current;
          metric.goal_progress = Math.round((currentChange / totalChange) * 100);
        } else {
          // For other metrics, higher is better (up to the goal)
          metric.goal_progress = Math.round((metric.current / metric.goal) * 100);
        }
        
        // Ensure progress doesn't exceed 100%
        metric.goal_progress = Math.min(metric.goal_progress, 100);
      }
    }
  });
  
  return metrics;
}

// Get health goals for a user
export async function getUserHealthGoals(userId: string): Promise<HealthGoal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would fetch data from an API
  // Here we're using mock data
  return [
    {
      id: 'goal1',
      metricType: 'weight',
      name: 'Reach Target Weight',
      current: 168.5,
      target: 160,
      unit: 'lbs',
      startDate: new Date('2025-04-01'),
      deadline: new Date('2025-09-30'),
      progress: 32
    },
    {
      id: 'goal2',
      metricType: 'blood_pressure',
      name: 'Lower Blood Pressure',
      current: '120/78',
      target: '115/75',
      unit: 'mmHg',
      startDate: new Date('2025-03-15'),
      deadline: new Date('2025-08-15'),
      progress: 60
    },
    {
      id: 'goal3',
      metricType: 'steps',
      name: 'Increase Daily Steps',
      current: 8472,
      target: 10000,
      unit: 'steps',
      startDate: new Date('2025-01-01'),
      progress: 85
    }
  ];
}

// Add a new health data point
export async function addHealthDataPoint(
  userId: string,
  metricType: HealthMetricType,
  value: number | { systolic: number; diastolic: number },
  date: Date = new Date()
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would send data to an API
  // Here we just return success
  return {
    success: true,
    message: `Successfully added ${metricType} data point`
  };
}

// Add or update a health goal
export async function setHealthGoal(
  userId: string,
  goal: Omit<HealthGoal, 'id' | 'progress'>
): Promise<{ success: boolean; message: string; goalId?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would send data to an API
  // Here we just return success with a fake ID
  return {
    success: true,
    message: 'Goal successfully saved',
    goalId: `goal${Date.now()}`
  };
}

// Get health insights for a user based on their data
export async function getHealthInsights(userId: string): Promise<Array<{
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
}>
> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real app, this would analyze user data and generate personalized insights
  // Here we're using mock insights
  return [
    {
      type: 'positive',
      title: 'Blood Pressure Trend',
      description: 'Your blood pressure readings have improved by 3.2% compared to last month. Keep up the good work!'
    },
    {
      type: 'positive',
      title: 'Activity Goal',
      description: 'You\'ve been consistently meeting your step goals. Consider increasing your daily target from 10,000 to 12,000 steps.'
    },
    {
      type: 'warning',
      title: 'Sleep Pattern',
      description: 'Your sleep duration has improved, but your sleep quality may need attention. Try establishing a more consistent sleep schedule.'
    },
    {
      type: 'info',
      title: 'Water Intake',
      description: 'You\'re making good progress on increasing your water intake. You\'re now at 80% of your daily target.'
    }
  ];
} 