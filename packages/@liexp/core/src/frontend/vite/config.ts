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
import { reactVirtualized } from "./plugins/react-virtualized.js";
import { type GetViteConfigParams } from "./type.js";

// https://vitejs.dev/config/
export const defineViteConfig = <A extends Record<string, any>>(
  config: GetViteConfigParams<A>,
): ((env: ConfigEnv) => UserConfig) => {
  return ({ mode }) => {
    // const url = fileURLToPath(new URL("../../", import.meta.url));

    loadENV(
      path.resolve(
        config.cwd,
        config.envFileDir,
        process.env.DOTENV_CONFIG_PATH ?? ".env",
      ),
    );
    // dotenv.config({ path: path.resolve(config.envFileDir, ".env") });

    const env = pipe(
      // loadEnv(mode, config.envFileDir, ""),
      process.env,
      fp.R.reduceWithIndex(fp.S.Ord)({}, (key, env, v) => {
        return {
          ...env,
          [key]: v,
        };
      }),
      config.env.decode,
      (env) => {
        if (env._tag === "Left") {
          // eslint-disable-next-line
          console.error(failure(env.left));
          throw new Error("Wrong env");
        }
        return env.right;
      },
    );

    // eslint-disable-next-line
    console.log(mode, env);

    const viteConfig: UserConfig = {
      mode,
      appType: config.target,
      root: config.cwd,
      envDir: config.envFileDir,
      base: config.base,
      define: pipe(
        env,
        fp.R.reduceWithIndex(fp.S.Ord)({}, (key, env, v) => ({
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
          exclude: [/@liexp\/core/, /@liexp\/shared/, /@liexp\/ui/],
          transformMixedEsModules: true,
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "redux",
            "react-redux",
            "@react-page/editor",
            "@react-page/plugins-slate",
            "@react-page/plugins-background",
            "@react-page/plugins-divider",
            "@react-page/plugins-html5-video",
            "@react-page/plugins-image",
            "@react-page/plugins-spacer",
            "@react-page/plugins-video",
          ],
        },
      },
      css: {
        devSourcemap: true,
      },
      optimizeDeps: {
        entries: [
          // path.join(config.cwd, "../../packages/@liexp/ui/core/**"),
          // path.join(config.cwd, "../../packages/@liexp/ui/shared/**"),
          // path.join(config.cwd, "../../packages/@liexp/ui/lib/**"),
        ],
        include: [
          "@liexp/core",
          "@liexp/shared",
          "@liexp/ui",
          "@mui/icons-material",
          "@mui/material",
          "@react-page/plugins-slate",
          "@react-page/plugins-background",
          "@react-page/plugins-divider",
          "@react-page/plugins-html5-video",
          "@react-page/plugins-image",
          "@react-page/plugins-spacer",
          "@react-page/plugins-video",
        ],
      },

      resolve: {
        // preserveSymlinks: true,
        // dedupe: ["react", "react-dom"],
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
        ],
      },
      server: config.devServer
        ? {
            port: config.port,
            host: config.host,
            hmr: config.hot,
          }
        : undefined,
      ssr: {
        external: [
          "react",
          "react-dom",
          // "react-dom/server",
          // "react/jsx-runtime",
        ],
      },
      plugins: [
        image() as any,
        cssInjectedByJsPlugin(),
        optimizer({
          // d3: () => require('d3'),
        }),
        tsConfigPaths({
          root: config.cwd,
          projects: config.tsConfigFile ? [config.tsConfigFile] : undefined,
        }),
        react({
          jsxRuntime: "classic",
        }),
        reactVirtualized(),
      ],
      esbuild: {
        jsx: "automatic",
      },
    };

    return viteConfig;
  };
};
