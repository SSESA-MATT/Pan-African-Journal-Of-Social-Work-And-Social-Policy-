'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    journal: [
      { name: 'About Us', href: '/about' },
      { name: 'Editorial Board', href: '/about#editorial-board' },
      { name: 'Submission Guidelines', href: '/author' },
      { name: 'Peer Review Process', href: '/about#peer-review' }
    ],
    browse: [
      { name: 'Current Issue', href: '/articles' },
      { name: 'All Articles', href: '/articles' },
      { name: 'Archives', href: '/articles' },
      { name: 'Search', href: '/articles' }
    ],
    authors: [
      { name: 'Submit Manuscript', href: '/register' },
      { name: 'Author Guidelines', href: '/author' },
      { name: 'Copyright Policy', href: '/policies' },
      { name: 'Open Access', href: '/policies' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Technical Support', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' }
    ]
  };

  const socialLinks = [
    {
      name: 'X (Twitter)',
      href: '#', // Replace with your X handle URL
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: '#', // Replace with your Facebook page URL
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: '#', // Replace with your LinkedIn page URL
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: '#', // Replace with your Instagram page URL
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Journal Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">
                African Journal of Social Work and Social Policy
              </h3>
              <p className="text-neutral-300 leading-relaxed mb-4">
                Connecting scholarship, practice, and policy for Africa's social transformation 
                through scholarly research and community engagement.
              </p>
              
              {/* African-inspired decorative elements */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                <div className="w-4 h-4 bg-accent-green rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-5 h-5 bg-accent-red rounded-full"></div>
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
              </div>

              <div className="text-sm text-neutral-400">
                <p className="mb-1">ISSN: 2789-1234 (Online)</p>
                <p className="mb-1">ISSN: 2789-5678 (Print)</p>
                <p>Published by East Africa Social Work Regional Resource Centre</p>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-accent-green transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Journal</h4>
            <ul className="space-y-2">
              {footerLinks.journal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Browse</h4>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Authors</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.authors.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-neutral-700 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-neutral-300 text-sm mb-4">
              Subscribe to receive notifications about new issues and calls for papers
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent text-white placeholder-neutral-400"
              />
              <button className="px-6 py-2 bg-accent-green text-white rounded-r-lg hover:bg-accent-green/80 transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm mb-4 md:mb-0">
              <p>
                © {currentYear} African Journal of Social Work and Social Policy. All rights reserved.
              </p>
              <p className="mt-1">
                Published under{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-green hover:text-accent-green/80 transition-colors"
                >
                  Creative Commons Attribution 4.0 License
                </a>
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                href="/accessibility"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>

        {/* African-inspired bottom decoration */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent-red rounded-full"></div>
            <div className="w-3 h-3 bg-accent-green rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-4 h-4 bg-accent-red rounded-full"></div>
            <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-accent-red rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};