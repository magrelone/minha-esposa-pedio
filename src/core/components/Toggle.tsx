import React from "react";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center justify-between gap-3 cursor-pointer py-1.5 select-none ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-theme-text">{label}</span>
        {description && (
          <span className="text-xs text-theme-text-muted">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-theme-primary" : "bg-theme-border"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
};
