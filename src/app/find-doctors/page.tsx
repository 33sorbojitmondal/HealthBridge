"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  MapPin, 
  Search, 
  Star, 
  Clock, 
  Calendar, 
  Phone, 
  Video, 
  Filter, 
  Stethoscope,
  RefreshCw
} from 'lucide-react';

import { getDoctorsNearLocation, DoctorSpecialty, Doctor } from '@/lib/doctor-services';
import { useSafeSession } from '@/lib/auth';
import { getDoctors, filterDoctors } from '@/utils/doctor-utils';
import DoctorCard from '@/components/DoctorCard';
import FilterSidebar from '@/components/FilterSidebar';
import Loading from '@/components/Loading';

// Import MapComponent dynamically with ssr disabled
const MapComponent = dynamic(
  () => import('@/components/MapComponent').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function FindDoctorsPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [selectedSpecialty, setSelectedSpecialty] = useState<DoctorSpecialty | 'all'>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [highRatedOnly, setHighRatedOnly] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          try {
            const nearbyDoctors = await getDoctorsNearLocation(
              latitude, 
              longitude, 
              searchRadius, 
              selectedSpecialty === 'all' ? undefined : selectedSpecialty
            );
            setDoctors(nearbyDoctors);
          } catch (error) {
            console.error('Error fetching doctors:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLocationError('Unable to access your location. Please enable location services.');
          setLoading(false);
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, [searchRadius, selectedSpecialty]);

  // Filter doctors based on search and filters
  const filteredDoctors = doctors.filter(doctor => {
    // Text search filter
    const searchMatch = searchText === '' || 
      doctor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchText.toLowerCase());
    
    // Available only filter
    const availabilityMatch = !availableOnly || doctor.availability.hasAvailability;
    
    // Rating filter
    const ratingMatch = !highRatedOnly || 
      (doctor.ratings.average >= 4.0);
    
    return searchMatch && availabilityMatch && ratingMatch;
  });

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleRefreshLocation = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const nearbyDoctors = await getDoctorsNearLocation(
        userLocation[0],
        userLocation[1],
        searchRadius,
        selectedSpecialty === 'all' ? undefined : selectedSpecialty
      );
      setDoctors(nearbyDoctors);
    } catch (error) {
      console.error('Error refreshing doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = (ratings: { count: number; average: number }) => {
    return ratings.count > 0 ? ratings.average.toFixed(1) : 'New';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Doctors Near You</h1>
          <p className="text-muted-foreground mt-1">
            Discover healthcare providers in your area
          </p>
        </div>

        {/* Search and filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Search & Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors or specialties"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select 
                  value={selectedSpecialty} 
                  onValueChange={(value) => setSelectedSpecialty(value as DoctorSpecialty | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="General_Practitioner">General Practitioner</SelectItem>
                    <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="Endocrinologist">Endocrinologist</SelectItem>
                    <SelectItem value="Neurologist">Neurologist</SelectItem>
                    <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="Ophthalmologist">Ophthalmologist</SelectItem>
                    <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Distance ({searchRadius} km)</Label>
                </div>
                <Slider
                  value={[searchRadius]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(values) => setSearchRadius(values[0])}
                  className="py-4"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="available" 
                    checked={availableOnly}
                    onCheckedChange={(checked) => setAvailableOnly(checked === true)}
                  />
                  <Label htmlFor="available">Available for appointment</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rated" 
                    checked={highRatedOnly}
                    onCheckedChange={(checked) => setHighRatedOnly(checked === true)}
                  />
                  <Label htmlFor="rated">4+ stars only</Label>
                </div>
              </div>

              <Button 
                className="w-full flex items-center gap-2" 
                onClick={handleRefreshLocation}
                disabled={loading || !userLocation}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Results
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {/* Map */}
            <Card className="w-full h-[300px] overflow-hidden">
              {locationError ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">{locationError}</p>
                </div>
              ) : (
                <MapComponent 
                  userLocation={userLocation} 
                  doctors={filteredDoctors}
                  selectedDoctor={selectedDoctor}
                  onDoctorSelect={handleDoctorSelect}
                  center={userLocation || undefined}
                  zoom={13}
                />
              )}
            </Card>

            {/* Doctor List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {loading ? 'Loading doctors...' : 
                    `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''} found`}
                </h2>
              </div>

              {loading && !doctors.length ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters or increasing the search radius.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {filteredDoctors.map((doctor) => (
                    <Card 
                      key={doctor.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                            <AvatarFallback className="bg-primary/10">
                              <Stethoscope className="h-8 w-8 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-1 flex-1">
                            <h3 className="font-semibold">{doctor.name}</h3>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary">{doctor.specialty}</Badge>
                              
                              <div className="flex items-center text-amber-500 ml-2">
                                <Star className="fill-current h-3 w-3" />
                                <span className="text-xs ml-1">
                                  {calculateAverageRating(doctor.ratings)}
                                  {doctor.ratings.count > 0 && (
                                    <span className="text-muted-foreground"> ({doctor.ratings.count})</span>
                                  )}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{doctor.distanceKm.toFixed(1)} km away</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-1 text-primary" />
                              {doctor.availability.hasAvailability ? (
                                <span>Next available: {doctor.availability.nextAvailable}</span>
                              ) : (
                                <span className="text-muted-foreground">No availability</span>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              {doctor.services.includes('video_consult') && (
                                <Badge variant="outline" className="text-xs px-2 flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  <span>Video</span>
                                </Badge>
                              )}
                              {doctor.services.includes('in_person') && (
                                <Badge variant="outline" className="text-xs px-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>In-person</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">View Profile</Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            disabled={!doctor.availability.hasAvailability}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Book</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 