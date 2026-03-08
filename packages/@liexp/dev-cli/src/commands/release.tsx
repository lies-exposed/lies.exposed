import { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import type { ProcessOutputCallbacks } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";
import { REPO_ROOT } from "../lib/paths.js";

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const KUBECONFIG = "microk8s-local";
const HELM_NAME = "lies-exposed";

export type K8sEnv = "prod" | "dev";

const ENV_ITEMS = [
  { label: "prod — namespace: prod,      values: values.prod.yaml", value: "prod" as K8sEnv },
  { label: "dev  — namespace: liexp-dev, values: values.dev.yaml",  value: "dev"  as K8sEnv },
];

export const DEFAULT_DEPLOYMENTS = [
  "api",
  "ai-bot",
  "agent",
  "web",
  "admin",
  "worker",
  "storybook",
] as const;

export type Deployment = (typeof DEFAULT_DEPLOYMENTS)[number];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function envSuffix(env: K8sEnv): string {
  return env === "prod" ? "prod" : "dev";
}

function namespace(env: K8sEnv): string {
  return env === "prod" ? "prod" : "liexp-dev";
}

function valuesFile(env: K8sEnv): string {
  return `${REPO_ROOT}/helm/values.${envSuffix(env)}.yaml`;
}

function kubeconfig(): string {
  return `${process.env.HOME ?? "~"}/.kube/${KUBECONFIG}`;
}

/** Env files to copy into helm/config/env/ for a given environment. */
function helmEnvFiles(env: K8sEnv): Array<[string, string]> {
  const s = envSuffix(env);
  return [
    [`${REPO_ROOT}/services/api/.env.${s}`,          `${REPO_ROOT}/helm/config/env/api.env`],
    [`${REPO_ROOT}/services/web/.env.${s}`,          `${REPO_ROOT}/helm/config/env/web.env`],
    [`${REPO_ROOT}/services/admin/.env.${s}`,        `${REPO_ROOT}/helm/config/env/admin.env`],
    [`${REPO_ROOT}/services/admin/.env.server.${s}`, `${REPO_ROOT}/helm/config/env/admin.server.env`],
    [`${REPO_ROOT}/services/ai-bot/.env.${s}`,       `${REPO_ROOT}/helm/config/env/ai-bot.env`],
    [`${REPO_ROOT}/services/agent/.env.${s}`,        `${REPO_ROOT}/helm/config/env/agent.env`],
    [`${REPO_ROOT}/services/worker/.env.${s}`,       `${REPO_ROOT}/helm/config/env/worker.env`],
  ];
}

/**
 * Step 1 — copy .env.<env> files into helm/config/env/.
 * Returns true on success, false on first failure.
 */
async function runCopyEnvFiles(
  env: K8sEnv,
  callbacks: ProcessOutputCallbacks,
): Promise<boolean> {
  const files = helmEnvFiles(env);
  callbacks.onLine(`Copying .env.${envSuffix(env)} files into helm/config/env/…`);
  for (const [src, dest] of files) {
    const res = await exec("cp", ["-f", src, dest], {
      onStdout: callbacks.onLine,
      onStderr: callbacks.onLine,
    });
    if (res.exitCode !== 0) {
      callbacks.onLine(`  ✘ failed: cp ${src} → ${dest}`);
      return false;
    }
    callbacks.onLine(`  ✔ ${dest}`);
  }
  return true;
}

/**
 * Step 2 — helm upgrade.
 * Returns true on success, false on failure.
 */
async function runHelmUpgrade(
  env: K8sEnv,
  callbacks: ProcessOutputCallbacks,
): Promise<boolean> {
  callbacks.onLine(`\nRunning helm upgrade (${env})…`);
  const args = [
    "upgrade",
    HELM_NAME,
    `${REPO_ROOT}/helm`,
    "--take-ownership",
    "--namespace",
    namespace(env),
    "-f",
    valuesFile(env),
    "--kubeconfig",
    kubeconfig(),
  ];
  callbacks.onLine(`$ helm ${args.join(" ")}`);
  const result = await exec("helm", args, {
    onStdout: callbacks.onLine,
    onStderr: callbacks.onLine,
  });
  return result.exitCode === 0;
}

/**
 * Step 3 — kubectl rollout restart.
 * Returns true on success, false on failure.
 */
async function runRolloutRestart(
  env: K8sEnv,
  deployments: Deployment[],
  callbacks: ProcessOutputCallbacks,
): Promise<boolean> {
  if (deployments.length === 0) {
    callbacks.onLine("\nNo deployments selected — skipping rollout restart.");
    return true;
  }
  callbacks.onLine(`\nRestarting deployments: ${deployments.join(", ")}…`);
  const args = [
    "--kubeconfig",
    kubeconfig(),
    "rollout",
    "restart",
    "deployments",
    ...deployments,
    "--namespace",
    namespace(env),
  ];
  callbacks.onLine(`$ kubectl ${args.join(" ")}`);
  const result = await exec("kubectl", args, {
    onStdout: callbacks.onLine,
    onStderr: callbacks.onLine,
  });
  return result.exitCode === 0;
}

// ---------------------------------------------------------------------------
// Shared UI pieces
// ---------------------------------------------------------------------------

type SharedProps = {
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

function EnvSelector({ title, onSelect }: { title: string; onSelect: (env: K8sEnv) => void }) {
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>{title}</Text>
      <Text dimColor>Select target environment:</Text>
      <SelectInput
        items={ENV_ITEMS}
        onSelect={(item) => onSelect(item.value)}
      />
    </Box>
  );
}

function DeploymentSelector({
  title,
  onConfirm,
}: {
  title: string;
  onConfirm: (deployments: Deployment[]) => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<Deployment>>(
    new Set(DEFAULT_DEPLOYMENTS),
  );

  const toggle = useCallback((d: Deployment) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }, []);

  useInput((input, key) => {
    if (key.upArrow || input === "k")
      setCursor((c) => Math.max(0, c - 1));
    else if (key.downArrow || input === "j")
      setCursor((c) => Math.min(DEFAULT_DEPLOYMENTS.length - 1, c + 1));
    else if (input === " ") {
      const d = DEFAULT_DEPLOYMENTS[cursor];
      if (d) toggle(d);
    } else if (input === "a") {
      if (selected.size === DEFAULT_DEPLOYMENTS.length)
        setSelected(new Set());
      else setSelected(new Set(DEFAULT_DEPLOYMENTS));
    } else if (key.return) {
      onConfirm(Array.from(selected));
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Box marginBottom={1} marginTop={1}>
        <Text dimColor>↑/↓ move  ·  space toggle  ·  a toggle all  ·  enter confirm</Text>
      </Box>
      {DEFAULT_DEPLOYMENTS.map((d, idx) => {
        const isSelected = selected.has(d);
        const isCursor = idx === cursor;
        return (
          <Box key={d} gap={1}>
            <Text color={isCursor ? "cyan" : undefined}>{isCursor ? "›" : " "}</Text>
            <Text color={isSelected ? "green" : "white"}>
              {isSelected ? "☑" : "☐"} {d}
            </Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>{selected.size} / {DEFAULT_DEPLOYMENTS.length} selected</Text>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// UpgradeCommand — helm upgrade only (no pod restart)
// ---------------------------------------------------------------------------

type UpgradePhase = "selectEnv" | "running" | "done";

export function UpgradeCommand({ onBack, onPhaseChange }: SharedProps) {
  const [phase, setPhase] = useState<UpgradePhase>("selectEnv");
  const [env, setEnv] = useState<K8sEnv>("prod");
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: UpgradePhase) => {
    setPhase(p);
    onPhaseChange?.(p === "running" ? "running" : p === "done" ? "done" : "idle");
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running") onBack?.();
  });

  useEffect(() => {
    if (phase !== "running") return;
    const run = async () => {
      callbacks.setStatus("running");

      const ok1 = await runCopyEnvFiles(env, callbacks);
      if (!ok1) { callbacks.setStatus("error"); updatePhase("done"); return; }

      const ok2 = await runHelmUpgrade(env, callbacks);
      callbacks.setStatus(ok2 ? "success" : "error");
      updatePhase("done");
    };
    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "selectEnv") {
    return (
      <EnvSelector
        title="Upgrade — helm upgrade only"
        onSelect={(e) => { setEnv(e); updatePhase("running"); }}
      />
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <ProcessOutput
        title={`Upgrade → ${env}`}
        status={output.status}
        completedLines={output.completedLines}
        liveLine={output.liveLine}
      />
      {phase === "done" && (
        <Box marginTop={1}>
          {output.status === "success"
            ? <Text color="green">Helm upgrade complete.</Text>
            : <Text color="red">Upgrade failed. See output above.</Text>}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ReleaseCommand — helm upgrade + kubectl rollout restart
// ---------------------------------------------------------------------------

type ReleasePhase = "selectEnv" | "selectDeployments" | "running" | "done";

export function ReleaseCommand({ onBack, onPhaseChange }: SharedProps) {
  const [phase, setPhase] = useState<ReleasePhase>("selectEnv");
  const [env, setEnv] = useState<K8sEnv>("prod");
  const [deployments, setDeployments] = useState<Deployment[]>([...DEFAULT_DEPLOYMENTS]);
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: ReleasePhase) => {
    setPhase(p);
    onPhaseChange?.(p === "running" ? "running" : p === "done" ? "done" : "idle");
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running") onBack?.();
  });

  useEffect(() => {
    if (phase !== "running") return;
    const run = async () => {
      callbacks.setStatus("running");

      const ok1 = await runCopyEnvFiles(env, callbacks);
      if (!ok1) { callbacks.setStatus("error"); updatePhase("done"); return; }

      const ok2 = await runHelmUpgrade(env, callbacks);
      if (!ok2) { callbacks.setStatus("error"); updatePhase("done"); return; }

      const ok3 = await runRolloutRestart(env, deployments, callbacks);
      callbacks.setStatus(ok3 ? "success" : "error");
      updatePhase("done");
    };
    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "selectEnv") {
    return (
      <EnvSelector
        title="Release — helm upgrade + rollout restart"
        onSelect={(e) => { setEnv(e); updatePhase("selectDeployments"); }}
      />
    );
  }

  if (phase === "selectDeployments") {
    return (
      <DeploymentSelector
        title={`Release — ${env} — select deployments to restart`}
        onConfirm={(deps) => { setDeployments(deps); updatePhase("running"); }}
      />
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <ProcessOutput
        title={`Release → ${env}`}
        status={output.status}
        completedLines={output.completedLines}
        liveLine={output.liveLine}
      />
      {phase === "done" && (
        <Box marginTop={1}>
          {output.status === "success"
            ? <Text color="green">Release complete. Helm upgraded and deployments restarted.</Text>
            : <Text color="red">Release failed. See output above.</Text>}
        </Box>
      )}
    </Box>
  );
}
