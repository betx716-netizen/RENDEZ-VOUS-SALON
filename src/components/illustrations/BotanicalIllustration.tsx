import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const BotanicalIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Fleur de karité et soin naturel',
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
      {/* Tige douce */}
      <motion.path
        d="M 28 86 C 36 68 45 52 56 38"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Feuille inférieure gauche */}
      <motion.path
        d="M 37 68 C 22 66 18 52 24 45 C 32 45 38 56 42 63"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.08"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Feuille droite */}
      <motion.path
        d="M 46 54 C 62 52 66 38 60 31 C 52 31 46 42 42 49"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.08"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Fleur centrale au sommet */}
      <motion.path
        d="M 56 38 C 48 30 46 18 54 14 C 62 18 60 30 56 38 Z"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.12"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d="M 56 38 C 66 32 78 30 82 38 C 76 44 64 42 56 38 Z"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FF8AD8"
        fillOpacity="0.12"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      {/* Cœur de fleur pistil doré */}
      <motion.circle
        cx="56"
        cy="38"
        r="4"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
      />
      <motion.circle
        cx="53"
        cy="24"
        r="1.8"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.85, type: 'spring' }}
      />
    </svg>
  );
};
