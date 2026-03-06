import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { execShell } from "../lib/exec.js";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";

type Props = {
  /** If provided, skips the username prompt and runs immediately. */
  username?: string;
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "prompt" | "running" | "done";

export function LoginCommand({ username: initialUsername, onBack, onPhaseChange }: Props) {
  const [phase, setPhase] = useState<Phase>(
    initialUsername ? "running" : "prompt"
  );
  const [username, setUsername] = useState(initialUsername ?? "");
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "prompt" ? "idle" : p === "running" ? "running" : "done");
  };

  useEffect(() => {
    if (phase !== "running") return;
    callbacks.setStatus("running");

    const run = async () => {
      const result = await execShell(
        `cat ./deploy/gh-token.txt | docker login ghcr.io -u '${username}' --password-stdin`,
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
      <Text bold>Login to GHCR</Text>

      {phase === "prompt" && (
        <Box gap={1}>
          <Text>GitHub username:</Text>
          <TextInput
            value={username}
            onChange={setUsername}
            onSubmit={(val) => {
              if (val.trim()) {
                setUsername(val.trim());
                updatePhase("running");
              }
            }}
          />
        </Box>
      )}

      {(phase === "running" || phase === "done") && (
        <ProcessOutput
          title={`docker login ghcr.io -u ${username}`}
          status={output.status}
          completedLines={output.completedLines}
          liveLine={output.liveLine}
        />
      )}

      {phase === "done" && (
        <Box marginTop={1} gap={2}>
          {output.status === "success" && (
            <Text color="green">Login successful.</Text>
          )}
          {output.status === "error" && (
            <Text color="red">Login failed. Check deploy/gh-token.txt and your username.</Text>
          )}
        </Box>
      )}
    </Box>
  );
}
