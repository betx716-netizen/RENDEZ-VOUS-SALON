import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  const tier = usePerformanceTier();

  useEffect(() => {
    // Si la View Transitions API est supportée par le navigateur
    if (tier !== 'lite' && typeof document !== 'undefined' && 'startViewTransition' in document) {
      // Déclenche une transition de vue native du navigateur
      try {
        (document as any).startViewTransition?.(() => {});
      } catch {
        // Ignorer
      }
    }
  }, [tier]);

  if (tier === 'lite' || shouldReduceMotion) {
    return <div className="w-full min-h-[100dvh]">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full min-h-[100dvh]"
    >
      {children}
    </motion.div>
  );
};
