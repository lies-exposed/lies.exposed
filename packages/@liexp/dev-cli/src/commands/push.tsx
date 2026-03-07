import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { ServiceSelector } from "../components/ServiceSelector.js";
import { ProcessOutput, useProcessOutput } from "../components/ProcessOutput.js";
import type { ServiceKey } from "../lib/docker.js";
import { SERVICE_KEYS, pushArgs } from "../lib/docker.js";
import { exec, execShell } from "../lib/exec.js";

type Props = {
  username?: string;
  preSelectedServices?: ServiceKey[];
  onBack?: () => void;
  onPhaseChange?: (phase: "idle" | "running" | "done") => void;
};

type Phase = "selectServices" | "running" | "done";

export function PushCommand({
  username: initialUsername,
  preSelectedServices,
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
        // "pnpm" is pushed as part of "base" (pushArgs("base") returns both tags)
        if (svc === "pnpm") continue;

        setCurrentService(svc);
        const images = pushArgs(svc);
        callbacks.onLine(`\n─── Pushing ${svc} (${images.join(", ")}) ───`);
        callbacks.setStatus("running");

        let failed = false;
        for (const image of images) {
          const result = await exec("docker", ["image", "push", image], {
            onStdout: callbacks.onLine,
            onStderr: callbacks.onLine,
          });
          if (result.exitCode !== 0) {
            failed = true;
            callbacks.onLine(`✘ Push failed for ${image}`);
          }
        }

        if (failed) {
          setFailedServices((prev) => [...prev, svc]);
        } else {
          setDoneServices((prev) => [...prev, svc]);
        }
      }

      setCurrentService(null);
      callbacks.setStatus(failedServices.length > 0 ? "error" : "success");
      updatePhase("done");
    };

    void run();
  }, [phase]);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Push Docker Images to GHCR</Text>

      {phase === "selectServices" && (
        <Box flexDirection="column" gap={1}>
          <Text dimColor>Select images to push:</Text>
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
                ? `Pushing ${currentService}...`
                : phase === "done"
                ? "Push complete"
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
                  Pushed: {doneServices.join(", ")}
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
