import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const NailPolishIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Vernis à ongles et manucure',
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
      {/* Capuchon fin et haut */}
      <motion.path
        d="M 43 16 L 57 16 C 58 16 59 17 59 18 L 56 46 L 44 46 L 41 18 C 41 17 42 16 43 16 Z"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      />

      {/* Anneau doré de bague du flacon */}
      <motion.rect
        x="42"
        y="46"
        width="16"
        height="5"
        rx="2"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      />

      {/* Flacon de verre arrondi en bas */}
      <motion.path
        d="M 33 51 C 33 51 31 75 32 80 C 33 86 38 88 50 88 C 62 88 67 86 68 80 C 69 75 67 51 67 51 Z"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />

      {/* Niveau de vernis rose à l'intérieur */}
      <motion.path
        d="M 36 65 C 44 63 56 67 64 65 C 64.5 73 63.5 82 50 82 C 36.5 82 35.5 73 36 65 Z"
        fill="#FF8AD8"
        fillOpacity="0.15"
        stroke="#111111"
        strokeWidth="1.6"
        strokeDasharray="3 2"
        initial={shouldReduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />

      {/* Goutte dorée suspendue ou tombante */}
      <motion.path
        d="M 76 60 C 76 60 82 68 82 72 C 82 75 79 78 76 78 C 73 78 70 75 70 72 C 70 68 76 60 76 60 Z"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0, y: -10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
      />
    </svg>
  );
};
