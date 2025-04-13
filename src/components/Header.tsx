'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth'; // Import from our safe auth hooks

// Create a safe version of the header that doesn't rely directly on session
const Header = () => {
  // To avoid hydration mismatch, initialize with false and only update on client
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const pathname = usePathname();
  
  // Use our safe session hook to get authentication state
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    // Mark as mounted to enable client-side rendering
    setIsMounted(true);
    
    // Set initial scrolled state
    setScrolled(window.scrollY > 50);

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (name: string) => {
    if (dropdownOpen === name) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(name);
    }
  };

  const closeDropdowns = () => {
    setDropdownOpen(null);
  };

  const navigationItems = [
    { 
      name: 'Home', 
      path: '/' 
    },
    { 
      name: 'Services', 
      path: '#',
      dropdown: true,
      items: [
        { name: 'Symptom Checker', path: '/symptom-checker' },
        { name: 'Virtual Consultation', path: '/virtual-consultation' },
        { name: 'Medication Reminders', path: '/medication-reminders' },
      ]
    },
    { 
      name: 'Community', 
      path: '#',
      dropdown: true,
      items: [
        { name: 'Forum', path: '/community-forum' },
        { name: 'Support Groups', path: '/support-groups' },
        { name: 'Stories', path: '/stories' },
      ]
    },
    { 
      name: 'Resources', 
      path: '/resources' 
    },
    { 
      name: 'About', 
      path: '/about' 
    },
  ];

  // Always render the same on the server (not scrolled state)
  // Then update on the client after mount
  const currentScrolled = isMounted ? scrolled : false;

  // Add a function to handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        currentScrolled
          ? 'bg-white shadow-md py-2' 
          : 'bg-white bg-opacity-90 py-4'
      }`}
      suppressHydrationWarning={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeDropdowns}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <div className="ml-3" suppressHydrationWarning={true}>
              <h1 className={`font-bold text-xl ${currentScrolled ? 'text-gray-800' : 'text-gray-800'}`}>
                AI HealthBridge
              </h1>
              <p className={`text-xs ${currentScrolled ? 'text-gray-600' : 'text-gray-600'}`}>
                Healthcare for everyone
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" suppressHydrationWarning={true}>
            {navigationItems.map((item) => (
              <React.Fragment key={item.name}>
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        dropdownOpen === item.name
                          ? 'text-blue-600'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                      onClick={() => toggleDropdown(item.name)}
                      onMouseEnter={() => toggleDropdown(item.name)}
                    >
                      <span className="flex items-center">
                        {item.name}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className={`w-4 h-4 ml-1 transition-transform duration-200 ${dropdownOpen === item.name ? 'rotate-180' : ''}`}
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                    {dropdownOpen === item.name && (
                      <div 
                        className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        onMouseLeave={() => setDropdownOpen(null)}
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                              role="menuitem"
                              onClick={closeDropdowns}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.path
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={closeDropdowns}
                  >
                    {item.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Login/Register Buttons */}
          <div className="hidden md:flex items-center space-x-3" suppressHydrationWarning={true}>
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                  >
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="font-medium text-sm text-gray-700">
                      {session?.user?.name || session?.user?.email}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen === 'user' ? 'rotate-180' : ''}`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {dropdownOpen === 'user' && (
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                      onMouseLeave={() => setDropdownOpen(null)}
                    >
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          role="menuitem"
                          onClick={closeDropdowns}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/health-tracking"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          role="menuitem"
                          onClick={closeDropdowns}
                        >
                          Health Tracking
                        </Link>
                        <Link
                          href="/appointments"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          role="menuitem"
                          onClick={closeDropdowns}
                        >
                          My Appointments
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-blue-600"
                  onClick={closeDropdowns}
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  onClick={closeDropdowns}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden" suppressHydrationWarning={true}>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`} suppressHydrationWarning={true}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.dropdown ? (
                <>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex justify-between items-center ${
                      dropdownOpen === item.name
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleDropdown(item.name)}
                  >
                    {item.name}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen === item.name ? 'rotate-180' : ''}`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {dropdownOpen === item.name && (
                    <div className="pl-4 pr-2 py-2 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.path}
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          
          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between px-3 mb-3">
                  <div className="flex items-center">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium mr-2">
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {session?.user?.name || session?.user?.email}
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Profile
                  </Link>
                </div>
                
                {/* User links */}
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/health-tracking"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  >
                    Health Tracking
                  </Link>
                  <Link
                    href="/appointments"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  >
                    My Appointments
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between px-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 