#!/usr/bin/env bash

set -ex

# start api with pm2
yarn pm2 start ecosystem.dev.config.js --only api-build-w,api-serve

curl -f http://localhost:4010/v1/healthcheck
