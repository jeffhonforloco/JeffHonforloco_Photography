import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap focus within a container element
 * Useful for modals, dialogs, and mobile menus to improve accessibility
 *
 * @param isActive - Whether the focus trap should be active
 * @returns ref - Ref to attach to the container element
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll(selector));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backward)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forward)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure the element is visible
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);
    }

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};
