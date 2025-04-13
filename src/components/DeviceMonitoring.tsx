'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import { 
  HeartIcon, 
  BeakerIcon, 
  ArrowsUpDownIcon, 
  FireIcon, 
  ClockIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

// Types for device monitoring
type DeviceType = 'smartwatch' | 'glucometer' | 'blood_pressure' | 'pulse_oximeter' | 'thermometer' | 'fitness_tracker' | 'other';

type HealthDevice = {
  id: string;
  name: string;
  type: DeviceType;
  connected: boolean;
  lastSync?: number;
  battery?: number;
  thresholds?: {
    [key: string]: { min?: number; max?: number; unit: string }
  };
};

type VitalReading = {
  type: string;
  value: number | string;
  unit: string;
  timestamp: number;
  deviceId: string;
};

const DEFAULT_THRESHOLDS = {
  heartRate: { min: 40, max: 120, unit: 'bpm' },
  bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg' },
  bloodGlucose: { min: 70, max: 180, unit: 'mg/dL' },
  oxygenLevel: { min: 90, max: 100, unit: '%' },
  temperature: { min: 35, max: 38, unit: '°C' },
};

const MOCK_DEVICES: HealthDevice[] = [
  {
    id: 'watch-001',
    name: 'Apple Watch Series 7',
    type: 'smartwatch',
    connected: true,
    lastSync: Date.now() - 300000, // 5 minutes ago
    battery: 72,
    thresholds: {
      heartRate: { min: 45, max: 120, unit: 'bpm' },
      oxygenLevel: { min: 92, max: 100, unit: '%' }
    }
  },
  {
    id: 'glucometer-001',
    name: 'Accu-Check Guide',
    type: 'glucometer',
    connected: true,
    lastSync: Date.now() - 3600000, // 1 hour ago
    battery: 83,
    thresholds: {
      bloodGlucose: { min: 70, max: 180, unit: 'mg/dL' }
    }
  },
  {
    id: 'bp-monitor-001',
    name: 'Omron BP Monitor',
    type: 'blood_pressure',
    connected: false,
    lastSync: Date.now() - 86400000, // 1 day ago
    battery: 45,
    thresholds: {
      bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg' },
      bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg' }
    }
  }
];

const MOCK_READINGS: VitalReading[] = [
  {
    type: 'heartRate',
    value: 72,
    unit: 'bpm',
    timestamp: Date.now() - 60000, // 1 minute ago
    deviceId: 'watch-001'
  },
  {
    type: 'oxygenLevel',
    value: 98,
    unit: '%',
    timestamp: Date.now() - 3600000, // 1 hour ago
    deviceId: 'watch-001'
  },
  {
    type: 'bloodGlucose',
    value: 115,
    unit: 'mg/dL',
    timestamp: Date.now() - 7200000, // 2 hours ago
    deviceId: 'glucometer-001'
  },
  {
    type: 'bloodPressure',
    value: '128/84',
    unit: 'mmHg',
    timestamp: Date.now() - 86400000, // 1 day ago
    deviceId: 'bp-monitor-001'
  }
];

export default function DeviceMonitoring() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<HealthDevice[]>(MOCK_DEVICES);
  const [readings, setReadings] = useState<VitalReading[]>(MOCK_READINGS);
  const [selectedDevice, setSelectedDevice] = useState<HealthDevice | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<{ type: string; min: number; max: number; unit: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    const fetchDevicesAndReadings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, we would fetch from API
        // const response = await fetch(`/api/device-monitoring?userId=${session?.user?.id}`);
        // const data = await response.json();
        // setDevices(data.devices);
        // setReadings(data.readings);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch device data:', err);
        setError('Failed to load device data. Please try again.');
        setLoading(false);
      }
    };
    
    if (session?.user) {
      fetchDevicesAndReadings();
    }
  }, [session]);

  const handleDeviceSelect = (device: HealthDevice) => {
    setSelectedDevice(device);
  };

  const getLatestReading = (deviceId: string, type: string) => {
    return readings
      .filter(r => r.deviceId === deviceId && r.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'smartwatch':
        return <ClockIcon className="h-6 w-6" />;
      case 'glucometer':
        return <BeakerIcon className="h-6 w-6" />;
      case 'blood_pressure':
        return <ArrowsUpDownIcon className="h-6 w-6" />;
      case 'pulse_oximeter':
        return <HeartIcon className="h-6 w-6" />;
      case 'thermometer':
        return <FireIcon className="h-6 w-6" />;
      default:
        return <InformationCircleIcon className="h-6 w-6" />;
    }
  };

  const isReadingAlertable = (reading: VitalReading, device: HealthDevice) => {
    if (!device.thresholds) return false;
    
    const threshold = device.thresholds[reading.type];
    if (!threshold) return false;
    
    const value = typeof reading.value === 'string' 
      ? parseInt(reading.value.split('/')[0]) // For blood pressure, just check systolic for now
      : reading.value;
    
    return (threshold.min !== undefined && value < threshold.min) || 
           (threshold.max !== undefined && value > threshold.max);
  };

  const openThresholdModal = (type: string) => {
    const device = selectedDevice;
    
    if (!device) return;
    
    const currentThreshold = device.thresholds?.[type] || DEFAULT_THRESHOLDS[type as keyof typeof DEFAULT_THRESHOLDS];
    
    if (currentThreshold) {
      setEditingThreshold({
        type,
        min: currentThreshold.min || 0,
        max: currentThreshold.max || 999,
        unit: currentThreshold.unit
      });
      setIsAlertModalOpen(true);
    }
  };

  const saveThreshold = () => {
    if (!editingThreshold || !selectedDevice) return;
    
    // Create a copy of the devices array
    const updatedDevices = [...devices];
    const deviceIndex = updatedDevices.findIndex(d => d.id === selectedDevice.id);
    
    if (deviceIndex >= 0) {
      // Ensure thresholds object exists
      if (!updatedDevices[deviceIndex].thresholds) {
        updatedDevices[deviceIndex].thresholds = {};
      }
      
      // Update the specific threshold
      updatedDevices[deviceIndex].thresholds![editingThreshold.type] = {
        min: editingThreshold.min,
        max: editingThreshold.max,
        unit: editingThreshold.unit
      };
      
      // Update state and close modal
      setDevices(updatedDevices);
      setSelectedDevice(updatedDevices[deviceIndex]);
      setIsAlertModalOpen(false);
      setEditingThreshold(null);
      
      // In a real app, save to backend
      // saveDeviceSettings(updatedDevices[deviceIndex]);
    }
  };

  const formatThresholdLabel = (type: string) => {
    switch (type) {
      case 'heartRate': return 'Heart Rate';
      case 'bloodPressureSystolic': return 'Blood Pressure (Systolic)';
      case 'bloodPressureDiastolic': return 'Blood Pressure (Diastolic)';
      case 'bloodGlucose': return 'Blood Glucose';
      case 'oxygenLevel': return 'Oxygen Level';
      case 'temperature': return 'Body Temperature';
      default: return type;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Health Device Monitoring
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Devices List */}
            <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-700 pr-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Connected Devices
              </h3>
              
              <div className="space-y-3">
                {devices.map(device => (
                  <div 
                    key={device.id}
                    onClick={() => handleDeviceSelect(device)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                      selectedDevice?.id === device.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      device.connected ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${device.connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {device.connected ? 'Connected' : 'Disconnected'} 
                          {device.lastSync && ` • Last sync: ${formatTimeSince(device.lastSync)}`}
                        </p>
                      </div>
                    </div>
                    
                    {device.battery && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {device.battery}%
                      </div>
                    )}
                  </div>
                ))}
                
                <button className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  + Add New Device
                </button>
              </div>
            </div>
            
            {/* Device Details */}
            <div className="md:col-span-2">
              {selectedDevice ? (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {selectedDevice.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedDevice.type.replace('_', ' ')} • 
                        {selectedDevice.battery && ` Battery: ${selectedDevice.battery}% •`} 
                        Last sync: {selectedDevice.lastSync ? formatTimeSince(selectedDevice.lastSync) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                        Sync Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Latest Readings */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Latest Readings
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(selectedDevice.thresholds || {}).map(type => {
                        const reading = getLatestReading(selectedDevice.id, type);
                        return (
                          <div 
                            key={type}
                            className={`p-4 rounded-lg border ${
                              reading && isReadingAlertable(reading, selectedDevice)
                                ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex justify-between mb-1">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formatThresholdLabel(type)}
                              </h5>
                              <button 
                                onClick={() => openThresholdModal(type)}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Set Alert
                              </button>
                            </div>
                            
                            {reading ? (
                              <>
                                <div className="flex items-end gap-2">
                                  <span className={`text-2xl font-bold ${
                                    isReadingAlertable(reading, selectedDevice)
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {reading.value}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {reading.unit}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatTimeSince(reading.timestamp)}
                                </p>
                                
                                {isReadingAlertable(reading, selectedDevice) && (
                                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                                    <BellAlertIcon className="h-4 w-4 mr-1" />
                                    {typeof reading.value === 'number' && selectedDevice.thresholds?.[type] && (
                                      reading.value < (selectedDevice.thresholds[type].min || 0)
                                        ? 'Below normal range'
                                        : 'Above normal range'
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                No recent readings
                              </div>
                            )}
                            
                            {selectedDevice.thresholds?.[type] && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                <span>Min: {selectedDevice.thresholds[type].min} {selectedDevice.thresholds[type].unit}</span>
                                <span>Max: {selectedDevice.thresholds[type].max} {selectedDevice.thresholds[type].unit}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Alert Settings */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Alert Settings
                    </h4>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Select who will be notified when your vital signs are outside normal ranges:
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            id="notify-me" 
                            type="checkbox" 
                            checked={true}
                            readOnly
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="notify-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            Notify me
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="notify-doctor" 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="notify-doctor" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            Notify my doctor
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="notify-emergency" 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="notify-emergency" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            Notify emergency contact
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            id="auto-emergency" 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="auto-emergency" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                            Automatically trigger emergency alert for critical values
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                    <InformationCircleIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select a Device
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                    Choose a device from the list to view its latest readings and adjust alert settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Threshold Setting Modal */}
      {isAlertModalOpen && editingThreshold && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Set Alert Thresholds for {formatThresholdLabel(editingThreshold.type)}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Value ({editingThreshold.unit})
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setEditingThreshold({...editingThreshold, min: editingThreshold.min - 1})}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600"
                    >
                      <MinusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <input
                      type="number"
                      value={editingThreshold.min}
                      onChange={(e) => setEditingThreshold({...editingThreshold, min: parseInt(e.target.value)})}
                      className="flex-1 p-2 border-t border-b border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-center dark:bg-gray-700 dark:text-white"
                    />
                    <button 
                      onClick={() => setEditingThreshold({...editingThreshold, min: editingThreshold.min + 1})}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Value ({editingThreshold.unit})
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setEditingThreshold({...editingThreshold, max: editingThreshold.max - 1})}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600"
                    >
                      <MinusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <input
                      type="number"
                      value={editingThreshold.max}
                      onChange={(e) => setEditingThreshold({...editingThreshold, max: parseInt(e.target.value)})}
                      className="flex-1 p-2 border-t border-b border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-center dark:bg-gray-700 dark:text-white"
                    />
                    <button 
                      onClick={() => setEditingThreshold({...editingThreshold, max: editingThreshold.max + 1})}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600"
                    >
                      <PlusIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAlertModalOpen(false);
                    setEditingThreshold(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveThreshold}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Thresholds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 