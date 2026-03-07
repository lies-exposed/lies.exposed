/**
 * Parses a --key=value argument from the args array.
 * Supports values containing "=" (e.g. URLs).
 */
export const getArg = (args: string[], key: string): string | undefined =>
  args
    .find((a) => a.startsWith(`--${key}=`))
    ?.split("=")
    .slice(1)
    .join("=");

/**
 * Splits a comma-separated string of UUIDs into an array.
 * Returns [] if the value is undefined or empty.
 */
export const splitUUIDs = (value: string | undefined): string[] =>
  value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
