import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface IllustrationProps {
  size?: number | string;
  className?: string;
  title?: string;
  animated?: boolean;
}

export const MirrorIllustration: React.FC<IllustrationProps> = ({
  size = 64,
  className = '',
  title = 'Miroir à main de beauté',
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
      {/* Cadre ovale du miroir */}
      <motion.ellipse
        cx="50"
        cy="40"
        rx="26"
        ry="30"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Cerclage intérieur doré */}
      <motion.ellipse
        cx="50"
        cy="40"
        rx="21"
        ry="25"
        stroke="#FFD23F"
        strokeWidth="1.5"
        strokeDasharray="4 2"
        fill="none"
        initial={shouldReduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      />

      {/* Manche galbé */}
      <motion.path
        d="M 46 70 L 46 86 C 46 89 48 91 50 91 C 52 91 54 89 54 86 L 54 70"
        stroke="#6A4CF5"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* Bouton de manche or */}
      <motion.circle
        cx="50"
        cy="91"
        r="2.5"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
      />

      {/* Reflets obliques sur le verre */}
      <motion.line
        x1="40"
        y1="25"
        x2="60"
        y2="45"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      />
      <motion.line
        x1="48"
        y1="23"
        x2="64"
        y2="39"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={shouldReduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      />

      {/* Étoile de brillance dorée en haut à droite */}
      <motion.path
        d="M 72 18 L 74 21 L 77 22 L 74 23 L 72 26 L 70 23 L 67 22 L 70 21 Z"
        fill="#FFD23F"
        initial={shouldReduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
      />
    </svg>
  );
};
