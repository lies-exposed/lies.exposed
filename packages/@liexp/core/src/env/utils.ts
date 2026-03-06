import * as path from "path";
import D from "debug";
import * as dotenv from "dotenv";
import { type Either } from "fp-ts/lib/Either.js";

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

  dotenv.config({
    path: envPath,
    override: override ?? false,
  });
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
