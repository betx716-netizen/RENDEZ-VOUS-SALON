import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

export const CustomCursor: React.FC = () => {
  const tier = usePerformanceTier();
  const [enabled, setEnabled] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Position du point (immédiat)
  const [pos, setPos] = useState({ x: -100, y: -100 });

  // Position du halo (ressort fluide)
  const springX = useSpring(-100, { stiffness: 450, damping: 30 });
  const springY = useSpring(-100, { stiffness: 450, damping: 30 });

  useEffect(() => {
    // Uniquement pour le palier 'immersive' sur appareil à souris précise (pointer: fine)
    if (tier !== 'immersive') {
      setEnabled(false);
      return;
    }

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX);
      springY.set(e.clientY);

      // Détection de survol d'élément interactif
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input, select');
      if (interactive) {
        setIsHovered(true);
        const textContent = interactive.textContent?.toLowerCase() || '';
        const customText = interactive.getAttribute('data-cursor');

        if (customText) {
          setCursorText(customText);
        } else if (textContent.includes('réserv') || textContent.includes('salon')) {
          setCursorText('Réserver');
        } else if (textContent.includes('voir') || textContent.includes('comment')) {
          setCursorText('Voir');
        } else if (textContent.includes('copi')) {
          setCursorText('Copier');
        } else {
          setCursorText('');
        }
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [tier, springX, springY]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Point central précis */}
      <div
        style={{
          transform: `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0)`,
        }}
        className="absolute w-1.5 h-1.5 rounded-full bg-primary"
      />

      {/* 2. Halo fluide traçant */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? (cursorText ? 2.8 : 1.8) : 1,
          backgroundColor: isHovered ? 'rgba(106, 76, 245, 0.15)' : 'rgba(106, 76, 245, 0.06)',
          borderColor: isHovered ? 'rgba(106, 76, 245, 0.4)' : 'rgba(106, 76, 245, 0.2)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="absolute w-8 h-8 rounded-full border border-primary/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none shadow-hard-sm"
      >
        {cursorText && isHovered && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[8px] font-bold uppercase tracking-wider text-primary select-none whitespace-nowrap"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};
