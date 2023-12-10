import * as path from "path";
import * as dotenv from "dotenv";

export const loadENV = (
  root?: string,
  p?: string,
  override?: boolean,
): void => {
  root = root ?? process.cwd();
  p = p ?? process.env.DOTENV_CONFIG_PATH ?? ".env";

  const envPath = path.resolve(root, p);
  dotenv.config({
    path: envPath,
    override: override ?? false,
  });
};
