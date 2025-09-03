import React from 'react';

interface LogoProps {
  className?: string;
}

export const JournalLogo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Custom SVG Logo */}
      <svg 
        width="48" 
        height="48" 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mr-3"
      >
        {/* African continent outline */}
        <path 
          d="M24 4C19.5 4 16 6.5 14 10C12.5 12 11 14.5 11.5 17.5C12 20.5 13.5 22.5 14.5 25C15.2 26.8 15.8 28.8 17 30.5C18.5 32.8 20.5 34.5 22.5 36.2C23.2 36.8 23.8 37.3 24 37.8C24.2 37.3 24.8 36.8 25.5 36.2C27.5 34.5 29.5 32.8 31 30.5C32.2 28.8 32.8 26.8 33.5 25C34.5 22.5 36 20.5 36.5 17.5C37 14.5 35.5 12 34 10C32 6.5 28.5 4 24 4Z" 
          fill="#16a34a" 
          stroke="#065f46" 
          strokeWidth="1"
        />
        
        {/* Ubuntu symbol - interconnected circles representing community */}
        <circle cx="20" cy="16" r="2.5" fill="#ffffff" opacity="0.9" />
        <circle cx="28" cy="16" r="2.5" fill="#ffffff" opacity="0.9" />
        <circle cx="24" cy="24" r="2.5" fill="#ffffff" opacity="0.9" />
        
        {/* Connecting lines representing unity and connection */}
        <path 
          d="M22.5 16L21.5 22.5M25.5 16L26.5 22.5M20 18.5L24 21.5M28 18.5L24 21.5" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          opacity="0.8"
        />
        
        {/* Traditional pattern elements */}
        <circle cx="18" cy="28" r="1" fill="#dc2626" />
        <circle cx="30" cy="28" r="1" fill="#dc2626" />
        <circle cx="24" cy="32" r="1" fill="#dc2626" />
        
        {/* Book/knowledge symbol at the bottom */}
        <rect x="20" y="38" width="8" height="1.5" rx="0.5" fill="#16a34a" />
        <rect x="19" y="40" width="10" height="1.5" rx="0.5" fill="#16a34a" />
        <rect x="18" y="42" width="12" height="1.5" rx="0.5" fill="#16a34a" />
      </svg>
      
      {/* Journal abbreviation/title */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white leading-tight">
          <span className="text-accent-green">PAJSWSP</span>
        </h1>
        <p className="text-xs text-neutral-300 leading-tight">
          African Journal
        </p>
      </div>
    </div>
  );
};
