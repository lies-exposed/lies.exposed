const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

module.exports = {
  apps: [
    {
      name      : 'yarn',
      script    : 'yarn',
      interpreter: '/bin/bash',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: "api",
      cwd: path.resolve(__dirname, "./services/api"),
      script: "./build/run.js",
      wait_ready: true,
      listen_timeout: 10000,
      env: dotenv.parse(
        fs.readFileSync(path.resolve(__dirname, ".env"), "utf-8")
      ),
    },
  ],
};
