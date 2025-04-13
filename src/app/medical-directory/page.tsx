'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { type Doctor, type Specialty, getDoctorsNearLocation } from '@/utils/doctor-utils';

// Dynamically import Leaflet Map with no SSR
// This approach prevents any Leaflet code from running during SSR
const MapComponent = dynamic(
  () => import('@/components/MapComponent').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map and locating you...</p>
        </div>
      </div>
    )
  }
);

export default function MedicalDirectory() {
  // Always declare all state hooks at the top level
  const [center, setCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [zoom, setZoom] = useState(13);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [specialty, setSpecialty] = useState<Specialty | ''>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Specialties for the filter dropdown
  const specialties: Specialty[] = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'General Practice',
    'Gynecology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Surgery',
    'Urology',
    'Other'
  ];

  // Function to fetch doctors data
  const fetchDoctors = async (lat: number, lng: number, radius: number, specialty?: Specialty) => {
    setLoading(true);
    try {
      const results = await getDoctorsNearLocation(lat, lng, radius, specialty);
      setDoctors(results);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user's location on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMapReady(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setLoadingLocation(false);
            fetchDoctors(latitude, longitude, searchRadius, specialty || undefined);
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to NYC if location access is denied
            setUserLocation([40.7128, -74.0060]);
            setLoadingLocation(false);
            fetchDoctors(40.7128, -74.0060, searchRadius, specialty || undefined);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        setUserLocation([40.7128, -74.0060]);
        setLoadingLocation(false);
        fetchDoctors(40.7128, -74.0060, searchRadius, specialty || undefined);
      }
    }
  }, []);

  // Fetch doctors when filters change
  useEffect(() => {
    if (userLocation) {
      fetchDoctors(userLocation[0], userLocation[1], searchRadius, specialty || undefined);
    } else if (center) {
      fetchDoctors(center[0], center[1], searchRadius, specialty || undefined);
    }
  }, [searchRadius, specialty, userLocation, center]);

  // Generate star rating display
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Find Healthcare Providers</h1>
          <p className="text-gray-600 mb-6">
            Locate doctors and specialists near you with our interactive map
          </p>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-auto">
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as Specialty | '')}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius (km)
              </label>
              <select
                id="radius"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
            {mapReady && (
              <MapComponent
                center={userLocation || center}
                zoom={zoom}
                doctors={doctors}
                userLocation={userLocation}
                onDoctorSelect={setSelectedDoctor}
              />
            )}
          </div>
          
          {/* Doctor List/Details Section */}
          <div className="md:col-span-1">
            {selectedDoctor ? (
              // Doctor details
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-blue-800">{selectedDoctor.name}</h2>
                  <button 
                    onClick={() => setSelectedDoctor(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedDoctor.image && (
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={selectedDoctor.image} 
                      alt={selectedDoctor.name} 
                      className="w-32 h-32 rounded-full object-cover border-2 border-blue-200"
                    />
                  </div>
                )}
                
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center space-x-1 text-lg mb-1">
                    {renderStars(selectedDoctor.averageRating)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor.averageRating.toFixed(1)} ({selectedDoctor.totalRatings} ratings)
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-800">
                    <span className="font-semibold">Specialty:</span> {selectedDoctor.specialty}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Experience:</span> {selectedDoctor.experience} years
                  </p>
                  {selectedDoctor.hospital && (
                    <p className="text-gray-800">
                      <span className="font-semibold">Hospital:</span> {selectedDoctor.hospital}
                    </p>
                  )}
                  <p className="text-gray-800">
                    <span className="font-semibold">Address:</span> {selectedDoctor.address}
                  </p>
                  {selectedDoctor.contact.phone && (
                    <p className="text-gray-800">
                      <span className="font-semibold">Phone:</span> {selectedDoctor.contact.phone}
                    </p>
                  )}
                  <p className="text-gray-800">
                    <span className="font-semibold">Languages:</span> {selectedDoctor.languages.join(', ')}
                  </p>
                  {selectedDoctor.availability && (
                    <div>
                      <p className="text-gray-800 font-semibold">Availability:</p>
                      <p className="text-gray-700">
                        {selectedDoctor.availability.days.join(', ')}
                        <br />
                        {selectedDoctor.availability.hours}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-800">
                    <span className="font-semibold">Accepting New Patients:</span> {selectedDoctor.acceptingNewPatients ? 'Yes' : 'No'}
                  </p>
                </div>

                {selectedDoctor.aiEvaluation && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">AI HealthBridge Evaluation</h3>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${selectedDoctor.aiEvaluation.score}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {selectedDoctor.aiEvaluation.score}/100
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Strengths:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {selectedDoctor.aiEvaluation.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {selectedDoctor.aiEvaluation.areas_for_improvement && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Areas for improvement:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedDoctor.aiEvaluation.areas_for_improvement.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {selectedDoctor.aiEvaluation.last_updated.toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200">
                    Book Appointment
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 py-2 px-4 rounded-md transition duration-200">
                    Save to Favorites
                  </button>
                </div>
              </div>
            ) : (
              // Doctor list
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                  <h3 className="font-bold text-blue-800">
                    {loading 
                      ? 'Searching for doctors...' 
                      : `Found ${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}`
                    }
                  </h3>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching for healthcare providers...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                    {doctors.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No doctors found matching your criteria. Try expanding your search radius or changing the specialty.
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <div 
                          key={doctor.id} 
                          className="p-4 hover:bg-blue-50 cursor-pointer transition duration-150"
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <div className="flex items-start">
                            {doctor.image && (
                              <img 
                                src={doctor.image} 
                                alt={doctor.name} 
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                              <div className="flex items-center mt-1">
                                <div className="flex text-yellow-400 text-sm">
                                  {renderStars(doctor.averageRating)}
                                </div>
                                <span className="ml-1 text-xs text-gray-500">
                                  ({doctor.totalRatings})
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div className={`font-medium ${doctor.acceptingNewPatients ? 'text-green-600' : 'text-red-600'}`}>
                                {doctor.acceptingNewPatients ? 'Accepting patients' : 'Not accepting patients'}
                              </div>
                              {doctor.consultationFee && (
                                <div className="mt-1">
                                  ${doctor.consultationFee}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 