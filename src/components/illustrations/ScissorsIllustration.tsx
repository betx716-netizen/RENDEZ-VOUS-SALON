import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const ScissorsIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Ciseaux de coiffure professionnels',
  animated = true,
}) => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite' || !animated;

  const strokeTransition = {
    duration: 1.1,
    ease: 'easeInOut' as const,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role={title ? 'img' : 'presentation'}
      aria-hidden={!title}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id="sc-blade-grad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8AD8" />
          <stop offset="100%" stopColor="#6A4CF5" />
        </linearGradient>
      </defs>

      {/* Lame 1 & Anneau inférieur */}
      <motion.path
        d="M 30 75 C 22 75 16 69 16 61 C 16 53 22 47 30 47 C 36 47 41 50 44 55 L 78 22 C 81 19 86 21 86 25 C 86 27 84 30 81 33 L 53 61 C 49 66 43 75 30 75 Z"
        stroke="url(#sc-blade-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={strokeTransition}
      />

      {/* Lame 2 & Anneau supérieur */}
      <motion.path
        d="M 30 25 C 22 25 16 31 16 39 C 16 47 22 53 30 53 C 36 53 41 50 44 45 L 78 78 C 81 81 86 79 86 75 C 86 73 84 70 81 67 L 53 39 C 49 34 43 25 30 25 Z"
        stroke="url(#sc-blade-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...strokeTransition, delay: 0.15 }}
      />

      {/* Vis de serrage centrale dorée (pivot de précision) */}
      <motion.circle
        cx="48.5"
        cy="50"
        r="4"
        fill="#FFD23F"
        stroke="#6A4CF5"
        strokeWidth="1.5"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 18 }}
      />
      <circle cx="48.5" cy="50" r="1.5" fill="#FFFFFF" />

      {/* Éclat doré décoratif */}
      <motion.path
        d="M 78 44 L 80 47 L 83 48 L 80 49 L 78 52 L 76 49 L 73 48 L 76 47 Z"
        fill="#FFD23F"
        initial={shouldReduce ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      />
    </svg>
  );
};
