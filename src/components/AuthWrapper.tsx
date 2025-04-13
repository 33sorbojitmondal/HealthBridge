'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isClient, setIsClient] = useState(false);
  const [authError, setAuthError] = useState(false);
  const sessionResult = useSession({
    required: false,
    onUnauthenticated() {
      // Just handle gracefully, don't do anything special
    },
  });

  // Handle session errors
  useEffect(() => {
    setIsClient(true);
    
    const handleSessionError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('ReflectApply') ||
        event.error?.message?.includes('next-auth') ||
        event.message?.includes('ReflectApply') ||
        event.message?.includes('next-auth')
      ) {
        console.error('Auth error intercepted:', event);
        setAuthError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleSessionError);
    return () => window.removeEventListener('error', handleSessionError);
  }, []);

  // If we're on the server or auth has error, render without authentication
  if (!isClient || authError) {
    return <>{children}</>;
  }

  // Otherwise render with authentication state
  return <>{children}</>;
} 