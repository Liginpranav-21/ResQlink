import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'emergency' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.5)] border border-brand-blue/20',
    emergency: 'bg-brand-red hover:bg-brand-red/90 text-white shadow-[0_4px_20px_-4px_rgba(255,59,48,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(255,59,48,0.5)] border border-brand-red/20 glow-red',
    outline: 'border border-brand-border bg-transparent hover:bg-brand-surface text-brand-textPrimary hover:border-brand-textSecondary/30',
    ghost: 'bg-transparent hover:bg-brand-surface/40 text-brand-textSecondary hover:text-brand-textPrimary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5 rounded-xl',
    md: 'px-6 py-3 text-base gap-2 rounded-2xl',
    lg: 'px-8 py-4 text-lg gap-2.5 rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex items-center">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex items-center">{icon}</span>}
    </button>
  );
};
