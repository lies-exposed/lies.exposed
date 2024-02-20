import type * as t from "io-ts";
import { type AppType } from "vite";

export interface GetViteConfigParams<A extends Record<string, t.Mixed>> {
  cwd: string;
  base: string;
  env: t.ExactC<t.TypeC<A>>;
  envFileDir: string;
  port: number;
  entry?: string;
  devServer?: boolean;
  target: AppType;
  output?: string;
  assetDir?: string;
  tsConfigFile?: string;
  html?: {
    templatePath: string
  };
  hot: boolean;
}
