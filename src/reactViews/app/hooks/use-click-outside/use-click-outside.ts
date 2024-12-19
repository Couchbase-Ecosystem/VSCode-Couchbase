import { RefObject, useCallback, useEffect } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T> | Array<RefObject<T>>,
  handlerFunction: () => void
) {
  const checkElementInContainer = (element: HTMLElement | null, target: EventTarget | null) => !element || element.contains(target as Node);
  const handleWindowClick = useCallback(
    (event: Event) => {
      const refsArray = Array.isArray(refs) ? refs : [refs];
      if (refsArray.some((ref) => checkElementInContainer(ref?.current, event.target))) {
        return;
      }
      handlerFunction();
    },
    [handlerFunction, refs]
  );
  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [handleWindowClick]);
}
