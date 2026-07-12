import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helperText,
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left font-sans">
      {label && (
        <label className="text-[14px] font-semibold text-[#495057]">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full h-[44px] px-3.5 bg-white border border-[#ced4da] rounded-input text-[#212529] placeholder-[#6c757d]/70 text-[15px] focus:outline-none focus:border-[#6c757d] focus:ring-1 focus:ring-[#6c757d] transition-all duration-200 disabled:bg-[#e9ecef] disabled:cursor-not-allowed",
          error && "border-[#dc3545] focus:border-[#dc3545] focus:ring-[#dc3545]",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-[12px] text-[#dc3545] font-medium leading-none">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[12px] text-[#6c757d] leading-none">
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
