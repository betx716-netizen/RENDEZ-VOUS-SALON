import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Scissors, Star } from 'lucide-react';

// Formes géométriques cerclées d'encre qui flottent derrière le hero
export const FloatingShapes: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Léger effet de parallaxe sur le fond (desktop seulement)
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  const parallaxY1 = useTransform(scrollY, [0, 1000], [0, isDesktop ? -80 : 0]);
  const parallaxY2 = useTransform(scrollY, [0, 1000], [0, isDesktop ? 60 : 0]);

  const float = (y: number[], rotate: number[], duration: number) =>
    shouldReduceMotion
      ? {}
      : {
          animate: { y, rotate },
          transition: { repeat: Infinity, duration, ease: 'easeInOut' as const },
        };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {/* Rond rose en haut à droite */}
      <motion.div style={{ y: shouldReduceMotion ? 0 : parallaxY1 }} className="absolute -top-16 right-[6%] hidden md:block">
        <motion.div
          {...float([0, -14, 0], [0, 8, 0], 9)}
          className="w-40 h-40 rounded-full bg-candy border-2 border-ink shadow-hard-md"
        />
      </motion.div>

      {/* Carré citron incliné à gauche */}
      <motion.div style={{ y: shouldReduceMotion ? 0 : parallaxY2 }} className="absolute top-[38%] -left-8 hidden sm:block">
        <motion.div
          {...float([0, 18, 0], [12, -6, 12], 11)}
          className="w-24 h-24 rounded-[18px] bg-lime border-2 border-ink shadow-hard-md"
        />
      </motion.div>

      {/* Étoile jaune */}
      <motion.div
        {...float([0, -10, 0], [0, 20, 0], 7)}
        className="absolute top-[68%] left-[50%] hidden lg:flex w-14 h-14 rounded-full bg-sun border-2 border-ink items-center justify-center shadow-hard-sm"
      >
        <Star className="w-7 h-7 text-ink" />
      </motion.div>

      {/* Ciseaux dans une pastille violette */}
      <motion.div
        {...float([0, 12, 0], [-10, 10, -10], 8)}
        className="absolute bottom-24 left-[10%] hidden sm:flex w-14 h-14 rounded-[14px] bg-primary border-2 border-ink items-center justify-center shadow-hard-sm"
      >
        <Scissors className="w-7 h-7 text-white" />
      </motion.div>

      {/* Ruban zigzag en bas à droite */}
      <motion.svg
        {...float([0, -8, 0], [0, -4, 0], 10)}
        viewBox="0 0 120 30"
        className="absolute bottom-10 right-[12%] w-32 hidden md:block"
        fill="none"
      >
        <path d="M2 22 L17 8 L32 22 L47 8 L62 22 L77 8 L92 22 L107 8 L118 18" stroke="#111111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
};
