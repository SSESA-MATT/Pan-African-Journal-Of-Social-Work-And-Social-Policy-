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
      name: 'Twitter',
      href: 'https://twitter.com/ajswsp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/ajswsp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/ajswsp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      name: 'ResearchGate',
      href: 'https://researchgate.net/journal/ajswsp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 00-.112.437 8.365 8.365 0 00-.078.53 9.928 9.928 0 00-.05.727c-.01.282-.013.621-.013 1.016a31.121 31.121 0 000 1.845c0 .815.013 1.54.04 2.173.027.632.08 1.248.159 1.848.078.6.191 1.23.34 1.887.148.658.34 1.406.576 2.244.235.837.545 1.86.93 3.068.384 1.207.884 2.705 1.5 4.492.615 1.787 1.397 3.966 2.345 6.536l2.672.007c.007-.641.01-1.336.01-2.086 0-.75-.003-1.555-.01-2.414-.007-.86-.02-1.774-.04-2.744-.02-.97-.05-1.996-.09-3.08-.04-1.083-.1-2.223-.18-3.42-.08-1.196-.19-2.45-.33-3.762-.14-1.312-.32-2.683-.54-4.11-.22-1.428-.49-2.915-.81-4.460-.32-1.546-.71-3.15-1.17-4.812-.46-1.663-1.01-3.386-1.65-5.169C20.206.751 19.934.377 19.586 0z"/>
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
                Africa Journal of Social Work and Social Policy
              </h3>
              <p className="text-neutral-300 leading-relaxed mb-4">
                Promoting Indigenous African knowledge systems and decolonial social work methodologies 
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
                © {currentYear} Africa Journal of Social Work and Social Policy. All rights reserved.
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