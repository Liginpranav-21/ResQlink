import React from 'react';

interface BadgeProps {
  variant?: 'red' | 'blue' | 'green' | 'yellow' | 'slate';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className = '',
}) => {
  const variants = {
    red: 'bg-brand-red/10 text-brand-red border-brand-red/20',
    blue: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    green: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    yellow: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
    slate: 'bg-brand-border/20 text-brand-textSecondary border-brand-border/30',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
