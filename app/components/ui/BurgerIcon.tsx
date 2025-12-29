import React from 'react';

export const BurgerIcon = ({ className = "w-6 h-6", strokeWidth = 2 }: { className?: string, strokeWidth?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 15h18" />
    <path d="M3 11h18" />
    <path d="M5.5 8.5c.5-2.5 2.5-4.5 6.5-4.5s6 2 6.5 4.5" />
    <path d="M6 19a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3" />
  </svg>
);