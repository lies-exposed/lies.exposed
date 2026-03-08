import { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";
import { REPO_ROOT } from "../lib/paths.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KUBECONFIG = "microk8s-local";

const ENV_ITEMS = [
  { label: "prod — namespace: prod, values: values.prod.yaml",  value: "prod" },
  { label: "dev  — namespace: liexp-dev, values: values.dev.yaml", value: "dev" },
];

const DEFAULT_DEPLOYMENTS = [
  "api",
  "ai-bot",
  "agent",
  "web",
  "admin",
  "worker",
  "storybook",
] as const;

type Deployment = (typeof DEFAULT_DEPLOYMENTS)[number];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReleasePhase =
  | "selectEnv"
  | "selectDeployments"
  | "running"
  | "done";

type Props = {
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

// ---------------------------------------------------------------------------
// Deployment multi-selector (reuses the pattern from UpCommand)
// ---------------------------------------------------------------------------

function DeploymentSelector({
  onConfirm,
}: {
  onConfirm: (deployments: Deployment[]) => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<Deployment>>(
    new Set(DEFAULT_DEPLOYMENTS)
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
      <Box marginBottom={1}>
        <Text dimColor>
          ↑/↓ move  ·  space toggle  ·  a toggle all  ·  enter confirm
        </Text>
      </Box>
      {DEFAULT_DEPLOYMENTS.map((d, idx) => {
        const isSelected = selected.has(d);
        const isCursor = idx === cursor;
        return (
          <Box key={d} gap={1}>
            <Text color={isCursor ? "cyan" : undefined}>
              {isCursor ? "›" : " "}
            </Text>
            <Text color={isSelected ? "green" : "white"}>
              {isSelected ? "☑" : "☐"} {d}
            </Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>
          {selected.size} / {DEFAULT_DEPLOYMENTS.length} selected
        </Text>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ReleaseCommand
// ---------------------------------------------------------------------------

export function ReleaseCommand({ onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<ReleasePhase>("selectEnv");
  const [env, setEnv] = useState<"prod" | "dev">("prod");
  const [deployments, setDeployments] = useState<Deployment[]>([
    ...DEFAULT_DEPLOYMENTS,
  ]);
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: ReleasePhase) => {
    setPhase(p);
    const mapped =
      p === "running" ? "running" : p === "done" ? "done" : "idle";
    onPhaseChange?.(mapped);
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running") onBack?.();
  });

  // ── Main release sequence ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;

    const namespace = env === "prod" ? "prod" : "liexp-dev";
    const valuesFile =
      env === "prod"
        ? `${REPO_ROOT}/helm/values.prod.yaml`
        : `${REPO_ROOT}/helm/values.dev.yaml`;
    const helmName = "lies-exposed";
    const kubeconfig = `${process.env.HOME ?? "~"}/.kube/${KUBECONFIG}`;

    const run = async () => {
      callbacks.setStatus("running");

      // ── Step 1: copy prod env files into helm/config/env/ ─────────────────
      const envFiles: Array<[string, string]> = [
        [`${REPO_ROOT}/services/api/.env.prod`,          `${REPO_ROOT}/helm/config/env/api.env`],
        [`${REPO_ROOT}/services/web/.env.prod`,          `${REPO_ROOT}/helm/config/env/web.env`],
        [`${REPO_ROOT}/services/admin/.env.prod`,        `${REPO_ROOT}/helm/config/env/admin.env`],
        [`${REPO_ROOT}/services/admin/.env.server.prod`, `${REPO_ROOT}/helm/config/env/admin.server.env`],
        [`${REPO_ROOT}/services/ai-bot/.env.prod`,       `${REPO_ROOT}/helm/config/env/ai-bot.env`],
        [`${REPO_ROOT}/services/agent/.env.prod`,        `${REPO_ROOT}/helm/config/env/agent.env`],
        [`${REPO_ROOT}/services/worker/.env.prod`,       `${REPO_ROOT}/helm/config/env/worker.env`],
      ];

      callbacks.onLine("Copying env files into helm/config/env/…");
      for (const [src, dest] of envFiles) {
        const res = await exec("cp", ["-f", src, dest], {
          onStdout: callbacks.onLine,
          onStderr: callbacks.onLine,
        });
        if (res.exitCode !== 0) {
          callbacks.onLine(`  ✘ failed: cp ${src} → ${dest}`);
          callbacks.setStatus("error");
          updatePhase("done");
          return;
        }
        callbacks.onLine(`  ✔ ${dest}`);
      }

      // ── Step 2: helm upgrade ──────────────────────────────────────────────
      callbacks.onLine(`\nRunning helm upgrade (${env})…`);
      const helmArgs = [
        "upgrade",
        helmName,
        `${REPO_ROOT}/helm`,
        "--take-ownership",
        "--namespace",
        namespace,
        "-f",
        valuesFile,
        "--kubeconfig",
        kubeconfig,
      ];
      callbacks.onLine(`$ helm ${helmArgs.join(" ")}`);
      const helmResult = await exec("helm", helmArgs, {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });
      if (helmResult.exitCode !== 0) {
        callbacks.setStatus("error");
        updatePhase("done");
        return;
      }

      // ── Step 3: kubectl rollout restart ───────────────────────────────────
      if (deployments.length === 0) {
        callbacks.onLine("\nNo deployments selected — skipping rollout restart.");
        callbacks.setStatus("success");
        updatePhase("done");
        return;
      }

      callbacks.onLine(`\nRestarting deployments: ${deployments.join(", ")}…`);
      const kubectlArgs = [
        "--kubeconfig",
        kubeconfig,
        "rollout",
        "restart",
        "deployments",
        ...deployments,
        "--namespace",
        namespace,
      ];
      callbacks.onLine(`$ kubectl ${kubectlArgs.join(" ")}`);
      const kubectlResult = await exec("kubectl", kubectlArgs, {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      callbacks.setStatus(kubectlResult.exitCode === 0 ? "success" : "error");
      updatePhase("done");
    };

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === "selectEnv") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Release — Kubernetes upgrade</Text>
        <Text dimColor>Select target environment:</Text>
        <SelectInput
          items={ENV_ITEMS}
          onSelect={(item) => {
            setEnv(item.value as "prod" | "dev");
            updatePhase("selectDeployments");
          }}
        />
      </Box>
    );
  }

  if (phase === "selectDeployments") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Release — {env} — select deployments to restart</Text>
        <DeploymentSelector
          onConfirm={(deps) => {
            setDeployments(deps);
            updatePhase("running");
          }}
        />
      </Box>
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
        <Box flexDirection="column" gap={1} marginTop={1}>
          {output.status === "success" && (
            <Text color="green">
              Release complete. Helm upgraded and deployments restarted.
            </Text>
          )}
          {output.status === "error" && (
            <Text color="red">Release failed. See output above.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
