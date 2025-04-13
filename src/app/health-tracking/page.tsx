'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define types for health data
type HealthMetricType = 
  | 'blood_pressure'
  | 'heart_rate'
  | 'weight'
  | 'blood_glucose'
  | 'steps'
  | 'sleep'
  | 'water'
  | 'calories';

interface HealthDataPoint {
  date: Date;
  value: number;
}

interface BloodPressureDataPoint {
  date: Date;
  systolic: number;
  diastolic: number;
}

interface HealthMetric {
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

// Mock health data
const mockHealthData: Record<HealthMetricType, HealthMetric> = {
  blood_pressure: {
    id: 'blood_pressure',
    name: 'Blood Pressure',
    unit: 'mmHg',
    current: 120, // using systolic for the current value
    previousPeriod: 124,
    changePercentage: -3.2,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      systolic: 110 + Math.floor(Math.random() * 20),
      diastolic: 70 + Math.floor(Math.random() * 15)
    })) as BloodPressureDataPoint[],
    color: 'rgb(244, 63, 94)'
  },
  heart_rate: {
    id: 'heart_rate',
    name: 'Heart Rate',
    unit: 'bpm',
    current: 68,
    previousPeriod: 72,
    changePercentage: -5.5,
    goal: 60,
    goal_progress: 80,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 65 + Math.floor(Math.random() * 15)
    })),
    color: 'rgb(239, 68, 68)'
  },
  weight: {
    id: 'weight',
    name: 'Weight',
    unit: 'lbs',
    current: 168.5,
    previousPeriod: 171.2,
    changePercentage: -1.5,
    goal: 160,
    goal_progress: 32,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 173 - (i * 0.3) + (Math.random() * 1.5 - 0.75)
    })),
    color: 'rgb(59, 130, 246)'
  },
  blood_glucose: {
    id: 'blood_glucose',
    name: 'Blood Glucose',
    unit: 'mg/dL',
    current: 96,
    previousPeriod: 102,
    changePercentage: -5.9,
    goal: 90,
    goal_progress: 67,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 90 + Math.floor(Math.random() * 20)
    })),
    color: 'rgb(16, 185, 129)'
  },
  steps: {
    id: 'steps',
    name: 'Steps',
    unit: '',
    current: 8472,
    previousPeriod: 7250,
    changePercentage: 16.8,
    goal: 10000,
    goal_progress: 85,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 5000 + Math.floor(Math.random() * 6000)
    })),
    color: 'rgb(139, 92, 246)'
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    unit: 'h',
    current: 7.2,
    previousPeriod: 6.8,
    changePercentage: 5.9,
    goal: 8,
    goal_progress: 90,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 5.5 + Math.random() * 3
    })),
    color: 'rgb(20, 184, 166)'
  },
  water: {
    id: 'water',
    name: 'Water Intake',
    unit: 'oz',
    current: 64,
    previousPeriod: 56,
    changePercentage: 14.3,
    goal: 80,
    goal_progress: 80,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 40 + Math.floor(Math.random() * 40)
    })),
    color: 'rgb(6, 182, 212)'
  },
  calories: {
    id: 'calories',
    name: 'Calories',
    unit: 'kcal',
    current: 2150,
    previousPeriod: 2320,
    changePercentage: -7.3,
    goal: 2000,
    goal_progress: 93,
    data: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000),
      value: 1800 + Math.floor(Math.random() * 700)
    })),
    color: 'rgb(251, 146, 60)'
  }
};

// Helper functions should be moved outside the component or wrapped in useCallback
const formatNumber = (value: number): string => {
  return value >= 1000 ? value.toLocaleString() : value.toString();
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// LineChart Component
const LineChart = ({ data, color }: { data: HealthDataPoint[]; color: string }) => {
  // Simple SVG line chart
  const values = data.map(d => d.value);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;
  const range = maxValue - minValue;
  
  const width = 100;
  const height = 40;
  
  // Generate path data
  const pathData = data.map((point, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// DonutChart Component for goal progress
const DonutChart = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);
  
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      {/* Progress arc */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 50 50)"
      />
      {/* Percentage text */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#374151"
      >
        {percentage}%
      </text>
    </svg>
  );
};

// Stat Card Component
const StatCard = ({ 
  metric, 
  selected, 
  onClick 
}: { 
  metric: HealthMetric; 
  selected: boolean; 
  onClick: () => void;
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all
        ${selected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-700">{metric.name}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(metric.current)}
            </span>
            {metric.unit && (
              <span className="ml-1 text-sm text-gray-500">{metric.unit}</span>
            )}
          </div>
          
          <div className="flex items-center mt-1">
            <span className={`text-sm font-medium ${
              metric.changePercentage > 0 
                ? 'text-green-600' 
                : metric.changePercentage < 0 
                  ? 'text-red-600' 
                  : 'text-gray-500'
            }`}>
              {metric.changePercentage > 0 ? '↑' : metric.changePercentage < 0 ? '↓' : ''}
              {Math.abs(metric.changePercentage).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        
        <div className="h-12 w-24">
          <LineChart data={metric.data as HealthDataPoint[]} color={metric.color} />
        </div>
      </div>
    </div>
  );
};

// Detailed Metric View
const DetailedMetricView = ({ metric }: { metric: HealthMetric }) => {
  const isBloodPressure = metric.id === 'blood_pressure';
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{metric.name}</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">7 Days</button>
          <button className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md">30 Days</button>
          <button className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-md">90 Days</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Current</div>
          <div className="flex items-baseline">
            {isBloodPressure ? (
              <span className="text-3xl font-bold text-gray-900">
                {(metric.data[metric.data.length - 1] as BloodPressureDataPoint).systolic}/
                {(metric.data[metric.data.length - 1] as BloodPressureDataPoint).diastolic}
              </span>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatNumber(metric.current)}
              </span>
            )}
            <span className="ml-1 text-lg text-gray-500">{metric.unit}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Change</div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${
              metric.changePercentage > 0 
                ? 'text-green-600' 
                : metric.changePercentage < 0 
                  ? 'text-red-600' 
                  : 'text-gray-900'
            }`}>
              {metric.changePercentage > 0 ? '+' : ''}
              {metric.changePercentage.toFixed(1)}%
            </span>
            <span className="ml-1 text-sm text-gray-500">vs last period</span>
          </div>
        </div>
        
        {metric.goal && (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center">
            <div className="mr-3">
              <div className="text-sm text-gray-500 mb-1">Goal Progress</div>
              <div className="text-xl font-bold text-gray-900">
                {formatNumber(metric.current)} / {formatNumber(metric.goal)} {metric.unit}
              </div>
            </div>
            <div className="ml-auto">
              <DonutChart percentage={metric.goal_progress || 0} color={metric.color} />
            </div>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div className="h-72 bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500 h-full flex items-center justify-center">
          <p>
            [In a real app, this would be a detailed interactive chart rendered with a library like Chart.js or Recharts]
          </p>
        </div>
      </div>
      
      {/* Historic data table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Readings</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isBloodPressure ? 'Reading (Sys/Dia)' : 'Reading'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metric.data.slice(-5).reverse().map((dataPoint, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(dataPoint.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dataPoint.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isBloodPressure ? (
                      <>{(dataPoint as BloodPressureDataPoint).systolic}/{(dataPoint as BloodPressureDataPoint).diastolic} {metric.unit}</>
                    ) : (
                      <>{formatNumber((dataPoint as HealthDataPoint).value)} {metric.unit}</>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function HealthTracking() {
  // Always call hooks at the top level
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Define all state hooks unconditionally
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetricType | null>(null);
  const [healthData, setHealthData] = useState(mockHealthData);
  
  // Use useCallback for handlers to prevent unnecessary rerenders
  const handleMetricSelect = useCallback((metricId: HealthMetricType) => {
    setSelectedMetric(prev => prev === metricId ? null : metricId);
  }, []);
  
  // Simulate loading data
  useEffect(() => {
    // Simulate API request
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect if not authenticated - this must run after all other hooks
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/health-tracking');
    }
  }, [status, router]);
  
  // Always return some JSX, but it can be conditionally different
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Health Tracking</h1>
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse p-6">
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Group metrics for display
  const topMetrics: HealthMetricType[] = ['blood_pressure', 'heart_rate', 'weight', 'blood_glucose'];
  const bottomMetrics: HealthMetricType[] = ['steps', 'sleep', 'water', 'calories'];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Health Tracking</h1>
        {session?.user && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            Welcome, {session.user.name}
          </div>
        )}
      </div>
      
      {selectedMetric && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <DetailedMetricView metric={healthData[selectedMetric]} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topMetrics.map(metricId => (
              <StatCard 
                key={metricId}
                metric={healthData[metricId]}
                selected={selectedMetric === metricId}
                onClick={() => handleMetricSelect(metricId)}
              />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lifestyle Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bottomMetrics.map(metricId => (
              <StatCard 
                key={metricId}
                metric={healthData[metricId]}
                selected={selectedMetric === metricId}
                onClick={() => handleMetricSelect(metricId)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Health Insights</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
              <h3 className="font-medium text-blue-800">Blood Pressure Trend</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your blood pressure readings have improved by 3.2% compared to last month. 
                Keep up the good work!
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
              <h3 className="font-medium text-green-800">Activity Goal</h3>
              <p className="text-sm text-green-700 mt-1">
                You've been consistently meeting your step goals. Consider increasing your 
                daily target from 10,000 to 12,000 steps.
              </p>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
              <h3 className="font-medium text-amber-800">Sleep Pattern</h3>
              <p className="text-sm text-amber-700 mt-1">
                Your sleep duration has improved, but your sleep quality may need attention. 
                Try establishing a more consistent sleep schedule.
              </p>
            </div>
          </div>
          <button className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            View All Insights
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Devices</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add a Device</h3>
                  <p className="text-sm text-gray-500">Connect a smartwatch, fitness tracker, or other health device</p>
                </div>
              </div>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>
            
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 mb-3">No devices connected yet</p>
              <p className="text-sm text-gray-400">
                Connect your fitness tracker, smartwatch, or other health monitors to automatically sync your data
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Health Goals</h2>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add New Goal
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Reach Target Weight',
              current: 168.5,
              target: 160,
              unit: 'lbs',
              deadline: 'Sep 30, 2025',
              progress: 32
            },
            {
              name: 'Lower Blood Pressure',
              current: '120/78',
              target: '115/75',
              unit: 'mmHg',
              deadline: 'Aug 15, 2025',
              progress: 60
            },
            {
              name: 'Increase Daily Steps',
              current: 8472,
              target: 10000,
              unit: 'steps',
              deadline: 'Ongoing',
              progress: 85
            }
          ].map((goal, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{goal.name}</h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Current: {goal.current} {goal.unit}</span>
                <span className="text-gray-600">Target: {goal.target} {goal.unit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{goal.progress}% complete</span>
                <span className="text-gray-500">Deadline: {goal.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 