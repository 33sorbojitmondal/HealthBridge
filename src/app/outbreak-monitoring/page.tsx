'use client';

import { useState, useEffect, useRef } from 'react';
import { useRequireAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types for outbreak monitoring
interface Location {
  id: string;
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  level: 'city' | 'district' | 'state';
  parent?: string; // Parent location ID
}

interface Symptom {
  id: string;
  name: string;
  category: string;
  associatedConditions: string[];
}

interface OutbreakAlert {
  id: string;
  locationId: string;
  locationName: string;
  symptomId: string;
  symptomName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reportCount: number;
  date: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
}

interface SymptomTrend {
  locationId: string;
  locationName: string;
  symptomId: string;
  symptomName: string;
  dailyCounts: {
    date: Date;
    count: number;
  }[];
}

// Mock data for locations
const mockLocations: Location[] = [
  { id: 'in-mh', name: 'Maharashtra', coordinates: [19.7515, 75.7139], level: 'state' },
  { id: 'in-ka', name: 'Karnataka', coordinates: [15.3173, 75.7139], level: 'state' },
  { id: 'in-tn', name: 'Tamil Nadu', coordinates: [11.1271, 78.6569], level: 'state' },
  { id: 'in-dl', name: 'Delhi', coordinates: [28.7041, 77.1025], level: 'state' },
  { id: 'in-mh-mu', name: 'Mumbai', coordinates: [19.0760, 72.8777], level: 'city', parent: 'in-mh' },
  { id: 'in-mh-pu', name: 'Pune', coordinates: [18.5204, 73.8567], level: 'city', parent: 'in-mh' },
  { id: 'in-ka-ba', name: 'Bangalore', coordinates: [12.9716, 77.5946], level: 'city', parent: 'in-ka' },
  { id: 'in-ka-my', name: 'Mysore', coordinates: [12.2958, 76.6394], level: 'city', parent: 'in-ka' },
  { id: 'in-tn-ch', name: 'Chennai', coordinates: [13.0827, 80.2707], level: 'city', parent: 'in-tn' },
  { id: 'in-tn-co', name: 'Coimbatore', coordinates: [11.0168, 76.9558], level: 'city', parent: 'in-tn' }
];

// Mock data for symptoms
const mockSymptoms: Symptom[] = [
  { 
    id: 'fever', 
    name: 'Fever', 
    category: 'General', 
    associatedConditions: ['Flu', 'COVID-19', 'Dengue', 'Malaria'] 
  },
  { 
    id: 'cough', 
    name: 'Cough', 
    category: 'Respiratory', 
    associatedConditions: ['Flu', 'COVID-19', 'Tuberculosis', 'Bronchitis'] 
  },
  { 
    id: 'sore-throat', 
    name: 'Sore Throat', 
    category: 'Respiratory', 
    associatedConditions: ['Flu', 'Strep Throat', 'Tonsillitis'] 
  },
  { 
    id: 'headache', 
    name: 'Headache', 
    category: 'Neurological', 
    associatedConditions: ['Flu', 'Migraine', 'Meningitis', 'COVID-19'] 
  },
  { 
    id: 'nausea', 
    name: 'Nausea', 
    category: 'Gastrointestinal', 
    associatedConditions: ['Food Poisoning', 'Gastroenteritis', 'Norovirus'] 
  },
  { 
    id: 'diarrhea', 
    name: 'Diarrhea', 
    category: 'Gastrointestinal', 
    associatedConditions: ['Food Poisoning', 'Gastroenteritis', 'Cholera'] 
  },
  { 
    id: 'rash', 
    name: 'Skin Rash', 
    category: 'Dermatological', 
    associatedConditions: ['Measles', 'Chickenpox', 'Allergic Reaction'] 
  },
  { 
    id: 'joint-pain', 
    name: 'Joint Pain', 
    category: 'Musculoskeletal', 
    associatedConditions: ['Dengue', 'Chikungunya', 'Arthritis'] 
  }
];

// Mock data for outbreak alerts
const mockOutbreakAlerts: OutbreakAlert[] = [
  {
    id: 'alert-1',
    locationId: 'in-mh-mu',
    locationName: 'Mumbai',
    symptomId: 'fever',
    symptomName: 'Fever',
    riskLevel: 'high',
    reportCount: 347,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    trend: 'increasing',
    description: 'Significant increase in fever cases reported in Mumbai. Potential dengue outbreak.'
  },
  {
    id: 'alert-2',
    locationId: 'in-ka-ba',
    locationName: 'Bangalore',
    symptomId: 'cough',
    symptomName: 'Cough',
    riskLevel: 'medium',
    reportCount: 218,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    trend: 'stable',
    description: 'Elevated cases of persistent cough. Monitoring for respiratory infection spread.'
  },
  {
    id: 'alert-3',
    locationId: 'in-tn-ch',
    locationName: 'Chennai',
    symptomId: 'diarrhea',
    symptomName: 'Diarrhea',
    riskLevel: 'critical',
    reportCount: 412,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    trend: 'increasing',
    description: 'Critical alert: Sharp increase in gastrointestinal symptoms. Potential contaminated water source.'
  },
  {
    id: 'alert-4',
    locationId: 'in-dl',
    locationName: 'Delhi',
    symptomId: 'joint-pain',
    symptomName: 'Joint Pain',
    riskLevel: 'low',
    reportCount: 95,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    trend: 'decreasing',
    description: 'Minor increase in joint pain reports. Monitoring for chikungunya cases.'
  }
];

// Mock data for symptom trends
const generateMockTrend = (locationId: string, locationName: string, symptomId: string, symptomName: string): SymptomTrend => {
  const dailyCounts = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    // Generate a pattern - start low, possible spike in the middle, then normalize
    let baseCount = 10 + Math.floor(Math.random() * 20);
    
    // Add random variations
    if (i > 15 && i < 25) {
      // Create a spike or elevation in the middle period
      baseCount = baseCount * (1.5 + Math.random());
    }
    
    return {
      date,
      count: Math.floor(baseCount)
    };
  });
  
  return {
    locationId,
    locationName,
    symptomId,
    symptomName,
    dailyCounts
  };
};

const mockSymptomTrends: SymptomTrend[] = [
  generateMockTrend('in-mh-mu', 'Mumbai', 'fever', 'Fever'),
  generateMockTrend('in-ka-ba', 'Bangalore', 'cough', 'Cough'),
  generateMockTrend('in-tn-ch', 'Chennai', 'diarrhea', 'Diarrhea'),
  generateMockTrend('in-dl', 'Delhi', 'joint-pain', 'Joint Pain')
];

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper function to get risk level color
const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'critical':
      return 'bg-red-600 text-white';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get trend icon and color
const getTrendDisplay = (trend: string): { icon: JSX.Element; color: string } => {
  switch (trend) {
    case 'increasing':
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        color: 'text-red-600'
      };
    case 'decreasing':
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        ),
        color: 'text-green-600'
      };
    default:
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        ),
        color: 'text-yellow-600'
      };
  }
};

// Component for location selection with hierarchical display
function LocationSelector({ 
  locations, 
  selectedLocation, 
  onSelect 
}: { 
  locations: Location[], 
  selectedLocation: string, 
  onSelect: (locationId: string) => void 
}) {
  // Group locations by level
  const stateLocations = locations.filter(loc => loc.level === 'state');
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          className={`text-left px-3 py-2 rounded-md border ${
            selectedLocation === 'all'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onSelect('all')}
        >
          <div className="font-medium">All Locations</div>
          <div className="text-xs text-gray-500">View data from all regions</div>
        </button>
        
        {stateLocations.map(state => {
          const isStateSelected = selectedLocation === state.id;
          const cityLocations = locations.filter(loc => loc.parent === state.id);
          
          return (
            <div key={state.id} className="relative">
              <button
                className={`w-full text-left px-3 py-2 rounded-md border ${
                  isStateSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onSelect(state.id)}
              >
                <div className="font-medium">{state.name}</div>
                <div className="text-xs text-gray-500">{cityLocations.length} cities</div>
              </button>
              
              {cityLocations.length > 0 && (
                <div className={`mt-1 pl-3 ${isStateSelected ? 'block' : 'hidden'}`}>
                  {cityLocations.map(city => (
                    <button
                      key={city.id}
                      className={`w-full text-left px-2 py-1 text-sm rounded-md mb-1 ${
                        selectedLocation === city.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => onSelect(city.id)}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Component for displaying an outbreak alert card
function AlertCard({ alert }: { alert: OutbreakAlert }) {
  const riskLevelClass = getRiskLevelColor(alert.riskLevel);
  const { icon, color } = getTrendDisplay(alert.trend);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`${riskLevelClass} px-4 py-2 flex justify-between items-center`}>
        <div className="font-medium">
          {alert.symptomName} - {alert.locationName}
        </div>
        <div className="text-sm">
          {alert.riskLevel.charAt(0).toUpperCase() + alert.riskLevel.slice(1)} Risk
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-700 text-sm mb-3">{alert.description}</p>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Reported Cases</span>
            <span className="font-medium text-gray-900">{alert.reportCount}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-gray-500">Trend</span>
            <span className={`font-medium flex items-center ${color}`}>
              {icon}
              <span className="ml-1">
                {alert.trend.charAt(0).toUpperCase() + alert.trend.slice(1)}
              </span>
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            First reported: {formatDate(alert.date)}
          </span>
          
          <button 
            className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
            onClick={() => alert(`Detailed analysis for ${alert.symptomName} in ${alert.locationName}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for trend visualization 
function TrendCard({ trend }: { trend: SymptomTrend }) {
  // Get a subset of the daily counts based on selected timeframe
  // In a real implementation, this would connect to a chart library like Chart.js or Recharts
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">{trend.symptomName}</h3>
        <div className="text-xs text-gray-500">{trend.locationName}</div>
      </div>
      
      <div className="p-4">
        <div className="h-32 bg-gray-50 rounded mb-3 relative">
          {/* This is a placeholder for an actual chart */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-gray-400">Trend chart would render here</span>
          </div>
          {/* In a real implementation, render a chart using the dailyCounts data */}
          {trend.dailyCounts.slice(-7).map((day, index) => {
            // This creates a simple visual representation of trend data
            // In a real app, you'd use a proper charting library
            const height = (day.count / 100) * 80; // Scale to max height of 80%
            return (
              <div 
                key={index} 
                className="absolute bottom-0 bg-blue-400 w-[8%] rounded-t opacity-90"
                style={{
                  height: `${height}%`,
                  left: `${10 + index * 12}%`
                }}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">
            Latest: <span className="font-medium">{trend.dailyCounts[trend.dailyCounts.length - 1].count} cases</span>
          </span>
          
          <span className="text-xs text-gray-500">
            Last 30 days
          </span>
        </div>
      </div>
    </div>
  );
}

// Map placeholder component
function MapPlaceholder() {
  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden h-80">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-gray-500 mb-2">Interactive map would render here</span>
        <p className="text-xs text-gray-400 text-center max-w-md">
          In a production app, this would display a map with color-coded regions 
          indicating outbreak levels and interactive elements for exploring 
          geographic data distribution
        </p>
      </div>
    </div>
  );
}

// Mock API functions for real-time data
const fetchOutbreakAlerts = async (locationId?: string, symptomId?: string): Promise<OutbreakAlert[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate dynamic data
  const mockOutbreakAlerts: OutbreakAlert[] = [
    {
      id: 'alert-1',
      locationId: 'in-mh-mu',
      locationName: 'Mumbai',
      symptomId: 'fever',
      symptomName: 'Fever',
      riskLevel: 'high',
      reportCount: 347 + Math.floor(Math.random() * 20), // Add randomness for real-time effect
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      trend: 'increasing',
      description: 'Significant increase in fever cases reported in Mumbai. Potential dengue outbreak.'
    },
    {
      id: 'alert-2',
      locationId: 'in-ka-ba',
      locationName: 'Bangalore',
      symptomId: 'cough',
      symptomName: 'Cough',
      riskLevel: 'medium',
      reportCount: 218 + Math.floor(Math.random() * 15),
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      trend: 'stable',
      description: 'Elevated cases of persistent cough. Monitoring for respiratory infection spread.'
    },
    {
      id: 'alert-3',
      locationId: 'in-tn-ch',
      locationName: 'Chennai',
      symptomId: 'diarrhea',
      symptomName: 'Diarrhea',
      riskLevel: 'critical',
      reportCount: 412 + Math.floor(Math.random() * 25),
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      trend: 'increasing',
      description: 'Critical alert: Sharp increase in gastrointestinal symptoms. Potential contaminated water source.'
    },
    {
      id: 'alert-4',
      locationId: 'in-dl',
      locationName: 'Delhi',
      symptomId: 'joint-pain',
      symptomName: 'Joint Pain',
      riskLevel: 'low',
      reportCount: 95 + Math.floor(Math.random() * 10),
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      trend: Math.random() > 0.7 ? 'decreasing' : 'stable', // Occasionally update trends
      description: 'Minor increase in joint pain reports. Monitoring for chikungunya cases.'
    }
  ];
  
  // Add a new random alert occasionally (20% chance)
  if (Math.random() > 0.8) {
    const randomLocationIndex = Math.floor(Math.random() * mockLocations.length);
    const randomLocation = mockLocations[randomLocationIndex];
    const randomSymptomIndex = Math.floor(Math.random() * mockSymptoms.length);
    const randomSymptom = mockSymptoms[randomSymptomIndex];
    
    mockOutbreakAlerts.push({
      id: `alert-${Date.now()}`,
      locationId: randomLocation.id,
      locationName: randomLocation.name,
      symptomId: randomSymptom.id,
      symptomName: randomSymptom.name,
      riskLevel: Math.random() > 0.7 ? 'high' : 'medium',
      reportCount: 50 + Math.floor(Math.random() * 150),
      date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
      trend: Math.random() > 0.5 ? 'increasing' : 'stable',
      description: `New alert: Rising ${randomSymptom.name.toLowerCase()} cases in ${randomLocation.name}. Monitoring situation closely.`
    });
  }
  
  // Filter by location and symptom if provided
  return mockOutbreakAlerts.filter(alert => {
    if (locationId && locationId !== 'all') {
      if (alert.locationId !== locationId) {
        const location = mockLocations.find(loc => loc.id === alert.locationId);
        if (!location || location.parent !== locationId) {
          return false;
        }
      }
    }
    
    if (symptomId && symptomId !== 'all' && alert.symptomId !== symptomId) {
      return false;
    }
    
    return true;
  });
};

// Chart component for symptom trends
const TrendChart = ({ trend }: { trend: SymptomTrend }) => {
  // Simple SVG line chart
  const data = trend.dailyCounts;
  const max = Math.max(...data.map(d => d.count));
  const min = Math.min(...data.map(d => d.count));
  const range = max - min;
  const width = 300;
  const height = 80;

  const getX = (index: number) => (index / (data.length - 1)) * width;
  const getY = (value: number) => height - ((value - min) / range) * height;

  const points = data.map((d, i) => `${getX(i)},${getY(d.count)}`).join(' ');

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Add dots for each data point */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d.count)}
            r="3"
            fill="#3b82f6"
            className="hover:r-4 transition-all duration-200"
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{data[0].date.slice(5)}</span>
        <span>{data[data.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
};

// Alert Badge Component
const AlertBadge = ({ level }: { level: OutbreakAlertLevel }) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    severe: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level]}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

// Main Outbreak Monitoring Component
export default function OutbreakMonitoring() {
  const { session, loading: authLoading } = useRequireAuth();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('all');
  const [outbreakAlerts, setOutbreakAlerts] = useState<OutbreakAlert[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [alertRadius, setAlertRadius] = useState<number>(25);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls to your backend
      const alerts = await mockFetchOutbreakAlerts(selectedLocation, selectedSymptom);
      const trends = await mockGenerateTrendData(selectedLocation, selectedSymptom);
      
      setOutbreakAlerts(alerts);
      setSymptomTrends(trends);
    } catch (error) {
      console.error('Failed to fetch outbreak data:', error);
      // Handle error state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
      
      // Set up refresh interval (every 5 minutes)
      refreshTimerRef.current = setInterval(fetchData, 5 * 60 * 1000);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [session, selectedLocation, selectedSymptom]);

  const handleRefresh = () => {
    fetchData();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please log in to access the Outbreak Monitoring feature.</p>
        <a 
          href="/login" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Outbreak Monitoring</h1>
          <p className="text-gray-600 max-w-2xl">
            Track disease outbreaks and symptom patterns in your area. Get notified about health threats and emerging trends.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="mt-4 md:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                <optgroup label="States">
                  {mockLocations
                    .filter((loc) => loc.level === 'state')
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))
                  }
                </optgroup>
                <optgroup label="Cities">
                  {mockLocations
                    .filter((loc) => loc.level === 'city')
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))
                  }
                </optgroup>
              </select>
            </div>
            
            <div>
              <label htmlFor="symptom" className="block text-sm font-medium text-gray-700 mb-1">
                Symptom or Condition
              </label>
              <select
                id="symptom"
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Symptoms</option>
                {mockSymptoms.map((symptom) => (
                  <option key={symptom.id} value={symptom.id}>{symptom.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Settings</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                Enable notifications for new outbreaks
              </label>
            </div>
            
            <div>
              <label htmlFor="radius" className="block text-sm text-gray-700 mb-1">
                Alert radius: {alertRadius} miles
              </label>
              <input
                type="range"
                id="radius"
                min="5"
                max="100"
                value={alertRadius}
                onChange={(e) => setAlertRadius(parseInt(e.target.value))}
                className="w-full md:w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Map View</h2>
          
          {/* Map Placeholder - In real app, use Leaflet or Google Maps */}
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-400 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                />
              </svg>
              <p className="text-gray-500">
                Map View will display here with outbreak hotspots
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Enable Location Services
              </button>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Alerts</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : outbreakAlerts.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {outbreakAlerts.map((alert) => (
                <div key={alert.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900">{alert.symptomName}</h3>
                    <AlertBadge level={alert.riskLevel} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{alert.locationName}</p>
                  <p className="text-sm text-gray-800 mb-2">{alert.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {alert.reportCount} cases
                    </span>
                    <span className="text-gray-500">Updated: {formatDate(alert.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 mx-auto text-gray-400 mb-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-gray-500">No active alerts in your area</p>
              <p className="text-sm text-gray-400 mt-1">Try expanding your search filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Symptom Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Symptom Trends</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : symptomTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {symptomTrends.map((trend) => (
              <div key={trend.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{trend.symptomName}</h3>
                    <p className="text-sm text-gray-500">{trend.locationName}</p>
                  </div>
                  <span className={`text-sm font-medium ${trend.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`}>
                    {trend.trend === 'increasing' ? '↑' : '↓'} 
                  </span>
                </div>
                <TrendChart trend={trend} />
                <div className="mt-2 text-right">
                  <button className="text-blue-600 text-sm hover:text-blue-800">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 mx-auto text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-gray-500">No symptom trend data available</p>
            <p className="text-sm text-gray-400 mt-1">Try different filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
} 