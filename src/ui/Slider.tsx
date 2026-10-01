import React, { useId } from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  helperText?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  minLabel = 'Low',
  maxLabel = 'High',
  helperText
}) => {
  const inputId = useId();
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={inputId} className="text-xs font-semibold text-text-secondary">{label}</label>
        <span className="font-mono tabular-nums text-xs font-bold text-action-link bg-status-info-bg px-2 py-0.5 rounded border border-status-info-border">
          {value}
        </span>
      </div>

      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={helperText ? helperId : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-action-primary focus:outline-none focus:ring-1 focus:ring-focus-ring"
      />

      <div className="flex justify-between text-xs text-text-muted">
        <span>{min} ({minLabel})</span>
        <span>{max} ({maxLabel})</span>
      </div>

      {helperText && <span id={helperId} className="text-xs text-text-muted">{helperText}</span>}
    </div>
  );
};
export interface RatingMetricProps {
  label: string;
  value: number; // 1-5
}

export const RatingMetric: React.FC<RatingMetricProps> = ({ label, value }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <div
            key={star}
            className={`w-4 h-4 rounded-sm border ${
              star <= value
                ? 'bg-action-primary border-action-link'
                : 'bg-surface-subtle border-border-default'
            }`}
          />
        ))}
        <span className="text-sm font-bold text-text-secondary ml-1.5">{value}/5</span>
      </div>
    </div>
  );
};
