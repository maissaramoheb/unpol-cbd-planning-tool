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
          <label htmlFor={controlId} className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={controlId}
          ref={ref}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm text-sm transition-colors focus:outline-none focus:ring-2
            ${error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'
            }
            ${className}
          `}
          {...props}
        />
        {error && <span id={feedbackId} className="text-xs font-semibold text-rose-500">{error}</span>}
        {!error && helperText && <span id={feedbackId} className="text-xs text-slate-400">{helperText}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
