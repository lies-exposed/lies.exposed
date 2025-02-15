import * as path from "path";
import image from "@rollup/plugin-image";
import react from "@vitejs/plugin-react";
import { failure } from "io-ts/lib/PathReporter.js";
import { type ConfigEnv, type UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import optimizer from "vite-plugin-optimizer";
import tsConfigPaths from "vite-tsconfig-paths";
import { loadENV } from "../../env/utils.js";
import { fp, pipe } from "../../fp/index.js";
import { type GetViteConfigParams } from "./type.js";

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
          return pipe(env, config.env.decode, (env) => {
            if (env._tag === "Left") {
              // eslint-disable-next-line no-console
              console.error(`process.env decode failed: \n`, failure(env.left));
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
        include: mode === "production" ? undefined : ["@liexp/**"],
      },

      resolve: {
        // preserveSymlinks: true,
        dedupe: ["react", "react-dom"],
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
          {
            find: /^io-ts\/(\w+)$/,
            replacement: "io-ts/lib/$1.js",
          },
          {
            find: /^io-ts-types\/(\w+)$/,
            replacement: "io-ts-types/lib/$1.js",
          },
        ],
      },
      server: config.devServer
        ? {
            port: config.port,
            host: config.host,
            hmr: config.hot,
            allowedHosts: ["*.liexp.dev", "liexp.dev"],
          }
        : undefined,
      ssr: {
        external: ["react", "react-dom"],
      },
      plugins: [
        image(),
        cssInjectedByJsPlugin(),
        optimizer({}),
        tsConfigPaths({
          root: config.cwd,
          projects: config.tsConfigFile ? [config.tsConfigFile] : undefined,
        }),
        react(),
        ...(config.plugins ?? []),
      ],
      esbuild: {
        jsx: "automatic",
      },
    };

    return viteConfig;
  };
};
