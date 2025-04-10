import { type Schema } from "effect";
import { type AppType } from "vite";

export interface GetViteConfigParams<A extends Schema.Struct.Fields> {
  cwd: string;
  base: string;
  env: Schema.Schema<A>;
  envFileDir: string;
  port: number;
  host: string;
  entry?: string;
  devServer?: boolean;
  target: AppType;
  output?: string;
  assetDir?: string;
  tsConfigFile?: string;
  html?: {
    templatePath: string;
  };
  hot: boolean;
  plugins: any[];
}
