import { useState } from "react";
import { Box, useInput } from "ink";
import { CommandMenu, type CommandId } from "./components/CommandMenu.js";
import { StatusBar, type KeyBinding, BINDING_QUIT, BINDING_BACK, BINDING_SELECT, BINDING_CONFIRM } from "./components/StatusBar.js";
import { TabBar, TABS, type TabId } from "./components/TabBar.js";
import { ServicesPanel } from "./components/ServicesPanel.js";
import { LoginCommand } from "./commands/login.js";
import { BuildCommand } from "./commands/build.js";
import { PushCommand } from "./commands/push.js";
import { ComposeCommand } from "./commands/compose.js";
import { UpCommand } from "./commands/up.js";
import { TestCommand } from "./commands/test.js";
import { TestDeployCommand } from "./commands/test-deploy.js";
import { WorktreeCommand } from "./commands/worktree.js";
import { ReleaseCommand } from "./commands/release.js";

type Screen = "menu" | CommandId;

// ---------------------------------------------------------------------------
// Per-screen keybinding sets
// ---------------------------------------------------------------------------

/** Bindings shown while a command is actively running (no interaction possible). */
const BINDINGS_RUNNING: KeyBinding[] = [BINDING_QUIT];

/** Bindings shown when a command has finished and can go back. */
const BINDINGS_DONE: KeyBinding[] = [BINDING_BACK, BINDING_QUIT];

/** Bindings for the top-level menu. */
const BINDINGS_MENU: KeyBinding[] = [
  BINDING_SELECT,
  BINDING_CONFIRM,
  ...TABS.map((t) => ({ key: t.shortcut, description: `${t.label} tab` })),
  BINDING_QUIT,
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [activeTab, setActiveTab] = useState<TabId>("docker");

  const goBack = () => {
    setScreen("menu");
    setPhase("idle");
  };

  // Tab switching is available whenever we're on the menu (not mid-command)
  useInput((_input, key) => {
    if (screen !== "menu") return;
    if (key.ctrl && _input === "d") {
      setActiveTab("docker");
    } else if (key.ctrl && _input === "g") {
      setActiveTab("git");
    } else if (key.ctrl && _input === "k") {
      setActiveTab("k8s");
    }
  });

  // Derive current keybindings from screen + phase
  let bindings: KeyBinding[];
  if (screen === "menu") {
    bindings = BINDINGS_MENU;
  } else if (phase === "running") {
    bindings = BINDINGS_RUNNING;
  } else {
    bindings = BINDINGS_DONE;
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Tab bar — always visible */}
      <TabBar activeTab={activeTab} />

      {/* Main content area */}
      <Box flexDirection="row" flexGrow={1} gap={2}>
        <Box flexDirection="column" flexGrow={1}>
          {screen === "menu" && (
            <CommandMenu
              tab={activeTab}
              onSelect={(cmd) => { setScreen(cmd); setPhase("idle"); }}
            />
          )}
          {screen === "login" && (
            <LoginCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "build" && (
            <BuildCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "push" && (
            <PushCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "compose" && (
            <ComposeCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "up" && (
            <UpCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "test" && (
            <TestCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "test-deploy" && (
            <TestDeployCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "worktree" && (
            <WorktreeCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
          {screen === "release" && (
            <ReleaseCommand onBack={goBack} onPhaseChange={setPhase} />
          )}
        </Box>

        {/* Services panel — only on Docker tab while on the menu screen */}
        {screen === "menu" && activeTab === "docker" && (
          <ServicesPanel />
        )}
      </Box>

      {/* Key binding hint bar — always at the bottom */}
      <StatusBar bindings={bindings} />
    </Box>
  );
}
