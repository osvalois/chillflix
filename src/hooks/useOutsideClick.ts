import { useEffect, useCallback, RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains((event.target as Node) || null)) {
        return;
      }

      handler(event);
    },
    [ref, handler]
  );

  useEffect(() => {
    document.addEventListener(mouseEvent, handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener(mouseEvent, handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, mouseEvent, handleClickOutside]);
}