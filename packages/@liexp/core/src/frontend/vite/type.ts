import type * as t from "io-ts";

export interface GetViteConfigParams<A extends Record<string, t.Mixed>> {
  cwd: string;
  env: t.ExactC<t.TypeC<A>>;
  envFileDir: string;
  port?: number;
  entry?: string;
  devServer?: boolean;
  target: string;
  output?: string;
  assetDir?: string;
  tsConfigFile?: string;
  hot: boolean;
}
