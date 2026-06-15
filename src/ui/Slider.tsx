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
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">{label}</label>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      <div className="flex justify-between text-[11px] font-semibold text-slate-400">
        <span>{min} ({minLabel})</span>
        <span>{max} ({maxLabel})</span>
      </div>

      {helperText && <span id={helperId} className="text-xs text-slate-400 mt-0.5">{helperText}</span>}
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
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1">
        {stars.map((star) => (
          <div
            key={star}
            className={`w-4 h-4 rounded-sm border ${
              star <= value
                ? 'bg-blue-600 border-blue-700'
                : 'bg-slate-100 border-slate-200'
            }`}
          />
        ))}
        <span className="text-sm font-bold text-slate-700 ml-1.5">{value}/5</span>
      </div>
    </div>
  );
};
