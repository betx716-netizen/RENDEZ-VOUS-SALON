import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const MakeupBrushIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Pinceau de maquillage professionnel',
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
      {/* Manche conique fin */}
      <motion.path
        d="M 22 84 L 46 60 C 47 59 48 57 48 55 L 43 50 L 17 76 C 15 78 15 81 17 83 C 19 85 21 85 22 84 Z"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Virole métallique dorée */}
      <motion.path
        d="M 43 50 L 48 55 L 56 47 L 51 42 Z"
        fill="#FFD23F"
        stroke="#FFD23F"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      />

      {/* Poils doux du pinceau (houppette) */}
      <motion.path
        d="M 51 42 C 55 35 62 25 74 18 C 79 15 84 17 85 22 C 86 34 78 41 71 45 C 67 48 60 48 56 47 Z"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.08"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />

      {/* Lignes intérieures de texture soyeuse */}
      <motion.path
        d="M 58 39 C 64 33 71 27 77 24"
        stroke="#111111"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
      <motion.path
        d="M 64 42 C 68 38 73 34 78 32"
        stroke="#111111"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />

      {/* Nuage de poudre doré stylisé */}
      <motion.circle
        cx="82"
        cy="15"
        r="2"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      />
      <motion.circle
        cx="88"
        cy="21"
        r="2.5"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
      />
      <motion.circle
        cx="87"
        cy="13"
        r="1.5"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      />
    </svg>
  );
};
