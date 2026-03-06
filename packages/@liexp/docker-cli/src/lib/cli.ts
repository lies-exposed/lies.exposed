import type { ServiceKey } from "./docker.js";
import { SERVICE_KEYS } from "./docker.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ParsedArgs =
  | { mode: "interactive" }
  | { mode: "login"; username: string }
  | {
      mode: "build";
      username: string;
      services: ServiceKey[];
      extraArgs: string[];
    }
  | { mode: "push"; username: string; services: ServiceKey[] }
  | { mode: "compose"; args: string[] }
  | { mode: "up"; services: string[] }
  | { mode: "test" }
  | { mode: "test-deploy" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isServiceKey(s: string): s is ServiceKey {
  return (SERVICE_KEYS as string[]).includes(s);
}

/** Flags that map directly to service keys, e.g. --api → "api" */
const FLAG_TO_SERVICE: Record<string, ServiceKey> = {
  "--api": "api",
  "--web": "web",
  "--admin": "admin",
  "--worker": "worker",
  "--ai-bot": "ai-bot",
  "--agent": "agent",
  "--base": "base",
  "--pnpm": "pnpm",
};

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

/**
 * Parses process.argv (slice after the tsx/node binary + script path)
 * and returns a `ParsedArgs` discriminated union.
 *
 * argv examples:
 *   []                                 → { mode: "interactive" }
 *   ["login", "myuser"]                → { mode: "login", username: "myuser" }
 *   ["build", "myuser", "--api", "--web"] → { mode: "build", ... }
 *   ["push",  "myuser", "--api"]       → { mode: "push", ... }
 *   ["compose", "--", "down"]          → { mode: "compose", args: ["down"] }
 *   ["up", "--", "db.liexp.dev"]       → { mode: "up", services: ["db.liexp.dev"] }
 *   ["test"]                           → { mode: "test" }
 *   ["test-deploy"]                    → { mode: "test-deploy" }
 */
export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) {
    return { mode: "interactive" };
  }

  const [command, ...rest] = argv;

  switch (command) {
    case "login": {
      const username = rest[0];
      if (!username) {
        die("Usage: docker login <username>");
      }
      return { mode: "login", username };
    }

    case "build": {
      const username = rest[0];
      if (!username) {
        die("Usage: docker build <username> [--api] [--web] ...");
      }
      const flags = rest.slice(1);
      const { services, extra } = extractServices(flags);
      return {
        mode: "build",
        username,
        services: services.length > 0 ? services : [...SERVICE_KEYS],
        extraArgs: extra,
      };
    }

    case "push": {
      const username = rest[0];
      if (!username) {
        die("Usage: docker push <username> [--api] [--web] ...");
      }
      const flags = rest.slice(1);
      const { services } = extractServices(flags);
      return {
        mode: "push",
        username,
        services: services.length > 0 ? services : [...SERVICE_KEYS],
      };
    }

    case "compose": {
      // Everything after "--" is passed as compose args
      const ddIdx = rest.indexOf("--");
      const args = ddIdx >= 0 ? rest.slice(ddIdx + 1) : rest;
      return { mode: "compose", args };
    }

    case "up": {
      const ddIdx = rest.indexOf("--");
      const services = ddIdx >= 0 ? rest.slice(ddIdx + 1) : rest;
      return { mode: "up", services };
    }

    case "test":
      return { mode: "test" };

    case "test-deploy":
      return { mode: "test-deploy" };

    default:
      // If the first token looks like a bare service key (e.g. someone typed
      // a service name directly), treat as interactive so the TUI can guide them.
      if (isServiceKey(command ?? "")) {
        return { mode: "interactive" };
      }
      die(`Unknown command: ${command ?? ""}. Valid commands: login, build, push, compose, up, test, test-deploy`);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function extractServices(flags: string[]): {
  services: ServiceKey[];
  extra: string[];
} {
  const services: ServiceKey[] = [];
  const extra: string[] = [];
  for (const flag of flags) {
    const svc = FLAG_TO_SERVICE[flag];
    if (svc !== undefined) {
      services.push(svc);
    } else {
      extra.push(flag);
    }
  }
  return { services, extra };
}

function die(message: string): never {
  process.stderr.write(`\nError: ${message}\n\n`);
  process.exit(1);
}
