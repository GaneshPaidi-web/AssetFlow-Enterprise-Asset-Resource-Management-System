import React from 'react';
import { cn } from '../utils/cn';
import type { AssetStatus } from '../types';

interface StatusBadgeProps {
  status: AssetStatus | 'Active' | 'Returned' | 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles: Record<string, string> = {
    // Asset statuses
    Available: 'bg-[#198754]/10 text-[#198754] border border-[#198754]/20',
    Allocated: 'bg-[#0d6efd]/10 text-[#0d6efd] border border-[#0d6efd]/20',
    Maintenance: 'bg-[#dc3545]/10 text-[#dc3545] border border-[#dc3545]/20',
    Reserved: 'bg-[#ffc107]/10 text-[#b25e00] border border-[#ffc107]/20', // darker yellow text for contrast
    Disposed: 'bg-[#6c757d]/10 text-[#6c757d] border border-[#6c757d]/20',
    Lost: 'bg-[#343a40]/10 text-[#343a40] border border-[#343a40]/20',

    // Allocation/Booking/Transfer statuses
    Active: 'bg-[#0d6efd]/10 text-[#0d6efd] border border-[#0d6efd]/20',
    Returned: 'bg-[#198754]/10 text-[#198754] border border-[#198754]/20',
    Pending: 'bg-[#ffc107]/10 text-[#b25e00] border border-[#ffc107]/20',
    Approved: 'bg-[#198754]/10 text-[#198754] border border-[#198754]/20',
    Rejected: 'bg-[#dc3545]/10 text-[#dc3545] border border-[#dc3545]/20',
    'In Progress': 'bg-[#0dcaf0]/10 text-[#0c8ca7] border border-[#0dcaf0]/20',
    Completed: 'bg-[#198754]/10 text-[#198754] border border-[#198754]/20'
  };

  const currentStyle = styles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-[12px] font-bold py-[6px] px-[10px] tracking-wide select-none shrink-0",
        currentStyle,
        className
      )}
    >
      {status}
    </span>
  );
};
