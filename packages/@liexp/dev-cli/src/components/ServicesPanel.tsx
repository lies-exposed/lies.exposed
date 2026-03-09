import { useState, useEffect, useRef } from "react";
import { Box, Text } from "ink";
import { composePs, type ComposeService } from "../lib/docker.js";

/** Refresh interval in milliseconds. */
const POLL_MS = 5_000;

function stateColor(state: string): string {
  switch (state) {
    case "running":   return "green";
    case "exited":    return "red";
    case "restarting": return "yellow";
    case "paused":    return "gray";
    default:          return "white";
  }
}

function healthBadge(health: string): string {
  switch (health) {
    case "healthy":   return " ✔";
    case "unhealthy": return " ✘";
    default:          return "";
  }
}

/**
 * Sidebar panel that shows the running state of all compose services in the
 * current worktree. Polls every 5 s. Displayed alongside the command menu on
 * the Docker tab.
 */
export function ServicesPanel() {
  const [services, setServices] = useState<ComposeService[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = () => {
    composePs()
      .then((svcs) => {
        setServices(svcs);
        setLastRefresh(new Date());
        setError(null);
      })
      .catch((e: unknown) => setError(String(e)));
  };

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, POLL_MS);
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  const refreshLabel = lastRefresh
    ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "…";

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1} minWidth={38}>
      {/* Header */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold>Services</Text>
        <Text dimColor>{refreshLabel}</Text>
      </Box>

      {error && (
        <Text color="red" wrap="truncate-end">{error}</Text>
      )}

      {services === null && !error && (
        <Text dimColor>Loading…</Text>
      )}

      {services !== null && services.length === 0 && (
        <Text dimColor>No containers running.</Text>
      )}

      {services !== null && services.length > 0 && services.map((svc) => (
        <Box key={svc.service} gap={1}>
          <Text color={stateColor(svc.state)}>
            {"●"}
          </Text>
          <Text color={stateColor(svc.state)} bold={svc.state === "running"}>
            {svc.service}{healthBadge(svc.health)}
          </Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text dimColor>↻ every {POLL_MS / 1000}s</Text>
      </Box>
    </Box>
  );
}
