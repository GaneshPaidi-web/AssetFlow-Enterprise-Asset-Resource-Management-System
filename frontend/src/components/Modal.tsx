import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop blur overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-opacity duration-300" />

        {/* Modal content container */}
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-modal shadow-2xl p-6 border border-[#f1f5f9] z-50 w-full max-w-lg focus:outline-none font-sans animate-fade-in-up max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#f1f5f9] pb-4 mb-4 select-none">
            <div className="min-w-0">
              <Dialog.Title className="text-cardTitle font-bold text-[#0f172a] tracking-tight leading-tight m-0">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-[14px] text-slate-500 font-medium m-0 mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[1.75]" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="text-[15px] text-slate-600">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
