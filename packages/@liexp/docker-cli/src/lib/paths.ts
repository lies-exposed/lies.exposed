import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * Absolute path to the monorepo root.
 * This file lives at packages/@liexp/docker-cli/src/lib/paths.ts,
 * so we go up 5 directories: lib → src → docker-cli → @liexp → packages → root.
 */
export const REPO_ROOT: string = resolve(
  fileURLToPath(import.meta.url),
  "../../../../../.."
);
