import { exec } from "./exec.js";

const NETWORK_NAME = "reverseproxy";

/**
 * Ensures the `reverseproxy` Docker network exists.
 * Creates it if it doesn't. Safe to call multiple times.
 */
export async function ensureNetwork(
  onLine?: (line: string) => void
): Promise<void> {
  const inspect = await exec(
    "docker",
    ["network", "inspect", NETWORK_NAME],
    { onStdout: () => {}, onStderr: () => {} }
  );

  if (inspect.exitCode !== 0) {
    onLine?.(`Creating Docker network '${NETWORK_NAME}'...`);
    await exec("docker", ["network", "create", NETWORK_NAME], {
      onStdout: onLine,
      onStderr: onLine,
    });
  }
}
