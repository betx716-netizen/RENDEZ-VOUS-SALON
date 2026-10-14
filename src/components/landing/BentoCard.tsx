import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const tier = usePerformanceTier();
  const shouldReduce = useReducedMotion() || tier === 'lite';
  const cardRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Inclinaison 3D subtile (max 4° pour rester élégant et anti-slop)
    if (tier === 'immersive') {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rx = -((y - centerY) / centerY) * 4;
      const ry = ((x - centerX) / centerX) * 4;
      setTilt({ rx, ry });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current || e.touches.length === 0) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const rx = Math.max(-3, Math.min(3, -((y - rect.height / 2) / (rect.height / 2)) * 3));
    const ry = Math.max(-3, Math.min(3, ((x - rect.width / 2) / (rect.width / 2)) * 3));
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
    setMousePos({ x: -200, y: -200 });
  };

  const handleMouseEnter = () => {
    if (tier !== 'lite') setIsHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        perspective: 1000,
        transform: tier === 'immersive' && isHovered ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` : undefined,
      }}
      className={`relative rounded-[18px] p-[1.5px] transition-all duration-300 group ${className}`}
    >
      {/* Bordure dégradée animée au survol */}
      <div
        className={`absolute inset-0 rounded-[18px] bg-lime/30 transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-100 from-primary/50 via-accent/40 to-gold/50' : 'opacity-40'
        }`}
      />

      {/* Projecteur lumineux qui suit le curseur (Spotlight en mode immersive) */}
      {tier === 'immersive' && isHovered && (
        <div
          className="absolute inset-0 rounded-[18px] pointer-events-none transition-opacity duration-300 opacity-100 overflow-hidden"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(106, 76, 245, 0.12), transparent 70%)`,
          }}
        />
      )}

      {/* Contenu de la carte avec fond surface et bordure douce */}
      <div className="relative h-full w-full rounded-[18px] bg-surface p-7 sm:p-8 border-2 border-border shadow-hard-sm hover:shadow-hard-md transition-shadow overflow-hidden flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
};
