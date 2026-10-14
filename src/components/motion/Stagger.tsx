import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  viewportOnce?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.12,
  className = '',
  viewportOnce = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewportOnce, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerCardProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerCard: React.FC<StaggerCardProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 35,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { type: 'tween', duration: 0.3 }
        : { type: 'spring', stiffness: 220, damping: 18 },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.02,
              transition: { type: 'spring', stiffness: 350, damping: 20 },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              y: -4,
              scale: 0.98,
              transition: { type: 'spring', stiffness: 400, damping: 20 },
            }
      }
      className={`group transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(245,158,11,0.15)] active:shadow-[0_8px_20px_rgba(245,158,11,0.2)] ${className}`}
    >
      {children}
    </motion.div>
  );
};
