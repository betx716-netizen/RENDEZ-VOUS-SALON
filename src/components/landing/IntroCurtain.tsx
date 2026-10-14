import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../brand/Logo';
import { usePerformanceTier } from '../../lib/tier';

export const IntroCurtain: React.FC = () => {
  const tier = usePerformanceTier();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (tier === 'lite') return false;
    try {
      return !sessionStorage.getItem('rdv_intro_seen');
    } catch {
      return false;
    }
  });

  const [splitting, setSplitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Déclenche l'ouverture cinématique après 1.1s max
    const splitTimer = setTimeout(() => {
      setSplitting(true);
    }, 1100);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('rdv_intro_seen', 'true');
      } catch {
        // Ignorer
      }
    }, 1500);

    return () => {
      clearTimeout(splitTimer);
      clearTimeout(finishTimer);
    };
  }, [visible]);

  const handleDismiss = () => {
    setSplitting(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('rdv_intro_seen', 'true');
      } catch {
        // Ignorer
      }
    }, 300);
  };

  if (!visible || tier === 'lite') return null;

  return (
    <AnimatePresence>
      {!splitting ? (
        <motion.div
          key="intro-backdrop"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleDismiss}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background cursor-pointer select-none"
        >
          {/* Logo traçant */}
          <div className="flex flex-col items-center gap-4">
            <Logo variant="icon" size="xl" animated />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-display text-3xl font-bold text-foreground tracking-tight"
            >
              RDV <span className="text-primary">Salon</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Abidjan • L'expérience beauté
            </motion.p>
          </div>

          <div className="absolute bottom-8 text-[11px] text-muted-foreground/60">
            Toucher pour passer
          </div>
        </motion.div>
      ) : (
        /* Rideau qui se divise vers le haut et le bas */
        <div key="intro-curtain" className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ y: '0%' }}
            animate={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-background border-b border-border shadow-hard-lg"
          />
          <motion.div
            initial={{ y: '0%' }}
            animate={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-background border-t border-border shadow-hard-lg"
          />
        </div>
      )}
    </AnimatePresence>
  );
};
