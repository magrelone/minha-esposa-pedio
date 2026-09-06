import React from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex justify-between items-center text-xs text-theme-text-muted">
        <span className="font-medium text-theme-text">{label}</span>
        <span className="font-mono bg-theme-surface-card px-2 py-0.5 rounded-md text-theme-primary font-semibold border border-theme-border/50 text-[11px]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-theme-border rounded-lg appearance-none cursor-pointer accent-theme-primary focus:outline-none transition-colors"
      />
    </div>
  );
};
