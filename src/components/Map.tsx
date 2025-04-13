'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Doctor } from '@/utils/doctor-utils';

interface MapProps {
  center: [number, number];
  zoom: number;
  doctors: Doctor[];
  userLocation: [number, number] | null;
  blueIcon: Icon;
  redIcon: Icon;
  onDoctorSelect: (doctor: Doctor) => void;
}

const Map: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  doctors, 
  userLocation, 
  blueIcon, 
  redIcon, 
  onDoctorSelect 
}) => {
  // Always declare hooks at the top level, even if some props are null
  const [mapReady, setMapReady] = useState(false);
  
  // Always run all hooks regardless of prop values
  useEffect(() => {
    // Set map as ready after component mounts
    setMapReady(true);
  }, []);

  // Conditionally render different content, but always call hooks in the same order
  if (!userLocation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map and locating you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={blueIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Doctor markers */}
        {doctors.map((doctor) => (
          <Marker
            key={doctor.id}
            position={[doctor.location.lat, doctor.location.lng]}
            icon={redIcon}
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

export default Map; 