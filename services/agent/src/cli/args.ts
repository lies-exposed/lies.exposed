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
