import { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput } from "ink";
import { promises as fs } from "node:fs";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";
import { REPO_ROOT } from "../lib/paths.js";

/**
 * Files that must exist before `up` can succeed.
 * Checked upfront so the user gets a clear actionable error instead of
 * a cryptic docker compose failure mid-run.
 */
const REQUIRED_ENV_FILES = [
  "services/worker/.env.local",
  "services/api/.env.local",
  "services/ai-bot/.env.local",
  "services/admin/.env.server",
  "services/agent/.env.local",
] as const;

// Compose service names passed to docker compose up
const UP_SERVICES = [
  "db.liexp.dev",
  "redis.liexp.dev",
  "api.liexp.dev",
  "admin.liexp.dev",
  "liexp.dev",
  "ai-bot.liexp.dev",
  "worker.liexp.dev",
  "agent.liexp.dev",
] as const;

type UpService = (typeof UP_SERVICES)[number];

type Props = {
  /** If provided, runs immediately with these services (skips selector). */
  preServices?: string[];
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "selectServices" | "running" | "done";

// ── Inline multi-select for compose service names ────────────────────────────

function UpServiceSelector({
  onConfirm,
}: {
  onConfirm: (services: UpService[]) => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<UpService>>(new Set());

  const toggle = useCallback((svc: UpService) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(svc)) next.delete(svc);
      else next.add(svc);
      return next;
    });
  }, []);

  useInput((input, key) => {
    if (key.upArrow || input === "k")
      setCursor((c) => Math.max(0, c - 1));
    else if (key.downArrow || input === "j")
      setCursor((c) => Math.min(UP_SERVICES.length - 1, c + 1));
    else if (input === " ") {
      const svc = UP_SERVICES[cursor];
      if (svc) toggle(svc);
    } else if (input === "a") {
      if (selected.size === UP_SERVICES.length) setSelected(new Set());
      else setSelected(new Set(UP_SERVICES));
    } else if (key.return) {
      onConfirm(Array.from(selected));
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          ↑/↓ move  ·  space toggle  ·  a toggle all  ·  enter confirm (empty = all)
        </Text>
      </Box>
      {UP_SERVICES.map((svc, idx) => {
        const isSelected = selected.has(svc);
        const isCursor = idx === cursor;
        return (
          <Box key={svc} gap={1}>
            <Text color={isCursor ? "cyan" : undefined}>
              {isCursor ? "›" : " "}
            </Text>
            <Text color={isSelected ? "green" : "white"}>
              {isSelected ? "☑" : "☐"} {svc}
            </Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text dimColor>
          {selected.size} / {UP_SERVICES.length} selected
        </Text>
      </Box>
    </Box>
  );
}

// ── UpCommand ────────────────────────────────────────────────────────────────

export function UpCommand({ preServices, onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<Phase>(
    preServices ? "running" : "selectServices"
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    preServices ?? []
  );
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "selectServices" ? "idle" : p === "running" ? "running" : "done");
  };

  useInput((_input, key) => {
    if (phase === "done" && key.escape && onBack) {
      onBack();
    }
  });

  useEffect(() => {
    if (phase !== "running") return;

    const run = async () => {
      callbacks.setStatus("running");

      const DIR = REPO_ROOT;

      // Check required env files upfront
      const missing: string[] = [];
      for (const rel of REQUIRED_ENV_FILES) {
        try {
          await fs.access(`${DIR}/${rel}`);
        } catch {
          missing.push(rel);
        }
      }
      if (missing.length > 0) {
        callbacks.onLine("Missing required env files:");
        for (const f of missing) callbacks.onLine(`  ✘ ${f}`);
        callbacks.onLine("\nCreate these files before running `up`.");
        callbacks.setStatus("error");
        updatePhase("done");
        onBack?.();
        return;
      }

      // Step 1: Start the reverse proxy (telegram-bot-api)
      callbacks.onLine("Starting reverse proxy (telegram-bot-api)...");
      await exec(
        "docker",
        [
          "compose",
          "-f",
          `${DIR}/compose.reverse-proxy.yml`,
          "up",
          "--force-recreate",
          "-d",
          "--wait",
          "telegram-bot-api",
        ],
        { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
      );

      // Step 2: Start main services
      callbacks.onLine("\nStarting main services...");
      const serviceArgs = selectedServices.length > 0 ? selectedServices : [];
      const result = await exec(
        "docker",
        [
          "compose",
          "-f",
          `${DIR}/compose.yml`,
          "up",
          "--force-recreate",
          "-d",
          "--wait",
          "-V",
          ...serviceArgs,
        ],
        { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
      );

      callbacks.setStatus(result.exitCode === 0 ? "success" : "error");
      updatePhase("done");
      onBack?.();
    };

    void run();
  }, [phase]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Start Dev Stack</Text>

      {phase === "selectServices" && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>
            Select services to start (leave empty to start all):
          </Text>
          <UpServiceSelector
            onConfirm={(svcs) => {
              setSelectedServices(svcs);
              updatePhase("running");
            }}
          />
        </Box>
      )}

      {(phase === "running" || phase === "done") && (
        <>
          <ProcessOutput
            title={
              phase === "done"
                ? "Stack started"
                : selectedServices.length > 0
                ? `Starting ${selectedServices.join(", ")}...`
                : "Starting all services..."
            }
            status={output.status}
            completedLines={output.completedLines}
            liveLine={output.liveLine}
          />

          {phase === "done" && null}
        </>
      )}
    </Box>
  );
}
