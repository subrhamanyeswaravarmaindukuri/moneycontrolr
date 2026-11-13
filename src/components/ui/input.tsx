import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-apptext"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-apptext-light">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-11 rounded-btn border bg-surface px-3.5 text-sm text-apptext transition-colors",
              "placeholder:text-apptext-light",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
              "disabled:cursor-not-allowed disabled:bg-background/50 disabled:opacity-60",
              prefixIcon ? "pl-10" : "",
              suffixIcon ? "pr-10" : "",
              error
                ? "border-status-danger focus-visible:ring-status-danger"
                : "border-border hover:border-[#b8cfc2]",
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-apptext-light">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-status-danger">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-apptext-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

