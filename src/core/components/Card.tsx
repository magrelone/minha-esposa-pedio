import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-theme-surface rounded-cute border border-theme-border/60 p-5 shadow-soft transition-all duration-300 ${
        hoverable
          ? "hover:shadow-float hover:-translate-y-1 hover:border-theme-primary/40 cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
