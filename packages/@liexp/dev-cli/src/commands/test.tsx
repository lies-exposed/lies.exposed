import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";

const HEALTHCHECK_URL = "http://localhost:4010/v1/healthcheck";

type Props = {
  /** If true, skips confirmation prompt and runs immediately. */
  autoRun?: boolean;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "confirm" | "running" | "done";

export function TestCommand({ autoRun = false, onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<Phase>(autoRun ? "running" : "confirm");
  const [output, callbacks] = useProcessOutput();
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

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

      // Build API image
      callbacks.onLine("Building api image...");
      const build = await exec("docker", ["compose", "build", "api"], {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });
      if (build.exitCode !== 0) {
        callbacks.setStatus("error");
        updatePhase("done");
        return;
      }

      // Start DB
      callbacks.onLine("\nStarting db...");
      await exec("docker", ["compose", "up", "-d", "db"], {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      // Start API
      callbacks.onLine("\nStarting api...");
      await exec(
        "docker",
        ["compose", "up", "--force-recreate", "-d", "api"],
        { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
      );

      // Wait 20 seconds (mirrors test.sh)
      callbacks.onLine("\nWaiting 20s for api to be ready...");
      await new Promise((r) => setTimeout(r, 20_000));

      // Healthcheck
      callbacks.onLine(`\nHitting ${HEALTHCHECK_URL}...`);
      const hc = await exec("curl", ["-sf", HEALTHCHECK_URL], {
        onStdout: callbacks.onLine,
        onStderr: callbacks.onLine,
      });

      const ok = hc.exitCode === 0;
      setHealthOk(ok);
      callbacks.setStatus(ok ? "success" : "error");
      updatePhase("done");
    };

    void run();
  }, [phase]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Smoke Test (API)</Text>

      {phase === "confirm" && (
        <Box flexDirection="column" gap={1}>
          <Text>
            This will build the api image, start db + api, wait 20s, then hit{" "}
            <Text color="cyan">{HEALTHCHECK_URL}</Text>.
          </Text>
          <Text dimColor>Press Enter / y to run, n to cancel.</Text>
        </Box>
      )}

      {(phase === "running" || phase === "done") && (
        <>
          <ProcessOutput
            title="Smoke test"
            status={output.status}
            completedLines={output.completedLines}
            liveLine={output.liveLine}
          />

          {phase === "done" && healthOk !== null && (
            <Box marginTop={1} flexDirection="column" gap={1}>
              {healthOk ? (
                <Text color="green">Healthcheck passed.</Text>
              ) : (
                <Text color="red">Healthcheck failed.</Text>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
