import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'blue' | 'green';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'blue',
  className = '',
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const colors = {
    blue: 'border-brand-blue/30 border-t-brand-blue',
    red: 'border-brand-red/30 border-t-brand-red glow-red',
    green: 'border-brand-green/30 border-t-brand-green',
  };

  return (
    <div
      className={`rounded-full animate-spin ${sizes[size]} ${colors[variant]} ${className}`}
      style={{ borderStyle: 'solid' }}
    />
  );
};
