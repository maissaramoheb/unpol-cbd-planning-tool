import React, { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
            {label}{props.required && <span className="ms-1 text-status-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={controlId}
          ref={ref}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? true : undefined}
          className={`
            w-full min-h-24 resize-y px-3 py-2 leading-relaxed border rounded-md bg-surface-raised text-sm text-text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:text-text-disabled placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-action-primary
            ${error
              ? 'border-action-danger focus:border-action-danger focus:ring-status-danger'
              : 'border-border-default hover:border-border-strong'
            }
            ${className}
          `}
          {...props}
        />
        {error && <span id={feedbackId} className="text-xs font-semibold text-status-danger">{error}</span>}
        {!error && helperText && <span id={feedbackId} className="text-xs text-text-muted">{helperText}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
