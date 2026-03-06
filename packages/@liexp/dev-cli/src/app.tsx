import { useState } from "react";
import { Box } from "ink";
import { CommandMenu, type CommandId } from "./components/CommandMenu.js";
import { StatusBar, type KeyBinding, BINDING_QUIT, BINDING_BACK, BINDING_SELECT, BINDING_CONFIRM } from "./components/StatusBar.js";
import { LoginCommand } from "./commands/login.js";
import { BuildCommand } from "./commands/build.js";
import { PushCommand } from "./commands/push.js";
import { ComposeCommand } from "./commands/compose.js";
import { UpCommand } from "./commands/up.js";
import { TestCommand } from "./commands/test.js";
import { TestDeployCommand } from "./commands/test-deploy.js";
import { WorktreeCommand } from "./commands/worktree.js";

type Screen = "menu" | CommandId;

// ---------------------------------------------------------------------------
// Per-screen keybinding sets
// ---------------------------------------------------------------------------

/** Bindings shown while a command is actively running (no interaction possible). */
const BINDINGS_RUNNING: KeyBinding[] = [BINDING_QUIT];

/** Bindings shown when a command has finished and can go back. */
const BINDINGS_DONE: KeyBinding[] = [BINDING_BACK, BINDING_QUIT];

/** Bindings for the top-level menu. */
const BINDINGS_MENU: KeyBinding[] = [BINDING_SELECT, BINDING_CONFIRM, BINDING_QUIT];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");

  const goBack = () => {
    setScreen("menu");
    setPhase("idle");
  };

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
      <Box flexDirection="column" flexGrow={1}>
        {screen === "menu" && (
          <CommandMenu onSelect={(cmd) => { setScreen(cmd); setPhase("idle"); }} />
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
      </Box>

      <StatusBar bindings={bindings} />
    </Box>
  );
}
