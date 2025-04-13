'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'emergency' | 'warning' | 'info';
  date: string;
  region?: string;
  contact?: string;
  source?: string;
  link?: string;
}

export default function HealthAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      const mockAlerts: Alert[] = [
        {
          id: '1',
          title: 'COVID-19 Vaccination Clinic',
          description: 'Free COVID-19 vaccinations available at Central Community Center this weekend. No appointment necessary.',
          type: 'info',
          date: '2023-04-15',
          region: 'Downtown',
          contact: 'Phone: +1-800-555-1234',
          source: 'Department of Health',
          link: 'https://example.com/covid-clinic'
        },
        {
          id: '2',
          title: 'Measles Outbreak in West District',
          description: 'Several cases of measles have been reported in West District schools. Please ensure your children are vaccinated and watch for symptoms including rash, fever, and cough.',
          type: 'warning',
          date: '2023-04-12',
          region: 'West District',
          contact: '+1-800-555-5678',
          source: 'Center for Disease Control'
        },
        {
          id: '3',
          title: 'Heat Wave Advisory',
          description: 'Extreme temperatures expected over the next week. Stay hydrated and limit outdoor activities between 10am and 4pm.',
          type: 'warning',
          date: '2023-04-10',
          region: 'Citywide',
          contact: 'Emergency: +1-800-555-9101',
          source: 'National Weather Service'
        },
        {
          id: '4',
          title: 'Food Recall: Golden Brand Peanut Butter',
          description: 'Golden Brand Peanut Butter 16oz jars with expiration dates between May 1, 2023 and August 1, 2023 have been recalled due to potential Salmonella contamination.',
          type: 'emergency',
          date: '2023-04-08',
          region: 'National',
          contact: 'Consumer Hotline: +1-800-555-7890',
          source: 'Food Safety Authority',
          link: 'https://example.com/peanut-recall'
        },
        {
          id: '5',
          title: 'Free Health Screening Event',
          description: 'Get free blood pressure, cholesterol, and diabetes screenings at the Community Health Fair on April 20.',
          type: 'info',
          date: '2023-04-05',
          region: 'South Side',
          contact: '+1-800-555-4321',
          source: 'Community Health Network'
        },
        {
          id: '6',
          title: 'Seasonal Flu Update',
          description: 'Flu cases rising earlier than expected this season. Flu shots are now available at all major pharmacies and health clinics.',
          type: 'info',
          date: '2023-04-01',
          region: 'Citywide',
          source: 'Department of Health'
        }
      ];
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let results = alerts;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(alert => 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      results = results.filter(alert => alert.type === filterType);
    }
    
    setFilteredAlerts(results);
  }, [searchTerm, filterType, alerts]);

  const getAlertTypeStyles = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getAlertBadgeStyles = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-600 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  // Function to safely extract phone number from contact string
  const getPhoneNumber = (contact: string) => {
    if (!contact) return null;
    
    // If the contact string contains a colon, try to extract the part after it
    if (contact.includes(':')) {
      const parts = contact.split(':');
      // Make sure there's actually a second part after splitting before trying to trim
      return parts.length > 1 && parts[1] ? parts[1].trim() : null;
    } 
    
    // If it's just a phone number without label
    return contact.trim();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Health Alerts</h1>
        <p className="text-gray-600">Stay informed about important health alerts and announcements in your area.</p>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search alerts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button 
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <select
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="emergency">Emergency</option>
              <option value="warning">Warning</option>
              <option value="info">Information</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="space-y-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading health alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No alerts found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`border-l-4 rounded-lg shadow-md overflow-hidden animate-fadeIn ${getAlertTypeStyles(alert.type)}`}
              style={{ animationDelay: `${parseInt(alert.id) * 100}ms` }}
            >
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getAlertBadgeStyles(alert.type)}`}>
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </span>
                  {alert.region && (
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                      {alert.region}
                    </span>
                  )}
                  <span className="text-xs text-gray-600 ml-auto">
                    {new Date(alert.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{alert.title}</h3>
                <p className="text-gray-700 mb-4">{alert.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {alert.source && (
                    <span className="text-gray-600">
                      <strong>Source:</strong> {alert.source}
                    </span>
                  )}
                  {alert.link && (
                    <a 
                      href={alert.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      More information
                    </a>
                  )}
                </div>
                {alert.contact && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {alert.contact.includes('+') && (
                      <a 
                        href={`tel:${getPhoneNumber(alert.contact) || ''}`}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md inline-flex items-center"
                      >
                        <span>Call</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Subscription Box */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl overflow-hidden shadow-lg animate-fadeIn" style={{ animationDelay: '600ms' }}>
        <div className="p-6 md:p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Stay Updated</h2>
          <p className="mb-6 text-blue-100">Receive health alerts directly via email or SMS. We'll only notify you about alerts in your region.</p>
          <form className="space-y-4 md:space-y-0 md:flex md:gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full md:flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" className="w-full md:w-auto whitespace-nowrap px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-300 btn-animated">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm text-blue-200">You can unsubscribe anytime. We respect your privacy.</p>
        </div>
      </div>
    </div>
  );
} 