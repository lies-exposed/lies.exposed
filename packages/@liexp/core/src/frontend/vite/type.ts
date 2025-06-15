import { type Schema } from "effect";
import { type AppType, type ServerOptions } from "vite";

export interface GetViteConfigParams<A extends Schema.Struct.Fields> {
  cwd: string;
  base: string;
  env: Schema.Schema<A>;
  envFileDir: string;
  entry?: string;
  server?: Pick<ServerOptions, "port" | "host" | "hmr" | "allowedHosts">;
  target: AppType;
  output?: string;
  assetDir?: string;
  tsConfigFile?: string;
  html?: {
    templatePath: string;
  };
  plugins: any[];
}
