import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'bg-surface-raised rounded-lg border border-border-strong overflow-hidden';
  const hoverStyle = hoverable ? 'transition-colors hover:border-slate-400' : '';

  return (
    <div className={`${baseStyle} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`px-5 py-3 border-b border-border-default bg-surface-subtle font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};
