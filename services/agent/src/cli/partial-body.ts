/**
 * CLI commands send partial patches, but the HTTP endpoints declare their Body
 * as the full resource type (e.g. `Setting`, `EditSocialPost`). Bridging that
 * gap needs one unsafe assertion — centralised here so no command file needs
 * its own `any` cast and the unsafety lives in a single documented boundary.
 */
export const partialBody = <T>(body: Record<string, unknown>): T =>
  body as unknown as T;
