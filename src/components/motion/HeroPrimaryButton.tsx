import React from 'react';
import { Link } from 'react-router-dom';

interface HeroPrimaryButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const HeroPrimaryButton: React.FC<HeroPrimaryButtonProps> = ({
  to,
  children,
  className = '',
}) => {
  const isHash = to.startsWith('#');

  // Gros bouton citron : se soulève au survol, s'enfonce au clic (utilitaire « press »)
  const baseClasses = `press group w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 rounded-full bg-lime text-ink border-2 border-ink font-bold text-base sm:text-lg shadow-hard-md min-h-[56px] ${className}`;

  const content = (
    <span className="flex items-center justify-center gap-2 [&>svg]:transition-transform group-hover:[&>svg]:translate-x-1">
      {children}
    </span>
  );

  return isHash ? (
    <a href={to} className={baseClasses}>
      {content}
    </a>
  ) : (
    <Link to={to} className={baseClasses}>
      {content}
    </Link>
  );
};
