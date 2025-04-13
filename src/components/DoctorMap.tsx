"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Doctor } from '@/lib/doctor-services';

// Fix for Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom doctor marker icon
const doctorIcon = new L.Icon({
  iconUrl: '/doctor-marker.png', // This will need to be created/added to the public folder
  iconRetinaUrl: '/doctor-marker-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Fallback to standard marker if custom icon fails to load
const fallbackIcon = new L.Icon.Default();

interface DoctorMapProps {
  userLocation: [number, number];
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onDoctorSelect: (doctor: Doctor) => void;
}

export default function DoctorMap({ 
  userLocation, 
  doctors, 
  selectedDoctor, 
  onDoctorSelect 
}: DoctorMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current && typeof window !== 'undefined') {
      // Create map instance
      const map = L.map('doctor-map').setView(userLocation, 13);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker with a blue circle
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="bg-blue-500 rounded-full p-2 border-2 border-white"><div class="h-2 w-2 bg-white rounded-full"></div></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(map);
      
      // Add circle around user location
      L.circle(userLocation, {
        color: '#3b82f6',
        fillColor: '#3b82f680',
        fillOpacity: 0.2,
        radius: 500, // 500m radius
      }).addTo(map);
      
      userMarkerRef.current = userMarker;
      mapRef.current = map;
      setMapInitialized(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, [userLocation]);

  // Update markers when doctors or selected doctor changes
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;
    
    const map = mapRef.current;
    const currentMarkers = { ...markersRef.current };
    
    // Remove markers that are no longer in the doctors list
    Object.keys(currentMarkers).forEach(id => {
      if (!doctors.find(d => d.id === id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });
    
    // Add or update markers for doctors
    doctors.forEach(doctor => {
      const doctorLocation: [number, number] = [
        userLocation[0] + (Math.random() * 0.01 - 0.005), // Random offset for demo
        userLocation[1] + (Math.random() * 0.01 - 0.005)  // Random offset for demo
      ];
      
      // In a real app, doctor.location would be used instead of random offsets
      
      // Create or update marker
      if (!currentMarkers[doctor.id]) {
        try {
          // Try to use custom doctor icon
          const marker = L.marker(doctorLocation, { icon: doctorIcon })
            .addTo(map)
            .on('click', () => onDoctorSelect(doctor));
            
          // Add popup with doctor info
          marker.bindPopup(`
            <div class="doctor-popup">
              <h3 class="font-semibold text-lg">${doctor.name}</h3>
              <p class="text-sm text-gray-600">${doctor.specialty}</p>
              <p class="text-xs mt-1">${doctor.distanceKm.toFixed(1)} km away</p>
              ${doctor.availability.hasAvailability ? 
                `<p class="text-xs text-green-600 mt-1">Available: ${doctor.availability.nextAvailable}</p>` : 
                '<p class="text-xs text-gray-500 mt-1">No availability</p>'
              }
            </div>
          `);
          
          currentMarkers[doctor.id] = marker;
        } catch (error) {
          // Fallback to default marker if custom icon fails
          const marker = L.marker(doctorLocation, { icon: fallbackIcon })
            .addTo(map)
            .on('click', () => onDoctorSelect(doctor));
            
          marker.bindPopup(`
            <div class="doctor-popup">
              <h3 class="font-semibold text-lg">${doctor.name}</h3>
              <p class="text-sm text-gray-600">${doctor.specialty}</p>
              <p class="text-xs mt-1">${doctor.distanceKm.toFixed(1)} km away</p>
              ${doctor.availability.hasAvailability ? 
                `<p class="text-xs text-green-600 mt-1">Available: ${doctor.availability.nextAvailable}</p>` : 
                '<p class="text-xs text-gray-500 mt-1">No availability</p>'
              }
            </div>
          `);
          
          currentMarkers[doctor.id] = marker;
        }
      }
    });
    
    // Update markersRef with the current markers
    markersRef.current = currentMarkers;
    
    // Highlight selected doctor marker if any
    if (selectedDoctor) {
      const marker = currentMarkers[selectedDoctor.id];
      if (marker) {
        marker.openPopup();
        
        // Center map on selected doctor with slight offset
        const markerPosition = marker.getLatLng();
        map.setView([markerPosition.lat, markerPosition.lng], 14, {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [doctors, selectedDoctor, userLocation, mapInitialized, onDoctorSelect]);

  return <div id="doctor-map" className="w-full h-full" />;
} 