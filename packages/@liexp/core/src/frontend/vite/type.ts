import { type Schema } from "effect";
import { type AppType, type ServerOptions, type WatchOptions } from "vite";

/**
 * Configuration for monorepo package HMR support
 *
 * When enabled, Vite will watch source files in monorepo packages
 * and trigger HMR when they change, without requiring a package rebuild.
 */
export interface MonorepoHmrConfig {
  /**
   * Package prefixes to watch (e.g., ["@liexp/"])
   * These packages will have their lib/ imports aliased to src/
   * @default ["@liexp/"]
   */
  packagePrefixes?: string[];
  /**
   * Packages directory relative to monorepo root
   * @default "packages"
   */
  packagesDir?: string;
}

export interface GetViteConfigParams<A extends Schema.Struct.Fields> {
  cwd: string;
  base: string;
  env: Schema.Schema<A>;
  envFileDir: string;
  entry?: string;
  server?: Pick<ServerOptions, "port" | "host" | "hmr" | "allowedHosts"> & {
    /** File watcher options for development server */
    watch?: WatchOptions;
  };
  target: AppType;
  output?: string;
  assetDir?: string;
  tsConfigFile?: string;
  html?: {
    templatePath: string;
  };
  plugins: any[];
  /**
   * Monorepo HMR support for @liexp/* packages
   *
   * - `true` or `undefined`: Auto-detect monorepo root and enable in development
   * - `false`: Disable monorepo HMR
   * - `MonorepoHmrConfig`: Custom configuration
   *
   * @default true (auto-detect in development)
   */
  monorepoHmr?: boolean | MonorepoHmrConfig;
  /**
   * Rollup options for bundle optimization
   * Allows custom chunk splitting, output formatting, and more
   * @see https://vitejs.dev/config/#build-rollupoptions
   */
  rollupOptions?: Record<string, unknown>;
}
