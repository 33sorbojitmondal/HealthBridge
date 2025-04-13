'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Appointment = {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
  type?: 'in-person' | 'virtual' | 'phone';
  duration?: number; // in minutes
  image?: string;
};

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Current date for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  useEffect(() => {
    // Wait a moment to avoid flickering during auth state check
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if not authenticated after checking
  useEffect(() => {
    if (loaded && status === 'unauthenticated') {
      router.push('/login?callbackUrl=/appointments');
    }
  }, [loaded, status, router]);

  if (!loaded || status === 'loading') {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  // Dummy appointments data
  const dummyAppointments: Appointment[] = [
    {
      id: 1,
      doctor: 'Dr. Emily Chen',
      specialty: 'General Physician',
      date: '2023-06-15',
      time: '10:00 AM',
      status: 'upcoming',
      location: 'Central Medical Clinic, Room 302',
      type: 'in-person',
      duration: 30,
      image: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
      id: 2,
      doctor: 'Dr. Robert Smith',
      specialty: 'Cardiologist',
      date: '2023-07-02',
      time: '2:30 PM',
      status: 'upcoming',
      location: 'Heart Health Center',
      type: 'in-person',
      duration: 45,
      image: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      id: 3,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Dermatologist',
      date: '2023-05-28',
      time: '1:15 PM',
      status: 'completed',
      notes: 'Follow-up in 3 months. Prescribed new medication for skin condition.',
      location: 'Dermatology Specialists',
      type: 'in-person',
      duration: 30,
      image: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      id: 4,
      doctor: 'Dr. Michael Wong',
      specialty: 'Psychiatrist',
      date: '2023-05-15',
      time: '11:00 AM',
      status: 'completed',
      notes: 'Discussed anxiety management techniques. Adjusted medication dosage.',
      type: 'virtual',
      duration: 45,
      image: 'https://randomuser.me/api/portraits/men/22.jpg'
    },
    {
      id: 5,
      doctor: 'Dr. Jennifer Lewis',
      specialty: 'Nutritionist',
      date: '2023-04-30',
      time: '9:30 AM',
      status: 'completed',
      notes: 'Created new diet plan. Recommended vitamin supplements.',
      type: 'phone',
      duration: 30,
      image: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      id: 6,
      doctor: 'Dr. David Kim',
      specialty: 'Orthopedic Surgeon',
      date: '2023-05-10',
      time: '3:45 PM',
      status: 'cancelled',
      location: 'Orthopedic Center',
      type: 'in-person',
      duration: 60,
      image: 'https://randomuser.me/api/portraits/men/64.jpg'
    }
  ];

  // Filter appointments based on selected view
  const filteredAppointments = dummyAppointments.filter(appointment => {
    if (view === 'all') return true;
    if (view === 'upcoming') return appointment.status === 'upcoming';
    if (view === 'past') return appointment.status === 'completed' || appointment.status === 'cancelled';
    return true;
  });

  // Get statistics
  const upcomingCount = dummyAppointments.filter(a => a.status === 'upcoming').length;
  const completedCount = dummyAppointments.filter(a => a.status === 'completed').length;
  const cancelledCount = dummyAppointments.filter(a => a.status === 'cancelled').length;
  const totalCount = dummyAppointments.length;

  // Calendar functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create an array of days for the current month with appointments
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      // Find appointments for this day
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const appointmentsOnDay = dummyAppointments.filter(a => a.date === date);
      
      days.push({
        day: i,
        appointments: appointmentsOnDay
      });
    }
    
    // Create blank spaces for days before the first day of the month
    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(i);
    }
    
    // Combine blanks and days
    const calendarDays = [...blanks.map(() => null), ...days];
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <button 
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {monthNames[month]} {year}
          </h2>
          <button 
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-2 bg-gray-50 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`blank-${index}`} className="p-2 bg-white"></div>;
            }
            
            const today = new Date();
            const isToday = day.day === today.getDate() && 
                           month === today.getMonth() && 
                           year === today.getFullYear();
            
            return (
              <div 
                key={`day-${day.day}`} 
                className={`p-2 bg-white min-h-[100px] ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-right ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                  {day.day}
                </div>
                {day.appointments.length > 0 && (
                  <div className="mt-1">
                    {day.appointments.map(appointment => (
                      <div 
                        key={appointment.id}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsModalOpen(true);
                        }}
                        className={`text-xs p-1 mb-1 rounded cursor-pointer truncate ${
                          appointment.status === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800' 
                            : appointment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.time} - {appointment.doctor}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAppointmentTypeIcon = (type?: 'in-person' | 'virtual' | 'phone') => {
    switch (type) {
      case 'in-person':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'virtual':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'phone':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: 'upcoming' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  const renderAppointmentModal = () => {
    if (!selectedAppointment) return null;
    
    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto ${isModalOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  {renderAppointmentTypeIcon(selectedAppointment.type)}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Appointment Details
                  </h3>
                  <div className="mt-4">
                    <div className="flex items-center mb-4">
                      <img
                        src={selectedAppointment.image || 'https://via.placeholder.com/40'}
                        alt={selectedAppointment.doctor}
                        className="h-16 w-16 rounded-full mr-4"
                      />
                      <div>
                        <p className="text-lg font-medium text-gray-900">{selectedAppointment.doctor}</p>
                        <p className="text-sm text-gray-500">{selectedAppointment.specialty}</p>
                        <div className="mt-1">{renderStatusBadge(selectedAppointment.status)}</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAppointment.time}</p>
                        </div>
                        {selectedAppointment.location && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-sm font-medium text-gray-900">{selectedAppointment.location}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAppointment.type || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">{selectedAppointment.duration || 30} minutes</p>
                        </div>
                      </div>
                      
                      {selectedAppointment.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{selectedAppointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {selectedAppointment.status === 'upcoming' && (
                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel Appointment
                </button>
              )}
              <button 
                type="button" 
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-12">
      {renderAppointmentModal()}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Back to Profile
          </Link>
          <Link
            href="/virtual-consultation"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Schedule New Appointment
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming</p>
              <p className="text-2xl font-semibold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{cancelledCount}</p>
              <p className="text-sm text-gray-500">Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* View and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex space-x-4">
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  view === 'upcoming' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setView('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  view === 'past' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setView('past')}
              >
                Past
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  view === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setView('all')}
              >
                All
              </button>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    displayMode === 'list'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setDisplayMode('list')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                    displayMode === 'calendar'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setDisplayMode('calendar')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {displayMode === 'list' ? (
            filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <div 
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="mr-4">
                        <img
                          src={appointment.image || 'https://via.placeholder.com/40'}
                          alt={appointment.doctor}
                          className="h-12 w-12 rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-md font-medium text-gray-900">{appointment.doctor}</h3>
                            <p className="text-sm text-gray-500">{appointment.specialty}</p>
                          </div>
                          <div>
                            {renderStatusBadge(appointment.status)}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            , {appointment.time}
                          </span>
                          <span className="mx-2">•</span>
                          {renderAppointmentTypeIcon(appointment.type)}
                          <span className="ml-1">
                            {appointment.type === 'in-person' 
                              ? 'In-person' 
                              : appointment.type === 'virtual' 
                                ? 'Virtual' 
                                : 'Phone call'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any {view === 'upcoming' ? 'upcoming' : view === 'past' ? 'past' : ''} appointments.</p>
                <div className="mt-6">
                  <Link
                    href="/virtual-consultation"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Schedule New Appointment
                  </Link>
                </div>
              </div>
            )
          ) : (
            // Calendar view
            renderCalendar()
          )}
        </div>
      </div>
    </div>
  );
} 