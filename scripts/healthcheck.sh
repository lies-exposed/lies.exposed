#!/usr/bin/env bash

set -ex

# start api with docker
docker compose up -d --wait liexp.dev api.liexp.dev

curl -f https://api.liexp.dev/v1/healthcheck
curl -f https://liexp.dev/healthcheck
