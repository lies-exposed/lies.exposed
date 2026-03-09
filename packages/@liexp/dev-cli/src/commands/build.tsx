import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { ServiceSelector } from "../components/ServiceSelector.js";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import type { ServiceKey } from "../lib/docker.js";
import { SERVICE_KEYS, buildArgs } from "../lib/docker.js";
import { exec, execShell } from "../lib/exec.js";

type Props = {
  /** If provided, skips username prompt and runs immediately. */
  username?: string;
  /** Pre-selected services (non-interactive mode). Defaults to all. */
  preSelectedServices?: ServiceKey[];
  /** Extra args forwarded to docker build. */
  extraArgs?: string[];
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "selectServices" | "running" | "done";

export function BuildCommand({
  username: initialUsername,
  preSelectedServices,
  extraArgs = [],
  onBack,
  onPhaseChange,
}: Props) {
  const [phase, setPhase] = useState<Phase>(
    preSelectedServices ? "running" : "selectServices"
  );
  const [selectedServices, setSelectedServices] = useState<ServiceKey[]>(
    preSelectedServices ?? []
  );
  const [currentService, setCurrentService] = useState<ServiceKey | null>(null);
  const [doneServices, setDoneServices] = useState<ServiceKey[]>([]);
  const [failedServices, setFailedServices] = useState<ServiceKey[]>([]);
  const [output, callbacks] = useProcessOutput();

  const updatePhase = (p: Phase) => {
    setPhase(p);
    onPhaseChange?.(p === "selectServices" ? "idle" : p === "running" ? "running" : "done");
  };

  useInput((_input, key) => {
    if (key.escape && phase !== "running" && onBack) {
      onBack();
    }
  });

  useEffect(() => {
    if (phase !== "running" || selectedServices.length === 0) return;

    const run = async () => {
      // Login first if username provided
      if (initialUsername) {
        callbacks.setStatus("running");
        callbacks.onLine(`Logging in to GHCR as ${initialUsername}...`);
        const loginResult = await execShell(
          `cat ./deploy/gh-token.txt | docker login ghcr.io -u '${initialUsername}' --password-stdin`,
          { onStdout: callbacks.onLine, onStderr: callbacks.onLine }
        );
        if (loginResult.exitCode !== 0) {
          callbacks.setStatus("error");
          updatePhase("done");
          return;
        }
      }

      for (const svc of selectedServices) {
        setCurrentService(svc);
        callbacks.onLine(`\n─── Building ${svc} ───`);
        callbacks.setStatus("running");

        const args = buildArgs(svc, extraArgs);
        const result = await exec("docker", args, {
          onStdout: callbacks.onLine,
          onStderr: callbacks.onLine,
        });

        if (result.exitCode === 0) {
          setDoneServices((prev) => [...prev, svc]);
        } else {
          setFailedServices((prev) => [...prev, svc]);
          callbacks.onLine(`✘ Build failed for ${svc} (exit ${result.exitCode})`);
        }
      }

      setCurrentService(null);
      callbacks.setStatus("success");
      updatePhase("done");
    };

    void run();
  }, [phase]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Build Docker Images</Text>

      {phase === "selectServices" && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>Select images to build:</Text>
          <ServiceSelector
            services={SERVICE_KEYS}
            initialSelected={selectedServices}
            onConfirm={(svcs) => {
              if (svcs.length === 0) {
                onBack?.();
                return;
              }
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
              currentService
                ? `Building ${currentService}...`
                : phase === "done"
                ? "Build complete"
                : "Preparing..."
            }
            status={output.status}
            completedLines={output.completedLines}
            liveLine={output.liveLine}
          />

          {phase === "done" && (
            <Box flexDirection="column" marginTop={1} gap={1}>
              {doneServices.length > 0 && (
                <Text color="green">
                  Built: {doneServices.join(", ")}
                </Text>
              )}
              {failedServices.length > 0 && (
                <Text color="red">
                  Failed: {failedServices.join(", ")}
                </Text>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
