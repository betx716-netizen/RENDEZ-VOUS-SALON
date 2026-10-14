import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface MarqueeProps {
  items?: string[];
  className?: string;
  speed?: number; // duration in seconds
}

export const Marquee: React.FC<MarqueeProps> = ({
  items = [
    'Coiffure',
    'Tresses',
    'Perruques',
    'Manucure',
    'Maquillage',
    'Soins du visage',
    'Barbier',
  ],
  className = '',
  speed = 22,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // On duplique les items pour un défilement continu sans saut
  const repeated = [...items, ...items, ...items, ...items];

  // Ruban noir incliné, débordant légèrement de l'écran
  const ribbon = `relative -mx-4 w-[calc(100%+2rem)] -rotate-[1.5deg] bg-ink border-y-2 border-ink py-3 sm:py-4 select-none ${className}`;

  if (shouldReduceMotion) {
    return (
      <div className={`${ribbon} overflow-x-auto`}>
        <div className="flex items-center gap-6 px-8 whitespace-nowrap">
          {items.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="text-base sm:text-xl font-bold uppercase text-lime font-display"
            >
              {item} {idx !== items.length - 1 && '✦'}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${ribbon} overflow-hidden`}>
      <div className="flex w-max">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: speed,
          }}
          className="flex items-center gap-8 whitespace-nowrap pr-8 will-change-transform"
        >
          {repeated.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-8 text-base sm:text-xl font-bold uppercase text-lime font-display"
            >
              <span>{item}</span>
              <span className={idx % 2 === 0 ? 'text-candy' : 'text-sun'} aria-hidden="true">✦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
