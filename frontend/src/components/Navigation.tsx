'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { JournalLogo } from './JournalLogo';

export const Navigation: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black shadow-lg border-b-2 border-accent-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <JournalLogo />
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                href="/"
                className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/articles"
                className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Articles
              </Link>
              <Link
                href="/search"
                className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Search
              </Link>
              
              {/* Guidelines Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
                  className="flex items-center text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  onBlur={() => setTimeout(() => setIsGuidelinesOpen(false), 200)}
                >
                  Guidelines
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${isGuidelinesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Guidelines Dropdown Menu */}
                {isGuidelinesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-neutral-200">
                    <Link
                      href="/guidelines/authors"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsGuidelinesOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Author Guidelines
                      </div>
                    </Link>
                    <Link
                      href="/guidelines/reviewers"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsGuidelinesOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Reviewer Guidelines
                      </div>
                    </Link>
                    <Link
                      href="/guidelines/editorial"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsGuidelinesOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Editorial Guidelines
                      </div>
                    </Link>
                    <Link
                      href="/guidelines/ethics"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsGuidelinesOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Publication Ethics
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              
              <Link
                href="/contact"
                className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                  className="flex items-center text-sm text-white bg-neutral-800 rounded-full px-1.5 py-1.5 pr-3 hover:bg-neutral-700 transition-colors"
                >
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-accent-green flex items-center justify-center text-xs font-bold text-white mr-2">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  )}
                  <span className="mr-2">
                    {user.first_name} {user.last_name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {(user.role === 'author' || user.role === 'admin' || user.role === 'editor') && (
                      <Link
                        href="/author"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Author Portal
                        </div>
                      </Link>
                    )}
                    
                    {(user.role === 'reviewer' || user.role === 'admin' || user.role === 'editor') && (
                      <Link
                        href="/reviewer"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Reviewer Portal
                        </div>
                      </Link>
                    )}
                    
                    {(user.role === 'admin' || user.role === 'editor') && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    
                    <div className="border-t border-neutral-200 my-1"></div>
                    
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-neutral-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-accent-green hover:bg-accent-green/80 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-4 text-neutral-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-800 border-t border-neutral-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block text-neutral-300 hover:text-white px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block text-neutral-300 hover:text-white px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/articles"
              className="block text-neutral-300 hover:text-white px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Articles
            </Link>
            <Link
              href="/search"
              className="block text-neutral-300 hover:text-white px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Search
            </Link>
            
            {/* Mobile Guidelines section */}
            <div className="px-3 py-2">
              <div className="text-neutral-300 text-base font-medium mb-2">Guidelines</div>
              <div className="pl-4 space-y-1">
                <Link
                  href="/guidelines/authors"
                  className="block text-neutral-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Author Guidelines
                </Link>
                <Link
                  href="/guidelines/reviewers"
                  className="block text-neutral-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Reviewer Guidelines
                </Link>
                <Link
                  href="/guidelines/editorial"
                  className="block text-neutral-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Editorial Guidelines
                </Link>
                <Link
                  href="/guidelines/ethics"
                  className="block text-neutral-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Publication Ethics
                </Link>
                <Link
                  href="/guidelines/submission"
                  className="block text-neutral-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Submission Process
                </Link>
              </div>
            </div>
            
            <Link
              href="/contact"
              className="block text-neutral-300 hover:text-white px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};