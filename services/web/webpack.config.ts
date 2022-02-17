import { getWebConfig } from "../../packages/@econnessione/core/src/webpack/web.config";
import path from "path";
import nodeExternals from "webpack-node-externals";
import {
  defineEnv,
  getConfig,
} from "../../packages/@econnessione/core/src/webpack/config";

const AppEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PUBLIC_URL: t.string,
  API_URL: t.string,
  ADMIN_URL: t.string,
  DEBUG: t.string,
}));

const SrvEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PORT: t.string,
}));

const port =
  process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 4000;

const webConfig = getWebConfig({
  cwd: __dirname,
  env: AppEnv,
  envFileDir: __dirname,
  port,
  devServer: false,
  hot: false,
  target: "web",
  entry: {
    app: path.resolve(__dirname, "src/client/index.tsx"),
  },
});

const srvConfig = getConfig({
  cwd: __dirname,
  env: SrvEnv,
  envFileDir: __dirname,
  hot: false,
  outputDir: path.resolve(__dirname, "build/server"),
  entry: {
    ssr: path.resolve(__dirname, "src/server/ssr.tsx"),
  },
  target: "node",
});

export default [
  webConfig,
  {
    ...srvConfig,
    // externals: [
      // nodeExternals(),
      // /@material-ui\/.*/
    // ],
  },
];
