import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onActionClick
}) => {
  return (
    <div className="bg-white border border-[#dee2e6] rounded-card p-12 text-center font-sans shadow-custom flex flex-col items-center justify-center gap-5 max-w-xl mx-auto my-8 select-none">
      {/* Circle Icon Container */}
      <div className="w-16 h-16 rounded-full bg-[#e9ecef] text-[#6c757d] flex items-center justify-center">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>

      {/* Description text block */}
      <div className="space-y-1.5">
        <h3 className="text-cardTitle font-bold text-[#212529] tracking-tight">
          {title}
        </h3>
        <p className="text-[15px] text-[#6c757d] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {/* Primary Action Button */}
      {actionLabel && onActionClick && (
        <Button onClick={onActionClick} variant="primary" size="md" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
