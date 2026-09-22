import React, { useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const feedbackId = `${controlId}-feedback`;
    const ariaDescribedBy = [describedBy, error || helperText ? feedbackId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={controlId} className="text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <select
          id={controlId}
          ref={ref}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full h-9 px-3 py-1.5 border rounded-md bg-surface-raised text-sm text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-focus-ring focus:border-action-primary
            ${error
              ? 'border-action-danger focus:border-action-danger focus:ring-rose-200'
              : 'border-border-default hover:border-border-strong'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span id={feedbackId} className="text-xs font-semibold text-action-danger">{error}</span>}
        {!error && helperText && <span id={feedbackId} className="text-xs text-text-muted">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, className = '', id, 'aria-describedby': describedBy, ...props }, ref) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const feedbackId = `${controlId}-feedback`;
    const ariaDescribedBy = [describedBy, error || helperText ? feedbackId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={controlId} className="text-xs font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <input
          id={controlId}
          ref={ref}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full h-9 px-3 py-1.5 border rounded-md bg-surface-raised text-sm text-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-focus-ring focus:border-action-primary
            ${error
              ? 'border-action-danger focus:border-action-danger focus:ring-rose-200'
              : 'border-border-default hover:border-border-strong'
            }
            ${className}
          `}
          {...props}
        />
        {error && <span id={feedbackId} className="text-xs font-semibold text-action-danger">{error}</span>}
        {!error && helperText && <span id={feedbackId} className="text-xs text-text-muted">{helperText}</span>}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';
