import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const SparkleIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Éclat de brillance et satisfaction',
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
      {/* Grande étoile à 4 branches galbée */}
      <motion.path
        d="M 50 14 C 50 32 38 45 20 50 C 38 55 50 68 50 86 C 50 68 62 55 80 50 C 62 45 50 32 50 14 Z"
        stroke="#FFD23F"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FFD23F"
        fillOpacity="0.12"
        initial={shouldReduce ? false : { pathLength: 0, rotate: -15 }}
        animate={{ pathLength: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      {/* Cœur éclat central or pur */}
      <motion.circle
        cx="50"
        cy="50"
        r="4.5"
        fill="#FFD23F"
        stroke="#111111"
        strokeWidth="1.2"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      />

      {/* Petite étoile secondaire en haut à droite (rose) */}
      <motion.path
        d="M 76 20 C 76 26 71 30 65 32 C 71 34 76 38 76 44 C 76 38 81 34 87 32 C 81 30 76 26 76 20 Z"
        stroke="#111111"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.15"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
      />

      {/* Petite étoile tertiaire en bas à gauche (violet) */}
      <motion.path
        d="M 26 66 C 26 70 22 73 18 75 C 22 77 26 80 26 84 C 26 80 30 77 34 75 C 30 73 26 70 26 66 Z"
        stroke="#6A4CF5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#6A4CF5"
        fillOpacity="0.15"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.75, type: 'spring' }}
      />
    </svg>
  );
};
