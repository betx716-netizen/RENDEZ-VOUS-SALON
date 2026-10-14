import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface WordRevealProps {
  text: string;
  highlightWords?: string[];
  className?: string;
  highlightClassName?: string;
  delayOffset?: number;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  highlightWords = [],
  className = '',
  highlightClassName = 'marker text-ink font-bold rounded-[6px]',
  delayOffset = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(' ');

  const normalize = (w: string) =>
    w.toLowerCase().replace(/[.,!?:;«»"]/g, '').trim();

  const highlightedTokens = highlightWords
    .flatMap((hw) => hw.split(/\s+/))
    .map(normalize);

  const isHighlighted = (word: string) => {
    const clean = normalize(word);
    return highlightedTokens.includes(clean);
  };

  return (
    <span className={`inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 ${className}`}>
      {words.map((word, index) => {
        const highlighted = isHighlighted(word);
        return (
          <motion.span
            key={`${word}-${index}`}
            // Entrée « pop » : chaque mot tombe en place avec un léger basculement
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 40,
              rotate: shouldReduceMotion ? 0 : index % 2 === 0 ? -6 : 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: highlighted && !shouldReduceMotion ? -2 : 0,
            }}
            transition={
              shouldReduceMotion
                ? {
                    duration: 0.3,
                    delay: delayOffset + index * 0.08,
                    type: 'tween',
                  }
                : {
                    duration: 0.6,
                    delay: delayOffset + index * 0.08,
                    type: 'spring',
                    stiffness: 200,
                    damping: 14,
                  }
            }
            className={`inline-block ${highlighted ? highlightClassName : ''}`}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
};
