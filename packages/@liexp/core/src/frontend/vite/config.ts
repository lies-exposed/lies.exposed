import * as fs from "fs";
import * as path from "path";
import image from "@rollup/plugin-image";
import viteReact from "@vitejs/plugin-react";
import { Schema } from "effect";
import { type Alias, type ConfigEnv, type UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import optimizer from "vite-plugin-optimizer";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";
import { loadENV } from "../../env/utils.js";
import { fp, pipe } from "../../fp/index.js";
import { type GetViteConfigParams, type MonorepoHmrConfig } from "./type.js";

/**
 * Auto-detect monorepo root by looking for packages/@liexp directory
 * Walks up from cwd until it finds the packages directory or hits filesystem root
 */
const detectMonorepoRoot = (cwd: string): string | null => {
  let current = cwd;
  const root = path.parse(current).root;

  while (current !== root) {
    const packagesPath = path.join(current, "packages", "@liexp");
    if (fs.existsSync(packagesPath)) {
      return current;
    }
    current = path.dirname(current);
  }

  return null;
};

/**
 * Builds resolve aliases for monorepo packages to redirect lib/ -> src/
 * This enables HMR for package source changes without rebuilding
 */
const buildMonorepoAliases = (
  monorepoRoot: string,
  config: MonorepoHmrConfig,
): { aliases: Alias[]; watchPaths: string[]; excludePatterns: string[] } => {
  const packagesDir = config.packagesDir ?? "packages";
  const packagePrefixes = config.packagePrefixes ?? ["@liexp/"];
  const packagesPath = path.resolve(monorepoRoot, packagesDir);

  const aliases: Alias[] = [];
  const watchPaths: string[] = [];
  const excludePatterns: string[] = [];

  for (const prefix of packagePrefixes) {
    // Handle scoped packages like @liexp/
    const scopeDir = prefix.startsWith("@")
      ? path.join(packagesPath, prefix.slice(0, -1)) // Remove trailing /
      : packagesPath;

    if (!fs.existsSync(scopeDir)) {
      continue;
    }

    // Add to exclude patterns for optimizeDeps
    const scopeName = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
    excludePatterns.push(scopeName);

    const packages = fs.readdirSync(scopeDir);

    for (const pkg of packages) {
      const pkgSrcPath = path.join(scopeDir, pkg, "src");

      // Only add alias if src directory exists
      if (fs.existsSync(pkgSrcPath)) {
        const pkgName = prefix.startsWith("@")
          ? `${prefix.slice(0, -1)}/${pkg}` // @liexp/core
          : pkg;

        // Alias: @liexp/core/lib/* -> packages/@liexp/core/src/*
        aliases.push({
          find: new RegExp(`^${pkgName.replace("/", "\\/")}/lib/(.*)$`),
          replacement: `${pkgSrcPath}/$1`,
        });

        // Add to watch paths
        watchPaths.push(pkgSrcPath);
      }
    }
  }

  return { aliases, watchPaths, excludePatterns };
};

// https://vitejs.dev/config/
export const defineViteConfig = <A extends Record<string, any>>(
  config: GetViteConfigParams<A>,
): ((env: ConfigEnv) => UserConfig) => {
  return ({ mode: _mode }) => {
    const dotEnvFilePath = path.resolve(
      config.envFileDir,
      process.env.DOTENV_CONFIG_PATH ?? ".env",
    );

    loadENV(config.cwd, dotEnvFilePath, false);

    const mode = process.env.VITE_NODE_ENV ?? _mode;

    const validateEnv =
      process.env.VITE_VALIDATE_ENV === undefined
        ? true
        : process.env.VITE_VALIDATE_ENV === "true";

    // eslint-disable-next-line
    console.log(mode, `Validating env: ${validateEnv}`);

    const env = pipe(
      // loadEnv(mode, config.envFileDir, ""),
      process.env,
      fp.Rec.reduceWithIndex(fp.S.Ord)({}, (key, env, v) => {
        return {
          ...env,
          [key]: v,
        };
      }),
      (env) => {
        if (validateEnv) {
          return pipe(env, Schema.decodeUnknownEither(config.env), (env) => {
            if (env._tag === "Left") {
              // eslint-disable-next-line no-console
              console.error(`process.env decode failed: \n`, env.left);
              throw new Error("process.env decode failed");
            }

            // eslint-disable-next-line
            console.log(mode, env.right);
            return env.right;
          });
        }

        return env as A;
      },
    );

    // Build monorepo HMR configuration (development only, enabled by default)
    const monorepoHmrEnabled = mode === "development";

    const monorepoHmrResult = (() => {
      if (!monorepoHmrEnabled) {
        return { aliases: [], watchPaths: [], excludePatterns: [] };
      }

      const monorepoRoot = detectMonorepoRoot(config.cwd);
      if (!monorepoRoot) {
        // eslint-disable-next-line no-console
        console.warn(
          "[vite-config] Monorepo root not found, disabling monorepo HMR",
        );
        return { aliases: [], watchPaths: [], excludePatterns: [] };
      }

      const hmrConfig: MonorepoHmrConfig =
        typeof config.monorepoHmr === "object" ? config.monorepoHmr : {};

      // eslint-disable-next-line no-console
      console.log("[vite-config] Monorepo HMR enabled, root:", monorepoRoot);

      return buildMonorepoAliases(monorepoRoot, hmrConfig);
    })();

    const viteConfig: UserConfig = {
      mode,
      appType: config.target,
      root: config.cwd,
      envDir: config.envFileDir,
      base: config.base,
      define: pipe(
        env,
        fp.Rec.reduceWithIndex(fp.S.Ord)({}, (key, env, v) => ({
          ...env,
          [key]: JSON.stringify(v),
        })),
      ),
      build: {
        outDir: config.output ?? "build",
        assetsDir: config.assetDir,
        minify: mode === "production",
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true,
        },
        sourcemap: mode === "development",
      },
      assetsInclude: [
        // "**/@liexp/ui/assets/**"
      ],
      css: {
        devSourcemap: true,
      },
      optimizeDeps: {
        entries: [path.join(config.cwd, "src/**")],
        // https://github.com/staylor/react-helmet-async/issues/208#issuecomment-2948288817
        include: ["react-helmet-async"],
        // Exclude monorepo packages from pre-bundling to enable HMR
        exclude: monorepoHmrResult.excludePatterns,
      },

      resolve: {
        // preserveSymlinks: true,
        dedupe: [
          "react",
          "react-dom",
          "react-router",
          "react-hook-form",
          "@mui/material",
          "@mui/icons-material",
          "@mui/system",
        ],
        extensions: [
          ".ts",
          ".cts",
          ".mts",
          ".tsx",
          ".mdx",
          ".cjs",
          ".mjs",
          ".js",
          ".jsx",
          ".json",
        ],
        alias: [
          // Monorepo package aliases (lib/ -> src/) for HMR
          ...monorepoHmrResult.aliases,
          {
            find: "react/jsx-runtime.js",
            replacement: "react/jsx-runtime",
          },
          {
            find: "react/jsx-dev-runtime.js",
            replacement: "react/jsx-dev-runtime",
          },
          {
            find: /^fp-ts\/(\w+)$/,
            replacement: "fp-ts/lib/$1.js",
          },
        ],
      },
      server: {
        ...config.server,
        // Add monorepo package paths to file watcher
        watch:
          monorepoHmrResult.watchPaths.length > 0
            ? {
                ...config.server?.watch,
                // Include monorepo package source directories
                ignored: ["!**/packages/@liexp/*/src/**"],
              }
            : config.server?.watch,
      },
      ssr: {
        external: ["react", "react-dom"],
        noExternal: ["react-helmet-async"],
      },
      plugins: [
        image(),
        svgr(),
        cssInjectedByJsPlugin(),
        optimizer({}),
        tsConfigPaths({
          root: config.cwd,
          projects: config.tsConfigFile ? [config.tsConfigFile] : undefined,
        }),
        viteReact(),
        ...(config.plugins ?? []),
      ],
      esbuild: {
        jsx: "automatic",
      },
    };

    return viteConfig;
  };
};
