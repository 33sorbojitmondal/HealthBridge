'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [zipCode, setZipCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-blob shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0 animate-slideInRight" style={{ animationDelay: '300ms' }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-gradient">AI-Powered</span> Healthcare
                <br />For Everyone
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-lg">
                Get personalized health insights, connect with medical professionals, and join a supportive community - all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/symptom-checker" 
                  className="btn-animated px-6 py-3 bg-blue-600 text-white rounded-full font-medium shadow-lg hover:shadow-blue-400/20 transition-all duration-300 hover:-translate-y-1"
                >
                  Check Symptoms
                </Link>
                <Link 
                  href="/register" 
                  className="btn-animated px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-full font-medium shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
                >
                  Join Community →
                </Link>
              </div>
              <div className="mt-8 text-sm text-gray-600 flex items-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium animate-pulse-slow">
                  30,000+ users trust us
                </span>
              </div>
            </div>
            <div className="lg:w-1/2 animate-slideInUp" style={{ animationDelay: '500ms' }}>
              <div className="relative h-80 md:h-96 animate-float">
                <div className="absolute -right-4 -top-4 w-64 h-64 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute -left-4 -bottom-4 w-64 h-64 bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
                <div className="relative z-10 bg-white p-4 rounded-2xl shadow-xl transform hover:rotate-1 transition-all duration-500 card-hover">
                  <div className="flex items-center mb-4">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-1"></div>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-1"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-600">AI HealthBridge</div>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-gray-50 p-4">
                    <div className="h-40 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <div className="text-blue-500 text-5xl">🩺</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                      <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-16 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features That Care</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines advanced AI technology with a compassionate community approach to healthcare.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🤖',
              title: 'AI Symptom Checker',
              description: 'Get quick insights about your symptoms using our advanced AI assistant.',
              link: '/symptom-checker',
              delay: '700ms'
            },
            {
              icon: '👥',
              title: 'Community Support',
              description: 'Connect with others who share similar health experiences and concerns.',
              link: '/community-forum',
              delay: '800ms'
            },
            {
              icon: '👩‍⚕️',
              title: 'Virtual Consultations',
              description: 'Schedule video appointments with licensed healthcare professionals.',
              link: '/consultations',
              delay: '900ms'
            },
            {
              icon: '⏰',
              title: 'Medication Reminders',
              description: 'Never miss a dose with personalized medication reminders.',
              link: '/reminders',
              delay: '1000ms'
            },
            {
              icon: '📊',
              title: 'Health Insights',
              description: 'Track your health metrics and receive personalized recommendations.',
              link: '/insights',
              delay: '1100ms'
            },
            {
              icon: '📄',
              title: 'Health Records',
              description: 'Securely store and manage your health records in one place.',
              link: '/records',
              delay: '1200ms'
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-md card-hover animate-fadeIn"
              style={{ animationDelay: feature.delay }}
            >
              <div className="text-4xl mb-4 bg-blue-50 h-16 w-16 rounded-full flex items-center justify-center animate-pulse-slow">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link 
                href={feature.link}
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center group"
              >
                Learn more 
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50 rounded-3xl">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fadeIn" style={{ animationDelay: '1300ms' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real stories from people who have transformed their healthcare journey with AI HealthBridge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The virtual consultation feature saved me so much time. I got medical advice without having to leave my home.",
                name: "Sarah J.",
                location: "New York",
                avatar: "/assets/avatar1.jpg",
                delay: '1400ms'
              },
              {
                quote: "The medication reminder system has been a game-changer for managing my chronic condition. I haven't missed a dose in months!",
                name: "Michael T.",
                location: "California",
                avatar: "/assets/avatar2.jpg",
                delay: '1500ms'
              },
              {
                quote: "Finding support in the community forums helped me cope with my diagnosis. It's comforting to connect with others who understand.",
                name: "Priya R.",
                location: "Texas",
                avatar: "/assets/avatar3.jpg",
                delay: '1600ms'
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md card-hover animate-fadeIn"
                style={{ animationDelay: testimonial.delay }}
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 animate-fadeIn" style={{ animationDelay: '1700ms' }}>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="container mx-auto px-6 py-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 text-white mb-8 lg:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your healthcare experience?</h2>
                <p className="text-blue-100 mb-6">Join thousands of users who have already discovered the power of AI-assisted healthcare.</p>
              </div>
              <div className="lg:w-1/3">
                <div className="bg-white p-6 rounded-xl shadow-xl animate-float">
                  <h3 className="text-xl font-semibold mb-4 text-center">Create Your Account</h3>
                  <form className="space-y-4">
                    <div>
                      <input type="email" placeholder="Email address" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <input type="password" placeholder="Create password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <button type="button" className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 btn-animated">
                      Get Started
                    </button>
                    <p className="text-center text-sm text-gray-600">
                      Already have an account? <Link href="/login" className="text-blue-600 font-medium">Sign in</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
