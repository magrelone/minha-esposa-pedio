import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium rounded-cute transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2 select-none shadow-sm";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 h-8",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-6 py-3 h-12",
  }[size];

  const variantClasses = {
    primary:
      "bg-theme-primary text-white hover:bg-theme-primary-hover shadow-soft hover:shadow-glow",
    secondary:
      "bg-theme-surface-card text-theme-text hover:bg-theme-primary-light border border-theme-border",
    outline:
      "border border-theme-border text-theme-text hover:bg-theme-surface-card hover:border-theme-primary",
    ghost:
      "bg-transparent text-theme-text hover:bg-theme-surface-card hover:text-theme-primary shadow-none",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  }[variant];

  return (
    <button
      className={`${base} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0 text-lg">{icon}</span>}
      {children}
    </button>
  );
};
