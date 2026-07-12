import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = 'No records found.',
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  rowsPerPage
}: TableProps<T>) {
  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Table Container */}
      <div className="w-full bg-white border border-[#dee2e6] rounded-table overflow-hidden shadow-custom">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full border-collapse text-left text-tableBody">
            {/* Sticky Header */}
            <thead className="bg-[#e9ecef]/50 border-b border-[#dee2e6] sticky top-0 z-10">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "py-4 px-6 text-tableHeader font-semibold text-[#495057] uppercase tracking-wider",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#dee2e6]">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: rowsPerPage || 5 }).map((_, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="py-4 px-6">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty State Row
                <tr>
                  <td colSpan={columns.length} className="py-12 px-6 text-center text-[#6c757d]">
                    <p className="text-[16px] font-medium">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                // Actual Data Rows
                data.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "hover:bg-[#e9ecef]/30 transition-all duration-150 odd:bg-white even:bg-[#e9ecef]/10",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col, cIdx) => {
                      const value = col.accessorKey in row ? (row as any)[col.accessorKey] : null;
                      return (
                        <td
                          key={cIdx}
                          className={cn(
                            "py-4 px-6 text-[#212529] font-medium leading-normal",
                            col.className
                          )}
                        >
                          {col.render ? col.render(row) : value !== null ? String(value) : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#dee2e6]/50 pt-4 mt-2 px-2">
          <div className="text-[14px] text-[#6c757d] font-medium">
            Showing Page <span className="font-semibold text-[#212529]">{currentPage}</span> of{' '}
            <span className="font-semibold text-[#212529]">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-[#ced4da] rounded-btn bg-white hover:bg-gray-50 text-[#6c757d] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.75]" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-[#ced4da] rounded-btn bg-white hover:bg-gray-50 text-[#6c757d] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
