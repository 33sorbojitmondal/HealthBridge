'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode, useState, useEffect } from "react";
import { AuthFallback } from "@/lib/auth";

interface ProvidersProps {
  children: ReactNode;
}

// Custom interface for error events with the properties we need
interface CustomErrorEvent {
  message?: string;
  error?: {
    message?: string;
  };
  preventDefault?: () => void;
}

export default function Providers({ children }: ProvidersProps) {
  const [errorHandled, setErrorHandled] = useState(false);

  useEffect(() => {
    // Check if NextAuth is having issues
    const checkAuth = async () => {
      try {
        // Make a simple fetch to the auth API without credentials to check if it's responding
        const res = await fetch('/api/auth/session', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'omit' // Don't send cookies to avoid auth issues
        });
        
        if (!res.ok) {
          console.warn('Auth API returned error status:', res.status);
          AuthFallback.enabled = true;
        } else {
          // Try to parse the response, but catch JSON parse errors
          try {
            await res.json();
          } catch (e) {
            console.error('Failed to parse auth session JSON:', e);
            AuthFallback.enabled = true;
          }
        }
      } catch (error) {
        console.error('Auth API check failed:', error);
        AuthFallback.enabled = true;
      }
    };
    
    // Run the check
    checkAuth();

    // Set up error listener
    const handleError = (event: ErrorEvent) => {
      // Convert to our custom type to access the properties we need
      const customEvent = event as unknown as CustomErrorEvent;
      
      if (
        (customEvent.message && (
          customEvent.message.includes('ReflectApply') || 
          customEvent.message.includes('next-auth') ||
          customEvent.message.includes('Unexpected end of JSON')
        )) || 
        (customEvent.error && customEvent.error.message && (
          customEvent.error.message.includes('ReflectApply') || 
          customEvent.error.message.includes('next-auth') ||
          customEvent.error.message.includes('Unexpected end of JSON')
        ))
      ) {
        console.error('Auth error intercepted:', customEvent);
        AuthFallback.enabled = true;
        setErrorHandled(true);
        if (customEvent.preventDefault) {
          customEvent.preventDefault();
        }
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
} 