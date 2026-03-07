import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { promises as fs } from "node:fs";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec, execShell } from "../lib/exec.js";
import { REPO_ROOT } from "../lib/paths.js";

type Props = {
  autoRun?: boolean;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "confirm" | "running" | "done";

const SERVICES = ["api", "web", "ai-bot", "be-worker", "admin"] as const;

/**
 * Copies a service .env file to deploy/ and patches NODE_ENV/VITE_NODE_ENV
 * to "production". Mirrors test-deploy.sh's approach.
 */
async function copyAndPatchEnv(
  src: string,
  dest: string,
  replacements: Array<[RegExp, string]>
): Promise<void> {
  let content = await fs.readFile(src, "utf8");
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  await fs.writeFile(dest, content);
}

export function TestDeployCommand({ autoRun = false, onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<Phase>(autoRun ? "running" : "confirm");
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "confirm" ? "idle" : p === "running" ? "running" : "done");
  };

  useInput((input, key) => {
    if (phase === "confirm") {
      if (key.return || input === "y") updatePhase("running");
      if (input === "n" || input === "q" || key.escape) onBack?.();
    }
    if (phase === "done" && key.escape && onBack) {
      onBack();
    }
  });

  useEffect(() => {
    if (phase !== "running") return;

    const run = async () => {
      callbacks.setStatus("running");
      const DIR = REPO_ROOT;

      // ── Step 1: Copy and patch env files ──────────────────────────────────
      callbacks.onLine("Copying env files to deploy/...");
      try {
        await copyAndPatchEnv(
          `${DIR}/services/web/.env`,
          `${DIR}/deploy/.env.web`,
          [[/VITE_NODE_ENV=.*/g, "VITE_NODE_ENV=production"]]
        );
        callbacks.onLine("  ✔ deploy/.env.web");

        await copyAndPatchEnv(
          `${DIR}/services/api/.env`,
          `${DIR}/deploy/.env.api`,
          [[/NODE_ENV=.*/g, "NODE_ENV=production"]]
        );
        callbacks.onLine("  ✔ deploy/.env.api");

        await fs.copyFile(
          `${DIR}/services/worker/.env`,
          `${DIR}/deploy/.env.be-worker`
        );
        callbacks.onLine("  ✔ deploy/.env.be-worker");

        // Bug fix: test-deploy.sh never copied .env.ai-bot
        await fs.copyFile(
          `${DIR}/services/ai-bot/.env`,
          `${DIR}/deploy/.env.ai-bot`
        );
        callbacks.onLine("  ✔ deploy/.env.ai-bot");
      } catch (err) {
        callbacks.onLine(`  ✘ Failed to copy env files: ${String(err)}`);
        callbacks.setStatus("error");
        updatePhase("done");
        return;
      }

      // ── Step 2: Tear down existing stack ──────────────────────────────────
      callbacks.onLine("\nTearing down existing stack...");
      await exec("docker", ["compose", "down"], {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      // ── Step 3: Start nginx ────────────────────────────────────────────────
      callbacks.onLine("\nStarting nginx reverse proxy...");
      await execShell(`${DIR}/scripts/nginx.up.sh`, {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      // ── Step 4: Start DB only first ────────────────────────────────────────
      callbacks.onLine("\nStarting db...");
      await exec(
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
          "db.liexp.dev",
        ],
        { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
      );

      // ── Step 5: Copy TLS certs ─────────────────────────────────────────────
      callbacks.onLine("\nCopying TLS certs...");
      try {
        const certsDir = `${DIR}/services/api/certs`;
        const deployDir = `${DIR}/deploy/certs`;
        const certs = await fs.readdir(certsDir);
        for (const cert of certs.filter((f) => f.endsWith(".crt"))) {
          await fs.copyFile(`${certsDir}/${cert}`, `${deployDir}/${cert}`);
          callbacks.onLine(`  ✔ certs/${cert}`);
        }
      } catch (err) {
        callbacks.onLine(`  ⚠ Could not copy certs (non-fatal): ${String(err)}`);
      }

      // ── Step 6: Start deploy services ─────────────────────────────────────
      callbacks.onLine("\nStarting deploy services...");
      const deployEnvMap: Record<string, string> = {
        api:       `${DIR}/deploy/.env.api`,
        web:       `${DIR}/deploy/.env.web`,
        "ai-bot":  `${DIR}/deploy/.env.ai-bot`,
        "be-worker": `${DIR}/deploy/.env.be-worker`,
        admin:     "",
      };

      let anyFailed = false;
      for (const svc of SERVICES) {
        callbacks.onLine(`\n  Starting ${svc}...`);
        const envArgs = deployEnvMap[svc]
          ? ["--env-file", deployEnvMap[svc]!]
          : [];
        const result = await exec(
          "docker",
          [
            "compose",
            ...envArgs,
            "up",
            "--force-recreate",
            "-d",
            "--no-deps",
            ...(svc === "be-worker" ? ["--build"] : []),
            svc,
          ],
          {
            cwd: `${DIR}/deploy`,
            onStdout: callbacks.onLine,
            onStderr: callbacks.onLine,
          }
        );
        if (result.exitCode !== 0) {
          callbacks.onLine(`  ✘ Failed to start ${svc}`);
          anyFailed = true;
        } else {
          callbacks.onLine(`  ✔ ${svc} started`);
        }
      }

      // ── Step 7: Follow logs briefly ────────────────────────────────────────
      callbacks.onLine("\nWaiting 5s then tailing logs...");
      await new Promise((r) => setTimeout(r, 5_000));
      // Non-blocking tail (just a snapshot, not a live follow in TUI)
      await exec(
        "docker",
        ["compose", "logs", "--tail=30"],
        {
          cwd: `${DIR}/deploy`,
          onStdout: callbacks.onLine,
          onStderr: callbacks.onLine,
        }
      );

      callbacks.setStatus(anyFailed ? "error" : "success");
      updatePhase("done");
    };

    void run();
  }, [phase]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Test Production Deploy (local)</Text>

      {phase === "confirm" && (
        <Box flexDirection="column" gap={1}>
          <Text>
            This will copy env files, tear down the dev stack, start nginx,
            then bring up all production services from{" "}
            <Text color="cyan">deploy/compose.yml</Text>.
          </Text>
          <Text color="yellow">Warning: destructive — runs docker compose down first.</Text>
          <Text dimColor>Press Enter / y to run, n to cancel.</Text>
        </Box>
      )}

      {(phase === "running" || phase === "done") && (
        <>
          <ProcessOutput
            title="Production deploy test"
            status={output.status}
            completedLines={output.completedLines}
            liveLine={output.liveLine}
          />

          {phase === "done" && (
            <Box marginTop={1} flexDirection="column" gap={1}>
              {output.status === "success" ? (
                <Text color="green">Deploy test complete.</Text>
              ) : (
                <Text color="red">Deploy test completed with errors.</Text>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
