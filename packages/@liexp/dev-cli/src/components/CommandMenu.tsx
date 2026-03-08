import SelectInput from "ink-select-input";
import { Box, Text } from "ink";
import type { TabId } from "./TabBar.js";

export type CommandId =
  | "login"
  | "build"
  | "push"
  | "compose"
  | "up"
  | "test"
  | "test-deploy"
  | "worktree";

type Props = {
  tab: TabId;
  onSelect: (command: CommandId) => void;
};

type MenuItem = {
  label: string;
  value: CommandId;
  description: string;
  tab: TabId;
};

const ITEMS: MenuItem[] = [
  { label: "login",       value: "login",       description: "Authenticate to GHCR",       tab: "docker" },
  { label: "build",       value: "build",       description: "Build Docker images",         tab: "docker" },
  { label: "push",        value: "push",        description: "Push images to GHCR",         tab: "docker" },
  { label: "compose",     value: "compose",     description: "docker compose wrapper",      tab: "docker" },
  { label: "up",          value: "up",          description: "Start dev stack",             tab: "docker" },
  { label: "test",        value: "test",        description: "Smoke test API container",    tab: "docker" },
  { label: "test-deploy", value: "test-deploy", description: "Simulate prod deploy",        tab: "docker" },
  { label: "worktree",    value: "worktree",    description: "Manage git worktrees",        tab: "git"    },
];

// Precompute label → description for use inside itemComponent
const DESC_BY_LABEL = new Map(ITEMS.map((i) => [i.label, i.description]));

export function CommandMenu({ tab, onSelect }: Props) {
  const visibleItems = ITEMS.filter((i) => i.tab === tab);

  return (
    <Box flexDirection="column" paddingLeft={1}>
      <Box marginBottom={1}>
        <Text dimColor>Select a command:</Text>
      </Box>

      <SelectInput
        items={visibleItems}
        onSelect={(item) => onSelect(item.value)}
        itemComponent={({ isSelected, label }) => (
          <Box gap={2}>
            <Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
              {label}
            </Text>
            <Text dimColor>{DESC_BY_LABEL.get(label) ?? ""}</Text>
          </Box>
        )}
      />
    </Box>
  );
}
