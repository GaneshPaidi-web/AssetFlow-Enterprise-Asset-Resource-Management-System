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
        "bg-white border border-[#f1f5f9] rounded-card p-6 shadow-custom flex flex-col gap-4 text-left font-sans transition-all duration-300 hover:shadow-lg hover:-translate-y-[2px]",
        className
      )}
      {...props}
    >
      {/* Card Header */}
      {(title || subtitle || headerActions) && (
        <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] pb-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-cardTitle font-semibold text-[#0f172a] tracking-tight leading-tight m-0">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[14px] text-slate-500 font-medium m-0 mt-1">
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
      <div className="flex-1 min-w-0 text-slate-700 text-[15px]">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="border-t border-[#f1f5f9] pt-4 mt-2 flex items-center justify-end gap-2 text-small text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
