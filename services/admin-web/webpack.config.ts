import {
  getConfig,
  defineEnv,
} from "../../packages/@econnessione/core/src/webpack/config";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
const config = getConfig({
  cwd: __dirname,
  env: defineEnv((t) => ({
    NODE_ENV: t.string,
    PUBLIC_URL: t.string,
    API_URL: t.string,
    DEBUG: t.string,
  })),
  envFileDir: __dirname,
  port,
});

module.exports = {
  ...config,
  resolve: {
    ...config.resolve,
    mainFields: ["main", "browser", "module"],
    fallback: {
      // domain: require.resolve('domain-browser'),
      // tty: require.resolve('tty-browserify')
    }
  },
};
