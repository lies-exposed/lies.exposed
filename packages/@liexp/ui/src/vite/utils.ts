import path from "path";
import { fileURLToPath } from "url";

export const commonJSRequire = (id: string): string => {
  return path.dirname(fileURLToPath(import.meta.resolve(id)));
};
