"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronRight, 
  UserPlus, 
  Bell, 
  BellOff, 
  Clock, 
  AlertTriangle,
  Heart,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Pill,
  Activity
} from 'lucide-react';

import { getHealthCircle } from '@/lib/doctor-services';
import { 
  getUserConnections, 
  getUserHealthUpdates, 
  shareHealthUpdate, 
  type HealthConnection, 
  type HealthUpdate 
} from '@/utils/social-health-utils';

// Define status colors
const statusColors = {
  healthy: "bg-green-100 text-green-800 hover:bg-green-200",
  attention: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
  warning: "bg-red-100 text-red-800 hover:bg-red-200"
};

interface ConnectionCardProps {
  connection: HealthConnection;
  onShare: (connectionId: string) => void;
  onManagePermissions: (connectionId: string) => void;
}

const ConnectionCard = ({ connection, onShare, onManagePermissions }: ConnectionCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-center mb-3">
        {connection.profileImage ? (
          <img 
            src={connection.profileImage} 
            alt={connection.name} 
            className="w-12 h-12 rounded-full mr-3 border border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg font-semibold">
            {connection.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center">
            {connection.name}
            {connection.emergencyContact && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                Emergency
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 capitalize">{connection.relationship}</p>
        </div>
      </div>
      
      <div className="text-sm mb-3">
        <div className="text-gray-700">
          <span className="font-medium">Status:</span>{' '}
          <span className={`${
            connection.status === 'active' ? 'text-green-600' : 
            connection.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
          </span>
        </div>
        <div className="text-gray-700">
          <span className="font-medium">Connected:</span>{' '}
          {new Date(connection.dateConnected).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {connection.sharingPreferences.map((pref, index) => (
          <span 
            key={index}
            className={`text-xs px-2 py-1 rounded-full ${
              pref.level === 'full' ? 'bg-green-100 text-green-800' :
              pref.level === 'detailed' ? 'bg-blue-100 text-blue-800' :
              pref.level === 'basic' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}
          >
            {pref.dataType}: {pref.level}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between mt-3">
        <button 
          onClick={() => onShare(connection.id)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Share Update
        </button>
        <button 
          onClick={() => onManagePermissions(connection.id)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Manage Permissions
        </button>
      </div>
    </div>
  );
};

interface HealthUpdateCardProps {
  update: HealthUpdate;
  connections: HealthConnection[];
}

const HealthUpdateCard = ({ update, connections }: HealthUpdateCardProps) => {
  // Find connections who can see this update
  const visibleTo = connections.filter(conn => 
    update.visibleTo.includes(conn.connectionUserId)
  );
  
  const formatValue = (dataType: string, value: any) => {
    switch (dataType) {
      case 'heartRate':
        return `${value} bpm`;
      case 'steps':
        return value.toLocaleString();
      case 'weight':
        return `${value} lbs`;
      case 'medication':
        return value.taken ? `✓ ${value.name} ${value.dosage}` : `✗ ${value.name} ${value.dosage}`;
      default:
        return JSON.stringify(value);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 capitalize">{update.dataType}</h3>
          <p className="text-sm text-gray-600">
            {new Date(update.timestamp).toLocaleString()}
          </p>
        </div>
        <div className={`px-2 py-1 text-sm rounded-full ${
          update.visibleTo.length > 2 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          Shared with {update.visibleTo.length}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mb-3">
        <div className="text-lg font-semibold text-gray-900">
          {formatValue(update.dataType, update.value)}
        </div>
        {update.notes && (
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Notes:</span> {update.notes}
          </p>
        )}
      </div>
      
      <div className="text-sm text-gray-700">
        <p className="font-medium mb-1">Visible to:</p>
        <div className="flex flex-wrap gap-1">
          {visibleTo.map(conn => (
            <span key={conn.id} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
              {conn.name} ({conn.relationship})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function SocialHealthPage() {
  const [healthCircle, setHealthCircle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [connections, setConnections] = useState<HealthConnection[]>([]);
  const [updates, setUpdates] = useState<HealthUpdate[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [updateType, setUpdateType] = useState('heartRate');
  const [updateValue, setUpdateValue] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);

  useEffect(() => {
    const fetchHealthCircle = async () => {
      try {
        setLoading(true);
        const data = await getHealthCircle('currentUser123');
        setHealthCircle(data);
      } catch (error) {
        console.error('Error fetching health circle data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthCircle();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch user connections
        const userConnections = await getUserConnections('currentUser');
        setConnections(userConnections);
        
        // Fetch health updates
        const healthUpdates = await getUserHealthUpdates('currentUser');
        setUpdates(healthUpdates);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter members based on active tab
  const filteredMembers = activeTab === 'all' 
    ? healthCircle 
    : healthCircle.filter(member => member.overallStatus === activeTab);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'healthy': return 'Healthy';
      case 'attention': return 'Needs Attention';
      case 'warning': return 'Warning';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'attention': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'warning': return <ShieldAlert className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
  };

  const handleShareClick = (connectionId: string) => {
    setSelectedConnection(connectionId);
    setSelectedConnections([connectionId]);
    setShowShareModal(true);
  };
  
  const handleManagePermissionsClick = (connectionId: string) => {
    setSelectedConnection(connectionId);
    setShowPermissionsModal(true);
  };
  
  const handleShareUpdate = async () => {
    if (!updateType || !updateValue) return;
    
    let parsedValue: any;
    
    // Parse the value according to the data type
    switch (updateType) {
      case 'heartRate':
      case 'steps':
        parsedValue = parseInt(updateValue);
        break;
      case 'weight':
        parsedValue = parseFloat(updateValue);
        break;
      case 'medication':
        parsedValue = {
          name: 'Medication',
          dosage: updateValue,
          taken: true
        };
        break;
      default:
        parsedValue = updateValue;
    }
    
    try {
      // Get connection user IDs from the selected connection IDs
      const connectionUserIds = connections
        .filter(conn => selectedConnections.includes(conn.id))
        .map(conn => conn.connectionUserId);
      
      // Share the health update with selected connections
      const result = await shareHealthUpdate(
        'currentUser',
        updateType,
        parsedValue,
        updateNotes,
        connectionUserIds
      );
      
      if (result.success) {
        // Add the new update to the list
        const newUpdate: HealthUpdate = {
          id: result.updateId || `update${Date.now()}`,
          userId: 'currentUser',
          timestamp: new Date(),
          dataType: updateType,
          value: parsedValue,
          notes: updateNotes,
          visibleTo: connectionUserIds
        };
        
        setUpdates([newUpdate, ...updates]);
        
        // Reset form
        setUpdateType('heartRate');
        setUpdateValue('');
        setUpdateNotes('');
        setSelectedConnections([]);
        setShowShareModal(false);
      }
    } catch (error) {
      console.error('Error sharing update:', error);
    }
  };
  
  // Find active connections
  const activeConnections = connections.filter(conn => conn.status === 'active');
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Health Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Monitor the health of your loved ones (with their consent)
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add to Health Circle
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="healthy">Healthy</TabsTrigger>
            <TabsTrigger value="attention">Needs Attention</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No members found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.profileImage} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.relationship}</CardDescription>
                        </div>
                      </div>
                      <Badge className={statusColors[member.overallStatus]}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(member.overallStatus)}
                          <span>{getStatusLabel(member.overallStatus)}</span>
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Last updated: {formatTimeSince(member.lastUpdate)}
                    </div>

                    <div className="space-y-3">
                      {member.permissions.viewMedications && (
                        <div className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-primary" />
                          <span className="text-sm">Medication tracking</span>
                        </div>
                      )}
                      
                      {member.permissions.viewAppointments && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="text-sm">Appointments</span>
                        </div>
                      )}
                      
                      {member.permissions.viewVitals && (
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-primary" />
                          <span className="text-sm">Vital signs</span>
                        </div>
                      )}
                    </div>

                    {member.recentAlerts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Recent Alerts</h4>
                        <div className="space-y-2">
                          {member.recentAlerts.map((alert, idx) => (
                            <Alert key={idx} className="py-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 ${
                                  alert.severity === 'high' ? 'text-red-600' : 
                                  alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                                <div>
                                  <AlertTitle className="text-xs font-semibold">
                                    {alert.type.split('_').map(word => 
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                  </AlertTitle>
                                  <AlertDescription className="text-xs mt-1">
                                    {alert.message}
                                  </AlertDescription>
                                </div>
                              </div>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {member.permissions.receiveAlerts ? (
                        <>
                          <BellOff className="h-4 w-4" />
                          <span>Mute Alerts</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" />
                          <span>Receive Alerts</span>
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-6 rounded-lg mt-8">
        <h2 className="font-semibold text-lg mb-3">About Social Health Tracking</h2>
        <p className="text-muted-foreground mb-2">
          Social Health Tracking allows you to keep an eye on the health of your loved ones, with their
          explicit consent. They control exactly what information they share with you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Members of your health circle have complete control over what information they share with you. 
                They can revoke access at any time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Early Intervention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive alerts when your loved ones might need assistance, allowing for timely support
                and potentially better health outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Social Health Sharing</h1>
            <p className="text-gray-600">
              Connect with family, friends, and healthcare providers to share your health journey
            </p>
          </header>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Connections */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">My Connections</h2>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Add Connection
                    </button>
                  </div>
                  
                  {activeConnections.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600">You don't have any active connections yet</p>
                      <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Find People to Connect
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeConnections.map(connection => (
                        <ConnectionCard 
                          key={connection.id}
                          connection={connection}
                          onShare={handleShareClick}
                          onManagePermissions={handleManagePermissionsClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column - Health Updates */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">My Health Updates</h2>
                    <button 
                      onClick={() => {
                        setSelectedConnection(null);
                        setSelectedConnections([]);
                        setShowShareModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Share New Update
                    </button>
                  </div>
                  
                  {updates.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600 mb-3">You haven't shared any health updates yet</p>
                      <p className="text-gray-500 text-sm mb-4">
                        Share your health metrics and progress with your connections to keep them informed
                        about your health journey.
                      </p>
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Share Your First Update
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {updates.map(update => (
                        <HealthUpdateCard 
                          key={update.id} 
                          update={update} 
                          connections={connections}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Share Update Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Health Update</h3>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="updateType" className="block text-sm font-medium text-gray-700 mb-1">
                      Update Type
                    </label>
                    <select
                      id="updateType"
                      value={updateType}
                      onChange={(e) => setUpdateType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="heartRate">Heart Rate</option>
                      <option value="steps">Steps</option>
                      <option value="weight">Weight</option>
                      <option value="medication">Medication</option>
                      <option value="bloodGlucose">Blood Glucose</option>
                      <option value="bloodPressure">Blood Pressure</option>
                      <option value="sleep">Sleep</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="updateValue" className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    <input
                      id="updateValue"
                      type="text"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      placeholder={
                        updateType === 'heartRate' ? 'e.g. 72 (bpm)' :
                        updateType === 'steps' ? 'e.g. 8472' :
                        updateType === 'weight' ? 'e.g. 168.5 (lbs)' :
                        updateType === 'medication' ? 'e.g. 10mg' :
                        updateType === 'bloodGlucose' ? 'e.g. 120 (mg/dL)' :
                        updateType === 'bloodPressure' ? 'e.g. 120/80' :
                        updateType === 'sleep' ? 'e.g. 7.5 (hours)' : ''
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="updateNotes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      id="updateNotes"
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      placeholder="Add any notes about this measurement..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Share with
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {activeConnections.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">No active connections</p>
                      ) : (
                        activeConnections.map(connection => (
                          <div key={connection.id} className="flex items-center p-2 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              id={`conn-${connection.id}`}
                              checked={selectedConnections.includes(connection.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedConnections([...selectedConnections, connection.id]);
                                } else {
                                  setSelectedConnections(selectedConnections.filter(id => id !== connection.id));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`conn-${connection.id}`} className="ml-2 text-sm text-gray-700">
                              {connection.name} ({connection.relationship})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareUpdate}
                    disabled={!updateValue || selectedConnections.length === 0}
                    className={`px-4 py-2 rounded-md text-white ${
                      !updateValue || selectedConnections.length === 0
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Share Update
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Permissions Modal */}
          {showPermissionsModal && selectedConnection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Sharing Permissions
                  </h3>
                  <button 
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Connection details */}
                {(() => {
                  const connection = connections.find(c => c.id === selectedConnection);
                  if (!connection) return null;
                  
                  return (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {connection.profileImage ? (
                          <img 
                            src={connection.profileImage} 
                            alt={connection.name} 
                            className="w-10 h-10 rounded-full mr-3 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg font-semibold">
                            {connection.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{connection.relationship}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Data Sharing Permissions</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose what health data you want to share and at what level of detail
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'heartRate', label: 'Heart Rate' },
                      { id: 'steps', label: 'Steps' },
                      { id: 'weight', label: 'Weight' },
                      { id: 'medication', label: 'Medications' },
                      { id: 'bloodGlucose', label: 'Blood Glucose' },
                      { id: 'sleep', label: 'Sleep' },
                      { id: 'appointments', label: 'Appointments' }
                    ].map(dataType => {
                      const connection = connections.find(c => c.id === selectedConnection);
                      const permission = connection?.sharingPreferences.find(p => p.dataType === dataType.id);
                      const currentLevel = permission?.level || 'none';
                      
                      return (
                        <div key={dataType.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-gray-800">{dataType.label}</span>
                          <select
                            value={currentLevel}
                            onChange={() => {/* Would handle update in a real app */}}
                            className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="none">None</option>
                            <option value="basic">Basic</option>
                            <option value="detailed">Detailed</option>
                            <option value="full">Full</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emergencyContact"
                        checked={connections.find(c => c.id === selectedConnection)?.emergencyContact}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="emergencyContact" className="ml-2 text-sm text-gray-700">
                        Set as emergency contact
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Would save permissions in a real app
                      setShowPermissionsModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Permissions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 