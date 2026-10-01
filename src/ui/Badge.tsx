import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'slate' | 'green' | 'amber' | 'rose' | 'teal';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  className = ''
}) => {
  const baseStyle = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border select-none';

  const variants = {
    blue: 'bg-status-info-bg text-action-link border-status-info-border',
    slate: 'bg-surface-subtle text-text-secondary border-border-default',
    green: 'bg-status-success-bg text-status-success border-status-success-border',
    amber: 'bg-status-warning-bg text-status-warning border-status-warning-border',
    rose: 'bg-status-danger-bg text-status-danger border-status-danger-border',
    teal: 'bg-accent-teal-bg text-accent-teal border-accent-teal-border'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
