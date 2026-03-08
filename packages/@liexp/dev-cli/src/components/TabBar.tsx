import { Box, Text } from "ink";

export type TabId = "docker" | "git";

export type Tab = {
  id: TabId;
  label: string;
  /** Key hint shown in the status bar, e.g. "ctrl+d" */
  shortcut: string;
};

export const TABS: Tab[] = [
  { id: "docker", label: "Docker", shortcut: "ctrl+d" },
  { id: "git",    label: "Git",    shortcut: "ctrl+g" },
];

type Props = {
  activeTab: TabId;
};

/**
 * Horizontal tab bar rendered at the top of the interactive app.
 * Active tab is highlighted; inactive tabs are dimmed.
 * Shortcut hints are shown inline so the user knows how to switch.
 */
export function TabBar({ activeTab }: Props) {
  return (
    <Box gap={0} marginBottom={1}>
      {TABS.map((tab, i) => {
        const isActive = tab.id === activeTab;
        return (
          <Box key={tab.id}>
            <Box
              paddingX={2}
              paddingY={0}
              borderStyle="round"
              borderColor={isActive ? "cyan" : "gray"}
            >
              <Text bold={isActive} color={isActive ? "cyan" : "gray"}>
                {tab.label}
              </Text>
              <Text color={isActive ? "cyan" : "gray"} dimColor={!isActive}>
                {" "}<Text dimColor>{tab.shortcut}</Text>
              </Text>
            </Box>
            {i < TABS.length - 1 && <Text dimColor> </Text>}
          </Box>
        );
      })}
    </Box>
  );
}
