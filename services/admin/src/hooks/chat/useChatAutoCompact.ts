import { useState, useCallback, useRef } from "react";

interface UseChatAutoCompactOptions {
  initialValue?: boolean;
  onChange?: (value: boolean) => void;
}

export const useChatAutoCompact = ({
  initialValue = false,
  onChange,
}: UseChatAutoCompactOptions = {}) => {
  const [autoCompact, setAutoCompact] = useState(initialValue);
  const autoCompactRef = useRef(initialValue);

  const toggleAutoCompact = useCallback(() => {
    setAutoCompact((prev) => {
      const next = !prev;
      autoCompactRef.current = next;
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  return { autoCompact, autoCompactRef, toggleAutoCompact };
};
