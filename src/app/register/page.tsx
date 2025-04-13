'use client';

import React, { useState } from 'react';
import { signIn } from '@/lib/auth'; // Import from our safe auth wrappers
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Try to register the user with our API first
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      let responseOk = true;
      let data = { message: '' };
      
      try {
        data = await response.json();
        responseOk = response.ok;
      } catch (e) {
        console.error('Failed to parse response:', e);
      }
      
      if (responseOk) {
        // After successful registration, try to sign in
        const result = await signIn('credentials', { 
          redirect: false, 
          email, 
          password
        });
        
        if (result?.ok) {
          router.push('/');
        } else {
          setError('Account created, but sign-in failed: ' + (result?.error || 'Please try logging in manually'));
          setLoading(false);
        }
      } else {
        setError(data?.message || 'Failed to register');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = () => {
    setLoading(true);
    // Use Google sign-in with NextAuth
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
          <p className="text-gray-600">
            Join our healthcare community
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Google register button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.501 12.2333C22.501 11.3733 22.4277 10.7266 22.2677 10.0533H12.2344V13.9833H18.0811C17.9544 14.9833 17.4044 16.4666 16.1144 17.4666L16.0944 17.6L19.1044 19.9833L19.3111 20C21.1644 18.3333 22.501 15.5333 22.501 12.2333Z" fill="#4285F4"/>
            <path d="M12.2342 22.5C15.0009 22.5 17.3209 21.57 19.3109 20L16.1142 17.4667C15.2142 18.07 13.9542 18.4833 12.2342 18.4833C9.40087 18.4833 6.98754 16.6167 6.11754 14.0667L5.99087 14.0767L2.86421 16.5433L2.80087 16.6667C4.77754 20.1083 8.24087 22.5 12.2342 22.5Z" fill="#34A853"/>
            <path d="M6.11756 14.0667C5.92422 13.3933 5.81089 12.6833 5.81089 11.9999C5.81089 11.3166 5.92422 10.6066 6.10422 9.93325L6.09756 9.78659L2.92422 7.28325L2.80089 7.33325C2.16756 8.71659 1.80089 10.2666 1.80089 11.9999C1.80089 13.7333 2.16756 15.2833 2.80089 16.6666L6.11756 14.0667Z" fill="#FBBC05"/>
            <path d="M12.2342 5.51667C14.1209 5.51667 15.4142 6.31667 16.1742 7.01667L19.0342 4.23334C17.3075 2.63334 15.0075 1.5 12.2342 1.5C8.24089 1.5 4.77756 3.89167 2.80089 7.33334L6.10422 9.93334C6.98756 7.38334 9.40089 5.51667 12.2342 5.51667Z" fill="#EB4335"/>
          </svg>
          Continue with Google
        </button>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
        
        {/* Email registration form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters with letters and numbers
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600">
                I agree to the{' '}
                <Link href="/terms-of-service" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 