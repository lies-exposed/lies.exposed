import path from "path";
import {
  defineEnv,
  getConfig
} from "../../packages/@liexp/core/src/webpack/config";

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
});


export default  srvConfig;
