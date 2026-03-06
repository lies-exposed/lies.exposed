import { useState } from "react";
import { Box } from "ink";
import { CommandMenu, type CommandId } from "./components/CommandMenu.js";
import { LoginCommand } from "./commands/login.js";
import { BuildCommand } from "./commands/build.js";
import { PushCommand } from "./commands/push.js";
import { ComposeCommand } from "./commands/compose.js";
import { UpCommand } from "./commands/up.js";
import { TestCommand } from "./commands/test.js";
import { TestDeployCommand } from "./commands/test-deploy.js";

type Screen = "menu" | CommandId;

export function App() {
  const [screen, setScreen] = useState<Screen>("menu");

  const goBack = () => setScreen("menu");

  return (
    <Box flexDirection="column" padding={1}>
      {screen === "menu" && (
        <CommandMenu onSelect={(cmd) => setScreen(cmd)} />
      )}
      {screen === "login" && (
        <LoginCommand onBack={goBack} />
      )}
      {screen === "build" && (
        <BuildCommand onBack={goBack} />
      )}
      {screen === "push" && (
        <PushCommand onBack={goBack} />
      )}
      {screen === "compose" && (
        <ComposeCommand onBack={goBack} />
      )}
      {screen === "up" && (
        <UpCommand onBack={goBack} />
      )}
      {screen === "test" && (
        <TestCommand onBack={goBack} />
      )}
      {screen === "test-deploy" && (
        <TestDeployCommand onBack={goBack} />
      )}
    </Box>
  );
}
