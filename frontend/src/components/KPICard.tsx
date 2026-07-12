import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNegative?: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  className,
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-[#6c757d]',
  iconBgColor = 'bg-[#e9ecef]',
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-[#dee2e6] rounded-card p-6 shadow-custom flex items-center gap-5 text-left font-sans transition-all duration-200 hover:shadow-md hover:scale-[1.01] min-h-[110px]",
        className
      )}
      {...props}
    >
      {/* Icon Wrapper */}
      <div className={cn("w-14 h-14 rounded-btn flex items-center justify-center shrink-0 shadow-inner", iconBgColor)}>
        <Icon className={cn("w-7 h-7 stroke-[1.75]", iconColor)} />
      </div>

      {/* Info Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#6c757d] uppercase tracking-wider truncate m-0 mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-3xl font-bold text-[#212529] tracking-tight leading-none m-0">
            {value}
          </h2>
          {trend && (
            <span
              className={cn(
                "text-[12px] font-bold px-2 py-0.5 rounded-full",
                trend.isPositive && "bg-[#198754]/10 text-[#198754]",
                trend.isNegative && "bg-[#dc3545]/10 text-[#dc3545]",
                !trend.isPositive && !trend.isNegative && "bg-[#6c757d]/10 text-[#6c757d]"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
