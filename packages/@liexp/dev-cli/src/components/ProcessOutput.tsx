import { useState, useCallback } from "react";
import { Box, Text, Static } from "ink";
import { StatusBadge, type Status } from "./StatusBadge.js";

type Props = {
  /** Title shown above the output panel. */
  title: string;
  status: Status;
  /** Streams already-completed lines (rendered via Static). */
  completedLines: string[];
  /** The current live line being written (not yet newline-terminated). */
  liveLine?: string;
};

/**
 * ProcessOutput renders a live-streaming log panel.
 *
 * - `completedLines` go into <Static> so they're permanently printed above.
 * - `liveLine` is the partial current line displayed below completed output.
 */
export function ProcessOutput({
  title,
  status,
  completedLines,
  liveLine,
}: Props) {
  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <StatusBadge status={status} />
        <Text bold>{title}</Text>
      </Box>

      {/* Completed lines: permanently printed, won't re-render */}
      <Static items={completedLines}>
        {(line, i) => (
          <Box key={i} paddingLeft={2}>
            <Text dimColor>{line}</Text>
          </Box>
        )}
      </Static>

      {/* Current in-progress line */}
      {liveLine !== undefined && liveLine !== "" && (
        <Box paddingLeft={2}>
          <Text color="cyan">{liveLine}</Text>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Hook: useProcessOutput
// ---------------------------------------------------------------------------
// Convenience hook that returns state + callbacks to wire into exec().

export type ProcessOutputState = {
  completedLines: string[];
  liveLine: string;
  status: Status;
};

export type ProcessOutputCallbacks = {
  onLine: (line: string) => void;
  setStatus: (status: Status) => void;
  reset: () => void;
};

/** Maximum number of completed lines retained in state to prevent OOM. */
const MAX_LINES = 200;

export function useProcessOutput(): [
  ProcessOutputState,
  ProcessOutputCallbacks,
] {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [liveLine, setLiveLine] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onLine = useCallback((line: string) => {
    setCompletedLines((prev) => {
      const next = [...prev, line];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
    setLiveLine("");
  }, []);

  const reset = useCallback(() => {
    setCompletedLines([]);
    setLiveLine("");
    setStatus("idle");
  }, []);

  return [
    { completedLines, liveLine, status },
    { onLine, setStatus, reset },
  ];
}
