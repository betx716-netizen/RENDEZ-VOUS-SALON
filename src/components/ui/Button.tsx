import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-full min-h-[44px] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none';

  // Variantes « pleines » : bordure encre + ombre dure qui s'enfonce au clic
  const variants = {
    primary: 'press bg-primary text-white border-2 border-ink shadow-hard-md',
    secondary: 'press bg-surface text-ink border-2 border-ink shadow-hard-md',
    accent: 'press bg-lime text-ink border-2 border-ink shadow-hard-md',
    outline: 'bg-transparent hover:bg-surface-alt text-ink border-2 border-ink transition-colors',
    ghost: 'bg-transparent hover:bg-surface-alt text-ink transition-colors',
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 min-h-[44px]',
    md: 'text-sm px-6 py-2.5 min-h-[44px]',
    lg: 'text-base px-8 py-3.5 min-h-[52px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
