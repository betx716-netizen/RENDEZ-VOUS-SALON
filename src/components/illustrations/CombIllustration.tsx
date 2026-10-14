import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const CombIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Peigne professionnel à queue',
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
      {/* Dos principal du peigne et manche fin */}
      <motion.path
        d="M 18 82 L 40 60 C 42 58 48 56 55 57 L 82 62 C 86 63 88 60 86 56 C 82 48 76 43 68 40 L 48 34 C 42 32 38 34 35 37 L 14 78 C 12 82 14 86 18 82 Z"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Dents du peigne (dessinées en cascade régulière) */}
      {[
        { x1: 52, y1: 35, x2: 66, y2: 21 },
        { x1: 56, y1: 37, x2: 70, y2: 23 },
        { x1: 60, y1: 39, x2: 74, y2: 25 },
        { x1: 64, y1: 41, x2: 78, y2: 27 },
        { x1: 68, y1: 43, x2: 82, y2: 29 },
        { x1: 72, y1: 45, x2: 86, y2: 31 },
        { x1: 76, y1: 48, x2: 89, y2: 34 },
      ].map((line, idx) => (
        <motion.line
          key={idx}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#6A4CF5"
          strokeWidth="2"
          strokeLinecap="round"
          initial={shouldReduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: shouldReduce ? 0 : 0.3 + idx * 0.06 }}
        />
      ))}

      {/* Détail doré sur le manche */}
      <motion.circle
        cx="32"
        cy="68"
        r="3"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
      />
      <motion.circle
        cx="25"
        cy="75"
        r="2"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      />
    </svg>
  );
};
