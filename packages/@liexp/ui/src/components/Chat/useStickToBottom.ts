import React from "react";

/** Distance (px) from the bottom within which the view counts as "at bottom". */
const BOTTOM_THRESHOLD = 80;

/**
 * Auto-scroll a message list to the bottom as `deps` change, but only while the
 * user is already near the bottom. If they scrolled up to read, stop following
 * and expose `isAtBottom` so the UI can offer a "jump to latest" button.
 */
export const useStickToBottom = (
  deps: React.DependencyList,
): {
  containerRef: React.RefObject<HTMLDivElement>;
  endRef: React.RefObject<HTMLDivElement>;
  isAtBottom: boolean;
  onScroll: () => void;
  scrollToBottom: () => void;
} => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const stickRef = React.useRef(true);
  const [isAtBottom, setIsAtBottom] = React.useState(true);

  const onScroll = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD;
    stickRef.current = atBottom;
    setIsAtBottom(atBottom);
  }, []);

  const scrollToBottom = React.useCallback(() => {
    stickRef.current = true;
    setIsAtBottom(true);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    if (stickRef.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, deps);

  return { containerRef, endRef, isAtBottom, onScroll, scrollToBottom };
};
