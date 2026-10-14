import React from 'react';

interface SeparatorProps {
  fillColor?: string;
  bgColor?: string;
  className?: string;
  flip?: boolean;
}

// 1. Vague organique douce
export const WaveSeparator: React.FC<SeparatorProps> = ({
  fillColor = '#FAF2E6',
  className = '',
  flip = false,
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-8 sm:h-14 md:h-20 ${flip ? 'rotate-180' : ''}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 C320,68 640,84 960,42 C1200,10 1360,48 1440,64 L1440,84 L0,84 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

// 2. Arche galbée (transition vers section sombre)
export const ArchSeparator: React.FC<SeparatorProps> = ({
  fillColor = '#111111',
  className = '',
  flip = false,
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-10 sm:h-16 md:h-24 ${flip ? 'rotate-180' : ''}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 C420,86 1020,86 1440,0 L1440,96 L0,96 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

// 3. Galet asymétrique doux
export const PebbleSeparator: React.FC<SeparatorProps> = ({
  fillColor = '#FFFDF5',
  className = '',
  flip = false,
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 1440 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-8 sm:h-12 md:h-18 ${flip ? 'rotate-180' : ''}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,24 C480,72 960,-12 1440,48 L1440,72 L0,72 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};
