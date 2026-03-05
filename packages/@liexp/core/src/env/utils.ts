import * as fs from "fs";
import * as path from "path";
import D from "debug";
import { type Either } from "fp-ts/lib/Either.js";

const parseDotenv = (src: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const line of src.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
};

export const loadENV = (
  root?: string,
  envFile?: string,
  override?: boolean,
): void => {
  root = root ?? process.cwd();

  if (envFile === undefined) {
    return;
  }
  const envPath = path.resolve(root, envFile);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const parsed = parseDotenv(fs.readFileSync(envPath, "utf8"));
  for (const [key, val] of Object.entries(parsed)) {
    if (override === true || process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
};

export const loadAndParseENV =
  <E, A>(parseENV: (i: unknown) => Either<E, A>) =>
  (root: string): Either<E, A> => {
    process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

    if (process.env.NODE_ENV === "development") {
      loadENV(root, ".env.local");
      loadENV(root, ".env");
    }

    D.enable(process.env.DEBUG ?? "*");

    return parseENV(process.env);
  };
