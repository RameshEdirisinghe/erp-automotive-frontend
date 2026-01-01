import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside of specified elements
 * @param refs - Array of refs to elements that should not trigger the callback
 * @param handler - Callback function to execute when click outside is detected
 */
export const useClickOutside = (
  refs: RefObject<HTMLElement | null>[],
  handler: () => void
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside all specified refs
      const isOutside = refs.every(ref => {
        return !ref.current || !ref.current.contains(target);
      });
      
      if (isOutside) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, handler]);
};
