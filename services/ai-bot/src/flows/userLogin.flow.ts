import { readFileSync } from "fs";
import * as path from "path";

const tokenFilePath = path.resolve(process.cwd(), "temp/.token");

export const currentToken = (): string => {
  return readFileSync(tokenFilePath, "utf-8");
};
