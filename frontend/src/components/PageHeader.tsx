import React from 'react';
import { cn } from '../utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#dee2e6] pb-6 mb-8 text-left font-sans select-none", className)}>
      <div className="min-w-0">
        <h1 className="text-3xl md:text-[36px] font-bold text-[#212529] tracking-tight leading-tight m-0">
          {title}
        </h1>
        {description && (
          <p className="text-[16px] text-[#6c757d] font-medium m-0 mt-1.5 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
