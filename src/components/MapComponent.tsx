'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Doctor } from '@/utils/doctor-utils';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issues
const fixLeafletIcons = () => {
  // @ts-ignore - Known issue with Leaflet typings
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Default center location (New York City)
const DEFAULT_CENTER: [number, number] = [40.7128, -74.0060];

interface MapComponentProps {
  center?: [number, number]; // Make optional with default in component
  zoom?: number; // Make optional with default in component
  doctors: Doctor[];
  userLocation: [number, number] | null;
  onDoctorSelect: (doctor: Doctor) => void;
  selectedDoctor?: Doctor | null; // Make optional for compatibility
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  center: propCenter,
  zoom: propZoom = 13, // Default zoom if not provided 
  doctors = [], // Default to empty array if not provided
  userLocation, 
  onDoctorSelect,
  selectedDoctor 
}) => {
  // Always declare hooks at the top level
  const [mapInitialized, setMapInitialized] = useState(false);
  const [icons, setIcons] = useState<{blue: L.Icon, red: L.Icon} | null>(null);
  
  // Use userLocation as center if propCenter not provided
  const center = useMemo(() => {
    if (propCenter) return propCenter;
    if (userLocation) return userLocation;
    return DEFAULT_CENTER;
  }, [propCenter, userLocation]);
  
  // Initialize Leaflet once on component mount
  useEffect(() => {
    // Initialize Leaflet icons only on the client side
    fixLeafletIcons();
    
    // Create icons in useEffect to ensure client-side only execution
    const blueIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    setIcons({ blue: blueIcon, red: redIcon });
    setMapInitialized(true);
  }, []);

  // If no icons haven't been initialized, show loading state
  // IMPORTANT: Don't conditionally render based on userLocation - this causes the hooks error
  if (!icons) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={propZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker - conditionally render the marker, not the whole component */}
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={icons.blue}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Doctor markers */}
        {doctors && doctors.map((doctor) => (
          <Marker
            key={doctor.id}
            position={[doctor.location.lat, doctor.location.lng]}
            icon={icons.red}
            eventHandlers={{
              click: () => {
                onDoctorSelect(doctor);
              },
            }}
          >
            <Popup>
              <div className="text-center p-2">
                <h3 className="font-bold">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                <button 
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => onDoctorSelect(doctor)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 