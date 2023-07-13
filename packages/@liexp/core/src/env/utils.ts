import * as path from "path";
import * as dotenv from "dotenv";

export const loadENV = (
  root?: string,
  p?: string,
  override?: boolean,
): void => {
  root = root ?? process.cwd();
  p = p ?? process.env.DOTENV_CONFIG_PATH ?? ".env";
  dotenv.config({
    path: path.resolve(root, p),
    override: override ?? false,
  });
};
