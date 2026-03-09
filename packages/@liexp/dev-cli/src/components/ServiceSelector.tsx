import { useState, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import type { ServiceKey } from "../lib/docker.js";
import { SERVICE_KEYS } from "../lib/docker.js";

type Props = {
  /** Which services to show (defaults to all). */
  services?: ServiceKey[];
  /** Pre-selected service keys. */
  initialSelected?: ServiceKey[];
  /** Called when the user confirms their selection with Enter. */
  onConfirm: (selected: ServiceKey[]) => void;
};

/**
 * Multi-select checkbox list for picking Docker services.
 *
 * - Arrow keys / j/k to move cursor
 * - Space to toggle selection
 * - Enter to confirm
 * - "a" to toggle all
 */
export function ServiceSelector({
  services = SERVICE_KEYS,
  initialSelected = [],
  onConfirm,
}: Props) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<ServiceKey>>(
    new Set(initialSelected)
  );

  const toggle = useCallback(
    (key: ServiceKey) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    []
  );

  useInput((input, key) => {
    if (key.upArrow || input === "k") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow || input === "j") {
      setCursor((c) => Math.min(services.length - 1, c + 1));
    } else if (input === " ") {
      const svc = services[cursor];
      if (svc) toggle(svc);
    } else if (input === "a") {
      // Toggle all: if everything is selected, deselect all; else select all
      if (selected.size === services.length) {
        setSelected(new Set());
      } else {
        setSelected(new Set(services));
      }
    } else if (key.return) {
      onConfirm(Array.from(selected));
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          ↑/↓ move  ·  space toggle  ·  a toggle all  ·  enter confirm
        </Text>
      </Box>
      {services.map((svc, idx) => {
        const isSelected = selected.has(svc);
        const isCursor = idx === cursor;
        return (
          <Box key={svc} gap={1}>
            <Text color={isCursor ? "cyan" : undefined}>
              {isCursor ? "›" : " "}
            </Text>
            <Text color={isSelected ? "green" : "white"}>
              {isSelected ? "☑" : "☐"} {svc}
            </Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>{selected.size} / {services.length} selected</Text>
      </Box>
    </Box>
  );
}
