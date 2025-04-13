'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types for health equity data
interface HealthMetric {
  id: string;
  name: string;
  description: string;
  nationalAverage: number;
  unit: string;
}

interface RegionData {
  id: string;
  name: string;
  type: 'urban' | 'rural' | 'semi-urban';
  population: number;
  healthcareAccess: number; // percentage with adequate healthcare access
  metrics: {
    [metricId: string]: number;
  };
}

interface EquityGap {
  regionId: string;
  regionName: string;
  metricId: string;
  metricName: string;
  value: number;
  nationalAverage: number;
  gap: number; // percentage below average
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedPopulation: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  targetRegions: string[];
  targetMetrics: string[];
  estimatedImpact: string;
  implementationDifficulty: 'easy' | 'moderate' | 'difficult';
  resourcesRequired: string;
  stakeholders: string[];
}

type ResourceType = 'clinic' | 'food' | 'exercise' | 'mental' | 'education';

interface CommunityResource {
  id: string;
  name: string;
  type: ResourceType;
  address: string;
  phone: string;
  website?: string;
  description: string;
  distance: number; // in miles
  lowIncome: boolean;
  languages: string[];
}

interface HealthDisparityData {
  category: string;
  metric: string;
  overallRate: number;
  demographicRates: {
    group: string;
    rate: number;
    difference: number;
  }[];
}

// Mock data for health metrics
const healthMetrics: HealthMetric[] = [
  {
    id: 'doctor-ratio',
    name: 'Doctor-to-Population Ratio',
    description: 'Number of doctors per 1,000 people',
    nationalAverage: 0.8,
    unit: 'per 1,000'
  },
  {
    id: 'hospital-beds',
    name: 'Hospital Beds',
    description: 'Number of hospital beds per 1,000 people',
    nationalAverage: 1.4,
    unit: 'per 1,000'
  },
  {
    id: 'immunization',
    name: 'Immunization Coverage',
    description: 'Percentage of children with complete immunization',
    nationalAverage: 76.4,
    unit: '%'
  },
  {
    id: 'maternal-care',
    name: 'Maternal Care',
    description: 'Percentage of births attended by skilled health personnel',
    nationalAverage: 81.2,
    unit: '%'
  },
  {
    id: 'health-insurance',
    name: 'Health Insurance Coverage',
    description: 'Percentage of population covered by health insurance',
    nationalAverage: 37.3,
    unit: '%'
  }
];

// Mock data for regions
const regionData: RegionData[] = [
  {
    id: 'region-1',
    name: 'Central District',
    type: 'urban',
    population: 1458000,
    healthcareAccess: 78.5,
    metrics: {
      'doctor-ratio': 1.2,
      'hospital-beds': 2.1,
      'immunization': 82.3,
      'maternal-care': 89.4,
      'health-insurance': 56.7
    }
  },
  {
    id: 'region-2',
    name: 'Northern District',
    type: 'rural',
    population: 876000,
    healthcareAccess: 42.1,
    metrics: {
      'doctor-ratio': 0.3,
      'hospital-beds': 0.7,
      'immunization': 58.2,
      'maternal-care': 62.8,
      'health-insurance': 18.5
    }
  },
  {
    id: 'region-3',
    name: 'Eastern District',
    type: 'semi-urban',
    population: 1124000,
    healthcareAccess: 61.7,
    metrics: {
      'doctor-ratio': 0.6,
      'hospital-beds': 1.1,
      'immunization': 71.5,
      'maternal-care': 75.9,
      'health-insurance': 32.1
    }
  },
  {
    id: 'region-4',
    name: 'Western District',
    type: 'rural',
    population: 743000,
    healthcareAccess: 38.3,
    metrics: {
      'doctor-ratio': 0.2,
      'hospital-beds': 0.5,
      'immunization': 51.7,
      'maternal-care': 58.2,
      'health-insurance': 15.8
    }
  },
  {
    id: 'region-5',
    name: 'Southern District',
    type: 'semi-urban',
    population: 987000,
    healthcareAccess: 57.8,
    metrics: {
      'doctor-ratio': 0.5,
      'hospital-beds': 0.9,
      'immunization': 68.4,
      'maternal-care': 72.1,
      'health-insurance': 28.9
    }
  }
];

// Generate equity gaps based on region data and metrics
const generateEquityGaps = (): EquityGap[] => {
  const gaps: EquityGap[] = [];
  
  regionData.forEach(region => {
    healthMetrics.forEach(metric => {
      const value = region.metrics[metric.id];
      const nationalAverage = metric.nationalAverage;
      
      // Calculate the gap as a percentage below average
      // For metrics where higher is better (all current metrics)
      const gapValue = ((nationalAverage - value) / nationalAverage) * 100;
      
      // Only include if there's a negative gap (below average)
      if (gapValue > 0) {
        // Determine severity based on the gap size
        let severity: 'low' | 'medium' | 'high' | 'critical';
        if (gapValue < 10) severity = 'low';
        else if (gapValue < 25) severity = 'medium';
        else if (gapValue < 50) severity = 'high';
        else severity = 'critical';
        
        // Calculate affected population (simplified)
        const affectedPopulation = Math.round(region.population * (gapValue / 100));
        
        gaps.push({
          regionId: region.id,
          regionName: region.name,
          metricId: metric.id,
          metricName: metric.name,
          value,
          nationalAverage,
          gap: gapValue,
          severity,
          affectedPopulation
        });
      }
    });
  });
  
  // Sort by gap severity (largest gaps first)
  return gaps.sort((a, b) => b.gap - a.gap);
};

// Mock data for equity gaps
const equityGaps = generateEquityGaps();

// Mock data for recommendations
const recommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Mobile Health Clinics for Remote Areas',
    description: 'Deploy mobile health clinics in underserved rural districts to improve access to basic healthcare services, immunizations, and maternal care.',
    targetRegions: ['region-2', 'region-4'],
    targetMetrics: ['doctor-ratio', 'immunization', 'maternal-care'],
    estimatedImpact: 'Could improve healthcare access for approximately 350,000 people in rural areas',
    implementationDifficulty: 'moderate',
    resourcesRequired: 'Funding for vehicles, medical equipment, staff; approximately $2.5M initial investment',
    stakeholders: ['Ministry of Health', 'NGOs', 'International Aid Organizations', 'Local Communities']
  },
  {
    id: 'rec-2',
    title: 'Community Health Worker Program',
    description: 'Recruit and train community health workers from underserved communities to provide basic healthcare, education, and connect residents to health services.',
    targetRegions: ['region-2', 'region-4', 'region-5'],
    targetMetrics: ['doctor-ratio', 'immunization', 'maternal-care'],
    estimatedImpact: 'Potential to reach 500,000+ people across multiple districts',
    implementationDifficulty: 'moderate',
    resourcesRequired: 'Training programs, stipends for workers, basic medical supplies; $1.8M annual budget',
    stakeholders: ['Ministry of Health', 'Local Healthcare Facilities', 'NGOs', 'Community Leaders']
  },
  {
    id: 'rec-3',
    title: 'Micro-Health Insurance Schemes',
    description: 'Develop affordable micro-health insurance programs tailored for low-income households in underserved regions.',
    targetRegions: ['region-2', 'region-3', 'region-4', 'region-5'],
    targetMetrics: ['health-insurance'],
    estimatedImpact: 'Could extend health insurance coverage to 1M+ currently uninsured citizens',
    implementationDifficulty: 'difficult',
    resourcesRequired: 'Insurance expertise, technology infrastructure, subsidies for premiums; $5M+ investment',
    stakeholders: ['Ministry of Health', 'Insurance Companies', 'NGOs', 'Ministry of Finance', 'Community Organizations']
  },
  {
    id: 'rec-4',
    title: 'Public-Private Partnerships for Rural Hospitals',
    description: 'Create incentives for private healthcare providers to establish facilities in underserved areas through subsidies, tax benefits, and infrastructure support.',
    targetRegions: ['region-2', 'region-4'],
    targetMetrics: ['hospital-beds', 'doctor-ratio'],
    estimatedImpact: 'Potential to add 500+ hospital beds and attract 200+ healthcare professionals to rural areas',
    implementationDifficulty: 'difficult',
    resourcesRequired: 'Substantial policy changes, financial incentives, infrastructure development; $10M+ investment',
    stakeholders: ['Ministry of Health', 'Private Healthcare Companies', 'Investors', 'Local Government']
  },
  {
    id: 'rec-5',
    title: 'Maternal and Child Health Education Programs',
    description: 'Implement community-based education programs focused on maternal and child health, nutrition, and the importance of immunization.',
    targetRegions: ['region-2', 'region-4', 'region-5'],
    targetMetrics: ['immunization', 'maternal-care'],
    estimatedImpact: 'Could improve maternal and child health outcomes for 150,000+ families',
    implementationDifficulty: 'easy',
    resourcesRequired: 'Educational materials, community facilitators, venue rentals; $1.2M annual budget',
    stakeholders: ['Ministry of Health', 'NGOs', 'Community Leaders', 'Local Schools']
  }
];

// Mock data
const MOCK_COMMUNITY_RESOURCES: CommunityResource[] = [
  {
    id: '1',
    name: 'Community Health Clinic',
    type: 'clinic',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    website: 'https://communityhealthclinic.org',
    description: 'Low-cost healthcare services for uninsured and underinsured individuals',
    distance: 1.2,
    lowIncome: true,
    languages: ['English', 'Spanish', 'Mandarin']
  },
  {
    id: '2',
    name: 'Food Bank of Metro Area',
    type: 'food',
    address: '456 Oak Ave, Anytown, USA',
    phone: '(555) 987-6543',
    website: 'https://metrofoodbank.org',
    description: 'Free groceries and meals for individuals and families in need',
    distance: 2.5,
    lowIncome: true,
    languages: ['English', 'Spanish']
  },
  {
    id: '3',
    name: 'Mental Health Support Center',
    type: 'mental',
    address: '789 Pine Rd, Anytown, USA',
    phone: '(555) 456-7890',
    website: 'https://mentalhealthsupport.org',
    description: 'Affordable counseling and mental health services on a sliding scale',
    distance: 3.7,
    lowIncome: true,
    languages: ['English', 'French', 'Vietnamese']
  },
  {
    id: '4',
    name: 'Community Fitness Center',
    type: 'exercise',
    address: '101 Cedar Ln, Anytown, USA',
    phone: '(555) 321-0987',
    website: 'https://communityfitness.org',
    description: 'Low-cost gym memberships and free fitness classes',
    distance: 1.8,
    lowIncome: true,
    languages: ['English', 'Spanish']
  },
  {
    id: '5',
    name: 'Health Education Workshop',
    type: 'education',
    address: '202 Maple Dr, Anytown, USA',
    phone: '(555) 234-5678',
    website: 'https://healtheducation.org',
    description: 'Free health education workshops and resources',
    distance: 4.2,
    lowIncome: true,
    languages: ['English', 'Spanish', 'Korean']
  }
];

const MOCK_HEALTH_DISPARITIES: HealthDisparityData[] = [
  {
    category: 'Access to Care',
    metric: 'Regular Doctor Visits',
    overallRate: 76,
    demographicRates: [
      { group: 'High Income', rate: 89, difference: 13 },
      { group: 'Middle Income', rate: 78, difference: 2 },
      { group: 'Low Income', rate: 61, difference: -15 }
    ]
  },
  {
    category: 'Chronic Conditions',
    metric: 'Diabetes Prevalence',
    overallRate: 11,
    demographicRates: [
      { group: 'Urban Areas', rate: 9, difference: -2 },
      { group: 'Suburban Areas', rate: 10, difference: -1 },
      { group: 'Rural Areas', rate: 14, difference: 3 }
    ]
  },
  {
    category: 'Mental Health',
    metric: 'Depression Diagnosis',
    overallRate: 8,
    demographicRates: [
      { group: 'Insured', rate: 9, difference: 1 },
      { group: 'Underinsured', rate: 7, difference: -1 },
      { group: 'Uninsured', rate: 4, difference: -4 }
    ]
  }
];

// Mock data functions
const getHealthDisparities = (): Promise<HealthDisparityData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_HEALTH_DISPARITIES);
    }, 500);
  });
};

const getCommunityResources = (type?: ResourceType): Promise<CommunityResource[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type) {
        resolve(MOCK_COMMUNITY_RESOURCES.filter(resource => resource.type === type));
      } else {
        resolve(MOCK_COMMUNITY_RESOURCES);
      }
    }, 500);
  });
};

// Helper function for formatting numbers
const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

// Helper function to get color based on severity
const getSeverityColor = (severity: string): string => {
  switch (severity) {
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

// Helper function to get color based on implementation difficulty
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'difficult':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Simple Bar Chart Component
const BarChart = ({ data, nationalAverage, maxValue }: { 
  data: { name: string; value: number }[]; 
  nationalAverage: number;
  maxValue: number;
}) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm text-gray-600">{item.value.toFixed(1)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 relative">
            <div
              className={`h-2.5 rounded-full ${item.value < nationalAverage ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>
            {/* National average marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-700"
              style={{ left: `${(nationalAverage / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      <div className="flex justify-end items-center">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-3 h-0.5 bg-blue-700 mr-1"></div>
          <span>National Average</span>
        </div>
      </div>
    </div>
  );
};

// Gap Card Component
const GapCard = ({ gap }: { gap: EquityGap }) => {
  const metric = healthMetrics.find(m => m.id === gap.metricId);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${getSeverityColor(gap.severity)}`}>
            {gap.severity.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">{gap.regionName}</span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1">{gap.metricName}</h3>
        <p className="text-xs text-gray-600 mb-3">{metric?.description}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-sm font-bold text-red-600">{gap.value.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-sm font-bold text-blue-600">{gap.nationalAverage.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div className="bg-gray-50 rounded-md p-2 text-center">
            <div className="text-sm font-bold text-orange-600">{gap.gap.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Gap</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-700">
          Affects approximately <span className="font-semibold">{formatNumber(gap.affectedPopulation)}</span> people
        </div>
      </div>
    </div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const targetRegions = regionData.filter(region => recommendation.targetRegions.includes(region.id));
  const totalPopulation = targetRegions.reduce((sum, region) => sum + region.population, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex space-x-1">
            {recommendation.targetMetrics.map((metricId, index) => {
              const metric = healthMetrics.find(m => m.id === metricId);
              return (
                <span 
                  key={index} 
                  className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-0.5"
                >
                  {metric?.name.split(' ')[0]}
                </span>
              );
            })}
          </div>
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
            getDifficultyColor(recommendation.implementationDifficulty)
          }`}>
            {recommendation.implementationDifficulty}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1">{recommendation.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{recommendation.description}</p>
        
        <div className="text-xs text-gray-700 mb-2">
          <span className="font-medium">Target regions:</span> {targetRegions.map(r => r.name).join(', ')}
        </div>
        <div className="text-xs text-gray-700 mb-2">
          <span className="font-medium">Potential impact:</span> {recommendation.estimatedImpact}
        </div>
        <div className="text-xs text-gray-700">
          <span className="font-medium">Resources:</span> {recommendation.resourcesRequired.split(';')[0]}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Population: {formatNumber(totalPopulation)}
        </span>
        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

// Region Statistics Component
const RegionStatistics = ({ region }: { region: RegionData }) => {
  const metrics = healthMetrics.map(metric => ({
    name: metric.name,
    value: region.metrics[metric.id]
  }));
  
  // Find the max value for all metrics to set chart scale
  const maxMetricValue = Math.max(
    ...metrics.map(m => m.value),
    ...healthMetrics.map(m => m.nationalAverage)
  ) * 1.2; // Add 20% padding
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{region.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full ${
              region.type === 'urban' 
                ? 'bg-blue-500' 
                : region.type === 'rural' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
            }`}></span>
            <span>{region.type.charAt(0).toUpperCase() + region.type.slice(1)}</span>
            <span>•</span>
            <span>Pop: {formatNumber(region.population)}</span>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg px-3 py-1 text-blue-700 text-sm font-medium">
          {region.healthcareAccess}% Access
        </div>
      </div>
      
      <BarChart 
        data={metrics} 
        nationalAverage={4.5} 
        maxValue={maxMetricValue} 
      />
    </div>
  );
};

// Resource Card Component
const ResourceCard = ({ resource }: { resource: CommunityResource }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-primary">{resource.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{resource.address}</p>
          <p className="text-sm mb-2">{resource.description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {resource.languages.map(lang => (
              <span key={lang} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {lang}
              </span>
            ))}
            {resource.lowIncome && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Low-income support
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-primary">{resource.distance} miles</span>
        </div>
      </div>
      <div className="mt-3 flex justify-between">
        <a href={`tel:${resource.phone}`} className="text-primary hover:underline text-sm">
          {resource.phone}
        </a>
        {resource.website && (
          <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
            Visit Website
          </a>
        )}
      </div>
    </div>
  );
};

// Disparity Chart Component
const DisparityChart = ({ data }: { data: HealthDisparityData }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{data.category}: {data.metric}</h3>
      <p className="text-sm text-gray-600 mb-3">Overall rate: {data.overallRate}%</p>
      
      <div className="space-y-3">
        {data.demographicRates.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.group}</span>
              <span className={item.difference > 0 ? 'text-red-600' : item.difference < 0 ? 'text-green-600' : 'text-gray-600'}>
                {item.rate}% ({item.difference > 0 ? '+' : ''}{item.difference}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${item.difference > 0 ? 'bg-red-600' : item.difference < 0 ? 'bg-green-600' : 'bg-blue-600'}`}
                style={{ width: `${item.rate}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Health Equity Dashboard Component
export default function HealthEquity() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [disparities, setDisparities] = useState<HealthDisparityData[]>([]);
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [resourceFilter, setResourceFilter] = useState<ResourceType | undefined>(undefined);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/health-equity');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      Promise.all([
        getHealthDisparities(),
        getCommunityResources(resourceFilter)
      ]).then(([disparityData, resourceData]) => {
        setDisparities(disparityData);
        setResources(resourceData);
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching health equity data:', error);
        setLoading(false);
      });
    }
  }, [resourceFilter, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Health Equity Dashboard</h1>
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  // Filter gaps based on selected filters
  const filteredGaps = equityGaps.filter(gap => {
    if (selectedRegion !== 'all' && gap.regionId !== selectedRegion) {
      return false;
    }
    if (selectedMetric !== 'all' && gap.metricId !== selectedMetric) {
      return false;
    }
    return true;
  });
  
  // Filter recommendations based on selected region
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedRegion !== 'all' && !rec.targetRegions.includes(selectedRegion)) {
      return false;
    }
    if (selectedMetric !== 'all' && !rec.targetMetrics.includes(selectedMetric)) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2">Health Equity Dashboard</h1>
          <p className="text-gray-600">
            Explore health disparities in your area and find accessible community resources to support your health journey.
          </p>
        </header>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select 
                className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="all">All Regions</option>
                {regionData.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Metric</label>
              <select 
                className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="all">All Health Metrics</option>
                {healthMetrics.map((metric) => (
                  <option key={metric.id} value={metric.id}>{metric.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Health Equity Gaps</h2>
            {filteredGaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGaps.slice(0, 6).map((gap) => (
                  <GapCard key={`${gap.regionId}-${gap.metricId}`} gap={gap} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No health equity gaps found for the selected filters</p>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Interventions</h2>
            {filteredRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecommendations.map((recommendation) => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No recommendations available for the selected filters</p>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Regional Health Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedRegion === 'all' ? regionData : regionData.filter(r => r.id === selectedRegion))
                .map((region) => (
                  <RegionStatistics key={region.id} region={region} />
                ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Sources & Methodology</h2>
            <p className="text-gray-600 mb-4">
              Our health equity data is compiled from multiple authoritative sources and analyzed using 
              standardized methodologies to identify healthcare disparities.
            </p>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-900">National Health Survey Data</h3>
                <p className="text-xs text-gray-600">
                  Comprehensive health surveys conducted across all regions, updated annually
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-900">Healthcare Facility Census</h3>
                <p className="text-xs text-gray-600">
                  Complete inventory of healthcare facilities, staff, and services
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-900">Demographic & Socioeconomic Data</h3>
                <p className="text-xs text-gray-600">
                  Population statistics integrated with economic indicators
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Reports</h2>
            <p className="text-gray-600 mb-4">
              Access detailed reports and raw data for further analysis, research, or implementation planning.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Complete Health Equity Analysis',
                  description: 'Comprehensive analysis of all metrics across all regions',
                  format: 'PDF Report',
                  size: '4.2 MB'
                },
                {
                  title: 'Regional Comparison Dataset',
                  description: 'Raw data tables for comparative analysis',
                  format: 'Excel/CSV',
                  size: '2.8 MB'
                },
                {
                  title: 'Intervention Impact Models',
                  description: 'Predictive models for various intervention strategies',
                  format: 'Interactive Dashboard',
                  size: 'Online Access'
                }
              ].map((report, index) => (
                <div key={index} className="flex justify-between items-center border border-gray-200 rounded-md p-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
                    <p className="text-xs text-gray-600">{report.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{report.format}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{report.size}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="mb-4 md:mb-0 md:mr-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Collaboration Portal</h2>
              <p className="mb-4">
                Connect with NGOs, government agencies, and healthcare providers working to improve health equity in your region. Share resources, coordinate efforts, and maximize impact.
              </p>
              <button className="px-4 py-2 bg-white text-emerald-600 rounded-md hover:bg-gray-100 transition-colors">
                Join Collaboration Network
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 