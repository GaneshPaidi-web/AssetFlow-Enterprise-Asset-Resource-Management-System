import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  headerActions,
  footer,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-[#dee2e6] rounded-card p-6 shadow-custom flex flex-col gap-4 text-left font-sans transition-all duration-200 hover:shadow-md",
        className
      )}
      {...props}
    >
      {/* Card Header */}
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between gap-4 border-b border-[#dee2e6] pb-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-cardTitle font-semibold text-[#212529] tracking-tight leading-tight m-0">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[14px] text-[#6c757d] font-medium m-0 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="flex-1 min-w-0 text-[#495057] text-[15px]">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="border-t border-[#dee2e6] pt-4 mt-2 flex items-center justify-end gap-2 text-small text-[#6c757d]">
          {footer}
        </div>
      )}
    </div>
  );
};
