'use client';

import { useState } from 'react';
import Image from 'next/image';
import { healthAlerts, filterAlerts, type HealthAlert } from '@/lib/data/health-alerts';

export default function HealthAlerts() {
  const [alertType, setAlertType] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [urgency, setUrgency] = useState<string>('all');
  const [filteredAlerts, setFilteredAlerts] = useState<HealthAlert[]>(
    // Initialize with alerts sorted by date
    [...healthAlerts].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  );

  const handleSearch = () => {
    const results = filterAlerts(
      alertType === 'all' ? undefined : alertType,
      region === 'all' ? undefined : region,
      urgency === 'all' ? undefined : urgency
    );
    setFilteredAlerts(results);
  };

  const resetFilters = () => {
    setAlertType('all');
    setRegion('all');
    setUrgency('all');
    setFilteredAlerts(
      [...healthAlerts].sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    );
  };

  // Get all available regions from health alerts
  const regions = Array.from(
    new Set(healthAlerts.map(alert => alert.region))
  ).sort();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get alert type display name
  const getAlertTypeDisplay = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'Vaccination Drive';
      case 'disease_outbreak':
        return 'Disease Outbreak';
      case 'health_camp':
        return 'Health Camp';
      case 'awareness_campaign':
        return 'Awareness Campaign';
      default:
        return type.replace('_', ' ');
    }
  };

  // Get urgency badge color
  const getUrgencyBadgeClass = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get alert type badge color
  const getAlertTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'disease_outbreak':
        return 'bg-red-100 text-red-800';
      case 'health_camp':
        return 'bg-green-100 text-green-800';
      case 'awareness_campaign':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-yellow-600 mb-4">Health Alerts</h1>
          <p className="text-gray-600 mb-8">
            Stay informed about health campaigns, disease outbreaks, vaccination drives, and other health initiatives in your area.
          </p>

          {/* Search and Filter Section */}
          <div className="bg-yellow-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-yellow-700 mb-4">Filter Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Alert Type
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="vaccination">Vaccination Drives</option>
                  <option value="disease_outbreak">Disease Outbreaks</option>
                  <option value="health_camp">Health Camps</option>
                  <option value="awareness_campaign">Awareness Campaigns</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Region
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Urgency Level
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <option value="all">All Urgency Levels</option>
                  <option value="high">High Urgency</option>
                  <option value="medium">Medium Urgency</option>
                  <option value="low">Low Urgency</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={handleSearch}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md"
              >
                Apply Filters
              </button>
              <button 
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-md text-gray-700"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? 'Alert' : 'Alerts'} Found
            </h2>
            
            {filteredAlerts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    {alert.imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image 
                          src={alert.imageUrl} 
                          alt={alert.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeBadgeClass(alert.type)}`}>
                          {getAlertTypeDisplay(alert.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyBadgeClass(alert.urgency)}`}>
                          {alert.urgency.charAt(0).toUpperCase() + alert.urgency.slice(1)} Urgency
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                      
                      <p className="text-gray-600 mb-4">
                        {alert.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Region:</span> {alert.region}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {formatDate(alert.startDate)}
                          {alert.endDate && ` to ${formatDate(alert.endDate)}`}
                        </p>
                        {alert.location && (
                          <p>
                            <span className="font-medium">Location:</span> {alert.location}
                          </p>
                        )}
                        {alert.contact && (
                          <p>
                            <span className="font-medium">Contact:</span> {alert.contact}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        {alert.contact && alert.contact.includes('+') && (
                          <a 
                            href={`tel:${alert.contact.split(':')[1].trim()}`}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md inline-flex items-center"
                          >
                            <span>Call</span>
                          </a>
                        )}
                        <button 
                          className="px-4 py-2 border border-yellow-600 text-yellow-600 hover:bg-yellow-50 rounded-md inline-flex items-center"
                        >
                          <span>Share Alert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-2">No health alerts match your filter criteria.</p>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div>
                  <p className="font-medium text-blue-800">Stay Informed</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Enable notifications to receive timely updates about health alerts in your area.
                    Your health and safety are important to us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 