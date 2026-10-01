import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'red' | 'blue' | 'green' | 'none';
  interactive?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = 'none',
  interactive = true,
  className = '',
  ...props
}) => {
  const glowClasses = {
    red: 'glow-red border-brand-red/20',
    blue: 'glow-blue border-brand-blue/20',
    green: 'glow-green border-brand-green/20',
    none: '',
  };

  const cardStyle = interactive ? 'glass-card' : 'glass-panel rounded-3xl p-6';

  return (
    <div
      className={`${cardStyle} ${glowClasses[glow]} overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
