import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
