import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none';
  className?: string;
  viewportOnce?: boolean;
}

export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = '',
  viewportOnce = true,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getInitial = () => {
    if (shouldReduceMotion) {
      return { opacity: 0 };
    }
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 40 };
      case 'down':
        return { opacity: 0, y: -40 };
      case 'left':
        return { opacity: 0, x: -40 };
      case 'right':
        return { opacity: 0, x: 40 };
      case 'zoom':
        return { opacity: 0, scale: 0.92 };
      case 'none':
      default:
        return { opacity: 0 };
    }
  };

  const getTarget = () => {
    if (shouldReduceMotion) {
      return { opacity: 1 };
    }
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'zoom':
        return { opacity: 1, scale: 1 };
      case 'none':
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getTarget()}
      viewport={{ once: viewportOnce, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
