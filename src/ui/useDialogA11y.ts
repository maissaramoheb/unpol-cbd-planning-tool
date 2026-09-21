import { useEffect, useRef } from 'react';

interface UseDialogA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function useDialogA11y({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef
}: UseDialogA11yOptions): void {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Store previous active element for focus restoration upon closing
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // 2. Move focus into the dialog upon opening
    const container = containerRef.current;
    if (container) {
      // Small timeout or microtask ensures the container is painted in the DOM
      const timer = window.setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            if (!container.hasAttribute('tabindex')) {
              container.setAttribute('tabindex', '-1');
            }
            container.focus();
          }
        }
      }, 0);

      // 3. Handle Escape key and Tab focus trapping
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
          return;
        }

        if (event.key !== 'Tab') return;

        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const focusableElements = Array.from(
          currentContainer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter(el => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusableElements.length === 0) {
          event.preventDefault();
          currentContainer.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          if (activeElement === firstElement || !currentContainer.contains(activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement || !currentContainer.contains(activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        // 4. Restore focus upon closing
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose, containerRef, initialFocusRef]);
}
