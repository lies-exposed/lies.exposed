import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import { exec } from "../lib/exec.js";
import { ensureNetwork } from "../lib/network.js";
import { DEFAULT_COMPOSE_ARGS, COMPOSE_ENV_FILE } from "../lib/docker.js";

type Props = {
  /** Pre-supplied args. If provided, runs immediately without prompt. */
  preArgs?: string[];
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "prompt" | "running" | "done";

export function ComposeCommand({ preArgs, onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<Phase>(preArgs ? "running" : "prompt");
  const [argsInput, setArgsInput] = useState(
    preArgs ? preArgs.join(" ") : DEFAULT_COMPOSE_ARGS
  );
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "prompt" ? "idle" : p === "running" ? "running" : "done");
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

      // Ensure the reverseproxy network exists
      await ensureNetwork(callbacks.onLine);

      // Start the reverse proxy container
      callbacks.onLine("Starting reverseproxy container...");
      await exec(
        "docker",
        ["compose", "up", "-d", "--force-recreate", "reverseproxy"],
        { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
      );

      // Run the actual compose command
      const parsedArgs = argsInput.trim().split(/\s+/).filter(Boolean);
      const result = await exec(
        "docker",
        ["compose", "--env-file", COMPOSE_ENV_FILE, ...parsedArgs],
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
      <Text bold>docker compose</Text>

      {phase === "prompt" && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>
            Edit compose args (defaults shown) and press Enter to run:
          </Text>
          <Box gap={1}>
            <Text>docker compose</Text>
            <TextInput
              value={argsInput}
              onChange={setArgsInput}
              onSubmit={() => updatePhase("running")}
            />
          </Box>
          <Text dimColor>
            Env file: {COMPOSE_ENV_FILE}
          </Text>
        </Box>
      )}

      {(phase === "running" || phase === "done") && (
        <>
          <ProcessOutput
            title={`docker compose ${argsInput}`}
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
