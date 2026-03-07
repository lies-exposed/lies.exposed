/** Canonical Docker image definitions for the lies.exposed platform. */

export type ServiceKey =
  | "base"
  | "pnpm"
  | "api"
  | "worker"
  | "ai-bot"
  | "admin"
  | "web"
  | "agent";

export type ImageDef = {
  /** Local image tag used during build. */
  local: string;
  /** Full GHCR image reference used for push/pull. */
  ghcr: string;
  /** Dockerfile path relative to repo root. */
  dockerfile: string;
  /** Docker build target stage. */
  target: string;
};

export const IMAGES = {
  pnpm: {
    local: "liexp-base:pnpm-latest",
    ghcr: "ghcr.io/lies-exposed/liexp-base:24-pnpm-latest",
    dockerfile: "base.Dockerfile",
    target: "pnpm",
  },
  base: {
    local: "liexp-base:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-base:24-latest",
    dockerfile: "base.Dockerfile",
    target: "api-base",
  },
  api: {
    local: "liexp-api:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-api:latest",
    dockerfile: "api.Dockerfile",
    target: "production",
  },
  worker: {
    local: "liexp-worker:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-worker:latest",
    dockerfile: "worker.Dockerfile",
    target: "production",
  },
  "ai-bot": {
    local: "liexp-ai-bot:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-ai-bot:latest",
    dockerfile: "ai-bot.Dockerfile",
    target: "production",
  },
  admin: {
    local: "liexp-admin:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-admin:latest",
    dockerfile: "admin.Dockerfile",
    target: "production",
  },
  web: {
    local: "liexp-web:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-web:latest",
    dockerfile: "web.Dockerfile",
    target: "production",
  },
  agent: {
    local: "liexp-agent:latest",
    ghcr: "ghcr.io/lies-exposed/liexp-agent:latest",
    dockerfile: "agent.Dockerfile",
    target: "production",
  },
} as const satisfies Record<ServiceKey, ImageDef>;

export const SERVICE_KEYS = Object.keys(IMAGES) as ServiceKey[];

/** Per-service extra flags added before `extraArgs`. */
const SERVICE_BUILD_FLAGS: Record<ServiceKey, string[]> = {
  pnpm: ["--force-rm", "--pull"],
  base: ["--force-rm", "--pull", "--no-cache"],
  api: ["--force-rm"],
  worker: ["--force-rm"],
  "ai-bot": ["--force-rm"],
  // admin intentionally omits --force-rm (matches build.sh)
  admin: ["--build-arg", "DOTENV_CONFIG_PATH=.env.prod"],
  web: ["--force-rm", "--build-arg", "DOTENV_CONFIG_PATH=.env.prod"],
  agent: ["--force-rm"],
};

/** Build args for `docker build` for a given service. */
export function buildArgs(
  service: ServiceKey,
  extraArgs: string[] = []
): string[] {
  const img = IMAGES[service];
  return [
    "build",
    "--progress=plain",
    "-t",
    img.local,
    "-t",
    img.ghcr,
    "-f",
    img.dockerfile,
    "--target",
    img.target,
    ...SERVICE_BUILD_FLAGS[service],
    ...extraArgs,
    ".",
  ];
}

/** Push args for `docker image push` for a given service. */
export function pushArgs(service: ServiceKey): string[] {
  const img = IMAGES[service];
  // base/pnpm: push both tags; others: push ghcr tag only
  if (service === "base") {
    return [IMAGES.base.ghcr, IMAGES.pnpm.ghcr];
  }
  return [img.ghcr];
}

/** The default docker compose command used by compose.sh. */
export const DEFAULT_COMPOSE_ARGS =
  "up -d --force-recreate api.liexp.dev admin.liexp.dev liexp.dev";

/** The env file path used by docker compose. */
export const COMPOSE_ENV_FILE = "./services/api/.env.local";
