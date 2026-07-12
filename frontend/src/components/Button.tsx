import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium font-sans text-button rounded-btn transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95';

  const variants = {
    primary: 'bg-[#6c757d] hover:bg-[#5a6268] text-white shadow-sm border border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-[#212529] border border-[#ced4da] shadow-sm',
    outline: 'bg-transparent hover:bg-gray-100/50 text-[#495057] border border-[#ced4da]',
    danger: 'bg-[#dc3545] hover:bg-[#c82333] text-white shadow-sm border border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-[#495057]'
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-[44px] px-6 text-[15px]',
    lg: 'h-[48px] px-8 text-[16px]',
    icon: 'w-10 h-10 p-0 rounded-full'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};
