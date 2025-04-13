'use client';

import { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useSession } from '@/lib/auth';

// Define SpeechRecognition interfaces
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Extend window interface
interface ExtendedWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

type EmergencyVoiceTriggerProps = {
  onEmergencyTriggered?: (response: any) => void;
};

export default function EmergencyVoiceTrigger({ onEmergencyTriggered }: EmergencyVoiceTriggerProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Set up speech recognition when component mounts
  useEffect(() => {
    // For browsers that support SpeechRecognition
    const extWindow = window as ExtendedWindow;
    const SpeechRecognitionConstructor = extWindow.SpeechRecognition || extWindow.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        // TypeScript doesn't fully know the structure of SpeechRecognitionResultList
        // so we need to use any here
        const results = event.results as any;
        const transcriptText = results[current][0].transcript;
        setTranscript(transcriptText);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setLastError(`Error: ${event.error}`);
        stopListening();
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart recognition if it ended but we're still supposed to be listening
          recognitionRef.current?.start();
        }
      };
    } else {
      setLastError('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isListening]);
  
  // Check for microphone permission
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setHasMicPermission(true);
      } catch (error) {
        console.error('Microphone permission error:', error);
        setHasMicPermission(false);
        setLastError('Microphone permission denied');
      }
    };
    
    checkMicPermission();
  }, []);
  
  const startListening = () => {
    setLastError(null);
    setTranscript('');
    setLastResult(null);
    
    if (!recognitionRef.current) {
      setLastError('Speech recognition not supported');
      return;
    }
    
    if (!hasMicPermission) {
      setLastError('Microphone permission denied');
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setLastError('Failed to start listening');
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };
  
  const handleEmergencyTrigger = async () => {
    if (!transcript) {
      setLastError('No voice command detected');
      return;
    }
    
    setIsProcessing(true);
    setLastError(null);
    
    try {
      // Get user location if available
      let location = null;
      
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          location = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
        }
      } catch (locationError) {
        console.error('Failed to get location:', locationError);
      }
      
      // Get user ID and phone from session if available
      const userId = session?.user ? (session.user as any).id || 'unknown' : 'unknown';
      const userPhone = session?.user ? (session.user as any).phone || '+15551234567' : '+15551234567';
      
      // Call the emergency API with voice command
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phoneNumber: userPhone,
          triggerMethod: 'voice',
          voiceCommand: transcript,
          location: location
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastResult(result);
        if (onEmergencyTriggered) {
          onEmergencyTriggered(result);
        }
      } else {
        setLastError(result.error || 'Failed to process emergency');
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
      setLastError('Failed to process emergency request');
    } finally {
      setIsProcessing(false);
      stopListening();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <BellAlertIcon className="h-5 w-5 text-red-500 mr-2" />
          Emergency Voice Trigger
        </h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          In an emergency, press the microphone button and say clearly what help you need.
          Include words like "emergency", "help me", or describe your situation.
        </p>
        
        <div className="flex items-center justify-center">
          {isListening ? (
            <button
              onClick={stopListening}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <StopIcon className="h-8 w-8 text-white" />
            </button>
          ) : (
            <button
              onClick={startListening}
              disabled={isProcessing || hasMicPermission === false}
              className={`h-16 w-16 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing || hasMicPermission === false 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              <MicrophoneIcon className="h-8 w-8 text-white" />
            </button>
          )}
        </div>
        
        {isListening && (
          <div className="text-center animate-pulse">
            <p className="text-red-600 dark:text-red-400 font-medium">
              Listening... Speak clearly
            </p>
          </div>
        )}
        
        {transcript && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-800 dark:text-gray-200 text-sm">
              <span className="font-medium">You said:</span> {transcript}
            </p>
            {isListening && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleEmergencyTrigger}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Confirm Emergency
                </button>
              </div>
            )}
          </div>
        )}
        
        {isProcessing && (
          <div className="flex justify-center items-center py-2">
            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Processing emergency...</span>
          </div>
        )}
        
        {lastError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-sm text-red-700 dark:text-red-300">
            {lastError}
          </div>
        )}
        
        {lastResult && lastResult.success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Emergency alert sent successfully!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {lastResult.alert?.level === 'critical' ? 
                'Emergency services have been notified.' : 
                'Your emergency contacts have been notified.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 