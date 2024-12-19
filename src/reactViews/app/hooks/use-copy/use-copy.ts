import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from 'utils/strings';

export const useCopy = (copyTimeout: number) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = (value: string) => {
    copyToClipboard(value);
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setCopied(false), copyTimeout);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return { copied, handleCopy: copy };
};
