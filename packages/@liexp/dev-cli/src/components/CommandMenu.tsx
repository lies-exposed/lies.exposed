import SelectInput from "ink-select-input";
import { Box, Text } from "ink";

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
  onSelect: (command: CommandId) => void;
};

type MenuItem = {
  label: string;
  value: CommandId;
  description: string;
};

const ITEMS: MenuItem[] = [
  { label: "login",       value: "login",       description: "Authenticate to GHCR" },
  { label: "build",       value: "build",       description: "Build Docker images" },
  { label: "push",        value: "push",        description: "Push images to GHCR" },
  { label: "compose",     value: "compose",     description: "docker compose wrapper" },
  { label: "up",          value: "up",          description: "Start dev stack" },
  { label: "test",        value: "test",        description: "Smoke test API container" },
  { label: "test-deploy", value: "test-deploy", description: "Simulate prod deploy" },
  { label: "worktree",    value: "worktree",    description: "Manage git worktrees" },
];

// Precompute label → description for use inside itemComponent
const DESC_BY_LABEL = new Map(ITEMS.map((i) => [i.label, i.description]));

export function CommandMenu({ onSelect }: Props) {
  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
        marginBottom={1}
      >
        <Text bold color="cyan">
          lies.exposed  dev CLI
        </Text>
      </Box>

      <Box flexDirection="column" paddingLeft={1}>
        <Box marginBottom={1}>
          <Text dimColor>Select a command:</Text>
        </Box>

        <SelectInput
          items={ITEMS}
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
    </Box>
  );
}
