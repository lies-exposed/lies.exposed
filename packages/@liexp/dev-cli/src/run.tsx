import { type ReactElement, cloneElement } from "react";
import { PassThrough } from "node:stream";
import { render, useApp } from "ink";
import { parseArgs } from "./lib/cli.js";
import type { ServiceKey } from "./lib/docker.js";
import { App } from "./app.js";

/**
 * Creates a dummy stdin for non-interactive (headless) rendering.
 * Ink requires isTTY=true and several stream methods (ref, unref, setRawMode)
 * that a plain PassThrough doesn't have. We stub them as no-ops.
 */
function makeDummyStdin(): NodeJS.ReadStream {
  const pt = new PassThrough();
  const noop = () => {};
  const fake = pt as unknown as NodeJS.ReadStream;
  (fake as unknown as Record<string, unknown>).isTTY = true;
  (fake as unknown as Record<string, unknown>).ref = noop;
  (fake as unknown as Record<string, unknown>).unref = noop;
  (fake as unknown as Record<string, unknown>).setRawMode = noop;
  return fake;
}

/**
 * Wraps a headless command so that when it calls onBack (its "I'm done" signal)
 * ink's exit() is called, resolving waitUntilExit().
 */
function HeadlessWrapper({ children }: { children: ReactElement<{ onBack?: () => void }> }) {
  const { exit } = useApp();
  return cloneElement(children, { onBack: exit });
}
// argv: strip node binary + script path
const argv = process.argv.slice(2);
const parsed = parseArgs(argv);

if (parsed.mode === "interactive") {
  // ── Interactive TUI mode ──────────────────────────────────────────────────
  const { waitUntilExit } = render(<App />);
  await waitUntilExit();
} else {
  // ── Non-interactive (flag-driven) mode ───────────────────────────────────
  let element: ReactElement;

  switch (parsed.mode) {
    case "login": {
      const { LoginCommand } = await import("./commands/login.js");
      element = <LoginCommand username={parsed.username} />;
      break;
    }
    case "build": {
      const { BuildCommand } = await import("./commands/build.js");
      element = (
        <BuildCommand
          username={parsed.username}
          preSelectedServices={parsed.services as ServiceKey[]}
          extraArgs={parsed.extraArgs}
        />
      );
      break;
    }
    case "push": {
      const { PushCommand } = await import("./commands/push.js");
      element = (
        <PushCommand
          username={parsed.username}
          preSelectedServices={parsed.services as ServiceKey[]}
        />
      );
      break;
    }
    case "compose": {
      const { ComposeCommand } = await import("./commands/compose.js");
      element = <ComposeCommand preArgs={parsed.args} />;
      break;
    }
    case "up": {
      const { UpCommand } = await import("./commands/up.js");
      element = <UpCommand preServices={parsed.services} />;
      break;
    }
    case "test": {
      const { TestCommand } = await import("./commands/test.js");
      element = <TestCommand autoRun />;
      break;
    }
    case "test-deploy": {
      const { TestDeployCommand } = await import("./commands/test-deploy.js");
      element = <TestDeployCommand autoRun />;
      break;
    }
  }

  const { waitUntilExit } = render(
    <HeadlessWrapper>{element!}</HeadlessWrapper>,
    { stdin: makeDummyStdin() }
  );
  await waitUntilExit();
}
