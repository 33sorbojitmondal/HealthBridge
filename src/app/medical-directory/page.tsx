'use client';

import { useState } from 'react';
import { medicalFacilities, filterFacilities, type MedicalFacility } from '@/lib/data/medical-facilities';

export default function MedicalDirectory() {
  const [facilityType, setFacilityType] = useState<string>('all');
  const [governmentOnly, setGovernmentOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredFacilities, setFilteredFacilities] = useState<MedicalFacility[]>(medicalFacilities);

  const handleSearch = () => {
    const results = filterFacilities(
      facilityType === 'all' ? undefined : facilityType,
      governmentOnly,
      searchQuery
    );
    setFilteredFacilities(results);
  };

  const resetFilters = () => {
    setFacilityType('all');
    setGovernmentOnly(false);
    setSearchQuery('');
    setFilteredFacilities(medicalFacilities);
  };

  // Get facility type icon
  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'clinic':
        return '👨‍⚕️';
      case 'pharmacy':
        return '💊';
      case 'laboratory':
        return '🔬';
      case 'ambulance':
        return '🚑';
      default:
        return '🏥';
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-4">Medical Directory</h1>
          <p className="text-gray-600 mb-8">
            Find hospitals, clinics, pharmacies, laboratories, and ambulance services in your area.
          </p>

          {/* Search and Filter Section */}
          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Search & Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Facility Type
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value)}
                >
                  <option value="all">All Facilities</option>
                  <option value="hospital">Hospitals</option>
                  <option value="clinic">Clinics</option>
                  <option value="pharmacy">Pharmacies</option>
                  <option value="laboratory">Laboratories</option>
                  <option value="ambulance">Ambulance Services</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Search by Name, Address, or Service
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Emergency Care, Main Street..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <div className="mr-4">
                  <label className="flex items-center text-gray-700 text-sm font-medium">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-purple-600 rounded mr-2"
                      checked={governmentOnly}
                      onChange={(e) => setGovernmentOnly(e.target.checked)}
                    />
                    Government Supported Only
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={handleSearch}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
              >
                Search
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
              {filteredFacilities.length} {filteredFacilities.length === 1 ? 'Facility' : 'Facilities'} Found
            </h2>
            
            {filteredFacilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFacilities.map(facility => (
                  <div key={facility.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between bg-gray-50 p-4 border-b">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFacilityIcon(facility.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold">{facility.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{facility.type}</p>
                        </div>
                      </div>
                      {facility.governmentSupported && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Government Supported
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Address:</span> {facility.address}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Phone:</span> {facility.phone}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">Hours:</span> {facility.openingHours}
                      </p>
                      
                      {facility.description && (
                        <p className="text-gray-600 mb-4 italic">
                          {facility.description}
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">Services:</h4>
                        <div className="flex flex-wrap gap-2">
                          {facility.services.map((service, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between">
                        <a 
                          href={`tel:${facility.phone}`}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md inline-flex items-center"
                        >
                          <span>Call</span>
                        </a>
                        <a 
                          href={`https://maps.google.com/?q=${facility.location.latitude},${facility.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-md inline-flex items-center"
                        >
                          <span>View on Map</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-2">No facilities match your search criteria.</p>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 