import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface TracedUnderlineProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const TracedUnderline: React.FC<TracedUnderlineProps> = ({
  children,
  color = '#FFD23F',
  className = '',
}) => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite';

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-10 italic">{children}</span>
      <svg
        viewBox="0 0 200 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -bottom-2 left-0 w-full h-3.5 pointer-events-none overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M 2 10 C 50 14, 150 4, 198 11 C 140 15, 60 14, 10 13"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </span>
  );
};
