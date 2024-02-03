import path from "path";
import { defineEnv, getConfig } from "@liexp/core/lib/webpack/config";
import { webOptimization } from "@liexp/core/lib/webpack/web.config";

const SrvEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PORT: t.string,
}));

const srvConfig = getConfig({
  cwd: __dirname,
  env: SrvEnv,
  envFileDir: __dirname,
  hot: false,
  output: { path: path.resolve(__dirname, "build/server") },
  entry: {
    ssr: path.resolve(__dirname, "src/server/ssr.tsx"),
  },
  target: "node",
  tsConfigFile:
    process.env.NODE_ENV === "production"
      ? "tsconfig.build.json"
      : "tsconfig.json",
});

srvConfig.resolve = {
  ...srvConfig.resolve,
  alias: {
    "react/jsx-runtime.js": "react/jsx-runtime",
    "react/jsx-dev-runtime.js": "react/jsx-dev-runtime",
  },
};

srvConfig.optimization = srvConfig.mode === "production" ? webOptimization : {};
srvConfig.devtool = "source-map";

export default srvConfig;
