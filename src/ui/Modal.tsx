import React, { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { useDialogA11y } from './useDialogA11y';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useDialogA11y({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef
  });

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-surface-scrim">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full max-h-[calc(100dvh-2rem)] bg-surface-overlay rounded-xl shadow-overlay overflow-hidden flex flex-col ${sizeClasses[size]} transform transition-colors duration-150`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-4 sm:px-6 py-3 border-b border-border-subtle bg-surface-subtle">
          <h3 id={titleId} className="text-lg font-bold text-text-primary">{title}</h3>
          <Button
            ref={closeButtonRef}
            variant="quiet"
            size="icon"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="text-text-muted hover:text-text-secondary"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 px-4 sm:px-6 py-4 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end flex-wrap shrink-0 gap-3 px-4 sm:px-6 py-3 border-t border-border-subtle bg-surface-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
