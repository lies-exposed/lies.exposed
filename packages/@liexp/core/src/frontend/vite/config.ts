import * as path from "path";
import image from "@rollup/plugin-image";
import react from "@vitejs/plugin-react";
import * as dotenv from "dotenv";
import { failure } from "io-ts/lib/PathReporter.js";
import { type ConfigEnv, type UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
// import { createHtmlPlugin } from "vite-plugin-html";
import htmlPurge from "vite-plugin-html-purgecss";
import optimizer from "vite-plugin-optimizer";
import tsConfigPaths from "vite-tsconfig-paths";
import { importDefault } from "../../esm/import-default.js";
import { fp, pipe } from "../../fp/index.js";
// import * as reactVirtualized from "./plugins/react-virtualized.plugin.cjs";
import { type GetViteConfigParams } from "./type.js";

// console.log(reactVirtualized);

// https://vitejs.dev/config/
export const defineViteConfig = <A extends Record<string, any>>(
  config: GetViteConfigParams<A>,
): ((env: ConfigEnv) => UserConfig) => {
  return ({ mode }) => {
    // const url = fileURLToPath(new URL("../../", import.meta.url));

    dotenv.config({ path: path.resolve(config.envFileDir, ".env") });

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

    return {
      mode,
      appType: "custom",
      define: pipe(
        env,
        fp.R.reduceWithIndex(fp.S.Ord)({}, (key, env, v) => ({
          ...env,
          [`process.env.${key}`]: JSON.stringify(v),
        })),
      ),
      // envDir: config.envFileDir,
      root: config.cwd,
      build: {
        outDir: config.output,
        assetsDir: config.assetDir,
        commonjsOptions: {
          include: [/node_modules/],
          exclude: [/@liexp\/core/, /@liexp\/shared/, /@liexp\/ui/],
          transformMixedEsModules: true,
        },
      },
      css: {
        devSourcemap: true,
      },
      optimizeDeps: {
        entries: [path.join(config.cwd, "../../packages/@liexp/ui/lib/**")],
        // extensions: [".js", ".jsx", ".tsx"],
        // include: ["react-slick"],
        // exclude: ["@emotion/react/**", "hoist-non-react-statics/**"],
        // disabled: 'dev'
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

      server: {
        port: 4020,
        host: "localhost",
        hmr: true,
      },
      ssr: {
        external: [
          // "react",
          // "react-dom",
          // "react-dom/server",
          // "react/jsx-runtime",
        ],
      },
      plugins: [
        image(),
        cssInjectedByJsPlugin(),
        optimizer({
          // d3: () => require('d3'),
        }),
        tsConfigPaths({
          root: config.cwd,
        }),
        react({
          jsxRuntime: mode === "production" ? "automatic" : "classic",
        }),
        // (reactVirtualized as any)(),
        // createHtmlPlugin({
        //   entry: config.entry ?? path.resolve(config.cwd, "src/index.tsx"),
        //   template: path.resolve(config.cwd, "index.html"),
        //   inject: {
        //     data: {
        //       PUBLIC_URL: env.PUBLIC_URL,
        //     },
        //   },
        //   verbose: true,
        // }),
        importDefault(htmlPurge).default(),
      ],
      esbuild: {
        jsx: "automatic",
      },
    };
  };
};
