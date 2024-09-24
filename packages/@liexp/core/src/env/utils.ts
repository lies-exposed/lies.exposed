import * as path from "path";
import * as dotenv from "dotenv";

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
