import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'quiet'
  | 'link'
  // Compatibility aliases
  | 'outline'
  | 'ghost'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  selected?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  selected,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const isSelected = selected ?? (props['aria-pressed'] === true || props['aria-pressed'] === 'true');

  const baseStyle =
    'inline-flex items-center justify-center font-semibold select-none rounded-md transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  // Primary action blue / Institutional navy: #1e40af
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-action-primary hover:bg-action-primary-hover active:bg-[#172554] text-text-inverse border border-transparent shadow-subtle',
    secondary:
      'bg-surface-raised hover:bg-action-secondary-hover active:bg-slate-200/70 text-text-primary border border-border-strong hover:border-slate-400 shadow-subtle',
    outline:
      'bg-surface-raised hover:bg-action-secondary-hover active:bg-slate-200/70 text-text-primary border border-border-strong hover:border-slate-400 shadow-subtle',
    tertiary:
      'bg-transparent hover:bg-surface-subtle active:bg-slate-200/60 text-text-secondary hover:text-text-primary border border-transparent',
    ghost:
      'bg-transparent hover:bg-surface-subtle active:bg-slate-200/60 text-text-secondary hover:text-text-primary border border-transparent',
    destructive:
      'bg-surface-raised hover:bg-red-50 active:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 shadow-subtle focus-visible:ring-red-600',
    danger:
      'bg-surface-raised hover:bg-red-50 active:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 shadow-subtle focus-visible:ring-red-600',
    quiet:
      'bg-transparent hover:bg-surface-subtle active:bg-slate-200/60 text-text-muted hover:text-text-primary border border-transparent',
    link:
      'bg-transparent text-action-primary hover:text-action-primary-hover underline-offset-2 hover:underline p-0 h-auto border-transparent font-semibold shadow-none focus-visible:ring-offset-1'
  };

  // Restrained selected / toggle treatments that clearly distinguish active state
  // without visually competing with the solid primary CTA (Institutional navy / #1e40af).
  let variantStyle = variants[variant];
  if (isSelected && variant !== 'primary') {
    if (variant === 'tertiary' || variant === 'quiet' || variant === 'ghost') {
      variantStyle =
        'bg-surface-raised hover:bg-action-secondary-hover active:bg-slate-200/70 text-action-primary border border-border-strong font-bold shadow-subtle';
    } else {
      variantStyle =
        'bg-blue-50/80 hover:bg-blue-100/70 active:bg-blue-100 text-action-primary border border-action-primary/40 font-bold shadow-subtle';
    }
  }

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-2.5 py-1 text-xs gap-1.5',
    md: 'h-9 px-3.5 py-1.5 text-xs sm:text-sm gap-2',
    lg: 'h-10 px-5 py-2 text-sm gap-2',
    icon: 'h-8 w-8 p-0 text-xs shrink-0'
  };

  const sizeStyle = variant === 'link' ? '' : sizes[size];
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
