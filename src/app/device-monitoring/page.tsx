'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeviceMonitoring from '@/components/DeviceMonitoring';
import EmergencyVoiceTrigger from '@/components/EmergencyVoiceTrigger';

export default function DeviceMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // If not authenticated, redirect to login
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/device-monitoring');
    return null;
  }

  // Loading state
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading device monitoring...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Device Monitoring</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Connect, monitor, and configure your health devices for real-time vitals tracking and automated alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <DeviceMonitoring />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Emergency Voice Trigger */}
          <EmergencyVoiceTrigger />

          {/* Information Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              About Device Monitoring
            </h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p>
                Your connected health devices automatically sync vital signs data to AI HealthBridge for monitoring and analysis.
              </p>
              <p>
                Set personalized thresholds to receive alerts when your vitals reach concerning levels, and choose who gets notified.
              </p>
              <p>
                In critical situations, AI HealthBridge can automatically trigger emergency protocols based on your preferences.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm p-6">
            <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
              Compatible Devices
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
              <li>Apple Watch (Series 4 and newer)</li>
              <li>Fitbit (Sense, Versa 3, Charge 5)</li>
              <li>Samsung Galaxy Watch (3, 4, 5)</li>
              <li>Omron Blood Pressure Monitors</li>
              <li>Dexcom G6, Freestyle Libre</li>
              <li>Withings Devices</li>
              <li>And more...</li>
            </ul>
            <div className="mt-4">
              <button className="w-full text-center text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                View all compatible devices →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 