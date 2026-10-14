import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'alt' | 'bordered';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  className = '',
  children,
  ...props
}) => {
  const variants = {
    surface: 'bg-surface shadow-hard-md',
    alt: 'bg-surface-alt shadow-hard-sm',
    bordered: 'bg-surface shadow-hard-lg',
  };

  return (
    <div
      className={`rounded-[18px] border-2 border-ink p-6 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
