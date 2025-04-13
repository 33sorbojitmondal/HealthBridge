'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chart.js/auto';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Types
interface Symptom {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface SymptomLog {
  id: string;
  symptomId: string;
  userId: string;
  severity: number; // 1-10
  timestamp: string;
  notes: string;
  triggers?: string[];
  duration?: number; // in minutes
}

// Mock data
const mockSymptoms: Symptom[] = [
  { id: '1', name: 'Headache', description: 'Pain in the head or upper neck', category: 'Pain' },
  { id: '2', name: 'Nausea', description: 'Feeling of sickness with an inclination to vomit', category: 'Digestive' },
  { id: '3', name: 'Fatigue', description: 'Extreme tiredness resulting from mental or physical exertion', category: 'Energy' },
  { id: '4', name: 'Joint Pain', description: 'Discomfort, pain or inflammation from a joint', category: 'Pain' },
  { id: '5', name: 'Shortness of Breath', description: 'Difficulty breathing or painful breathing', category: 'Respiratory' },
  { id: '6', name: 'Dizziness', description: 'Feeling faint, woozy, or unsteady', category: 'Neurological' },
  { id: '7', name: 'Chest Pain', description: 'Pressure or pain in the chest', category: 'Pain' },
  { id: '8', name: 'Anxiety', description: 'Feeling of worry, nervousness, or unease', category: 'Mental Health' },
];

// Generate 30 days of symptom logs for demo purposes
const generateMockLogs = (): SymptomLog[] => {
  const logs: SymptomLog[] = [];
  const now = new Date();
  const userId = 'user123';
  const commonTriggers = ['Stress', 'Lack of Sleep', 'Poor Diet', 'Weather Change', 'Exercise', 'Alcohol'];
  
  // Generate logs for each symptom
  mockSymptoms.forEach(symptom => {
    // Generate between 5-15 logs per symptom
    const count = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < count; i++) {
      // Random day within the last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - daysAgo);
      
      // Random severity between 1-10
      const severity = Math.floor(Math.random() * 10) + 1;
      
      // Random triggers (0-3)
      const triggerCount = Math.floor(Math.random() * 3);
      const triggers: string[] = [];
      for (let j = 0; j < triggerCount; j++) {
        const trigger = commonTriggers[Math.floor(Math.random() * commonTriggers.length)];
        if (!triggers.includes(trigger)) {
          triggers.push(trigger);
        }
      }
      
      // Random duration
      const duration = Math.floor(Math.random() * 180) + 10; // 10-190 minutes
      
      logs.push({
        id: `log-${symptom.id}-${i}`,
        symptomId: symptom.id,
        userId,
        severity,
        timestamp: logDate.toISOString(),
        notes: `Episode ${i+1} of ${symptom.name}`,
        triggers,
        duration
      });
    }
  });
  
  // Sort by timestamp
  return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Mock API functions
async function getUserSymptoms(): Promise<Symptom[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSymptoms;
}

async function getUserSymptomLogs(): Promise<SymptomLog[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return generateMockLogs();
}

async function logSymptom(log: Omit<SymptomLog, 'id'>): Promise<SymptomLog> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    ...log,
    id: `log-${Date.now()}`
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const SymptomMonitoringPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [severity, setSeverity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [triggers, setTriggers] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [insights, setInsights] = useState<string>('');

  const isLoading = status === 'loading';
  const isAuthenticated = !!session;

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [symptomsData, logsData] = await Promise.all([
        getUserSymptoms(),
        getUserSymptomLogs()
      ]);
      setSymptoms(symptomsData);
      setLogs(logsData);
      
      // Set default selected symptom
      if (symptomsData.length > 0 && !selectedSymptom) {
        setSelectedSymptom(symptomsData[0].id);
      }
      
      // Generate insights
      generateInsights(logsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSymptom) return;
    
    setSubmitting(true);
    try {
      const newLog: Omit<SymptomLog, 'id'> = {
        symptomId: selectedSymptom,
        userId: session?.user?.id || 'user123',
        severity,
        timestamp: new Date().toISOString(),
        notes,
        triggers: triggers.split(',').map(t => t.trim()).filter(t => t),
        duration
      };
      
      const savedLog = await logSymptom(newLog);
      setLogs(prevLogs => [...prevLogs, savedLog]);
      
      // Reset form
      setNotes('');
      setTriggers('');
      setDuration(30);
      setSeverity(5);
      
      // Regenerate insights
      generateInsights([...logs, savedLog]);
    } catch (error) {
      console.error('Error logging symptom:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const generateInsights = (logData: SymptomLog[]) => {
    if (logData.length < 3) {
      setInsights('Log more symptoms to see insights about your patterns.');
      return;
    }

    // Group logs by symptom
    const symptomGroups: Record<string, SymptomLog[]> = {};
    logData.forEach(log => {
      if (!symptomGroups[log.symptomId]) {
        symptomGroups[log.symptomId] = [];
      }
      symptomGroups[log.symptomId].push(log);
    });

    // Generate simple insights
    const insightsList: string[] = [];

    // Find most frequent symptom
    let maxCount = 0;
    let mostFrequentSymptomId = '';
    
    Object.entries(symptomGroups).forEach(([symptomId, logs]) => {
      if (logs.length > maxCount) {
        maxCount = logs.length;
        mostFrequentSymptomId = symptomId;
      }
    });
    
    if (mostFrequentSymptomId) {
      const symptom = symptoms.find(s => s.id === mostFrequentSymptomId);
      if (symptom) {
        insightsList.push(`Your most frequent symptom is ${symptom.name} (${maxCount} occurrences).`);
      }
    }

    // Find common triggers
    const allTriggers: Record<string, number> = {};
    logData.forEach(log => {
      log.triggers?.forEach(trigger => {
        allTriggers[trigger] = (allTriggers[trigger] || 0) + 1;
      });
    });
    
    const sortedTriggers = Object.entries(allTriggers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    if (sortedTriggers.length > 0) {
      insightsList.push(`Your most common triggers are: ${sortedTriggers.map(([trigger, count]) => `${trigger} (${count})`).join(', ')}.`);
    }

    // Average severity by symptom
    Object.entries(symptomGroups).forEach(([symptomId, logs]) => {
      const symptom = symptoms.find(s => s.id === symptomId);
      if (symptom && logs.length >= 3) {
        const avgSeverity = logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
        insightsList.push(`Your ${symptom.name} has an average severity of ${avgSeverity.toFixed(1)}/10.`);
      }
    });

    setInsights(insightsList.join(' '));
  };

  const getChartData = () => {
    if (!selectedSymptom) return null;
    
    const symptomLogs = logs.filter(log => log.symptomId === selectedSymptom);
    
    // Sort by date
    symptomLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return {
      labels: symptomLogs.map(log => formatDate(log.timestamp)),
      datasets: [
        {
          label: 'Severity',
          data: symptomLogs.map(log => log.severity),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.2
        }
      ]
    };
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Severity'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-center mb-6">
          You need to be signed in to access the symptom monitoring feature.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Symptom Pattern Monitoring</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptom Form */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Log a Symptom</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Symptom</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedSymptom}
                onChange={e => setSelectedSymptom(e.target.value)}
                required
              >
                <option value="">Select a symptom</option>
                {symptoms.map(symptom => (
                  <option key={symptom.id} value={symptom.id}>
                    {symptom.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity: {severity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={e => setSeverity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Triggers (comma separated)
              </label>
              <input
                type="text"
                value={triggers}
                onChange={e => setTriggers(e.target.value)}
                placeholder="Stress, Lack of Sleep, etc."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting || !selectedSymptom}
              className={`w-full py-2 px-4 rounded-md ${
                submitting || !selectedSymptom
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {submitting ? 'Saving...' : 'Log Symptom'}
            </button>
          </form>
        </div>
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Symptom Severity Over Time</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Symptom</label>
            <select
              className="p-2 border border-gray-300 rounded-md"
              value={selectedSymptom}
              onChange={e => setSelectedSymptom(e.target.value)}
            >
              <option value="">Select a symptom</option>
              {symptoms.map(symptom => (
                <option key={symptom.id} value={symptom.id}>
                  {symptom.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedSymptom && logs.some(log => log.symptomId === selectedSymptom) ? (
            <div className="h-80">
              <Line data={getChartData() as any} options={chartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-md">
              <p className="text-gray-500">
                {selectedSymptom ? 'No data available for this symptom yet.' : 'Please select a symptom to view data.'}
              </p>
            </div>
          )}
          
          {/* Insights */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Insights</h3>
            <p>{insights || 'Log more symptoms to see patterns and insights.'}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Logs */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Symptom Logs</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triggers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10)
                .map(log => {
                  const symptom = symptoms.find(s => s.id === log.symptomId);
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {symptom?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.severity}/10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.triggers?.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          
          {logs.length === 0 && (
            <p className="text-center py-4 text-gray-500">No symptom logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return <SymptomMonitoringPage />;
} 