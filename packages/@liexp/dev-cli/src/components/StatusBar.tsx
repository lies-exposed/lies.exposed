import { Box, Text } from "ink";

export type KeyBinding = {
  /** Key label shown in the bar, e.g. "enter", "b", "ctrl+c" */
  key: string;
  /** Short description of what the key does */
  description: string;
};

type Props = {
  bindings: KeyBinding[];
};

/**
 * A horizontal bar rendered at the bottom of the screen that lists the
 * active keybindings for the current view.
 *
 * Each binding is rendered as:   <key>  <description>
 * separated by a dimmed divider.
 */
export function StatusBar({ bindings }: Props) {
  if (bindings.length === 0) return null;

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
      {bindings.map((b, i) => (
        <Box key={b.key} gap={1} marginRight={i < bindings.length - 1 ? 2 : 0}>
          <Text bold color="cyan">{b.key}</Text>
          <Text dimColor>{b.description}</Text>
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Preset binding sets — reused across views
// ---------------------------------------------------------------------------

export const BINDING_QUIT: KeyBinding = { key: "ctrl+c", description: "quit" };
export const BINDING_BACK: KeyBinding = { key: "esc", description: "back" };
export const BINDING_CONFIRM: KeyBinding = { key: "enter", description: "confirm" };
export const BINDING_CANCEL: KeyBinding = { key: "n/q", description: "cancel" };
export const BINDING_SELECT: KeyBinding = { key: "↑↓", description: "move" };
export const BINDING_TOGGLE: KeyBinding = { key: "space", description: "toggle" };
export const BINDING_TOGGLE_ALL: KeyBinding = { key: "a", description: "toggle all" };
export const BINDING_RUN: KeyBinding = { key: "enter/y", description: "run" };
