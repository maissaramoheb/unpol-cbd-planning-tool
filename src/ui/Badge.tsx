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
    blue: 'bg-blue-50/70 text-blue-700 border-blue-200/80',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    green: 'bg-emerald-50/70 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50/70 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50/70 text-rose-700 border-rose-200/80',
    teal: 'bg-teal-50/70 text-teal-700 border-teal-200/80'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
