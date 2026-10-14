import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const HairDryerIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Sèche-cheveux ionique de salon',
  animated = true,
}) => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite' || !animated;

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
      {/* Corps du sèche-cheveux */}
      <motion.path
        d="M 24 38 C 24 30 30 24 38 24 L 62 24 C 65 24 67 26 67 29 L 67 47 C 67 50 65 52 62 52 L 38 52 C 30 52 24 46 24 38 Z"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />

      {/* Buse avant */}
      <motion.path
        d="M 67 31 L 76 34 L 76 42 L 67 45"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Poignée ergonomique */}
      <motion.path
        d="M 40 52 L 44 76 C 44 79 47 81 50 81 L 54 81 C 57 81 59 79 59 76 L 55 52"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      />

      {/* Anneau doré arrière (filtre d'air) */}
      <motion.circle
        cx="28"
        cy="38"
        r="7"
        stroke="#FFD23F"
        strokeWidth="2"
        fill="none"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      />
      <circle cx="28" cy="38" r="2" fill="#FFD23F" />

      {/* Ondes de flux d'air chaud */}
      <motion.path
        d="M 81 33 C 85 33 87 35 90 35"
        stroke="#FFD23F"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />
      <motion.path
        d="M 81 38 C 86 38 88 40 92 40"
        stroke="#111111"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />
      <motion.path
        d="M 81 43 C 85 43 87 45 90 45"
        stroke="#FFD23F"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      />
    </svg>
  );
};
