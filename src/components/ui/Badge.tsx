import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'gold' | 'success' | 'muted';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
}) => {
  // Aplats francs + texte encre : lisibles sur n'importe quel fond
  const variants = {
    primary: 'bg-primary text-white',
    accent: 'bg-candy text-ink',
    gold: 'bg-sun text-ink',
    success: 'bg-lime text-ink',
    muted: 'bg-surface-alt text-ink',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-2 border-ink ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
