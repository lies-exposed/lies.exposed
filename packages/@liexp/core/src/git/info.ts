import { execSync } from "child_process";
import { pipe } from "fp-ts/lib/function.js";
import * as E from "fp-ts/lib/Either.js";

const runCmd = (cmd: string) =>
  E.tryCatch(
    () => execSync(cmd, { encoding: "utf-8" }).toString().trim(),
    (e) => e as Error,
  );

interface GitInfo {
  version: string;
  commitHash: string;
}
// Get version info from git at build time (fp-style)
export const getGitInfo = (): GitInfo => {
  const commitHash = pipe(
    runCmd("git rev-parse HEAD"),
    E.getOrElse(() => "unknown"),
  );

  const version = pipe(
    runCmd("git describe --tags --abbrev=0"),
    E.map((v) => v.replace(/^lies\.exposed@/, "")),
    E.orElse(() =>
      pipe(
        runCmd("cat package.json"),
        E.chain((raw) =>
          E.tryCatch(
            () => JSON.parse(raw),
            (e) => e as Error,
          ),
        ),
        E.map((pkg: any) => pkg?.version ?? "0.0.0"),
      ),
    ),
    E.getOrElse(() => "0.0.0"),
  );

  return { version, commitHash };
};
