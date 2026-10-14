import React from 'react';
import { motion } from 'motion/react';
import { usePerformanceTier } from '../../lib/tier';

interface LogoProps {
  variant?: 'full' | 'icon' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  animated = false,
  className = '',
}) => {
  const tier = usePerformanceTier();
  const shouldAnimate = animated && tier !== 'lite';

  // Tailles du monogramme
  const dimensions = {
    sm: { icon: 28, text: 'text-base', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 56, text: 'text-3xl', gap: 'gap-3.5' },
  }[size];

  const mono = variant === 'monochrome';
  const tileColor = mono ? 'transparent' : '#6A4CF5'; // Violet
  const letterColor = mono ? 'currentColor' : '#FFFFFF';
  const detailColor = mono ? 'currentColor' : '#C6F432'; // Citron
  const inkColor = mono ? 'currentColor' : '#111111';

  // Monogramme R stylisé : la barre verticale forme le manche, la boucle supérieure intègre un ciseau/peigne stylisé
  const renderMonogram = () => {
    return (
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 select-none"
        aria-hidden="true"
      >
        {/* Ombre dure décalée puis tuile cerclée d'encre */}
        {!mono && <rect x="10" y="10" width="86" height="86" rx="22" fill={inkColor} />}
        <rect
          x="4"
          y="4"
          width="86"
          height="86"
          rx="22"
          fill={tileColor}
          stroke={inkColor}
          strokeWidth="5"
        />

        {/* Tracé de la barre verticale du R */}
        <motion.path
          d="M 32 25 L 32 75"
          stroke={letterColor}
          strokeWidth="8"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Boucle du R stylisée en boucle de ciseau / peigne */}
        <motion.path
          d="M 32 25 C 56 22, 68 34, 58 48 C 48 58, 33 54, 32 54"
          stroke={letterColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
        />

        {/* Jambe droite du R : lame croisée fine de ciseau */}
        <motion.path
          d="M 48 50 L 68 75"
          stroke={letterColor}
          strokeWidth="8"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        />

        {/* Dent de peigne 1 stylisée */}
        <motion.line
          x1="45"
          y1="32"
          x2="55"
          y2="34"
          stroke={detailColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={shouldAnimate ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        />

        {/* Dent de peigne 2 stylisée */}
        <motion.line
          x1="43"
          y1="40"
          x2="54"
          y2="42"
          stroke={detailColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={shouldAnimate ? { opacity: 0, scale: 0 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        />

        {/* Pivot de ciseau / point éclat doré */}
        <motion.circle
          cx="48"
          cy="50"
          r="5"
          fill={detailColor}
          stroke={inkColor}
          strokeWidth="2"
          initial={shouldAnimate ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 15 }}
        />
      </svg>
    );
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderMonogram()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${dimensions.gap} ${className}`}>
      {renderMonogram()}
      <div className="flex flex-col select-none leading-none">
        <span
          className={`font-display font-bold tracking-tight ${dimensions.text} ${
            variant === 'monochrome' ? 'text-current' : 'text-foreground'
          }`}
        >
          RDV <span className={variant === 'monochrome' ? 'text-current' : 'marker text-ink'}>Salon</span>
        </span>
        <span
          className={`text-[9px] uppercase tracking-wider font-bold mt-1 ${
            variant === 'monochrome' ? 'text-current opacity-70' : 'text-muted-foreground'
          }`}
        >
          Beauté & Coiffure
        </span>
      </div>
    </div>
  );
};
