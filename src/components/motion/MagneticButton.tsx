import React, { useRef, useState } from 'react';
import { motion, useSpring, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
}) => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite';
  const btnRef = useRef<HTMLDivElement>(null);

  const x = useSpring(0, { stiffness: 250, damping: 20 });
  const y = useSpring(0, { stiffness: 250, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Déplacement magnétique (distance limitée à ±12px)
    const distanceX = (e.clientX - centerX) * 0.35;
    const distanceY = (e.clientY - centerY) * 0.35;
    x.set(Math.max(-12, Math.min(12, distanceX)));
    y.set(Math.max(-12, Math.min(12, distanceY)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      onClick={onClick}
      className={`relative inline-block cursor-pointer select-none ${className}`}
    >
      <div className="relative overflow-hidden rounded-full">
        {/* Reflet brillant qui traverse toutes les 3 secondes */}
        {!shouldReduce && (
          <motion.div
            animate={{
              x: ['-120%', '220%'],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeInOut',
            }}
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none z-10"
          />
        )}
        {children}
      </div>
    </motion.div>
  );
};
